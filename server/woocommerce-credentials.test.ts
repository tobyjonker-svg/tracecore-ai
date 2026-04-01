import { describe, it, expect } from 'vitest';

/**
 * Validate WooCommerce API credentials by making a test request to MycoAlchemy
 * This ensures the environment variables are correctly set and the API is accessible
 */
describe('WooCommerce API Credentials', () => {
  it('should validate WooCommerce API credentials by fetching products', async () => {
    const storeUrl = process.env.WOOCOMMERCE_STORE_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

    expect(storeUrl).toBeDefined();
    expect(consumerKey).toBeDefined();
    expect(consumerSecret).toBeDefined();

    // Create Basic Auth header
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await fetch(`${storeUrl}/wp-json/wc/v3/products?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      console.log('✅ WooCommerce API credentials validated successfully');
    } catch (error) {
      console.error('❌ WooCommerce API validation failed:', error);
      throw error;
    }
  });

  it('should validate webhook secret is set', () => {
    const webhookSecret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
    expect(webhookSecret).toBe('tracecore_mycoalchemy_2026');
  });
});
