// ============================================
// Plan Middleware — Feature gating by plan level
// ============================================
// Plans: 'essential' (default) | 'professional'
// Stored as SiteConfig key 'site_plan'
// ============================================

import { Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError } from '../utils/errors';

export type PlanType = 'essential' | 'professional';

// PRO-only config keys (cannot be set on essential plan)
export const PRO_CONFIG_KEYS = [
    'logo_url',
    'brand_color',
    'favicon_url',
];

// PRO-only about-content keys
export const PRO_ABOUT_KEYS = [
    'team_members',
];

/**
 * Get the current plan from the database
 */
export async function getCurrentPlan(): Promise<PlanType> {
    try {
        const config = await prisma.siteConfig.findUnique({
            where: { key: 'site_plan' },
        });
        if (config && (config.value === 'essential' || config.value === 'professional')) {
            return config.value as PlanType;
        }
        return 'essential';
    } catch {
        return 'essential';
    }
}

/**
 * Check if the current plan is professional
 */
export async function isProfessional(): Promise<boolean> {
    const plan = await getCurrentPlan();
    return plan === 'professional';
}

/**
 * Middleware: Require professional plan for the route
 * Must be used AFTER requireAuth
 */
export function requireProfessional(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    getCurrentPlan()
        .then(plan => {
            if (plan !== 'professional') {
                return next(new ForbiddenError(
                    'Este recurso requer o Plano Profissional. Entre em contato para fazer upgrade.'
                ));
            }
            next();
        })
        .catch(err => next(err));
}

/**
 * Check if a config key is PRO-only
 */
export function isProConfigKey(key: string): boolean {
    return PRO_CONFIG_KEYS.includes(key);
}

/**
 * Check if an about-content key is PRO-only
 */
export function isProAboutKey(key: string): boolean {
    return PRO_ABOUT_KEYS.includes(key);
}
