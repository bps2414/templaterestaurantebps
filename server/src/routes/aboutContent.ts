// ============================================
// About Content Routes — Features & Team Members
// Stores JSON data as SiteConfig key-value entries
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { getCurrentPlan } from '../middlewares/plan';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import cloudinaryService from '../services/cloudinaryService';
import logger from '../utils/logger';

const router = Router();

// --- Validation schemas ---
const featureSchema = z.object({
    icon: z.string().max(10),
    title: z.string().min(1).max(60),
    description: z.string().min(1).max(400),
});

const teamMemberSchema = z.object({
    name: z.string().min(1).max(80),
    role: z.string().min(1).max(50),
    image: z.string().max(500).optional().default(''),
});

const aboutContentSchema = z.object({
    about_features: z.array(featureSchema).max(6).optional(),
    team_members: z.array(teamMemberSchema).max(10).optional(),
    about_text_2: z.string().max(2000).optional(),
});

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

// Keys managed by this route
const ABOUT_KEYS = ['about_features', 'team_members', 'about_text_2'];

// GET /api/about-content — Public: get about features & team members
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await getCurrentPlan();
        const configs = await prisma.siteConfig.findMany({
            where: { key: { in: ABOUT_KEYS } },
        });

        const result: Record<string, unknown> = {};
        configs.forEach((c: { key: string; value: string }) => {
            try {
                result[c.key] = JSON.parse(c.value);
            } catch {
                result[c.key] = c.value;
            }
        });

        // Hide team_members on Essential plan
        if (plan !== 'professional') {
            delete result.team_members;
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// PUT /api/about-content — Admin: update about features & team members
router.put('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = aboutContentSchema.parse(req.body);
        const plan = await getCurrentPlan();

        // Block team_members updates on Essential plan
        if (data.team_members !== undefined && plan !== 'professional') {
            return res.status(403).json({
                success: false,
                error: 'A seção de Equipe requer o Plano Profissional.',
            });
        }

        const updates: Promise<unknown>[] = [];

        if (data.about_features !== undefined) {
            // Sanitize all string fields in features
            const sanitizedFeatures = data.about_features.map(f => ({
                icon: f.icon,
                title: sanitizeValue(f.title),
                description: sanitizeValue(f.description),
            }));
            const value = JSON.stringify(sanitizedFeatures);
            updates.push(
                prisma.siteConfig.upsert({
                    where: { key: 'about_features' },
                    update: { value },
                    create: { key: 'about_features', value },
                })
            );
        }

        if (data.team_members !== undefined) {
            // Fetch old team member images for Cloudinary cleanup
            const oldTeamConfig = await prisma.siteConfig.findUnique({ where: { key: 'team_members' } });
            let oldMemberImages: string[] = [];
            if (oldTeamConfig) {
                try {
                    const oldMembers = JSON.parse(oldTeamConfig.value) as Array<{ image?: string }>;
                    oldMemberImages = oldMembers
                        .map(m => m.image || '')
                        .filter(img => img.includes('cloudinary.com'));
                } catch {
                    // Old value not parseable, skip cleanup
                }
            }

            // Sanitize all string fields in team members
            const sanitizedMembers = data.team_members.map(m => ({
                name: sanitizeValue(m.name),
                role: sanitizeValue(m.role),
                image: m.image ? sanitizeValue(m.image) : '',
            }));
            const newMemberImages = sanitizedMembers.map(m => m.image).filter(Boolean);
            const value = JSON.stringify(sanitizedMembers);
            updates.push(
                prisma.siteConfig.upsert({
                    where: { key: 'team_members' },
                    update: { value },
                    create: { key: 'team_members', value },
                })
            );

            // Cleanup orphaned Cloudinary images (fire-and-forget)
            for (const oldImg of oldMemberImages) {
                if (!newMemberImages.includes(oldImg)) {
                    cloudinaryService.delete(oldImg).catch(err => {
                        logger.warn('Failed to cleanup old team member image', { oldImg, error: err.message });
                    });
                }
            }
        }

        if (data.about_text_2 !== undefined) {
            const value = sanitizeValue(data.about_text_2);
            updates.push(
                prisma.siteConfig.upsert({
                    where: { key: 'about_text_2' },
                    update: { value },
                    create: { key: 'about_text_2', value },
                })
            );
        }

        await Promise.all(updates);

        // Return updated data
        const configs = await prisma.siteConfig.findMany({
            where: { key: { in: ABOUT_KEYS } },
        });

        const result: Record<string, unknown> = {};
        configs.forEach((c: { key: string; value: string }) => {
            try {
                result[c.key] = JSON.parse(c.value);
            } catch {
                result[c.key] = c.value;
            }
        });

        // Filter PRO keys on Essential plan (same as GET handler)
        if (plan !== 'professional') {
            delete result.team_members;
        }

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default router;
