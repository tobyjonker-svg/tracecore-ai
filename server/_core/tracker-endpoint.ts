import { Router } from "express";

/**
 * Tracker.js endpoint for MycoAlchemy analytics
 * Returns JavaScript code that tracks user behavior on the MycoAlchemy website
 */

export function createTrackerEndpoint() {
  const router = Router();

  router.get("/api/tracker.js", (req, res) => {
    // Return the TraceCoreTracker JavaScript library
    const trackerScript = `
(function() {
  'use strict';

  window.TraceCoreTracker = {
    config: null,
    apiUrl: null,

    /**
     * Initialize the tracker with store configuration
     */
    init: function(config) {
      this.config = config;
      this.apiUrl = config.apiUrl || 'https://traceai-jqzfjcqa.manus.space/api/trpc';
      console.log('[TraceCoreTracker] Initialized for store:', config.storeId);
    },

    /**
     * Track product view event
     */
    trackProductView: function(data) {
      if (!this.config) {
        console.warn('[TraceCoreTracker] Not initialized');
        return;
      }

      const payload = {
        eventType: 'productView',
        store: this.config.storeId,
        productId: data.productId,
        productName: data.productName,
        sku: data.sku,
        price: data.price,
        timestamp: new Date().toISOString(),
      };

      this._sendEvent(payload);
    },

    /**
     * Track cart view event
     */
    trackCartView: function(data) {
      if (!this.config) {
        console.warn('[TraceCoreTracker] Not initialized');
        return;
      }

      const payload = {
        eventType: 'cartView',
        store: this.config.storeId,
        cartTotal: data?.cartTotal || 0,
        itemCount: data?.itemCount || 0,
        timestamp: new Date().toISOString(),
      };

      this._sendEvent(payload);
    },

    /**
     * Track checkout start event
     */
    trackCheckoutStart: function() {
      if (!this.config) {
        console.warn('[TraceCoreTracker] Not initialized');
        return;
      }

      const payload = {
        eventType: 'checkoutStart',
        store: this.config.storeId,
        timestamp: new Date().toISOString(),
      };

      this._sendEvent(payload);
    },

    /**
     * Track order completion event
     */
    trackOrderComplete: function(data) {
      if (!this.config) {
        console.warn('[TraceCoreTracker] Not initialized');
        return;
      }

      const payload = {
        eventType: 'orderComplete',
        store: this.config.storeId,
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        timestamp: new Date().toISOString(),
      };

      this._sendEvent(payload);
    },

    /**
     * Track add to cart event
     */
    trackAddToCart: function(data) {
      if (!this.config) {
        console.warn('[TraceCoreTracker] Not initialized');
        return;
      }

      const payload = {
        eventType: 'addToCart',
        store: this.config.storeId,
        productId: data.productId,
        productName: data.productName,
        price: data.price,
        quantity: data.quantity,
        timestamp: new Date().toISOString(),
      };

      this._sendEvent(payload);
    },

    /**
     * Internal method to send events to TraceCoreAI
     */
    _sendEvent: function(payload) {
      try {
        // Send event asynchronously - don't block page
        fetch(this.apiUrl + '/tracking.recordEvent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          keepalive: true, // Keep connection alive even if page unloads
        }).catch(err => {
          console.warn('[TraceCoreTracker] Failed to send event:', err);
        });
      } catch (error) {
        console.error('[TraceCoreTracker] Error sending event:', error);
      }
    },
  };

  // Auto-initialize if config is available
  if (window.TraceCoreConfig) {
    window.TraceCoreTracker.init(window.TraceCoreConfig);
  }
})();
`;

    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(trackerScript);
  });

  return router;
}
