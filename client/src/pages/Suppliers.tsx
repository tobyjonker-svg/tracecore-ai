import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, MapPin, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const emptyForm = { name: '', email: '', phone: '', address: '', city: '', country: '', notes: '' };

export default function Suppliers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [supInputsOpen, setSupInputsOpen] = useState<number | null>(null);

  const { data: suppliers = [], isLoading, refetch } = trpc.suppliers.list.useQuery();
  const { data: allInputs = [] } = trpc.inputs.list.useQuery();
  const { data: supplierInputs = [], refetch: refetchSupInputs } = trpc.suppliers.getSupplierInputs.useQuery(
    { supplierId: supInputsOpen! },
    { enabled: supInputsOpen !== null }
  );

  const createMutation = trpc.suppliers.create.useMutation({ onSuccess: () => { refetch(); setIsDialogOpen(false); setForm(emptyForm); toast.success('Supplier added'); }, onError: (e) => toast.error(e.message) });
  const updateMutation = trpc.suppliers.update.useMutation({ onSuccess: () => { refetch(); setIsDialogOpen(false); toast.success('Supplier updated'); }, onError: (e) => toast.error(e.message) });
  const deleteMutation = trpc.suppliers.delete.useMutation({ onSuccess: () => { refetch(); toast.success('Supplier deleted'); }, onError: (e) => toast.error(e.message) });
  const addSupInputMutation = trpc.suppliers.addSupplierInput.useMutation({ onSuccess: () => { refetchSupInputs(); toast.success('Material linked'); }, onError: (e) => toast.error(e.message) });
  const removeSupInputMutation = trpc.suppliers.removeSupplierInput.useMutation({ onSuccess: () => { refetchSupInputs(); toast.success('Material removed'); }, onError: (e) => toast.error(e.message) });

  const openAdd = () => { setEditingSupplier(null); setForm(emptyForm); setIsDialogOpen(true); };
  const openEdit = (s: any) => { setEditingSupplier(s); setForm({ name: s.name||'', email: s.email||'', phone: s.phone||'', address: s.address||'', city: s.city||'', country: s.country||'', notes: s.notes||'' }); setIsDialogOpen(true); };
  const handleSave = () => {
    if (!form.name) { toast.error('Supplier name is required'); return; }
    if (editingSupplier) updateMutation.mutate({ id: editingSupplier.id, ...form });
    else createMutation.mutate(form as any);
  };

  const linkedInputIds = new Set((supplierInputs as any[]).map((si: any) => si.inputId));
  const unlinkedInputs = (allInputs as any[]).filter((i: any) => !linkedInputIds.has(i.id));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Suppliers</h1><p className="text-muted-foreground text-sm mt-1">Manage your suppliers and what they provide</p></div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" />Add Supplier</Button>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : suppliers.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Truck className="w-12 h-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No suppliers yet.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(suppliers as any[]).map((s: any) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setSupInputsOpen(s.id); }} title="Manage materials"><Package className="w-3.5 h-3.5 text-blue-400" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: s.id })}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {s.email && <p className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{s.email}</p>}
                {s.phone && <p className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{s.phone}</p>}
                {s.city && <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{s.city}{s.country ? `, ${s.country}` : ''}</p>}
                {s.notes && <p className="text-muted-foreground text-xs mt-2">{s.notes}</p>}
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => setSupInputsOpen(s.id)}>
                  <Package className="w-3 h-3 mr-1" /> Manage Materials Supplied
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Supplier Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. MushroomCo SA" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            </div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} /></div>
              <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} placeholder="South Africa" /></div>
            </div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>{editingSupplier ? 'Update' : 'Add Supplier'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Materials Supplied Dialog */}
      <Dialog open={supInputsOpen !== null} onOpenChange={() => setSupInputsOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Materials Supplied by {(suppliers as any[]).find((s: any) => s.id === supInputsOpen)?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Currently linked */}
            <div>
              <Label className="text-sm font-semibold">Currently Supplying</Label>
              {(supplierInputs as any[]).length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No materials linked yet.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {(supplierInputs as any[]).map((si: any) => (
                    <div key={si.inputId} className="flex items-center justify-between bg-muted/50 rounded px-3 py-2">
                      <span className="text-sm font-medium">{si.inputName} <span className="text-muted-foreground">({si.unit})</span></span>
                      <Button variant="ghost" size="sm" onClick={() => removeSupInputMutation.mutate({ supplierId: supInputsOpen!, inputId: si.inputId })}>
                        <X className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Add more */}
            {unlinkedInputs.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Link a Raw Input</Label>
                <div className="flex gap-2 mt-2">
                  <select
                    id="newInputSelect"
                    className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    defaultValue=""
                  >
                    <option value="">-- Select material --</option>
                    {unlinkedInputs.map((i: any) => (
                      <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => {
                    const sel = document.getElementById('newInputSelect') as HTMLSelectElement;
                    const inputId = Number(sel.value);
                    if (!inputId) return;
                    addSupInputMutation.mutate({ supplierId: supInputsOpen!, inputId });
                    sel.value = '';
                  }}>Link</Button>
                </div>
              </div>
            )}
            {unlinkedInputs.length === 0 && (supplierInputs as any[]).length > 0 && (
              <p className="text-xs text-muted-foreground">All raw inputs are already linked to this supplier.</p>
            )}
            {allInputs.length === 0 && (
              <p className="text-xs text-muted-foreground">Add raw inputs first before linking them to suppliers.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
