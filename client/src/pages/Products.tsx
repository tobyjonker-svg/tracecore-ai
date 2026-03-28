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
import { Plus, Edit2, Trash2, TrendingUp, Package, AlertCircle } from 'lucide-react';
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

  // Queries and mutations with error handling
  const { 
    data: products = [], 
    isLoading, 
    error: productsError,
    refetch 
  } = trpc.products.list.useQuery(undefined, {
    retry: 1,
  });

  const { 
    data: valuation,
  } = trpc.products.getValuation.useQuery(undefined, {
    retry: 1,
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success('Product created successfully');
      setIsOpen(false);
      setForm(INITIAL_FORM);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success('Product updated successfully');
      setIsOpen(false);
      setForm(INITIAL_FORM);
      setIsEditing(false);
      setEditingId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success('Product deleted successfully');
      setDeleteId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });

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

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!form.costPerUnit || !form.sellingPrice) {
      toast.error('Cost and selling price are required');
      return;
    }

    if (isEditing && editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          name: form.name,
          description: form.description,
          sku: form.sku,
          costPerUnit: parseFloat(form.costPerUnit),
          sellingPrice: parseFloat(form.sellingPrice),
          currentStock: parseInt(form.currentStock),
          lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : undefined,
          unit: form.unit,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: form.name,
        description: form.description,
        sku: form.sku,
        costPerUnit: parseFloat(form.costPerUnit),
        sellingPrice: parseFloat(form.sellingPrice),
        currentStock: parseInt(form.currentStock),
        lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : undefined,
        unit: form.unit,
      });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ id: deleteId });
    }
  };

  // Show error state if queries failed
  if (productsError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Products</h2>
        <p className="text-muted-foreground mb-6">
          {productsError.message || 'An error occurred while loading products'}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your products with cost and margin tracking
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                Enter product details including cost and selling price
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Coffee Beans"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description"
                  rows={2}
                />
              </div>

              {/* SKU */}
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g., CB-001"
                />
              </div>

              {/* Cost Per Unit */}
              <div>
                <label className="text-sm font-medium">Cost Per Unit (ZAR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.costPerUnit}
                  onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="text-sm font-medium">Selling Price (ZAR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Profit Margin Preview */}
              {costPerUnit > 0 && sellingPrice > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profit Per Unit:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ZAR {profitPerUnit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium">Margin %:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {profitMarginPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Current Stock */}
              <div>
                <label className="text-sm font-medium">Current Stock</label>
                <Input
                  type="number"
                  value={form.currentStock}
                  onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                  placeholder="0"
                />
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <Input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                  placeholder="10"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g., kg, pieces"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Product'
                  : 'Add Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {valuation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Total Products</p>
            <p className="text-2xl font-bold">{valuation.summary.productCount}</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Total Cost Value</p>
            <p className="text-2xl font-bold">ZAR {valuation.summary.totalCostValue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Total Selling Value</p>
            <p className="text-2xl font-bold">ZAR {valuation.summary.totalSellingValue.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground mb-1">Overall Margin</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {valuation.summary.overallMarginPercent}%
            </p>
          </div>
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading products...</div>
        </div>
      ) : products && products.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell className="text-right">ZAR {product.costPerUnit.toFixed(2)}</TableCell>
                  <TableCell className="text-right">ZAR {product.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-semibold',
                      parseFloat(product.profitMarginPercent) > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      {product.profitMarginPercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      product.currentStock < (product.lowStockThreshold || 10)
                        ? 'text-orange-600 dark:text-orange-400 font-semibold'
                        : ''
                    )}>
                      {product.currentStock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
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
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by adding your first product to track costs and margins
          </p>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
