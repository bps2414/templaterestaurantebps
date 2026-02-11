/**
 * FluxPay Landing Page — scripts.js
 * Vanilla JS (ES6) — Mobile menu, smooth scroll, pricing toggle,
 * FAQ accordion accessibility, newsletter form validation.
 */

(function () {
    'use strict';

    // ============================================
    // 1. MOBILE MENU TOGGLE
    // ============================================
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
            mainNav.classList.toggle('is-open', !isOpen);

            // Trap focus inside nav when open
            if (!isOpen) {
                const firstLink = mainNav.querySelector('.header__nav-link');
                if (firstLink) firstLink.focus();
            }
        });

        // Close menu when clicking a nav link
        mainNav.addEventListener('click', (e) => {
            if (e.target.classList.contains('header__nav-link')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu');
                mainNav.classList.remove('is-open');
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu');
                mainNav.classList.remove('is-open');
                menuToggle.focus();
            }
        });
    }

    // ============================================
    // 2. HEADER SCROLL SHADOW
    // ============================================
    const header = document.querySelector('.header');

    if (header) {
        const onScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 10);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ============================================
    // 3. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Update URL without jump
                history.pushState(null, '', targetId);
            }
        });
    });

    // ============================================
    // 4. PRICING TOGGLE (Monthly / Annual)
    // ============================================
    const pricingToggle = document.getElementById('pricing-toggle');

    if (pricingToggle) {
        pricingToggle.addEventListener('click', () => {
            const isAnnual = pricingToggle.getAttribute('aria-checked') === 'true';
            pricingToggle.setAttribute('aria-checked', String(!isAnnual));

            const amounts = document.querySelectorAll('.pricing-card__amount');
            amounts.forEach((el) => {
                const monthly = el.dataset.monthly;
                const annual = el.dataset.annual;

                if (monthly !== undefined && annual !== undefined) {
                    const value = !isAnnual ? annual : monthly;
                    el.textContent = `R$ ${value}`;
                }
            });
        });

        // Keyboard support
        pricingToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pricingToggle.click();
            }
        });
    }

    // ============================================
    // 5. FAQ ACCORDION ACCESSIBILITY
    // ============================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item) => {
        const summary = item.querySelector('.faq-item__question');
        if (!summary) return;

        // Update aria-expanded on toggle
        item.addEventListener('toggle', () => {
            const isOpen = item.open;
            summary.setAttribute('aria-expanded', String(isOpen));
        });
    });

    // ============================================
    // 6. NEWSLETTER FORM VALIDATION
    // ============================================
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const emailError = document.getElementById('email-error');
    const emailSuccess = document.getElementById('email-success');

    if (newsletterForm && emailInput && emailError && emailSuccess) {
        // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();

            // Reset states
            emailError.hidden = true;
            emailSuccess.hidden = true;
            emailInput.removeAttribute('aria-invalid');

            // Validate
            if (!email) {
                showError('Por favor, informe seu email.');
                return;
            }

            if (!emailRegex.test(email)) {
                showError('Hmm, esse email não parece válido. Confere aí?');
                return;
            }

            // Save to LocalStorage
            saveEmail(email);

            // Show success
            emailSuccess.textContent = 'Valeu! Te aviso quando tiver novidades. 🎉';
            emailSuccess.hidden = false;
            emailInput.value = '';
            emailInput.removeAttribute('aria-invalid');

            // Hide success after 5s
            setTimeout(() => {
                emailSuccess.hidden = true;
            }, 5000);
        });

        function showError(message) {
            emailError.textContent = message;
            emailError.hidden = false;
            emailInput.setAttribute('aria-invalid', 'true');
            emailInput.focus();
        }

        async function saveEmail(email) {
            try {
                // Try API first (SaaS mode)
                const res = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                if (res.ok) {
                    console.log('[FluxPay] Email inscrito via API:', email);
                    return;
                }

                // If API status is 409, email already subscribed — still OK
                if (res.status === 409) {
                    console.log('[FluxPay] Email já inscrito:', email);
                    return;
                }
            } catch {
                // API unavailable — fallback to localStorage
            }

            // Fallback: save to localStorage (static mode)
            try {
                const key = 'lp_subscriptions';
                const stored = localStorage.getItem(key);
                const subscriptions = stored ? JSON.parse(stored) : [];

                if (!subscriptions.includes(email)) {
                    subscriptions.push(email);
                    localStorage.setItem(key, JSON.stringify(subscriptions));
                }

                console.log('[FluxPay] Email salvo (localStorage):', email);
                console.log('[FluxPay] Total inscritos:', subscriptions.length);
            } catch (err) {
                console.warn('[FluxPay] Não foi possível salvar:', err);
            }
        }
    }

    // ============================================
    // 7. INTERSECTION OBSERVER — SCROLL REVEAL
    // ============================================
    if ('IntersectionObserver' in window) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            // Reveal single sections
            const revealSections = document.querySelectorAll(
                '.features, .steps, .testimonials, .pricing, .faq'
            );

            // Add reveal class
            revealSections.forEach((section) => section.classList.add('reveal'));

            // Stagger grids
            const grids = document.querySelectorAll(
                '.features__grid, .testimonials__grid, .pricing__grid, .steps__grid'
            );
            grids.forEach((grid) => grid.classList.add('reveal-stagger'));

            const observerOptions = {
                threshold: 0.08,
                rootMargin: '0px 0px -60px 0px',
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            revealSections.forEach((s) => observer.observe(s));
            grids.forEach((g) => observer.observe(g));
        }
    }
})();
