# 🌿 Jardim Gourmet — Template Alternativo

Template alternativo de restaurante com design elegante e acolhedor, usando tons quentes e orgânicos.

## 🎨 Design System

### Paleta de Cores
| Cor | Hex | Uso |
|-----|-----|-----|
| Cream 50 | `#FFFDF7` | Background principal |
| Cream 100 | `#FFF9E8` | Backgrounds secundários |
| Forest 500 | `#3D6B3D` | Cor principal (CTAs, links, destaques) |
| Forest 400 | `#5B8C5A` | Hover states, detalhes |
| Gold 400 | `#E8C872` | Separadores, bordas decorativas |
| Gold 500 | `#D4A843` | Acentos, badges |
| Charcoal 900 | `#1A1A1A` | Textos principais |
| Charcoal 800 | `#2D2D2D` | Textos secundários |

### Tipografia
- **Display:** Cormorant Garamond (serif) — títulos e headings
- **Body:** Outfit (sans-serif) — textos, labels, botões

### Framework CSS
- TailwindCSS via CDN com configuração customizada

## 📂 Estrutura de Arquivos

```
public_template2/
├── README.md
└── public/
    ├── index.html          # Homepage com hero, destaques, categorias, depoimentos
    ├── menu.html           # Cardápio completo com filtros por categoria
    ├── about.html          # Sobre o restaurante, valores, equipe
    ├── gallery.html        # Galeria de fotos com lightbox
    ├── contact.html        # Contato, horários e mapa
    ├── buy.html            # Página de compra do template
    ├── buy-success.html    # Confirmação de compra
    ├── admin.html          # Painel admin (CRUD pratos, categorias, galeria, config)
    └── js/
        ├── app.js              # Core: config, API, featured dishes, categorias
        ├── cart.js             # Carrinho de compras
        ├── cartUI.js           # Interface do carrinho
        ├── orderModal.js       # Modal de pedido rápido
        ├── whatsappFormatter.js # Formatação de pedidos via WhatsApp
        ├── mobile.js           # Menu mobile
        ├── a11y.js             # Acessibilidade
        └── performance.js      # Lazy loading, otimizações
```

## 🔌 Integração com Backend

Usa o **mesmo backend** do template principal:
- `GET /api/config` — Configurações do site
- `GET /api/categories` — Categorias do menu
- `GET /api/dishes/featured` — Pratos em destaque
- `GET /api/gallery` — Imagens da galeria
- `POST /api/auth/login` — Login do admin
- CRUD completo para pratos, categorias, galeria e configurações

## ✨ Diferenciais deste Template

1. **Design claro e acolhedor** — fundo creme com verdes e dourados (vs. tema escuro do template 1)
2. **Tipografia serif elegante** — Cormorant Garamond para títulos sofisticados
3. **Seção de depoimentos** — na homepage
4. **Divisores SVG orgânicos** — ondas decorativas entre seções
5. **Círculos decorativos** — elementos flutuantes orgânicos no fundo
6. **Admin com tema claro** — painel administrativo limpo e moderno

## 🚀 Como Usar

1. Copie a pasta `public_template2/public/` para substituir `public/`
2. O backend permanece o mesmo — nenhuma alteração necessária
3. Reinicie o servidor
