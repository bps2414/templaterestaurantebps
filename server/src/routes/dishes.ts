// ============================================
// Dish Routes — CRUD
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { getCurrentPlan, STARTER_LIMITS } from '../middlewares/plan';
import { AuthenticatedRequest } from '../types';
import { upload, validateImageMagicBytes, UPLOAD_DIR } from '../middlewares/upload';
import cloudinaryService from '../services/cloudinaryService';
import { z } from 'zod';
import { NotFoundError } from '../utils/errors';
import fs from 'fs';
import path from 'path';

const router = Router();

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 60);
}

const dishSchema = z.object({
    name: z.string().min(2).max(150),
    description: z.string().max(500).optional(),
    price: z.number().int().positive('Preço deve ser positivo'),
    categoryId: z.string().uuid(),
    featured: z.boolean().optional().default(false),
    active: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
});

// GET /api/dishes — Public: list active dishes
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dishes = await prisma.dish.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
            include: { category: { select: { id: true, name: true, slug: true } } },
        });
        res.json({ success: true, data: dishes });
    } catch (error) {
        next(error);
    }
});

// GET /api/dishes/featured — Public: featured dishes
router.get('/featured', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dishes = await prisma.dish.findMany({
            where: { active: true, featured: true },
            orderBy: { sortOrder: 'asc' },
            include: { category: { select: { id: true, name: true, slug: true } } },
        });
        res.json({ success: true, data: dishes });
    } catch (error) {
        next(error);
    }
});

// POST /api/dishes/validate-prices — Public: validate cart prices against server
router.post('/validate-prices', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
            return res.status(400).json({ success: false, error: 'Lista de IDs inválida' });
        }

        // Validate all IDs are strings
        const validIds = ids.filter((id: unknown) => typeof id === 'string' && id.length > 0).slice(0, 50);

        const dishes = await prisma.dish.findMany({
            where: { id: { in: validIds }, active: true },
            select: { id: true, price: true },
        });

        const priceMap: Record<string, number> = {};
        dishes.forEach((d: { id: string; price: number }) => { priceMap[d.id] = d.price; });

        res.json({ success: true, data: priceMap });
    } catch (error) {
        next(error);
    }
});

// GET /api/dishes/all — Admin: list all dishes
router.get('/all', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const dishes = await prisma.dish.findMany({
            orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
            include: { category: { select: { id: true, name: true, slug: true } } },
        });
        res.json({ success: true, data: dishes });
    } catch (error) {
        next(error);
    }
});

// POST /api/dishes — Admin: create dish
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Enforce starter plan dish limit
        const plan = await getCurrentPlan();
        if (plan === 'starter') {
            const dishCount = await prisma.dish.count();
            if (dishCount >= STARTER_LIMITS.maxDishes) {
                return res.status(403).json({
                    success: false,
                    error: `O Plano Starter permite no máximo ${STARTER_LIMITS.maxDishes} pratos. Faça upgrade para o Plano Essencial para pratos ilimitados.`,
                });
            }
        }

        // Parse numeric/boolean fields from multipart form
        const body = {
            ...req.body,
            price: parseInt(req.body.price, 10),
            featured: req.body.featured === 'true' || req.body.featured === true,
            active: req.body.active !== 'false' && req.body.active !== false,
            sortOrder: req.body.sortOrder ? parseInt(req.body.sortOrder, 10) : 0,
        };

        const data = dishSchema.parse(body);

        if (req.file) {
            const filePath = path.join(UPLOAD_DIR, req.file.filename);
            const isValidImage = validateImageMagicBytes(filePath);
            if (!isValidImage) {
                try {
                    fs.unlinkSync(filePath);
                } catch (_unlinkError) {
                    // ignore
                }
                return res.status(400).json({
                    success: false,
                    error: 'Arquivo inválido. Apenas imagens JPG, PNG, GIF ou WebP são permitidas.',
                });
            }
        }

        const slug = slugify(data.name) + '-' + Date.now().toString(36);
        let image: string | null = null;

        // Upload to Cloudinary if file provided
        if (req.file) {
            const filePath = path.join(UPLOAD_DIR, req.file.filename);
            const cloudinaryUrl = await cloudinaryService.upload(filePath, 'dishes');
            if (!cloudinaryUrl) {
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao fazer upload da imagem.'
                });
            }
            image = cloudinaryUrl;
        }

        const dish = await prisma.dish.create({
            data: { ...data, slug, image },
            include: { category: { select: { id: true, name: true, slug: true } } },
        });

        res.status(201).json({ success: true, data: dish });
    } catch (error) {
        next(error);
    }
});

// PUT /api/dishes/:id — Admin: update dish
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.dish.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Prato não encontrado');

        const body: Record<string, any> = { ...req.body };
        if (body.price) body.price = parseInt(body.price, 10);
        if (body.sortOrder) body.sortOrder = parseInt(body.sortOrder, 10);
        if (body.featured !== undefined) body.featured = body.featured === 'true' || body.featured === true;
        if (body.active !== undefined) body.active = body.active !== 'false' && body.active !== false;

        const data = dishSchema.partial().parse(body);
        let image = existing.image;

        if (req.file) {
            const filePath = path.join(UPLOAD_DIR, req.file.filename);
            const isValidImage = validateImageMagicBytes(filePath);
            if (!isValidImage) {
                try {
                    fs.unlinkSync(filePath);
                } catch (_unlinkError) {
                    // ignore
                }
                return res.status(400).json({
                    success: false,
                    error: 'Arquivo inválido. Apenas imagens JPG, PNG, GIF ou WebP são permitidas.',
                });
            }

            // Upload new image to Cloudinary
            const cloudinaryUrl = await cloudinaryService.upload(filePath, 'dishes');
            if (!cloudinaryUrl) {
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao fazer upload da imagem.'
                });
            }

            image = cloudinaryUrl;

            // Delete old image from Cloudinary if it exists and is a Cloudinary URL
            if (existing.image && existing.image.includes('cloudinary.com')) {
                await cloudinaryService.delete(existing.image);
            }
        }

        const dish = await prisma.dish.update({
            where: { id },
            data: { ...data, image },
            include: { category: { select: { id: true, name: true, slug: true } } },
        });

        res.json({ success: true, data: dish });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/dishes/:id — Admin: delete dish
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.dish.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Prato não encontrado');

        // Delete image from Cloudinary if it's a Cloudinary URL
        if (existing.image && existing.image.includes('cloudinary.com')) {
            await cloudinaryService.delete(existing.image);
        }

        await prisma.dish.delete({ where: { id } });
        res.json({ success: true, message: 'Prato removido' });
    } catch (error) {
        next(error);
    }
});

export default router;
