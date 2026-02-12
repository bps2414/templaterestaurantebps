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
        try {
            const data = await api('/config');
            if (data) {
                siteConfig = validateConfig(data);
                applyConfig();
            } else {
                showToast('Erro ao carregar configurações.', 'error');
                siteConfig = {
                    restaurant_name: 'Restaurant',
                    restaurant_tagline: 'Delivery de qualidade',
                    hero_title: 'Bem-vindo',
                    hero_subtitle: 'Peça agora pelo WhatsApp',
                };
                applyConfig();
            }
        } catch (e) {
            showToast('Erro ao carregar configurações.', 'error');
            siteConfig = { restaurant_name: 'Restaurant' };
        }
        // Toast helper global (caso não exista)
        if (!window.showToast) {
            window.showToast = function(message, type = 'error') {
                let toast = document.getElementById('toast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'toast';
                    toast.style.position = 'fixed';
                    toast.style.bottom = '32px';
                    toast.style.left = '50%';
                    toast.style.transform = 'translateX(-50%)';
                    toast.style.background = type === 'error' ? '#dc2626' : '#16a34a';
                    toast.style.color = '#fff';
                    toast.style.padding = '16px 32px';
                    toast.style.borderRadius = '8px';
                    toast.style.zIndex = 9999;
                    toast.style.fontSize = '1rem';
                    document.body.appendChild(toast);
                }
                toast.textContent = message;
                toast.style.background = type === 'error' ? '#dc2626' : '#16a34a';
                toast.style.display = 'block';
                setTimeout(() => { toast.style.display = 'none'; }, 3500);
            };
        }
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

        // Nav brand
        setText('nav-brand', c.restaurant_name);
        setText('footer-brand', c.restaurant_name);
        setText('footer-tagline', c.restaurant_tagline);
        setText('footer-copy', c.footer_text);
        setText('footer-address', c.restaurant_address);
        setText('footer-phone', c.restaurant_phone);
        setText('footer-email', c.restaurant_email);

        // Hero
        setText('hero-title', c.hero_title);
        setText('hero-subtitle', c.hero_subtitle);

        // About
        setText('about-title', c.about_title);
        setText('about-text', c.about_text);

        // Opening hours
        setText('opening-hours', c.opening_hours);

        // WhatsApp
        const waNum = c.whatsapp_number || '5511999998888';
        const waMsg = encodeURIComponent(c.whatsapp_message || 'Olá, gostaria de fazer uma reserva!');
        const waUrl = `https://wa.me/${waNum}?text=${waMsg}`;

        const waFloat = document.getElementById('whatsapp-float');
        if (waFloat) waFloat.href = waUrl;

        const waCta = document.getElementById('whatsapp-cta');
        if (waCta) waCta.href = waUrl;

        // Social links
        setHref('link-instagram', c.instagram_url);
        setHref('link-facebook', c.facebook_url);

        // Page-specific config
        if (typeof applyPageConfig === 'function') {
            applyPageConfig(c);
        }
    }


    window.setText = function setText(id, text) {
        const el = document.getElementById(id);
        if (el && text) el.textContent = text;
    };

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
        const waNum = siteConfig.whatsapp_number || '5511999998888';
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
        var toast = document.createElement('div');
        toast.className = 'fixed top-24 right-4 z-[9999] bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl font-medium transform transition-all flex items-center gap-3';

        var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'w-6 h-6');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('viewBox', '0 0 24 24');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('d', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z');
        icon.appendChild(path);
        toast.appendChild(icon);

        var textDiv = document.createElement('div');
        var title = document.createElement('div');
        title.className = 'font-bold';
        title.textContent = 'Adicionado ao carrinho!';
        var subtitle = document.createElement('div');
        subtitle.className = 'text-sm text-green-100';
        subtitle.textContent = 'Clique no botão laranja no canto inferior direito';
        textDiv.appendChild(title);
        textDiv.appendChild(subtitle);
        toast.appendChild(textDiv);

        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(function () { toast.remove(); }, 300);
        }, 3500);
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

})(); // end IIFE
