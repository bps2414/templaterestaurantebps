// ============================================
// Performance Monitor — Track metrics and optimize
// ============================================

(function () {
    'use strict';

    function PerformanceMonitor() {
        this.metrics = {};
        this.init();
    }

    PerformanceMonitor.prototype.init = function () {
        if (!window.performance || !window.performance.timing) return;

        this.measurePageLoad();
        this.observeResourceTiming();
        this.trackInteractionMetrics();
    };

    /**
     * Measure page load performance
     */
    PerformanceMonitor.prototype.measurePageLoad = function () {
        var self = this;

        window.addEventListener('load', function () {
            setTimeout(function () {
                var timing = performance.timing;
                var metrics = {
                    // Page load metrics
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    fullyLoaded: timing.loadEventEnd - timing.navigationStart,

                    // Network metrics
                    dns: timing.domainLookupEnd - timing.domainLookupStart,
                    tcp: timing.connectEnd - timing.connectStart,
                    request: timing.responseStart - timing.requestStart,
                    response: timing.responseEnd - timing.responseStart,

                    // Rendering metrics
                    domProcessing: timing.domComplete - timing.domLoading,
                    rendering: timing.loadEventEnd - timing.responseEnd,
                };

                self.metrics.pageLoad = metrics;
                self.logMetrics('Page Load', metrics);
            }, 0);
        });
    };

    /**
     * Observe resource loading performance
     */
    PerformanceMonitor.prototype.observeResourceTiming = function () {
        if (!window.PerformanceObserver) return;

        var self = this;

        try {
            var observer = new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (entry) {
                    if (entry.duration > 1000 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) { // Log slow resources (>1s) only in dev
                        console.warn('Slow resource:', entry.name, entry.duration.toFixed(2) + 'ms');
                    }
                });
            });

            observer.observe({ entryTypes: ['resource'] });
        } catch (e) {
            // PerformanceObserver not supported
        }
    };

    /**
     * Track user interaction metrics (FID approximation)
     */
    PerformanceMonitor.prototype.trackInteractionMetrics = function () {
        var self = this;
        var firstInteraction = true;

        function measureInteraction(e) {
            if (!firstInteraction) return;

            var start = performance.now();

            // Measure processing time
            setTimeout(function () {
                var duration = performance.now() - start;
                self.metrics.firstInputDelay = duration;

                if (duration > 100) {
                    console.warn('Slow first interaction:', duration.toFixed(2) + 'ms');
                }

                firstInteraction = false;
            }, 0);
        }

        ['click', 'touchstart', 'keydown'].forEach(function (eventType) {
            document.addEventListener(eventType, measureInteraction, { once: true, passive: true });
        });
    };

    /**
     * Mark custom performance events
     */
    PerformanceMonitor.prototype.mark = function (name) {
        if (window.performance && window.performance.mark) {
            try {
                performance.mark(name);
            } catch (e) {
                // Mark already exists or not supported
            }
        }
    };

    /**
     * Measure time between two marks
     */
    PerformanceMonitor.prototype.measure = function (name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                var measures = performance.getEntriesByName(name);
                if (measures.length > 0) {
                    var duration = measures[0].duration;
                    console.log('⚡', name + ':', duration.toFixed(2) + 'ms');
                    return duration;
                }
            } catch (e) {
                // Marks don't exist
            }
        }
        return null;
    };

    /**
     * Get current metrics
     */
    PerformanceMonitor.prototype.getMetrics = function () {
        return this.metrics;
    };

    /**
     * Log metrics to console (dev mode only)
     */
    PerformanceMonitor.prototype.logMetrics = function (label, data) {
        if (!data) return;

        console.groupCollapsed('📊 ' + label);
        Object.keys(data).forEach(function (key) {
            var value = data[key];
            var display = typeof value === 'number' ? value.toFixed(2) + 'ms' : value;
            console.log(key + ':', display);
        });
        console.groupEnd();
    };

    /**
     * Report Web Vitals (if available)
     */
    PerformanceMonitor.prototype.reportWebVitals = function () {
        if (!window.PerformanceObserver) return;

        // Largest Contentful Paint (LCP)
        try {
            var lcpObserver = new PerformanceObserver(function (list) {
                var entries = list.getEntries();
                var lastEntry = entries[entries.length - 1];
                console.log('🎨 LCP:', lastEntry.renderTime || lastEntry.loadTime, 'ms');
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) { }

        // Cumulative Layout Shift (CLS)
        try {
            var clsScore = 0;
            var clsObserver = new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (entry) {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                    }
                });
                console.log('📐 CLS:', clsScore.toFixed(4));
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) { }
    };

    // Initialize
    var instance = new PerformanceMonitor();

    Object.defineProperty(window, 'perfMonitor', {
        value: instance,
        writable: false,
        configurable: false,
    });

    // Report Web Vitals after page load
    if (document.readyState === 'complete') {
        instance.reportWebVitals();
    } else {
        window.addEventListener('load', function () {
            instance.reportWebVitals();
        });
    }
})();
