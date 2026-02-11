// ============================================
// Structured Logger — Winston
// ============================================

import winston from 'winston';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${stack || message}${metaStr}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    defaultMeta: { service: 'restaurant-template' },
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
    ),
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production'
                ? combine(json())
                : combine(colorize(), devFormat),
        }),
    ],
});

if (process.env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
            format: combine(json()),
        })
    );
}

export default logger;
