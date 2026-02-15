#!/usr/bin/env node
/**
 * Script de Provisionamento Automático de Clientes
 * 
 * Reduz setup de 20min → 2min automatizando:
 * - Criação de banco Neon
 * - Migrations + Seed
 * - Criação de serviço Render
 * - Configuração de env vars
 * 
 * Uso:
 *   node scripts/provision_client.js
 * 
 * Requisitos:
 *   - Node.js instalado
 *   - Variáveis de ambiente configuradas (ver README abaixo)
 */

const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ====== CONFIGURAÇÃO ======
// Configure essas variáveis de ambiente no seu sistema:
// 
// Windows PowerShell:
//   $env:NEON_API_KEY="neon_api_xxx"
//   $env:RENDER_API_KEY="rnd_xxx"
//   $env:GITHUB_REPO="https://github.com/seu-user/restaurant-template"
//   $env:CLOUDINARY_CLOUD_NAME="dmebhvwpo"
//   $env:CLOUDINARY_API_KEY="123456"
//   $env:CLOUDINARY_API_SECRET="AbCdEf"
//
// Linux/Mac:
//   export NEON_API_KEY="neon_api_xxx"
//   export RENDER_API_KEY="rnd_xxx"
//   ... etc

const REQUIRED_ENV = [
  'NEON_API_KEY',
  'RENDER_API_KEY', 
  'GITHUB_REPO',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function validateEnv() {
  const missing = REQUIRED_ENV.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nConfigure antes de usar o script. Ver comentários no topo do arquivo.');
    process.exit(1);
  }
}

async function main() {
  validateEnv();

  console.log('🚀 PROVISIONAMENTO AUTOMÁTICO DE CLIENTE\n');
  console.log('Este script vai criar:');
  console.log('  1. Banco de dados no Neon');
  console.log('  2. Popular com seed (pratos, categorias, admin)');
  console.log('  3. Web Service no Render');
  console.log('  4. Configurar todas as env vars\n');
  
  // ====== COLETAR DADOS ======
  const clientName = (await ask('Nome do cliente (ex: pizzaria-napoli): ')).trim().toLowerCase().replace(/\s+/g, '-');
  const seedType = await ask('Tipo (restaurante/pizzaria/hamburgueria) [restaurante]: ') || 'restaurante';
  const adminEmail = (await ask('Email do admin: ')).trim();
  const adminPassword = await ask('Senha do admin (min 8 chars): ');
  const plan = await ask('Plano (essential/professional) [essential]: ') || 'essential';
  const neonRegion = await ask('Região Neon (us-east-2/us-west-2/eu-central-1) [us-west-2]: ') || 'us-west-2';
  
  // Validações básicas
  if (!clientName || clientName.length < 3) {
    console.error('❌ Nome do cliente inválido');
    process.exit(1);
  }
  if (!adminEmail.includes('@')) {
    console.error('❌ Email inválido');
    process.exit(1);
  }
  if (adminPassword.length < 8) {
    console.error('❌ Senha deve ter no mínimo 8 caracteres');
    process.exit(1);
  }
  
  console.log('\n📊 RESUMO DO PROVISIONAMENTO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Cliente:       ${clientName}`);
  console.log(`Tipo:          ${seedType}`);
  console.log(`Admin:         ${adminEmail}`);
  console.log(`Plano:         ${plan}`);
  console.log(`Região:        ${neonRegion}`);
  console.log(`URL:           https://${clientName}.onrender.com`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const confirm = await ask('Confirma provisionamento? (s/n): ');
  if (confirm.toLowerCase() !== 's') {
    console.log('Cancelado.');
    rl.close();
    process.exit(0);
  }
  
  console.log('\n');
  
  try {
    // ====== 1. CRIAR BANCO NEON ======
    console.log('🗄️  [1/4] Criando banco de dados no Neon...');
    
    const neonPayload = {
      project: {
        name: clientName,
        region_id: neonRegion
      }
    };
    
    const neonCmd = `curl -s -X POST https://console.neon.tech/api/v2/projects ^
      -H "Authorization: Bearer ${process.env.NEON_API_KEY}" ^
      -H "Content-Type: application/json" ^
      -d "${JSON.stringify(neonPayload).replace(/"/g, '\\"')}"`;
    
    const neonResponseRaw = execSync(neonCmd, { encoding: 'utf-8' });
    const neonResponse = JSON.parse(neonResponseRaw);
    
    if (neonResponse.message) {
      throw new Error(`Neon API: ${neonResponse.message}`);
    }
    
    const projectId = neonResponse.project.id;
    const dbConnectionString = neonResponse.connection_uris.find(uri => uri.connection_uri.includes('-pooler')).connection_uri;
    const directConnectionString = dbConnectionString.replace('-pooler', '').replace(/\.c-\d+\./, '.');
    
    console.log(`   ✅ Banco criado! ID: ${projectId}`);
    
    // ====== 2. MIGRATIONS + SEED ======
    console.log('\n🌱 [2/4] Rodando migrations e seed...');
    
    const seedCmd = `cd server && set DATABASE_URL=${directConnectionString}&& set DIRECT_URL=${directConnectionString}&& set SEED_TYPE=${seedType}&& set SEED_ADMIN_EMAIL=${adminEmail}&& set SEED_ADMIN_PASSWORD=${adminPassword}&& set PLAN=${plan}&& npx prisma migrate deploy && npx prisma db seed`;
    
    execSync(seedCmd, { stdio: 'inherit', shell: 'cmd.exe' });
    
    console.log('   ✅ Seed concluído!');
    
    // ====== 3. CRIAR RENDER SERVICE ======
    console.log('\n🚀 [3/4] Criando Web Service no Render...');
    
    const jwtSecret = crypto.randomBytes(64).toString('base64');
    
    const renderPayload = {
      name: clientName,
      type: 'web_service',
      repo: process.env.GITHUB_REPO,
      branch: 'main',
      rootDir: 'server',
      buildCommand: 'npm ci --include=dev && npx prisma generate && npm run build',
      startCommand: 'sh scripts/start.sh',
      plan: 'starter', // $7/mês - sempre ligado
      region: 'oregon', // us-west-2
      envVars: [
        { key: 'DATABASE_URL', value: dbConnectionString },
        { key: 'DIRECT_URL', value: directConnectionString },
        { key: 'JWT_SECRET', value: jwtSecret },
        { key: 'NODE_ENV', value: 'production' },
        { key: 'APP_URL', value: `https://${clientName}.onrender.com` },
        { key: 'CORS_ORIGINS', value: `https://${clientName}.onrender.com` },
        { key: 'PORT', value: '3000' },
        { key: 'CLOUDINARY_CLOUD_NAME', value: process.env.CLOUDINARY_CLOUD_NAME },
        { key: 'CLOUDINARY_API_KEY', value: process.env.CLOUDINARY_API_KEY },
        { key: 'CLOUDINARY_API_SECRET', value: process.env.CLOUDINARY_API_SECRET },
        { key: 'CLOUDINARY_FOLDER_PREFIX', value: clientName }
      ]
    };
    
    const renderCmd = `curl -s -X POST https://api.render.com/v1/services ^
      -H "Authorization: Bearer ${process.env.RENDER_API_KEY}" ^
      -H "Content-Type: application/json" ^
      -d "${JSON.stringify(renderPayload).replace(/"/g, '\\"')}"`;
    
    const renderResponseRaw = execSync(renderCmd, { encoding: 'utf-8' });
    const renderResponse = JSON.parse(renderResponseRaw);
    
    if (renderResponse.message) {
      throw new Error(`Render API: ${renderResponse.message}`);
    }
    
    const serviceId = renderResponse.service.id;
    console.log(`   ✅ Serviço criado! ID: ${serviceId}`);
    
    // ====== 4. SALVAR INFO ======
    console.log('\n💾 [4/4] Salvando informações do cliente...');
    
    const clientInfo = {
      name: clientName,
      createdAt: new Date().toISOString(),
      neon: {
        projectId,
        region: neonRegion,
        pooledUrl: dbConnectionString,
        directUrl: directConnectionString
      },
      render: {
        serviceId,
        url: `https://${clientName}.onrender.com`
      },
      admin: {
        email: adminEmail,
        password: adminPassword // ⚠️ Armazene isso com segurança!
      },
      plan,
      seedType
    };
    
    const fs = require('fs');
    const clientsDir = './clients';
    if (!fs.existsSync(clientsDir)) {
      fs.mkdirSync(clientsDir);
    }
    
    fs.writeFileSync(
      `${clientsDir}/${clientName}.json`,
      JSON.stringify(clientInfo, null, 2)
    );
    
    console.log(`   ✅ Salvo em clients/${clientName}.json`);
    
    // ====== SUCESSO ======
    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PROVISIONAMENTO CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 INFORMAÇÕES DO CLIENTE:\n');
    console.log(`🌐 URL do site:     https://${clientName}.onrender.com`);
    console.log(`🔐 Painel admin:    https://${clientName}.onrender.com/admin`);
    console.log(`📧 Email:           ${adminEmail}`);
    console.log(`🔑 Senha:           ${adminPassword}`);
    console.log(`📦 Plano:           ${plan}`);
    console.log(`🗄️  Neon Project:   https://console.neon.tech/app/projects/${projectId}`);
    console.log(`🚀 Render Service:  https://dashboard.render.com/web/${serviceId}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Deploy leva ~3-5 minutos (acompanhe nos logs do Render)');
    console.log('   - Instrua o cliente a trocar a senha no primeiro login');
    console.log(`   - Dados salvos em: clients/${clientName}.json\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ ERRO NO PROVISIONAMENTO:');
    console.error(error.message);
    console.error('\nVerifique:');
    console.error('  - API keys corretas (NEON_API_KEY, RENDER_API_KEY)');
    console.error('  - Quotas disponíveis (Neon: 10 projetos free, Render: ilimitado)');
    console.error('  - Conexão com internet');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
