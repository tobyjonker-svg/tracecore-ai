/**
 * TraceCore AI — Production Runs Page
 * Design: Soft-Dark Enterprise
 * - Log production runs → auto-increments product stock
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDateTime } from '@/lib/store';
import { Factory, Plus, Package, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ProductionRuns() {
  const { state, dispatch } = useApp();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error('Please select a product'); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) { toast.error('Enter a valid quantity greater than 0'); return; }

    setIsSubmitting(true);
    const product = state.products.find(p => p.id === productId);
    setTimeout(() => {
      dispatch({
        type: 'ADD_PRODUCTION_RUN',
        payload: { productId, quantity: qty, notes: notes.trim() },
      });
      setProductId(''); setQuantity(''); setNotes('');
      setIsSubmitting(false);
      toast.success(
        `Production run logged: +${qty} ${product?.name ?? 'units'}. Stock updated automatically.`
      );
    }, 500);
  };

  const totalUnitsThisWeek = state.productionRuns
    .filter(r => {
      const d = new Date(r.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    })
    .reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="p-6 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Production Runs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Log manufacturing output. Product stock updates automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Run Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="tc-card">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Log Production Run</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Product *</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          {p.name}
                          <span className="text-xs text-muted-foreground">({p.stockOnHand} in stock)</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Produced *</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 20"
                  min="1"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Batch number, extraction notes, etc."
                  className="bg-muted/50 border-border focus:border-primary/50 resize-none"
                  rows={3}
                />
              </div>

              {/* Preview */}
              {productId && quantity && parseInt(quantity) > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400">
                    <span className="font-semibold">Stock impact:</span>{' '}
                    {state.products.find(p => p.id === productId)?.name} will increase by{' '}
                    <span className="font-bold">+{quantity} units</span>
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging...' : 'Log Production Run'}
              </Button>
            </form>
          </div>

          {/* Stats */}
          <div className="tc-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">This Week</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total runs</span>
                <span className="text-lg font-bold text-foreground font-['Plus_Jakarta_Sans']">
                  {state.productionRuns.filter(r => {
                    const d = new Date(r.createdAt);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return d >= weekAgo;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Units produced</span>
                <span className="text-lg font-bold text-foreground font-['Plus_Jakarta_Sans']">
                  {totalUnitsThisWeek}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">All-time runs</span>
                <span className="text-lg font-bold text-foreground font-['Plus_Jakarta_Sans']">
                  {state.productionRuns.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Production Runs List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-wide text-muted-foreground">
            Recent Production Runs
          </h2>
          {state.productionRuns.length === 0 ? (
            <div className="tc-card text-center py-12">
              <Factory className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No production runs yet. Log your first batch!</p>
            </div>
          ) : (
            state.productionRuns.map((run, i) => {
              const product = state.products.find(p => p.id === run.productId);
              return (
                <div
                  key={run.id}
                  className="tc-card-hover card-enter"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                      <Factory className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                            {product?.name ?? 'Unknown Product'}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTime(run.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="tc-badge-success">
                            <Package className="w-3 h-3" />
                            +{run.quantity} units
                          </span>
                        </div>
                      </div>
                      {run.notes && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">{run.notes}</p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Current stock:{' '}
                          <span className="font-mono text-foreground font-medium">
                            {product?.stockOnHand ?? 0} units
                          </span>
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          #{run.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
