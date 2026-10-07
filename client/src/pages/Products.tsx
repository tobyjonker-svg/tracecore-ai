import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, Package, AlertCircle, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductForm {
  name: string;
  description: string;
  sku: string;
  costPerUnit: string;
  sellingPrice: string;
  currentStock: string;
  lowStockThreshold: string;
  unit: string;
}

const INITIAL_FORM: ProductForm = {
  name: '',
  description: '',
  sku: '',
  costPerUnit: '',
  sellingPrice: '',
  currentStock: '0',
  lowStockThreshold: '10',
  unit: 'units',
};


function ProductCostPanel({ productId, onCostCalculated }: { productId: number; onCostCalculated: (cost: number | null) => void }) {
  const { data, isLoading } = trpc.production.getProductCostData.useQuery(
    { productId },
    { enabled: !!productId }
  );

  if (isLoading) return <div className="p-3 bg-muted/30 rounded-lg border text-xs text-muted-foreground">Loading materials...</div>;
  if (!data || !data.materials || (data.materials as any[]).length === 0) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border">
        <p className="text-sm font-semibold mb-1 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue-400" />Materials Used</p>
        <p className="text-xs text-muted-foreground">No completed production runs yet.</p>
      </div>
    );
  }

  // Auto-fill cost
  if (data.costPerUnit) onCostCalculated(data.costPerUnit);

  return (
    <div className="p-3 bg-muted/30 rounded-lg border space-y-2">
      <p className="text-sm font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue-400" />Materials Used (from last production run)</p>
      <div className="space-y-1">
        {(data.materials as any[]).map((m: any) => (
          <div key={m.id} className="text-xs bg-muted/50 rounded px-2 py-1 flex justify-between">
            <span>{m.inputName}</span>
            <span className="text-muted-foreground">{m.quantityUsed} {m.unit}</span>
          </div>
        ))}
      </div>
      {data.costPerUnit !== null && (
        <div className="text-xs bg-blue-500/10 rounded px-2 py-1 flex justify-between font-medium">
          <span>Calculated cost per unit ({data.runQuantity} bottles)</span>
          <span className="text-blue-400">R{data.costPerUnit}</span>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: products = [], isLoading, error: productsError, refetch } = trpc.products.list.useQuery(undefined, {
    retry: 1, enabled: isAuthenticated && !authLoading,
  });
  const { data: inputs = [] } = trpc.inputs.list.useQuery(undefined, {
    retry: 1, enabled: isAuthenticated && !authLoading,
  });
  const { data: runs = [] } = trpc.production.list.useQuery(undefined, {
    retry: 1, enabled: isAuthenticated && !authLoading,
  });
  const { data: valuation } = trpc.products.getValuation.useQuery(undefined, {
    retry: 1, enabled: isAuthenticated && !authLoading,
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { toast.success('Product created'); setIsOpen(false); setForm(INITIAL_FORM); setCalculatedCost(null); refetch(); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { toast.success('Product updated'); setIsOpen(false); setForm(INITIAL_FORM); setIsEditing(false); setEditingId(null); setCalculatedCost(null); refetch(); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { toast.success('Product deleted'); setDeleteId(null); refetch(); },
    onError: (e: any) => toast.error(`Failed: ${e.message}`),
  });

  // Calculate cost from production runs when editing
  useEffect(() => {
    if (!editingId || !runs.length || !inputs.length) return;
    calculateCostFromRuns(editingId);
  }, [editingId, runs, inputs]);

  const calculateCostFromRuns = async (productId: number) => {
    // Find completed/approved runs for this product
    const productRuns = (runs as any[]).filter((r: any) =>
      r.productId === productId && (r.status === 'completed' || r.status === 'approved')
    );
    if (!productRuns.length) return;

    // Use most recent run
    const latestRun = productRuns[productRuns.length - 1];
    if (!latestRun.notes) return;

    // Parse materials from notes (format: "Materials: name: qty unit, ...")
    // We rely on productionRunInputs for accurate data - fetch via notes for now
    const notesMatch = latestRun.notes?.match(/Materials: (.+)/);
    if (!notesMatch) return;
  };

  const getProductMaterials = (productId: number) => {
    const productRuns = (runs as any[]).filter((r: any) =>
      r.productId === productId && (r.status === 'completed' || r.status === 'approved')
    );
    if (!productRuns.length) return [];
    const latestRun = productRuns[productRuns.length - 1];
    if (!latestRun?.notes) return [];
    const match = latestRun.notes.match(/Materials: (.+)/);
    if (!match) return [];
    return match[1].split(', ').filter(Boolean);
  };

  const handleSubmit = () => {
    if (!form.name || !form.sellingPrice) {
      toast.error('Name and selling price are required');
      return;
    }
    const productData = {
      name: form.name,
      description: form.description,
      sku: form.sku,
      costPerUnit: parseFloat(form.costPerUnit) || 0,
      sellingPrice: parseFloat(form.sellingPrice),
      currentStock: parseInt(form.currentStock) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
      unit: form.unit,
    };
    if (isEditing && editingId) {
      updateMutation.mutate({ id: editingId, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      costPerUnit: product.costPerUnit?.toString() || '',
      sellingPrice: product.sellingPrice?.toString() || '',
      currentStock: product.currentStock?.toString() || '0',
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      unit: product.unit || 'units',
    });
    setEditingId(product.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const calculateMargin = (cost: number, price: number) => {
    if (!price) return '0';
    return ((price - cost) / price * 100).toFixed(1);
  };

  const openAdd = () => {
    setForm(INITIAL_FORM);
    setIsEditing(false);
    setEditingId(null);
    setCalculatedCost(null);
    setIsOpen(true);
  };

  // Get materials for a product from its production runs
  const getMaterialsForProduct = (productId: number) => {
    const productRuns = (runs as any[]).filter((r: any) =>
      r.productId === productId && (r.status === 'completed' || r.status === 'approved')
    );
    if (!productRuns.length) return null;
    const latest = productRuns[productRuns.length - 1];
    return latest;
  };

  if (productsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-muted-foreground">{productsError.message}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your finished products and track margins</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Product</Button>
      </div>

      {/* Summary Cards */}
      {valuation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Stock Value (Cost)</p>
            <p className="text-2xl font-bold">R{valuation.summary.totalCostValue.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Stock Value (Selling)</p>
            <p className="text-2xl font-bold">R{valuation.summary.totalSellingValue.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Profit Potential</p>
            <p className="text-2xl font-bold text-green-600">R{(valuation.summary.totalSellingValue - valuation.summary.totalCostValue).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <Package className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground">No products yet.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products as any[]).map((product: any) => {
                const latestRun = getMaterialsForProduct(product.id);
                const materials = getProductMaterials(product.id);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      {materials.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" />
                          {materials.join(' · ')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.sku || '-'}</TableCell>
                    <TableCell>R{Number(product.costPerUnit).toFixed(2)}</TableCell>
                    <TableCell>R{Number(product.sellingPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={cn('font-semibold',
                        parseFloat(calculateMargin(parseFloat(product.costPerUnit), parseFloat(product.sellingPrice))) > 50
                          ? 'text-green-600' : 'text-orange-500'
                      )}>
                        {calculateMargin(parseFloat(product.costPerUnit), parseFloat(product.sellingPrice))}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(product.currentStock <= (product.lowStockThreshold || 10) ? 'text-red-500 font-semibold' : '')}>
                        {product.currentStock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(product.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog — does NOT close on outside click */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input placeholder="e.g., Lion's Mane Tincture" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input placeholder="e.g., LM-50ML" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Product description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>

            {/* Materials from production runs (read-only) */}
            {isEditing && editingId && (
              <div className="p-3 bg-muted/30 rounded-lg border">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-400" />
                  Materials Used (from Production Runs)
                </p>
                {(() => {
                  const productRuns = (runs as any[]).filter((r: any) =>
                    r.productId === editingId && (r.status === 'completed' || r.status === 'approved')
                  );
                  if (!productRuns.length) return <p className="text-xs text-muted-foreground">No completed production runs yet. Materials will appear here once a run is completed.</p>;
                  const latest = productRuns[productRuns.length - 1];
                  const mats = getProductMaterials(editingId);
                  return (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">From run: {latest.runNumber} ({latest.quantity} units)</p>
                      {mats.length > 0 ? mats.map((m, i) => (
                        <div key={i} className="text-xs bg-muted/50 rounded px-2 py-1">{m}</div>
                      )) : <p className="text-xs text-muted-foreground">No material details recorded.</p>}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Cost Per Unit (R)</label>
                <Input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={form.costPerUnit}
                  onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Enter actual cost per bottle</p>
              </div>
              <div>
                <label className="text-sm font-medium">Selling Price (R) *</label>
                <Input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Margin %</label>
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm font-bold">
                  {calculateMargin(parseFloat(form.costPerUnit) || 0, parseFloat(form.sellingPrice) || 0)}%
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Current Stock</label>
                <Input placeholder="0" type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Low Stock Alert</label>
                <Input placeholder="10" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Select value={form.unit || 'units'} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="ml">Milliliters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
              <Button variant="outline" onClick={() => { setIsOpen(false); setForm(INITIAL_FORM); setIsEditing(false); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
