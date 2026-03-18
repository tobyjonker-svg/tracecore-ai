/**
 * TraceCore AI — Products Page
 * Design: Soft-Dark Enterprise
 * - Product cards with stock bars and LOW STOCK badges
 * - Inline stock and threshold editing
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/store';
import { Package, Plus, Trash2, Pencil, Check, X, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Products() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stockOnHand, setStockOnHand] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Product name is required'); return; }
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        name: name.trim(),
        description: description.trim(),
        stockOnHand: parseInt(stockOnHand) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 10,
      },
    });
    setName(''); setDescription(''); setStockOnHand('0'); setLowStockThreshold('10');
    toast.success(`Product "${name.trim()}" added`);
  };

  const handleSaveEdit = (id: string, productName: string) => {
    dispatch({
      type: 'UPDATE_PRODUCT',
      payload: {
        id,
        stockOnHand: parseInt(editStock) || 0,
        lowStockThreshold: parseInt(editThreshold) || 10,
      },
    });
    setEditingId(null);
    toast.success(`${productName} updated`);
  };

  const lowStockCount = state.products.filter(p => p.stockOnHand <= p.lowStockThreshold).length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Products</h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
            Finished goods ready for sale. Manage stock levels and thresholds.
          </p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs md:text-sm">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-red-400 font-medium">
              {lowStockCount} product{lowStockCount > 1 ? 's' : ''} low on stock
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Add Product Form */}
        <div className="lg:col-span-1">
          <div className="tc-card sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Add Product</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Product Name *</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Lion's Mane Tincture 100ml"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief product description..."
                  className="bg-muted/50 border-border focus:border-primary/50 resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Initial Stock</Label>
                  <Input
                    type="number"
                    value={stockOnHand}
                    onChange={e => setStockOnHand(e.target.value)}
                    min="0"
                    className="bg-muted/50 border-border focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Low Stock Alert</Label>
                  <Input
                    type="number"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(e.target.value)}
                    min="0"
                    className="bg-muted/50 border-border focus:border-primary/50"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Add Product
              </Button>
            </form>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-2">
          {state.products.length === 0 ? (
            <div className="tc-card text-center py-12">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {state.products.map((product, i) => {
                const isLow = product.stockOnHand <= product.lowStockThreshold;
                const pct = Math.min(100, (product.stockOnHand / Math.max(product.lowStockThreshold * 3, 1)) * 100);
                const isEditing = editingId === product.id;

                return (
                  <div
                    key={product.id}
                    className={cn(
                      'tc-card relative card-enter',
                      isLow && 'border-red-500/25'
                    )}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Low stock accent */}
                    {isLow && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-t-xl" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                          isLow ? 'bg-red-500/15' : 'bg-primary/15'
                        )}>
                          <Package className={cn('w-4.5 h-4.5', isLow ? 'text-red-400' : 'text-primary')} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm font-['Plus_Jakarta_Sans'] leading-snug">
                            {product.name}
                          </h3>
                          {isLow && (
                            <span className="tc-badge-low-stock mt-1 inline-flex">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setEditStock(String(product.stockOnHand));
                            setEditThreshold(String(product.lowStockThreshold));
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { dispatch({ type: 'DELETE_PRODUCT', payload: product.id }); toast.success('Product removed'); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Stock display / edit */}
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Stock</Label>
                            <Input
                              type="number"
                              value={editStock}
                              onChange={e => setEditStock(e.target.value)}
                              className="h-7 text-xs bg-muted/50 mt-1"
                              autoFocus
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Alert at</Label>
                            <Input
                              type="number"
                              value={editThreshold}
                              onChange={e => setEditThreshold(e.target.value)}
                              className="h-7 text-xs bg-muted/50 mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90"
                            onClick={() => handleSaveEdit(product.id, product.name)}
                          >
                            <Check className="w-3 h-3 mr-1" /> Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock on hand</span>
                          <span className="text-sm font-bold font-mono text-foreground">
                            {product.stockOnHand} units
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isLow ? 'bg-red-400' : pct > 60 ? 'bg-emerald-400' : 'bg-amber-400'
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Alert at {product.lowStockThreshold}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(product.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
