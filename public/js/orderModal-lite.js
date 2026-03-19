/* orderModal-lite.js — Order modal adapted for lite themes (CSS variables, no dark Tailwind hardcoded) */
!function () {
    "use strict";

    function fmt(val) { var n = Number(val); return !Number.isFinite(n) || n < 0 ? "R$ 0,00" : (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }

    /* Inject CSS variable-based styles — overrides dark Tailwind defaults */
    var style = document.createElement("style");
    style.id = "order-modal-lite-styles";
    style.textContent = [
        "#order-modal-content { background: var(--surface, #fff); color: var(--text, #111); }",
        "#modal-title { color: var(--text, #111); }",
        "#modal-close-btn { color: var(--muted, #888); transition: color 0.15s; }",
        "#modal-close-btn:hover { color: var(--text, #111); }",
        "#order-summary { background: var(--bg, #f5f5f5); }",
        "#order-summary .sum-label { color: var(--muted, #888); }",
        "#order-summary .sum-item { color: var(--text, #111); }",
        "#order-summary .sum-item-price { color: var(--brand, #f97316); }",
        "#order-summary .sum-divider { border-color: var(--border, #ddd); }",
        "#order-summary .sum-total { color: var(--text, #111); }",
        "#order-summary .sum-total-price { color: var(--brand, #f97316); }",
        "#order-modal-content label { color: var(--muted, #888); }",
        "#order-modal-content input, #order-modal-content textarea {",
        "  background: var(--bg, #f5f5f5);",
        "  border-color: var(--border, #ddd);",
        "  color: var(--text, #111);",
        "}",
        "#order-modal-content input::placeholder, #order-modal-content textarea::placeholder {",
        "  color: var(--muted, #999);",
        "}",
        "#order-modal-content input:focus, #order-modal-content textarea:focus {",
        "  border-color: var(--brand, #f97316);",
        "  outline: none;",
        "}"
    ].join("\n");
    document.head.appendChild(style);

    function OrderModal() {
        this.modal = null;
        this.currentDish = null;
        this.isCartMode = false;
        this.isSubmitting = false;
        this._boundKeydown = null;
        this._boundBackdropClick = null;
        this._lastFocusedElement = null;
        this._focusableElements = [];
        this._init();
    }

    OrderModal.prototype._init = function () {
        this._createModal();
        this._initFormValidation();
        this._attachEvents();
    };

    OrderModal.prototype._createModal = function () {
        var el = document.createElement("div");
        el.id = "order-modal";
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-modal", "true");
        el.setAttribute("aria-labelledby", "modal-title");
        el.className = "fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] hidden items-center justify-center p-4";
        el.innerHTML = [
            '<div class="rounded-2xl max-w-md w-full p-6 transform transition-all scale-95 opacity-0" id="order-modal-content">',
            '  <div class="flex items-center justify-between mb-6">',
            '    <h3 class="text-2xl font-bold" id="modal-title">Finalizar Pedido</h3>',
            '    <button type="button" id="modal-close-btn" class="transition" aria-label="Fechar">',
            '      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
            '        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
            '      </svg>',
            '    </button>',
            '  </div>',
            '  <div id="order-summary" class="rounded-xl p-4 mb-6 hidden"></div>',
            '  <div id="order-errors" class="bg-red-600/20 border border-red-500 text-red-300 rounded-xl p-3 mb-4 text-sm hidden"></div>',
            '  <form id="order-form" class="space-y-4" novalidate>',
            '    <div>',
            '      <label class="block text-sm mb-2" for="order-name">Nome completo *</label>',
            '      <input type="text" name="name" id="order-name" required maxlength="100"',
            '        class="w-full border rounded-xl px-4 py-3 focus:outline-none"',
            '        placeholder="João Silva" autocomplete="name">',
            '    </div>',
            '    <div>',
            '      <label class="block text-sm mb-2" for="order-phone">Telefone *</label>',
            '      <input type="tel" name="phone" id="order-phone" required maxlength="20"',
            '        class="w-full border rounded-xl px-4 py-3 focus:outline-none"',
            '        placeholder="(11) 99999-9999" autocomplete="tel" inputmode="tel">',
            '    </div>',
            '    <div>',
            '      <label class="block text-sm mb-2" for="order-address">Endereço de entrega *</label>',
            '      <input type="text" name="address" id="order-address" required maxlength="200"',
            '        class="w-full border rounded-xl px-4 py-3 focus:outline-none"',
            '        placeholder="Rua X, 123, Bairro Y" autocomplete="street-address">',
            '    </div>',
            '    <div>',
            '      <label class="block text-sm mb-2" for="order-notes">Observações</label>',
            '      <textarea name="notes" id="order-notes" rows="3" maxlength="500"',
            '        class="w-full border rounded-xl px-4 py-3 focus:outline-none resize-none"',
            '        placeholder="Ex: Sem cebola, ponto da carne..."></textarea>',
            '    </div>',
            '    <button type="submit" id="order-submit-btn" class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2">',
            '      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">',
            '        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
            '      </svg>',
            '      <span id="order-submit-text">Enviar pelo WhatsApp</span>',
            '    </button>',
            '  </form>',
            '</div>'
        ].join("\n");
        document.body.appendChild(el);
        this.modal = el;
        this.form = document.getElementById("order-form");
    };

    OrderModal.prototype._attachEvents = function () {
        var self = this;
        document.getElementById("order-form").addEventListener("submit", function (e) { e.preventDefault(); self._handleSubmit(e.target); });
        document.getElementById("modal-close-btn").addEventListener("click", function () { self.close(); });
        this._boundBackdropClick = function (e) { if (e.target === self.modal) self.close(); };
        this.modal.addEventListener("click", this._boundBackdropClick);
        this._boundKeydown = function (e) {
            if (self.modal.classList.contains("hidden")) return;
            if ("Escape" === e.key) { e.preventDefault(); self.close(); return; }
            if ("Tab" === e.key) {
                var els = self._getFocusableElements();
                if (!els.length) return;
                var first = els[0], last = els[els.length - 1];
                if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
                else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
            }
        };
        document.addEventListener("keydown", this._boundKeydown);
    };

    OrderModal.prototype._initFormValidation = function () {
        if (window.formValidation) {
            var v = window.formValidation.validators;
            this._formValidator = window.formValidation.enhance(this.form, {
                name: [v.required, v.minLength(2), v.maxLength(100)],
                phone: [v.required, v.phone],
                address: [v.required, v.minLength(5), v.maxLength(200)],
                notes: [v.maxLength(500)]
            }, { validateOn: "blur" });
        }
    };

    OrderModal.prototype.openQuickOrder = function (dish) {
        if (!dish || !dish.id || !dish.name || !dish.price) return;
        this.isCartMode = false;
        this.currentDish = dish;
        document.getElementById("modal-title").textContent = "Pedir Agora";
        document.getElementById("order-summary").classList.add("hidden");
        this._clearErrors();
        this.show();
    };

    OrderModal.prototype.openCartCheckout = function () {
        if (!window.cart || 0 === window.cart.items.length) { this._showToast("Carrinho vazio", "error"); return; }
        this.isCartMode = true;
        this.currentDish = null;
        document.getElementById("modal-title").textContent = "Finalizar Pedido";
        this._renderCartSummary();
        document.getElementById("order-summary").classList.remove("hidden");
        this._clearErrors();
        this.show();
    };

    OrderModal.prototype._renderCartSummary = function () {
        var container = document.getElementById("order-summary");
        var items = window.cart.items;
        var total = window.cart.getTotal();
        container.textContent = "";

        var lbl = document.createElement("div");
        lbl.className = "sum-label text-sm mb-3";
        lbl.textContent = "Seu pedido:";
        container.appendChild(lbl);

        items.forEach(function (item) {
            var row = document.createElement("div");
            row.className = "sum-item flex justify-between mb-2";
            var name = document.createElement("span");
            name.textContent = item.quantity + "x " + item.name;
            var price = document.createElement("span");
            price.className = "sum-item-price";
            price.textContent = fmt(item.price * item.quantity);
            row.appendChild(name); row.appendChild(price);
            container.appendChild(row);
        });

        var divider = document.createElement("div");
        divider.className = "sum-divider border-t mt-3 pt-3 flex justify-between font-bold";
        var totalLbl = document.createElement("span");
        totalLbl.className = "sum-total";
        totalLbl.textContent = "Total";
        var totalVal = document.createElement("span");
        totalVal.className = "sum-total-price";
        totalVal.textContent = fmt(total);
        divider.appendChild(totalLbl); divider.appendChild(totalVal);
        container.appendChild(divider);
    };

    OrderModal.prototype._getFocusableElements = function () {
        if (!this.modal || this.modal.classList.contains("hidden")) return [];
        var els = this.modal.querySelectorAll("button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]");
        return Array.prototype.slice.call(els).filter(function (e) { return null !== e.offsetParent; });
    };

    OrderModal.prototype.show = function () {
        this._lastFocusedElement = document.activeElement;
        this.isSubmitting = false;
        this._setLoading(false);
        this.modal.classList.remove("hidden");
        this.modal.classList.add("flex");
        setTimeout(function () {
            var c = document.getElementById("order-modal-content");
            c.classList.remove("scale-95", "opacity-0");
            c.classList.add("scale-100", "opacity-100");
        }, 10);
        setTimeout(function () {
            var n = document.getElementById("order-name");
            if (n) n.focus();
        }, 200);
        document.body.style.overflow = "hidden";
    };

    OrderModal.prototype.close = function () {
        var self = this;
        var content = document.getElementById("order-modal-content");
        content.classList.add("scale-95", "opacity-0");
        content.classList.remove("scale-100", "opacity-100");
        setTimeout(function () {
            self.modal.classList.add("hidden");
            self.modal.classList.remove("flex");
            document.body.style.overflow = "";
            document.getElementById("order-form").reset();
            self._clearErrors();
            self.isSubmitting = false;
            self._setLoading(false);
            if (self._lastFocusedElement && "function" === typeof self._lastFocusedElement.focus) {
                try { self._lastFocusedElement.focus(); } catch (e) { }
            }
            self._lastFocusedElement = null;
        }, 200);
    };

    OrderModal.prototype._clearErrors = function () {
        if (this._formValidator) this._formValidator.clearAll();
        var el = document.getElementById("order-errors");
        el.textContent = ""; el.classList.add("hidden");
    };

    OrderModal.prototype._showErrors = function (msgs) {
        var el = document.getElementById("order-errors");
        el.textContent = msgs.join(" • ");
        el.classList.remove("hidden");
    };

    OrderModal.prototype._setLoading = function (loading) {
        var btn = document.getElementById("order-submit-btn");
        var txt = document.getElementById("order-submit-text");
        if (loading) { btn.disabled = true; btn.classList.add("opacity-50", "cursor-not-allowed"); txt.textContent = "Validando pedido..."; }
        else { btn.disabled = false; btn.classList.remove("opacity-50", "cursor-not-allowed"); txt.textContent = "Enviar pelo WhatsApp"; }
    };

    OrderModal.prototype._handleSubmit = function (form) {
        var self = this;
        if (this.isSubmitting) return;
        var data = new FormData(form);
        var fields = {
            name: (data.get("name") || "").toString().trim(),
            phone: (data.get("phone") || "").toString().trim(),
            address: (data.get("address") || "").toString().trim(),
            notes: (data.get("notes") || "").toString().trim()
        };
        var errors = [];
        if (!fields.name || fields.name.length < 2) errors.push("Nome deve ter pelo menos 2 caracteres");
        if (fields.name && fields.name.length > 100) errors.push("Nome muito longo");
        var phone = (fields.phone || "").replace(/\D/g, "");
        if (phone.length < 10 || phone.length > 11) errors.push("Telefone inválido (use DDD + número)");
        if (!fields.address || fields.address.trim().length < 5) errors.push("Endereço muito curto");
        if (fields.address && fields.address.length > 200) errors.push("Endereço muito longo");
        if (fields.notes && fields.notes.length > 500) errors.push("Observações muito longas (máx. 500 caracteres)");
        if (this._formValidator && !this._formValidator.validate() && 0 === errors.length) return;
        if (errors.length > 0) { this._showErrors(errors); return; }
        this.isSubmitting = true;
        this._setLoading(true);
        this._clearErrors();
        (this.isCartMode ? window.cart.validatePrices() : Promise.resolve(true))
            .then(function (valid) {
                if (!valid) {
                    self._showErrors(["Os preços foram atualizados. Revise seu pedido antes de enviar."]);
                    self._setLoading(false); self.isSubmitting = false;
                    if (self.isCartMode) self._renderCartSummary();
                    return null;
                }
                return self._getWhatsAppNumber();
            })
            .then(function (wpp) {
                if (null === wpp) return;
                if (!wpp) { self._showErrors(["Número do WhatsApp não configurado. Ligue para o restaurante."]); self._setLoading(false); self.isSubmitting = false; return; }
                var msg = self.isCartMode
                    ? window.WhatsAppFormatter.formatCartOrder(window.cart.items, fields)
                    : window.WhatsAppFormatter.formatQuickOrder(self.currentDish, fields);
                if (!msg) { self._showErrors(["Erro ao gerar mensagem. Tente novamente."]); self._setLoading(false); self.isSubmitting = false; return; }
                window.WhatsAppFormatter.openWhatsApp(msg, wpp);
                self._setLoading(false); self.isSubmitting = false;
                if (self.isCartMode) window.cart.clear();
                self.close();
                self._showToast("Abrindo WhatsApp...", "success");
            })
            .catch(function () {
                self._showErrors(["Erro inesperado. Tente novamente."]);
                self._setLoading(false); self.isSubmitting = false;
            });
    };

    OrderModal.prototype._getWhatsAppNumber = function () {
        return fetch("/api/config")
            .then(function (r) { return r.json(); })
            .then(function (d) { return d.data && d.data.whatsapp_number || null; })
            .catch(function () { return null; });
    };

    OrderModal.prototype._showToast = function (msg, type) {
        if (window.feedback && window.feedback.toast) { window.feedback.toast(msg, { type: type || "info", duration: 4000 }); return; }
        try {
            var el = document.createElement("div");
            var cls = "error" === type ? "bg-red-600" : "success" === type ? "bg-green-600" : "bg-brand-500";
            el.className = "fixed bottom-4 right-4 z-[10000] px-6 py-3 rounded-xl text-white font-medium shadow-lg transform transition-all " + cls;
            el.textContent = msg;
            document.body.appendChild(el);
            setTimeout(function () { el.style.opacity = "0"; el.style.transform = "translateY(20px)"; setTimeout(function () { el.remove(); }, 300); }, 3000);
        } catch (e) { console.error("Toast error:", e); }
    };

    OrderModal.prototype.destroy = function () {
        try {
            if (this._boundKeydown) document.removeEventListener("keydown", this._boundKeydown);
            if (this._boundBackdropClick && this.modal) this.modal.removeEventListener("click", this._boundBackdropClick);
            this._boundKeydown = null; this._boundBackdropClick = null;
            this.modal = null; this.form = null;
        } catch (e) { console.error("OrderModal destroy error:", e); }
    };

    var instance = new OrderModal();
    Object.defineProperty(window, "orderModal", { value: instance, writable: false, configurable: false });
}();
