import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, TrendingUp, TrendingDown, Package } from "lucide-react";
import { formatDateTime } from "@/lib/store";

type ActivityType = "purchase" | "sale" | "adjustment" | "production" | "return";

export function InventoryLog() {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<ActivityType | "all">("all");
  const [filterProductId, setFilterProductId] = useState<number | "all">("all");
  const [formData, setFormData] = useState({
    productId: "",
    type: "purchase" as ActivityType,
    quantity: "",
    costPerUnit: "",
    sellingPrice: "",
    supplierId: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const { data: activities, isLoading, error: fetchError, refetch } = trpc.inventory.list.useQuery({
    type: filterType === "all" ? undefined : filterType,
    productId: filterProductId === "all" ? undefined : filterProductId,
  });

  const { data: products } = trpc.products.list.useQuery();

  const createActivity = trpc.inventory.create.useMutation({
    onSuccess: () => {
      console.log("Activity recorded successfully");
      setFormData({
        productId: "",
        type: "purchase",
        quantity: "",
        costPerUnit: "",
        sellingPrice: "",
        supplierId: "",
        notes: "",
      });
      setError(null);
      setIsOpen(false);
      refetch();
    },
    onError: (err) => {
      console.error("Error creating activity:", err);
      setError(err.message);
    },
  });

  const deleteActivity = trpc.inventory.delete.useMutation({
    onSuccess: () => {
      console.log("Activity deleted");
      setError(null);
      refetch();
    },
    onError: (err) => {
      console.error("Error deleting activity:", err);
      setError(err.message);
    },
  });

  const { data: summary } = trpc.inventory.getSummary.useQuery({
    type: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!activities) return { totalPurchases: 0, totalSales: 0, totalAdjustments: 0, totalValue: 0 };

    let totalPurchases = 0;
    let totalSales = 0;
    let totalAdjustments = 0;
    let totalValue = 0;

    activities.forEach((activity) => {
      if (activity.type === "purchase") totalPurchases += activity.quantity;
      if (activity.type === "sale") totalSales += activity.quantity;
      if (activity.type === "adjustment") totalAdjustments += activity.quantity;
      if (activity.totalValue) totalValue += parseFloat(activity.totalValue.toString());
    });

    return { totalPurchases, totalSales, totalAdjustments, totalValue };
  }, [activities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) {
      setError("Please fill in all required fields");
      return;
    }

    createActivity.mutate({
      productId: parseInt(formData.productId),
      type: formData.type,
      quantity: parseInt(formData.quantity),
      costPerUnit: formData.costPerUnit || undefined,
      sellingPrice: formData.sellingPrice || undefined,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
      notes: formData.notes || undefined,
    });
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "purchase":
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case "sale":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "production":
        return <Package className="w-4 h-4 text-purple-500" />;
      case "return":
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityLabel = (type: ActivityType) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "sale":
        return "Sale";
      case "production":
        return "Production";
      case "return":
        return "Return";
      case "adjustment":
        return "Adjustment";
      default:
        return type;
    }
  };

  if (fetchError) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Failed to load inventory activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{fetchError.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Activity Log</h1>
          <p className="text-muted-foreground mt-1">Track all stock movements, purchases, sales, and adjustments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Record Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Inventory Activity</DialogTitle>
              <DialogDescription>Add a new purchase, sale, or adjustment transaction</DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ActivityType })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Per Unit</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="e.g., 20.00"
                    step="0.01"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 50.00"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this transaction..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-20"
                />
              </div>

              <Button type="submit" className="w-full" disabled={createActivity.isPending}>
                {createActivity.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Record Activity
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground mt-1">units purchased</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">units sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalAdjustments}</div>
            <p className="text-xs text-muted-foreground mt-1">adjustments made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">transaction value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter-type" className="text-sm">
            Filter by Type
          </Label>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger id="filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
              <SelectItem value="sale">Sales</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="adjustment">Adjustments</SelectItem>
              <SelectItem value="return">Returns</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="filter-product" className="text-sm">
            Filter by Product
          </Label>
          <Select value={filterProductId.toString()} onValueChange={(v) => setFilterProductId(v === "all" ? "all" : parseInt(v))}>
            <SelectTrigger id="filter-product">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products?.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All inventory movements and adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !activities || activities.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No activities recorded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start by recording your first purchase or sale</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                    <th className="text-right py-3 px-4 font-medium">Cost/Unit</th>
                    <th className="text-right py-3 px-4 font-medium">Total Cost</th>
                    <th className="text-left py-3 px-4 font-medium">Notes</th>
                    <th className="text-center py-3 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => {
                    const product = products?.find((p) => p.id === activity.productId);
                    return (
                      <tr key={activity.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{typeof activity.createdAt === 'string' ? formatDateTime(activity.createdAt) : formatDateTime(activity.createdAt.toISOString())}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type as ActivityType)}
                            <span>{getActivityLabel(activity.type as ActivityType)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{product?.name || "Unknown"}</td>
                        <td className="py-3 px-4 text-right">{activity.quantity}</td>
                        <td className="py-3 px-4 text-right">
                          {activity.costPerUnit ? `R${parseFloat(activity.costPerUnit.toString()).toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {activity.totalCost ? `R${parseFloat(activity.totalCost.toString()).toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{activity.notes || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteActivity.mutate({ id: activity.id })}
                            disabled={deleteActivity.isPending}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
