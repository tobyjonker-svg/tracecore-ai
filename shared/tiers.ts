/**
 * TraceCore AI — Subscription Tier Configuration
 * Defines pricing, limits, and features for each tier
 */

export type SubscriptionTier = 'free' | 'pro' | 'pro_plus';

export interface TierConfig {
  name: string;
  monthlyPrice: number; // in ZAR
  limits: {
    products: number;
    suppliers: number;
    inputs: number;
    clients: number;
    productionRuns: number;
  };
  features: {
    voiceCommands: boolean;
    aiAssistant: boolean;
    woocommerceIntegration: boolean;
    quickbooksIntegration: boolean;
    xeroIntegration: boolean;
    wordpressIntegration: boolean;
    multiplePaymentMethods: boolean;
  };
}

export const TIER_CONFIG: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    limits: {
      products: 5,
      suppliers: 5,
      inputs: 5,
      clients: 5,
      productionRuns: 5,
    },
    features: {
      voiceCommands: false,
      aiAssistant: false,
      woocommerceIntegration: false,
      quickbooksIntegration: false,
      xeroIntegration: false,
      wordpressIntegration: false,
      multiplePaymentMethods: false,
    },
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 199, // ZAR
    limits: {
      products: 999999,
      suppliers: 999999,
      inputs: 999999,
      clients: 999999,
      productionRuns: 999999,
    },
    features: {
      voiceCommands: false,
      aiAssistant: false,
      woocommerceIntegration: true,
      quickbooksIntegration: false,
      xeroIntegration: false,
      wordpressIntegration: false,
      multiplePaymentMethods: true,
    },
  },
  pro_plus: {
    name: 'Pro Plus',
    monthlyPrice: 299, // ZAR
    limits: {
      products: 999999,
      suppliers: 999999,
      inputs: 999999,
      clients: 999999,
      productionRuns: 999999,
    },
    features: {
      voiceCommands: true,
      aiAssistant: true,
      woocommerceIntegration: true,
      quickbooksIntegration: true,
      xeroIntegration: true,
      wordpressIntegration: true,
      multiplePaymentMethods: true,
    },
  },
};

export function hasFeature(tier: SubscriptionTier, feature: keyof TierConfig['features']): boolean {
  return TIER_CONFIG[tier].features[feature];
}

export function getLimit(tier: SubscriptionTier, resource: keyof TierConfig['limits']): number {
  return TIER_CONFIG[tier].limits[resource];
}

export function canAddMore(tier: SubscriptionTier, resource: keyof TierConfig['limits'], currentCount: number): boolean {
  const limit = getLimit(tier, resource);
  return currentCount < limit;
}
