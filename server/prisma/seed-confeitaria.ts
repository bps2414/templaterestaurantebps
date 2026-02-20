
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedConfeitaria() {
    console.log('🍰 Seeding database — CONFEITARIA...\n');

    // --- Cleanup ---
    console.log('🧹 Limpando dados antigos...');
    await prisma.dish.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.siteConfig.deleteMany({});
    console.log('✅ Banco limpo.');

    // --- Admin user ---
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@confeitaria.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'doce123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Check if admin exists
    const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        await prisma.adminUser.create({
            data: {
                email: adminEmail,
                passwordHash,
                name: 'Confeiteira Chefe',
                role: 'ADMIN',
            },
        });
    }

    console.log(`✅ Admin: ${adminEmail} (senha: ${adminPassword === 'doce123' ? 'doce123' : '***'})`);

    // --- Categories ---
    const bolos = await prisma.category.create({
        data: { name: 'Bolos Festivos', slug: 'bolos', sortOrder: 1 },
    });

    const docesFinos = await prisma.category.create({
        data: { name: 'Doces Finos', slug: 'doces-finos', sortOrder: 2 },
    });

    const tortas = await prisma.category.create({
        data: { name: 'Tortas & Tartelettes', slug: 'tortas', sortOrder: 3 },
    });

    const cafes = await prisma.category.create({
        data: { name: 'Cafés Especiais', slug: 'cafes', sortOrder: 4 },
    });

    console.log('✅ Categorias criadas');

    // --- Dishes ---
    const dishes = [
        {
            name: 'Red Velvet Clássico',
            slug: 'red-velvet',
            description: 'Camadas macias de bolo vermelho aveludado com recheio de cream cheese e frutas vermelhas.',
            price: 1890, // R$ 18,90 a fatia
            image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=600&q=80',
            categoryId: bolos.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Bolo de Nozes com Doce de Leite',
            slug: 'bolo-nozes',
            description: 'Massa úmida de nozes recheada com nosso doce de leite artesanal argentino.',
            price: 1690,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
            categoryId: bolos.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Macarons Sortidos',
            slug: 'macarons',
            description: 'Caixa com 6 macarons franceses: Pistache, Framboesa, Limão Siciliano e Chocolate.',
            price: 3200,
            image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&q=80',
            categoryId: docesFinos.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Brigadeiro Gourmet Belga',
            slug: 'brigadeiro-belga',
            description: 'O clássico brasileiro feito com chocolate Callebaut 70%.',
            price: 650,
            image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=600&q=80',
            categoryId: docesFinos.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Torta de Limão Merengada',
            slug: 'torta-limao',
            description: 'Base crocante de biscoito, creme de limão siciliano e merengue maçaricado.',
            price: 1490,
            image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&q=80',
            categoryId: tortas.id,
            featured: true,
            sortOrder: 1,
        },
        {
            name: 'Cheesecake de Frutas Vermelhas',
            slug: 'cheesecake',
            description: 'New York style cheesecake com calda de morango, framboesa e mirtilo.',
            price: 1990,
            image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df26?w=600&q=80',
            categoryId: tortas.id,
            featured: false,
            sortOrder: 2,
        },
        {
            name: 'Cappuccino Italiano',
            slug: 'cappuccino',
            description: 'Espresso, leite vaporizado e espuma cremosa, finalizado com cacau em pó.',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80',
            categoryId: cafes.id,
            featured: false,
            sortOrder: 1,
        },
    ];

    for (const dish of dishes) {
        await prisma.dish.upsert({
            where: { slug: dish.slug },
            update: {},
            create: dish,
        });
    }
    console.log(`✅ ${dishes.length} doces criados`);

    // --- Site Config ---
    const configs: Record<string, string> = {
        site_plan: 'professional',
        brand_color: '#C4883A',
        theme: 'confeitaria',
        logo_url: '/logo-confeitaria.png',
        favicon_url: '/favicon-confeitaria.ico',
        restaurant_name: 'Confeitaria Gourmet',
        restaurant_tagline: 'Doçura em cada detalhe',
        restaurant_description: 'Transformamos açúcar e afeto em obras de arte comestíveis. Nossa confeitaria une técnicas francesas com o calor da doçaria brasileira.',
        restaurant_address: 'Av. das Hortênsias, 850 — Gramado, RS',
        restaurant_phone: '(54) 99999-7777',
        restaurant_email: 'pedidos@confeitariagourmet.com.br',
        whatsapp_number: '5554999997777',
        whatsapp_message: 'Olá! Gostaria de encomendar um bolo.',
        hero_title: 'Momentos doces para a vida',
        hero_subtitle: 'Bolos artesanais, doces finos e cafés que abraçam a alma.',
        about_title: 'Nossa Paixão',
        about_text: 'Tudo começou na cozinha da Vó Maria, onde o cheiro de bolo assando reunia a família. Hoje, a Confeitaria Gourmet mantém essa tradição viva, usando ingredientes premium e muito amor em cada receita.',
        about_text_2: 'Nossos chefs patissiers são especialistas em transformar sonhos em açúcar.',
        about_features: JSON.stringify([
            { icon: '🍫', title: 'Chocolate Belga', description: 'Usamos apenas chocolates nobres importados em nossas receitas.' },
            { icon: '🎂', title: 'Design Exclusivo', description: 'Bolos personalizados que são verdadeiras esculturas.' },
            { icon: '🎁', title: 'Presentes', description: 'Embalagens sofisticadas perfeitas para presentear quem você ama.' },
        ]),
        opening_hours: 'Ter-Dom: 10h às 19h | Seg: Fechado',
        instagram_url: 'https://instagram.com/confeitariagourmet',
        facebook_url: 'https://facebook.com/confeitariagourmet',
        footer_text: '© 2026 Confeitaria Gourmet. Feito com açúcar e afeto.',
    };

    // Equipe
    const plan = (process.env.PLAN || 'essential').toLowerCase().trim();
    if (plan === 'professional') {
        configs['team_members'] = JSON.stringify([
            { name: 'Isabela Doces', role: 'Chef Patissier', image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop' },
            { name: 'Pedro Café', role: 'Barista', image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&h=400&fit=crop' },
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
    console.log('\n🎉 Seed CONFEITARIA concluído!');
}
