// ============================================
// Restaurant Template — Frontend JS
// ============================================

(function () {
    // Refetch config em todas as abas abertas
    if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('site-config');
        bc.onmessage = (e) => {
            if (e.data === 'reload') window.location.reload();
        };
    }
    'use strict';

    var API = window.location.origin;
    var csrfToken = null;

    // --- CSRF Token Management ---
    async function getCsrfToken() {
        try {
            const res = await fetch(`${API}/api/csrf-token`);
            const json = await res.json();
            if (json.success && json.token) {
                csrfToken = json.token;
                return csrfToken;
            }
        } catch (e) {
            console.error('CSRF token error:', e);
        }
        return null;
    }

    function getStoredCsrfToken() {
        if (!csrfToken) {
            // Fallback: read from cookie if already set
            const match = document.cookie.match(/csrf_token=([^;]+)/);
            if (match) csrfToken = match[1];
        }
        return csrfToken;
    }

    // --- Helpers ---
    function formatPrice(cents) {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // API call with retry logic and exponential backoff
    async function api(endpoint, options, retryCount) {
        retryCount = retryCount || 0;
        var maxRetries = 3;

        try {
            options = options || {};

            // Add CSRF token for state-changing methods
            if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
                var token = getStoredCsrfToken() || await getCsrfToken();
                if (token) {
                    options.headers = options.headers || {};
                    options.headers['X-CSRF-Token'] = token;
                }
            }

            const res = await fetch(`${API}/api${endpoint}`, options);

            // Retry on network errors or 5xx errors
            if (!res.ok && retryCount < maxRetries && (res.status >= 500 || res.status === 0)) {
                var delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s
                await new Promise(resolve => setTimeout(resolve, delay));
                return api(endpoint, options, retryCount + 1);
            }

            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error(`API error ${endpoint}:`, e);

            // Retry on network failures
            if (retryCount < maxRetries) {
                var retryDelay = Math.pow(2, retryCount) * 500;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return api(endpoint, options, retryCount + 1);
            }

            return null;
        }
    }

    // --- Load site config ---
    let siteConfig = {};

    // Validate critical config fields
    function validateConfig(config) {
        var warnings = [];

        if (!config.restaurant_name || config.restaurant_name.trim().length === 0) {
            warnings.push('Restaurant name missing');
            config.restaurant_name = 'Restaurant';
        }

        if (!config.whatsapp_number || config.whatsapp_number.replace(/\D/g, '').length < 10) {
            warnings.push('WhatsApp number invalid or missing');
        }

        if (!config.hero_title || config.hero_title.trim().length === 0) {
            warnings.push('Hero title missing');
            config.hero_title = 'Bem-vindo';
        }

        // Set country code for WhatsApp formatter
        if (config.phone_country_code) {
            window.restaurantConfig = window.restaurantConfig || {};
            window.restaurantConfig.phone_country_code = config.phone_country_code;
        }

        if (warnings.length > 0) {
            console.warn('Config validation warnings:', warnings);
        }

        return config;
    }

    async function loadConfig() {
        // Fallback: força visibilidade após 500ms se config não carregar
        const fallbackTimer = setTimeout(() => {
            if (!document.body.classList.contains('config-loaded')) {
                document.body.classList.add('config-loaded');
            }
        }, 500);

        try {
            // Force cache-busting by appending a timestamp
            const data = await api(`/config?_=${Date.now()}`);
            clearTimeout(fallbackTimer);
            if (data) {
                siteConfig = validateConfig(data);
                applyConfig();
                // Mark config as loaded to trigger fade-in
                document.body.classList.add('config-loaded');
            } else {
                showToast('Erro ao carregar configurações.', 'error');
                siteConfig = {
                    restaurant_name: 'Restaurante',
                    restaurant_tagline: 'Delivery de qualidade',
                    hero_title: 'Uma experiência gastronômica única',
                    hero_subtitle: 'Ingredientes frescos, técnicas refinadas e sabores que contam histórias',
                    footer_text: '© 2026 Restaurante. Todos os direitos reservados.',
                };
                applyConfig();
                document.body.classList.add('config-loaded');
            }
        } catch (e) {
            clearTimeout(fallbackTimer);
            showToast('Erro ao carregar configurações.', 'error');
            siteConfig = {
                restaurant_name: 'Restaurante',
                restaurant_tagline: 'Delivery de qualidade',
                hero_title: 'Uma experiência gastronômica única',
                hero_subtitle: 'Ingredientes frescos, técnicas refinadas e sabores que contam histórias',
                footer_text: '© 2026 Restaurante. Todos os direitos reservados.',
            };
            document.body.classList.add('config-loaded');
        }
        // Toast system is now provided by feedback.js (showToast override)
        // Legacy showToast calls are automatically routed to the new toast system
    }

    function applyConfig() {
        const c = siteConfig;

        // --- Dynamic page title & meta ---
        const pageName = document.querySelector('meta[name="page-name"]')?.content || '';
        const siteName = c.restaurant_name || 'Restaurante';
        const siteDesc = c.restaurant_description || c.restaurant_tagline || '';

        if (pageName) {
            document.title = `${pageName} — ${siteName}`;
        } else if (c.restaurant_name) {
            // Homepage: keep full title
            document.title = `${siteName} — ${c.restaurant_tagline || 'Restaurante'}`;
        }

        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = siteDesc;

        // --- Open Graph tags ---
        const ogTags = {
            'og:title': document.title,
            'og:description': siteDesc,
            'og:type': 'website',
            'og:site_name': siteName,
            'og:url': window.location.href,
            'og:image': c.hero_image || c.about_image || '',
            'og:locale': 'pt_BR',
        };

        Object.entries(ogTags).forEach(([prop, content]) => {
            if (!content) return;
            let meta = document.querySelector(`meta[property="${prop}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('property', prop);
                document.head.appendChild(meta);
            }
            meta.content = content;
        });

        // --- Brand color (PRO) ---
        if (c.brand_color && /^#[0-9A-Fa-f]{6}$/.test(c.brand_color)) {
            applyBrandColor(c.brand_color);
        }

        // --- Logo (PRO) ---
        if (c.logo_url) {
            applyLogo(c.logo_url);
        }

        // --- Favicon (PRO) ---
        if (c.favicon_url) {
            applyFavicon(c.favicon_url);
        }

        // --- Hero image ---
        if (c.hero_image) {
            const heroBg = document.querySelector('.hero-bg');
            if (heroBg) heroBg.style.backgroundImage = `url('${c.hero_image}')`;
        }

        // --- About image ---
        if (c.about_image) {
            const aboutImg = document.getElementById('about-image') || document.querySelector('.about-img');
            if (aboutImg) {
                aboutImg.src = c.about_image;
                aboutImg.style.display = '';
            }
        }

        // Nav brand
        setText('nav-brand', c.restaurant_name);
        setText('footer-brand', c.restaurant_name);
        setText('footer-tagline', c.restaurant_tagline);
        setText('footer-copy', c.footer_text);
        setText('footer-address', c.restaurant_address);
        setText('footer-phone', c.restaurant_phone);
        setText('footer-email', c.restaurant_email);

        // Hero
        setHeroTitle('hero-title', c.hero_title);
        setText('hero-subtitle', c.hero_subtitle);

        // About
        setText('about-title', c.about_title);
        setText('about-text', c.about_text);

        // Opening hours
        setText('opening-hours', c.opening_hours);

        // WhatsApp — only show buttons if a valid number is configured
        const waNum = c.whatsapp_number ? c.whatsapp_number.replace(/\D/g, '') : '';
        const waFloat = document.getElementById('whatsapp-float');
        const waCta = document.getElementById('whatsapp-cta');

        if (waNum && waNum.length >= 10) {
            const waMsg = encodeURIComponent(c.whatsapp_message || 'Olá, gostaria de fazer uma reserva!');
            const waUrl = `https://wa.me/${waNum}?text=${waMsg}`;
            if (waFloat) { waFloat.href = waUrl; waFloat.style.display = ''; }
            if (waCta) { waCta.href = waUrl; waCta.style.display = ''; }
        } else {
            if (waFloat) waFloat.style.display = 'none';
            if (waCta) waCta.style.display = 'none';
        }

        // Social links
        setHref('link-instagram', c.instagram_url);
        setHref('link-facebook', c.facebook_url);

        // Page-specific config
        if (typeof applyPageConfig === 'function') {
            applyPageConfig(c);
        }
    }

    // --- Apply brand color dynamically ---
    function applyBrandColor(hex) {
        // Generate shades from hex
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Create lighter/darker variants
        const lighten = (r, g, b, pct) => {
            return [
                Math.min(255, Math.round(r + (255 - r) * pct)),
                Math.min(255, Math.round(g + (255 - g) * pct)),
                Math.min(255, Math.round(b + (255 - b) * pct))
            ];
        };
        const darken = (r, g, b, pct) => {
            return [
                Math.round(r * (1 - pct)),
                Math.round(g * (1 - pct)),
                Math.round(b * (1 - pct))
            ];
        };
        const toHex = (rgb) => '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');

        const shades = {
            300: toHex(lighten(r, g, b, 0.4)),
            400: toHex(lighten(r, g, b, 0.15)),
            500: hex,
            600: toHex(darken(r, g, b, 0.15)),
            700: toHex(darken(r, g, b, 0.3)),
        };

        // Inject CSS variables for brand color
        let styleEl = document.getElementById('brand-color-override');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'brand-color-override';
            document.head.appendChild(styleEl);
        }

        // Override Tailwind brand classes with CSS
        styleEl.textContent = `
            .text-brand-300 { color: ${shades[300]} !important; }
            .text-brand-400 { color: ${shades[400]} !important; }
            .text-brand-500 { color: ${shades[500]} !important; }
            .text-brand-600 { color: ${shades[600]} !important; }
            .bg-brand-400 { background-color: ${shades[400]} !important; }
            .bg-brand-500 { background-color: ${shades[500]} !important; }
            .bg-brand-600 { background-color: ${shades[600]} !important; }
            .hover\\:bg-brand-600:hover { background-color: ${shades[600]} !important; }
            .hover\\:text-brand-400:hover { color: ${shades[400]} !important; }
            .border-brand-400 { border-color: ${shades[400]} !important; }
            .hover\\:border-brand-400:hover { border-color: ${shades[400]} !important; }
            .focus\\:border-brand-400:focus { border-color: ${shades[400]} !important; }
            .ring-brand-400 { --tw-ring-color: ${shades[400]}; }
            /* Fire/gold variants for template-b */
            .text-fire-400 { color: ${shades[400]} !important; }
            .text-fire-500 { color: ${shades[500]} !important; }
            .bg-fire-500 { background-color: ${shades[500]} !important; }
            .bg-fire-600 { background-color: ${shades[600]} !important; }
            .hover\\:bg-fire-600:hover { background-color: ${shades[600]} !important; }
            .text-gold-400 { color: ${shades[400]} !important; }
            .text-gold-500 { color: ${shades[500]} !important; }
            /* Forest/green variants for template2 */
            .text-forest-500 { color: ${shades[500]} !important; }
            .bg-forest-500 { background-color: ${shades[500]} !important; }
            .hover\\:bg-forest-600:hover { background-color: ${shades[600]} !important; }
            /* Button glow effect */
            .btn-glow:hover { box-shadow: 0 8px 25px ${hex}66 !important; }
        `;
    }

    // --- Apply logo dynamically ---
    function applyLogo(url) {
        // Replace emoji icon with actual logo image
        const navBrand = document.getElementById('nav-brand');
        if (navBrand) {
            const logoContainer = navBrand.previousElementSibling;
            if (logoContainer) {
                // Replace emoji container or span with img
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Logo';
                img.className = 'w-10 h-10 rounded-full object-cover';
                img.onerror = function () { this.style.display = 'none'; };
                logoContainer.replaceWith(img);
            }
        }
        // Footer logo
        const footerBrand = document.getElementById('footer-brand');
        if (footerBrand) {
            const footerLogoContainer = footerBrand.previousElementSibling;
            if (footerLogoContainer && (footerLogoContainer.tagName === 'SPAN' || footerLogoContainer.tagName === 'DIV')) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Logo';
                img.className = 'w-10 h-10 rounded-full object-cover';
                img.onerror = function () { this.style.display = 'none'; };
                footerLogoContainer.replaceWith(img);
            }
        }
    }

    // --- Apply favicon dynamically ---
    function applyFavicon(url) {
        // Remove existing favicons to force browser refresh
        document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(el => el.remove());
        // Create fresh favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        if (url.endsWith('.svg')) link.type = 'image/svg+xml';
        else if (url.endsWith('.ico')) link.type = 'image/x-icon';
        else link.type = 'image/png';
        link.href = url + (url.includes('?') ? '&' : '?') + '_v=' + Date.now();
        document.head.appendChild(link);
    }


    window.setText = function setText(id, text) {
        const el = document.getElementById(id);
        if (el && text) el.textContent = text;
    };

    function setHeroTitle(id, text) {
        const el = document.getElementById(id);
        if (!el || !text) return;

        // Sanitize the input text first to prevent XSS
        const safeText = escapeHTML(text);

        // Find any highlighted span (supports all templates: brand-400, gold-400, fire-500, forest-500...)
        const existingSpan = el.querySelector('span[class*="text-brand-"], span[class*="text-gold-"], span[class*="text-fire-"], span[class*="text-forest-"]');
        // Determine which CSS class to use for the highlighted word
        const highlightClass = existingSpan ? existingSpan.className : 'text-brand-400';

        if (existingSpan) {
            // Extrai a palavra destacada original
            const highlightedWord = existingSpan.textContent.trim();
            const safeHighlight = escapeHTML(highlightedWord);

            // Verifica se a palavra destacada existe no novo texto
            if (safeText.includes(safeHighlight)) {
                // Mantém a palavra destacada no novo texto
                const newHTML = safeText.replace(
                    safeHighlight,
                    `<span class="${highlightClass}">${safeHighlight}</span>`
                );
                el.innerHTML = newHTML;
            } else {
                // Se a palavra não existe mais, tenta destacar a última palavra
                const words = safeText.trim().split(/\s+/);
                const lastWord = words[words.length - 1];
                const beforeLastWord = words.slice(0, -1).join(' ');
                el.innerHTML = `${beforeLastWord} <span class="${highlightClass}">${lastWord}</span>`;
            }
        } else {
            // No existing span — auto-highlight last word with brand color
            const words = safeText.trim().split(/\s+/);
            if (words.length > 1) {
                const lastWord = words[words.length - 1];
                const beforeLastWord = words.slice(0, -1).join(' ');
                el.innerHTML = `${beforeLastWord} <span class="text-brand-400">${lastWord}</span>`;
            } else {
                el.textContent = text;
            }
        }
    }

    function setHref(id, url) {
        const el = document.getElementById(id);
        if (el && url) el.href = url;
    }

    function escapeHTML(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    function escapeAttr(value) {
        return escapeHTML(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // --- Featured dishes (homepage) ---
    async function loadFeaturedDishes() {
        const container = document.getElementById('featured-dishes');
        if (!container) return;

        // Show skeleton loaders while fetching
        if (window.feedback && window.feedback.skeletons) {
            container.innerHTML = window.feedback.skeletons.featuredCards();
        }

        const dishes = await api('/dishes/featured');
        if (!dishes || dishes.length === 0) {
            container.innerHTML = '<p class="text-center col-span-3 text-gray-500 py-12">Nenhum destaque disponível.</p>';
            return;
        }

        container.innerHTML = dishes.slice(0, 3).map(dish => `
        <div class="card-hover reveal bg-dark-800/60 rounded-2xl overflow-hidden border border-white/5 group">
            <div class="relative h-64 overflow-hidden">
                <img src="${escapeAttr(dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80')}"
                     alt="${escapeAttr(dish.name)}"
                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent"></div>
                <span class="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">Destaque</span>
            </div>
            <div class="p-6 flex flex-col">
                <span class="text-brand-400 text-xs font-medium uppercase tracking-wider">${escapeHTML(dish.category?.name || '')}</span>
                <h3 class="font-display text-xl font-bold text-white mt-1 mb-2">${escapeHTML(dish.name)}</h3>
                <p class="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">${escapeHTML(dish.description || '')}</p>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-brand-400 font-bold text-xl">${formatPrice(dish.price)}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button data-action="quick" data-id="${dish.id}" data-name="${escapeAttr(dish.name)}" data-image="${escapeAttr(dish.image || '')}" data-price="${dish.price}" class="order-btn text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-lg transition flex items-center justify-center gap-1 font-medium">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                            Pedir Agora
                        </button>
                        <button data-action="cart" data-id="${dish.id}" data-name="${escapeAttr(dish.name)}" data-image="${escapeAttr(dish.image || '')}" data-price="${dish.price}" class="order-btn text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-2.5 rounded-lg transition flex items-center justify-center gap-1 font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            Adicionar
                        </button>
                    </div>
                </div >
            </div >
        </div >
                `).join('');

        initReveal();
    }

    // --- Category cards (homepage) ---
    async function loadCategoryCards() {
        const container = document.getElementById('category-cards');
        if (!container) return;

        // Show skeleton loaders while fetching
        if (window.feedback && window.feedback.skeletons) {
            container.innerHTML = window.feedback.skeletons.categoryCards();
        }

        const categories = await api('/categories');
        if (!categories || categories.length === 0) {
            container.innerHTML = '<p class="text-center col-span-4 text-gray-500 py-12">Nenhuma categoria disponível.</p>';
            return;
        }

        var icons = ['🥗', '🥩', '🍰', '🍷', '🍝', '🐟', '🥘', '🍕'];
        container.textContent = '';
        categories.forEach(function (cat, i) {
            var link = document.createElement('a');
            link.href = '/menu#' + (cat.slug || '');
            link.className = 'card-hover reveal bg-dark-800/60 rounded-2xl p-8 text-center border border-white/5 group';

            var iconDiv = document.createElement('div');
            iconDiv.className = 'text-5xl mb-4';
            iconDiv.textContent = icons[i % icons.length];
            link.appendChild(iconDiv);

            var nameH3 = document.createElement('h3');
            nameH3.className = 'font-display text-lg font-bold text-white group-hover:text-brand-400 transition';
            nameH3.textContent = cat.name;
            link.appendChild(nameH3);

            var countP = document.createElement('p');
            countP.className = 'text-gray-500 text-sm mt-2';
            countP.textContent = (cat.dishes ? cat.dishes.length : 0) + ' itens';
            link.appendChild(countP);

            container.appendChild(link);
        });

        initReveal();
    }

    // --- Order via WhatsApp (legacy, kept for compatibility) ---
    function orderWhatsApp(dishName) {
        const waNum = siteConfig.whatsapp_number ? siteConfig.whatsapp_number.replace(/\D/g, '') : '';
        if (!waNum || waNum.length < 10) {
            showToast('WhatsApp não configurado. Entre em contato por telefone.', 'error');
            return;
        }
        const msg = encodeURIComponent(`Olá, vi o site e gostaria de pedir ${dishName}`);
        window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
    }

    // --- Quick Order (new system) ---
    function quickOrderFromHome(id, name, image, price) {
        const dish = { id, name, image, price };
        if (window.orderModal) {
            window.orderModal.openQuickOrder(dish);
        } else {
            // Fallback to legacy method
            orderWhatsApp(name);
        }
    }

    // --- Add to Cart (new system) ---
    function addToCartFromHome(id, name, image, price) {
        const dish = { id, name, image, price };
        if (window.cart) {
            window.cart.add(dish);

            showAddToCartToast();
        }
    }

    function showAddToCartToast() {
        if (window.feedback) {
            window.feedback.success('Adicionado ao carrinho! 🛒');
        }
    }

    // --- Scroll Reveal ---
    function initReveal() {
        const reveals = document.querySelectorAll('.reveal:not(.visible)');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(el => observer.observe(el));
    }

    // --- Mobile menu toggle ---
    function initMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const menu = document.getElementById('mobile-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('hidden');
            });
        }
    }

    // --- Event delegation for order buttons ---
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.order-btn');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const image = btn.dataset.image;
        const price = Number(btn.dataset.price);

        if (action === 'quick') {
            quickOrderFromHome(id, name, image, price);
        } else if (action === 'cart') {
            addToCartFromHome(id, name, image, price);
        }
    });

    // --- Init ---
    document.addEventListener('DOMContentLoaded', function () {
        getCsrfToken(); // Fetch and cache CSRF token
        loadConfig();
        loadFeaturedDishes();
        loadCategoryCards();
        initReveal();
        initMobileMenu();
    });

    // Expose only needed functions globally (for event delegation & menu.html)
    window.quickOrderFromHome = quickOrderFromHome;
    window.addToCartFromHome = addToCartFromHome;
    window.api = api;
    window.formatPrice = formatPrice;
    window.initReveal = initReveal;
    window.showToast = window.showToast || function () { };

})(); // end IIFE
