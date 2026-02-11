import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Key generator using IP + optional path grouping
const keyGenerator = (req: Request): string => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return ip;
};

// Generic API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, error: 'Muitas requisições. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
});

// Strict limiter for auth endpoints (login/refresh/logout)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 auth attempts per 15 min
    message: { success: false, error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skipSuccessfulRequests: false,
});

// Upload limiter (prevent spam uploads)
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 uploads per hour
    message: { success: false, error: 'Muitos uploads. Tente novamente mais tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
});

// NOTE: For production with Redis, use rate-limit-redis store:
// import RedisStore from 'rate-limit-redis';
// import Redis from 'ioredis';
// const redisClient = new Redis(process.env.REDIS_URL);
// store: new RedisStore({ sendCommand: (...args) => redisClient.call(...args) })
