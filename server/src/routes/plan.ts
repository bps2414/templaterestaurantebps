// ============================================
// Plan Routes — Current plan info
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { getCurrentPlan, PRO_CONFIG_KEYS, PRO_ABOUT_KEYS } from '../middlewares/plan';

const router = Router();

// GET /api/plan — Public: get current plan info
// Used by frontend to conditionally render PRO features
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await getCurrentPlan();
        const isPro = plan === 'professional';

        res.json({
            success: true,
            data: {
                plan,
                isProfessional: isPro,
                features: {
                    customLogo: isPro,
                    brandColor: isPro,
                    teamSection: isPro,
                    qrCode: isPro,
                    favicon: isPro,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
