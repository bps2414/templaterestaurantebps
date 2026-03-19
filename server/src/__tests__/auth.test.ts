// ============================================
// Auth Route Tests
// Covers: login (validation + service), /me (token verification), change-password
// ============================================

jest.mock('../middlewares/csrf', () => ({
    csrfSetToken: (_req: any, _res: any, next: any) => next(),
    csrfVerifyToken: (_req: any, _res: any, next: any) => next(),
    getCsrfToken: (_req: any, res: any) => res.json({ success: true, token: 'test-token' }),
}));

// Mock rate limiters to prevent 429 in tests (authLimiter: max 10 req/15min)
jest.mock('../middlewares/rateLimit', () => ({
    apiLimiter: (_req: any, _res: any, next: any) => next(),
    authLimiter: (_req: any, _res: any, next: any) => next(),
    uploadLimiter: (_req: any, _res: any, next: any) => next(),
    checkoutLimiter: (_req: any, _res: any, next: any) => next(),
}));

// Mock authService — avoids real bcrypt/JWT/DB in service layer
jest.mock('../services/authService', () => ({
    authService: {
        login: jest.fn(),
        refreshTokens: jest.fn(),
        verifyAccessToken: jest.fn(),
        logout: jest.fn(),
    },
}));

jest.mock('../prisma/client', () => {
    const mock = {
        adminUser: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        $disconnect: jest.fn(),
        $queryRaw: jest.fn().mockResolvedValue([1]),
    };
    return { __esModule: true, default: mock, prisma: mock };
});

import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { authService } from '../services/authService';
import { makeTestToken } from './helpers/testUtils';

const mockLogin = authService.login as jest.Mock;
const mockVerifyToken = authService.verifyAccessToken as jest.Mock;
const mockRefreshTokens = authService.refreshTokens as jest.Mock;
const mockAdminFindUnique = prisma.adminUser.findUnique as jest.Mock;

// ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
    it('returns 200 with tokens on valid credentials', async () => {
        mockLogin.mockResolvedValue({
            accessToken: 'access-token-abc',
            refreshToken: 'refresh-token-abc',
            user: { id: 'user-1', email: 'admin@restaurante.com', role: 'ADMIN' },
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@restaurante.com', password: 'Secret123' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('returns 400 when email is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'not-an-email', password: 'Secret123' });

        expect(res.status).toBe(400);
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('returns 400 when password is too short (< 6 chars)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@restaurante.com', password: '123' });

        expect(res.status).toBe(400);
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('returns 400 when body is empty', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({});

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────────
describe('POST /api/auth/refresh', () => {
    it('returns 400 when refreshToken is missing', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({});

        expect(res.status).toBe(400);
    });

    it('returns tokens when refresh token is valid', async () => {
        mockRefreshTokens.mockResolvedValue({
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
        });

        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: 'valid-refresh-token' });

        expect(res.status).toBe(200);
        expect(res.body.data.accessToken).toBeDefined();
    });
});

// ─────────────────────────────────────────────
describe('GET /api/auth/me', () => {
    it('returns 401 when no Authorization header is provided', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('returns 401 when authorization header is malformed', async () => {
        mockVerifyToken.mockImplementation(() => { throw new Error('Invalid token'); });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer malformed-token');

        expect(res.status).toBe(401);
    });

    it('returns 401 when tokenVersion in DB does not match JWT', async () => {
        // Token has tokenVersion: 0 but DB has tokenVersion: 1 (session invalidated)
        const token = makeTestToken({ tokenVersion: 0 });
        mockVerifyToken.mockReturnValue({ userId: 'test-user-id', role: 'ADMIN', tokenVersion: 0 });
        mockAdminFindUnique.mockResolvedValue({ tokenVersion: 1 }); // mismatch

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/sessão invalidada/i);
    });

    it('returns 200 with user data when token is valid', async () => {
        const token = makeTestToken({ tokenVersion: 0 });
        mockVerifyToken.mockReturnValue({ userId: 'test-user-id', role: 'ADMIN', tokenVersion: 0 });

        // First call: tokenVersion check in requireAuth
        // Second call: user data fetch in route handler
        mockAdminFindUnique
            .mockResolvedValueOnce({ tokenVersion: 0 })
            .mockResolvedValueOnce({
                id: 'test-user-id',
                email: 'test@restaurante.com',
                name: 'Admin Test',
                role: 'ADMIN',
                createdAt: new Date().toISOString(),
            });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe('test@restaurante.com');
    });
});

// ─────────────────────────────────────────────
describe('PUT /api/auth/change-password', () => {
    it('returns 401 when not authenticated', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .send({ currentPassword: 'OldPass123', newPassword: 'NewPass123' });

        expect(res.status).toBe(401);
    });

    it('returns 400 when new password is too weak (no uppercase)', async () => {
        // Even though auth will fail (no token), Zod validation runs first in some routes.
        // This tests the schema validation path through the actual request flow.
        const token = makeTestToken({ tokenVersion: 0 });
        mockVerifyToken.mockReturnValue({ userId: 'test-user-id', role: 'ADMIN', tokenVersion: 0 });
        mockAdminFindUnique.mockResolvedValue({ tokenVersion: 0 });

        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({ currentPassword: 'anypass', newPassword: 'alllowercase1' });

        expect(res.status).toBe(400);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
