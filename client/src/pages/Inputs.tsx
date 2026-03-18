/**
 * TraceCore AI — Inputs (Raw Materials) Page
 * Design: Soft-Dark Enterprise
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/store';
import { FlaskConical, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
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
import { toast } from 'sonner';

const UNITS = ['g', 'kg', 'L', 'mL', 'units', 'sheets', 'boxes', 'bottles', 'bags'];

export default function Inputs() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('units');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Input name is required'); return; }
    if (!supplierId) { toast.error('Please select a supplier'); return; }
    const stockNum = parseFloat(stock);
    if (isNaN(stockNum) || stockNum < 0) { toast.error('Enter a valid stock quantity'); return; }

    dispatch({
      type: 'ADD_INPUT',
      payload: {
        name: name.trim(),
        supplierId,
        stockOnHand: stockNum,
        unit,
      },
    });
    setName(''); setSupplierId(''); setStock(''); setUnit('units');
    toast.success(`Input "${name.trim()}" added`);
  };

  const handleUpdateStock = (id: string, inputName: string) => {
    const newStock = parseFloat(editStock);
    if (isNaN(newStock) || newStock < 0) { toast.error('Enter a valid stock value'); return; }
    dispatch({ type: 'UPDATE_INPUT_STOCK', payload: { id, stock: newStock } });
    setEditingId(null);
    toast.success(`Stock updated for ${inputName}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 page-enter">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Raw Inputs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Track raw materials used in your manufacturing process.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Input Form */}
        <div className="lg:col-span-1">
          <div className="tc-card sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Add Input</h2>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Input Name *</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Lion's Mane Powder"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</Label>
                  <Input
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="bg-muted/50 border-border focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Add Input
              </Button>
            </form>

            {/* Summary */}
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total inputs</span>
                  <span className="font-medium text-foreground">{state.inputs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Suppliers</span>
                  <span className="font-medium text-foreground">
                    {new Set(state.inputs.map(i => i.supplierId)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs Table */}
        <div className="lg:col-span-2">
          <div className="tc-card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                All Inputs ({state.inputs.length})
              </h2>
            </div>
            {state.inputs.length === 0 ? (
              <div className="text-center py-12">
                <FlaskConical className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No inputs yet. Add your first raw material!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wide bg-muted/30">
                  <div className="col-span-4">Input Name</div>
                  <div className="col-span-3">Supplier</div>
                  <div className="col-span-3">Stock</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {state.inputs.map((input, i) => {
                  const supplier = state.suppliers.find(s => s.id === input.supplierId);
                  const isEditing = editingId === input.id;
                  return (
                    <div
                      key={input.id}
                      className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors card-enter"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0">
                          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">{input.name}</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-sm text-muted-foreground truncate">
                          {supplier?.name ?? 'Unknown'}
                        </span>
                      </div>
                      <div className="col-span-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editStock}
                              onChange={e => setEditStock(e.target.value)}
                              className="h-7 text-xs bg-muted/50 w-20"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateStock(input.id, input.name)}
                              className="p-1 rounded hover:bg-emerald-500/10 text-emerald-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded hover:bg-red-500/10 text-red-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm font-mono text-foreground">
                            {input.stockOnHand.toLocaleString()} {input.unit}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingId(input.id); setEditStock(String(input.stockOnHand)); }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { dispatch({ type: 'DELETE_INPUT', payload: input.id }); toast.success('Input removed'); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
