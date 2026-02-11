// ============================================
// Site Config Routes — Key/Value settings
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';

const router = Router();

// Sanitize string values against XSS
function sanitizeValue(value: string): string {
    return value
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .trim();
}

// Default config keys (whitelist)
const ALLOWED_KEYS = [
    'restaurant_name',
    'restaurant_tagline',
    'restaurant_description',
    'restaurant_address',
    'restaurant_phone',
    'restaurant_email',
    'whatsapp_number',
    'whatsapp_message',
    'hero_title',
    'hero_subtitle',
    'hero_image',
    'about_title',
    'about_text',
    'about_image',
    'opening_hours',
    'google_maps_embed',
    'instagram_url',
    'facebook_url',
    'footer_text',
];

// GET /api/config — Public: get all config
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const configs = await prisma.siteConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((c: { key: string; value: string }) => { configMap[c.key] = c.value; });
        res.json({ success: true, data: configMap });
    } catch (error) {
        next(error);
    }
});

// PUT /api/config — Admin: update config (batch)
router.put('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const schema = z.record(
            z.string().max(50),
            z.string().max(2000)
        );
        const data = schema.parse(req.body);

        const updates = Object.entries(data).map(([key, value]) => {
            if (!ALLOWED_KEYS.includes(key)) {
                throw new Error(`Chave "${key}" não é permitida`);
            }
            const sanitized = sanitizeValue(value);
            return prisma.siteConfig.upsert({
                where: { key },
                update: { value: sanitized },
                create: { key, value: sanitized },
            });
        });

        await Promise.all(updates);

        const configs = await prisma.siteConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((c: { key: string; value: string }) => { configMap[c.key] = c.value; });

        res.json({ success: true, data: configMap });
    } catch (error) {
        next(error);
    }
});

// GET /api/config/keys — Admin: get allowed keys
router.get('/keys', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, data: ALLOWED_KEYS });
});

export default router;
