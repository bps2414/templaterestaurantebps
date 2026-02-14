// ============================================
// Form Validation ��� Visual Inline Errors + Real-time Feedback
// Sprint 1: S1-T2
// ============================================

(function () {
    'use strict';

    // ��������� CSS Injection ���������������������������������������������������������������������������������������������������������������������������������

    function injectStyles() {
        if (document.getElementById('form-validation-styles')) return;
        var style = document.createElement('style');
        style.id = 'form-validation-styles';
        style.textContent = [
            '/* Valid/Invalid input states */',
            '.field-error input, .field-error textarea, .field-error select {',
            '  border-color: #ef4444 !important;',
            '  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.3) !important;',
            '}',
            '.field-success input, .field-success textarea, .field-success select {',
            '  border-color: #22c55e !important;',
            '  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.2) !important;',
            '}',
            '',
            '/* Error message */',
            '.field-error-msg {',
            '  color: #f87171;',
            '  font-size: 0.75rem;',
            '  margin-top: 0.375rem;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 0.25rem;',
            '  animation: fieldErrorIn 0.2s ease;',
            '}',
            '',
            '@keyframes fieldErrorIn {',
            '  from { opacity: 0; transform: translateY(-4px); }',
            '  to   { opacity: 1; transform: translateY(0); }',
            '}',
            '',
            '/* Shake animation for invalid submit */',
            '@keyframes shake {',
            '  0%, 100% { transform: translateX(0); }',
            '  20%, 60% { transform: translateX(-4px); }',
            '  40%, 80% { transform: translateX(4px); }',
            '}',
            '.field-shake {',
            '  animation: shake 0.4s ease;',
            '}',
        ].join('\n');
        document.head.appendChild(style);
    }

    // ��������� Validation Rules ������������������������������������������������������������������������������������������������������������������������

    var validators = {
        required: function (value) {
            return (value || '').trim().length > 0 ? null : 'Este campo é obrigatório';
        },
        minLength: function (min) {
            return function (value) {
                return (value || '').trim().length >= min ? null : 'Mínimo de ' + min + ' caracteres';
            };
        },
        maxLength: function (max) {
            return function (value) {
                return (value || '').length <= max ? null : 'Máximo de ' + max + ' caracteres';
            };
        },
        phone: function (value) {
            var digits = (value || '').replace(/\D/g, '');
            if (digits.length < 10 || digits.length > 11) {
                return 'Telefone inválido (use DDD + número)';
            }
            return null;
        },
        email: function (value) {
            if (!value || !value.trim()) return null; // optional
            var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(value.trim()) ? null : 'Email inválido';
        },
    };

    // ��������� DOM Helpers ���������������������������������������������������������������������������������������������������������������������������������������

    function getFieldWrapper(input) {
        // Look for the parent <div> that wraps label + input
        return input.closest('div');
    }

    function showFieldError(input, message) {
        var wrapper = getFieldWrapper(input);
        if (!wrapper) return;

        // Remove previous states
        clearFieldState(input);

        wrapper.classList.add('field-error');
        input.setAttribute('aria-invalid', 'true');

        // Create error message
        var errorId = input.id ? input.id + '-error' : 'err-' + Math.random().toString(36).slice(2, 8);
        var errorEl = document.createElement('p');
        errorEl.className = 'field-error-msg';
        errorEl.id = errorId;
        errorEl.setAttribute('role', 'alert');

        var icon = document.createElement('span');
        icon.innerHTML = '<svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';

        var text = document.createElement('span');
        text.textContent = message;

        errorEl.appendChild(icon);
        errorEl.appendChild(text);

        input.setAttribute('aria-describedby', errorId);
        wrapper.appendChild(errorEl);

        // Shake
        input.classList.add('field-shake');
        setTimeout(function () {
            input.classList.remove('field-shake');
        }, 400);
    }

    function showFieldSuccess(input) {
        var wrapper = getFieldWrapper(input);
        if (!wrapper) return;

        clearFieldState(input);
        wrapper.classList.add('field-success');
        input.setAttribute('aria-invalid', 'false');
    }

    function clearFieldState(input) {
        var wrapper = getFieldWrapper(input);
        if (!wrapper) return;

        wrapper.classList.remove('field-error', 'field-success');
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');

        var existing = wrapper.querySelector('.field-error-msg');
        if (existing) existing.remove();
    }

    // ��������� Form Enhancer ���������������������������������������������������������������������������������������������������������������������������������

    /**
     * Enhance a form with inline validation
     * @param {HTMLFormElement|string} formOrSelector
     * @param {Object} rules - Map of field name ��� array of validator functions
     * @param {Object} [options]
     * @param {string} [options.validateOn='blur'] - 'blur', 'input', or 'submit'
     * @param {Function} [options.onValid] - called when form passes all validation
     */
    function enhanceForm(formOrSelector, rules, options) {
        injectStyles();

        var form = typeof formOrSelector === 'string'
            ? document.querySelector(formOrSelector)
            : formOrSelector;

        if (!form) return null;

        options = options || {};
        var validateOn = options.validateOn || 'blur';
        var onValid = options.onValid || null;

        // Track listener references for cleanup
        var listeners = [];

        function validateField(input) {
            var name = input.name || input.id;
            var fieldRules = rules[name];
            if (!fieldRules) return true;

            var value = input.value;

            for (var i = 0; i < fieldRules.length; i++) {
                var error = fieldRules[i](value);
                if (error) {
                    showFieldError(input, error);
                    return false;
                }
            }

            // Only show success checkmark if field has content
            if (value && value.trim().length > 0) {
                showFieldSuccess(input);
            } else {
                clearFieldState(input);
            }
            return true;
        }

        function validateAll() {
            var allValid = true;
            var firstInvalid = null;

            Object.keys(rules).forEach(function (fieldName) {
                var input = form.querySelector('[name="' + fieldName + '"], #' + fieldName.replace(/^order-/, 'order-'));
                if (!input) return;

                var valid = validateField(input);
                if (!valid && !firstInvalid) {
                    firstInvalid = input;
                }
                if (!valid) allValid = false;
            });

            // Focus first invalid field
            if (firstInvalid) {
                firstInvalid.focus();
            }

            return allValid;
        }

        // Attach blur/input validators
        Object.keys(rules).forEach(function (fieldName) {
            var input = form.querySelector('[name="' + fieldName + '"], #' + fieldName.replace(/^order-/, 'order-'));
            if (!input) return;

            var handler = function () { validateField(input); };

            if (validateOn === 'blur' || validateOn === 'both') {
                input.addEventListener('blur', handler);
                listeners.push({ el: input, event: 'blur', fn: handler });
            }

            if (validateOn === 'input' || validateOn === 'both') {
                var debounced = debounce(handler, 300);
                input.addEventListener('input', debounced);
                listeners.push({ el: input, event: 'input', fn: debounced });
            }

            // Clear error on focus for better UX
            var focusHandler = function () {
                if (input.getAttribute('aria-invalid') === 'true') {
                    clearFieldState(input);
                }
            };
            input.addEventListener('focus', focusHandler);
            listeners.push({ el: input, event: 'focus', fn: focusHandler });
        });

        return {
            validate: validateAll,
            validateField: validateField,
            clearAll: function () {
                Object.keys(rules).forEach(function (fieldName) {
                    var input = form.querySelector('[name="' + fieldName + '"], #' + fieldName.replace(/^order-/, 'order-'));
                    if (input) clearFieldState(input);
                });
            },
            destroy: function () {
                listeners.forEach(function (l) {
                    l.el.removeEventListener(l.event, l.fn);
                });
                listeners = [];
            },
        };
    }

    // ��������� Debounce Helper ���������������������������������������������������������������������������������������������������������������������������

    function debounce(fn, delay) {
        var timer;
        return function () {
            var ctx = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(ctx, args);
            }, delay);
        };
    }

    // ��������� Expose Public API ���������������������������������������������������������������������������������������������������������������������

    var FormValidation = Object.freeze({
        enhance: enhanceForm,
        showError: showFieldError,
        showSuccess: showFieldSuccess,
        clearField: clearFieldState,
        validators: validators,
    });

    Object.defineProperty(window, 'formValidation', {
        value: FormValidation,
        writable: false,
        configurable: false,
    });

})();
