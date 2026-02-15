
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
    const email = 'admin@restaurante.com';
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.adminUser.update({
            where: { email },
            data: { passwordHash },
        });
        console.log('✅ Password updated successfully for:', user.email);
    } catch (error) {
        console.error('❌ Error updating password:', error);
        // If user doesn't exist, create it
        if (String(error).includes('Record to update not found')) {
            console.log('User not found, creating...');
            await prisma.adminUser.create({
                data: {
                    email,
                    passwordHash,
                    name: 'Administrador',
                    role: 'ADMIN',
                }
            });
            console.log('✅ User created successfully');
        }
    }
}

resetAdmin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
