# WooCommerce Integration Guide - TraceCore AI & MycoAlchemy

## Overview

This guide explains how to connect TraceCore AI with your MycoAlchemy WordPress/WooCommerce store for bidirectional real-time synchronization.

**Features:**
- ✅ Automatic order creation in TraceCore when customers purchase on MycoAlchemy
- ✅ Real-time inventory updates sent back to MycoAlchemy website
- ✅ Webhook-based integration (instant sync)
- ✅ Secure signature validation for webhook authenticity

---

## Architecture

```
MycoAlchemy (WooCommerce)
    ↓ (Order Webhook)
TraceCore AI (Receives Order)
    ↓ (Creates Order + Updates Inventory)
TraceCore Dashboard
    ↓ (Inventory Update Webhook)
MycoAlchemy (Updates Stock Levels)
```

---

## Setup Instructions

### Step 1: Configure Environment Variables

Add these to your TraceCore AI `.env` file:

```env
# WooCommerce Integration
WOOCOMMERCE_WEBHOOK_SECRET=your_webhook_secret_key_here
WOOCOMMERCE_API_KEY=your_woocommerce_api_key
WOOCOMMERCE_INVENTORY_WEBHOOK_URL=https://mycoalchemy.co.za/wp-json/wc/v3/webhooks/inventory-update
```

### Step 2: Get Your Webhook URL

Your TraceCore webhook endpoint is:

```
https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.webhookOrderCreated
```

Or when using custom domain:

```
https://tracecoreai.com/api/trpc/woocommerce.webhookOrderCreated
```

### Step 3: Configure WooCommerce Webhooks

In your MycoAlchemy WordPress admin:

1. Go to **WooCommerce → Settings → Advanced → Webhooks**
2. Click **Add Webhook**
3. Configure as follows:

   | Setting | Value |
   |---------|-------|
   | **Name** | TraceCore Order Sync |
   | **Status** | Active |
   | **Topic** | Order Created |
   | **Delivery URL** | `https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.webhookOrderCreated` |
   | **Secret** | (Use the same value as `WOOCOMMERCE_WEBHOOK_SECRET`) |

4. Click **Save Webhook**

---

## API Endpoints

### 1. Webhook: Order Created

**Endpoint:** `POST /api/trpc/woocommerce.webhookOrderCreated`

**Purpose:** Receives order data from WooCommerce and creates order in TraceCore

**Request Payload:**

```json
{
  "orderId": 12345,
  "orderNumber": "WOO-12345",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "items": [
    {
      "productId": 1,
      "productName": "Herbal Tea",
      "sku": "HT-001",
      "quantity": 2,
      "price": 150,
      "total": 300
    }
  ],
  "totalAmount": 300,
  "status": "pending",
  "paymentStatus": "paid",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Cape Town",
    "state": "WC",
    "postcode": "8000",
    "country": "ZA"
  },
  "createdAt": "2026-03-30T10:30:00Z",
  "signature": "base64_encoded_hmac_signature"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order WOO-12345 created successfully"
}
```

### 2. Sync Inventory to WooCommerce

**Endpoint:** `POST /api/trpc/woocommerce.syncInventoryToWooCommerce`

**Purpose:** Sends updated inventory levels back to WooCommerce

**Request Payload:**

```json
{
  "productId": 1,
  "quantity": 45,
  "woocommerceProductId": 789
}
```

**Response:**

```json
{
  "success": true,
  "message": "Inventory synced to WooCommerce"
}
```

### 3. Get Integration Status

**Endpoint:** `GET /api/trpc/woocommerce.getIntegrationStatus`

**Purpose:** Check if WooCommerce integration is configured and ready

**Response:**

```json
{
  "isConfigured": true,
  "webhookUrl": "https://traceai-jqzfjcqa.manus.space/api/trpc/woocommerce.webhookOrderCreated",
  "features": {
    "orderSync": true,
    "inventorySync": true,
    "realTimeSync": true
  },
  "status": "ready"
}
```

### 4. Test Webhook Connection

**Endpoint:** `POST /api/trpc/woocommerce.testWebhookConnection`

**Purpose:** Generate a test webhook payload to verify connection

**Request Payload:**

```json
{
  "testOrderId": 99999
}
```

**Response:**

```json
{
  "success": true,
  "message": "Test webhook payload prepared",
  "payload": { ... }
}
```

---

## Data Flow

### Order Creation Flow

1. **Customer places order on MycoAlchemy**
   - Order is created in WooCommerce
   - WooCommerce sends webhook to TraceCore

2. **TraceCore receives webhook**
   - Validates webhook signature
   - Creates order in TraceCore database
   - Automatically updates inventory

3. **Inventory updated**
   - Product stock decreased by order quantity
   - TraceCore dashboard shows updated inventory

### Inventory Sync Flow

1. **Inventory updated in TraceCore**
   - User adjusts stock in TraceCore dashboard
   - Or system updates stock automatically

2. **TraceCore sends update to WooCommerce**
   - Calls `syncInventoryToWooCommerce` endpoint
   - Sends new stock level

3. **MycoAlchemy website updated**
   - WooCommerce receives inventory update
   - Website displays accurate stock levels

---

## Security

### Webhook Signature Validation

All webhooks include an HMAC-SHA256 signature for security:

```
Signature = Base64(HMAC-SHA256(payload, WOOCOMMERCE_WEBHOOK_SECRET))
```

TraceCore automatically validates this signature before processing webhooks.

### API Authentication

- **Public endpoints:** `webhookOrderCreated`, `testWebhookConnection`, `getIntegrationStatus`
- **Protected endpoints:** `syncInventoryToWooCommerce` (requires user authentication)

---

## Troubleshooting

### Webhooks not being received

1. **Check webhook URL** - Verify it's correct in WooCommerce settings
2. **Check secret key** - Ensure `WOOCOMMERCE_WEBHOOK_SECRET` matches WooCommerce
3. **Check firewall** - Ensure MycoAlchemy server can reach TraceCore
4. **Check logs** - Look for errors in TraceCore server logs

### Orders not appearing in TraceCore

1. **Check webhook delivery** - Go to WooCommerce → Webhooks → View deliveries
2. **Check TraceCore logs** - Look for webhook processing errors
3. **Verify workspace ID** - Ensure orders are being created in correct workspace

### Inventory not syncing back to WooCommerce

1. **Check `WOOCOMMERCE_INVENTORY_WEBHOOK_URL`** - Verify it's correct
2. **Check `WOOCOMMERCE_API_KEY`** - Ensure it's valid
3. **Check WooCommerce permissions** - API key needs write access to products

---

## Testing

### Manual Test

1. Go to TraceCore dashboard
2. Call `trpc.woocommerce.testWebhookConnection.mutate()`
3. Verify test payload is generated
4. Manually send payload to webhook endpoint

### End-to-End Test

1. Create a test order on MycoAlchemy
2. Check TraceCore dashboard for new order
3. Verify inventory was decreased
4. Update inventory in TraceCore
5. Check MycoAlchemy website for updated stock

---

## Support

For issues or questions:
- Check TraceCore server logs: `.manus-logs/devserver.log`
- Check browser console for client-side errors
- Review webhook delivery logs in WooCommerce admin

---

## API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `woocommerce.webhookOrderCreated` | POST | Public | Receive orders from WooCommerce |
| `woocommerce.syncInventoryToWooCommerce` | POST | Protected | Send inventory to WooCommerce |
| `woocommerce.getIntegrationStatus` | GET | Public | Check integration status |
| `woocommerce.testWebhookConnection` | POST | Public | Test webhook connection |

