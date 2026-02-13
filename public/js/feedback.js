// ============================================
// Feedback System — Toast Notifications + Button Loading + Skeleton Loaders
// Sprint 1: S1-T1 (Toasts & Loading) + S1-T6 (Skeletons)
// ============================================

(function () {
    'use strict';

    // ─── Toast Notification System ───────────────────────────────
    // Non-intrusive, stacked, auto-dismiss, accessible

    var TOAST_CONTAINER_ID = 'toast-container';
    var TOAST_MAX = 5;
    var TOAST_DURATION = 4000;

    var toastTypes = {
        success: {
            bg: 'bg-green-600',
            icon: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
        error: {
            bg: 'bg-red-600',
            icon: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>',
        },
        info: {
            bg: 'bg-brand-500',
            icon: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        },
    };

    function getOrCreateContainer() {
        var container = document.getElementById(TOAST_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = TOAST_CONTAINER_ID;
            container.className = 'fixed top-4 right-4 z-[10001] flex flex-col gap-3 pointer-events-none';
            container.style.maxWidth = '400px';
            container.style.width = '100%';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-label', 'Notificações');
            container.setAttribute('role', 'status');
            document.body.appendChild(container);
        }
        return container;
    }

    function showToastV2(message, type, duration) {
        type = type || 'info';
        duration = duration || TOAST_DURATION;

        var container = getOrCreateContainer();
        var config = toastTypes[type] || toastTypes.info;

        // Limit max visible toasts
        while (container.children.length >= TOAST_MAX) {
            container.removeChild(container.firstChild);
        }

        var toast = document.createElement('div');
        toast.className = [
            config.bg,
            'text-white px-4 py-3 rounded-xl shadow-2xl pointer-events-auto',
            'flex items-start gap-3 transform transition-all duration-300',
            'translate-x-full opacity-0',
        ].join(' ');
        toast.setAttribute('role', 'alert');

        // Icon
        var iconWrap = document.createElement('span');
        iconWrap.className = 'mt-0.5';
        iconWrap.innerHTML = config.icon;

        // Text
        var textSpan = document.createElement('span');
        textSpan.className = 'text-sm font-medium flex-1';
        textSpan.textContent = message;

        // Close button
        var closeBtn = document.createElement('button');
        closeBtn.className = 'text-white/70 hover:text-white transition ml-2 flex-shrink-0';
        closeBtn.setAttribute('aria-label', 'Fechar notificação');
        closeBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        closeBtn.addEventListener('click', function () {
            dismissToast(toast);
        });

        toast.appendChild(iconWrap);
        toast.appendChild(textSpan);
        toast.appendChild(closeBtn);
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.remove('translate-x-full', 'opacity-0');
                toast.classList.add('translate-x-0', 'opacity-100');
            });
        });

        // Progress bar (visual timer)
        var progress = document.createElement('div');
        progress.className = 'absolute bottom-0 left-0 h-0.5 bg-white/30 rounded-b-xl';
        progress.style.width = '100%';
        progress.style.transition = 'width ' + duration + 'ms linear';
        toast.style.position = 'relative';
        toast.style.overflow = 'hidden';
        toast.appendChild(progress);

        requestAnimationFrame(function () {
            progress.style.width = '0%';
        });

        // Auto dismiss
        var timer = setTimeout(function () {
            dismissToast(toast);
        }, duration);

        // Pause on hover
        toast.addEventListener('mouseenter', function () {
            clearTimeout(timer);
            progress.style.transition = 'none';
        });

        toast.addEventListener('mouseleave', function () {
            var remaining = duration * (parseFloat(progress.style.width) / 100) || 1500;
            progress.style.transition = 'width ' + remaining + 'ms linear';
            progress.style.width = '0%';
            timer = setTimeout(function () {
                dismissToast(toast);
            }, remaining);
        });

        return toast;
    }

    function dismissToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }

    // ─── Button Loading State ────────────────────────────────────

    var SPINNER_SVG = '<svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>';

    /**
     * Set button loading state
     * @param {HTMLButtonElement} btn
     * @param {boolean} loading
     * @param {string} [loadingText] - optional text while loading
     */
    function setButtonLoading(btn, loading, loadingText) {
        if (!btn) return;

        if (loading) {
            // Save original state
            btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
            btn.disabled = true;
            btn.classList.add('opacity-70', 'cursor-not-allowed');
            btn.setAttribute('aria-busy', 'true');

            // Build loading content
            var spinnerWrap = document.createElement('span');
            spinnerWrap.className = 'flex items-center justify-center gap-2';
            spinnerWrap.innerHTML = SPINNER_SVG;

            var text = document.createElement('span');
            text.textContent = loadingText || 'Processando...';
            spinnerWrap.appendChild(text);

            btn.textContent = '';
            btn.appendChild(spinnerWrap);
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
            btn.removeAttribute('aria-busy');

            if (btn.dataset.originalText) {
                btn.innerHTML = btn.dataset.originalText;
                delete btn.dataset.originalText;
            }
        }
    }

    // ─── Skeleton Loaders ────────────────────────────────────────

    /**
     * Inject skeleton CSS once (shimmer animation)
     */
    function injectSkeletonCSS() {
        if (document.getElementById('skeleton-styles')) return;
        var style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = [
            '@keyframes shimmer {',
            '  0% { background-position: -200% 0; }',
            '  100% { background-position: 200% 0; }',
            '}',
            '@keyframes spin {',
            '  from { transform: rotate(0deg); }',
            '  to { transform: rotate(360deg); }',
            '}',
            '.animate-spin { animation: spin 1s linear infinite; }',
            '.skeleton {',
            '  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);',
            '  background-size: 200% 100%;',
            '  animation: shimmer 1.5s ease-in-out infinite;',
            '  border-radius: 0.5rem;',
            '}',
            '.skeleton-text {',
            '  height: 1rem;',
            '  border-radius: 0.25rem;',
            '}',
            '.skeleton-title {',
            '  height: 1.5rem;',
            '  border-radius: 0.25rem;',
            '}',
        ].join('\n');
        document.head.appendChild(style);
    }

    /**
     * Generate skeleton HTML for a menu/dish card
     * @param {number} count - number of skeleton cards
     */
    function menuCardSkeletons(count) {
        count = count || 6;
        injectSkeletonCSS();

        var cards = [];
        for (var i = 0; i < count; i++) {
            cards.push([
                '<div class="bg-dark-800/60 rounded-xl overflow-hidden border border-white/5 flex flex-col" aria-hidden="true">',
                '  <div class="skeleton h-48 w-full" style="border-radius: 0"></div>',
                '  <div class="p-5 flex flex-col gap-3">',
                '    <div class="skeleton skeleton-text w-20"></div>',
                '    <div class="skeleton skeleton-title w-3/4"></div>',
                '    <div class="skeleton skeleton-text w-full"></div>',
                '    <div class="skeleton skeleton-text w-2/3"></div>',
                '    <div class="border-t border-white/5 pt-3 mt-2">',
                '      <div class="flex justify-between items-center">',
                '        <div class="skeleton skeleton-title w-24"></div>',
                '      </div>',
                '      <div class="grid grid-cols-2 gap-2 mt-3">',
                '        <div class="skeleton h-10 rounded-lg"></div>',
                '        <div class="skeleton h-10 rounded-lg"></div>',
                '      </div>',
                '    </div>',
                '  </div>',
                '</div>',
            ].join('\n'));
        }
        return '<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">' + cards.join('') + '</div>';
    }

    /**
     * Generate skeleton HTML for featured dish cards (homepage — 3 cards, taller)
     */
    function featuredCardSkeletons() {
        injectSkeletonCSS();

        var cards = [];
        for (var i = 0; i < 3; i++) {
            cards.push([
                '<div class="bg-dark-800/60 rounded-2xl overflow-hidden border border-white/5" aria-hidden="true">',
                '  <div class="skeleton h-64 w-full" style="border-radius: 0"></div>',
                '  <div class="p-6 flex flex-col gap-3">',
                '    <div class="skeleton skeleton-text w-20"></div>',
                '    <div class="skeleton skeleton-title w-2/3"></div>',
                '    <div class="skeleton skeleton-text w-full"></div>',
                '    <div class="skeleton skeleton-text w-4/5"></div>',
                '    <div class="flex justify-between items-center mt-2">',
                '      <div class="skeleton skeleton-title w-24"></div>',
                '    </div>',
                '    <div class="grid grid-cols-2 gap-2 mt-2">',
                '      <div class="skeleton h-10 rounded-lg"></div>',
                '      <div class="skeleton h-10 rounded-lg"></div>',
                '    </div>',
                '  </div>',
                '</div>',
            ].join('\n'));
        }
        return cards.join('');
    }

    /**
     * Generate skeleton HTML for category cards (homepage — 4 column)
     */
    function categoryCardSkeletons() {
        injectSkeletonCSS();

        var cards = [];
        for (var i = 0; i < 4; i++) {
            cards.push([
                '<div class="bg-dark-800/60 rounded-2xl p-8 border border-white/5 flex flex-col items-center gap-4" aria-hidden="true">',
                '  <div class="skeleton w-14 h-14 rounded-full"></div>',
                '  <div class="skeleton skeleton-title w-3/4"></div>',
                '  <div class="skeleton skeleton-text w-16"></div>',
                '</div>',
            ].join('\n'));
        }
        return cards.join('');
    }

    /**
     * Generate skeleton HTML for gallery grid
     * @param {number} count
     */
    function gallerySkeletons(count) {
        count = count || 8;
        injectSkeletonCSS();

        var items = [];
        for (var i = 0; i < count; i++) {
            items.push('<div class="skeleton aspect-square rounded-xl" aria-hidden="true"></div>');
        }
        return items.join('');
    }

    /**
     * Generate skeleton HTML for category tabs
     */
    function categoryTabSkeletons() {
        injectSkeletonCSS();

        var tabs = [];
        var widths = ['w-16', 'w-20', 'w-24', 'w-20', 'w-16'];
        for (var i = 0; i < widths.length; i++) {
            tabs.push('<div class="skeleton h-9 ' + widths[i] + ' rounded-full flex-shrink-0" aria-hidden="true"></div>');
        }
        return tabs.join('');
    }

    // ─── Expose Public API ───────────────────────────────────────

    var FeedbackSystem = Object.freeze({
        // Toast
        toast: showToastV2,
        success: function (msg, dur) { return showToastV2(msg, 'success', dur); },
        error: function (msg, dur) { return showToastV2(msg, 'error', dur); },
        warning: function (msg, dur) { return showToastV2(msg, 'warning', dur); },
        info: function (msg, dur) { return showToastV2(msg, 'info', dur); },

        // Button loading
        setButtonLoading: setButtonLoading,

        // Skeletons
        skeletons: Object.freeze({
            menuCards: menuCardSkeletons,
            featuredCards: featuredCardSkeletons,
            categoryCards: categoryCardSkeletons,
            gallery: gallerySkeletons,
            categoryTabs: categoryTabSkeletons,
        }),
    });

    Object.defineProperty(window, 'feedback', {
        value: FeedbackSystem,
        writable: false,
        configurable: false,
    });

    // ─── Override legacy showToast ────────────────────────────────
    // Make the old showToast() calls use the new system seamlessly
    window.showToast = function (message, type) {
        showToastV2(message, type || 'info');
    };

})();
