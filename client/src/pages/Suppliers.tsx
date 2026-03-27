/**
 * TraceCore AI — Suppliers Page
 * Design: Soft-Dark Enterprise
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/store';
import { Truck, Plus, Trash2, Mail, Phone, Package, Globe, Zap, HelpCircle } from 'lucide-react';
import OnboardingTour from '@/components/OnboardingTour';
import { SUPPLIERS_TOUR_STEPS, getOnboardingState, markTourComplete } from '@/lib/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Suppliers() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const onboardingState = getOnboardingState();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      dispatch({ type: 'ADD_SUPPLIER', payload: { name: name.trim(), contactInfo: contactInfo.trim(), email: email.trim(), contactDetails: contactDetails.trim(), website: website.trim(), description: description.trim() } });
      setName('');
      setEmail('');
      setContactDetails('');
      setWebsite('');
      setDescription('');
      setContactInfo('');
      setIsSubmitting(false);
      toast.success(`Supplier "${name.trim()}" added successfully`);
    }, 400);
  };

  const handleDelete = (id: string, supplierName: string) => {
    dispatch({ type: 'DELETE_SUPPLIER', payload: id });
    toast.success(`Supplier "${supplierName}" removed`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Suppliers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your raw material suppliers and vendor relationships.
          </p>
        </div>
        {!onboardingState.completedSteps.includes('suppliers') && (
          <button
            onClick={() => setIsTourOpen(true)}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Tour
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Supplier Form */}
        <div className="lg:col-span-1">
          <div className="tc-card sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                Add Supplier
              </h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Supplier Name *
                </Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Pacific Botanicals"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Description
                </Label>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of supplier"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contact@supplier.com"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Contact Details
                </Label>
                <Input
                  value={contactDetails}
                  onChange={e => setContactDetails(e.target.value)}
                  placeholder="Phone, address, etc."
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Website
                </Label>
                <Input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://supplier.com"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Legacy Contact Info
                </Label>
                <Input
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  placeholder="email@supplier.com · +1 (555) 000-0000"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Supplier'}
              </Button>
            </form>

            {/* Stats */}
            <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">
                  {state.suppliers.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Suppliers</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">
                  {state.inputs.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Inputs</p>
              </div>
            </div>

            {/* Upgrade Section */}
            <div className="mt-5 pt-5 border-t border-border">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/30">
                <div className="flex items-start gap-3 mb-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Upgrade for More Suppliers</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Pro plan: unlimited suppliers</p>
                  </div>
                </div>
                <Button
                  onClick={() => (window.location.href = '/pricing')}
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="lg:col-span-2 space-y-3">
          {state.suppliers.length === 0 ? (
            <div className="tc-card text-center py-12">
              <Truck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No suppliers yet. Add your first one!</p>
            </div>
          ) : (
            state.suppliers.map((supplier, i) => {
              const inputCount = state.inputs.filter(inp => inp.supplierId === supplier.id).length;
              return (
                <div
                  key={supplier.id}
                  className="tc-card-hover card-enter"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                          {supplier.name}
                        </h3>
                        {supplier.description && (
                          <p className="text-sm text-muted-foreground mt-1">{supplier.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {supplier.email && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {supplier.email}
                            </span>
                          )}
                          {supplier.contactDetails && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {supplier.contactDetails}
                            </span>
                          )}
                          {supplier.website && (
                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                              <Globe className="w-3 h-3" />
                              Website
                            </a>
                          )}
                        </div>
                        {supplier.contactInfo && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{supplier.contactInfo}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="tc-badge-info">
                            <Package className="w-3 h-3" />
                            {inputCount} input{inputCount !== 1 ? 's' : ''} sourced
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Added {formatDate(supplier.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                      className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inputs sourced from this supplier */}
                  {inputCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Inputs sourced:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {state.inputs
                          .filter(inp => inp.supplierId === supplier.id)
                          .map(inp => (
                            <span
                              key={inp.id}
                              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
                            >
                              {inp.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={SUPPLIERS_TOUR_STEPS}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => markTourComplete('suppliers')}
      />
    </div>
  );
}
