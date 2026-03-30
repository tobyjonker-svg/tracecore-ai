# MycoAlchemy ↔ TraceCore AI Integration

## Complete Setup Guide with Copy-Paste Code

---

## 1. EMBED CODE FOR MYCOALCHEMY WEBSITE

### Add to WordPress `<head>` Section

**Location:** WordPress Admin → Appearance → Theme File Editor → `header.php` (or use a plugin like "Header and Footer Scripts")

```html
<!-- TraceCore AI Integration Script -->
<script>
  // TraceCore AI Configuration
  window.TraceCoreConfig = {
    apiUrl: 'https://traceai-jqzfjcqa.manus.space/api/trpc',
    webhookSecret: 'YOUR_WEBHOOK_SECRET_HERE',
    storeId: 'mycoalchemy',
    storeName: 'MycoAlchemy',
    environment: 'production'
  };

  // Initialize TraceCore Tracker
  (function() {
    const script = document.createElement('script');
    script.src = 'https://traceai-jqzfjcqa.manus.space/api/tracker.js';
    script.async = true;
    script.onload = function() {
      if (window.TraceCoreTracker) {
        window.TraceCoreTracker.init(window.TraceCoreConfig);
        console.log('TraceCore AI Tracker initialized');
      }
    };
    document.head.appendChild(script);
  })();
</script>
```

### Add to WordPress `<body>` Section (After `<body>` tag)

**Location:** WordPress Admin → Appearance → Theme File Editor → `header.php` (after `<body>` tag)

```html
<!-- TraceCore AI Pixel Tracking -->
<img src="https://traceai-jqzfjcqa.manus.space/api/pixel?store=mycoalchemy&page=homepage" alt="" style="display:none;" />
```

---

## 2. API ENDPOINT URLS & AUTHENTICATION

### Webhook Endpoint (for WooCommerce to send orders)

```
POST https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.webhookOrderCreated
```

**Headers:**
```
Content-Type: application/json
X-WC-Webhook-Source: mycoalchemy
Authorization: Bearer YOUR_WOOCOMMERCE_API_KEY
```

### Inventory Sync Endpoint (TraceCore sends stock updates back)

```
POST https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.syncInventoryToWooCommerce
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN
```

### Integration Status Check

```
GET https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.getIntegrationStatus
```

---

## 3. WORDPRESS/WOOCOMMERCE SETUP STEPS

### Step A: Install WooCommerce REST API Plugin

1. Go to **WordPress Admin → Plugins → Add New**
2. Search for **"WooCommerce REST API"**
3. Install and activate
4. Go to **WooCommerce → Settings → Advanced → REST API**

### Step B: Create API Key

1. Click **"Create an API Key"**
2. Set as follows:
   - **Description:** TraceCore AI Integration
   - **User:** Admin user
   - **Permissions:** Read/Write
3. Copy the **Consumer Key** and **Consumer Secret**
4. Save these securely

### Step C: Configure Webhooks

1. Go to **WooCommerce → Settings → Advanced → Webhooks**
2. Click **"Add Webhook"**
3. Configure:

| Field | Value |
|-------|-------|
| Name | TraceCore Order Sync |
| Status | Active |
| Topic | Order Created |
| Delivery URL | `https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.webhookOrderCreated` |
| Secret | `YOUR_WEBHOOK_SECRET_HERE` |

4. Click **Save Webhook**
5. Test delivery by clicking **"Test"**

### Step D: Configure Inventory Webhook (Optional - for stock sync back)

1. Create another webhook:

| Field | Value |
|-------|-------|
| Name | TraceCore Inventory Sync |
| Status | Active |
| Topic | Product Updated |
| Delivery URL | `https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.syncInventoryToWooCommerce` |
| Secret | `YOUR_WEBHOOK_SECRET_HERE` |

---

## 4. DATA REQUIREMENTS - WHAT TRACECORE NEEDS

### From WooCommerce Orders:

```json
{
  "orderId": 12345,
  "orderNumber": "WOO-12345",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "items": [
    {
      "productId": 1,
      "productName": "Herbal Tea - Reishi",
      "sku": "HT-REISHI-100ML",
      "quantity": 2,
      "price": 150.00,
      "total": 300.00
    }
  ],
  "totalAmount": 300.00,
  "status": "processing",
  "paymentStatus": "paid",
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Cape Town",
    "state": "Western Cape",
    "postcode": "8000",
    "country": "ZA"
  },
  "createdAt": "2026-03-30T10:30:00Z"
}
```

### From Product Data:

```json
{
  "productId": 1,
  "productName": "Herbal Tea - Reishi",
  "sku": "HT-REISHI-100ML",
  "price": 150.00,
  "stock": 45,
  "category": "Herbal Teas",
  "description": "Premium reishi mushroom tea blend"
}
```

### Customer Behavior Tracking:

- Page views (which product pages visited)
- Add to cart events
- Checkout page visits
- Purchase completion
- Cart abandonment

---

## 5. PAGE-SPECIFIC PLACEMENT

### All Pages (Global Tracking)

Add to `header.php` - tracks all page views automatically

### Product Pages Only

```html
<?php
if (is_product()) {
  echo '<script>
    if (window.TraceCoreTracker) {
      window.TraceCoreTracker.trackProductView({
        productId: ' . get_the_ID() . ',
        productName: "' . get_the_title() . '",
        price: ' . get_post_meta(get_the_ID(), '_price', true) . '
      });
    }
  </script>';
}
?>
```

### Checkout Page Only

```html
<?php
if (is_checkout()) {
  echo '<script>
    if (window.TraceCoreTracker) {
      window.TraceCoreTracker.trackCheckoutStart();
    }
  </script>';
}
?>
```

### Order Confirmation Page

```html
<?php
if (is_order_received_page()) {
  global $wp;
  $order_id = absint($wp->query_vars['order-received']);
  $order = wc_get_order($order_id);
  
  echo '<script>
    if (window.TraceCoreTracker) {
      window.TraceCoreTracker.trackOrderComplete({
        orderId: ' . $order_id . ',
        totalAmount: ' . $order->get_total() . '
      });
    }
  </script>';
}
?>
```

---

## CONFIGURATION VALUES TO USE

Replace these in your code:

| Variable | Value |
|----------|-------|
| `YOUR_WEBHOOK_SECRET_HERE` | Generate a random string: `tracecore_wh_$(date +%s)_$(openssl rand -hex 16)` |
| `YOUR_WOOCOMMERCE_API_KEY` | From WooCommerce → Settings → REST API |
| `API_URL` | `https://traceai-jqzfjcqa.manus.space/api/trpc` |
| `STORE_ID` | `mycoalchemy` |
| `STORE_NAME` | `MycoAlchemy` |

---

## TESTING CHECKLIST

- [ ] Embed code added to WordPress header
- [ ] Pixel tracking code added to body
- [ ] WooCommerce REST API key created
- [ ] Webhook configured and tested
- [ ] Test order placed on MycoAlchemy
- [ ] Order appears in TraceCore dashboard
- [ ] Inventory updated in TraceCore
- [ ] Stock level synced back to MycoAlchemy

---

## TROUBLESHOOTING

### Webhook not receiving data

```bash
# Check webhook delivery logs in WooCommerce
# WooCommerce → Settings → Advanced → Webhooks → View Deliveries
```

### Script not loading

```javascript
// Open browser console and check:
console.log(window.TraceCoreConfig);
console.log(window.TraceCoreTracker);
```

### API authentication errors

- Verify API key is correct
- Check webhook secret matches configuration
- Ensure API key has Read/Write permissions

---

## NEXT STEPS

1. **Copy embed code** to MycoAlchemy WordPress
2. **Create WooCommerce API key**
3. **Configure webhooks**
4. **Test with a sample order**
5. **Verify data in TraceCore dashboard**
6. **Enable inventory sync** (optional)

---

## SUPPORT

For issues:
- Check WooCommerce webhook delivery logs
- Review TraceCore server logs
- Test API endpoints with curl/Postman

