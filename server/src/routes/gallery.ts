// ============================================
// Gallery Routes — CRUD for gallery images
// ============================================

import { Router, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';
import { upload, validateImageMagicBytes, UPLOAD_DIR } from '../middlewares/upload';
import { NotFoundError } from '../utils/errors';
import fs from 'fs';
import path from 'path';

const router = Router();

// GET /api/gallery — Public: list active gallery images
router.get('/', async (_req, res: Response, next: NextFunction) => {
    try {
        const images = await prisma.galleryImage.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: images });
    } catch (error) {
        next(error);
    }
});

// GET /api/gallery/all — Admin: list all gallery images
router.get('/all', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const images = await prisma.galleryImage.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: images });
    } catch (error) {
        next(error);
    }
});

// POST /api/gallery — Admin: upload gallery image
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Imagem é obrigatória' });
        }

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

        const src = `/uploads/${req.file.filename}`;
        const alt = req.body.alt || '';
        const sortOrder = req.body.sortOrder ? parseInt(req.body.sortOrder, 10) : 0;

        const image = await prisma.galleryImage.create({
            data: { src, alt, sortOrder },
        });

        res.status(201).json({ success: true, data: image });
    } catch (error) {
        next(error);
    }
});

// PUT /api/gallery/:id — Admin: update gallery image metadata
router.put('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.galleryImage.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Imagem não encontrada');

        const data: Record<string, any> = {};
        if (req.body.alt !== undefined) data.alt = req.body.alt;
        if (req.body.sortOrder !== undefined) data.sortOrder = parseInt(req.body.sortOrder, 10);
        if (req.body.active !== undefined) data.active = req.body.active === true || req.body.active === 'true';

        const image = await prisma.galleryImage.update({
            where: { id },
            data,
        });

        res.json({ success: true, data: image });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/gallery/:id — Admin: delete gallery image
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existing = await prisma.galleryImage.findUnique({ where: { id } });
        if (!existing) throw new NotFoundError('Imagem não encontrada');

        // Remove file
        if (existing.src) {
            const filePath = path.join(__dirname, '../../assets', existing.src);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.galleryImage.delete({ where: { id } });
        res.json({ success: true, message: 'Imagem removida' });
    } catch (error) {
        next(error);
    }
});

export default router;
