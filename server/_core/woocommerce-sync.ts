const WC_URL = process.env.WOOCOMMERCE_STORE_URL || 'https://mycoalchemy.co.za';
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';
const wcAuth = () => 'Basic ' + Buffer.from(WC_KEY + ':' + WC_SECRET).toString('base64');

export async function fetchWooCommerceOrders(page = 1) {
  try {
    const res = await fetch(`${WC_URL}/wp-json/wc/v3/orders?per_page=50&page=${page}&orderby=date&order=desc`, {
      headers: { Authorization: wcAuth() }
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch(e) { console.error('[WC] fetchOrders:', e); return []; }
}

export async function fetchWooCommerceProducts() {
  try {
    const res = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100`, {
      headers: { Authorization: wcAuth() }
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch(e) { console.error('[WC] fetchProducts:', e); return []; }
}

export async function updateWooCommerceStock(wcProductId: number, quantity: number) {
  try {
    await fetch(`${WC_URL}/wp-json/wc/v3/products/${wcProductId}`, {
      method: 'PUT',
      headers: { Authorization: wcAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_quantity: quantity, manage_stock: true })
    });
    console.log(`[WC] Updated product ${wcProductId} stock to ${quantity}`);
    return true;
  } catch(e) { console.error('[WC] updateStock:', e); return false; }
}

export async function updateWooCommerceOrderStatus(wcOrderId: number, status: string) {
  try {
    await fetch(`${WC_URL}/wp-json/wc/v3/orders/${wcOrderId}`, {
      method: 'PUT',
      headers: { Authorization: wcAuth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    console.log(`[WC] Order ${wcOrderId} updated to ${status}`);
    return true;
  } catch(e) { console.error('[WC] updateOrderStatus:', e); return false; }
}

export async function syncInventoryToWooCommerce(data: { productId?: number; sku?: string; productName?: string; quantity: number }) {
  try {
    if (!WC_KEY) { console.log('[WC] No API key configured, skipping sync'); return false; }
    const wcProducts = await fetchWooCommerceProducts();
    if (!wcProducts.length) { console.error('[WC] No products returned from WooCommerce'); return false; }
    const match = wcProducts.find((p: any) =>
      (data.sku && p.sku === data.sku) ||
      (data.productName && p.name.toLowerCase() === data.productName.toLowerCase())
    );
    if (!match) { console.error(`[WC] No matching product found for: ${data.productName || data.sku}`); return false; }
    return await updateWooCommerceStock(match.id, data.quantity);
  } catch(e) { console.error('[WC] syncInventory:', e); return false; }
}
