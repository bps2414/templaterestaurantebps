import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma/client';
import { JwtPayload, TokenPair } from '../types';
import { UnauthorizedError, TooManyRequestsError } from '../utils/errors';
import { Role } from '@prisma/client';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-replace-me';
const JWT_ACCESS_EXP = process.env.JWT_ACCESS_EXP || '2h';
const JWT_REFRESH_EXP = process.env.JWT_REFRESH_EXP || '30d';
const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory brute force tracker (per-IP)
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

// Warn on startup if JWT_SECRET is default
if (JWT_SECRET === 'dev-secret-replace-me' && process.env.NODE_ENV === 'production') {
    logger.error('CRITICAL: JWT_SECRET is using default value in production! Set a strong secret.');
    process.exit(1);
}

function generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: JWT_ACCESS_EXP as any };
    return jwt.sign(payload as object, JWT_SECRET, options);
}

function generateRefreshToken(): string {
    return uuidv4();
}

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function verifyAccessToken(token: string): JwtPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        throw new UnauthorizedError('Token inválido ou expirado');
    }
}

function parseDuration(dur: string): number {
    const match = dur.match(/^(\d+)(m|h|d)$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000;
    const val = parseInt(match[1]);
    switch (match[2]) {
        case 'm': return val * 60 * 1000;
        case 'h': return val * 60 * 60 * 1000;
        case 'd': return val * 24 * 60 * 60 * 1000;
        default: return 30 * 24 * 60 * 60 * 1000;
    }
}

function checkBruteForce(ip: string): void {
    const attempt = loginAttempts.get(ip);
    if (!attempt) return;

    // Check if locked
    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
        const remainingMin = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
        logger.warn('Brute force lock active', { ip, remainingMin });
        throw new TooManyRequestsError(
            `Conta bloqueada por excesso de tentativas. Tente novamente em ${remainingMin} minutos.`
        );
    }

    // Reset if window expired
    if (Date.now() - attempt.firstAttempt > LOCK_DURATION_MS) {
        loginAttempts.delete(ip);
    }
}

function recordFailedLogin(ip: string): void {
    const attempt = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
    attempt.count++;

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
        attempt.lockedUntil = Date.now() + LOCK_DURATION_MS;
        logger.warn('Account locked due to brute force', { ip, attempts: attempt.count });
    }

    loginAttempts.set(ip, attempt);
}

function clearFailedLogins(ip: string): void {
    loginAttempts.delete(ip);
}

// Cleanup old entries every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, attempt] of loginAttempts.entries()) {
        if (now - attempt.firstAttempt > LOCK_DURATION_MS * 2) {
            loginAttempts.delete(ip);
        }
    }
}, 30 * 60 * 1000);

export const authService = {
    /**
     * Admin Login with brute force protection
     */
    async login(data: {
        email: string;
        password: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        const ip = data.ipAddress || 'unknown';

        // Check brute force lock
        checkBruteForce(ip);

        const user = await prisma.adminUser.findUnique({
            where: { email: data.email.toLowerCase().trim() },
        });

        if (!user) {
            // Constant-time: hash a dummy password to prevent timing attacks
            await bcrypt.hash('dummy-password', BCRYPT_ROUNDS);
            recordFailedLogin(ip);
            throw new UnauthorizedError('Email ou senha incorretos');
        }

        const passwordValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!passwordValid) {
            recordFailedLogin(ip);
            logger.warn('Failed login attempt', { ip, email: user.email });
            throw new UnauthorizedError('Email ou senha incorretos');
        }

        // Success: clear failed attempts
        clearFailedLogins(ip);

        const tokens = await this.createSession(user.id, user.email, user.role, data.ipAddress, data.userAgent);

        logger.info('Admin login successful', { ip, userId: user.id });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            ...tokens,
        };
    },

    /**
     * Create session with token pair (refresh token stored as hash)
     */
    async createSession(
        userId: string,
        email: string,
        role: Role,
        ipAddress?: string,
        userAgent?: string
    ): Promise<TokenPair> {
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + parseDuration(JWT_REFRESH_EXP as string));

        // Limit concurrent sessions per user (max 5)
        const sessions = await prisma.session.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
        if (sessions.length >= 5) {
            await prisma.session.delete({ where: { id: sessions[0].id } });
        }

        await prisma.session.create({
            data: {
                userId,
                refreshToken,
                refreshTokenHash,
                ipAddress,
                userAgent,
                expiresAt,
            },
        });

        const accessToken = generateAccessToken({ userId, email, role });
        return { accessToken, refreshToken };
    },

    /**
     * Refresh token rotation (invalidates old token)
     */
    async refreshTokens(currentRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<TokenPair> {
        const session = await prisma.session.findUnique({
            where: { refreshToken: currentRefreshToken },
            include: { user: true },
        });

        if (!session) {
            throw new UnauthorizedError('Refresh token inválido');
        }

        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { id: session.id } });
            throw new UnauthorizedError('Refresh token expirado');
        }

        // Delete old session (rotation)
        await prisma.session.delete({ where: { id: session.id } });

        return this.createSession(
            session.user.id,
            session.user.email,
            session.user.role,
            ipAddress,
            userAgent
        );
    },

    /**
     * Logout — invalidate refresh token
     */
    async logout(refreshToken: string) {
        const session = await prisma.session.findUnique({ where: { refreshToken } });
        if (session) {
            await prisma.session.delete({ where: { id: session.id } });
        }
    },

    /**
     * Logout all sessions for a user
     */
    async logoutAll(userId: string) {
        await prisma.session.deleteMany({ where: { userId } });
    },

    /**
     * Cleanup expired sessions (call via cron/interval)
     */
    async cleanupExpiredSessions() {
        const result = await prisma.session.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        if (result.count > 0) {
            logger.info('Cleaned up expired sessions', { count: result.count });
        }
    },

    /**
     * Hash password (used by seed)
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, BCRYPT_ROUNDS);
    },

    verifyAccessToken,
};

// Cleanup expired sessions every hour
setInterval(() => {
    authService.cleanupExpiredSessions().catch(() => { });
}, 60 * 60 * 1000);
