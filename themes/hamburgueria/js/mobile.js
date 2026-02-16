// ============================================
// Mobile Optimizations — Keyboard handling, viewport fixes
// ============================================

(function () {
    'use strict';

    function MobileOptimizer() {
        this.originalViewportHeight = null;
        this.init();
    }

    MobileOptimizer.prototype.init = function () {
        if (!this.isMobile()) return;

        this.handleViewportResize();
        this.handleInputFocus();
        this.preventZoomOnDoubleTap();
        this.improveScrollPerformance();
    };

    MobileOptimizer.prototype.isMobile = function () {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;
    };

    /**
     * Handle viewport changes when keyboard appears
     * Prevents layout shifts and maintains scroll position
     */
    MobileOptimizer.prototype.handleViewportResize = function () {
        var self = this;
        this.originalViewportHeight = window.innerHeight;

        // Set CSS custom property for true viewport height
        function updateViewportHeight() {
            var vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', vh + 'px');
        }

        updateViewportHeight();
        window.addEventListener('resize', function () {
            // Debounce resize events
            clearTimeout(self._resizeTimeout);
            self._resizeTimeout = setTimeout(updateViewportHeight, 100);
        });

        // Fix for iOS Safari bottom bar
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            window.addEventListener('scroll', function () {
                if (window.pageYOffset > 0) {
                    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
                }
            }, { passive: true });
        }
    };

    /**
     * Smooth scroll to input when keyboard appears
     * Ensures input is visible above keyboard
     */
    MobileOptimizer.prototype.handleInputFocus = function () {
        var inputs = document.querySelectorAll('input, textarea, select');

        Array.prototype.forEach.call(inputs, function (input) {
            input.addEventListener('focus', function () {
                setTimeout(function () {
                    if (document.activeElement === input) {
                        input.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }, 300); // Wait for keyboard to appear
            });

            // Prevent page zoom on focus (for iOS)
            if (input.type === 'text' || input.type === 'tel' || input.type === 'email') {
                var fontSize = window.getComputedStyle(input).fontSize;
                if (parseInt(fontSize) < 16) {
                    input.style.fontSize = '16px';
                }
            }
        });
    };

    /**
     * Prevent double-tap zoom on buttons and interactive elements
     */
    MobileOptimizer.prototype.preventZoomOnDoubleTap = function () {
        var lastTouchEnd = 0;

        document.addEventListener('touchend', function (e) {
            var now = Date.now();
            if (now - lastTouchEnd <= 300) {
                // Double tap detected on button/link
                var target = e.target;
                if (target.tagName === 'BUTTON' ||
                    target.tagName === 'A' ||
                    target.closest('button') ||
                    target.closest('a')) {
                    e.preventDefault();
                }
            }
            lastTouchEnd = now;
        }, false);
    };

    /**
     * Improve scroll performance with passive listeners
     */
    MobileOptimizer.prototype.improveScrollPerformance = function () {
        // Add will-change hints to scrollable containers
        var scrollContainers = document.querySelectorAll('[data-scroll-container]');
        Array.prototype.forEach.call(scrollContainers, function (container) {
            container.style.willChange = 'scroll-position';

            container.addEventListener('scroll', function () {
                // Remove will-change after scroll ends
                clearTimeout(container._scrollTimeout);
                container._scrollTimeout = setTimeout(function () {
                    container.style.willChange = 'auto';
                }, 150);
            }, { passive: true });
        });

        // Add touch-action CSS for better touch responsiveness
        document.body.style.touchAction = 'manipulation';
    };

    /**
     * Force keyboard close
     */
    MobileOptimizer.prototype.closeKeyboard = function () {
        if (document.activeElement &&
            (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
        }
    };

    // Initialize
    var instance = new MobileOptimizer();

    Object.defineProperty(window, 'mobileOptimizer', {
        value: instance,
        writable: false,
        configurable: false,
    });
})();
