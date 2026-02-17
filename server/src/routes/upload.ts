// ============================================
// Upload Routes — Direct image upload endpoint
// ============================================

import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';
import { upload, validateImageMagicBytes, UPLOAD_DIR } from '../middlewares/upload';
import cloudinaryService from '../services/cloudinaryService';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /api/upload — Admin: upload a single image
// Accepts optional `previousUrl` in body to cleanup old Cloudinary image
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Imagem é obrigatória' });
        }

        const filePath = path.join(UPLOAD_DIR, req.file.filename);

        // SECURITY: Validate file content by checking magic bytes
        const isValidImage = validateImageMagicBytes(filePath);

        if (!isValidImage) {
            // Delete the uploaded file
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                // File might not exist, ignore
            }

            return res.status(400).json({
                success: false,
                error: 'Arquivo inválido. Apenas imagens JPG, PNG, GIF ou WebP são permitidas.'
            });
        }

        // Upload to Cloudinary
        const cloudinaryUrl = await cloudinaryService.upload(filePath, 'uploads');

        if (!cloudinaryUrl) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao fazer upload da imagem. Tente novamente.'
            });
        }

        // Cleanup old Cloudinary image if previousUrl was provided
        const previousUrl = req.body?.previousUrl;
        if (previousUrl && typeof previousUrl === 'string' && previousUrl.includes('cloudinary.com')) {
            cloudinaryService.delete(previousUrl).catch(() => {
                // Non-blocking: log handled inside service
            });
        }

        res.status(201).json({
            success: true,
            data: {
                url: cloudinaryUrl,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
