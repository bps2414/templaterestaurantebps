// ============================================
// Database Backup Script — PostgreSQL (Neon)
// ============================================
// Usage: npx ts-node scripts/backup.ts
// Or:    node dist/scripts/backup.js (after build)
//
// Creates a JSON export of all data (dishes, categories,
// gallery, config, admin users) that can be re-imported.
// Works without pg_dump (ideal for Neon serverless).
// ============================================

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface BackupData {
    metadata: {
        version: string;
        createdAt: string;
        database: string;
    };
    categories: any[];
    dishes: any[];
    galleryImages: any[];
    siteConfig: any[];
    adminUsers: any[];
}

async function backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupDir = path.join(__dirname, '../backups');

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('🔄 Starting database backup...');

    try {
        // Export all data
        const [categories, dishes, galleryImages, siteConfig, adminUsers] = await Promise.all([
            prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
            prisma.dish.findMany({ orderBy: { sortOrder: 'asc' }, include: { category: { select: { name: true } } } }),
            prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } }),
            prisma.siteConfig.findMany(),
            prisma.adminUser.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    // Never include passwordHash in backup for security
                },
            }),
        ]);

        const backupData: BackupData = {
            metadata: {
                version: '1.0',
                createdAt: new Date().toISOString(),
                database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
            },
            categories,
            dishes,
            galleryImages,
            siteConfig,
            adminUsers,
        };

        const filename = `backup-${timestamp}.json`;
        const filepath = path.join(backupDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf-8');

        // Calculate stats
        const stats = {
            categories: categories.length,
            dishes: dishes.length,
            galleryImages: galleryImages.length,
            configKeys: siteConfig.length,
            adminUsers: adminUsers.length,
        };

        const fileSizeKB = (fs.statSync(filepath).size / 1024).toFixed(1);

        console.log(`\n✅ Backup concluído com sucesso!`);
        console.log(`📁 Arquivo: ${filepath}`);
        console.log(`📊 Tamanho: ${fileSizeKB} KB`);
        console.log(`📋 Conteúdo:`);
        console.log(`   - ${stats.categories} categorias`);
        console.log(`   - ${stats.dishes} pratos`);
        console.log(`   - ${stats.galleryImages} imagens na galeria`);
        console.log(`   - ${stats.configKeys} configurações`);
        console.log(`   - ${stats.adminUsers} administradores`);

        // Cleanup: keep only last 10 backups
        const backupFiles = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
            .sort()
            .reverse();

        if (backupFiles.length > 10) {
            const toDelete = backupFiles.slice(10);
            toDelete.forEach(f => {
                fs.unlinkSync(path.join(backupDir, f));
                console.log(`🗑  Backup antigo removido: ${f}`);
            });
        }

        return filepath;
    } catch (error) {
        console.error('❌ Erro no backup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

async function restore(filepath: string) {
    if (!fs.existsSync(filepath)) {
        console.error(`❌ Arquivo não encontrado: ${filepath}`);
        process.exit(1);
    }

    console.log(`🔄 Restaurando backup de: ${filepath}`);
    console.log('⚠️  ATENÇÃO: Isso vai SUBSTITUIR todos os dados atuais!');

    const data: BackupData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

    console.log(`📋 Backup de ${data.metadata.createdAt}`);
    console.log(`   - ${data.categories.length} categorias`);
    console.log(`   - ${data.dishes.length} pratos`);
    console.log(`   - ${data.galleryImages.length} imagens`);
    console.log(`   - ${data.siteConfig.length} configs`);

    try {
        // Clear existing data (in correct order for FK constraints)
        await prisma.dish.deleteMany();
        await prisma.category.deleteMany();
        await prisma.galleryImage.deleteMany();
        await prisma.siteConfig.deleteMany();

        // Restore categories
        for (const cat of data.categories) {
            const { dishes, ...catData } = cat;
            await prisma.category.create({ data: catData });
        }

        // Restore dishes (without the included category relation)
        for (const dish of data.dishes) {
            const { category, ...dishData } = dish;
            await prisma.dish.create({ data: dishData });
        }

        // Restore gallery images
        for (const img of data.galleryImages) {
            await prisma.galleryImage.create({ data: img });
        }

        // Restore config
        for (const config of data.siteConfig) {
            await prisma.siteConfig.upsert({
                where: { key: config.key },
                update: { value: config.value },
                create: { key: config.key, value: config.value },
            });
        }

        console.log('\n✅ Restauração concluída!');
    } catch (error) {
        console.error('❌ Erro na restauração:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0] || 'backup';

if (command === 'restore') {
    const file = args[1];
    if (!file) {
        console.error('❌ Uso: npx ts-node scripts/backup.ts restore <arquivo.json>');
        process.exit(1);
    }
    restore(file);
} else {
    backup();
}
