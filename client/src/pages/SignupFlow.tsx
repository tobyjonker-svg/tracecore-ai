/**
 * SignupFlow — Multi-Step Signup with Workflow Template Picker
 * Step 1: Select and customize workflow template
 * Step 2: Business details (currency, region, language)
 * Step 3: Account creation (email, password)
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import { toast } from 'sonner';

interface WorkflowStage {
  name: string;
  icon: string;
  color: string;
}

interface SignupData {
  step: 1 | 2 | 3;
  workflow: {
    template: string;
    stages: WorkflowStage[];
  };
  businessDetails: {
    businessName: string;
    currency: string;
    region: string;
    language: string;
  };
  account: {
    email: string;
    password: string;
    confirmPassword: string;
  };
}

const CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand (R)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'NGN', name: 'Nigerian Naira (₦)' },
  { code: 'KES', name: 'Kenyan Shilling (Ksh)' },
];

const REGIONS = [
  { code: 'ZA', name: 'South Africa' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'EU', name: 'Europe' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'OTHER', name: 'Other' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
];

export default function SignupFlow() {
  const [, navigate] = useLocation();
  const [signupData, setSignupData] = useState<SignupData>({
    step: 1,
    workflow: {
      template: '',
      stages: [],
    },
    businessDetails: {
      businessName: '',
      currency: 'ZAR',
      region: 'ZA',
      language: 'en',
    },
    account: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleWorkflowSelect = (template: string, stages: WorkflowStage[]) => {
    setSignupData({
      ...signupData,
      workflow: { template, stages },
    });
  };

  const handleBusinessDetailsChange = (field: string, value: string) => {
    setSignupData({
      ...signupData,
      businessDetails: {
        ...signupData.businessDetails,
        [field]: value,
      },
    });
  };

  const handleAccountChange = (field: string, value: string) => {
    setSignupData({
      ...signupData,
      account: {
        ...signupData.account,
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    // Validate current step
    if (signupData.step === 1) {
      if (!signupData.workflow.template || signupData.workflow.stages.length === 0) {
        toast.error('Please select a workflow template');
        return;
      }
    } else if (signupData.step === 2) {
      if (!signupData.businessDetails.businessName.trim()) {
        toast.error('Please enter your business name');
        return;
      }
    } else if (signupData.step === 3) {
      if (!signupData.account.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (signupData.account.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (signupData.account.password !== signupData.account.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      // Here you would call the signup API
      toast.success('Account created successfully!');
      navigate('/app');
      return;
    }

    // Move to next step
    if (signupData.step < 3) {
      setSignupData({
        ...signupData,
        step: (signupData.step + 1) as 1 | 2 | 3,
      });
    }
  };

  const handleBack = () => {
    if (signupData.step > 1) {
      setSignupData({
        ...signupData,
        step: (signupData.step - 1) as 1 | 2 | 3,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              {signupData.step === 1 && 'Choose Your Workflow'}
              {signupData.step === 2 && 'Business Details'}
              {signupData.step === 3 && 'Create Account'}
            </h1>
            <span className="text-sm text-muted-foreground">
              Step {signupData.step} of 3
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step < signupData.step
                      ? 'bg-emerald-500 text-white'
                      : step === signupData.step
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < signupData.step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-colors ${
                      step < signupData.step ? 'bg-emerald-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step 1: Workflow Selection */}
        {signupData.step === 1 && (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Select a workflow template that matches your business, then customize it to fit your needs.
            </p>
            <div className="space-y-4">
              {/* Template Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Manufacturing', desc: 'For manufacturers and production businesses' },
                  { name: 'Retail', desc: 'For retailers and resellers' },
                  { name: 'Service Business', desc: 'For service providers and consultants' },
                  { name: 'Wholesale', desc: 'For wholesale and distribution' },
                  { name: 'E-Commerce', desc: 'For online stores and digital sellers' },
                  { name: 'SaaS/Tech', desc: 'For software and tech companies' },
                  { name: 'Real Estate', desc: 'For real estate agents and brokers' },
                  { name: 'Food & Beverage', desc: 'For restaurants, cafes, and food businesses' },
                  { name: 'Logistics', desc: 'For shipping, logistics, and courier services' },
                ].map((template) => (
                  <button
                    key={template.name}
                    onClick={() => {
                      handleWorkflowSelect(template.name, []);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      signupData.workflow.template === template.name
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.desc}</p>
                  </button>
                ))}
              </div>

              {/* Workflow Customizer */}
              {signupData.workflow.template && (
                <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-4">Customize Your Workflow</h3>
                  <WorkflowBuilder
                    defaultTemplate={signupData.workflow.template}
                    onWorkflowChange={(stages) => {
                      handleWorkflowSelect(signupData.workflow.template, stages);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {signupData.step === 2 && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  value={signupData.businessDetails.businessName}
                  onChange={(e) => handleBusinessDetailsChange('businessName', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={signupData.businessDetails.currency}
                  onValueChange={(value) => handleBusinessDetailsChange('currency', value)}
                >
                  <SelectTrigger id="currency" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region">Region / Country *</Label>
                <Select
                  value={signupData.businessDetails.region}
                  onValueChange={(value) => handleBusinessDetailsChange('region', value)}
                >
                  <SelectTrigger id="region" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((reg) => (
                      <SelectItem key={reg.code} value={reg.code}>
                        {reg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language *</Label>
                <Select
                  value={signupData.businessDetails.language}
                  onValueChange={(value) => handleBusinessDetailsChange('language', value)}
                >
                  <SelectTrigger id="language" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-foreground">Your Setup</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Workflow:</span> {signupData.workflow.template}
                </p>
                <p>
                  <span className="font-medium text-foreground">Currency:</span>{' '}
                  {CURRENCIES.find((c) => c.code === signupData.businessDetails.currency)?.name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Region:</span>{' '}
                  {REGIONS.find((r) => r.code === signupData.businessDetails.region)?.name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Language:</span>{' '}
                  {LANGUAGES.find((l) => l.code === signupData.businessDetails.language)?.name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Account Creation */}
        {signupData.step === 3 && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupData.account.email}
                  onChange={(e) => handleAccountChange('email', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={signupData.account.password}
                  onChange={(e) => handleAccountChange('password', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={signupData.account.confirmPassword}
                  onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Review Your Setup</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <span className="font-medium text-foreground">Business:</span> {signupData.businessDetails.businessName}
                </p>
                <p>
                  <span className="font-medium text-foreground">Workflow:</span> {signupData.workflow.template} ({signupData.workflow.stages.length} stages)
                </p>
                <p>
                  <span className="font-medium text-foreground">Currency:</span>{' '}
                  {CURRENCIES.find((c) => c.code === signupData.businessDetails.currency)?.code}
                </p>
                <p>
                  <span className="font-medium text-foreground">Email:</span> {signupData.account.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-12 max-w-2xl">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={signupData.step === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {signupData.step === 3 ? 'Create Account' : 'Next'}
            {signupData.step < 3 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
