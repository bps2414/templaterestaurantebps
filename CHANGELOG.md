# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] - 2026-02-13

### ✨ Adicionado
- **Gerador de QR Code no Admin**: Nova aba dedicada com download PNG e função imprimir
- **Admin Responsivo**: Menu hamburger mobile com overlay para dispositivos móveis
- **Meta Tags Dinâmicas**: Tags OG (Open Graph) injetadas automaticamente via SiteConfig
- **SEO Dinâmico**: Implementação de `sitemap.xml` e `robots.txt` gerados automaticamente
- **Máscara de Preço**: Input automático formatado em BRL (R$ XX,XX) no cadastro de pratos
- **Placeholders SVG Elegantes**: Imagens padrão bonitas com emojis para categorias e pratos
- **Templates B e C Atualizados**: Hamburgueria e pizzaria com novas funcionalidades

### 🔧 Melhorado
- Docker: Limpeza completa de referências "fluxpay", paths corrigidos
- UX: Placeholder de WhatsApp melhorado no formulário de configuração
- Código: Limpeza de `validators.ts` e `docker-compose.dev.yml`
- Usuário: Alterado de "fluxpay" para "appuser" no Dockerfile

### 🗑️ Removido
- Imagens via.placeholder.com substituídas por SVG data URIs

### 📚 Documentação
- Atualização do UPDATE.md com nota 9.0/10 (Técnica) e 8.5/10 (Comercial)
- Marcação da Fase 1 como 100% concluída
- Marcação do item 2.1 da Fase 2 como concluído

---

## [2.0.0] - 2026-02-12

### ✨ Adicionado
- **Winston Logger**: Sistema de logging estruturado com file rotation (10MB/5 files)
- **Validação de WhatsApp**: Validação completa (frontend + backend) no painel admin
- **Onboarding**: Guia "Primeiros Passos" para novos clientes no painel admin
- **Preview ao Vivo**: Botão no sidebar e na aba de configurações para visualizar mudanças
- **Script de Backup**: Sistema completo de backup/restore em JSON
- **Templates B e C**: Novos templates para hamburgueria e pizzaria

### 🔒 Segurança
- Removidos TODOS os `console.log` de debug em produção
- Substituídos logs de debug por Winston logger com sanitização de PII
- Logging estruturado sem vazamento de informações sensíveis

### 🔧 Melhorado
- Código: Limpeza completa de `validators.ts` (código morto removido)
- Sanitização automática de logs (nunca loga informações pessoais)
- File rotation automático para prevenir crescimento excessivo de logs

### 📚 Documentação
- Marcação da Fase 0 como 100% concluída no UPDATE.md
- Atualização de todas as referências de versão

---

## [1.0.0] - 2026-02-11

### ✨ Adicionado
- **Integração Cloudinary**: Migração completa de uploads para CDN
- **CSRF Protection**: Double Submit Cookie implementado corretamente
- **Sistema de Planos**: Essential (gratuito) e Professional (pago)
- **Feature Flags**: Controle de funcionalidades por plano
- **QR Code Generator**: Geração de QR Code para cardápio digital

### 🔒 Segurança
- Remoção do campo `debug` da resposta 403 do CSRF
- Upload seguro com 3 camadas: MIME whitelist, extensão, magic bytes
- Rate limiting em 4 camadas (API, Auth, Upload, Checkout)
- Brute force protection com lock de 15 minutos
- JWT rotation com tokenVersion para invalidação imediata
- Helmet configurado com CSP, HSTS, X-Frame-Options

### 🔧 Melhorado
- Error handler centralizado (Prisma, Multer, Zod, CORS)
- UUID filenames para segurança de upload
- Path traversal bloqueado
- XSS sanitization no backend

### 📚 Documentação
- Criação do GUIA_COMPLETO_DEPLOY.md (1088 linhas)
- Criação do RECONSTRUCAO.md (1004 linhas)
- Criação do UPDATE.md com auditoria completa
- Criação do phased_corrections.md
- Final Verdict: ✅ SAFE TO SELL

---

## [0.5.0] - 2026-02-10

### ✨ Adicionado
- **Painel Admin Completo**: CRUD de pratos, categorias, galeria, configurações
- **Autenticação JWT**: Access + Refresh tokens
- **Sistema de Gallery**: Upload e gerenciamento de imagens
- **WhatsApp Integration**: Pedidos via WhatsApp formatados
- **Sistema de Categorias**: Organização do cardápio

### 🎨 Frontend
- Landing page responsiva (home, menu, galeria, sobre, contato)
- Tailwind CSS para estilização
- Dark theme no painel admin
- Interface intuitiva para gerenciamento

---

## [0.1.0] - 2026-02-01

### ✨ Inicial
- Estrutura base do projeto
- Express.js + TypeScript setup
- Prisma ORM configurado
- PostgreSQL database schema
- Docker + Docker Compose
- Estrutura de pastas organizada

---

## Legenda

- ✨ **Adicionado**: Novas funcionalidades
- 🔧 **Melhorado**: Melhorias em funcionalidades existentes
- 🔒 **Segurança**: Correções e melhorias de segurança
- 🐛 **Corrigido**: Correção de bugs
- 🗑️ **Removido**: Funcionalidades ou código removido
- 📚 **Documentação**: Mudanças na documentação
- 🎨 **Frontend**: Mudanças visuais ou de interface
- ⚡ **Performance**: Melhorias de performance

---

## Notas de Versão

### Status Atual: v3.0.0 ✅ PRONTO PARA VENDAS

**Notas Técnicas:** 9.0/10  
**Notas Comerciais:** 8.5/10  
**Vendabilidade:** 9.0/10

**Conquistas:**
- ✅ Fase 0 (Correções Obrigatórias): 100% Concluída
- ✅ Fase 1 (Melhorias Rápidas): 100% Concluída  
- 🟢 Fase 2 (Valor Agregado): Em progresso (QR Code concluído)

**Próximos Passos:**
- Contador de visitas (Fase 2.3)
- Link "Powered by" no footer (Fase 2.4)
- Google Maps embed funcional (Fase 2.6)

---

## Suporte

Para mais informações sobre deployment, vendas e customização:

- [GUIA_COMPLETO_DEPLOY.md](GUIA_COMPLETO_DEPLOY.md) - Deploy do zero à produção
- [docs/keep/GUIA_VENDAS_E_CUSTOMIZACAO.md](docs/keep/GUIA_VENDAS_E_CUSTOMIZACAO.md) - Como vender e customizar
- [docs/keep/UPDATE.md](docs/keep/UPDATE.md) - Auditoria completa e roadmap
