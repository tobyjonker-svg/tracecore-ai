/**
 * TraceCore AI Tracker
 * Customer behavior tracking for WooCommerce integration
 * Tracks: page views, product views, cart events, checkout, orders
 */

(function(window) {
  'use strict';

  const TraceCoreTracker = {
    config: null,
    sessionId: null,
    customerId: null,
    events: [],

    /**
     * Initialize tracker with config
     */
    init: function(config) {
      this.config = config || {};
      this.sessionId = this.generateSessionId();
      this.customerId = this.getCustomerId();
      
      console.log('[TraceCoreTracker] Initialized', {
        storeId: this.config.storeId,
        sessionId: this.sessionId,
        apiUrl: this.config.apiUrl
      });

      // Track initial page view
      this.trackPageView();

      // Set up event listeners
      this.setupEventListeners();
    },

    /**
     * Generate unique session ID
     */
    generateSessionId: function() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Get or create customer ID from localStorage
     */
    getCustomerId: function() {
      let customerId = localStorage.getItem('tracecore_customer_id');
      if (!customerId) {
        customerId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tracecore_customer_id', customerId);
      }
      return customerId;
    },

    /**
     * Track page view
     */
    trackPageView: function() {
      const event = {
        type: 'pageView',
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
    },

    /**
     * Track product view
     */
    trackProductView: function(productData) {
      const event = {
        type: 'productView',
        productId: productData.productId,
        productName: productData.productName,
        sku: productData.sku || null,
        price: productData.price,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
      console.log('[TraceCoreTracker] Product view tracked', event);
    },

    /**
     * Track add to cart
     */
    trackAddToCart: function(cartData) {
      const event = {
        type: 'addToCart',
        productId: cartData.productId,
        productName: cartData.productName,
        price: cartData.price,
        quantity: cartData.quantity || 1,
        cartTotal: cartData.cartTotal,
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
      console.log('[TraceCoreTracker] Add to cart tracked', event);
    },

    /**
     * Track cart view
     */
    trackCartView: function(cartData) {
      const event = {
        type: 'cartView',
        itemCount: cartData.itemCount || 0,
        cartTotal: cartData.cartTotal || 0,
        items: cartData.items || [],
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
      console.log('[TraceCoreTracker] Cart view tracked', event);
    },

    /**
     * Track checkout start
     */
    trackCheckoutStart: function(checkoutData) {
      const event = {
        type: 'checkoutStart',
        cartTotal: checkoutData?.cartTotal || 0,
        itemCount: checkoutData?.itemCount || 0,
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
      console.log('[TraceCoreTracker] Checkout started', event);
    },

    /**
     * Track order completion
     */
    trackOrderComplete: function(orderData) {
      const event = {
        type: 'orderComplete',
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        totalAmount: orderData.totalAmount,
        items: orderData.items || [],
        customerEmail: orderData.customerEmail,
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
      console.log('[TraceCoreTracker] Order completed', event);
    },

    /**
     * Track cart abandonment
     */
    trackCartAbandonment: function(cartData) {
      const event = {
        type: 'cartAbandonment',
        cartTotal: cartData.cartTotal || 0,
        itemCount: cartData.itemCount || 0,
        items: cartData.items || [],
        timestamp: new Date().toISOString()
      };
      this.sendEvent(event);
      console.log('[TraceCoreTracker] Cart abandonment tracked', event);
    },

    /**
     * Send event to TraceCore API
     */
    sendEvent: function(event) {
      if (!this.config.apiUrl) {
        console.warn('[TraceCoreTracker] API URL not configured');
        return;
      }

      const payload = {
        ...event,
        storeId: this.config.storeId,
        storeName: this.config.storeName,
        sessionId: this.sessionId,
        customerId: this.customerId,
        userAgent: navigator.userAgent,
        timestamp: event.timestamp || new Date().toISOString()
      };

      // Send as beacon for reliability
      if (navigator.sendBeacon) {
        const beaconUrl = this.config.apiUrl.replace('/trpc', '/pixel') + 
          '?store=' + encodeURIComponent(this.config.storeId) +
          '&event=' + encodeURIComponent(event.type) +
          '&data=' + encodeURIComponent(JSON.stringify(payload));
        
        navigator.sendBeacon(beaconUrl, JSON.stringify(payload));
      } else {
        // Fallback to fetch
        fetch(this.config.apiUrl + '/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Store-ID': this.config.storeId
          },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(err => console.error('[TraceCoreTracker] Send error:', err));
      }
    },

    /**
     * Set up automatic event listeners
     */
    setupEventListeners: function() {
      // Track product clicks (if data-product-id is set)
      document.addEventListener('click', (e) => {
        const productLink = e.target.closest('[data-product-id]');
        if (productLink) {
          this.trackProductView({
            productId: productLink.dataset.productId,
            productName: productLink.dataset.productName || 'Unknown',
            sku: productLink.dataset.sku,
            price: productLink.dataset.price
          });
        }
      });

      // Track add to cart button
      document.addEventListener('click', (e) => {
        if (e.target.closest('.add_to_cart_button, [data-add-to-cart]')) {
          const productElement = e.target.closest('.product, [data-product-id]');
          if (productElement) {
            this.trackAddToCart({
              productId: productElement.dataset.productId,
              productName: productElement.dataset.productName || 'Unknown',
              price: productElement.dataset.price,
              quantity: 1
            });
          }
        }
      });

      // Track page unload (for cart abandonment)
      window.addEventListener('beforeunload', () => {
        // Check if on checkout page and not completing order
        if (window.location.pathname.includes('checkout') && 
            !window.location.pathname.includes('order-received')) {
          // Could track cart abandonment here
        }
      });
    },

    /**
     * Get session info
     */
    getSessionInfo: function() {
      return {
        sessionId: this.sessionId,
        customerId: this.customerId,
        storeId: this.config.storeId,
        events: this.events.length
      };
    }
  };

  // Expose to window
  window.TraceCoreTracker = TraceCoreTracker;

  // Auto-initialize if config exists
  if (window.TraceCoreConfig) {
    TraceCoreTracker.init(window.TraceCoreConfig);
  }

})(window);
