# DESIGN-chocobites-mapping.md

## 1. Tabela de Substituição de Cores

| Propriedade | Classe Restaurante (Origem) | Classe Chocobites (Novo) | Hex / Notas |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | `text-brand-400` | `text-[#D4AF37]` | Dourado (Títulos, Ícones) |
| **Primary Brand** | `bg-brand-500` | `bg-[#C68642]` | Caramelo (Botões CTA) |
| **Hover Brand** | `hover:bg-brand-600` | `hover:bg-[#A0652D]` | Caramelo Escuro (Auto-gerado) |
| **Background Dark** | `bg-dark-900` | `bg-[#3B1F0A]` | Marrom Profundo (Footer/Hero bg) |
| **Background Hero** | *(N/A)* | `bg-[#5D3A1A]` | Chocolate Escuro (Hero Card) |
| **Background Card** | `bg-dark-800` | `bg-white` | White (Cards em fundo bege) |
| **Background Light** | *(N/A)* | `bg-[#FFF8DC]` | Creme (Filtros, Steps) |
| **Background Section** | *(N/A)* | `bg-[#FAF7F2]` | Branco Sujo (Produtos) |
| **Text Light** | `text-white` | `text-[#FFF8DC]` | Creme (Sobre fundo escuro) |
| **Text Dark** | `text-gray-200` | `text-[#3B1F0A]` | Marrom Profundo (Sobre claro) |
| **Border** | `border-white/5` | `border-[#E8C99A]` | Bege Dourado |

---

## 2. Mapeamento por Componente

### Navbar
- **Fundo**: `bg-dark-900/90` → `bg-[#5D3A1A]/95` (Chocolate Escuro)
- **Logo Brand**: `text-white` → `text-[#FFF8DC]` (Creme)
- **Links**: `text-gray-300` → `text-[#E8C99A]` (Bege Dourado)
- **Link Hover**: `hover:text-white` → `hover:text-[#FFF8DC]`

### Hero Section (`index.html`)
- **Layout**: Alterar de "Centralizado" para "Two-Column" (Texto Esq / Imagem Dir).
- **Background**: `bg-dark-900` → `bg-[#3B1F0A]` (Marrom Profundo).
- **Headline**: "Feito com **amor**, entregue com **sabor**" (Texto creme).
- **CTA Principal**: "Peça pelo WhatsApp" (Caramelo `#C68642` + Ícone Chat).
- **CTA Secundário**: "Ver Cardápio" (Outline Dourado `#D4AF37` + Ícone Talheres).
- **Hero Image**: Criar card com borda dourada (`border-[#D4AF37]`) e badge "Mais Vendido".

### Filtro de Categorias (`menu.html`)
- **Container**: `bg-dark-900` → `bg-[#FFF8DC]` (Creme).
- **Pill Ativo**: `bg-[#C68642] text-white rounded-full`.
- **Pill Inativo**: `bg-white text-[#3B1F0A] shadow-sm`.

### Card de Produto (`js/app.js` template)
- **⚠️ Estrutura HTML Alterada**:
  - Adicionar botão "Cart" (`bg-white rounded-full p-2`) sobre a imagem (canto inferior direito).
  - Remover grid de botões inferior.
  - Adicionar botão único "Pedir agora →" (`bg-[#FAF7F2] text-[#3B1F0A] hover:bg-[#E8C99A]`) largura total.
- **Preço**: Alinhar à direita do título, cor Caramelo `#C68642`.
- **Badge**: Atualizar cores para Dourado/Bronze conforme design.

### Seção "Como Pedir" (Steps)
- **Fundo**: `bg-dark-900` → `bg-[#3B1F0A]` (Marrom Profundo - igual ao Footer).
- **Ícones**: Círculos grandes `bg-[#FFF8DC]` com ícones `text-[#D4AF37]`.
- **Textos**: Títulos em `#FFF8DC` (Creme), descrições em `#E8C99A` (Bege Dourado).

### Footer
- **Fundo**: `bg-dark-900` → `bg-[#3B1F0A]` (Marrom Profundo)
- **Logo**: `text-white` → `text-[#D4AF37]` (Dourado)
- **Textos**: `text-gray-400` → `text-[#E8C99A]` (Bege Dourado)
- **Copyright**: `text-gray-500` → `text-[#E8C99A]/60`

### Botão WhatsApp Flutuante
- **Cor Base**: Manter `bg-[#25D366]`
- **Animação**: Adicionar `.animate-pulse-green` no CSS.
- **HTML Class**: Adicionar `animate-pulse-green` ao elemento.

---

## 3. Strings para Substituição (`js/app.js` & HTML)

| Contexto | String Atual | Nova String |
| :--- | :--- | :--- |
| **Hero Title** | "Restaurante" | "Chocobites" |
| **Hero Subtitle** | "Gastronomia contemporânea..." | "Doces artesanais que aquecem o coração." |
| **Menu Title** | "Nosso Cardápio" | "Nossas Delícias" |
| **CTA Button** | "Ver Cardápio" | "Ver Doces" |
| **Footer Tagline** | "Experiência gastronômica..." | "Transformando momentos em doces memórias." |
| **Meta Title** | "Restaurante - Gastronomia..." | "Chocobites - Confeitaria Artesanal" |

---

## 4. Estrutura de Tipografia (`tailwind.config`)

Substituir a configuração atual no `<script>` do `head`:

```javascript
fontFamily: {
    display: ['Fredoka One', 'cursive'], // Títulos
    body: ['Josefin Sans', 'sans-serif'], // Corpo
}
```

**Adição no `<head>` (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Josefin+Sans:wght@300;400;700&display=swap" rel="stylesheet">
```

---

## 5. CSS Overrides Necessários (`themes/chocobites/styles.css`)

```css
/* WhatsApp Pulse Animation */
@keyframes pulse-green {
    0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
    100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}

.animate-pulse-green {
    animation: pulse-green 2s infinite;
}

/* Scrollbar Customization for Light Theme */
::-webkit-scrollbar-track {
    background: #FAF7F2;
}
::-webkit-scrollbar-thumb {
    background: #C68642;
    border-radius: 4px;
}
```

## 6. Páginas Secundárias (Baixa Prioridade)

- **`privacy.html`**:
  - `bg-dark-900` → `bg-[#FAF7F2]`
  - `text-white` → `text-[#3B1F0A]`
  - Container content: `bg-white shadow-lg`

- **`gallery.html`**:
  - Grid background: `bg-[#5D3A1A]`
  - Manter layout, atualizar placeholders se necessário.

- **`contact.html`**:
  - Input fields: `bg-dark-800` → `bg-white border-[#E8C99A] text-[#3B1F0A]`
