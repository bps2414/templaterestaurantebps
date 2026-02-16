// ============================================
// Seed — Hamburgueria demo
// Uso: SEED_TYPE=hamburgueria npx prisma db seed
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedHamburgueria() {
    console.log('🍔 Seeding database — HAMBURGUERIA...\n');

    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hamburgueria.com';
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
    const hamburgueres = await prisma.category.upsert({
        where: { slug: 'hamburgueres' },
        update: {},
        create: { name: 'Hambúrgueres', slug: 'hamburgueres', sortOrder: 1 },
    });

    const combos = await prisma.category.upsert({
        where: { slug: 'combos' },
        update: {},
        create: { name: 'Combos', slug: 'combos', sortOrder: 2 },
    });

    const acompanhamentos = await prisma.category.upsert({
        where: { slug: 'acompanhamentos' },
        update: {},
        create: { name: 'Acompanhamentos', slug: 'acompanhamentos', sortOrder: 3 },
    });

    const sobremesas = await prisma.category.upsert({
        where: { slug: 'sobremesas' },
        update: {},
        create: { name: 'Sobremesas', slug: 'sobremesas', sortOrder: 4 },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: 'bebidas' },
        update: {},
        create: { name: 'Bebidas', slug: 'bebidas', sortOrder: 5 },
    });

    console.log('✅ Categorias criadas');

    // --- Dishes ---
    const dishes = [
        // ── Hambúrgueres ──
        {
            name: 'X-Burger Clássico',
            slug: 'x-burger-classico',
            description: 'Pão brioche, blend bovino 180g, queijo cheddar, alface, tomate e molho especial da casa.',
            price: 2690,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
            categoryId: hamburgueres.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'X-Bacon',
            slug: 'x-bacon',
            description: 'Pão brioche, blend bovino 180g, queijo cheddar, bacon crocante, alface, tomate e maionese artesanal.',
            price: 3190,
            image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80',
            categoryId: hamburgueres.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Smash Burger Duplo',
            slug: 'smash-burger-duplo',
            description: 'Pão smash, 2 carnes prensadas 90g cada, queijo cheddar derretido, cebola caramelizada e pickles.',
            price: 3490,
            image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80',
            categoryId: hamburgueres.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'X-Salada',
            slug: 'x-salada',
            description: 'Pão brioche, blend bovino 180g, queijo prato, alface americana, tomate, cebola roxa e maionese verde.',
            price: 2490,
            image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80',
            categoryId: hamburgueres.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'X-Egg Bacon',
            slug: 'x-egg-bacon',
            description: 'Pão brioche, blend bovino 180g, ovo na chapa, bacon, queijo cheddar e molho barbecue.',
            price: 3390,
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
            categoryId: hamburgueres.id,
            featured: false,
            sortOrder: 5,
        },
        {
            name: 'Burger Costela',
            slug: 'burger-costela',
            description: 'Pão australiano, blend de costela desfiada 200g, queijo provolone, onion rings e molho chipotle.',
            price: 3990,
            image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&q=80',
            categoryId: hamburgueres.id,
            featured: false,
            sortOrder: 6,
        },

        // ── Combos ──
        {
            name: 'Combo X-Burger',
            slug: 'combo-x-burger',
            description: 'X-Burger Clássico + Batata Frita média + Refrigerante lata.',
            price: 3990,
            image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=600&q=80',
            categoryId: combos.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Combo Smash',
            slug: 'combo-smash',
            description: 'Smash Burger Duplo + Onion Rings + Milkshake 300ml.',
            price: 4990,
            image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80',
            categoryId: combos.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Combo Família',
            slug: 'combo-familia',
            description: '4 X-Burgers + 2 Batatas Grandes + 4 Refrigerantes lata. Serve até 4 pessoas.',
            price: 11990,
            image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
            categoryId: combos.id,
            featured: false,
            sortOrder: 3,
        },

        // ── Acompanhamentos ──
        {
            name: 'Batata Frita',
            slug: 'batata-frita',
            description: 'Porção generosa de batatas fritas crocantes com sal e tempero da casa.',
            price: 1490,
            image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
            categoryId: acompanhamentos.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Onion Rings',
            slug: 'onion-rings',
            description: 'Anéis de cebola empanados crocantes com molho ranch.',
            price: 1690,
            image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80',
            categoryId: acompanhamentos.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Nuggets (10un)',
            slug: 'nuggets-10',
            description: '10 nuggets de frango crocantes com molho barbecue ou mostarda e mel.',
            price: 1890,
            image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
            categoryId: acompanhamentos.id,
            featured: false,
            sortOrder: 3,
        },

        // ── Sobremesas ──
        {
            name: 'Milkshake Ovomaltine',
            slug: 'milkshake-ovomaltine',
            description: 'Milkshake cremoso de Ovomaltine com chantilly. 400ml.',
            price: 1890,
            image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Brownie com Sorvete',
            slug: 'brownie-sorvete',
            description: 'Brownie quente de chocolate com sorvete de creme e calda de chocolate.',
            price: 1690,
            image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80',
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 2,
        },

        // ── Bebidas ──
        {
            name: 'Refrigerante Lata',
            slug: 'refrigerante-lata',
            description: 'Coca-Cola, Guaraná, Sprite ou Fanta. 350ml.',
            price: 690,
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Suco Natural',
            slug: 'suco-natural',
            description: 'Laranja, abacaxi, maracujá ou limão. 300ml.',
            price: 990,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Água Mineral',
            slug: 'agua-mineral',
            description: 'Com ou sem gás. 500ml.',
            price: 490,
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 3,
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
        restaurant_name: 'Burger House',
        restaurant_tagline: 'Os melhores burgers da cidade',
        restaurant_description: 'Hambúrgueres artesanais feitos com ingredientes selecionados. Blend exclusivo, pão artesanal e molhos da casa. Do smash ao costela, cada burger é uma explosão de sabor.',
        restaurant_address: 'Av. Principal, 456 — Centro, São Paulo - SP',
        restaurant_phone: '(11) 99999-7777',
        restaurant_email: 'contato@burgerhouse.com.br',
        whatsapp_number: '5511999997777',
        whatsapp_message: 'Olá! Vi o site da Burger House e gostaria de fazer um pedido!',
        hero_title: 'Hambúrgueres artesanais feitos na brasa',
        hero_subtitle: 'Blend exclusivo, pão artesanal e molhos da casa. Peça pelo WhatsApp!',
        about_title: 'Nossa História',
        about_text: 'A Burger House nasceu da paixão por hambúrgueres de verdade. Nosso blend é preparado diariamente com cortes selecionados, o pão é artesanal e os molhos são receita da casa. Cada burger é feito na hora, na brasa, do jeito que tem que ser.',
        about_text_2: 'Cada ingrediente é selecionado a dedo para garantir a melhor experiência em cada mordida.',
        about_features: JSON.stringify([
            { icon: '🔥', title: 'Na Brasa', description: 'Todos os burgers são grelhados na brasa, garantindo sabor defumado e suculência.' },
            { icon: '🥩', title: 'Blend Exclusivo', description: 'Nosso blend combina cortes nobres para o equilíbrio perfeito de sabor e textura.' },
            { icon: '🍞', title: 'Pão Artesanal', description: 'Pão brioche feito na casa, macio por dentro e crocante por fora.' },
        ]),
        team_members: JSON.stringify([
            { name: 'Carlos Lima', role: 'Pitmaster', image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop' },
            { name: 'Juliana Reis', role: 'Chef de Cozinha', image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop' },
        ]),
        opening_hours: 'Ter-Dom: 18h–23h | Sex-Sáb: 18h–00h | Seg: Fechado',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/burgerhouse',
        facebook_url: 'https://facebook.com/burgerhouse',
        footer_text: '© 2026 Burger House. Todos os direitos reservados.',
    };

    // Adicionar team_members apenas se for plano Professional
    if (validPlan === 'professional') {
        configs.team_members = JSON.stringify([
            { name: 'Carlos Lima', role: 'Pitmaster', image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop' },
            { name: 'Juliana Reis', role: 'Chef de Cozinha', image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop' },
        ]);
    }

    for (const [key, value] of Object.entries(configs)) {
        await prisma.siteConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
    console.log('✅ Configurações do site criadas');

    const displayPassword = process.env.SEED_ADMIN_PASSWORD ? '***' : 'admin123';
    console.log('\n🍔 Seed HAMBURGUERIA concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// Permite execução direta: npx ts-node prisma/seed-hamburgueria.ts
if (require.main === module) {
    seedHamburgueria()
        .catch((e) => {
            console.error('❌ Erro no seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
