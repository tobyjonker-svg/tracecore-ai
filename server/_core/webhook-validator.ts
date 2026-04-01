import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to validate WooCommerce webhook signatures
 * Validates the X-WC-Webhook-Signature header using HMAC-SHA256
 */

export function validateWooCommerceWebhook(req: Request, res: Response, next: NextFunction) {
  // Get the signature from header
  const signature = req.headers['x-wc-webhook-signature'] as string;
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET || 'tracecore_mycoalchemy_2026';

  // If no signature, log warning but continue (for development)
  if (!signature) {
    console.warn('[WebhookValidator] No X-WC-Webhook-Signature header found');
    return next();
  }

  try {
    // Get the raw body as string
    const rawBody = JSON.stringify(req.body);

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('base64');

    // Compare signatures
    if (signature !== expectedSignature) {
      console.error('[WebhookValidator] Invalid webhook signature');
      console.error(`  Expected: ${expectedSignature}`);
      console.error(`  Received: ${signature}`);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    console.log('[WebhookValidator] Webhook signature validated successfully');
    next();
  } catch (error) {
    console.error('[WebhookValidator] Error validating webhook:', error);
    res.status(400).json({ error: 'Failed to validate webhook' });
  }
}

/**
 * Express middleware to capture raw body for webhook validation
 * Must be used BEFORE express.json()
 */
export function captureRawBody(req: Request, res: Response, next: NextFunction) {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk.toString();
  });

  req.on('end', () => {
    req.body = JSON.parse(rawBody || '{}');
    (req as any).rawBody = rawBody;
    next();
  });
}
