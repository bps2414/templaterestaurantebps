import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import multer from 'multer';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Sanitized log metadata (never log full body/headers)
    const logMeta = {
        path: _req.path,
        method: _req.method,
        ip: _req.ip,
    };

    if (err instanceof AppError) {
        logger.warn(`AppError: ${err.message}`, { ...logMeta, statusCode: err.statusCode });
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // Multer file upload errors
    if (err instanceof multer.MulterError) {
        let message = 'Erro no upload do arquivo';
        if (err.code === 'LIMIT_FILE_SIZE') message = 'Arquivo muito grande. Máximo: 2MB';
        if (err.code === 'LIMIT_FILE_COUNT') message = 'Apenas 1 arquivo por vez';
        if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Campo de arquivo inesperado';

        logger.warn(`MulterError: ${err.code}`, logMeta);
        res.status(400).json({ success: false, error: message });
        return;
    }

    // Prisma errors (never expose internal details)
    if ((err as any).code === 'P2002') {
        res.status(409).json({
            success: false,
            error: 'Registro duplicado. Este recurso já existe.',
        });
        return;
    }

    if ((err as any).code === 'P2025') {
        res.status(404).json({
            success: false,
            error: 'Recurso não encontrado.',
        });
        return;
    }

    // Zod validation errors
    if (err.name === 'ZodError') {
        const zodErr = err as any;
        res.status(400).json({
            success: false,
            error: 'Dados inválidos',
            details: zodErr.errors?.map((e: any) => ({
                field: e.path?.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ success: false, error: 'Origem não permitida' });
        return;
    }

    // JSON parse errors
    if ((err as any).type === 'entity.parse.failed') {
        res.status(400).json({ success: false, error: 'JSON inválido' });
        return;
    }

    // Generic error — NEVER expose stack trace or internal details
    logger.error('Unhandled error', {
        ...logMeta,
        error: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
    });
}
