const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file manually
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('Loading .env from', envPath);
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').trim().replace(/^["']|["']$/g, '');
            if (key.trim() && !key.startsWith('#')) {
                process.env[key.trim()] = val;
            }
        }
    });
}

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Verification Script ---');
  console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
  
  try {
      const user = await prisma.adminUser.findFirst();
      console.log('AdminUser found:', user ? user.email : 'None');

      const count = await prisma.dish.count();
      console.log(`Dishes count: ${count}`);
      
      const dishes = await prisma.dish.findMany({
          take: 5,
          select: { name: true, image: true }
      });
      console.log('Sample dishes:', dishes);
  } catch (e) {
      console.error('Error querying DB:', e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
