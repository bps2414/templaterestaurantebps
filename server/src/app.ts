import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter, authLimiter, uploadLimiter } from './middlewares/rateLimit';
import { csrfSetToken, csrfVerifyToken, getCsrfToken } from './middlewares/csrf';
import logger from './utils/logger';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import dishRoutes from './routes/dishes';
import galleryRoutes from './routes/gallery';
import configRoutes from './routes/config';
import aboutContentRoutes from './routes/aboutContent';
import checkoutRoutes from './routes/checkout';
import uploadRoutes from './routes/upload';
import planRoutes from './routes/plan';

const app = express();

// --- Trust proxy (only in production behind reverse proxy) ---
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// --- Force HTTPS in production ---
if (process.env.NODE_ENV === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.hostname}${req.url}`);
        }
        next();
    });
}

// --- Security Headers ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://js.stripe.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"], // Permite onclick/oninput inline (admin panel)
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com", "https://unpkg.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "*"],
            connectSrc: ["'self'", "https://api.stripe.com"],
            frameSrc: ["'self'", "https://js.stripe.com", "https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === 'production' ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.disable('x-powered-by');

// --- Additional Security Headers ---
app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0'); // Modern browsers use CSP instead
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.APP_URL || 'http://localhost:3000').split(',').map((o: string) => o.trim());
app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked request', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    maxAge: 600, // 10 min preflight cache
}));

// --- Cookie parser ---
app.use(cookieParser());

// --- Logging (sanitized) ---
const morganStream: morgan.StreamOptions = { write: (msg: string) => logger.http(msg.trim()) };
app.use(morgan(
    process.env.NODE_ENV === 'production'
        ? ':remote-addr :method :url :status :response-time ms'
        : 'dev',
    { stream: morganStream }
));

// --- Body parsers ---
// Stripe webhook needs raw body (BEFORE json parser)
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Serve uploaded images (strict: images only, no dir listing, no dotfiles) ---
app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
    // Block path traversal
    if (req.path.includes('..') || req.path.includes('\\')) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    // Only allow image extensions
    const allowedExt = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (!allowedExt.test(req.path)) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
}, express.static(path.join(__dirname, '../assets/uploads'), {
    dotfiles: 'deny',
    maxAge: '7d',
    index: false,
    setHeaders: (res: Response) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Disposition', 'inline');
    },
}));

// --- Serve static frontend ---
app.use(express.static(path.join(__dirname, '../../public'), {
    index: false,
    dotfiles: 'deny',
    maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
}));

// --- Health check ---
app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// --- Ping endpoint (for keep-alive services, returns 204 No Content) ---
app.get('/ping', (_req: Request, res: Response) => {
    res.sendStatus(204);
});

// --- CSRF token endpoint (public) ---
app.get('/api/csrf-token', apiLimiter, csrfSetToken, getCsrfToken);

// --- Set CSRF token for all routes ---
app.use(csrfSetToken);

// --- API Routes (with CSRF protection and rate limiters) ---
app.use('/api/auth', csrfVerifyToken, authLimiter, authRoutes);
app.use('/api/categories', csrfVerifyToken, apiLimiter, categoryRoutes);
app.use('/api/dishes', csrfVerifyToken, apiLimiter, dishRoutes);
app.use('/api/gallery', csrfVerifyToken, apiLimiter, galleryRoutes);
app.use('/api/config', apiLimiter, configRoutes); // No CSRF for public config
app.use('/api/about-content', apiLimiter, aboutContentRoutes); // No CSRF for public GET, CSRF on PUT via middleware
app.use('/api/plan', apiLimiter, planRoutes); // Public GET — no CSRF needed
app.use('/api/checkout', csrfVerifyToken, apiLimiter, checkoutRoutes);
app.use('/api/upload', csrfVerifyToken, uploadLimiter, uploadRoutes);

// --- Serve frontend pages ---
const publicDir = path.join(__dirname, '../../public');

// --- Dynamic sitemap.xml ---
app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const baseUrl = process.env.APP_URL || `${_req.protocol}://${_req.get('host')}`;
    const sitemapPages = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/menu', priority: '0.9', changefreq: 'weekly' },
        { loc: '/gallery', priority: '0.7', changefreq: 'monthly' },
        { loc: '/about', priority: '0.6', changefreq: 'monthly' },
        { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
});

// --- robots.txt ---
app.get('/robots.txt', (_req: Request, res: Response) => {
    const baseUrl = process.env.APP_URL || `${_req.protocol}://${_req.get('host')}`;
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
});

const pages = ['index', 'menu', 'gallery', 'about', 'contact', 'admin', 'buy', 'buy-success'];
pages.forEach(page => {
    const route = page === 'index' ? '/' : `/${page}`;
    app.get(route, (_req: Request, res: Response) => {
        res.sendFile(path.join(publicDir, `${page}.html`));
    });
});

// --- 404 for API ---
app.use('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Endpoint não encontrado' });
});

// --- 404 catch-all (non-API) ---
app.use((_req: Request, res: Response) => {
    res.status(404).sendFile(path.join(publicDir, 'index.html'));
});

// --- Error handler ---
app.use(errorHandler);

export default app;
