/* cartUI-lite.js — Cart UI adapted for lite themes (CSS variables, no dark Tailwind hardcoded) */
!function () {
    "use strict";

    function fmt(val) { var n = Number(val); return !Number.isFinite(n) || n < 0 ? "R$ 0,00" : (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }

    /* Inject styles using CSS variables from the lite theme */
    var style = document.createElement("style");
    style.id = "cart-lite-styles";
    style.textContent = [
        "#cart-button { background: var(--brand); color: #fff; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.25); }",
        "#cart-button:hover { filter: brightness(0.9); box-shadow: 0 8px 30px rgba(0,0,0,0.35); }",
        "#cart-sidebar { background: var(--bg); }",
        "#cart-sidebar .cart-header { border-bottom: 1px solid var(--border); }",
        "#cart-sidebar .cart-header h3 { color: var(--text); }",
        "#cart-sidebar .cart-header .cart-badge { color: var(--muted); }",
        "#cart-sidebar .cart-close-btn { color: var(--muted); }",
        "#cart-sidebar .cart-close-btn:hover { color: var(--text); }",
        "#cart-items .cart-item { background: var(--surface); border-color: var(--border); }",
        "#cart-items .cart-item .item-name { color: var(--text); }",
        "#cart-items .cart-item .item-price { color: var(--brand); }",
        "#cart-items .qty-dec { background: var(--surface); color: var(--text); border: 1px solid var(--border); }",
        "#cart-items .qty-dec:hover { filter: brightness(0.9); }",
        "#cart-items .qty-val { color: var(--text); }",
        "#cart-items .qty-inc { background: var(--brand); color: #fff; }",
        "#cart-items .qty-inc:hover { filter: brightness(0.9); }",
        "#cart-items .cart-empty { color: var(--muted); }",
        "#cart-sidebar .cart-footer { background: var(--surface); border-top: 1px solid var(--border); }",
        "#cart-sidebar .cart-footer .total-label { color: var(--text); }",
        "#cart-total { color: var(--brand); }",
        "#cart-sidebar .cart-checkout-btn { background: var(--brand); color: #fff; }",
        "#cart-sidebar .cart-checkout-btn:hover { filter: brightness(0.9); }",
        "#cart-sidebar .cart-clear-btn { color: var(--muted); }",
        "#cart-sidebar .cart-clear-btn:hover { color: var(--text); }",
        "@keyframes cartPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }",
        "#cart-count:not(.hidden) { animation: cartPulse 2s infinite; }"
    ].join("\n");
    document.head.appendChild(style);

    function CartUI() {
        this.isOpen = false;
        this._boundKeydown = null;
        this._boundToggle = null;
        this._boundClose = null;
        this._lastFocusedElement = null;
        this._init();
    }

    CartUI.prototype._init = function () {
        this._createCartButton();
        this._createCartSidebar();
        this._attachEvents();
        window.cart.onChange(this.update.bind(this));
        this.update();
    };

    CartUI.prototype._createCartButton = function () {
        var btn = document.createElement("button");
        btn.id = "cart-button";
        btn.className = "fixed right-6 z-[9999] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110";
        Object.assign(btn.style, {
            bottom: "2rem"
        });
        btn.setAttribute("aria-label", "Abrir Carrinho");
        btn.innerHTML = [
            '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
            '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
            "</svg>",
            '<span id="cart-count" class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg hidden">0</span>'
        ].join("\n");
        this._boundToggle = this.toggle.bind(this);
        btn.addEventListener("click", this._boundToggle);
        document.body.appendChild(btn);
    };

    CartUI.prototype._createCartSidebar = function () {
        var self = this;
        var sidebar = document.createElement("div");
        sidebar.id = "cart-sidebar";
        sidebar.setAttribute("role", "dialog");
        sidebar.setAttribute("aria-modal", "true");
        sidebar.setAttribute("aria-label", "Carrinho de compras");
        sidebar.className = "fixed inset-y-0 right-0 w-full sm:w-96 shadow-2xl transform translate-x-full transition-transform duration-300 z-[60] flex flex-col";

        /* Header */
        var header = document.createElement("div");
        header.className = "cart-header p-6 flex items-center justify-between";
        var title = document.createElement("h3");
        title.className = "text-xl font-bold flex items-center gap-2";
        title.textContent = "Carrinho ";
        var badge = document.createElement("span");
        badge.id = "cart-sidebar-count";
        badge.className = "cart-badge text-sm";
        badge.textContent = "(0)";
        title.appendChild(badge);
        header.appendChild(title);
        var closeBtn = document.createElement("button");
        closeBtn.className = "cart-close-btn transition";
        closeBtn.setAttribute("aria-label", "Fechar carrinho");
        closeBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        closeBtn.addEventListener("click", function () { self.close(); });
        header.appendChild(closeBtn);
        sidebar.appendChild(header);

        /* Items */
        var items = document.createElement("div");
        items.id = "cart-items";
        items.className = "flex-1 overflow-y-auto p-6";
        sidebar.appendChild(items);

        /* Footer */
        var footer = document.createElement("div");
        footer.className = "cart-footer p-6";
        var totalRow = document.createElement("div");
        totalRow.className = "flex justify-between text-lg font-bold mb-4";
        var totalLabel = document.createElement("span");
        totalLabel.className = "total-label";
        totalLabel.textContent = "Total";
        var totalAmt = document.createElement("span");
        totalAmt.id = "cart-total";
        totalAmt.textContent = "R$ 0,00";
        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalAmt);
        footer.appendChild(totalRow);
        var checkoutBtn = document.createElement("button");
        checkoutBtn.className = "cart-checkout-btn w-full py-4 rounded-xl font-semibold transition";
        checkoutBtn.textContent = "Finalizar Pedido";
        checkoutBtn.addEventListener("click", function () { self.checkout(); });
        footer.appendChild(checkoutBtn);
        var clearBtn = document.createElement("button");
        clearBtn.className = "cart-clear-btn w-full mt-2 text-sm py-2 transition";
        clearBtn.textContent = "Limpar Carrinho";
        clearBtn.addEventListener("click", function () { self.clear(); });
        footer.appendChild(clearBtn);
        sidebar.appendChild(footer);

        /* Backdrop */
        var backdrop = document.createElement("div");
        backdrop.id = "cart-backdrop";
        backdrop.className = "fixed inset-0 bg-black/60 backdrop-blur-sm z-[59] hidden";
        this._boundClose = this.close.bind(this);
        backdrop.addEventListener("click", this._boundClose);
        document.body.appendChild(backdrop);
        document.body.appendChild(sidebar);
    };

    CartUI.prototype._attachEvents = function () {
        var self = this;
        this._boundKeydown = function (e) {
            if ("Escape" === e.key && self.isOpen) { e.preventDefault(); self.close(); return; }
            if ("Tab" === e.key && self.isOpen) {
                var s = document.getElementById("cart-sidebar");
                if (!s) return;
                var els = s.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
                var arr = Array.prototype.slice.call(els);
                var first = arr[0], last = arr[arr.length - 1];
                if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
                else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
            }
        };
        document.addEventListener("keydown", this._boundKeydown);
    };

    CartUI.prototype.update = function () {
        var count = window.cart.getCount();
        var total = window.cart.getTotal();
        var countEl = document.getElementById("cart-count");
        if (count > 0) { countEl.textContent = count; countEl.classList.remove("hidden"); }
        else { countEl.classList.add("hidden"); }
        var badge = document.getElementById("cart-sidebar-count");
        if (badge) badge.textContent = "(" + count + ")";
        var totalEl = document.getElementById("cart-total");
        if (totalEl) totalEl.textContent = fmt(total);
        this._renderItems();
    };

    function isValidImg(url) {
        if (!url || "string" !== typeof url) return false;
        if (url.startsWith("/uploads/")) return true;
        try { return "https:" === new URL(url).protocol; } catch (e) { return false; }
    }

    CartUI.prototype._renderItems = function () {
        var self = this;
        var container = document.getElementById("cart-items");
        var items = window.cart.items;
        container.textContent = "";
        if (0 === items.length) {
            var empty = document.createElement("div");
            empty.className = "cart-empty flex flex-col items-center justify-center h-full text-center";
            empty.innerHTML = [
                '<svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">',
                '  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
                "</svg>"
            ].join("\n");
            var p1 = document.createElement("p"); p1.textContent = "Seu carrinho está vazio"; empty.appendChild(p1);
            var p2 = document.createElement("p"); p2.className = "text-sm mt-2"; p2.textContent = "Adicione itens do cardápio"; empty.appendChild(p2);
            container.appendChild(empty);
            return;
        }
        items.forEach(function (item) {
            var card = document.createElement("div");
            card.className = "cart-item rounded-xl p-4 mb-3 border";
            card.setAttribute("data-item-id", item.id);
            var row = document.createElement("div");
            row.className = "flex items-start gap-3";
            if (item.image && isValidImg(item.image)) {
                var img = document.createElement("img");
                img.className = "w-16 h-16 rounded-lg object-cover";
                img.alt = item.name; img.loading = "lazy"; img.src = item.image;
                img.onerror = function () { this.style.display = "none"; };
                row.appendChild(img);
            }
            var info = document.createElement("div"); info.className = "flex-1";
            var name = document.createElement("h4"); name.className = "item-name font-medium mb-1"; name.textContent = item.name;
            var price = document.createElement("p"); price.className = "item-price font-semibold"; price.textContent = fmt(item.price);
            info.appendChild(name); info.appendChild(price); row.appendChild(info); card.appendChild(row);
            var controls = document.createElement("div"); controls.className = "flex items-center justify-between mt-3";
            var qtyGroup = document.createElement("div"); qtyGroup.className = "flex items-center gap-2";
            var dec = document.createElement("button"); dec.className = "qty-dec w-8 h-8 rounded-lg transition"; dec.textContent = "-";
            dec.setAttribute("aria-label", "Diminuir quantidade");
            dec.addEventListener("click", function () { self.decreaseQuantity(item.id); });
            var val = document.createElement("span"); val.className = "qty-val w-8 text-center"; val.textContent = item.quantity;
            var inc = document.createElement("button"); inc.className = "qty-inc w-8 h-8 rounded-lg transition"; inc.textContent = "+";
            inc.setAttribute("aria-label", "Aumentar quantidade");
            inc.addEventListener("click", function () { self.increaseQuantity(item.id); });
            qtyGroup.appendChild(dec); qtyGroup.appendChild(val); qtyGroup.appendChild(inc);
            var rem = document.createElement("button"); rem.className = "text-red-400 hover:text-red-300 text-sm transition"; rem.textContent = "Remover";
            rem.addEventListener("click", function () { self.removeItem(item.id); });
            controls.appendChild(qtyGroup); controls.appendChild(rem); card.appendChild(controls); container.appendChild(card);
        });
    };

    CartUI.prototype.toggle = function () { this.isOpen ? this.close() : this.open(); };
    CartUI.prototype.open = function () {
        this._lastFocusedElement = document.activeElement;
        this.isOpen = true;
        document.getElementById("cart-sidebar").classList.remove("translate-x-full");
        document.getElementById("cart-backdrop").classList.remove("hidden");
        document.body.style.overflow = "hidden";
        setTimeout(function () {
            var btn = document.querySelector('#cart-sidebar button[aria-label="Fechar carrinho"]');
            if (btn) btn.focus();
        }, 100);
    };
    CartUI.prototype.close = function () {
        this.isOpen = false;
        document.getElementById("cart-sidebar").classList.add("translate-x-full");
        document.getElementById("cart-backdrop").classList.add("hidden");
        document.body.style.overflow = "";
        if (this._lastFocusedElement && this._lastFocusedElement.focus) this._lastFocusedElement.focus();
        this._lastFocusedElement = null;
    };
    CartUI.prototype.increaseQuantity = function (id) {
        var item = window.cart.items.find(function (i) { return i.id === id; });
        if (item) window.cart.updateQuantity(id, item.quantity + 1);
    };
    CartUI.prototype.decreaseQuantity = function (id) {
        var item = window.cart.items.find(function (i) { return i.id === id; });
        if (item) { if (1 === item.quantity) this.removeItem(id); else window.cart.updateQuantity(id, item.quantity - 1); }
    };
    CartUI.prototype.removeItem = function (id) { window.cart.remove(id); };
    CartUI.prototype.clear = function () { if (confirm("Deseja realmente limpar o carrinho?")) window.cart.clear(); };
    CartUI.prototype.checkout = function () { this.close(); window.orderModal.openCartCheckout(); };
    CartUI.prototype.destroy = function () {
        try {
            var btn = document.getElementById("cart-button");
            var bd = document.getElementById("cart-backdrop");
            if (btn && this._boundToggle) btn.removeEventListener("click", this._boundToggle);
            if (bd && this._boundClose) bd.removeEventListener("click", this._boundClose);
            if (this._boundKeydown) document.removeEventListener("keydown", this._boundKeydown);
            this._boundToggle = null; this._boundClose = null; this._boundKeydown = null; this.isOpen = false;
        } catch (e) { console.error("CartUI destroy error:", e); }
    };

    document.addEventListener("DOMContentLoaded", function () {
        var instance = new CartUI();
        Object.defineProperty(window, "cartUI", { value: instance, writable: false, configurable: false });
    });
}();
