// ============================================
// Categories Route Tests
// Covers: plan gating (starter limit), auth protection, CRUD
// ============================================

// Bypass CSRF for test requests
jest.mock('../middlewares/csrf', () => ({
    csrfSetToken: (_req: any, _res: any, next: any) => next(),
    csrfVerifyToken: (_req: any, _res: any, next: any) => next(),
    getCsrfToken: (_req: any, res: any) => res.json({ success: true, token: 'test-token' }),
}));

// Inject a pre-authenticated admin user for protected routes
jest.mock('../middlewares/auth', () => ({
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { userId: 'test-user-id', email: 'test@restaurante.com', role: 'ADMIN', tokenVersion: 0 };
        next();
    },
    requireAdmin: (_req: any, _res: any, next: any) => next(),
    requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock Prisma
jest.mock('../prisma/client', () => {
    const mock = {
        siteConfig: { findUnique: jest.fn() },
        category: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        adminUser: { findUnique: jest.fn() },
        $disconnect: jest.fn(),
        $queryRaw: jest.fn().mockResolvedValue([1]),
    };
    return { __esModule: true, default: mock, prisma: mock };
});

import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';

const mockSiteConfig = prisma.siteConfig.findUnique as jest.Mock;
const mockCount = prisma.category.count as jest.Mock;
const mockFindMany = prisma.category.findMany as jest.Mock;
const mockFindUnique = prisma.category.findUnique as jest.Mock;
const mockCreate = prisma.category.create as jest.Mock;
const mockUpdate = prisma.category.update as jest.Mock;
const mockDelete = prisma.category.delete as jest.Mock;

const CATEGORY_STUB = {
    id: 'cat-id-1',
    name: 'Pratos do Dia',
    slug: 'pratos-do-dia',
    sortOrder: 0,
    active: true,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// ─────────────────────────────────────────────
describe('GET /api/categories (public)', () => {
    it('returns 200 with active categories', async () => {
        mockFindMany.mockResolvedValue([{ ...CATEGORY_STUB, dishes: [] }]);

        const res = await request(app).get('/api/categories');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 200 with empty array when no categories exist', async () => {
        mockFindMany.mockResolvedValue([]);

        const res = await request(app).get('/api/categories');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────
describe('GET /api/categories/all (admin)', () => {
    it('returns 200 with all categories when authenticated', async () => {
        mockFindMany.mockResolvedValue([CATEGORY_STUB]);

        const res = await request(app).get('/api/categories/all');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ─────────────────────────────────────────────
describe('POST /api/categories — Starter Plan Gating', () => {
    it('returns 403 when starter plan has reached 5-category limit', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        mockCount.mockResolvedValue(5);

        const res = await request(app)
            .post('/api/categories')
            .send({ name: 'Nova Categoria' });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch(/5 categori/i);
    });

    it('returns 201 when starter plan has fewer than 5 categories', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        mockCount.mockResolvedValue(4);
        mockCreate.mockResolvedValue(CATEGORY_STUB);

        const res = await request(app)
            .post('/api/categories')
            .send({ name: 'Pratos do Dia' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('returns 201 on essential plan regardless of count', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
        mockCreate.mockResolvedValue(CATEGORY_STUB);

        const res = await request(app)
            .post('/api/categories')
            .send({ name: 'Pratos do Dia' });

        expect(res.status).toBe(201);
        expect(mockCount).not.toHaveBeenCalled();
    });

    it('returns 201 on professional plan regardless of count', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'professional' });
        mockCreate.mockResolvedValue(CATEGORY_STUB);

        const res = await request(app)
            .post('/api/categories')
            .send({ name: 'Pratos do Dia' });

        expect(res.status).toBe(201);
    });
});

// ─────────────────────────────────────────────
describe('POST /api/categories — Zod validation', () => {
    beforeEach(() => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
    });

    it('returns 400 when name is too short (< 2 chars)', async () => {
        const res = await request(app)
            .post('/api/categories')
            .send({ name: 'A' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
        const res = await request(app)
            .post('/api/categories')
            .send({});

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────────
describe('PUT /api/categories/:id', () => {
    it('returns 200 and updated category', async () => {
        mockFindUnique.mockResolvedValue(CATEGORY_STUB);
        mockUpdate.mockResolvedValue({ ...CATEGORY_STUB, name: 'Atualizado', slug: 'atualizado' });

        const res = await request(app)
            .put('/api/categories/cat-id-1')
            .send({ name: 'Atualizado' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('returns 404 when category does not exist', async () => {
        mockFindUnique.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/categories/nonexistent-id')
            .send({ name: 'Algo' });

        expect(res.status).toBe(404);
    });
});

// ─────────────────────────────────────────────
describe('DELETE /api/categories/:id', () => {
    it('returns 200 when deletion succeeds', async () => {
        mockFindUnique.mockResolvedValue(CATEGORY_STUB);
        mockDelete.mockResolvedValue(CATEGORY_STUB);

        const res = await request(app).delete('/api/categories/cat-id-1');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('returns 404 when category does not exist', async () => {
        mockFindUnique.mockResolvedValue(null);

        const res = await request(app).delete('/api/categories/nonexistent-id');

        expect(res.status).toBe(404);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
