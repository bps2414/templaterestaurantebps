// ============================================
// Seed — Burger Lite (Starter Plan)
// Público: Lanchonete de bairro, trailer de hambúrguer
// Uso: SEED_TYPE=burger-lite PLAN=starter npx prisma db seed
// Limites: 5 categorias, 30 pratos max (starter)
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedBurgerLite() {
    console.log('🍔 Seeding database — BURGER LITE (Starter)...\n');

    // --- Cleanup ---
    console.log('🧹 Limpando dados antigos...');
    await prisma.dish.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.siteConfig.deleteMany({});
    console.log('✅ Banco limpo.');

    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@lanche.com';
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
    const lanches = await prisma.category.upsert({
        where: { slug: 'lanches' },
        update: {},
        create: { name: 'Lanches', slug: 'lanches', sortOrder: 1 },
    });

    const combos = await prisma.category.upsert({
        where: { slug: 'combos' },
        update: {},
        create: { name: 'Combos', slug: 'combos', sortOrder: 2 },
    });

    const salgados = await prisma.category.upsert({
        where: { slug: 'salgados' },
        update: {},
        create: { name: 'Salgados', slug: 'salgados', sortOrder: 3 },
    });

    const porcoes = await prisma.category.upsert({
        where: { slug: 'porcoes' },
        update: {},
        create: { name: 'Porções', slug: 'porcoes', sortOrder: 4 },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: 'bebidas' },
        update: {},
        create: { name: 'Bebidas', slug: 'bebidas', sortOrder: 5 },
    });

    console.log('✅ 5 categorias criadas');

    // --- Dishes (max 30 no plano Starter) ---
    const dishes = [
        // ── Lanches ──
        {
            name: 'X-Burger',
            slug: 'x-burger-bl',
            description: 'Pão, hambúrguer artesanal, queijo, alface, tomate e maionese da casa.',
            price: 1890,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
            categoryId: lanches.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'X-Bacon',
            slug: 'x-bacon-bl',
            description: 'Pão, hambúrguer, queijo cheddar, bacon, alface, tomate e maionese.',
            price: 2290,
            image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80',
            categoryId: lanches.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'X-Frango',
            slug: 'x-frango-bl',
            description: 'Pão, filé de frango empanado crocante, queijo, alface e maionese.',
            price: 1990,
            image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'X-Tudo',
            slug: 'x-tudo-bl',
            description: 'Pão, hambúrguer, frango, queijo, ovo, bacon, alface, tomate e maionese.',
            price: 2890,
            image: 'https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'Misto Quente',
            slug: 'misto-quente-bl',
            description: 'Pão de leite, presunto e queijo derretido na chapa.',
            price: 790,
            image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 5,
        },
        {
            name: 'Cachorro Quente',
            slug: 'cachorro-quente-bl',
            description: 'Pão, salsicha, purê, batata palha, ervilha, milho e ketchup.',
            price: 1090,
            image: 'https://images.unsplash.com/photo-1612392162858-2b1a0c77b91e?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 6,
        },

        // ── Combos ──
        {
            name: 'Combo X-Burger',
            slug: 'combo-x-burger-bl',
            description: 'X-Burger + Batata Frita pequena + Refrigerante lata.',
            price: 2790,
            image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=600&q=80',
            categoryId: combos.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Combo X-Bacon',
            slug: 'combo-x-bacon-bl',
            description: 'X-Bacon + Batata Frita pequena + Refrigerante lata.',
            price: 3190,
            image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80',
            categoryId: combos.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Combo Família',
            slug: 'combo-familia-bl',
            description: '3 X-Burgers + Batata Frita grande + 3 Refrigerantes lata.',
            price: 7490,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
            categoryId: combos.id,
            featured: false,
            sortOrder: 3,
        },

        // ── Salgados ──
        {
            name: 'Coxinha (3 unidades)',
            slug: 'coxinha-3un',
            description: 'Coxinha de frango com catupiry, frita na hora.',
            price: 890,
            image: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=600&q=80',
            categoryId: salgados.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Pastel (2 unidades)',
            slug: 'pastel-2un-bl',
            description: 'Pastel frito — carne, frango ou queijo. Informe o recheio.',
            price: 790,
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
            categoryId: salgados.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Esfiha (3 unidades)',
            slug: 'esfiha-3un',
            description: 'Esfiha aberta — carne, frango ou queijo. Assada na hora.',
            price: 890,
            image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&q=80',
            categoryId: salgados.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Nuggets (8 unidades)',
            slug: 'nuggets-8un',
            description: 'Nuggets de frango crocantes com molho à escolha.',
            price: 990,
            image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
            categoryId: salgados.id,
            featured: false,
            sortOrder: 4,
        },

        // ── Porções ──
        {
            name: 'Batata Frita',
            slug: 'batata-frita-bl',
            description: 'Batata frita crocante com sal e tempero. Porção media.',
            price: 1290,
            image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
            categoryId: porcoes.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Batata Frita com Cheddar',
            slug: 'batata-cheddar-bl',
            description: 'Batata frita generosa coberta com cheddar cremoso.',
            price: 1690,
            image: 'https://images.unsplash.com/photo-1616645258469-ec681c17f3ee?w=600&q=80',
            categoryId: porcoes.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Onion Rings',
            slug: 'onion-rings-bl',
            description: 'Anéis de cebola empanados e fritos, crocantes por fora.',
            price: 1390,
            image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80',
            categoryId: porcoes.id,
            featured: false,
            sortOrder: 3,
        },

        // ── Bebidas ──
        {
            name: 'Refrigerante Lata',
            slug: 'refri-lata-bl',
            description: 'Coca-Cola, Guaraná, Sprite ou Fanta. 350ml.',
            price: 490,
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Suco de Laranja',
            slug: 'suco-laranja-bl',
            description: 'Suco de laranja natural espremido. 300ml.',
            price: 790,
            image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Água Mineral',
            slug: 'agua-mineral-bl',
            description: 'Com ou sem gás. 500ml.',
            price: 290,
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Milk-Shake',
            slug: 'milkshake-bl',
            description: 'Milk-shake cremoso — chocolate, morango ou baunilha. 400ml.',
            price: 1490,
            image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
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
        restaurant_name: 'Lanche do Zé',
        restaurant_tagline: 'O melhor lanche do bairro',
        restaurant_description: 'Lanches e hambúrgueres artesanais feitos na hora. O ponto de encontro do bairro para um lanche gostoso e sem enrolação.',
        restaurant_address: 'Rua Sete de Setembro, 312 — Vila Nova, Sua Cidade - SP',
        restaurant_phone: '(11) 97777-5432',
        restaurant_email: 'contato@lanchedoze.com.br',
        whatsapp_number: '5511977775432',
        whatsapp_message: 'Oi! Vi o cardápio do Lanche do Zé e quero fazer um pedido!',
        hero_title: 'O melhor lanche do bairro',
        hero_subtitle: 'Feito na hora, com ingredientes frescos. Peça pelo WhatsApp!',
        about_title: 'Sobre Nós',
        about_text: 'Desde 2015 no bairro, o Lanche do Zé é referência em sanduíches artesanais e lanches rápidos de qualidade.',
        about_text_2: 'Cada ingrediente é escolhido com cuidado para garantir sabor e frescor em cada mordida.',
        about_features: JSON.stringify([
            { icon: '🔥', title: 'Feito na Hora', description: 'Nada fica parado — cada pedido é preparado na hora.' },
            { icon: '🥩', title: 'Ingredientes Frescos', description: 'Carne e frango frescos, entregues diariamente.' },
            { icon: '🚴', title: 'Peça pelo WhatsApp', description: 'Delivery rápido pelo WhatsApp — atendemos toda a região.' },
        ]),
        opening_hours: 'Seg–Sáb: 11h–14h / 18h–23h | Dom: 18h–22h',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/lanchedoze',
        facebook_url: 'https://facebook.com/lanchedoze',
        footer_text: '© 2026 Lanche do Zé. Todos os direitos reservados.',
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
    console.log('\n🍔 Seed BURGER LITE concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// Permite execução direta: npx ts-node prisma/seed-burger-lite.ts
if (require.main === module) {
    seedBurgerLite()
        .catch((e) => {
            console.error('❌ Erro no seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
