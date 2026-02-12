// ============================================
// Seed — Pizzaria demo
// Uso: SEED_TYPE=pizzaria npx prisma db seed
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedPizzaria() {
    console.log('🍕 Seeding database — PIZZARIA...\n');

    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@pizzaria.com';
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

    // --- Categories ---
    const tradicionais = await prisma.category.upsert({
        where: { slug: 'pizzas-tradicionais' },
        update: {},
        create: { name: 'Pizzas Tradicionais', slug: 'pizzas-tradicionais', sortOrder: 1 },
    });

    const especiais = await prisma.category.upsert({
        where: { slug: 'pizzas-especiais' },
        update: {},
        create: { name: 'Pizzas Especiais', slug: 'pizzas-especiais', sortOrder: 2 },
    });

    const doces = await prisma.category.upsert({
        where: { slug: 'pizzas-doces' },
        update: {},
        create: { name: 'Pizzas Doces', slug: 'pizzas-doces', sortOrder: 3 },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: 'bebidas' },
        update: {},
        create: { name: 'Bebidas', slug: 'bebidas', sortOrder: 4 },
    });

    const porcoes = await prisma.category.upsert({
        where: { slug: 'porcoes' },
        update: {},
        create: { name: 'Porções', slug: 'porcoes', sortOrder: 5 },
    });

    console.log('✅ Categorias criadas');

    // --- Dishes ---
    const dishes = [
        // ── Pizzas Tradicionais ──
        {
            name: 'Margherita',
            slug: 'margherita',
            description: 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite. Clássica italiana.',
            price: 3990,
            categoryId: tradicionais.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Calabresa',
            slug: 'calabresa',
            description: 'Molho de tomate, mussarela, calabresa fatiada e cebola.',
            price: 3590,
            categoryId: tradicionais.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Portuguesa',
            slug: 'portuguesa',
            description: 'Molho de tomate, mussarela, presunto, ovos, cebola, ervilha e azeitona.',
            price: 4290,
            categoryId: tradicionais.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'Frango com Catupiry',
            slug: 'frango-catupiry',
            description: 'Molho de tomate, mussarela, frango desfiado e catupiry cremoso.',
            price: 4290,
            categoryId: tradicionais.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'Quatro Queijos',
            slug: 'quatro-queijos',
            description: 'Molho de tomate, mussarela, provolone, gorgonzola e parmesão.',
            price: 4590,
            categoryId: tradicionais.id,
            featured: false,
            sortOrder: 5,
        },
        {
            name: 'Pepperoni',
            slug: 'pepperoni',
            description: 'Molho de tomate, mussarela e pepperoni fatiado com orégano.',
            price: 4190,
            categoryId: tradicionais.id,
            featured: true,
            sortOrder: 6,
        },

        // ── Pizzas Especiais ──
        {
            name: 'Filé Mignon com Cheddar',
            slug: 'file-mignon-cheddar',
            description: 'Molho de tomate, mussarela, tiras de filé mignon, cheddar cremoso e bacon crocante.',
            price: 5990,
            categoryId: especiais.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Camarão',
            slug: 'camarao',
            description: 'Molho de tomate, mussarela, camarões salteados no azeite com alho e catupiry.',
            price: 6490,
            categoryId: especiais.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Lombo Canadense',
            slug: 'lombo-canadense',
            description: 'Molho de tomate, mussarela, lombo canadense, catupiry e cebola caramelizada.',
            price: 5490,
            categoryId: especiais.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Vegetariana',
            slug: 'vegetariana',
            description: 'Molho de tomate, mussarela, brócolis, palmito, champignon, tomate seco e rúcula.',
            price: 4590,
            categoryId: especiais.id,
            featured: false,
            sortOrder: 4,
        },

        // ── Pizzas Doces ──
        {
            name: 'Chocolate com Morango',
            slug: 'chocolate-morango',
            description: 'Chocolate ao leite derretido, morangos frescos e granulado. Borda com chocolate.',
            price: 4290,
            categoryId: doces.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Romeu e Julieta',
            slug: 'romeu-julieta',
            description: 'Goiabada cremosa com queijo minas derretido. Um clássico brasileiro.',
            price: 3890,
            categoryId: doces.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Banana com Canela',
            slug: 'banana-canela',
            description: 'Banana fatiada, canela, açúcar, leite condensado e mussarela.',
            price: 3690,
            categoryId: doces.id,
            featured: false,
            sortOrder: 3,
        },

        // ── Porções ──
        {
            name: 'Pão de Alho (6un)',
            slug: 'pao-de-alho',
            description: 'Pãezinhos de alho crocantes com manteiga temperada e ervas. Saem quentinhos do forno.',
            price: 1490,
            categoryId: porcoes.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Bolinho de Queijo (10un)',
            slug: 'bolinho-queijo',
            description: 'Bolinhos de queijo empanados e fritos, crocantes por fora e cremosos por dentro.',
            price: 1890,
            categoryId: porcoes.id,
            featured: false,
            sortOrder: 2,
        },

        // ── Bebidas ──
        {
            name: 'Refrigerante 2L',
            slug: 'refrigerante-2l',
            description: 'Coca-Cola, Guaraná ou Sprite. 2 litros.',
            price: 1290,
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Refrigerante Lata',
            slug: 'refrigerante-lata-pizza',
            description: 'Coca-Cola, Guaraná, Sprite ou Fanta. 350ml.',
            price: 690,
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Suco Natural',
            slug: 'suco-natural-pizza',
            description: 'Laranja, abacaxi, maracujá ou limão. 300ml.',
            price: 990,
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Água Mineral',
            slug: 'agua-mineral-pizza',
            description: 'Com ou sem gás. 500ml.',
            price: 490,
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
    const rawPlan = (process.env.PLAN || 'essential').toLowerCase().trim();
    const validPlan = rawPlan === 'professional' ? 'professional' : 'essential';
    if (rawPlan && rawPlan !== 'essential' && rawPlan !== 'professional') {
        console.warn(`⚠️  PLAN="${rawPlan}" não é válido. Usando "essential".`);
    }

    const configs: Record<string, string> = {
        site_plan: validPlan,
        restaurant_name: 'Pizza Forno & Massa',
        restaurant_tagline: 'Pizza artesanal de verdade',
        restaurant_description: 'Massa fermentada por 72 horas, molho de tomates italianos e ingredientes selecionados. Cada pizza é assada no forno a lenha, com amor e tradição.',
        restaurant_address: 'Rua Italia, 789 — Vila Mariana, São Paulo - SP',
        restaurant_phone: '(11) 99999-6666',
        restaurant_email: 'contato@fornoemassa.com.br',
        whatsapp_number: '5511999996666',
        whatsapp_message: 'Olá! Vi o site da Pizza Forno & Massa e gostaria de fazer um pedido!',
        hero_title: 'Pizza artesanal direto do forno a lenha',
        hero_subtitle: 'Massa fermentada 72h, molho artesanal e ingredientes premium. Peça a sua!',
        about_title: 'Nossa Tradição',
        about_text: 'A Pizza Forno & Massa nasceu do sonho de trazer a verdadeira pizza artesanal para o bairro. Nossa massa é fermentada naturalmente por 72 horas, o molho é feito com tomates selecionados e cada pizza é assada no forno a lenha a 400°C. Tradição italiana com sabor brasileiro.',
        about_text_2: 'Tradição italiana com ingredientes brasileiros selecionados, em cada fatia.',
        about_features: JSON.stringify([
            { icon: '🔥', title: 'Forno a Lenha', description: 'Cada pizza é assada a 400°C no forno a lenha, garantindo borda crocante e interior macio.' },
            { icon: '🍅', title: 'Molho Artesanal', description: 'Molho feito com tomates italianos San Marzano, ervas frescas e azeite extra virgem.' },
            { icon: '⏰', title: 'Massa 72h', description: 'Massa fermentada naturalmente por 72 horas para máximo sabor e digestibilidade.' },
        ]),
        team_members: JSON.stringify([
            { name: 'Giovanni Rossi', role: 'Pizzaiolo Chefe', image: '' },
            { name: 'Maria Fernanda', role: 'Confeiteira', image: '' },
        ]),
        opening_hours: 'Ter-Dom: 18h–23h30 | Sex-Sáb: 18h–00h | Seg: Fechado',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/fornoemassa',
        facebook_url: 'https://facebook.com/fornoemassa',
        footer_text: '© 2026 Pizza Forno & Massa. Todos os direitos reservados.',
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
    console.log('\n🍕 Seed PIZZARIA concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// Permite execução direta: npx ts-node prisma/seed-pizzaria.ts
if (require.main === module) {
    seedPizzaria()
        .catch((e) => {
            console.error('❌ Erro no seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
