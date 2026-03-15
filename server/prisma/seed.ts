// ============================================
// Seed Router — escolhe seed por SEED_TYPE
// Tipos: restaurante (default) | hamburgueria | pizzaria | restaurant-lite | burger-lite | pizza-lite | acai
// Uso: SEED_TYPE=hamburgueria PLAN=professional npx prisma db seed
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedHamburgueria } from './seed-hamburgueria';
import { seedPizzaria } from './seed-pizzaria';
import { seedConfeitaria } from './seed-confeitaria';
import { seedRestaurantLite } from './seed-restaurant-lite';
import { seedBurgerLite } from './seed-burger-lite';
import { seedPizzaLite } from './seed-pizza-lite';
import { seedAcai } from './seed-acai';

const prisma = new PrismaClient();

async function seedRestaurante() {
    console.log('🍽  Seeding database — RESTAURANTE...\n');

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
    console.log(`✅ Admin: ${admin.email} (senha: ${adminPassword === 'admin123' ? 'admin123' : '***'})`);

    // --- Categories ---
    const entradas = await prisma.category.upsert({
        where: { slug: 'entradas' },
        update: {},
        create: { name: 'Entradas', slug: 'entradas', sortOrder: 1 },
    });

    const principais = await prisma.category.upsert({
        where: { slug: 'pratos-principais' },
        update: {},
        create: { name: 'Pratos Principais', slug: 'pratos-principais', sortOrder: 2 },
    });

    const sobremesas = await prisma.category.upsert({
        where: { slug: 'sobremesas' },
        update: {},
        create: { name: 'Sobremesas', slug: 'sobremesas', sortOrder: 3 },
    });

    const bebidas = await prisma.category.upsert({
        where: { slug: 'bebidas' },
        update: {},
        create: { name: 'Bebidas', slug: 'bebidas', sortOrder: 4 },
    });

    console.log('✅ Categorias criadas');

    // --- Dishes ---
    const dishes = [
        {
            name: 'Bruschetta Italiana',
            slug: 'bruschetta-italiana',
            description: 'Pão italiano tostado com tomates frescos, manjericão, alho e azeite extra virgem.',
            price: 2890,
            image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80',
            categoryId: entradas.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Carpaccio de Filé Mignon',
            slug: 'carpaccio-file-mignon',
            description: 'Finas fatias de filé mignon com rúcula, parmesão e molho de mostarda e mel.',
            price: 3990,
            image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=600&q=80',
            categoryId: entradas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Camarões ao Alho',
            slug: 'camaroes-ao-alho',
            description: 'Camarões salteados no azeite com alho, pimenta e ervas frescas.',
            price: 4590,
            image: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=600&q=80',
            categoryId: entradas.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'Risoto de Funghi',
            slug: 'risoto-funghi',
            description: 'Arroz arbóreo cremoso com mix de cogumelos, parmesão e azeite trufado.',
            price: 5990,
            image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80',
            categoryId: principais.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Filé ao Molho Madeira',
            slug: 'file-molho-madeira',
            description: 'Filé mignon grelhado ao ponto, acompanhado de molho madeira e batatas rústicas.',
            price: 7490,
            image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80',
            categoryId: principais.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Salmão Grelhado',
            slug: 'salmao-grelhado',
            description: 'Salmão fresco grelhado com legumes da estação e molho de maracujá.',
            price: 6990,
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
            categoryId: principais.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Massa Pappardelle ao Ragu',
            slug: 'pappardelle-ragu',
            description: 'Massa fresca pappardelle com ragu de carne cozido lentamente por 8 horas.',
            price: 5490,
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
            categoryId: principais.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'Tiramisù Clássico',
            slug: 'tiramisu-classico',
            description: 'Clássico italiano com biscoito champagne, café espresso e mascarpone.',
            price: 2490,
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Petit Gâteau',
            slug: 'petit-gateau',
            description: 'Bolo quente de chocolate com coração derretido, acompanhado de sorvete de baunilha.',
            price: 2890,
            image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80',
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Suco Natural',
            slug: 'suco-natural',
            description: 'Suco natural da fruta — laranja, abacaxi, maracujá ou limão.',
            price: 1290,
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Vinho da Casa (Taça)',
            slug: 'vinho-taca',
            description: 'Seleção do sommelier — tinto ou branco.',
            price: 1990,
            image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 2,
        },
    ];

    for (const dish of dishes) {
        await prisma.dish.upsert({
            where: { slug: dish.slug },
            update: {},
            create: dish,
        });
    }
    console.log(`✅ ${dishes.length} pratos criados`);

    // --- Site Config ---
    const plan = (process.env.PLAN || 'essential').toLowerCase().trim();
    if (plan !== 'starter' && plan !== 'essential' && plan !== 'professional') {
        console.warn(`⚠️  PLAN="${plan}" inválido. Usando "essential".`);
    }
    const validPlan = plan === 'professional' ? 'professional' : plan === 'starter' ? 'starter' : 'essential';

    const configs: Record<string, string> = {
        site_plan: validPlan,
        restaurant_name: 'Sabor & Arte',
        restaurant_tagline: 'Gastronomia que encanta os sentidos',
        restaurant_description: 'Há mais de 15 anos trazendo o melhor da culinária contemporânea, unindo ingredientes frescos e técnicas refinadas para criar experiências gastronômicas inesquecíveis.',
        restaurant_address: 'Rua das Flores, 123 — Centro, São Paulo - SP',
        restaurant_phone: '(11) 99999-8888',
        restaurant_email: 'contato@saborarte.com.br',
        whatsapp_number: '5511999998888',
        whatsapp_message: 'Olá! Vi o site do Sabor & Arte e gostaria de fazer uma reserva.',
        hero_title: 'Uma experiência gastronômica única',
        hero_subtitle: 'Ingredientes frescos, técnicas refinadas e sabores que contam histórias.',
        about_title: 'Nossa História',
        about_text: 'Fundado em 2010, o Sabor & Arte nasceu da paixão por unir ingredientes da mais alta qualidade com técnicas culinárias contemporâneas. Nosso chef executivo, com passagens por restaurantes estrelados na Europa, traz para cada prato uma combinação única de tradição e inovação.',
        about_text_2: 'Nosso chef executivo, com passagens por restaurantes estrelados na Europa, traz para cada prato uma combinação única de tradição e inovação.',
        about_features: JSON.stringify([
            { icon: '🌿', title: 'Ingredientes Frescos', description: 'Selecionamos diariamente os melhores ingredientes de produtores locais e orgânicos.' },
            { icon: '👨‍🍳', title: 'Chef Premiado', description: 'Nossa equipe de cozinha é liderada por chefs com experiência internacional e estrelas Michelin.' },
            { icon: '❤️', title: 'Feito com Amor', description: 'Cada prato é uma obra de arte, preparada com dedicação e carinho para nossos convidados.' },
        ]),
        opening_hours: 'Seg-Qui: 11h30–15h / 18h30–23h | Sex-Sáb: 11h30–00h | Dom: 11h30–16h',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/saborarte',
        facebook_url: 'https://facebook.com/saborarte',
        footer_text: '© 2026 Sabor & Arte. Todos os direitos reservados.',
    };

    // Adicionar team_members apenas se for plano Professional
    if (validPlan === 'professional') {
        configs.team_members = JSON.stringify([
            { name: 'Marco Oliveira', role: 'Chef Executivo', image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop' },
            { name: 'Ana Costa', role: 'Sommelier', image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop' },
            { name: 'Ricardo Santos', role: 'Gerente Geral', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop' },
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

    console.log('\n🎉  Seed RESTAURANTE concluído!');
    console.log(`\n📦 Plano: ${validPlan.toUpperCase()}`);
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

// ── Router: escolhe qual seed rodar ──
async function main() {
    const seedType = (process.env.SEED_TYPE || 'restaurante').toLowerCase().trim();

    console.log(`🌱 SEED_TYPE = "${seedType}"\n`);

    switch (seedType) {
        case 'hamburgueria':
            await seedHamburgueria();
            break;
        case 'pizzaria':
            await seedPizzaria();
            break;
        case 'confeitaria':
            await seedConfeitaria();
            break;
        case 'restaurant-lite':
            await seedRestaurantLite();
            break;
        case 'burger-lite':
            await seedBurgerLite();
            break;
        case 'pizza-lite':
            await seedPizzaLite();
            break;
        case 'acai':
            await seedAcai();
            break;
        case 'restaurante':
        default:
            await seedRestaurante();
            break;
    }
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
