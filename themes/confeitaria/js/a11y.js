// ============================================
// Accessibility Module — Screen reader announcements
// Live region for dynamic content updates
// ============================================

(function () {
    'use strict';

    function A11yAnnouncer() {
        this.liveRegion = null;
        this._init();
    }

    A11yAnnouncer.prototype._init = function () {
        // Create live region for screen reader announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.id = 'a11y-announcer';
        this.liveRegion.setAttribute('role', 'status');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only'; // Screen reader only
        this.liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(this.liveRegion);
    };

    /**
     * Announce message to screen readers
     * @param {string} message - The message to announce
     * @param {string} priority - 'polite' (default) or 'assertive'
     */
    A11yAnnouncer.prototype.announce = function (message, priority) {
        if (!message || typeof message !== 'string') return;

        priority = priority || 'polite';
        this.liveRegion.setAttribute('aria-live', priority);

        // Clear then set to trigger announcement
        this.liveRegion.textContent = '';
        var self = this;
        setTimeout(function () {
            self.liveRegion.textContent = message;
        }, 100);
    };

    /**
     * Announce cart count changes
     */
    A11yAnnouncer.prototype.announceCartUpdate = function (count, action) {
        var message = '';
        if (action === 'add') {
            message = 'Item adicionado ao carrinho. Total: ' + count + (count === 1 ? ' item' : ' itens');
        } else if (action === 'remove') {
            message = 'Item removido do carrinho. Total: ' + count + (count === 1 ? ' item' : ' itens');
        } else if (action === 'clear') {
            message = 'Carrinho limpo';
        } else {
            message = 'Carrinho atualizado. Total: ' + count + (count === 1 ? ' item' : ' itens');
        }
        this.announce(message);
    };

    /**
     * Announce form errors
     */
    A11yAnnouncer.prototype.announceError = function (errorMessage) {
        this.announce('Erro: ' + errorMessage, 'assertive');
    };

    /**
     * Announce success messages
     */
    A11yAnnouncer.prototype.announceSuccess = function (message) {
        this.announce(message);
    };

    // Initialize and expose globally
    var instance = new A11yAnnouncer();
    Object.defineProperty(window, 'a11y', {
        value: instance,
        writable: false,
        configurable: false,
    });
})();
