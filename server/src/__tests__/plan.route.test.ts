// ============================================
// Plan Route Tests
// Covers: GET /api/plan returns correct feature flags per plan
// ============================================

// /api/plan has no CSRF protection, but csrfSetToken runs globally
jest.mock('../middlewares/csrf', () => ({
    csrfSetToken: (_req: any, _res: any, next: any) => next(),
    csrfVerifyToken: (_req: any, _res: any, next: any) => next(),
    getCsrfToken: (_req: any, res: any) => res.json({ success: true, token: 'test-token' }),
}));

jest.mock('../prisma/client', () => {
    const mock = {
        siteConfig: { findUnique: jest.fn() },
        $disconnect: jest.fn(),
        $queryRaw: jest.fn().mockResolvedValue([1]),
        adminUser: { findUnique: jest.fn() },
    };
    return { __esModule: true, default: mock, prisma: mock };
});

import request from 'supertest';
import app from '../app';
import prisma from '../prisma/client';
import { STARTER_LIMITS } from '../middlewares/plan';

const mockSiteConfig = prisma.siteConfig.findUnique as jest.Mock;

// ─────────────────────────────────────────────
describe('GET /api/plan', () => {
    it('returns starter feature flags when plan is starter', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });

        const res = await request(app).get('/api/plan');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const { data } = res.body;
        expect(data.plan).toBe('starter');
        expect(data.isStarter).toBe(true);
        expect(data.isProfessional).toBe(false);

        // Starter-specific limits
        expect(data.features.maxDishes).toBe(STARTER_LIMITS.maxDishes);
        expect(data.features.maxCategories).toBe(STARTER_LIMITS.maxCategories);

        // PRO-only features must be disabled
        expect(data.features.customLogo).toBe(false);
        expect(data.features.brandColor).toBe(false);
        expect(data.features.teamSection).toBe(false);
        expect(data.features.qrCode).toBe(false);
        expect(data.features.favicon).toBe(false);

        // Starter hides gallery and about
        expect(data.features.gallery).toBe(false);
        expect(data.features.aboutPage).toBe(false);
    });

    it('returns essential feature flags when plan is essential', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });

        const res = await request(app).get('/api/plan');

        expect(res.status).toBe(200);

        const { data } = res.body;
        expect(data.plan).toBe('essential');
        expect(data.isStarter).toBe(false);
        expect(data.isProfessional).toBe(false);

        // No limits on essential
        expect(data.features.maxDishes).toBeNull();
        expect(data.features.maxCategories).toBeNull();

        // Gallery and about enabled
        expect(data.features.gallery).toBe(true);
        expect(data.features.aboutPage).toBe(true);

        // PRO-only features still off
        expect(data.features.customLogo).toBe(false);
    });

    it('returns professional feature flags when plan is professional', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'professional' });

        const res = await request(app).get('/api/plan');

        expect(res.status).toBe(200);

        const { data } = res.body;
        expect(data.plan).toBe('professional');
        expect(data.isProfessional).toBe(true);
        expect(data.isStarter).toBe(false);

        // PRO features enabled
        expect(data.features.customLogo).toBe(true);
        expect(data.features.brandColor).toBe(true);
        expect(data.features.teamSection).toBe(true);
        expect(data.features.favicon).toBe(true);
        expect(data.features.gallery).toBe(true);
        expect(data.features.aboutPage).toBe(true);

        // No limits
        expect(data.features.maxDishes).toBeNull();
        expect(data.features.maxCategories).toBeNull();
    });

    it('defaults to essential when site_plan config does not exist', async () => {
        mockSiteConfig.mockResolvedValue(null);

        const res = await request(app).get('/api/plan');

        expect(res.status).toBe(200);
        expect(res.body.data.plan).toBe('essential');
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
