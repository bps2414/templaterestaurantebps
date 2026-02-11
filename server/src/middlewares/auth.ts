import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';
import prisma from '../prisma/client';

/**
 * Middleware: Require valid JWT access token
 */
export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token de autenticação não fornecido');
        }

        const token = authHeader.split(' ')[1];
        const payload = authService.verifyAccessToken(token);

        // Verify tokenVersion — immediately invalidates JWTs after password change
        const user = await prisma.adminUser.findUnique({
            where: { id: payload.userId },
            select: { tokenVersion: true },
        });

        if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
            throw new UnauthorizedError('Sessão invalidada. Faça login novamente.');
        }

        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...roles: Role[]) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Não autenticado'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('Permissão insuficiente'));
        }

        next();
    };
}

/**
 * Middleware: Require admin role
 */
export function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    if (!req.user) {
        return next(new UnauthorizedError('Não autenticado'));
    }

    if (req.user.role !== 'ADMIN') {
        return next(new ForbiddenError('Acesso restrito a administradores'));
    }

    next();
}
