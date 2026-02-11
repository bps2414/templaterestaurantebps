// ============================================
// Auth Routes — Admin login/logout/refresh
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { requireAuth } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

const router = Router();

const BCRYPT_ROUNDS = 12;

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiúscula')
        .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minúscula')
        .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = loginSchema.parse(req.body);
        const result = await authService.login({
            ...data,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'Refresh token obrigatório' });
        }

        const tokens = await authService.refreshTokens(refreshToken, req.ip, req.headers['user-agent']);
        res.json({ success: true, data: tokens });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        res.json({ success: true, message: 'Logout realizado' });
    } catch (error) {
        next(error);
    }
});

// GET /api/auth/me — Get current admin user
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.adminUser.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// PUT /api/auth/change-password — Change admin password (requires current password)
router.put('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const data = changePasswordSchema.parse(req.body);

        // Fetch current user
        const user = await prisma.adminUser.findUnique({
            where: { id: req.user!.userId },
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Senha atual incorreta' });
        }

        // Prevent reusing the same password
        const isSame = await bcrypt.compare(data.newPassword, user.passwordHash);
        if (isSame) {
            return res.status(400).json({ success: false, error: 'A nova senha deve ser diferente da atual' });
        }

        // Hash new password and update (increment tokenVersion to invalidate all JWTs immediately)
        const newHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
        await prisma.adminUser.update({
            where: { id: user.id },
            data: {
                passwordHash: newHash,
                tokenVersion: { increment: 1 },
            },
        });

        // Invalidate all refresh tokens (force re-login on all devices)
        await authService.logoutAll(user.id);

        // Audit log (never logs the password itself)
        logger.info('Password changed', {
            userId: user.id,
            email: user.email,
            ip: req.ip,
        });

        res.json({ success: true, message: 'Senha alterada com sucesso. Faça login novamente.' });
    } catch (error) {
        next(error);
    }
});

export default router;
