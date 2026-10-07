import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, AlertTriangle, PackagePlus } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", description: "", supplierId: 0, costPerUnit: 0, unit: "g" };

export default function Inputs() {
  const utils = trpc.useUtils();
  const { data: inputs = [], isLoading } = trpc.inputs.list.useQuery();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();

  const createM = trpc.inputs.create.useMutation({ onSuccess: () => { utils.inputs.list.invalidate(); setShowForm(false); setForm(emptyForm); toast.success("Raw input added"); }, onError: (e) => toast.error(e.message) });
  const updateM = trpc.inputs.update.useMutation({ onSuccess: () => { utils.inputs.list.invalidate(); setShowForm(false); setEditId(null); toast.success("Raw input updated"); }, onError: (e) => toast.error(e.message) });
  const deleteM = trpc.inputs.delete.useMutation({ onSuccess: () => { utils.inputs.list.invalidate(); toast.success("Deleted"); }, onError: (e) => toast.error(e.message) });
  const addStockM = trpc.production.addInputStock.useMutation({ onSuccess: () => { utils.inputs.list.invalidate(); setStockDialog(null); setStockQty(0); toast.success("Stock updated"); }, onError: (e) => toast.error(e.message) });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [stockDialog, setStockDialog] = useState<any>(null);
  const [stockQty, setStockQty] = useState(0);

  const reset = () => { setForm(emptyForm); setShowForm(false); setEditId(null); };
  const submit = () => {
    if (!form.name || form.costPerUnit <= 0) { toast.error("Name and cost required"); return; }
    const d = { ...form, supplierId: form.supplierId || undefined };
    if (editId) updateM.mutate({ id: editId, ...d });
    else createM.mutate(d);
  };
  const edit = (i: any) => { setForm({ name: i.name, description: i.description || "", supplierId: i.supplierId || 0, costPerUnit: Number(i.costPerUnit), unit: i.unit || "g" }); setEditId(i.id); setShowForm(true); };
  const getSup = (id: number | null) => { if (!id) return "-"; const s = (suppliers as any[]).find((s: any) => s.id === id); return s ? s.name : "?"; };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Raw Inputs</h1>
        <Button onClick={() => { reset(); setShowForm(true); }}><Plus className="w-4 h-4 mr-2" />Add Raw Input</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>{editId ? "Edit" : "Add"} Raw Input</CardTitle>
              <Button variant="ghost" size="icon" onClick={reset}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Material Name *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lion's Mane Powder" />
              </div>
              <div>
                <Label>Supplier</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: Number(e.target.value) })}>
                  <option value={0}>-- Select supplier --</option>
                  {(suppliers as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Cost per Unit (ZAR) *</Label>
                <Input type="number" step="0.01" min="0" value={form.costPerUnit || ""} onChange={e => setForm({ ...form, costPerUnit: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Unit</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="l">Litres (l)</option>
                  <option value="units">Units</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes about this material" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={submit} disabled={!form.name || form.costPerUnit <= 0}>{editId ? "Update" : "Add"}</Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {inputs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No raw inputs yet. Add your first material above.</CardContent></Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Material</th>
                <th className="text-left py-3 px-4">Supplier</th>
                <th className="text-right py-3 px-4">Stock</th>
                <th className="text-right py-3 px-4">Cost/Unit</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(inputs as any[]).map((i: any) => {
                const st = Number(i.currentStock || 0);
                const th = Number(i.lowStockThreshold || 10);
                const low = st <= th;
                return (
                  <tr key={i.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{i.name}</div>
                      {i.description && <div className="text-xs text-muted-foreground">{i.description}</div>}
                    </td>
                    <td className="py-3 px-4">{getSup(i.supplierId)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={low ? "text-red-500 font-semibold" : ""}>{st} {i.unit}</span>
                      {low && <AlertTriangle className="w-3 h-3 inline ml-1 text-red-500" />}
                    </td>
                    <td className="py-3 px-4 text-right">R{Number(i.costPerUnit).toFixed(2)}/{i.unit}</td>
                    <td className="py-3 px-4 text-right flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Add stock" onClick={() => { setStockDialog(i); setStockQty(0); }}>
                        <PackagePlus className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => edit(i)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this input?")) deleteM.mutate({ id: i.id }); }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Stock Dialog */}
      <Dialog open={stockDialog !== null} onOpenChange={() => setStockDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Stock — {stockDialog?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Current stock: <strong>{Number(stockDialog?.currentStock || 0)} {stockDialog?.unit}</strong></p>
            <div>
              <Label>Quantity to Add ({stockDialog?.unit})</Label>
              <Input type="number" min="0" step="0.01" value={stockQty || ""} onChange={e => setStockQty(parseFloat(e.target.value) || 0)} placeholder="e.g. 500" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStockDialog(null)}>Cancel</Button>
              <Button className="flex-1" disabled={stockQty <= 0} onClick={() => addStockM.mutate({ inputId: stockDialog.id, quantity: stockQty })}>Add Stock</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
