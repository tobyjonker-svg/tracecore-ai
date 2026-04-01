/**
 * TraceCore AI — Production Runs Page (Updated)
 * Design: Soft-Dark Enterprise
 * - Product dropdown selector
 * - Raw materials tracking
 * - Auto-deduction of raw inputs when production completes
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { formatDateTime } from '@/lib/store';
import { Factory, Plus, Package, FileText, Trash2, Minus } from 'lucide-react';
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
  const { user } = useAuth();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [rawMaterials, setRawMaterials] = useState<Array<{ inputId: string; quantityUsed: string; unit: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const { data: productionRuns = [] } = trpc.production.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();

  // Mutations
  const createProductionRun = trpc.production.create.useMutation();
  const deleteProductionRun = trpc.production.delete.useMutation();

  const handleAddRawMaterial = () => {
    setRawMaterials([...rawMaterials, { inputId: '', quantityUsed: '', unit: 'kg' }]);
  };

  const handleRemoveRawMaterial = (index: number) => {
    setRawMaterials(rawMaterials.filter((_, i) => i !== index));
  };

  const handleUpdateRawMaterial = (index: number, field: string, value: string) => {
    const updated = [...rawMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setRawMaterials(updated);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProductionRun.mutateAsync({ id });
      toast.success('Production run deleted');
    } catch (error) {
      toast.error('Failed to delete production run');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error('Please select a product'); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) { toast.error('Enter a valid quantity greater than 0'); return; }

    // Validate raw materials
    for (const material of rawMaterials) {
      if (!material.inputId) { toast.error('Please select all raw materials'); return; }
      if (!material.quantityUsed || parseFloat(material.quantityUsed) <= 0) {
        toast.error('Enter valid quantities for all raw materials');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const product = products.find(p => p.id === parseInt(productId));
      await createProductionRun.mutateAsync({
        runNumber: `RUN-${Date.now()}`,
        productId: parseInt(productId),
        quantity: qty,
        notes: notes.trim(),
        rawMaterials: rawMaterials.map(m => ({
          inputId: parseInt(m.inputId),
          quantityUsed: parseFloat(m.quantityUsed),
          unit: m.unit,
        })),
      });

      setProductId('');
      setQuantity('');
      setNotes('');
      setRawMaterials([]);
      setIsSubmitting(false);
      toast.success(`Production run logged: +${qty} ${product?.name ?? 'units'}. Stock updated automatically.`);
    } catch (error) {
      setIsSubmitting(false);
      toast.error('Failed to create production run');
    }
  };

  const totalUnitsThisWeek = productionRuns
    .filter(r => {
      const d = new Date(r.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    })
    .reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 page-enter">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Production Runs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Log manufacturing output. Product stock updates automatically. Raw materials are deducted from inventory.
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
            <form onSubmit={handleAdd} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Product Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Product *</Label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        <span className="flex items-center gap-2">
                          {p.name}
                          <span className="text-xs text-muted-foreground">({p.currentStock} in stock)</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
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

              {/* Raw Materials */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Raw Materials Used</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddRawMaterial}
                    className="text-xs h-6"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>

                {rawMaterials.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No raw materials added yet</p>
                ) : (
                  <div className="space-y-2">
                    {rawMaterials.map((material, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Select value={material.inputId} onValueChange={(val) => handleUpdateRawMaterial(idx, 'inputId', val)}>
                            <SelectTrigger className="bg-muted/50 border-border h-8 text-xs">
                              <SelectValue placeholder="Select input" />
                            </SelectTrigger>
                            <SelectContent>
                              {inputs.map(inp => (
                                <SelectItem key={inp.id} value={inp.id.toString()}>
                                  {inp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={material.quantityUsed}
                          onChange={(e) => handleUpdateRawMaterial(idx, 'quantityUsed', e.target.value)}
                          className="bg-muted/50 border-border h-8 text-xs w-16"
                          min="0.1"
                          step="0.1"
                        />
                        <Select value={material.unit} onValueChange={(val) => handleUpdateRawMaterial(idx, 'unit', val)}>
                          <SelectTrigger className="bg-muted/50 border-border h-8 text-xs w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="units">units</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRawMaterial(idx)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Batch number, extraction notes, etc."
                  className="bg-muted/50 border-border focus:border-primary/50 resize-none text-xs"
                  rows={2}
                />
              </div>

              {/* Preview */}
              {productId && quantity && parseInt(quantity) > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400">
                    <span className="font-semibold">Stock impact:</span>{' '}
                    {products.find(p => p.id === parseInt(productId))?.name} will increase by{' '}
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
                  {productionRuns.filter(r => {
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
                  {productionRuns.length}
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
          {productionRuns.length === 0 ? (
            <div className="tc-card text-center py-12">
              <Factory className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No production runs yet. Log your first batch!</p>
            </div>
          ) : (
            productionRuns.map((run, i) => {
              const product = products.find(p => p.id === run.productId);
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
                          <h3 className="font-semibold text-foreground text-sm">{product?.name || 'Unknown Product'}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTime(run.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(run.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 text-emerald-400" />
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{run.quantity}</span> units produced
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            run.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                            run.status === 'in_progress' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>
                            {run.status}
                          </span>
                        </div>
                      </div>
                      {run.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{run.notes}</p>
                      )}
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
