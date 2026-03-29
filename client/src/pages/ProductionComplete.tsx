import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Factory, Plus, Edit2, Trash2, Loader2, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

const PRODUCTION_STATUSES = ['planned', 'in_progress', 'completed', 'quality_check', 'approved'];
const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  quality_check: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
};

export function ProductionComplete() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  const { data: productionRuns = [], isLoading, refetch } = trpc.production.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  const createMutation = trpc.production.create.useMutation({
    onSuccess: () => {
      toast.success('Production run created successfully');
      refetch();
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.production.update.useMutation({
    onSuccess: () => {
      toast.success('Production run updated successfully');
      refetch();
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.production.delete.useMutation({
    onSuccess: () => {
      toast.success('Production run deleted successfully');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = trpc.production.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Production status updated');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setSelectedRun(null);
  };

  const handleAddRun = () => {
    if (!formData.productId || !formData.quantity || !formData.startDate) {
      toast.error('Please fill all required fields');
      return;
    }
    createMutation.mutate({
      runNumber: `PRD-${Date.now()}`,
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      notes: formData.notes,
    });
  };

  const handleEditRun = () => {
    if (!selectedRun) return;
    updateMutation.mutate({
      id: selectedRun.id,
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : selectedRun.endDate,
      notes: formData.notes,
    });
  };

  const handleDeleteRun = (id: number) => {
    if (window.confirm('Are you sure you want to delete this production run?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEditClick = (run: any) => {
    setSelectedRun(run);
    setFormData({
      productId: run.productId.toString(),
      quantity: run.quantity.toString(),
      startDate: new Date(run.startDate).toISOString().split('T')[0],
      endDate: run.endDate ? new Date(run.endDate).toISOString().split('T')[0] : '',
      notes: run.notes || '',
    });
    setIsEditOpen(true);
  };

  const filteredRuns = productionRuns.filter((run: any) => {
    const matchesSearch = run.runNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || run.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getProductName = (productId: number) => {
    return products.find((p: any) => p.id === productId)?.name || 'Unknown Product';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="w-8 h-8" />
            Production Runs
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage production runs</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Production Run
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Production Run</DialogTitle>
              <DialogDescription>Start a new production run</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product *</label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  placeholder="Add notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddRun} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Run
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by run number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {PRODUCTION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Production Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Runs ({filteredRuns.length})</CardTitle>
          <CardDescription>All production runs and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No production runs found. Create your first run to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Run ID</th>
                    <th className="text-left py-3 px-4 font-medium">Product</th>
                    <th className="text-right py-3 px-4 font-medium">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium">End Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns.map((run: any) => (
                    <tr key={run.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{run.runNumber}</td>
                      <td className="py-3 px-4">{getProductName(run.productId)}</td>
                      <td className="py-3 px-4 text-right">{run.quantity}</td>
                      <td className="py-3 px-4">{new Date(run.startDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{run.endDate ? new Date(run.endDate).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-4">
                        <Select value={run.status} onValueChange={(status: any) => updateStatusMutation.mutate({ id: run.id, status })}>
                          <SelectTrigger className={`w-32 ${STATUS_COLORS[run.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCTION_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(run)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRun(run.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Production Run</DialogTitle>
            <DialogDescription>Update production run details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product *</label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date *</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Add notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button onClick={handleEditRun} className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Run
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
