// ============================================
// Seed — Restaurante exemplo completo
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

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
            categoryId: entradas.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Carpaccio de Filé Mignon',
            slug: 'carpaccio-file-mignon',
            description: 'Finas fatias de filé mignon com rúcula, parmesão e molho de mostarda e mel.',
            price: 3990,
            categoryId: entradas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Camarões ao Alho',
            slug: 'camaroes-ao-alho',
            description: 'Camarões salteados no azeite com alho, pimenta e ervas frescas.',
            price: 4590,
            categoryId: entradas.id,
            featured: true,
            sortOrder: 3,
        },
        {
            name: 'Risoto de Funghi',
            slug: 'risoto-funghi',
            description: 'Arroz arbóreo cremoso com mix de cogumelos, parmesão e azeite trufado.',
            price: 5990,
            categoryId: principais.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Filé ao Molho Madeira',
            slug: 'file-molho-madeira',
            description: 'Filé mignon grelhado ao ponto, acompanhado de molho madeira e batatas rústicas.',
            price: 7490,
            categoryId: principais.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Salmão Grelhado',
            slug: 'salmao-grelhado',
            description: 'Salmão fresco grelhado com legumes da estação e molho de maracujá.',
            price: 6990,
            categoryId: principais.id,
            featured: false,
            sortOrder: 3,
        },
        {
            name: 'Massa Pappardelle ao Ragu',
            slug: 'pappardelle-ragu',
            description: 'Massa fresca pappardelle com ragu de carne cozido lentamente por 8 horas.',
            price: 5490,
            categoryId: principais.id,
            featured: false,
            sortOrder: 4,
        },
        {
            name: 'Tiramisù Clássico',
            slug: 'tiramisu-classico',
            description: 'Clássico italiano com biscoito champagne, café espresso e mascarpone.',
            price: 2490,
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Petit Gâteau',
            slug: 'petit-gateau',
            description: 'Bolo quente de chocolate com coração derretido, acompanhado de sorvete de baunilha.',
            price: 2890,
            categoryId: sobremesas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Suco Natural',
            slug: 'suco-natural',
            description: 'Suco natural da fruta — laranja, abacaxi, maracujá ou limão.',
            price: 1290,
            categoryId: bebidas.id,
            featured: false,
            sortOrder: 1,
        },
        {
            name: 'Vinho da Casa (Taça)',
            slug: 'vinho-taca',
            description: 'Seleção do sommelier — tinto ou branco.',
            price: 1990,
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
    const configs: Record<string, string> = {
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
        opening_hours: 'Seg-Qui: 11h30–15h / 18h30–23h | Sex-Sáb: 11h30–00h | Dom: 11h30–16h',
        google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1976670254753!2d-46.65529378502211!3d-23.56517098468082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzU0LjYiUyA0NsKwMzknMTEuMSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890',
        instagram_url: 'https://instagram.com/saborarte',
        facebook_url: 'https://facebook.com/saborarte',
        footer_text: '© 2026 Sabor & Arte. Todos os direitos reservados.',
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

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${displayPassword}`);
    console.log('   ⚠️  Altere em produção!\n');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
