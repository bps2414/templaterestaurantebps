// ============================================
// Seed — Restaurant Lite (Starter Plan)
// Público: Pensão, self-service, comida caseira
// Uso: SEED_TYPE=restaurant-lite PLAN=starter npx prisma db seed
// Limites: 5 categorias, 30 pratos max (starter)
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedRestaurantLite() {
    console.log('🍽  Seeding database — RESTAURANT LITE (Starter)...\n');

    // --- Cleanup ---
    console.log('🧹 Limpando dados antigos...');
    await prisma.dish.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.siteConfig.deleteMany({});
    console.log('✅ Banco limpo.');

    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@restaurante.com';
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
    const pratoDia = await prisma.category.upsert({
        where: { slug: 'prato-do-dia' },
        update: {},
        create: { name: 'Prato do Dia', slug: 'prato-do-dia', sortOrder: 1 },
    });

    const marmitas = await prisma.category.upsert({
        where: { slug: 'marmitas' },
        update: {},
        create: { name: 'Marmitas', slug: 'marmitas', sortOrder: 2 },
    });

    const lanches = await prisma.category.upsert({
        where: { slug: 'lanches' },
        update: {},
        create: { name: 'Lanches', slug: 'lanches', sortOrder: 3 },
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

    console.log('✅ 5 categorias criadas');

    // --- Dishes (max 30 no plano Starter) ---
    const dishes = [
        // ── Prato do Dia ──
        {
            name: 'Frango Grelhado com Arroz',
            slug: 'frango-grelhado-arroz',
            description: 'Filé de frango grelhado, arroz branco, feijão e salada. Prato feito na hora.',
            price: 1890,
            image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600&q=80',
            categoryId: pratoDia.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Carne Assada com Macarrão',
            slug: 'carne-assada-macarrao',
            description: 'Carne assada desfiada com molho de tomate, macarrão e arroz.',
            price: 2090,
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
            categoryId: pratoDia.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Peixe Frito com Pirão',
            slug: 'peixe-frito-pirao',
            description: 'Peixe frito na hora, pirão caseiro, arroz e salada de alface e tomate.',
            price: 2290,
            image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
            categoryId: pratoDia.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Feijoada Completa',
            slug: 'feijoada-completa',
            description: 'Feijoada tradicional com arroz, couve refogada, farofa e laranja. Sextas e sábados.',
            price: 2490,
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
            categoryId: pratoDia.id,
            featured: true,
            sortOrder: 4,
        },
        {
            name: 'Frango ao Molho Pardo',
            slug: 'frango-molho-pardo',
            description: 'Frango caipira ao molho pardo, angu cremoso e salada.',
            price: 2190,
            image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80',
            categoryId: pratoDia.id,
            featured: false,
            sortOrder: 5,
        },

        // ── Marmitas ──
        {
            name: 'Marmita Simples',
            slug: 'marmita-simples',
            description: 'Arroz, feijão, 1 proteína (frango, carne ou ovo) e salada. Tamanho P.',
            price: 1290,
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
            categoryId: marmitas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Marmita Média',
            slug: 'marmita-media',
            description: 'Arroz, feijão, 1 proteína, salada e 1 acompanhamento. Tamanho M.',
            price: 1590,
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
            categoryId: marmitas.id,
            featured: true,
            sortOrder: 2,
        },
        {
            name: 'Marmita Grande',
            slug: 'marmita-grande',
            description: 'Arroz, feijão, 2 proteínas, salada e 2 acompanhamentos. Tamanho G.',
            price: 1990,
            image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
            categoryId: marmitas.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Marmita Diet',
            slug: 'marmita-diet',
            description: 'Arroz integral, salada verde, frango grelhado e legumes no vapor.',
            price: 1790,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
            categoryId: marmitas.id,
            featured: false,
            sortOrder: 4,
        },

        // ── Lanches ──
        {
            name: 'Bauru Simples',
            slug: 'bauru-simples',
            description: 'Pão, presunto, mussarela, tomate e maionese.',
            price: 890,
            image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Misto Quente',
            slug: 'misto-quente',
            description: 'Pão de forma, presunto e queijo derretido na chapa.',
            price: 690,
            image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Coxinha Grande',
            slug: 'coxinha-grande',
            description: 'Coxinha caseira de frango com catupiry. Feita na hora.',
            price: 590,
            image: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=600&q=80',
            categoryId: lanches.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'Pastel (2 unidades)',
            slug: 'pastel-2un',
            description: 'Pastel frito crocante — carne, frango ou queijo. Informe o recheio.',
            price: 790,
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
            categoryId: lanches.id,
            featured: false,
            sortOrder: 4,
        },

        // ── Sobremesas ──
        {
            name: 'Pudim de Leite',
            slug: 'pudim-leite',
            description: 'Pudim caseiro de leite condensado com calda de caramelo.',
            price: 790,
            image: 'https://images.unsplash.com/photo-1559622214-f8a9850965bb?w=600&q=80',
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Arroz Doce',
            slug: 'arroz-doce',
            description: 'Arroz doce cremoso com canela e leite condensado. Porção individual.',
            price: 590,
            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Bolo do Dia',
            slug: 'bolo-do-dia',
            description: 'Bolo caseiro da vovó — sabor varia diariamente. Consulte o atendente.',
            price: 690,
            image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
            categoryId: sobremesas.id,
            featured: true,
            sortOrder: 3,
        },

        // ── Bebidas ──
        {
            name: 'Suco de Fruta',
            slug: 'suco-fruta',
            description: 'Suco natural — laranja, mamão, goiaba ou tamarindo. 300ml.',
            price: 690,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Refrigerante Lata',
            slug: 'refrigerante-lata-rl',
            description: 'Coca-Cola, Guaraná ou Fanta. 350ml.',
            price: 490,
            image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Água Mineral',
            slug: 'agua-mineral-rl',
            description: 'Com ou sem gás. 500ml.',
            price: 290,
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Café ou Chá',
            slug: 'cafe-cha',
            description: 'Café passado na hora ou chá mate gelado. Copo 200ml.',
            price: 390,
            image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
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
        restaurant_name: 'Pensão da Vovó',
        restaurant_tagline: 'Comida caseira de verdade',
        restaurant_description: 'Há mais de 20 anos servindo refeições feitas com carinho. Ingredientes frescos, receitas de família e o sabor que você só encontra na casa da vovó.',
        restaurant_address: 'Rua do Bairro, 78 — Bairro Novo, Sua Cidade - SP',
        restaurant_phone: '(11) 98888-1234',
        restaurant_email: 'contato@pensaodavovo.com.br',
        whatsapp_number: '5511988881234',
        whatsapp_message: 'Olá! Vi o cardápio da Pensão da Vovó e gostaria de encomendar!',
        hero_title: 'Comida de casa, feita com amor',
        hero_subtitle: 'Marmitas e pratos do dia fresquinhos. Peça pelo WhatsApp!',
        about_title: 'Nossa Cozinha',
        about_text: 'Comida feita na hora, com ingredientes frescos e receitas de família passadas de geração em geração.',
        about_text_2: 'Cada prato é preparado com carinho, como se fosse servido na própria casa.',
        about_features: JSON.stringify([
            { icon: '🏠', title: 'Feito em Casa', description: 'Receitas de família com ingredientes frescos do dia.' },
            { icon: '🕐', title: 'Na Hora', description: 'Pratos preparados na hora, sem congelados.' },
            { icon: '💚', title: 'Preço Justo', description: 'Refeição de qualidade com preço acessível.' },
        ]),
        opening_hours: 'Seg–Sex: 11h–14h30 / 18h–20h | Sáb: 11h–15h | Dom: Fechado',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/pensaodavovo',
        facebook_url: 'https://facebook.com/pensaodavovo',
        footer_text: '© 2026 Pensão da Vovó. Todos os direitos reservados.',
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
    console.log('\n🍽  Seed RESTAURANT LITE concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// Permite execução direta: npx ts-node prisma/seed-restaurant-lite.ts
if (require.main === module) {
    seedRestaurantLite()
        .catch((e) => {
            console.error('❌ Erro no seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
