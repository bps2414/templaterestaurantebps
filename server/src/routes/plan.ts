// ============================================
// Plan Routes — Current plan info
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { getCurrentPlan, STARTER_LIMITS } from '../middlewares/plan';

const router = Router();

// GET /api/plan — Public: get current plan info
// Used by frontend to conditionally render PRO features
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const plan = await getCurrentPlan();
        const isPro = plan === 'professional';
        const isStarterPlan = plan === 'starter';

        res.json({
            success: true,
            data: {
                plan,
                isProfessional: isPro,
                isStarter: isStarterPlan,
                features: {
                    customLogo: isPro,
                    brandColor: isPro,
                    teamSection: isPro,
                    qrCode: isPro,
                    favicon: isPro,
                    gallery: !isStarterPlan,
                    aboutPage: !isStarterPlan,
                    maxDishes: isStarterPlan ? STARTER_LIMITS.maxDishes : null,
                    maxCategories: isStarterPlan ? STARTER_LIMITS.maxCategories : null,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
