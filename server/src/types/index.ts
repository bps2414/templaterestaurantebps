import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
