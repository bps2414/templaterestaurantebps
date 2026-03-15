// ============================================
// Seed — Pizza Lite (Starter Plan)
// Público: Pizzaria de bairro, tele-entrega local
// Uso: SEED_TYPE=pizza-lite PLAN=starter npx prisma db seed
// Limites: 5 categorias, 30 pratos max (starter)
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedPizzaLite() {
    console.log('🍕 Seeding database — PIZZA LITE (Starter)...\n');

    // --- Cleanup ---
    console.log('🧹 Limpando dados antigos...');
    await prisma.dish.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.siteConfig.deleteMany({});
    console.log('✅ Banco limpo.');

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

    // --- Categories (max 5 no plano Starter) ---
    const pizzasSalgadas = await prisma.category.upsert({
        where: { slug: 'pizzas-salgadas' },
        update: {},
        create: { name: 'Pizzas Salgadas', slug: 'pizzas-salgadas', sortOrder: 1 },
    });

    const pizzasDoces = await prisma.category.upsert({
        where: { slug: 'pizzas-doces' },
        update: {},
        create: { name: 'Pizzas Doces', slug: 'pizzas-doces', sortOrder: 2 },
    });

    const calzones = await prisma.category.upsert({
        where: { slug: 'calzones' },
        update: {},
        create: { name: 'Calzones', slug: 'calzones', sortOrder: 3 },
    });

    const esfihas = await prisma.category.upsert({
        where: { slug: 'esfihas' },
        update: {},
        create: { name: 'Esfihas', slug: 'esfihas', sortOrder: 4 },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: 'bebidas' },
        update: {},
        create: { name: 'Bebidas', slug: 'bebidas', sortOrder: 5 },
    });

    console.log('✅ 5 categorias criadas');

    // --- Dishes (max 30 no plano Starter) ---
    const dishes = [
        // ── Pizzas Salgadas ──
        {
            name: 'Mussarela',
            slug: 'pizza-mussarela',
            description: 'Molho de tomate caseiro, mussarela fatiada e orégano. Grande (35cm).',
            price: 3490,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Calabresa',
            slug: 'pizza-calabresa',
            description: 'Molho de tomate, calabresa fatiada, cebola e orégano. Grande (35cm).',
            price: 3790,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Frango com Catupiry',
            slug: 'pizza-frango-catupiry',
            description: 'Molho de tomate, frango desfiado temperado e catupiry cremoso. Grande (35cm).',
            price: 4190,
            image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'Portuguesa',
            slug: 'pizza-portuguesa',
            description: 'Molho de tomate, presunto, ovos, pimentão, cebola e azeitona. Grande (35cm).',
            price: 4390,
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'Quatro Queijos',
            slug: 'pizza-quatro-queijos',
            description: 'Molho branco, mussarela, provolone, parmesão e catupiry. Grande (35cm).',
            price: 4590,
            image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: false,
            sortOrder: 5,
        },
        {
            name: 'Pepperoni',
            slug: 'pizza-pepperoni',
            description: 'Molho de tomate, mussarela e farto pepperoni importado. Grande (35cm).',
            price: 4790,
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: false,
            sortOrder: 6,
        },
        {
            name: 'Atum',
            slug: 'pizza-atum',
            description: 'Molho de tomate, atum, cebola roxa, azeitona e orégano. Grande (35cm).',
            price: 3990,
            image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: false,
            sortOrder: 7,
        },
        {
            name: 'Margherita',
            slug: 'pizza-margherita',
            description: 'Molho de tomate, mussarela e tomates frescos com manjericão. Grande (35cm).',
            price: 3890,
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80',
            categoryId: pizzasSalgadas.id,
            featured: false,
            sortOrder: 8,
        },

        // ── Pizzas Doces ──
        {
            name: 'Chocolate',
            slug: 'pizza-chocolate',
            description: 'Chocolate ao leite com granulado e leite condensado. Grande (35cm).',
            price: 3790,
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
            categoryId: pizzasDoces.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Banana com Canela',
            slug: 'pizza-banana-canela',
            description: 'Banana fatiada, canela, leite condensado e granola. Grande (35cm).',
            price: 3590,
            image: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=600&q=80',
            categoryId: pizzasDoces.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Romeu e Julieta',
            slug: 'pizza-romeu-julieta',
            description: 'Mussarela e goiabada. A combinação clássica brasileira. Grande (35cm).',
            price: 3690,
            image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80',
            categoryId: pizzasDoces.id,
            featured: true,
            sortOrder: 3,
        },

        // ── Calzones ──
        {
            name: 'Calzone de Frango',
            slug: 'calzone-frango',
            description: 'Massa dobrada recheada com frango, catupiry e milho. Individual.',
            price: 2490,
            image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80',
            categoryId: calzones.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Calzone de Calabresa',
            slug: 'calzone-calabresa',
            description: 'Massa dobrada recheada com calabresa, mussarela e cebola. Individual.',
            price: 2290,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
            categoryId: calzones.id,
            featured: false,
            sortOrder: 2,
        },

        // ── Esfihas ──
        {
            name: 'Esfiha de Carne (3 un)',
            slug: 'esfiha-carne',
            description: 'Esfiha aberta de carne bovina temperada. 3 unidades.',
            price: 1290,
            image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80',
            categoryId: esfihas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Esfiha de Frango (3 un)',
            slug: 'esfiha-frango',
            description: 'Esfiha fechada de frango com cheddar. 3 unidades.',
            price: 1390,
            image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80',
            categoryId: esfihas.id,
            featured: false,
            sortOrder: 2,
        },

        // ── Bebidas ──
        {
            name: 'Refrigerante 2L',
            slug: 'refri-2l-pl',
            description: 'Coca-Cola, Guaraná, Sprite ou Fanta. 2 litros.',
            price: 1090,
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Refrigerante Lata',
            slug: 'refri-lata-pl',
            description: 'Coca-Cola, Guaraná ou Fanta. 350ml.',
            price: 490,
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Suco Caixinha',
            slug: 'suco-caixinha-pl',
            description: 'Del Valle ou equivalente — uva, pêssego, manga ou laranja. 200ml.',
            price: 390,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Água Mineral',
            slug: 'agua-mineral-pl',
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
        restaurant_name: 'Pizza da Esquina',
        restaurant_tagline: 'A pizzaria do seu bairro',
        restaurant_description: 'Pizzas artesanais com massa fina e crocante, feitas toda noite no forno a lenha. A pizzaria de bairro que você merecia ter pertinho de casa.',
        restaurant_address: 'Rua das Acácias, 55 — Jardim Esperança, Sua Cidade - SP',
        restaurant_phone: '(11) 96666-9876',
        restaurant_email: 'contato@pizzadaesquina.com.br',
        whatsapp_number: '5511966669876',
        whatsapp_message: 'Olá! Vi o cardápio da Pizza da Esquina e quero fazer um pedido!',
        hero_title: 'Pizza de verdade, entregue na sua porta',
        hero_subtitle: 'Massa artesanal e ingredientes frescos. Peça pelo WhatsApp!',
        about_title: 'Feita com Amor',
        about_text: 'A Pizza da Esquina nasceu para ser a pizzaria do bairro — aquela que você liga antes do filme e chega moreninha e gostosa na sua porta.',
        about_text_2: 'Massa sovada à mão, molho caseiro de tomate e ingredientes frescos em cada pizza.',
        about_features: JSON.stringify([
            { icon: '🔥', title: 'Forno a Lenha', description: 'Assadas no forno a lenha para aquela crocância perfeita.' },
            { icon: '🍅', title: 'Molho Caseiro', description: 'Molho de tomate preparado diariamente, sem conservantes.' },
            { icon: '🚀', title: 'Entrega Rápida', description: '40 minutos ou menos — ou a próxima é por nossa conta.' },
        ]),
        opening_hours: 'Ter–Dom: 18h–23h30 | Seg: Fechado',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/pizzadaesquina',
        facebook_url: 'https://facebook.com/pizzadaesquina',
        footer_text: '© 2026 Pizza da Esquina. Todos os direitos reservados.',
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
    console.log('\n🍕 Seed PIZZA LITE concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// Permite execução direta: npx ts-node prisma/seed-pizza-lite.ts
if (require.main === module) {
    seedPizzaLite()
        .catch((e) => {
            console.error('❌ Erro no seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
