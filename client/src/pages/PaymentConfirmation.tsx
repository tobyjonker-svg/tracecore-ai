/**
 * TraceCore AI — Payment Confirmation Page
 * Direct EFT Payment with Banking Details
 */

import { useState } from 'react';
import { Copy, Check, Mail, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { TIER_CONFIG } from '@shared/tiers';
import { trpc } from '@/lib/trpc';

interface PaymentConfirmationProps {
  tier: 'pro' | 'pro_plus';
  email?: string;
}

const BANK_DETAILS = {
  accountHolder: 'T Jonker',
  accountNumber: '63198166035',
  bankName: 'First National Bank',
  accountType: 'Savings Account',
  branchCode: '250155', // FNB branch code
  reference: 'TRACECORE-',
};

export default function PaymentConfirmation({ tier, email: initialEmail }: PaymentConfirmationProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

  const tierConfig = TIER_CONFIG[tier];
  const reference = `${BANK_DETAILS.reference}${Date.now()}`;

  const sendEmailMutation = trpc.payment.sendPaymentEmail.useMutation();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendEmailMutation.mutateAsync({
        email,
        tier,
        reference,
      });
      
      toast.success('Banking details sent to your email');
      setPaymentSent(true);
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pricing">
            <Button variant="outline" size="sm" className="gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">Payment Details</h1>
          <p className="text-lg text-muted-foreground">
            Transfer funds via Direct EFT to activate your {tierConfig.name} plan
          </p>
        </div>

        {/* Plan Summary */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{tierConfig.name}</h2>
              <p className="text-muted-foreground">Monthly subscription</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">R{tierConfig.monthlyPrice}</div>
              <p className="text-sm text-muted-foreground">/month</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3">What's Included:</h3>
            <ul className="space-y-2">
              {Object.entries(tierConfig.features).filter(([_, enabled]) => enabled).map(([feature, _], idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">✓</span>
                  <span>{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Banking Details */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Bank Transfer Details
          </h3>

          <div className="space-y-4">
            {/* Account Holder */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Account Holder
              </label>
              <div className="flex gap-2">
                <Input
                  value={BANK_DETAILS.accountHolder}
                  readOnly
                  className="bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(BANK_DETAILS.accountHolder, 'Account Holder')}
                  className="shrink-0"
                >
                  {copied === 'Account Holder' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Bank
              </label>
              <div className="flex gap-2">
                <Input
                  value={BANK_DETAILS.bankName}
                  readOnly
                  className="bg-muted/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(BANK_DETAILS.bankName, 'Bank Name')}
                  className="shrink-0"
                >
                  {copied === 'Bank Name' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Account Number
              </label>
              <div className="flex gap-2">
                <Input
                  value={BANK_DETAILS.accountNumber}
                  readOnly
                  className="bg-muted/50 font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(BANK_DETAILS.accountNumber, 'Account Number')}
                  className="shrink-0"
                >
                  {copied === 'Account Number' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Account Type */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Account Type
              </label>
              <Input
                value={BANK_DETAILS.accountType}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Branch Code */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Branch Code
              </label>
              <div className="flex gap-2">
                <Input
                  value={BANK_DETAILS.branchCode}
                  readOnly
                  className="bg-muted/50 font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(BANK_DETAILS.branchCode, 'Branch Code')}
                  className="shrink-0"
                >
                  {copied === 'Branch Code' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Reference (Use this in your transfer)
              </label>
              <div className="flex gap-2">
                <Input
                  value={reference}
                  readOnly
                  className="bg-primary/10 border-primary/30 font-mono font-bold"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(reference, 'Reference')}
                  className="shrink-0"
                >
                  {copied === 'Reference' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Amount to Transfer
              </label>
              <Input
                value={`R${tierConfig.monthlyPrice}`}
                readOnly
                className="bg-muted/50 text-lg font-bold"
              />
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground">
              <strong>Important:</strong> Please use the reference number above when making your transfer. This helps us match your payment to your account.
            </p>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Send Details to Email
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Enter your email address to receive the banking details. You can also copy the details above to make your transfer immediately.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Your Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={paymentSent}
              />
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={isSubmitting || paymentSent}
              className="w-full gap-2"
              size="lg"
            >
              {paymentSent ? (
                <>
                  <Check className="w-4 h-4" />
                  Details Sent to Email!
                </>
              ) : isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Banking Details to Email
                </>
              )}
            </Button>

            {paymentSent && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-600">
                  ✓ Banking details have been sent to <strong>{email}</strong>. Check your inbox for the payment information.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Next Steps</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Copy the banking details above or check your email</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Transfer R{tierConfig.monthlyPrice} to the account using the reference number provided</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Your account will be upgraded within 24 hours of payment confirmation</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>You'll receive an email confirmation once your upgrade is complete</span>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Paystack integration coming soon! You'll be able to pay with card directly from your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
