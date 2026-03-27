/**
 * TraceCore AI — Landing Page
 * Marketing homepage for SaaS product
 */

import { ArrowRight, Zap, BarChart3, Lock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { getLoginUrl } from '@/const';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">TraceCore AI</div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary">
              ✨ The AI-Powered Operations Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Manage Your Manufacturing Operations with AI
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            TraceCore AI gives you complete visibility and control over your supply chain, production, and orders. From raw materials to shipped products, track everything in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = '/pricing')}
            >
              View Pricing
            </Button>
          </div>

          {/* Hero Image */}
          <div className="rounded-lg border border-primary/20 overflow-hidden shadow-2xl">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448206084/JqzfJcQaypCLFt4Ngi48YW/tracecore-dashboard-preview-Lb9ohWh7ArCeYJhRMiKmXi.webp"
              alt="TraceCore AI Dashboard Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">
            Everything You Need to Run Your Business
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Real-Time Dashboard',
                description: 'Monitor KPIs, inventory levels, and order status at a glance',
              },
              {
                icon: Zap,
                title: 'AI Operations Assistant',
                description: 'Voice commands and natural language to manage your operations',
              },
              {
                icon: Smartphone,
                title: 'Mobile Friendly',
                description: 'Manage your business from anywhere, on any device',
              },
              {
                icon: Lock,
                title: 'Enterprise Security',
                description: 'Bank-level encryption and compliance with industry standards',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">
            Your Complete Operations Workflow
          </h2>

          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {[
              { step: '1', label: 'Suppliers' },
              { step: '2', label: 'Raw Materials' },
              { step: '3', label: 'Production' },
              { step: '4', label: 'Orders' },
              { step: '5', label: 'Shipping' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-primary">{item.step}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            TraceCore AI tracks every step of your manufacturing process, from sourcing raw materials to delivering finished products to customers.
          </p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Start free, upgrade when you're ready. No credit card required.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Free', price: 'R0', items: ['5 Products', '5 Suppliers', 'Core Dashboard'] },
              { name: 'Pro', price: 'R199', items: ['Unlimited Products', 'WooCommerce', 'Priority Support'], highlight: true },
              { name: 'Pro Plus', price: 'R299', items: ['Everything in Pro', 'AI Assistant', 'Voice Commands'] },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-6 ${
                  tier.highlight
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background'
                }`}
              >
                <h3 className="font-bold text-lg text-foreground mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold text-foreground mb-6">{tier.price}</p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  {tier.items.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={() => (window.location.href = '/pricing')}
            className="gap-2"
          >
            View Full Pricing <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of manufacturers using TraceCore AI to streamline their operations.
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = getLoginUrl())}
            className="gap-2"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-background/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2026 TraceCore AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
