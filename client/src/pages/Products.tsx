/**
 * Products Management Page
 * Add, edit, and manage products with cost per unit, selling price, and profit margin tracking
 * Now includes input (raw material) linking with conversion ratios
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductForm {
  name: string;
  description: string;
  sku: string;
  inputId: string;
  conversionRatio: string;
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
  inputId: '',
  conversionRatio: '',
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
    data: inputs = [],
  } = trpc.inputs.list.useQuery(undefined, {
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

  const handleSubmit = async () => {
    if (!form.name || !form.sellingPrice) {
      toast.error('Please fill in required fields (Name, Selling Price)');
      return;
    }

    const productData = {
      name: form.name,
      description: form.description,
      sku: form.sku,
      inputId: form.inputId ? parseInt(form.inputId) : undefined,
      conversionRatio: form.conversionRatio ? parseFloat(form.conversionRatio) : undefined,
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
      inputId: product.inputId?.toString() || '',
      conversionRatio: product.conversionRatio?.toString() || '',
      costPerUnit: product.costPerUnit.toString(),
      sellingPrice: product.sellingPrice.toString(),
      currentStock: product.currentStock.toString(),
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      unit: product.unit || 'units',
    });
    setEditingId(product.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const calculateMargin = (cost: number, price: number): string => {
    if (price === 0) return '0';
    return ((price - cost) / price * 100).toFixed(1);
  };

  const calculateInputCost = (inputId: string, ratio: string) => {
    if (!inputId || !ratio) return 0;
    const input = inputs.find(i => i.id === parseInt(inputId));
    if (!input) return 0;
    return (parseFloat(input.costPerUnit) / parseFloat(ratio)).toFixed(2);
  };

  if (productsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to Load Products</h2>
        <p className="text-muted-foreground">{productsError.message}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your finished products and track margins</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setForm(INITIAL_FORM);
              setIsEditing(false);
              setEditingId(null);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update product details' : 'Create a new product with cost and pricing information'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    placeholder="e.g., Capsules"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <Input
                    placeholder="e.g., CAP-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Product description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Input Linking */}
              <div className="space-y-3 p-3 bg-accent rounded-lg border border-accent/30">
                <p className="text-sm font-medium text-accent-foreground">Link to Raw Material (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Select Input</label>
                    <Select value={form.inputId} onValueChange={(value) => setForm({ ...form, inputId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose input..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        {inputs.map((input) => (
                          <SelectItem key={input.id} value={input.id.toString()}>
                            {input.name} ({input.costPerUnit} per {input.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conversion Ratio</label>
                    <Input
                      placeholder="e.g., 1 (1kg makes 1 product)"
                      type="number"
                      step="0.01"
                      value={form.conversionRatio}
                      onChange={(e) => setForm({ ...form, conversionRatio: e.target.value })}
                      disabled={!form.inputId}
                    />
                  </div>
                </div>
                {form.inputId && form.conversionRatio && (
                  <div className="text-xs text-accent-foreground bg-accent/20 p-2 rounded">
                    Input cost per product: {calculateInputCost(form.inputId, form.conversionRatio)} 
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Cost Per Unit *</label>
                  <Input
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    value={form.costPerUnit}
                    onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Selling Price *</label>
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
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm font-medium">
                    {calculateMargin(parseFloat(form.costPerUnit) || 0, parseFloat(form.sellingPrice) || 0)}%
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Stock</label>
                  <Input
                    placeholder="0"
                    type="number"
                    value={form.currentStock}
                    onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Low Stock Threshold</label>
                  <Input
                    placeholder="10"
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Select value={form.unit || 'units'} onValueChange={(value) => setForm({ ...form, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="grams">Grams</SelectItem>
                      <SelectItem value="ml">Milliliters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isEditing ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setForm(INITIAL_FORM);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {valuation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Stock Value (Cost)</p>
            <p className="text-2xl font-bold">{valuation.summary.totalCostValue.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Stock Value (Selling)</p>
            <p className="text-2xl font-bold">{valuation.summary.totalSellingValue.toFixed(2)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Profit Potential</p>
            <p className="text-2xl font-bold text-green-600">{(valuation.summary.totalSellingValue - valuation.summary.totalCostValue).toFixed(2)}</p>
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
          <p className="text-muted-foreground">No products yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Margin %</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.inputId ? `Linked (${product.conversionRatio}:1)` : 'None'}
                  </TableCell>
                  <TableCell>{product.costPerUnit}</TableCell>
                  <TableCell>{product.sellingPrice}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'font-semibold',
                      parseFloat(calculateMargin(parseFloat(product.costPerUnit), parseFloat(product.sellingPrice))) > 50 ? 'text-green-600' : 'text-orange-600'
                    )}>
                      {calculateMargin(product.costPerUnit, product.sellingPrice)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      product.currentStock <= product.lowStockThreshold ? 'text-red-600 font-semibold' : ''
                    )}>
                      {product.currentStock}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
