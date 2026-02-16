// ============================================
// WhatsApp Formatter — Secure message generation
// Hardened: sanitization against markdown injection, URL injection, impersonation
// ============================================

(function () {
    'use strict';

    // Configurable country code (can be set via window.restaurantConfig)
    var DEFAULT_COUNTRY_CODE = '55'; // Brazil

    function getCountryCode() {
        try {
            if (window.restaurantConfig && window.restaurantConfig.phone_country_code) {
                return String(window.restaurantConfig.phone_country_code).replace(/\D/g, '');
            }
        } catch (e) {
            // Fallback to default
        }
        return DEFAULT_COUNTRY_CODE;
    }

    function sanitizeText(text) {
        if (!text) return '';
        return String(text)
            .replace(/<[^>]*>/g, '')           // Remove HTML tags
            .replace(/[*_~`]/g, '')            // Remove WhatsApp markdown chars
            .replace(/https?:\/\/[^\s]+/gi, '') // Remove URLs
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control chars (keep \n \r \t)
            .replace(/\n{3,}/g, '\n\n')        // Limit consecutive newlines
            .trim()
            .slice(0, 500);
    }

    function sanitizePhone(phone) {
        if (!phone) return '';
        var cleaned = String(phone).replace(/\D/g, '');
        return cleaned.slice(0, 13); // max international phone length
    }

    function formatPrice(cents) {
        var value = Number(cents);
        if (!Number.isFinite(value) || value < 0) return 'R$ 0,00';
        return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatQuickOrder(dish, customerData) {
        if (!dish || !customerData) return '';

        var lines = [
            '*PEDIDO RAPIDO*',
            '================================',
            '',
            '*ITEM:*',
            '1x ' + sanitizeText(dish.name),
            'Valor: ' + formatPrice(dish.price),
            '',
            '--------------------------------',
            '*DADOS DO CLIENTE:*',
            '',
            'Nome: ' + sanitizeText(customerData.name),
            'Telefone: ' + sanitizePhone(customerData.phone),
            'Endereco: ' + sanitizeText(customerData.address),
        ];

        if (customerData.notes && customerData.notes.trim()) {
            lines.push('');
            lines.push('Observacoes:');
            lines.push(sanitizeText(customerData.notes));
        }

        lines.push('');
        lines.push('================================');

        return lines.join('\n');
    }

    function formatCartOrder(cartItems, customerData) {
        if (!Array.isArray(cartItems) || cartItems.length === 0 || !customerData) return '';

        var lines = [
            '*NOVO PEDIDO*',
            '================================',
            '',
            '*ITENS DO PEDIDO:*',
        ];

        var total = 0;
        cartItems.forEach(function (item) {
            var qty = parseInt(item.quantity, 10) || 1;
            var price = Number(item.price) || 0;
            var subtotal = price * qty;
            total += subtotal;
            lines.push(qty + 'x ' + sanitizeText(item.name));
            lines.push('   ' + formatPrice(subtotal));
        });

        lines.push('');
        lines.push('--------------------------------');
        lines.push('*TOTAL: ' + formatPrice(total) + '*');
        lines.push('--------------------------------');
        lines.push('');
        lines.push('*DADOS DO CLIENTE:*');
        lines.push('');
        lines.push('Nome: ' + sanitizeText(customerData.name));
        lines.push('Telefone: ' + sanitizePhone(customerData.phone));
        lines.push('Endereco: ' + sanitizeText(customerData.address));

        if (customerData.notes && customerData.notes.trim()) {
            lines.push('');
            lines.push('Observacoes:');
            lines.push(sanitizeText(customerData.notes));
        }

        lines.push('');
        lines.push('================================');

        return lines.join('\n');
    }

    function openWhatsApp(message, whatsappNumber) {
        try {
            if (!message || !whatsappNumber) {
                alert('Número do WhatsApp não configurado. Entre em contato com o restaurante.');
                return;
            }

            var encodedMessage = encodeURIComponent(message);
            var cleanNumber = sanitizePhone(whatsappNumber);

            if (cleanNumber.length < 10) {
                alert('Número do WhatsApp inválido.');
                return;
            }

            // Get country code from config
            var countryCode = getCountryCode();

            // Don't add country code if already present
            var prefix = cleanNumber.startsWith(countryCode) ? '' : countryCode;
            var url = 'https://wa.me/' + prefix + cleanNumber + '?text=' + encodedMessage;

            window.open(url, '_blank');
        } catch (e) {
            console.error('WhatsApp open error:', e);
            alert('Erro ao abrir WhatsApp. Tente novamente.');
        }
    }

    // Mask phone number for display (privacy best practice)
    function maskPhoneForDisplay(phone) {
        try {
            var cleaned = sanitizePhone(phone);
            if (!cleaned || cleaned.length < 8) return '****';

            // Show only last 4 digits: +55 ** ****-1234
            var last4 = cleaned.slice(-4);
            var countryCode = getCountryCode();
            var prefix = cleaned.slice(0, countryCode.length) === countryCode ? '+' + countryCode : '+';
            return prefix + ' ** ****-' + last4;
        } catch (e) {
            return '****';
        }
    }

    // Expose as frozen object (cannot be overridden)
    Object.defineProperty(window, 'WhatsAppFormatter', {
        value: Object.freeze({
            formatQuickOrder: formatQuickOrder,
            formatCartOrder: formatCartOrder,
            openWhatsApp: openWhatsApp,
            maskPhoneForDisplay: maskPhoneForDisplay,
        }),
        writable: false,
        configurable: false,
    });
})();
