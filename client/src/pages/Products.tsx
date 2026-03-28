/**
 * Products Management Page
 * Add, edit, and manage products with cost per unit, selling price, and profit margin tracking
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit2, Trash2, TrendingUp, Package } from 'lucide-react';
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

export default function Products() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);

  // Queries and mutations
  const { data: products, isLoading, refetch } = trpc.products.list.useQuery();
  const { data: valuation } = trpc.products.getValuation.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  // Calculate profit margin
  const costPerUnit = parseFloat(form.costPerUnit) || 0;
  const sellingPrice = parseFloat(form.sellingPrice) || 0;
  const profitPerUnit = sellingPrice - costPerUnit;
  const profitMarginPercent =
    sellingPrice > 0 ? ((profitPerUnit / sellingPrice) * 100).toFixed(2) : '0.00';

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setIsEditing(true);
      setEditingId(product.id);
      setForm({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        costPerUnit: product.costPerUnit.toString(),
        sellingPrice: product.sellingPrice.toString(),
        currentStock: product.currentStock.toString(),
        lowStockThreshold: product.lowStockThreshold?.toString() || '10',
        unit: product.unit || 'units',
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setForm(INITIAL_FORM);
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setForm(INITIAL_FORM);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.costPerUnit || parseFloat(form.costPerUnit) <= 0) {
      toast.error('Cost per unit must be greater than 0');
      return;
    }
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) {
      toast.error('Selling price must be greater than 0');
      return;
    }

    try {
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: form.name,
            description: form.description || undefined,
            sku: form.sku || undefined,
            costPerUnit: parseFloat(form.costPerUnit),
            sellingPrice: parseFloat(form.sellingPrice),
            currentStock: parseInt(form.currentStock) || 0,
            lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
            unit: form.unit,
          },
        });
        toast.success('Product updated successfully');
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          description: form.description || undefined,
          sku: form.sku || undefined,
          costPerUnit: parseFloat(form.costPerUnit),
          sellingPrice: parseFloat(form.sellingPrice),
          currentStock: parseInt(form.currentStock) || 0,
          lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
          unit: form.unit,
        });
        toast.success('Product created successfully');
      }
      handleCloseDialog();
      refetch();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success('Product deleted successfully');
      setDeleteId(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const summary = valuation?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Products & Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your products with cost tracking and profit margin calculations
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Update product details and pricing'
                  : 'Create a new product with cost and selling price'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g., Organic Coffee Beans"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g., SKU-001"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Product details and specifications"
                  rows={3}
                />
              </div>

              {/* Pricing */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-sm">Pricing & Margins</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cost Per Unit *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.costPerUnit}
                      onChange={(e) =>
                        setForm({ ...form, costPerUnit: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Selling Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.sellingPrice}
                      onChange={(e) =>
                        setForm({ ...form, sellingPrice: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Margin Preview */}
                {costPerUnit > 0 && sellingPrice > 0 && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                    <div className="bg-background p-3 rounded">
                      <p className="text-xs text-muted-foreground">Profit/Unit</p>
                      <p className="text-lg font-semibold text-green-600">
                        {profitPerUnit.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-background p-3 rounded">
                      <p className="text-xs text-muted-foreground">Margin %</p>
                      <p className="text-lg font-semibold text-green-600">
                        {profitMarginPercent}%
                      </p>
                    </div>
                    <div className="bg-background p-3 rounded">
                      <p className="text-xs text-muted-foreground">Markup</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {costPerUnit > 0
                          ? ((sellingPrice / costPerUnit - 1) * 100).toFixed(1)
                          : '0'}
                        %
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Inventory */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-sm">Inventory</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current Stock</label>
                    <Input
                      type="number"
                      value={form.currentStock}
                      onChange={(e) =>
                        setForm({ ...form, currentStock: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Low Stock Alert</label>
                    <Input
                      type="number"
                      value={form.lowStockThreshold}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          lowStockThreshold: e.target.value,
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unit</label>
                    <Input
                      value={form.unit}
                      onChange={(e) =>
                        setForm({ ...form, unit: e.target.value })
                      }
                      placeholder="units"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {isEditing ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Cost Value</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              R{summary.totalCostValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Selling Value</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              R{summary.totalSellingValue.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Profit Potential</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              R{summary.totalProfitPotential.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Overall Margin</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {summary.overallMarginPercent}%
            </p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : !products || products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No products yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first product to start tracking costs and margins
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Cost/Unit</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Profit/Unit</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.sku && (
                        <p className="text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">
                      R{product.profitPerUnit.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600 font-medium">
                      {product.profitMarginPercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-medium',
                        product.currentStock <
                          (product.lowStockThreshold || 10)
                          ? 'text-red-600'
                          : 'text-foreground'
                      )}
                    >
                      {product.currentStock} {product.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    R{product.totalSellingValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
