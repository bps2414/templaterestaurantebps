// ============================================
// Category Routes — CRUD
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { getCurrentPlan, STARTER_LIMITS } from '../middlewares/plan';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import { NotFoundError } from '../utils/errors';

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

const categorySchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
    sortOrder: z.number().int().optional().default(0),
    image: z.string().optional(),
    active: z.boolean().optional().default(true),
});

// GET /api/categories — Public: list active categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                dishes: {
                    where: { active: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
});

// GET /api/categories/all — Admin: list all categories
router.get('/all', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { dishes: true } } },
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
});

// POST /api/categories — Admin: create category
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Enforce starter plan category limit
        const plan = await getCurrentPlan();
        if (plan === 'starter') {
            const categoryCount = await prisma.category.count();
            if (categoryCount >= STARTER_LIMITS.maxCategories) {
                return res.status(403).json({
                    success: false,
                    error: `O Plano Starter permite no máximo ${STARTER_LIMITS.maxCategories} categorias. Faça upgrade para o Plano Essencial para categorias ilimitadas.`,
                });
            }
        }

        const data = categorySchema.parse(req.body);
        const slug = slugify(data.name);

        const category = await prisma.category.create({
            data: { ...data, slug },
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// PUT /api/categories/:id — Admin: update category
router.put('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = categorySchema.partial().parse(req.body);

        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Categoria não encontrada');

        const slug = data.name ? slugify(data.name) : undefined;

        const category = await prisma.category.update({
            where: { id },
            data: { ...data, ...(slug ? { slug } : {}) },
        });

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/categories/:id — Admin: delete category
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Categoria não encontrada');

        await prisma.category.delete({ where: { id } });
        res.json({ success: true, message: 'Categoria removida' });
    } catch (error) {
        next(error);
    }
});

export default router;
