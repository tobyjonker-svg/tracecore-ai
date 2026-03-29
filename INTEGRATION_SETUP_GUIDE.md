# TraceCore AI - Integration Setup Guide

This guide covers setting up third-party integrations for WooCommerce, SendGrid, and Paystack payment processing.

---

## 1. WooCommerce Integration

### Overview
Automatically sync orders, products, and inventory between your WooCommerce store and TraceCore AI.

### Setup Steps

**Step 1: Generate WooCommerce API Keys**
1. Log in to your WooCommerce admin dashboard
2. Navigate to Settings → Advanced → REST API
3. Click "Create an API key"
4. Set Permissions to "Read/Write"
5. Copy the Consumer Key and Consumer Secret

**Step 2: Configure in TraceCore AI**
1. Go to Settings → Integrations → WooCommerce
2. Enter your store URL (e.g., https://mystore.com)
3. Paste Consumer Key and Consumer Secret
4. Click "Connect"

**Step 3: Configure Sync Settings**
- Auto-sync frequency: Every 15 minutes (default)
- Sync orders: ✓ Enabled
- Sync products: ✓ Enabled
- Sync inventory: ✓ Enabled
- Update order status: ✓ Enabled

**Step 4: Test Connection**
- Click "Test Connection" button
- Verify sync is working by checking recent orders

### Supported Features
- ✓ Auto-sync orders every 15 minutes
- ✓ Sync product inventory levels
- ✓ Sync customer data
- ✓ Update order status in WooCommerce
- ✓ Handle order cancellations
- ✓ Webhook support for real-time updates

### Troubleshooting
- **Connection Failed**: Verify Consumer Key/Secret are correct
- **Orders Not Syncing**: Check WooCommerce REST API is enabled
- **Inventory Mismatch**: Run manual sync from Integration Hub

---

## 2. SendGrid Email Integration

### Overview
Send transactional emails for order confirmations, shipment tracking, alerts, and scheduled reports.

### Setup Steps

**Step 1: Create SendGrid Account**
1. Sign up at https://sendgrid.com
2. Verify your sender identity (domain or email)
3. Navigate to Settings → API Keys
4. Create a new API Key with "Mail Send" permissions

**Step 2: Configure in TraceCore AI**
1. Go to Settings → Integrations → Email
2. Select "SendGrid" as email provider
3. Paste your SendGrid API Key
4. Set "From Email" to your verified sender
5. Click "Save"

**Step 3: Configure Email Templates**
1. Go to Settings → Email Templates
2. Customize templates for:
   - Order Confirmation
   - Shipment Tracking
   - Alert Notifications
   - Scheduled Reports
3. Add company logo and branding

**Step 4: Test Email**
1. Click "Send Test Email"
2. Verify email arrives in your inbox
3. Check formatting and branding

### Supported Email Types
- ✓ Order confirmation emails
- ✓ Shipment tracking emails
- ✓ Alert notifications
- ✓ Scheduled report delivery
- ✓ Custom email templates
- ✓ Email template editor with preview

### Configuration
```
Email Provider: SendGrid
API Key: [Your SendGrid API Key]
From Email: noreply@yourbusiness.com
From Name: TraceCore AI
```

### Troubleshooting
- **Emails Not Sending**: Check API Key is valid and has "Mail Send" permission
- **Emails Going to Spam**: Verify sender domain is authenticated in SendGrid
- **Template Issues**: Check template variables match email data

---

## 3. Paystack Payment Processing

### Overview
Accept payments for subscriptions and premium features using Paystack.

### Setup Steps

**Step 1: Create Paystack Account**
1. Sign up at https://paystack.com
2. Complete business verification
3. Navigate to Settings → API Keys & Webhooks
4. Copy your Public Key and Secret Key

**Step 2: Configure in TraceCore AI**
1. Go to Settings → Integrations → Payment
2. Select "Paystack" as payment processor
3. Paste Public Key and Secret Key
4. Set default currency to ZAR (South African Rand)
5. Click "Save"

**Step 3: Setup Webhook**
1. In Paystack dashboard, go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Select events:
   - charge.success
   - charge.failed
   - subscription.create
   - subscription.disable
4. Save webhook

**Step 4: Configure Subscription Plans**
1. Go to Settings → Subscription Plans
2. Create plans:
   - Free: 0 ZAR/month (5 item limit)
   - Pro: 299 ZAR/month (unlimited items)
   - Pro+: 599 ZAR/month (unlimited + priority support)
3. Set plan features and limits

**Step 5: Test Payment**
1. Use Paystack test card: 4111 1111 1111 1111
2. Process a test payment
3. Verify webhook is triggered
4. Check subscription status updates

### Supported Features
- ✓ One-time payments
- ✓ Recurring subscriptions
- ✓ Automatic billing
- ✓ Payment receipt generation
- ✓ Refund handling
- ✓ Invoice generation
- ✓ Webhook support for real-time updates

### Test Credentials
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
OTP: 123456 (when prompted)
```

### Configuration
```
Payment Processor: Paystack
Public Key: [Your Paystack Public Key]
Secret Key: [Your Paystack Secret Key]
Currency: ZAR
Webhook URL: https://yourdomain.com/api/webhooks/paystack
```

### Troubleshooting
- **Payment Not Processing**: Check Public/Secret Keys are correct
- **Webhook Not Triggering**: Verify webhook URL is accessible and webhook is enabled
- **Subscription Not Created**: Check plan configuration and Paystack account status

---

## Integration Status Dashboard

Monitor all integrations from the Integration Hub:

**Status Indicators:**
- 🟢 Connected: Integration is active and syncing
- 🟡 Pending: Awaiting configuration or verification
- 🔴 Error: Integration has encountered an error

**Last Sync Times:**
- WooCommerce: Shows last successful sync timestamp
- SendGrid: Shows last email sent timestamp
- Paystack: Shows last webhook received timestamp

**Quick Actions:**
- Test Connection: Verify integration is working
- Resync: Manually trigger data sync
- Configure: Update integration settings
- Disconnect: Remove integration

---

## Security Best Practices

1. **API Keys**: Store API keys in environment variables, never in code
2. **Webhooks**: Verify webhook signatures before processing
3. **HTTPS**: Always use HTTPS for webhook URLs
4. **Rate Limiting**: Implement rate limiting on webhook endpoints
5. **Data Validation**: Validate all data from integrations
6. **Error Logging**: Log all integration errors for debugging

---

## Support & Troubleshooting

For integration issues:
1. Check Integration Hub status
2. Review error logs in Settings → System Logs
3. Verify API credentials are correct
4. Test connection using provided test tools
5. Contact support if issues persist

---

## Next Steps

After setting up integrations:
1. ✓ Configure email templates
2. ✓ Set up subscription plans
3. ✓ Test all integrations
4. ✓ Monitor sync status
5. ✓ Set up alerts for integration failures
