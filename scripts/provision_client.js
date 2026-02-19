#!/usr/bin/env node
/**
 * Script de Provisionamento Automático de Clientes — Coolify
 * 
 * Reduz setup de 20min → 2min automatizando:
 * - Criação de banco Neon
 * - Migrations + Seed
 * - Criação de Application no Coolify (via API)
 * - Configuração de env vars + domínio + SSL
 * 
 * Uso:
 *   node scripts/provision_client.js
 * 
 * Requisitos:
 *   - Node.js instalado
 *   - Variáveis de ambiente configuradas (ver abaixo)
 *   
 * Windows PowerShell:
 *   $env:NEON_API_KEY="neon_api_xxx"
 *   $env:COOLIFY_API_KEY="coolify-token-xxx"
 *   $env:COOLIFY_BASE_URL="https://coolify.seudominio.com.br"
 *   $env:COOLIFY_SERVER_UUID="server-uuid"
 *   $env:COOLIFY_PROJECT_UUID="project-uuid"
 *   $env:GITHUB_REPO="https://github.com/bps2414/templaterestaurantebps"
 *   $env:CLOUDINARY_CLOUD_NAME="dmebhvwpo"
 *   $env:CLOUDINARY_API_KEY="448539967934699"
 *   $env:CLOUDINARY_API_SECRET="1XICB1VlrYJGz2Wh-EOraAOsehM"
 *   $env:BASE_DOMAIN="seudominio.com.br"
 *
 * Linux/Mac:
 *   export NEON_API_KEY="neon_api_xxx"
 *   export COOLIFY_API_KEY="coolify-token-xxx"
 *   ... etc
 */

const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const REQUIRED_ENV = [
  'NEON_API_KEY',
  'COOLIFY_API_KEY',
  'COOLIFY_BASE_URL',
  'COOLIFY_SERVER_UUID',
  'COOLIFY_PROJECT_UUID',
  'GITHUB_REPO',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'BASE_DOMAIN'
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

function coolifyApi(method, endpoint, body = null) {
  const url = `${process.env.COOLIFY_BASE_URL}/api/v1${endpoint}`;
  const headers = [
    '-H', `"Authorization: Bearer ${process.env.COOLIFY_API_KEY}"`,
    '-H', '"Content-Type: application/json"',
    '-H', '"Accept: application/json"'
  ].join(' ');

  let cmd = `curl -s -X ${method} "${url}" ${headers}`;
  if (body) {
    const jsonStr = JSON.stringify(body).replace(/"/g, '\\"');
    cmd += ` -d "${jsonStr}"`;
  }

  const response = execSync(cmd, { encoding: 'utf-8', shell: true });
  try {
    return JSON.parse(response);
  } catch {
    console.error('Resposta não-JSON da API Coolify:', response);
    throw new Error('Coolify API retornou resposta inválida');
  }
}

async function main() {
  validateEnv();

  const baseDomain = process.env.BASE_DOMAIN;

  console.log('🚀 PROVISIONAMENTO AUTOMÁTICO DE CLIENTE — COOLIFY\n');
  console.log('Este script vai criar:');
  console.log('  1. Banco de dados no Neon');
  console.log('  2. Popular com seed (pratos, categorias, admin)');
  console.log('  3. Application no Coolify (Docker build)');
  console.log('  4. Configurar env vars + domínio + SSL\n');

  // ====== COLETAR DADOS ======
  const clientName = (await ask('Nome do cliente (ex: pizzaria-napoli): ')).trim().toLowerCase().replace(/\s+/g, '-');
  const seedType = await ask('Tipo (restaurante/hamburgueria/confeitaria) [restaurante]: ') || 'restaurante';
  const adminEmail = (await ask('Email do admin: ')).trim();
  const adminPassword = await ask('Senha do admin (min 8 chars): ');
  const plan = await ask('Plano (essential/professional) [essential]: ') || 'essential';
  const neonRegion = await ask('Região Neon (us-east-2/us-west-2/eu-central-1) [us-west-2]: ') || 'us-west-2';
  const customDomain = await ask(`Domínio customizado (vazio = ${clientName}.${baseDomain}): `) || '';

  const finalDomain = customDomain || `${clientName}.${baseDomain}`;
  const appUrl = `https://${finalDomain}`;

  // Validações
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
  console.log(`Domínio:       ${finalDomain}`);
  console.log(`URL:           ${appUrl}`);
  console.log(`Infra:         Coolify (VPS Self-Hosted)`);
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

    const neonCmd = `curl -s -X POST https://console.neon.tech/api/v2/projects -H "Authorization: Bearer ${process.env.NEON_API_KEY}" -H "Content-Type: application/json" -d "${JSON.stringify(neonPayload).replace(/"/g, '\\"')}"`;

    const neonResponseRaw = execSync(neonCmd, { encoding: 'utf-8', shell: true });
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

    const seedEnv = {
      DATABASE_URL: directConnectionString,
      DIRECT_URL: directConnectionString,
      SEED_TYPE: seedType,
      SEED_ADMIN_EMAIL: adminEmail,
      SEED_ADMIN_PASSWORD: adminPassword,
      PLAN: plan,
      PATH: process.env.PATH
    };

    execSync('npx prisma migrate deploy', {
      cwd: 'server',
      stdio: 'inherit',
      env: { ...process.env, ...seedEnv }
    });

    execSync('npx prisma db seed', {
      cwd: 'server',
      stdio: 'inherit',
      env: { ...process.env, ...seedEnv }
    });

    console.log('   ✅ Seed concluído!');

    // ====== 3. CRIAR APPLICATION NO COOLIFY ======
    console.log('\n🚀 [3/4] Criando Application no Coolify...');

    const jwtSecret = crypto.randomBytes(64).toString('base64');

    // 3a. Criar application (Docker build)
    const appPayload = {
      project_uuid: process.env.COOLIFY_PROJECT_UUID,
      server_uuid: process.env.COOLIFY_SERVER_UUID,
      environment_name: 'production',
      git_repository: process.env.GITHUB_REPO,
      git_branch: 'main',
      build_pack: 'dockerfile',
      dockerfile_location: '/server/Dockerfile',
      docker_compose_location: '',
      ports_exposes: '3000',
      name: clientName,
      description: `Landing page para ${clientName} (${seedType})`,
      domains: appUrl,
      health_check_enabled: true,
      health_check_path: '/healthz',
      health_check_port: '3000',
      health_check_interval: 30,
      health_check_timeout: 10,
      health_check_retries: 3,
      health_check_start_period: 60
    };

    const appResponse = coolifyApi('POST', '/applications', appPayload);

    if (!appResponse.uuid) {
      throw new Error(`Coolify API: Falha ao criar application — ${JSON.stringify(appResponse)}`);
    }

    const appUuid = appResponse.uuid;
    console.log(`   ✅ Application criada! UUID: ${appUuid}`);

    // 3b. Configurar env vars
    console.log('   📝 Configurando variáveis de ambiente...');

    const envVars = [
      { key: 'DATABASE_URL', value: dbConnectionString, is_preview: false },
      { key: 'DIRECT_URL', value: directConnectionString, is_preview: false },
      { key: 'JWT_SECRET', value: jwtSecret, is_preview: false },
      { key: 'NODE_ENV', value: 'production', is_preview: false },
      { key: 'THEME', value: seedType, is_preview: false },
      { key: 'APP_URL', value: appUrl, is_preview: false },
      { key: 'CORS_ORIGINS', value: appUrl, is_preview: false },
      { key: 'PORT', value: '3000', is_preview: false },
      { key: 'CLOUDINARY_CLOUD_NAME', value: process.env.CLOUDINARY_CLOUD_NAME, is_preview: false },
      { key: 'CLOUDINARY_API_KEY', value: process.env.CLOUDINARY_API_KEY, is_preview: false },
      { key: 'CLOUDINARY_API_SECRET', value: process.env.CLOUDINARY_API_SECRET, is_preview: false },
      { key: 'CLOUDINARY_FOLDER_PREFIX', value: clientName, is_preview: false }
    ];

    for (const envVar of envVars) {
      coolifyApi('POST', `/applications/${appUuid}/envs`, envVar);
    }

    console.log(`   ✅ ${envVars.length} variáveis configuradas!`);

    // 3c. Iniciar deploy
    console.log('   🔨 Iniciando deploy...');
    coolifyApi('POST', `/applications/${appUuid}/deploy`);
    console.log('   ✅ Deploy iniciado! Acompanhe no dashboard.');

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
      coolify: {
        appUuid,
        url: appUrl,
        domain: finalDomain,
        dashboardUrl: `${process.env.COOLIFY_BASE_URL}/project/${process.env.COOLIFY_PROJECT_UUID}`
      },
      admin: {
        email: adminEmail,
        password: adminPassword // ⚠️ Armazene com segurança!
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
    console.log(`🌐 URL do site:     ${appUrl}`);
    console.log(`🔐 Painel admin:    ${appUrl}/admin`);
    console.log(`📧 Email:           ${adminEmail}`);
    console.log(`🔑 Senha:           ${adminPassword}`);
    console.log(`📦 Plano:           ${plan}`);
    console.log(`🗄️  Neon Project:   https://console.neon.tech/app/projects/${projectId}`);
    console.log(`🚀 Coolify App:     ${process.env.COOLIFY_BASE_URL}/project/${process.env.COOLIFY_PROJECT_UUID}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Deploy leva ~2-5 minutos (acompanhe nos logs do Coolify)');
    console.log('   - Instrua o cliente a trocar a senha no primeiro login');
    console.log(`   - Dados salvos em: clients/${clientName}.json\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ ERRO NO PROVISIONAMENTO:');
    console.error(error.message);
    console.error('\nVerifique:');
    console.error('  - API keys corretas (NEON_API_KEY, COOLIFY_API_KEY)');
    console.error('  - Coolify acessível em: ' + process.env.COOLIFY_BASE_URL);
    console.error('  - Server UUID e Project UUID corretos');
    console.error('  - Quotas disponíveis (Neon: 10 projetos free)');
    console.error('  - Conexão com internet');
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
