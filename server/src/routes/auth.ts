// ============================================
// Auth Routes — Admin login/logout/refresh
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { requireAuth } from '../middlewares/auth';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import prisma from '../prisma/client';

const router = Router();

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
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

export default router;
