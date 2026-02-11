// ============================================
// TEMPORARY SEED ROUTE — Delete after first use
// ============================================

import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';

const router = Router();

// GET /api/seed — Run database seed (REMOVE AFTER FIRST USE)
router.get('/', (req: Request, res: Response) => {
    try {
        // Security: only allow in production if NODE_ENV is set correctly
        if (process.env.NODE_ENV !== 'production') {
            return res.status(403).json({
                success: false,
                error: 'Seed endpoint only available in production'
            });
        }

        // Run seed
        const output = execSync('npx prisma db seed', {
            encoding: 'utf-8',
            env: process.env
        });

        res.json({
            success: true,
            message: 'Database seeded successfully',
            output: output.substring(0, 500) // Truncate for safety
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Seed failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
