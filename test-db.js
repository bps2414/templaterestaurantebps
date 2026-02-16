const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB Verification Script ---');
  console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
  
  try {
      const user = await prisma.adminUser.findFirst();
      console.log('AdminUser found:', user ? user.email : 'None');

      const dishes = await prisma.dish.findMany({
          take: 5,
          select: { name: true, image: true }
      });
      console.log(`Dishes count: ${await prisma.dish.count()}`);
      console.log('Sample dishes:', dishes);
  } catch (e) {
      console.error('Error querying DB:', e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
