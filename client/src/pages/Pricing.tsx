/**
 * TraceCore AI — Pricing & Subscription Page
 * One-time payment setup for tier upgrades
 */

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { TIER_CONFIG } from '@shared/tiers';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'pro_plus' | null>('free');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (tier: 'pro' | 'pro_plus') => {

    setIsProcessing(true);
    try {
      // TODO: Call trpc.billing.initializePayment
      // For now, show a placeholder
      toast.success(`Redirecting to payment for ${TIER_CONFIG[tier].name}...`);
      
      // Simulate redirect to Paystack
      setTimeout(() => {
        toast.info('Payment integration coming soon');
        setIsProcessing(false);
      }, 1000);
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

              <Button
                variant="outline"
                className="w-full mb-6"
                onClick={() => setSelectedTier('free')}
              >
                Get Started
              </Button>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    5 Products
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    5 Suppliers
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    5 Clients
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Core Dashboard
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    No AI Assistant
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    No Voice Commands
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pro Tier */}
          <Card className="relative overflow-hidden border-2 border-primary">
            <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              POPULAR
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {TIER_CONFIG.pro.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">R199</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <Button
                className="w-full mb-6"
                onClick={() => handleUpgrade('pro')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Upgrade Now'}
              </Button>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Unlimited Products
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Unlimited Suppliers
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Unlimited Clients
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    WooCommerce Integration
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Multiple Payment Methods
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    No AI Assistant
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pro Plus Tier */}
          <Card className="relative overflow-hidden border border-border">
            <div className="absolute top-0 right-0 bg-violet-500 px-3 py-1 text-xs font-bold text-white">
              PREMIUM
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {TIER_CONFIG.pro_plus.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">R299</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <Button
                className="w-full mb-6 bg-violet-600 hover:bg-violet-700"
                onClick={() => handleUpgrade('pro_plus')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Upgrade Now'}
              </Button>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Everything in Pro
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    <span className="font-semibold">AI Operations Assistant</span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Voice Commands
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    QuickBooks Integration
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Xero Integration
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    Priority Support
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can change your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-sm text-muted-foreground">
                We accept credit cards, debit cards, and EFT transfers via Paystack.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Is there a free trial?
              </h3>
              <p className="text-sm text-muted-foreground">
                Yes! Start with our Free plan and upgrade whenever you're ready.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-sm text-muted-foreground">
                We offer a 7-day money-back guarantee on all paid plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
