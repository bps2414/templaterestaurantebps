#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function changePlan() {
    const plan = process.argv[2] as 'essential' | 'professional';

    if (!plan || !['essential', 'professional'].includes(plan)) {
        console.error('❌ Uso: npm run change-plan <essential|professional>');
        process.exit(1);
    }

    await prisma.siteConfig.upsert({
        where: { key: 'site_plan' },
        update: { value: plan },
        create: { key: 'site_plan', value: plan },
    });

    console.log(`✅ Plano alterado para: ${plan.toUpperCase()}`);
    process.exit(0);
}

changePlan().catch(console.error);
