/**
 * TraceCore AI — Pricing & Subscription Page
 * Direct EFT payment setup for tier upgrades
 */

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { TIER_CONFIG } from '@shared/tiers';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'pro_plus' | null>('free');
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();

  const handleUpgrade = async (tier: 'pro' | 'pro_plus') => {
    setIsProcessing(true);
    try {
      // Redirect to payment confirmation page
      navigate(`/payment?tier=${tier}`);
    } catch (error) {
      toast.error('Failed to process payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your manufacturing business
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Tier */}
          <Card className="relative overflow-hidden border border-border">
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {TIER_CONFIG.free.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">R0</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {[
                  '5 Products',
                  '5 Suppliers',
                  '5 Raw Materials',
                  'Core Dashboard',
                  'Basic Reports',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </div>
          </Card>

          {/* Pro Tier */}
          <Card className="relative overflow-hidden border-2 border-primary">
            <div className="absolute top-0 left-0 right-0 bg-primary/10 px-4 py-2 text-center">
              <span className="text-xs font-bold text-primary">MOST POPULAR</span>
            </div>
            <div className="p-6 pt-12">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {TIER_CONFIG.pro.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">R{TIER_CONFIG.pro.monthlyPrice}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {[
                  'Unlimited Products',
                  'Unlimited Suppliers',
                  'Unlimited Raw Materials',
                  'Advanced Dashboard',
                  'WooCommerce Integration',
                  'Priority Email Support',
                  'Advanced Reports',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade('pro')}
                disabled={isProcessing}
                className="w-full gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </Button>
            </div>
          </Card>

          {/* Pro Plus Tier */}
          <Card className="relative overflow-hidden border border-border">
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {TIER_CONFIG.pro_plus.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">R{TIER_CONFIG.pro_plus.monthlyPrice}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {[
                  'Everything in Pro',
                  'AI Operations Assistant',
                  'Voice Commands',
                  'QuickBooks Integration',
                  'Xero Integration',
                  'WordPress Integration',
                  'Priority Phone Support',
                  'Custom Integrations',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade('pro_plus')}
                disabled={isProcessing}
                className="w-full gap-2"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro Plus
              </Button>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes! You can change your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Do you offer discounts for annual billing?',
                a: 'Contact us for custom pricing on annual plans. We offer discounts for committed customers.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept Direct EFT (bank transfers) for all plans. Paystack card payments coming soon!',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Start with our Free plan and upgrade whenever you\'re ready. No credit card required.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">{item.q}</h4>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
