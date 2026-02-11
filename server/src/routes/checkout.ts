// ============================================
// Checkout Routes — Stripe for template purchase
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import prisma from '../prisma/client';
import logger from '../utils/logger';
import { z } from 'zod';

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const TEMPLATE_PRICE_CENTS = parseInt(process.env.TEMPLATE_PRICE_CENTS || '29700', 10); // R$297,00
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_PLACEHOLDER') {
    stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any });
}

// Input validation schema
const checkoutSchema = z.object({
    email: z.string().email('Email inválido').max(255),
    name: z.string().max(200).optional(),
});

// POST /api/checkout/session — Create Stripe Checkout Session
router.post('/session', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!stripe) {
            return res.status(503).json({ success: false, error: 'Pagamento não configurado. Configure STRIPE_SECRET_KEY no .env' });
        }

        const data = checkoutSchema.parse(req.body);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: data.email,
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Template Premium — Site para Restaurante',
                            description: 'Template completo com painel admin, cardápio dinâmico, galeria, integração WhatsApp e mais.',
                        },
                        unit_amount: TEMPLATE_PRICE_CENTS,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${APP_URL}/buy-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${APP_URL}/buy?canceled=true`,
            metadata: {
                buyerName: data.name || '',
                buyerEmail: data.email,
            },
        });

        // Save pending purchase
        await prisma.templatePurchase.create({
            data: {
                email: data.email,
                name: data.name || null,
                stripeSessionId: session.id,
                amount: TEMPLATE_PRICE_CENTS,
                status: 'pending',
            },
        });

        logger.info('Checkout session created', { sessionId: session.id });
        res.json({ success: true, data: { url: session.url, sessionId: session.id } });
    } catch (error) {
        next(error);
    }
});

// POST /api/checkout/webhook — Stripe Webhook (signature verified)
router.post('/webhook', async (req: Request, res: Response) => {
    if (!stripe) {
        return res.status(503).send('Stripe not configured');
    }

    if (!STRIPE_WEBHOOK_SECRET) {
        logger.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(503).send('Webhook secret not configured');
    }

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
        logger.warn('Webhook received without stripe-signature header');
        return res.status(400).send('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        logger.error('Webhook signature verification failed', { error: err.message });
        return res.status(400).send('Webhook signature verification failed');
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.templatePurchase.updateMany({
            where: { stripeSessionId: session.id },
            data: {
                status: 'completed',
                stripePaymentId: session.payment_intent as string,
            },
        });

        logger.info('Template purchase completed', { sessionId: session.id });
    }

    res.json({ received: true });
});

export default router;
