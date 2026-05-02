# Notas De Deploy

## Demos Atuais

- Restaurante: [https://saborearte-seven.vercel.app/](https://saborearte-seven.vercel.app/)
- Pizzaria: [https://fornoemassa.vercel.app/](https://fornoemassa.vercel.app/)
- Hamburgueria: [https://burguerhouse-lilac.vercel.app/](https://burguerhouse-lilac.vercel.app/)

## Modelo De Deploy

O deploy recomendado para portfolio e estatico: selecionar um tema, gerar `public/` e publicar o resultado. Esse fluxo combina melhor com o escopo seguro atual: landing page, cardapio e WhatsApp.

## Gerar Um Tema

PowerShell:

```powershell
$env:THEME="restaurant-lite"; node scripts/select-theme.js
```

Bash:

```bash
THEME=restaurant-lite node scripts/select-theme.js
```

Troque `restaurant-lite` por `pizza-lite` ou `burger-lite` conforme a demo.

## Backend Experimental

O backend em `server/` pode ser buildado separadamente:

```bash
cd server
npm install
npm run build
```

Para execucao real, use `server/.env.example` como referencia. Nao publique `server/.env`.

## Observacoes Para Cliente Real

Para venda hoje, o deploy recomendado seria uma pagina/cardapio estatico com formulario ou WhatsApp. Login administrativo, banco de dados, uploads e multi-cliente devem ser planejados como fase propria.

## Checklist Antes De Novo Deploy

- Confirmar que as alteracoes foram feitas em `themes/`, nao apenas em `public/`.
- Rodar `node scripts/select-theme.js` com o tema correto.
- Conferir mobile e desktop.
- Conferir links de WhatsApp/contato.
- Garantir que `.env` e credenciais nao estejam no Git.
- Se o backend for usado, revisar `CORS_ORIGINS`, `APP_URL`, `JWT_SECRET` e banco.
