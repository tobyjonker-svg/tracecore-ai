/**
 * WooCommerce Sync Helper
 * Handles real-time inventory sync to MycoAlchemy WooCommerce store
 */

export async function syncInventoryToWooCommerce(data: {
  productId: number;
  quantity: number;
  productName?: string;
  sku?: string;
}): Promise<boolean> {
  try {
    const woocommerceWebhookUrl = process.env.WOOCOMMERCE_INVENTORY_WEBHOOK_URL;
    const woocommerceApiKey = process.env.WOOCOMMERCE_API_KEY;

    if (!woocommerceWebhookUrl) {
      console.warn('[WooCommerce] Inventory webhook URL not configured, skipping sync');
      return false;
    }

    const payload = {
      productId: data.productId,
      quantity: data.quantity,
      productName: data.productName,
      sku: data.sku,
      timestamp: new Date().toISOString(),
      source: 'tracecore-ai',
    };

    const response = await fetch(woocommerceWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WC-Webhook-Source': 'tracecore-ai',
        ...(woocommerceApiKey && { 'Authorization': `Bearer ${woocommerceApiKey}` }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[WooCommerce] Inventory sync failed: ${response.statusText}`);
      return false;
    }

    console.log(`[WooCommerce] Inventory synced: ${data.productName || `Product ${data.productId}`} (${data.quantity} units)`);
    return true;
  } catch (error) {
    console.error('[WooCommerce] Inventory sync error:', error);
    return false;
  }
}
