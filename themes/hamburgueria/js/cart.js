// ============================================
// Cart Module — Shopping cart with localStorage
// Hardened: schema validation, size limits, price integrity
// ============================================

(function () {
    'use strict';

    var STORAGE_KEY = 'restaurant_cart';
    var MAX_ITEMS = 50;
    var MAX_QUANTITY_PER_ITEM = 99;
    var MAX_PRICE = 99999; // R$ 999.99 max per item (in cents)

    function Cart() {
        this.items = this._load();
        this._listeners = [];
        this._undoState = null; // For undo clear functionality
        this._quotaExceeded = false;
        this._saveTimeout = null; // For debounced saves
    }

    Cart.prototype._isValidItem = function (item) {
        return (
            item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            item.id.length > 0 &&
            item.id.length <= 100 &&
            typeof item.name === 'string' &&
            item.name.length > 0 &&
            item.name.length <= 150 &&
            typeof item.price === 'number' &&
            Number.isFinite(item.price) &&
            item.price > 0 &&
            item.price <= MAX_PRICE &&
            typeof item.quantity === 'number' &&
            Number.isInteger(item.quantity) &&
            item.quantity >= 1 &&
            item.quantity <= MAX_QUANTITY_PER_ITEM
        );
    };

    Cart.prototype._sanitizeItem = function (raw) {
        return {
            id: String(raw.id || '').slice(0, 100),
            name: String(raw.name || '').replace(/<[^>]*>/g, '').slice(0, 150),
            price: Number(raw.price) || 0,
            image: typeof raw.image === 'string' ? raw.image.slice(0, 500) : '',
            quantity: Math.min(Math.max(1, parseInt(raw.quantity, 10) || 1), MAX_QUANTITY_PER_ITEM),
        };
    };

    Cart.prototype._load = function () {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            var parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) return [];
            var self = this;
            return parsed
                .map(function (item) { return self._sanitizeItem(item); })
                .filter(function (item) { return self._isValidItem(item); })
                .slice(0, MAX_ITEMS);
        } catch (e) {
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    };

    Cart.prototype._save = function () {
        var self = this;

        // Clear any pending save
        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
        }

        // Debounce: save after 300ms of inactivity
        this._saveTimeout = setTimeout(function () {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(self.items));
                self._quotaExceeded = false;
            } catch (e) {
                console.error('Cart save failed:', e);

                // Handle quota exceeded specifically
                if (e.name === 'QuotaExceededError' || e.code === 22) {
                    self._quotaExceeded = true;
                    self._handleQuotaExceeded();
                }
            }
        }, 300);

        // Always notify immediately for UI updates
        this._notify();
    };

    // Force immediate save (for critical operations like checkout)
    Cart.prototype._saveImmediate = function () {
        if (this._saveTimeout) {
            clearTimeout(this._saveTimeout);
            this._saveTimeout = null;
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
            this._quotaExceeded = false;
        } catch (e) {
            console.error('Cart save failed:', e);
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                this._quotaExceeded = true;
                this._handleQuotaExceeded();
            }
        }
        this._notify();
    };

    Cart.prototype._handleQuotaExceeded = function () {
        // Show user-friendly notification
        var toast = document.createElement('div');
        toast.className = 'fixed top-24 right-4 z-[10000] bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl font-medium max-w-sm';

        var title = document.createElement('div');
        title.className = 'font-bold mb-1';
        title.textContent = 'Armazenamento Cheio';

        var msg = document.createElement('div');
        msg.className = 'text-sm';
        msg.textContent = 'Seu navegador está sem espaço. Limpe o histórico ou use modo anônimo.';

        toast.appendChild(title);
        toast.appendChild(msg);
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { toast.remove(); }, 300);
        }, 6000);
    };

    Cart.prototype.add = function (dish) {
        if (!dish || !dish.id || !dish.name || !dish.price) return;

        var sanitized = this._sanitizeItem({ id: dish.id, name: dish.name, price: dish.price, image: dish.image, quantity: 1 });
        if (!this._isValidItem(sanitized)) return;

        var existing = this.items.find(function (item) { return item.id === sanitized.id; });
        if (existing) {
            if (existing.quantity >= MAX_QUANTITY_PER_ITEM) return;
            existing.quantity += 1;
        } else {
            if (this.items.length >= MAX_ITEMS) return;
            this.items.push(sanitized);
        }
        this._save();

        // Screen reader announcement
        if (window.a11y) {
            window.a11y.announceCartUpdate(1, 'add', sanitized.name);
        }

        // Notification moved to caller (app.js) to avoid duplication
    };

    Cart.prototype.remove = function (dishId) {
        if (typeof dishId !== 'string') return;
        this.items = this.items.filter(function (item) { return item.id !== dishId; });
        this._save();

        // Screen reader announcement
        if (window.a11y) {
            window.a11y.announceCartUpdate(this.getCount(), 'remove');
        }
    };

    Cart.prototype.updateQuantity = function (dishId, quantity) {
        if (typeof dishId !== 'string') return;
        var item = this.items.find(function (item) { return item.id === dishId; });
        if (item) {
            item.quantity = Math.max(1, Math.min(MAX_QUANTITY_PER_ITEM, parseInt(quantity, 10) || 1));
            this._save();

            // Screen reader announcement
            if (window.a11y) {
                window.a11y.announceCartUpdate(this.getCount(), 'update');
            }
        }
    };

    Cart.prototype.clear = function () {
        // Save undo state before clearing
        this._undoState = JSON.parse(JSON.stringify(this.items));
        this.items = [];
        this._saveImmediate(); // Immediate save for critical operation

        // Screen reader announcement
        if (window.a11y) {
            window.a11y.announceCartUpdate(0, 'clear');
        }

        // Show undo toast
        this._showUndoToast();
    };

    Cart.prototype.undoClear = function () {
        if (this._undoState && this._undoState.length > 0) {
            this.items = JSON.parse(JSON.stringify(this._undoState));
            this._undoState = null;
            this._saveImmediate(); // Immediate save for undo
            this._notify();
            this._showToast('Carrinho restaurado', 'success');
            return true;
        }
        return false;
    };

    Cart.prototype._showUndoToast = function () {
        var self = this;
        var toast = document.createElement('div');
        toast.className = 'fixed bottom-24 right-4 z-[10000] bg-dark-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4';

        var text = document.createElement('span');
        text.textContent = 'Carrinho limpo';

        var undoBtn = document.createElement('button');
        undoBtn.className = 'bg-brand-500 hover:bg-brand-600 px-4 py-1 rounded-lg font-medium transition';
        undoBtn.textContent = 'Desfazer';
        undoBtn.addEventListener('click', function () {
            if (self.undoClear()) {
                toast.remove();
            }
        });

        toast.appendChild(text);
        toast.appendChild(undoBtn);
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { toast.remove(); }, 300);
        }, 5000);
    };

    Cart.prototype._showToast = function (message, type) {
        var toast = document.createElement('div');
        var bgClass = type === 'success' ? 'bg-green-600' : 'bg-brand-500';
        toast.className = 'fixed bottom-24 right-4 z-[10000] ' + bgClass + ' text-white px-6 py-3 rounded-xl shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    };

    Cart.prototype.getTotal = function () {
        return this.items.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);
    };

    Cart.prototype.getCount = function () {
        return this.items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    };

    // Server-side price validation before checkout (with retry logic)
    Cart.prototype.validatePrices = function (retryCount) {
        var self = this;
        retryCount = retryCount || 0;
        var maxRetries = 3;

        if (this.items.length === 0) return Promise.resolve(true);

        var ids = this.items.map(function (i) { return i.id; });

        // Get CSRF token from cookie
        var csrfToken = null;
        var match = document.cookie.match(/csrf_token=([^;]+)/);
        if (match) csrfToken = match[1];

        var headers = { 'Content-Type': 'application/json' };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        return fetch('/api/dishes/validate-prices', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ ids: ids }),
        })
            .then(function (res) {
                if (!res.ok && retryCount < maxRetries) {
                    // Retry with exponential backoff
                    var delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(self.validatePrices(retryCount + 1));
                        }, delay);
                    });
                }
                return res.json();
            })
            .then(function (json) {
                if (!json.success || !json.data) return false;

                var tampered = false;
                self.items = self.items.filter(function (item) {
                    var serverPrice = json.data[item.id];
                    if (serverPrice === undefined) {
                        tampered = true;
                        return false; // item removed from menu
                    }
                    if (item.price !== serverPrice) {
                        item.price = serverPrice;
                        tampered = true;
                    }
                    return true;
                });

                if (tampered) self._save();
                return !tampered;
            })
            .catch(function () {
                return true; // allow checkout on network error
            });
    };

    Cart.prototype.onChange = function (callback) {
        if (typeof callback === 'function') {
            this._listeners.push(callback);
        }
    };

    Cart.prototype._notify = function () {
        this._listeners.forEach(function (cb) {
            try { cb(); } catch (e) { /* silent */ }
        });
    };

    // Cleanup method for proper teardown
    Cart.prototype.destroy = function () {
        try {
            this._listeners = [];
            this.items = [];
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Cart destroy error:', e);
        }
    };

    // Throttle utility for rate limiting (prevents rapid successive operations)
    function throttle(func, delay) {
        var lastCall = 0;
        return function () {
            var now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, arguments);
            }
        };
    }

    // Wrap add/update/remove with throttle (500ms)
    var originalAdd = Cart.prototype.add;
    Cart.prototype.add = throttle(function (dish) {
        try {
            return originalAdd.call(this, dish);
        } catch (e) {
            console.error('Cart add error:', e);
            return false;
        }
    }, 500);

    var originalUpdateQuantity = Cart.prototype.updateQuantity;
    Cart.prototype.updateQuantity = throttle(function (dishId, newQty) {
        try {
            return originalUpdateQuantity.call(this, dishId, newQty);
        } catch (e) {
            console.error('Cart update error:', e);
        }
    }, 300);

    // Expose as non-overridable singleton
    var cartInstance = new Cart();
    Object.defineProperty(window, 'cart', {
        value: cartInstance,
        writable: false,
        configurable: false,
    });
})();
