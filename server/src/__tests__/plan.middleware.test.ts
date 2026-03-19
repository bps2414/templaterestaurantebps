// ============================================
// Plan Middleware Tests
// Tests getCurrentPlan(), isProfessional(), isStarter(), STARTER_LIMITS
// ============================================

jest.mock('../prisma/client', () => {
    const mockPrisma = {
        siteConfig: { findUnique: jest.fn() },
        $disconnect: jest.fn(),
    };
    return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});

import prisma from '../prisma/client';
import {
    getCurrentPlan,
    isProfessional,
    isStarter,
    STARTER_LIMITS,
} from '../middlewares/plan';

const mockSiteConfig = prisma.siteConfig.findUnique as jest.Mock;

// ─────────────────────────────────────────────
describe('STARTER_LIMITS constants', () => {
    it('maxDishes is 30', () => {
        expect(STARTER_LIMITS.maxDishes).toBe(30);
    });

    it('maxCategories is 5', () => {
        expect(STARTER_LIMITS.maxCategories).toBe(5);
    });
});

// ─────────────────────────────────────────────
describe('getCurrentPlan()', () => {
    it('returns starter when DB has site_plan = starter', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        expect(await getCurrentPlan()).toBe('starter');
    });

    it('returns essential when DB has site_plan = essential', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
        expect(await getCurrentPlan()).toBe('essential');
    });

    it('returns professional when DB has site_plan = professional', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'professional' });
        expect(await getCurrentPlan()).toBe('professional');
    });

    it('returns essential (default) when config row does not exist', async () => {
        mockSiteConfig.mockResolvedValue(null);
        expect(await getCurrentPlan()).toBe('essential');
    });

    it('returns essential (fallback) when DB throws an error', async () => {
        mockSiteConfig.mockRejectedValue(new Error('DB connection failed'));
        expect(await getCurrentPlan()).toBe('essential');
    });

    it('returns essential when DB value is an unrecognised string', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'premium_plus' });
        expect(await getCurrentPlan()).toBe('essential');
    });
});

// ─────────────────────────────────────────────
describe('isProfessional()', () => {
    it('returns true for professional plan', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'professional' });
        expect(await isProfessional()).toBe(true);
    });

    it('returns false for starter plan', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        expect(await isProfessional()).toBe(false);
    });

    it('returns false for essential plan', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
        expect(await isProfessional()).toBe(false);
    });
});

// ─────────────────────────────────────────────
describe('isStarter()', () => {
    it('returns true for starter plan', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'starter' });
        expect(await isStarter()).toBe(true);
    });

    it('returns false for essential plan', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'essential' });
        expect(await isStarter()).toBe(false);
    });

    it('returns false for professional plan', async () => {
        mockSiteConfig.mockResolvedValue({ key: 'site_plan', value: 'professional' });
        expect(await isStarter()).toBe(false);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
