import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, Edit2, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

type QualityStatus = "pending" | "approved" | "rejected" | "expired";

export function Batches() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<QualityStatus | "all">("all");
  const [filterProductId, setFilterProductId] = useState<number | "all">("all");
  const [formData, setFormData] = useState({
    productId: "",
    inputId: "",
    batchNumber: "",
    quantity: "",
    unit: "kg",
    manufacturedDate: "",
    expiryDate: "",
    qualityStatus: "pending" as QualityStatus,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const { data: batches, isLoading, refetch } = trpc.batches.list.useQuery({
    qualityStatus: filterStatus === "all" ? undefined : filterStatus,
    productId: filterProductId === "all" ? undefined : filterProductId,
  });

  const { data: products } = trpc.products.list.useQuery();
  const { data: inputs } = trpc.inputs.list.useQuery();

  const createBatch = trpc.batches.create.useMutation({
    onSuccess: () => {
      console.log("Batch created successfully");
      resetForm();
      setError(null);
      setIsOpen(false);
      refetch();
    },
    onError: (err) => {
      console.error("Error creating batch:", err);
      setError(err.message);
    },
  });

  const updateBatch = trpc.batches.update.useMutation({
    onSuccess: () => {
      console.log("Batch updated successfully");
      resetForm();
      setError(null);
      setIsOpen(false);
      refetch();
    },
    onError: (err) => {
      console.error("Error updating batch:", err);
      setError(err.message);
    },
  });

  const deleteBatch = trpc.batches.delete.useMutation({
    onSuccess: () => {
      console.log("Batch deleted successfully");
      setError(null);
      refetch();
    },
    onError: (err) => {
      console.error("Error deleting batch:", err);
      setError(err.message);
    },
  });

  const { data: expiringBatches } = trpc.batches.getExpiring.useQuery({
    daysUntilExpiry: 30,
  });

  const resetForm = () => {
    setFormData({
      productId: "",
      inputId: "",
      batchNumber: "",
      quantity: "",
      unit: "kg",
      manufacturedDate: "",
      expiryDate: "",
      qualityStatus: "pending",
      notes: "",
    });
    setEditingId(null);
  };

  const handleEdit = (batch: any) => {
    setFormData({
      productId: batch.productId?.toString() || "",
      inputId: batch.inputId?.toString() || "",
      batchNumber: batch.batchNumber,
      quantity: batch.quantity.toString(),
      unit: batch.unit || "kg",
      manufacturedDate: batch.manufacturedDate ? new Date(batch.manufacturedDate).toISOString().split("T")[0] : "",
      expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split("T")[0] : "",
      qualityStatus: batch.qualityStatus,
      notes: batch.notes || "",
    });
    setEditingId(batch.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchNumber || !formData.quantity) {
      setError("Please fill in required fields (batch number, quantity)");
      return;
    }

    const payload = {
      productId: formData.productId ? parseInt(formData.productId) : undefined,
      inputId: formData.inputId ? parseInt(formData.inputId) : undefined,
      batchNumber: formData.batchNumber,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      manufacturedDate: formData.manufacturedDate ? new Date(formData.manufacturedDate) : undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      qualityStatus: formData.qualityStatus,
      notes: formData.notes || undefined,
    };

    if (editingId) {
      updateBatch.mutate({ id: editingId, ...payload });
    } else {
      createBatch.mutate(payload);
    }
  };

  const getStatusIcon = (status: QualityStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: QualityStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isExpired = (expiryDate: any) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const daysUntilExpiry = (expiryDate: any) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const stats = useMemo(() => {
    if (!batches) return { totalBatches: 0, approved: 0, pending: 0, expired: 0, expiringSoon: 0 };

    let approved = 0;
    let pending = 0;
    let expired = 0;
    let expiringSoon = 0;

    batches.forEach((batch) => {
      if (batch.qualityStatus === "approved") approved++;
      if (batch.qualityStatus === "pending") pending++;
      if (batch.qualityStatus === "expired" || isExpired(batch.expiryDate)) expired++;
      if (!isExpired(batch.expiryDate) && daysUntilExpiry(batch.expiryDate) !== null && daysUntilExpiry(batch.expiryDate)! <= 30) {
        expiringSoon++;
      }
    });

    return { totalBatches: batches.length, approved, pending, expired, expiringSoon };
  }, [batches]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Batch & Lot Management</h1>
          <p className="text-muted-foreground mt-1">Track batch numbers, expiry dates, and quality status</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Batch" : "Create New Batch"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update batch information" : "Add a new batch with tracking details"}
              </DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  placeholder="e.g., BATCH-2026-001"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select" />
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
                  <Label htmlFor="input">Input</Label>
                  <Select value={formData.inputId} onValueChange={(v) => setFormData({ ...formData, inputId: v })}>
                    <SelectTrigger id="input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {inputs?.map((i) => (
                        <SelectItem key={i.id} value={i.id.toString()}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="liters">liters</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                      <SelectItem value="boxes">boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mfgDate">Manufactured Date</Label>
                  <Input
                    id="mfgDate"
                    type="date"
                    value={formData.manufacturedDate}
                    onChange={(e) => setFormData({ ...formData, manufacturedDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expDate">Expiry Date</Label>
                  <Input
                    id="expDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Quality Status</Label>
                <Select value={formData.qualityStatus} onValueChange={(v) => setFormData({ ...formData, qualityStatus: v as QualityStatus })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this batch..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-20"
                />
              </div>

              <Button type="submit" className="w-full" disabled={createBatch.isPending || updateBatch.isPending}>
                {(createBatch.isPending || updateBatch.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Update Batch" : "Create Batch"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBatches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filterStatus" className="text-sm">
            Filter by Status
          </Label>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger id="filterStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="filterProduct" className="text-sm">
            Filter by Product
          </Label>
          <Select value={filterProductId.toString()} onValueChange={(v) => setFilterProductId(v === "all" ? "all" : parseInt(v))}>
            <SelectTrigger id="filterProduct">
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

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batch List</CardTitle>
          <CardDescription>All batches and lots in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !batches || batches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No batches found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Batch Number</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Expiry Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => {
                    const product = products?.find((p) => p.id === batch.productId);
                    const daysLeft = daysUntilExpiry(batch.expiryDate);
                    const expired = isExpired(batch.expiryDate);

                    return (
                      <tr key={batch.id} className={`border-b hover:bg-muted/50 ${expired ? "bg-red-50" : daysLeft && daysLeft <= 30 ? "bg-yellow-50" : ""}`}>
                        <td className="py-3 px-4 font-medium">{batch.batchNumber}</td>
                        <td className="py-3 px-4">{product?.name || "—"}</td>
                        <td className="py-3 px-4 text-right">
                          {batch.quantity} {batch.unit}
                        </td>
                        <td className="py-3 px-4">
                          {batch.expiryDate ? (
                            <div className="flex flex-col">
                              <span>{new Date(batch.expiryDate).toLocaleDateString()}</span>
                              {daysLeft !== null && (
                                <span className={`text-xs ${expired ? "text-red-600" : daysLeft <= 30 ? "text-orange-600" : "text-green-600"}`}>
                                  {expired ? "Expired" : daysLeft <= 0 ? "Today" : `${daysLeft} days left`}
                                </span>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(batch.qualityStatus as QualityStatus)}
                            <span>{getStatusLabel(batch.qualityStatus as QualityStatus)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(batch)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBatch.mutate({ id: batch.id })}
                              disabled={deleteBatch.isPending}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
