// ============================================
// Order Modal — Customer data collection
// Hardened: input validation, XSS-safe rendering, proper event cleanup
// ============================================

(function () {
    'use strict';

    // --- Safe DOM helpers ---
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatPrice(cents) {
        var value = Number(cents);
        if (!Number.isFinite(value) || value < 0) return 'R$ 0,00';
        return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // --- Input validation ---
    function validateCustomerData(data) {
        var errors = [];

        // Name
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }
        if (data.name && data.name.length > 100) {
            errors.push('Nome muito longo');
        }

        // Phone (Brazilian format: 10-11 digits)
        var cleanPhone = (data.phone || '').replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            errors.push('Telefone inválido (use DDD + número)');
        }

        // Address
        if (!data.address || data.address.trim().length < 5) {
            errors.push('Endereço muito curto');
        }
        if (data.address && data.address.length > 200) {
            errors.push('Endereço muito longo');
        }

        // Notes (optional)
        if (data.notes && data.notes.length > 500) {
            errors.push('Observações muito longas (máx. 500 caracteres)');
        }

        return errors;
    }

    // --- OrderModal class ---
    function OrderModal() {
        this.modal = null;
        this.currentDish = null;
        this.isCartMode = false;
        this.isSubmitting = false;
        this._boundKeydown = null;
        this._boundBackdropClick = null;
        this._lastFocusedElement = null; // For focus restoration
        this._focusableElements = [];
        this._init();
    }

    OrderModal.prototype._init = function () {
        this._createModal();
        this._initFormValidation();
        this._attachEvents();
    };

    OrderModal.prototype._createModal = function () {
        var modal = document.createElement('div');
        modal.id = 'order-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] hidden items-center justify-center p-4';
        modal.innerHTML = [
            '<div class="bg-dark-800 rounded-2xl max-w-md w-full p-6 transform transition-all scale-95 opacity-0" id="order-modal-content">',
            '  <div class="flex items-center justify-between mb-6">',
            '    <h3 class="text-2xl font-bold text-white" id="modal-title">Finalizar Pedido</h3>',
            '    <button type="button" id="modal-close-btn" class="text-gray-400 hover:text-white transition" aria-label="Fechar">',
            '      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
            '        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
            '      </svg>',
            '    </button>',
            '  </div>',
            '  <div id="order-summary" class="bg-dark-900 rounded-xl p-4 mb-6 hidden"></div>',
            '  <div id="order-errors" class="bg-red-600/20 border border-red-500 text-red-300 rounded-xl p-3 mb-4 text-sm hidden"></div>',
            '  <form id="order-form" class="space-y-4" novalidate>',
            '    <div>',
            '      <label class="block text-sm text-gray-400 mb-2" for="order-name">Nome completo *</label>',
            '      <input type="text" name="name" id="order-name" required maxlength="100"',
            '        class="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-400 focus:outline-none"',
            '        placeholder="João Silva" autocomplete="name">',
            '    </div>',
            '    <div>',
            '      <label class="block text-sm text-gray-400 mb-2" for="order-phone">Telefone *</label>',
            '      <input type="tel" name="phone" id="order-phone" required maxlength="20"',
            '        class="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-400 focus:outline-none"',
            '        placeholder="(11) 99999-9999" autocomplete="tel" inputmode="tel">',
            '    </div>',
            '    <div>',
            '      <label class="block text-sm text-gray-400 mb-2" for="order-address">Endereço de entrega *</label>',
            '      <input type="text" name="address" id="order-address" required maxlength="200"',
            '        class="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-400 focus:outline-none"',
            '        placeholder="Rua X, 123, Bairro Y" autocomplete="street-address">',
            '    </div>',
            '    <div>',
            '      <label class="block text-sm text-gray-400 mb-2" for="order-notes">Observações</label>',
            '      <textarea name="notes" id="order-notes" rows="3" maxlength="500"',
            '        class="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-400 focus:outline-none resize-none"',
            '        placeholder="Ex: Sem cebola, ponto da carne..."></textarea>',
            '    </div>',
            '    <button type="submit" id="order-submit-btn" class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2">',
            '      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">',
            '        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
            '      </svg>',
            '      <span id="order-submit-text">Enviar pelo WhatsApp</span>',
            '    </button>',
            '  </form>',
            '</div>',
        ].join('\n');

        document.body.appendChild(modal);
        this.modal = modal;
        this.form = document.getElementById('order-form'); // Initialize form reference
    };

    OrderModal.prototype._attachEvents = function () {
        var self = this;

        // Form submit
        document.getElementById('order-form').addEventListener('submit', function (e) {
            e.preventDefault();
            self._handleSubmit(e.target);
        });

        // Close button (uses id instead of inline onclick)
        document.getElementById('modal-close-btn').addEventListener('click', function () {
            self.close();
        });

        // Backdrop click — store reference for cleanup
        this._boundBackdropClick = function (e) {
            if (e.target === self.modal) {
                self.close();
            }
        };
        this.modal.addEventListener('click', this._boundBackdropClick);

        // ESC key + Tab trap — store reference for cleanup
        this._boundKeydown = function (e) {
            if (self.modal.classList.contains('hidden')) return;

            // ESC to close
            if (e.key === 'Escape') {
                e.preventDefault();
                self.close();
                return;
            }

            // Tab trap (focus trap)
            if (e.key === 'Tab') {
                var focusable = self._getFocusableElements();
                if (focusable.length === 0) return;

                var firstElement = focusable[0];
                var lastElement = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        document.addEventListener('keydown', this._boundKeydown);
    };

    OrderModal.prototype._initFormValidation = function () {
        if (!window.formValidation) return; // Graceful degradation

        this._formValidator = window.formValidation.enhance(this.form, {
            name: [
                window.formValidation.validators.required('Nome é obrigatório'),
                window.formValidation.validators.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
            ],
            phone: [
                window.formValidation.validators.required('Telefone é obrigatório'),
                window.formValidation.validators.phone('Telefone inválido (ex: 11999998888)')
            ],
            address: [
                window.formValidation.validators.required('Endereço é obrigatório'),
                window.formValidation.validators.minLength(5, 'Endereço muito curto')
            ]
        }, {
            validateOn: 'blur',
            onValidField: function (field) { field.classList.remove('field-shake'); },
            onInvalidField: function (field) { field.classList.add('field-shake'); }
        });
    };

    OrderModal.prototype.openQuickOrder = function (dish) {
        if (!dish || !dish.id || !dish.name || !dish.price) return;
        this.isCartMode = false;
        this.currentDish = dish;

        document.getElementById('modal-title').textContent = 'Pedir Agora';
        document.getElementById('order-summary').classList.add('hidden');
        this._clearErrors();
        this.show();
    };

    OrderModal.prototype.openCartCheckout = function () {
        if (!window.cart || window.cart.items.length === 0) {
            this._showToast('Carrinho vazio', 'error');
            return;
        }

        this.isCartMode = true;
        this.currentDish = null;

        document.getElementById('modal-title').textContent = 'Finalizar Pedido';
        this._renderCartSummary();
        document.getElementById('order-summary').classList.remove('hidden');
        this._clearErrors();
        this.show();
    };

    // XSS-safe cart summary rendering
    OrderModal.prototype._renderCartSummary = function () {
        var summary = document.getElementById('order-summary');
        var items = window.cart.items;
        var total = window.cart.getTotal();

        // Clear previous content
        summary.textContent = '';

        // Header
        var header = document.createElement('div');
        header.className = 'text-sm text-gray-400 mb-3';
        header.textContent = 'Seu pedido:';
        summary.appendChild(header);

        // Items — built with safe DOM methods
        items.forEach(function (item) {
            var row = document.createElement('div');
            row.className = 'flex justify-between text-white mb-2';

            var nameSpan = document.createElement('span');
            nameSpan.textContent = item.quantity + 'x ' + item.name;

            var priceSpan = document.createElement('span');
            priceSpan.className = 'text-brand-400';
            priceSpan.textContent = formatPrice(item.price * item.quantity);

            row.appendChild(nameSpan);
            row.appendChild(priceSpan);
            summary.appendChild(row);
        });

        // Total
        var totalRow = document.createElement('div');
        totalRow.className = 'border-t border-white/10 mt-3 pt-3 flex justify-between text-white font-bold';

        var totalLabel = document.createElement('span');
        totalLabel.textContent = 'Total';

        var totalValue = document.createElement('span');
        totalValue.className = 'text-brand-400';
        totalValue.textContent = formatPrice(total);

        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalValue);
        summary.appendChild(totalRow);
    };

    // Get focusable elements for focus trap
    OrderModal.prototype._getFocusableElements = function () {
        if (!this.modal || this.modal.classList.contains('hidden')) return [];

        var selector = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]';
        var elements = this.modal.querySelectorAll(selector);
        return Array.prototype.slice.call(elements).filter(function (el) {
            return el.offsetParent !== null; // visible elements only
        });
    };

    OrderModal.prototype.show = function () {
        // Save current focus for restoration on close
        this._lastFocusedElement = document.activeElement;

        // Reset loading state when opening modal
        this.isSubmitting = false;
        this._setLoading(false);

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');

        setTimeout(function () {
            var content = document.getElementById('order-modal-content');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);

        // Focus first input (accessibility)
        setTimeout(function () {
            var nameInput = document.getElementById('order-name');
            if (nameInput) nameInput.focus();
        }, 200);

        document.body.style.overflow = 'hidden';
    };

    OrderModal.prototype.close = function () {
        var self = this;
        var content = document.getElementById('order-modal-content');
        content.classList.add('scale-95', 'opacity-0');
        content.classList.remove('scale-100', 'opacity-100');

        setTimeout(function () {
            self.modal.classList.add('hidden');
            self.modal.classList.remove('flex');
            document.body.style.overflow = '';
            document.getElementById('order-form').reset();
            self._clearErrors();
            self.isSubmitting = false;
            self._setLoading(false); // Reset loading state when closing modal

            // Restore focus to element that had focus before modal opened
            if (self._lastFocusedElement && typeof self._lastFocusedElement.focus === 'function') {
                try {
                    self._lastFocusedElement.focus();
                } catch (e) {
                    // Element may no longer exist
                }
            }
            self._lastFocusedElement = null;
        }, 200);
    };

    OrderModal.prototype._clearErrors = function () {
        if (this._formValidator) this._formValidator.clearAll();
        var errorsEl = document.getElementById('order-errors');
        errorsEl.textContent = '';
        errorsEl.classList.add('hidden');
    };

    OrderModal.prototype._showErrors = function (errors) {
        var errorsEl = document.getElementById('order-errors');
        errorsEl.textContent = errors.join(' • ');
        errorsEl.classList.remove('hidden');
    };

    OrderModal.prototype._setLoading = function (loading) {
        var btn = document.getElementById('order-submit-btn');
        var text = document.getElementById('order-submit-text');
        if (loading) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            text.textContent = 'Validando pedido...';
        } else {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            text.textContent = 'Enviar pelo WhatsApp';
        }
    };

    OrderModal.prototype._handleSubmit = function (form) {
        var self = this;
        if (this.isSubmitting) return;

        // Trigger visual validation
        if (this._formValidator && !this._formValidator.validate()) {
            return;
        }

        var formData = new FormData(form);
        var customerData = {
            name: (formData.get('name') || '').toString().trim(),
            phone: (formData.get('phone') || '').toString().trim(),
            address: (formData.get('address') || '').toString().trim(),
            notes: (formData.get('notes') || '').toString().trim(),
        };

        // Validate inputs
        var validationErrors = validateCustomerData(customerData);
        if (validationErrors.length > 0) {
            this._showErrors(validationErrors);
            return;
        }

        this.isSubmitting = true;
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('opacity-70');
        btn.textContent = 'Processando...';
        this._clearErrors();

        // Price validation flow
        var priceCheck;
        if (this.isCartMode) {
            priceCheck = window.cart.validatePrices();
        } else {
            priceCheck = Promise.resolve(true);
        }

        priceCheck
            .then(function (pricesValid) {
                if (!pricesValid) {
                    self._showErrors(['Os preços foram atualizados. Revise seu pedido antes de enviar.']);
                    btn.disabled = false;
                    btn.removeAttribute('aria-busy');
                    btn.classList.remove('opacity-70');
                    btn.textContent = 'Enviar pelo WhatsApp';
                    self.isSubmitting = false;
                    if (self.isCartMode) {
                        self._renderCartSummary(); // Re-render with updated prices
                    }
                    return;
                }

                return self._getWhatsAppNumber();
            })
            .then(function (whatsappNumber) {
                if (!whatsappNumber) {
                    self._showErrors(['Número do WhatsApp não configurado. Ligue para o restaurante.']);
                    btn.disabled = false;
                    btn.removeAttribute('aria-busy');
                    btn.classList.remove('opacity-70');
                    btn.textContent = 'Enviar pelo WhatsApp';
                    self.isSubmitting = false;
                    return;
                }

                var message;
                if (self.isCartMode) {
                    message = window.WhatsAppFormatter.formatCartOrder(window.cart.items, customerData);
                } else {
                    message = window.WhatsAppFormatter.formatQuickOrder(self.currentDish, customerData);
                }

                if (!message) {
                    self._showErrors(['Erro ao gerar mensagem. Tente novamente.']);
                    self._setLoading(false);
                    self.isSubmitting = false;
                    return;
                }

                window.WhatsAppFormatter.openWhatsApp(message, whatsappNumber);

                // Reset loading state BEFORE closing
                self._setLoading(false);
                self.isSubmitting = false;

                // Clear cart AFTER WhatsApp opens
                if (self.isCartMode) {
                    window.cart.clear();
                }

                self.close();
                self._showToast('Abrindo WhatsApp...', 'success');
            })
            .catch(function () {
                self._showErrors(['Erro inesperado. Tente novamente.']);
                self._setLoading(false);
                self.isSubmitting = false;
            });
    };

    OrderModal.prototype._getWhatsAppNumber = function () {
        return fetch('/api/config')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                return (data.data && data.data.whatsapp_number) || null;
            })
            .catch(function () { return null; });
    };

    OrderModal.prototype._showToast = function (message, type) {
        if (window.feedback && window.feedback.toast) {
            window.feedback.toast(message, { type: type || 'info', duration: 4000 });
            return;
        }
        // Fallback
        try {
            type = type || 'info';
            var toast = document.createElement('div');
            var bgClass = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-brand-500';
            toast.className = 'fixed bottom-4 right-4 z-[10000] px-6 py-3 rounded-xl text-white font-medium shadow-lg transform transition-all ' + bgClass;
            toast.textContent = message; // textContent — XSS safe
            document.body.appendChild(toast);

            setTimeout(function () {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(function () { toast.remove(); }, 300);
            }, 3000);
        } catch (e) {
            console.error('Toast error:', e);
        }
    };

    // Cleanup method for proper teardown
    OrderModal.prototype.destroy = function () {
        try {
            // Remove event listeners
            if (this._boundKeydown) {
                document.removeEventListener('keydown', this._boundKeydown);
            }
            if (this._boundBackdropClick && this.modal) {
                this.modal.removeEventListener('click', this._boundBackdropClick);
            }
            if (this._boundSubmit && this.form) {
                this.form.removeEventListener('submit', this._boundSubmit);
            }

            // Clear references
            this._boundKeydown = null;
            this._boundBackdropClick = null;
            this._boundSubmit = null;
            this.modal = null;
            this.form = null;
        } catch (e) {
            console.error('OrderModal destroy error:', e);
        }
    };

    // Expose as non-overridable singleton
    var instance = new OrderModal();
    Object.defineProperty(window, 'orderModal', {
        value: instance,
        writable: false,
        configurable: false,
    });
})();
