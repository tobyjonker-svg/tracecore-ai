/**
 * TraceCore AI — Landing Page
 * Marketing homepage for SaaS product
 */

import { ArrowRight, Zap, BarChart3, Lock, Smartphone, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { getLoginUrl } from '@/const';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Landing() {
  const [isLoading, setIsLoading] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInName, setSignInName] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const carouselImages = [
    {
      src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448206084/JqzfJcQaypCLFt4Ngi48YW/t1_95145f99.png',
      alt: 'Dashboard Home - Real-time Operations Overview',
      title: 'Operations Dashboard'
    },
    {
      src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448206084/JqzfJcQaypCLFt4Ngi48YW/t2_8f455ff6.png',
      alt: 'Products Management - Inventory & Stock Control',
      title: 'Product Management'
    },
    {
      src: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663448206084/JqzfJcQaypCLFt4Ngi48YW/t3_ca90b9d9.png',
      alt: 'Reports & Analytics - Business Intelligence',
      title: 'Analytics & Reports'
    }
  ];

  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const url = await getLoginUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get login URL:', error);
      setIsLoading(false);
    }
  };

  const handleLocalSignIn = async () => {
    if (!signInEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSigningIn(true);
    try {
      const response = await fetch('/api/auth/local-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInEmail,
          name: signInName || signInEmail.split('@')[0],
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign in failed');
      }

      const data = await response.json();
      toast.success('Signed in successfully!');
      // Add a small delay to ensure session cookie is set before redirecting
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/';
      }, 500);
    } catch (error) {
      console.error('Sign in failed:', error);
      console.error('Full error:', error);
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
      setIsSigningIn(false);
    }
  };

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
            <Dialog open={isSignInDialogOpen} onOpenChange={setIsSignInDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign In to TraceCore AI</DialogTitle>
                  <DialogDescription>
                    Enter your email to access your account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      disabled={isSigningIn}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name (Optional)</label>
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={signInName}
                      onChange={(e) => setSignInName(e.target.value)}
                      disabled={isSigningIn}
                    />
                  </div>
                  <Button
                    onClick={handleLocalSignIn}
                    disabled={isSigningIn}
                    className="w-full"
                  >
                    {isSigningIn ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              size="sm"
              onClick={() => (window.location.href = '/settings')}
            >
              Get Started Free
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
            Manage Your Business Operations with AI
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're selling one product or a thousand, TraceCore AI gives you complete visibility and control over your entire business. From sourcing to delivery, track everything in real-time—no matter your business size or model.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => (window.location.href = '/settings')}
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

          {/* Hero Image Carousel */}
          <div className="relative">
            <div className="rounded-lg border border-primary/20 overflow-hidden shadow-2xl bg-muted/30">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={carouselImages[carouselIndex].src}
                  alt={carouselImages[carouselIndex].alt}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>
              
              {/* Carousel Controls */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button
                  onClick={prevSlide}
                  className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="pointer-events-auto p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === carouselIndex ? 'bg-primary w-8' : 'bg-muted-foreground/50 hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide Titles */}
            <div className="text-center mt-4">
              <p className="text-sm font-medium text-muted-foreground">
                {carouselIndex + 1} / {carouselImages.length}
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {carouselImages[carouselIndex].title}
              </p>
            </div>
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
                <div key={idx} className="bg-background rounded-lg p-6 border border-border">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
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

          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            TraceCore AI adapts to your unique business workflow. Whether you're a retailer, wholesaler, manufacturer, or service provider, define your own workflow stages and track every step of your operations.
          </p>

          <div className="mt-12 max-w-4xl mx-auto">
            <WorkflowBuilder defaultTemplate="Manufacturing" />
          </div>
        </div>
      </section>

      {/* Why Choose TraceCore Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-12">
            Why Choose TraceCore AI
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Works for Any Business',
                description: 'From one-person shops to large enterprises, TraceCore adapts to your business model and size.',
              },
              {
                title: 'Fully Customizable',
                description: 'Define your own workflow stages, customize colors and icons, and organize operations your way.',
              },
              {
                title: 'AI-Powered Insights',
                description: 'Get intelligent recommendations, automate repetitive tasks, and make data-driven decisions.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-4">
            Simple Pricing
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Start free, upgrade when you're ready. No credit card required.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: 'Free',
                price: 'R0',
                features: ['5 Products', '5 Suppliers', 'Core Dashboard'],
              },
              {
                name: 'Pro',
                price: 'R199',
                features: ['Unlimited Products', 'WooCommerce', 'Priority Support'],
                highlight: true,
              },
              {
                name: 'Pro Plus',
                price: 'R299',
                features: ['Everything in Pro', 'AI Assistant', 'Voice Commands'],
              },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-6 border ${
                  tier.highlight ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-primary mb-6">{tier.price}</div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlight ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => (window.location.href = '/pricing')}
                >
                  {tier.name === 'Free' ? 'Get Started' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of manufacturers using TraceCore AI to streamline their operations.
          </p>
          <Button
            size="lg"
            onClick={handleLogin}
            disabled={isLoading}
            className="gap-2"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
