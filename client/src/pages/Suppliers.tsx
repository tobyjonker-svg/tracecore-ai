/**
 * TraceCore AI — Suppliers Page
 * Design: Soft-Dark Enterprise
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Truck, Plus, Edit2, Trash2, Mail, Phone, Package, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Suppliers() {
  const { isAuthenticated, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    notes: '',
  });

  // Queries
  const { data: suppliers = [], isLoading, refetch } = trpc.suppliers.list.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  // Mutations
  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      refetch();
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setCountry('');
      setNotes('');
      setIsSubmitting(false);
      toast.success('Supplier created successfully');
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error(error.message || 'Failed to create supplier');
    },
  });

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update supplier');
    },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete supplier');
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleEditClick = (supplier: any) => {
    setEditingSupplier(supplier);
    setEditFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      notes: supplier.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (!editFormData.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }
    updateMutation.mutate({
      id: Number(editingSupplier.id),
      name: editFormData.name.trim(),
      email: editFormData.email.trim() || undefined,
      phone: editFormData.phone.trim() || undefined,
      address: editFormData.address.trim() || undefined,
      city: editFormData.city.trim() || undefined,
      country: editFormData.country.trim() || undefined,
      notes: editFormData.notes.trim() || undefined,
    });
  };

  const handleDelete = (id: number, supplierName: string) => {
    if (window.confirm(`Delete supplier "${supplierName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (!isAuthenticated && !loading) {
    return <div className="p-6">Please log in to view suppliers</div>;
  }

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
                  Phone
                </Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Address
                </Label>
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  City
                </Label>
                <Input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Country
                </Label>
                <Input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="Country"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Notes
                </Label>
                <Input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional notes"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting || createMutation.isPending}
              >
                {isSubmitting || createMutation.isPending ? 'Adding...' : 'Add Supplier'}
              </Button>
            </form>

            {/* Stats */}
            <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">
                  {suppliers.length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Suppliers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="tc-card p-8 text-center">
              <p className="text-muted-foreground">Loading suppliers...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="tc-card p-8 text-center">
              <Truck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No suppliers yet. Add one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="tc-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                          {supplier.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          {supplier.email && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {supplier.email}
                            </span>
                          )}
                          {supplier.phone && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {supplier.phone}
                            </span>
                          )}
                        </div>
                        {supplier.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{supplier.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(supplier)}
                        className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-colors shrink-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, supplier.name)}
                        className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Supplier Name *</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Supplier name"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Email"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</Label>
              <Input
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="Phone"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Address</Label>
              <Input
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Address"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">City</Label>
              <Input
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                placeholder="City"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Country</Label>
              <Input
                value={editFormData.country}
                onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                placeholder="Country"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notes</Label>
              <Input
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Notes"
                className="bg-muted/50 border-border focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleEditSave}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
