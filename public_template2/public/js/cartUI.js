// ============================================
// Cart UI — Floating cart button and sidebar
// Hardened: XSS-safe DOM rendering, proper event cleanup, image validation
// ============================================

(function () {
    'use strict';

    // --- Safe DOM helpers ---
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function isValidImageURL(url) {
        if (!url || typeof url !== 'string') return false;
        // Only allow relative paths (our uploads) or https
        if (url.startsWith('/uploads/')) return true;
        try {
            var parsed = new URL(url);
            return parsed.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    function formatPrice(cents) {
        var value = Number(cents);
        if (!Number.isFinite(value) || value < 0) return 'R$ 0,00';
        return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // --- CartUI class ---
    function CartUI() {
        this.isOpen = false;
        this._boundKeydown = null;
        this._boundToggle = null;
        this._boundClose = null;        this._lastFocusedElement = null; // Sprint 1 - S1-T5: Focus restoration        this._init();
    }

    CartUI.prototype._init = function () {
        this._createCartButton();
        this._createCartSidebar();
        this._attachEvents();
        window.cart.onChange(this.update.bind(this));
        this.update();
    };

    CartUI.prototype._createCartButton = function () {
        var self = this;
        var button = document.createElement('button');
        button.id = 'cart-button';
        button.className = 'fixed bottom-6 right-6 z-50 bg-brand-500 hover:bg-brand-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110';
        button.setAttribute('aria-label', 'Abrir Carrinho');
        button.innerHTML = [
            '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
            '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
            '</svg>',
            '<span id="cart-count" class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg hidden">0</span>',
        ].join('\n');

        // Store bound handler for cleanup
        this._boundToggle = this.toggle.bind(this);
        button.addEventListener('click', this._boundToggle);

        var style = document.createElement('style');
        style.textContent = [
            '#cart-button { box-shadow: 0 4px 20px rgba(238, 118, 32, 0.5); }',
            '#cart-button:hover { box-shadow: 0 8px 30px rgba(238, 118, 32, 0.7); }',
            '@keyframes cartPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }',
            '#cart-count:not(.hidden) { animation: cartPulse 2s infinite; }',
        ].join('\n');
        document.head.appendChild(style);
        document.body.appendChild(button);
    };

    CartUI.prototype._createCartSidebar = function () {
        var self = this;

        var sidebar = document.createElement('div');
        sidebar.id = 'cart-sidebar';
        sidebar.setAttribute('role', 'dialog');
        sidebar.setAttribute('aria-modal', 'true');
        sidebar.setAttribute('aria-label', 'Carrinho de compras');
        sidebar.className = 'fixed inset-y-0 right-0 w-full sm:w-96 bg-dark-900 shadow-2xl transform translate-x-full transition-transform duration-300 z-[60] flex flex-col';

        // Header
        var headerDiv = document.createElement('div');
        headerDiv.className = 'p-6 border-b border-white/10 flex items-center justify-between';

        var title = document.createElement('h3');
        title.className = 'text-xl font-bold text-white flex items-center gap-2';
        title.textContent = 'Carrinho ';
        var countSpan = document.createElement('span');
        countSpan.id = 'cart-sidebar-count';
        countSpan.className = 'text-sm text-gray-400';
        countSpan.textContent = '(0)';
        title.appendChild(countSpan);
        headerDiv.appendChild(title);

        var closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-400 hover:text-white transition';
        closeBtn.setAttribute('aria-label', 'Fechar carrinho');
        closeBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        closeBtn.addEventListener('click', function () { self.close(); });
        headerDiv.appendChild(closeBtn);

        sidebar.appendChild(headerDiv);

        // Items container
        var itemsDiv = document.createElement('div');
        itemsDiv.id = 'cart-items';
        itemsDiv.className = 'flex-1 overflow-y-auto p-6';
        sidebar.appendChild(itemsDiv);

        // Footer
        var footerDiv = document.createElement('div');
        footerDiv.className = 'p-6 border-t border-white/10 bg-dark-800';

        var totalRow = document.createElement('div');
        totalRow.className = 'flex justify-between text-white text-lg font-bold mb-4';
        var totalLabel = document.createElement('span');
        totalLabel.textContent = 'Total';
        var totalValue = document.createElement('span');
        totalValue.id = 'cart-total';
        totalValue.className = 'text-brand-400';
        totalValue.textContent = 'R$ 0,00';
        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalValue);
        footerDiv.appendChild(totalRow);

        var checkoutBtn = document.createElement('button');
        checkoutBtn.className = 'w-full bg-brand-500 hover:bg-brand-600 text-white py-4 rounded-xl font-semibold transition';
        checkoutBtn.textContent = 'Finalizar Pedido';
        checkoutBtn.addEventListener('click', function () { self.checkout(); });
        footerDiv.appendChild(checkoutBtn);

        var clearBtn = document.createElement('button');
        clearBtn.className = 'w-full mt-2 text-gray-400 hover:text-white text-sm py-2 transition';
        clearBtn.textContent = 'Limpar Carrinho';
        clearBtn.addEventListener('click', function () { self.clear(); });
        footerDiv.appendChild(clearBtn);

        sidebar.appendChild(footerDiv);

        // Backdrop
        var backdrop = document.createElement('div');
        backdrop.id = 'cart-backdrop';
        backdrop.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] hidden';

        // Store bound handler for cleanup
        this._boundClose = this.close.bind(this);
        backdrop.addEventListener('click', this._boundClose);

        document.body.appendChild(backdrop);
        document.body.appendChild(sidebar);
    };

    CartUI.prototype._attachEvents = function () {
        var self = this;
        this._boundKeydown = function (e) {
            if (!self.isOpen) return;

            // ESC to close
            if (e.key === 'Escape') {
                self.close();
                return;
            }

            // Sprint 1 - S1-T5: Tab focus trap
            if (e.key === 'Tab') {
                var sidebar = document.getElementById('cart-sidebar');
                var focusable = sidebar.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])');
                var focusableArray = Array.from(focusable);
                
                if (focusableArray.length === 0) return;

                var firstElement = focusableArray[0];
                var lastElement = focusableArray[focusableArray.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        document.addEventListener('keydown', this._boundKeydown);
    };

    CartUI.prototype.update = function () {
        var count = window.cart.getCount();
        var total = window.cart.getTotal();

        var badge = document.getElementById('cart-count');
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        var sidebarCount = document.getElementById('cart-sidebar-count');
        if (sidebarCount) sidebarCount.textContent = '(' + count + ')';

        var totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = formatPrice(total);

        this._renderItems();
    };

    // XSS-safe item rendering using DOM methods
    CartUI.prototype._renderItems = function () {
        var self = this;
        var container = document.getElementById('cart-items');
        var items = window.cart.items;

        // Clear container safely
        container.textContent = '';

        if (items.length === 0) {
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'flex flex-col items-center justify-center h-full text-gray-400 text-center';
            emptyDiv.innerHTML = [
                '<svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
                '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
                '</svg>',
            ].join('\n');
            var emptyP1 = document.createElement('p');
            emptyP1.textContent = 'Seu carrinho está vazio';
            emptyDiv.appendChild(emptyP1);
            var emptyP2 = document.createElement('p');
            emptyP2.className = 'text-sm mt-2';
            emptyP2.textContent = 'Adicione itens do cardápio';
            emptyDiv.appendChild(emptyP2);
            container.appendChild(emptyDiv);
            return;
        }

        items.forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'bg-dark-800 rounded-xl p-4 mb-3 border border-white/5';
            card.setAttribute('data-item-id', item.id);

            var topRow = document.createElement('div');
            topRow.className = 'flex items-start gap-3';

            // Image — validated URL
            if (item.image && isValidImageURL(item.image)) {
                var img = document.createElement('img');
                img.className = 'w-16 h-16 rounded-lg object-cover';
                img.alt = item.name;
                img.loading = 'lazy';
                img.src = item.image;
                img.onerror = function () { this.style.display = 'none'; };
                topRow.appendChild(img);
            }

            var infoDiv = document.createElement('div');
            infoDiv.className = 'flex-1';

            var nameEl = document.createElement('h4');
            nameEl.className = 'text-white font-medium mb-1';
            nameEl.textContent = item.name; // textContent = XSS safe

            var priceEl = document.createElement('p');
            priceEl.className = 'text-brand-400 font-semibold';
            priceEl.textContent = formatPrice(item.price);

            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(priceEl);
            topRow.appendChild(infoDiv);
            card.appendChild(topRow);

            // Quantity controls
            var controlRow = document.createElement('div');
            controlRow.className = 'flex items-center justify-between mt-3';

            var qtyDiv = document.createElement('div');
            qtyDiv.className = 'flex items-center gap-2';

            var minusBtn = document.createElement('button');
            minusBtn.className = 'w-8 h-8 bg-dark-700 hover:bg-dark-900 text-white rounded-lg transition';
            minusBtn.textContent = '-';
            minusBtn.setAttribute('aria-label', 'Diminuir quantidade');
            minusBtn.addEventListener('click', function () { self.decreaseQuantity(item.id); });

            var qtySpan = document.createElement('span');
            qtySpan.className = 'text-white w-8 text-center';
            qtySpan.textContent = item.quantity;

            var plusBtn = document.createElement('button');
            plusBtn.className = 'w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition';
            plusBtn.textContent = '+';
            plusBtn.setAttribute('aria-label', 'Aumentar quantidade');
            plusBtn.addEventListener('click', function () { self.increaseQuantity(item.id); });

            qtyDiv.appendChild(minusBtn);
            qtyDiv.appendChild(qtySpan);
            qtyDiv.appendChild(plusBtn);

            var removeBtn = document.createElement('button');
            removeBtn.className = 'text-red-400 hover:text-red-300 text-sm transition';
            removeBtn.textContent = 'Remover';
            removeBtn.addEventListener('click', function () { self.removeItem(item.id); });

            controlRow.appendChild(qtyDiv);
            controlRow.appendChild(removeBtn);
            card.appendChild(controlRow);

            container.appendChild(card);
        });
    };

    CartUI.prototype.toggle = function () {
        this.isOpen ? this.close() : this.open();
    };

    CartUI.prototype.open = function () {
        // Sprint 1 - S1-T5: Save focus for restoration
        this._lastFocusedElement = document.activeElement;

        this.isOpen = true;
        document.getElementById('cart-sidebar').classList.remove('translate-x-full');
        document.getElementById('cart-backdrop').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Sprint 1 - S1-T5: Focus close button after animation
        var self = this;
        setTimeout(function () {

        // Sprint 1 - S1-T5: Restore focus
        if (this._lastFocusedElement && typeof this._lastFocusedElement.focus === 'function') {
            this._lastFocusedElement.focus();
            this._lastFocusedElement = null;
        }
            var closeBtn = document.getElementById('cart-close-btn');
            if (closeBtn) closeBtn.focus();
        }, 100);
    };

    CartUI.prototype.close = function () {
        this.isOpen = false;
        document.getElementById('cart-sidebar').classList.add('translate-x-full');
        document.getElementById('cart-backdrop').classList.add('hidden');
        document.body.style.overflow = '';
    };

    CartUI.prototype.increaseQuantity = function (dishId) {
        var item = window.cart.items.find(function (i) { return i.id === dishId; });
        if (item) {
            window.cart.updateQuantity(dishId, item.quantity + 1);
        }
    };

    CartUI.prototype.decreaseQuantity = function (dishId) {
        var item = window.cart.items.find(function (i) { return i.id === dishId; });
        if (item) {
            if (item.quantity === 1) {
                this.removeItem(dishId);
            } else {
                window.cart.updateQuantity(dishId, item.quantity - 1);
            }
        }
    };

    CartUI.prototype.removeItem = function (dishId) {
        window.cart.remove(dishId);
    };

    CartUI.prototype.clear = function () {
        if (confirm('Deseja realmente limpar o carrinho?')) {
            window.cart.clear();
        }
    };

    CartUI.prototype.checkout = function () {
        this.close();
        window.orderModal.openCartCheckout();
    };

    // Cleanup method for proper teardown
    CartUI.prototype.destroy = function () {
        try {
            // Remove cart change listener
            if (window.cart && this._boundUpdate) {
                // Note: Cart doesn't expose removeListener, but we clear reference
                this._boundUpdate = null;
            }

            // Remove all button event listeners
            var cartBtn = document.getElementById('cart-button');
            var closeBtn = document.getElementById('cart-close');
            var clearBtn = document.getElementById('cart-clear-btn');
            var checkoutBtn = document.getElementById('cart-checkout-btn');
            var backdrop = document.getElementById('cart-backdrop');

            if (cartBtn && this._boundToggle) {
                cartBtn.removeEventListener('click', this._boundToggle);
            }
            if (closeBtn && this._boundClose) {
                closeBtn.removeEventListener('click', this._boundClose);
            }
            if (clearBtn && this._boundClear) {
                clearBtn.removeEventListener('click', this._boundClear);
            }
            if (checkoutBtn && this._boundCheckout) {
                checkoutBtn.removeEventListener('click', this._boundCheckout);
            }
            if (backdrop && this._boundClose) {
                backdrop.removeEventListener('click', this._boundClose);
            }

            // Clear stored references
            this._boundToggle = null;
            this._boundClose = null;
            this._boundClear = null;
            this._boundCheckout = null;
            this._boundUpdate = null;
            this.isOpen = false;
        } catch (e) {
            console.error('CartUI destroy error:', e);
        }
    };

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        var instance = new CartUI();
        Object.defineProperty(window, 'cartUI', {
            value: instance,
            writable: false,
            configurable: false,
        });
    });
})();
