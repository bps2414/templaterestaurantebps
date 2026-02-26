const crypto = require('crypto');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query) => new Promise(resolve => rl.question(query, resolve));

function generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

async function run() {
    console.log("==========================================");
    console.log("🚀 GERADOR AUTOMÁTICO DE DEPLOY AWS (SaaS)");
    console.log("==========================================\n");

    console.log("⚠️ AVISO: Mantenha as credenciais da AWS configuradas (aws configure) na sua máquina.\n");

    const clientName = await ask("1. Nome do Cliente (id do cluster, ex: lampiao-burguer): ");
    const businessType = await ask("2. Tipo de Negócio (restaurante / hamburgueria / confeitaria): ");
    const adminEmail = await ask("3. E-mail do Administrador (ex: admin@lampiao.com.br): ");
    const customDomain = await ask("4. Domínio Customizado (Deixe em branco p/ usar a raiz AWS): ");

    const adminPassword = generatePassword();
    const jwtSecret = crypto.randomBytes(64).toString('base64');

    const appUrl = customDomain ? `https://${customDomain}` : `https://${clientName}.saas-aws.aws-sa-east-1.amazonaws.com`;

    console.log("\n⏳ Requisitando banco no Neon via API (Simulação)...");
    // Aqui entraria a chamada fetch real pro Neon API Endpoint para criar BDs isolados
    // Simulando URLs
    const simulatedDbId = crypto.randomBytes(4).toString('hex');
    const dbUrl = `postgresql://owner:pass@ep-${clientName}-${simulatedDbId}.neon.tech/neondb?sslmode=require`;
    const dbDirect = `postgresql://owner:pass@ep-${clientName}-${simulatedDbId}.neon.tech/neondb`;

    console.log("\n✅ DADOS GERADOS COM SUCESSO!\n");

    console.log("====================================================");
    console.log(" PASSO 1 - REGISTRAR SECRETS NA AWS COPILOT (SSM)");
    console.log("====================================================\n");
    console.log("Execute localmente estes comandos antes do deploy:");
    console.log(`copilot secret init --name DATABASE_URL --value "${dbUrl}" --env production`);
    console.log(`copilot secret init --name DIRECT_URL --value "${dbDirect}" --env production`);
    console.log(`copilot secret init --name JWT_SECRET --value "${jwtSecret}" --env production`);
    console.log(`copilot secret init --name CLOUDINARY_API_KEY --value "(seu key)" --env production`);
    console.log(`copilot secret init --name CLOUDINARY_API_SECRET --value "(seu secret)" --env production`);

    console.log("\n====================================================");
    console.log(" PASSO 2 - ADD AO MANIFEST.YML (copilot/[serviço]/manifest.yml)");
    console.log("====================================================\n");
    console.log(`variables:`);
    console.log(`  NODE_ENV: production`);
    console.log(`  THEME: ${businessType}`);
    console.log(`  PORT: 3000`);
    console.log(`  APP_URL: ${appUrl}`);
    console.log(`  CORS_ORIGINS: ${appUrl}`);
    console.log(`  CLOUDINARY_CLOUD_NAME: (seu name)`);
    console.log(`  CLOUDINARY_FOLDER_PREFIX: ${clientName}`);

    console.log("\n====================================================");
    console.log(" PASSO 3 - COMANDO PARA O SEED");
    console.log("====================================================\n");
    console.log(`$env:DATABASE_URL="${dbDirect}"`);
    console.log(`$env:DIRECT_URL="${dbDirect}"`);
    console.log(`$env:SEED_ADMIN_EMAIL="${adminEmail}"`);
    console.log(`$env:SEED_ADMIN_PASSWORD="${adminPassword}"`);
    console.log(`$env:SEED_TYPE="${businessType}"`);
    console.log(`npx prisma migrate deploy`);
    console.log(`npx prisma db seed`);

    console.log("\n====================================================");
    console.log(" 📝 COPY/PASTE PARA O CLIENTE (WhatsApp/Email)");
    console.log("====================================================\n");
    console.log(`Olá! Seu sistema está pronto.`);
    console.log(`🌐 URL do site:     ${appUrl}`);
    console.log(`🔐 Painel admin:    ${appUrl}/admin`);
    console.log(`📧 Email:           ${adminEmail}`);
    console.log(`🔑 Senha:           ${adminPassword}`);
    console.log(`\n⚠️ Troque sua senha no primeiro login em "Configurações".`);
    console.log("\n==========================================");

    rl.close();
}

run();
