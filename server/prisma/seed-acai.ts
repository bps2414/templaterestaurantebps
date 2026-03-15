// ============================================
// Seed — Açaí (Starter Plan)
// Público: Açaízeiro, bowls, sorveteria tropical
// Estilo: Vibrante/tropical — roxo + verde limão
// Uso: SEED_TYPE=acai PLAN=starter npx prisma db seed
// Limites: 5 categorias, 30 pratos max (starter)
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedAcai() {
    console.log('🍇 Seeding database — AÇAÍ (Starter)...\n');

    // --- Cleanup ---
    console.log('🧹 Limpando dados antigos...');
    await prisma.dish.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.siteConfig.deleteMany({});
    console.log('✅ Banco limpo.');

    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@acai.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.adminUser.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash,
            name: 'Administrador',
            role: 'ADMIN',
        },
    });
    console.log(`✅ Admin: ${admin.email}`);

    // --- Categories (max 5 no plano Starter) ---
    const acais = await prisma.category.upsert({
        where: { slug: 'acais' },
        update: {},
        create: { name: 'Açaí', slug: 'acais', sortOrder: 1 },
    });

    const bowls = await prisma.category.upsert({
        where: { slug: 'bowls' },
        update: {},
        create: { name: 'Bowls', slug: 'bowls', sortOrder: 2 },
    });

    const vitaminas = await prisma.category.upsert({
        where: { slug: 'vitaminas' },
        update: {},
        create: { name: 'Vitaminas', slug: 'vitaminas', sortOrder: 3 },
    });

    const lanches = await prisma.category.upsert({
        where: { slug: 'lanches' },
        update: {},
        create: { name: 'Lanches', slug: 'lanches', sortOrder: 4 },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: 'bebidas' },
        update: {},
        create: { name: 'Bebidas', slug: 'bebidas', sortOrder: 5 },
    });

    console.log('✅ 5 categorias criadas');

    // --- Dishes (max 30 no plano Starter) ---
    const dishes = [
        // ── Açaí ──
        {
            name: 'Açaí 300ml',
            slug: 'acai-300ml',
            description: 'Açaí puro cremoso, com granola e 2 adicionais à escolha. 300ml.',
            price: 1490,
            image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
            categoryId: acais.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Açaí 500ml',
            slug: 'acai-500ml',
            description: 'Açaí puro cremoso, com granola e 3 adicionais à escolha. 500ml.',
            price: 2190,
            image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
            categoryId: acais.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Açaí 700ml',
            slug: 'acai-700ml',
            description: 'Açaí puro cremoso, com granola e 4 adicionais à escolha. 700ml.',
            price: 2890,
            image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
            categoryId: acais.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Açaí 1 Litro',
            slug: 'acai-1litro',
            description: 'Açaí puro cremoso com granola e 5 adicionais à escolha. 1 litro.',
            price: 3890,
            image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
            categoryId: acais.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'Açaí Tradicional (copo)',
            slug: 'acai-tradicional',
            description: 'Açaí cremoso com leite ninho, banana, granola e mel. Copo 400ml.',
            price: 1890,
            image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=600&q=80',
            categoryId: acais.id,
            featured: true,
            sortOrder: 5,
        },
        {
            name: 'Açaí com Morango',
            slug: 'acai-morango',
            description: 'Açaí cremoso com morangos frescos, granola e leite em pó. Copo 400ml.',
            price: 2090,
            image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80',
            categoryId: acais.id,
            featured: false,
            sortOrder: 6,
        },

        // ── Bowls ──
        {
            name: 'Bowl Tropical',
            slug: 'bowl-tropical',
            description: 'Base de açaí, manga, abacaxi, coco ralado, granola e mel. 400ml.',
            price: 2490,
            image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=600&q=80',
            categoryId: bowls.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Bowl Power',
            slug: 'bowl-power',
            description: 'Açaí, banana, whey protein, pasta de amendoim, granola e chia. 450ml.',
            price: 2890,
            image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
            categoryId: bowls.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Bowl Frutas Vermelhas',
            slug: 'bowl-frutas-vermelhas',
            description: 'Açaí, morango, framboesa, mirtilho, granola e leite condensado. 400ml.',
            price: 2690,
            image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80',
            categoryId: bowls.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Bowl Kids',
            slug: 'bowl-kids',
            description: 'Açaí, banana, granola, confete colorido e calda de chocolate. 250ml.',
            price: 1590,
            image: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=600&q=80',
            categoryId: bowls.id,
            featured: false,
            sortOrder: 4,
        },

        // ── Vitaminas ──
        {
            name: 'Vitamina de Banana',
            slug: 'vitamina-banana',
            description: 'Banana, leite, mel e canela. 400ml — cremosa e nutritiva.',
            price: 1190,
            image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=600&q=80',
            categoryId: vitaminas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Vitamina de Mamão',
            slug: 'vitamina-mamao',
            description: 'Mamão, leite e um toque de laranja. Leve e refrescante. 400ml.',
            price: 1090,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
            categoryId: vitaminas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Vitamina de Abacate',
            slug: 'vitamina-abacate',
            description: 'Abacate, leite condensado e leite. Cremosa e energética. 400ml.',
            price: 1490,
            image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
            categoryId: vitaminas.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'Vitamina Energética',
            slug: 'vitamina-energetica',
            description: 'Açaí, banana, aveia, mel e pasta de amendoim. 400ml.',
            price: 1790,
            image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=600&q=80',
            categoryId: vitaminas.id,
            featured: false,
            sortOrder: 4,
        },

        // ── Lanches ──
        {
            name: 'Tapioca Doce',
            slug: 'tapioca-doce',
            description: 'Tapioca com pasta de amendoim, banana e mel ou chocolate.',
            price: 1290,
            image: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Tapioca Salgada',
            slug: 'tapioca-salgada',
            description: 'Tapioca com frango desfiado e catupiry ou queijo coalho.',
            price: 1490,
            image: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=600&q=80',
            categoryId: lanches.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Crepioca',
            slug: 'crepioca',
            description: 'Crepioca de ovo e tapioca com recheio doce ou salgado à escolha.',
            price: 1390,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 3,
        },

        // ── Bebidas ──
        {
            name: 'Água de Coco',
            slug: 'agua-de-coco',
            description: 'Água de coco natural gelada. 300ml.',
            price: 790,
            image: 'https://images.unsplash.com/photo-1510932742089-5f1b02de5a3c?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Limonada Suíça',
            slug: 'limonada-suica',
            description: 'Limão taiti, leite condensado, creme de leite e gelo. 400ml.',
            price: 1190,
            image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
            categoryId: bebidas.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Suco de Acerola',
            slug: 'suco-acerola',
            description: 'Suco natural de acerola adoçado com mel. 300ml.',
            price: 990,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Água Mineral',
            slug: 'agua-mineral-ac',
            description: 'Com ou sem gás. 500ml.',
            price: 290,
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 4,
        },
    ];

    for (const dish of dishes) {
        await prisma.dish.upsert({
            where: { slug: dish.slug },
            update: {},
            create: dish,
        });
    }
    console.log(`✅ ${dishes.length} itens do cardápio criados`);

    // --- Site Config ---
    const rawPlan = (process.env.PLAN || 'starter').toLowerCase().trim();
    const validPlan =
        rawPlan === 'professional' ? 'professional' : rawPlan === 'essential' ? 'essential' : 'starter';
    if (rawPlan && rawPlan !== 'starter' && rawPlan !== 'essential' && rawPlan !== 'professional') {
        console.warn(`⚠️  PLAN="${rawPlan}" não é válido. Usando "starter".`);
    }

    const configs: Record<string, string> = {
        site_plan: validPlan,
        restaurant_name: 'Açaí da Vila',
        restaurant_tagline: 'O açaí do seu bairro',
        restaurant_description: 'O melhor açaí da vila — cremoso, fresquinho e cheio de sabor. Bowls personalizados, vitaminas naturais e muito mais para você e sua família.',
        restaurant_address: 'Praça Central, 8 — Vila Tropical, Sua Cidade - SP',
        restaurant_phone: '(11) 95555-6789',
        restaurant_email: 'contato@acaidavila.com.br',
        whatsapp_number: '5511955556789',
        whatsapp_message: 'Oi! Vi o cardápio do Açaí da Vila e quero fazer um pedido! 🍇',
        hero_title: 'Açaí cremoso e bowls tropicais',
        hero_subtitle: 'Fresquinho, natural e cheio de sabor. Peça pelo WhatsApp!',
        about_title: 'Nossa História',
        about_text: 'O Açaí da Vila nasceu do amor por comida saudável e sabores tropicais. Usamos apenas açaí de qualidade, frutas frescas e granola artesanal.',
        about_text_2: 'Cada bowl é montado na hora, com os adicionais que você mais gosta.',
        about_features: JSON.stringify([
            { icon: '🌿', title: 'Natural e Fresco', description: 'Açaí puro, frutas frescas e sem conservantes artificiais.' },
            { icon: '🎨', title: 'Do Seu Jeito', description: 'Monte seu bowl com os adicionais que você ama.' },
            { icon: '⚡', title: 'Energia Total', description: 'Nutrição de verdade para o seu dia a dia.' },
        ]),
        opening_hours: 'Seg–Dom: 10h–22h | Não fechamos nos finais de semana!',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/acaidavila',
        facebook_url: 'https://facebook.com/acaidavila',
        footer_text: '© 2026 Açaí da Vila. Todos os direitos reservados.',
    };

    for (const [key, value] of Object.entries(configs)) {
        await prisma.siteConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
    console.log('✅ Configurações do site criadas');

    const displayPassword = process.env.SEED_ADMIN_PASSWORD ? '***' : 'admin123';
    console.log('\n🍇 Seed AÇAÍ concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// Permite execução direta: npx ts-node prisma/seed-acai.ts
if (require.main === module) {
    seedAcai()
        .catch((e) => {
            console.error('❌ Erro no seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
