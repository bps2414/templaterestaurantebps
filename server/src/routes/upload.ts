// ============================================
// Upload Routes — Direct image upload endpoint
// ============================================

import { Router, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';
import { upload, validateImageMagicBytes, UPLOAD_DIR } from '../middlewares/upload';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /api/upload — Admin: upload a single image
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Imagem é obrigatória' });
        }

        const filePath = path.join(UPLOAD_DIR, req.file.filename);
        
        // SECURITY: Validate file content by checking magic bytes
        console.log('🔍 Validating file:', req.file.filename);
        const isValidImage = validateImageMagicBytes(filePath);
        console.log('✅ Validation result:', isValidImage);
        
        if (!isValidImage) {
            console.log('❌ BLOCKED: Invalid file signature detected!');
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
        
        console.log('✅ ALLOWED: Valid image uploaded');

        const url = `/uploads/${req.file.filename}`;
        res.status(201).json({
            success: true,
            data: {
                url,
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
