// ============================================
// Site Config Routes — Key/Value settings
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { getCurrentPlan, isProConfigKey } from '../middlewares/plan';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import { ForbiddenError, BadRequestError } from '../utils/errors';
import cloudinaryService from '../services/cloudinaryService';
import logger from '../utils/logger';

const router = Router();

// Keys that hold Cloudinary image URLs
const IMAGE_CONFIG_KEYS = ['logo_url', 'hero_image', 'about_image', 'favicon_url'];

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

// Validate WhatsApp number format (DDI + DDD + number, e.g. 5511999998888)
function validateWhatsApp(value: string): { valid: boolean; cleaned: string; error?: string } {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) {
        return { valid: true, cleaned: '' }; // allow empty (optional)
    }
    if (cleaned.length < 12 || cleaned.length > 15) {
        return { valid: false, cleaned, error: 'WhatsApp deve ter entre 12 e 15 dígitos (DDI + DDD + número). Ex: 5511999998888' };
    }
    if (!cleaned.startsWith('55')) {
        // Accept international numbers too, but warn for BR
        if (cleaned.length < 10) {
            return { valid: false, cleaned, error: 'Número de WhatsApp muito curto. Use formato internacional: 5511999998888' };
        }
    }
    return { valid: true, cleaned };
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
    'about_text_2',
    'about_image',
    'opening_hours',
    'business_hours',
    'store_force_closed',
    'google_maps_embed',
    'instagram_url',
    'facebook_url',
    'footer_text',
    // PRO-only keys (gated in PUT handler)
    'logo_url',
    'brand_color',
    'favicon_url',
];

// GET /api/config — Public: get all config
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await getCurrentPlan();
        const configs = await prisma.siteConfig.findMany();
        const configMap: Record<string, string> = {};
        configs.forEach((c: { key: string; value: string }) => {
            // Hide internal keys from public response
            if (c.key === 'site_plan') return;
            // Hide PRO-only values on Essential plan
            if (plan !== 'professional' && isProConfigKey(c.key)) return;
            configMap[c.key] = c.value;
        });
        // Dynamic data: never cache API config responses
        res.setHeader('Cache-Control', 'no-store');
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

        // Check plan for PRO-only keys
        const plan = await getCurrentPlan();
        const proKeysAttempted = Object.keys(data).filter(k => isProConfigKey(k));
        if (proKeysAttempted.length > 0 && plan !== 'professional') {
            throw new ForbiddenError(
                `As chaves [${proKeysAttempted.join(', ')}] requerem o Plano Profissional.`
            );
        }

        // Fetch old values for image keys to cleanup Cloudinary
        const imageKeysBeingUpdated = Object.keys(data).filter(k => IMAGE_CONFIG_KEYS.includes(k));
        const oldImageValues: Record<string, string> = {};
        if (imageKeysBeingUpdated.length > 0) {
            const oldConfigs = await prisma.siteConfig.findMany({
                where: { key: { in: imageKeysBeingUpdated } },
            });
            oldConfigs.forEach((c: { key: string; value: string }) => {
                oldImageValues[c.key] = c.value;
            });
        }

        const updates = Object.entries(data).map(([key, value]) => {
            if (!ALLOWED_KEYS.includes(key)) {
                throw new BadRequestError(`Chave "${key}" não é permitida`);
            }

            // Validate WhatsApp number format
            if (key === 'whatsapp_number') {
                const whatsappResult = validateWhatsApp(value);
                if (!whatsappResult.valid) {
                    throw new BadRequestError(whatsappResult.error);
                }
                // Use cleaned (digits only) version
                const sanitized = whatsappResult.cleaned;
                return prisma.siteConfig.upsert({
                    where: { key },
                    update: { value: sanitized },
                    create: { key, value: sanitized },
                });
            }

            const sanitized = sanitizeValue(value);
            return prisma.siteConfig.upsert({
                where: { key },
                update: { value: sanitized },
                create: { key, value: sanitized },
            });
        });

        await Promise.all(updates);

        // Cleanup old Cloudinary images (fire-and-forget, non-blocking)
        for (const key of imageKeysBeingUpdated) {
            const oldUrl = oldImageValues[key];
            const newUrl = data[key];
            if (oldUrl && oldUrl.includes('cloudinary.com') && oldUrl !== newUrl) {
                cloudinaryService.delete(oldUrl).catch(err => {
                    logger.warn('Failed to cleanup old Cloudinary image', { key, oldUrl, error: err.message });
                });
            }
        }

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
