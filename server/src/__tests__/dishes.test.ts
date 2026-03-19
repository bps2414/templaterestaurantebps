// ============================================
// Dishes Route Tests
// Covers: plan gating (starter 30-dish limit), public routes, validation
// ============================================

jest.mock('../middlewares/csrf', () => ({
    csrfSetToken: (_req: any, _res: any, next: any) => next(),
    csrfVerifyToken: (_req: any, _res: any, next: any) => next(),
    getCsrfToken: (_req: any, res: any) => res.json({ success: true, token: 'test-token' }),
}));

jest.mock('../middlewares/auth', () => ({
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { userId: 'test-user-id', email: 'test@restaurante.com', role: 'ADMIN', tokenVersion: 0 };
        next();
    },
    requireAdmin: (_req: any, _res: any, next: any) => next(),
    requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock cloudinary to avoid real upload calls
jest.mock('../services/cloudinaryService', () => ({
    default: { upload: jest.fn(), delete: jest.fn() },
}));

jest.mock('../prisma/client', () => {
    const mock = {
        siteConfig: { findUnique: jest.fn() },
        dish: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        category: { findUnique: jest.fn() },
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
const mockCount = prisma.dish.count as jest.Mock;
const mockFindMany = prisma.dish.findMany as jest.Mock;
const mockFindUnique = prisma.dish.findUnique as jest.Mock;
const mockCreate = prisma.dish.create as jest.Mock;
const mockUpdate = prisma.dish.update as jest.Mock;
const mockDelete = prisma.dish.delete as jest.Mock;

const DISH_STUB = {
    id: 'dish-id-1',
    name: 'PF Completo',
    slug: 'pf-completo',
    description: 'Arroz, feijão, carne e salada',
    price: 2500,
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    featured: false,
    active: true,
    sortOrder: 0,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Pratos do Dia', slug: 'pratos-do-dia' },
};

// ─────────────────────────────────────────────
describe('GET /api/dishes (public)', () => {
    it('returns 200 with active dishes', async () => {
        mockFindMany.mockResolvedValue([DISH_STUB]);

        const res = await request(app).get('/api/dishes');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('returns 200 with empty array when no dishes exist', async () => {
        mockFindMany.mockResolvedValue([]);

        const res = await request(app).get('/api/dishes');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────
describe('GET /api/dishes/featured (public)', () => {
    it('returns 200 with only featured dishes', async () => {
        const featuredDish = { ...DISH_STUB, featured: true };
        mockFindMany.mockResolvedValue([featuredDish]);

        const res = await request(app).get('/api/dishes/featured');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data[0].featured).toBe(true);
    });
});

// ─────────────────────────────────────────────
describe('POST /api/dishes/validate-prices (public)', () => {
    it('returns 400 when ids is not an array', async () => {
        const res = await request(app)
            .post('/api/dishes/validate-prices')
            .send({ ids: 'not-an-array' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when ids is empty', async () => {
        const res = await request(app)
            .post('/api/dishes/validate-prices')
            .send({ ids: [] });

        expect(res.status).toBe(400);
    });

    it('returns 400 when ids has more than 50 items', async () => {
        const ids = Array.from({ length: 51 }, (_, i) => `id-${i}`);

        const res = await request(app)
            .post('/api/dishes/validate-prices')
            .send({ ids });

        expect(res.status).toBe(400);
    });

    it('returns 200 with prices for valid IDs', async () => {
        (prisma.dish.findMany as jest.Mock).mockResolvedValue([
            { id: 'dish-id-1', price: 2500 },
        ]);

        const res = await request(app)
            .post('/api/dishes/validate-prices')
            .send({ ids: ['dish-id-1'] });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // Route returns a price-map object: { [dishId]: priceInCents }
        expect(typeof res.body.data).toBe('object');
        expect(res.body.data).not.toBeNull();
        expect(res.body.data['dish-id-1']).toBe(2500);
    });
});

// ─────────────────────────────────────────────
describe('POST /api/dishes — Starter Plan Gating', () => {
    const VALID_DISH_PAYLOAD = {
        name: 'PF Completo',
        price: 2500,
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('returns 403 when starter plan has reached 30-dish limit', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        mockCount.mockResolvedValue(30);

        const res = await request(app)
            .post('/api/dishes')
            .send(VALID_DISH_PAYLOAD);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch(/30 prat/i);
    });

    it('returns 201 when starter plan has fewer than 30 dishes', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        mockCount.mockResolvedValue(29);
        mockCreate.mockResolvedValue(DISH_STUB);

        const res = await request(app)
            .post('/api/dishes')
            .send(VALID_DISH_PAYLOAD);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('returns 201 on essential plan regardless of dish count', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
        mockCreate.mockResolvedValue(DISH_STUB);

        const res = await request(app)
            .post('/api/dishes')
            .send(VALID_DISH_PAYLOAD);

        expect(res.status).toBe(201);
        expect(mockCount).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────
describe('POST /api/dishes — Zod validation', () => {
    beforeEach(() => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
    });

    it('returns 400 when price is zero', async () => {
        const res = await request(app)
            .post('/api/dishes')
            .send({ name: 'PF Completo', price: 0, categoryId: '550e8400-e29b-41d4-a716-446655440000' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when categoryId is not a valid UUID', async () => {
        const res = await request(app)
            .post('/api/dishes')
            .send({ name: 'PF Completo', price: 2500, categoryId: 'not-a-uuid' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when name is too short (< 2 chars)', async () => {
        const res = await request(app)
            .post('/api/dishes')
            .send({ name: 'A', price: 2500, categoryId: '550e8400-e29b-41d4-a716-446655440000' });

        expect(res.status).toBe(400);
    });
});

// ─────────────────────────────────────────────
describe('DELETE /api/dishes/:id', () => {
    it('returns 200 when deletion succeeds', async () => {
        mockFindUnique.mockResolvedValue(DISH_STUB);
        mockDelete.mockResolvedValue(DISH_STUB);

        const res = await request(app).delete('/api/dishes/dish-id-1');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('returns 404 when dish does not exist', async () => {
        mockFindUnique.mockResolvedValue(null);

        const res = await request(app).delete('/api/dishes/nonexistent-id');

        expect(res.status).toBe(404);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
