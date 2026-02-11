// ============================================
// CSRF Protection Middleware
// Double Submit Cookie Pattern (stateless)
// ============================================

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate and set CSRF token cookie
 */
export function csrfSetToken(req: Request, res: Response, next: NextFunction) {
    // Skip if already has valid token
    if (req.cookies[CSRF_COOKIE_NAME]) {
        return next();
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be readable by JS for Double Submit
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // 'strict' blocks same-site POST forms
        maxAge: 3600000, // 1 hour
    });

    next();
}

/**
 * Verify CSRF token on state-changing operations
 */
export function csrfVerifyToken(req: Request, res: Response, next: NextFunction) {
    // Skip for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];
    const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;

    // Debug log in production (temporary - remove after fixing)
    if (!tokenFromCookie || !tokenFromHeader) {
        console.error('CSRF validation failed:', {
            hasCookie: !!tokenFromCookie,
            hasHeader: !!tokenFromHeader,
            origin: req.headers.origin,
            referer: req.headers.referer,
        });
        return res.status(403).json({
            success: false,
            error: 'CSRF token missing',
        });
    }

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(tokenFromCookie), Buffer.from(tokenFromHeader))) {
        return res.status(403).json({
            success: false,
            error: 'Invalid CSRF token',
        });
    }

    next();
}

/**
 * Get CSRF token endpoint (public)
 */
export function getCsrfToken(req: Request, res: Response) {
    const token = req.cookies[CSRF_COOKIE_NAME];
    res.json({ success: true, token });
}
