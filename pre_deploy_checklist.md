# 🚀 Master Pre-Flight Checklist (Go-To-Market Ready)

Use esta lista rigorosa antes de declarar o projeto como pronto para venda (deploy final). Se 100% dos itens dessa lista passarem, você tem um produto robusto e livre de bugs críticos para qualquer cliente.

---

## 🔒 1. Segurança e Isolamento de Dados (Crítico V1)
- [x] **Data Isolation (Tenant):** Um cliente (`tenantA`) consegue de alguma forma puxar, editar ou excluir os pratos/categorias do `tenantB` via rotas de API? Garantir que todas as consultas backend utilizem o `restaurant_id` puxado do token autenticado.
- [x] **Double Submission:** Todos os botões de ação do Admin (login, criar/editar pratos, categorias, config e senha) ficam inativos/loading durante o request? Validar se não é possível clicar 3x no botão "Salvar" e criar 3 categorias iguais.
- [x] **Cross-Site Scripting (XSS):** Nomes de pratos com `<script>alert(1)</script>` quebram a vitrine ou o painel Admin? Validado que o [esc()](file:///f:/VSCode/SaaS%20Restaurante/Templates/themes/acai/admin.html#1166-1168) e [escapeAttr()](file:///f:/VSCode/SaaS%20Restaurante/Templates/themes/pizza-lite/admin.html#1168-1169) (ou equivalente do backend) removem injeção HTML tanto no lado do cliente (vitrine) quanto no DOM do Admin?
- [x] **Sessão e JWT Expiry:** Se o Admin deixar o painel aberto por 2 horas, o token expira graciosamente (redireciona ao login) ou usa refresh token invisível sem bugar a tela (como fizemos na Fase 7)?
- [x] **Rate Limiting:** A API restringe ataques de brute force no `/auth/login` (ex: 5 tentativas por minuto)?
- [x] **CORS Settings:** A API bloqueia requests de domínios não-autorizados, limitando estritamente aos domínios finais de vitrine e admin?

---

## 🛒 2. Fluxo do Cliente Final (Vitrine e Carrinho)
- [x] **Botão WhatsApp com Texto Correto:** O botão de finalizar pedido gera uma mensagem codificada limpa (sem `undefinied`, mantendo quebras de linha corretas, somando adicionais corretamente)?
- [x] **Redirecionamento ao WhatsApp Mobile e Desktop:** O link usa `https://api.whatsapp.com/send?phone=` ou `https://wa.me/` e funciona tanto no PC quanto no celular nativamente?
- [x] **Loja Aberta/Fechada (Forçada):** Se o botão "Loja Aberta" no Admin for desativado, o botão do carrinho ("Fazer Pedido") muda imediatamente de estado, impossibilitando novas emissões?
- [x] **Horários de Funcionamento Automático:** Com a loja "aberta" no Admin, o sistema bloqueia os pedidos caso a hora atual passe do expediente (`business_hours`) configurado pelo cliente?
- [x] **Carrinho Vazio e Estados Zerados:** Se o restaurante não tem categorias, exibe uma mensagem bonita ou quebra o layout? Se clicar no carrinho vazio, o sistema previne fechar pedido?
- [x] **Performance dos Assets (Imagens):** O layout lida com imagens grandes? (CSS tem `object-fit: cover` etc.)

---

## 📱 3. UI/UX e Responsividade (Cross-Device)
- [ ] **iOS Safari Bottom Bar:** O carrinho/botão fixo no rodapé (`position: fixed; bottom: 0`) fica coberto pela barra de navegação do Safari/Chrome no iOS? (Necessário testar com 100vh vs padding-bottom).
- [ ] **Modais Mobile:** Modais de Produto e Categorias cabem na tela de celulares menores (ex: iPhone SE)? Eles scrollam internamente sem scrollar também a página da lista (scroll lock na tag `body`)?
- [ ] **Line-Clamp:** Nomes enormes de pratos ou descrições gigantes expandem a caixa (quebrando o grid) ou usamos corretamente o `-webkit-line-clamp: 2` com fallback? (Feito na última fase!)
- [ ] **Dark Mode / Light Mode Fallback:** Em temas explícitos (ex: `restaurant-lite`), forçar o light-mode via root properties ou color-scheme para garantir que configurações de OS do usuário não injetem cores de dark mode e deixem textos invisíveis.
- [ ] **Favicon e Títulos Dinâmicos:** As tags `<title>` no `<head>` acompanham os novos settings do Admin para dar a branding exata do cliente.

---

## 🛠️ 4. Fluxos do Painel Admin (Gestor)
- [ ] **Preço Mask:** O input "Preço" do cadastro de pratos está bloqueando caracteres não numéricos perfeitamente? O formato salvo converte certo pra centavos (ex: R$ 19,90 = 1990 centavos)?
- [ ] **Exclusão com Dependência:** Ao deletar uma categoria, a API deleta os pratos vinculados em cascata ou dá erro 500 informando falha de Foreign Key no BD? O painel recarrega suavemente essa informação?
- [ ] **Limites do Plano do Cliente:** O restaurante está impedido de criar o 31º prato e 6º categoria no front AND no backend (validação crucial para os pacotes SaaS que você vai vender). 
- [ ] **Imagens Faltantes e Deletadas:** Ao deletar um prato, a URL antiga no storage/bucket (S3, Cloudinary) também é excluída, evitando contas altíssimas de armazenamento morto do servidor SaaS?
- [ ] **Edição em Tempo Real:** Edições alteram o número no contador do Dashboard? Testar fluidez dos stats na tela principal.
- [ ] **Feedback Emocional UI:** Todo salvamento gera Toast Verde e erros geram Toast Vermelho. Erros do backend são legíveis e descritivos (ex: `Email já existe`).

---

## 🌍 5. Deploy / SEO / Cloud
- [ ] **Variáveis de Ambiente `env` Protegidas:** Nenhuma chave secreta do BD, JWT_SECRET, ou Stripe Key vazou no código do Frontend. (Assegurar que variáveis client-side tem prefixo se necessário `VITE_`, `NEXT_PUBLIC_`, e do server não).
- [ ] **Database Indexes:** Campos onde fazemos busca rápida como `tenant_id` possuem Indexes no Banco de Dados para que as querys não deem Tiemout quando tiverem milhôes de pratos na plataforma Mestre SaaS.
- [ ] **Logs Básicos no Servidor:** Backend registra crash com stacktrace? Logs de requisições malformadas funcionam? (Utilize PM2 / Vercel Logs dependendo de onde está a API).
- [ ] **Métricas Web Vitals Inicial:** Rodar um Lighthouse basic na vitrine simulada de um cliente para não entregar um site travado (FRP e LCP verdes).

> 🔥 **Dica de Venda:** Se você conseguir fechar 100% dos checks de "Fluxo do Cliente Final" e "Isolamento de Dados", o projeto tem MÍNIMO VIÁVEL COMERCIAL. Você já pode plugar o Stripe / PagarMe e cobrar a mensalidade.
