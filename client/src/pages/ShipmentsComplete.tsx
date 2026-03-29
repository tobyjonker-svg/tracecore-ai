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
import { Truck, Plus, Edit2, Trash2, Loader2, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

const SHIPMENT_STATUSES = ['pending', 'picked', 'packed', 'shipped', 'in_transit', 'delivered'];
const CARRIERS = ['FedEx', 'DHL', 'UPS', 'Local Courier', 'DPD', 'Hermes'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  picked: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-yellow-100 text-yellow-800',
  delivered: 'bg-green-100 text-green-800',
};

export function ShipmentsComplete() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    orderId: '',
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
  });

  const { data: shipments = [], isLoading, refetch } = trpc.shipments.list.useQuery();
  const { data: orders = [] } = trpc.orders.list.useQuery();

  const createMutation = trpc.shipments.create.useMutation({
    onSuccess: () => {
      toast.success('Shipment created successfully');
      refetch();
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.shipments.update.useMutation({
    onSuccess: () => {
      toast.success('Shipment updated successfully');
      refetch();
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.shipments.delete.useMutation({
    onSuccess: () => {
      toast.success('Shipment deleted successfully');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateStatusMutation = trpc.shipments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Shipment status updated');
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      orderId: '',
      trackingNumber: '',
      carrier: '',
      estimatedDelivery: '',
    });
    setSelectedShipment(null);
  };

  const handleAddShipment = () => {
    if (!formData.orderId || !formData.trackingNumber || !formData.carrier) {
      toast.error('Please fill all required fields');
      return;
    }
    createMutation.mutate({
      orderId: parseInt(formData.orderId),
      trackingNumber: formData.trackingNumber,
      carrier: formData.carrier,
      estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  };

  const handleEditShipment = () => {
    if (!selectedShipment) return;
    updateMutation.mutate({
      id: selectedShipment.id,
      orderId: parseInt(formData.orderId),
      trackingNumber: formData.trackingNumber,
      carrier: formData.carrier,
      estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : selectedShipment.estimatedDelivery,
    });
  };

  const handleDeleteShipment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEditClick = (shipment: any) => {
    setSelectedShipment(shipment);
    setFormData({
      orderId: shipment.orderId.toString(),
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString().split('T')[0] : '',
    });
    setIsEditOpen(true);
  };

  const filteredShipments = shipments.filter((shipment: any) => {
    const matchesSearch = shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getOrderNumber = (orderId: number) => {
    return orders.find((o: any) => o.id === orderId)?.orderNumber || 'Unknown Order';
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
            <Truck className="w-8 h-8" />
            Shipments & Logistics
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage shipments</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shipment</DialogTitle>
              <DialogDescription>Add a new shipment for an order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Order *</label>
                <Select value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((o: any) => (
                      <SelectItem key={o.id} value={o.id.toString()}>
                        {o.orderNumber} - {o.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tracking Number *</label>
                <Input
                  placeholder="Enter tracking number"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Carrier *</label>
                <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map((carrier) => (
                      <SelectItem key={carrier} value={carrier}>
                        {carrier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Delivery</label>
                <Input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddShipment} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Shipment
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
                  placeholder="Search by shipment or tracking number..."
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
                {SHIPMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments ({filteredShipments.length})</CardTitle>
          <CardDescription>All shipments and their delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredShipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shipments found. Create your first shipment to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Shipment ID</th>
                    <th className="text-left py-3 px-4 font-medium">Order</th>
                    <th className="text-left py-3 px-4 font-medium">Tracking Number</th>
                    <th className="text-left py-3 px-4 font-medium">Carrier</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Est. Delivery</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((shipment: any) => (
                    <tr key={shipment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{shipment.shipmentNumber}</td>
                      <td className="py-3 px-4">{getOrderNumber(shipment.orderId)}</td>
                      <td className="py-3 px-4 font-mono text-xs">{shipment.trackingNumber}</td>
                      <td className="py-3 px-4">{shipment.carrier}</td>
                      <td className="py-3 px-4">
                        <Select value={shipment.status} onValueChange={(status: any) => updateStatusMutation.mutate({ id: shipment.id, status })}>
                          <SelectTrigger className={`w-32 ${STATUS_COLORS[shipment.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIPMENT_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('_', ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(shipment)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteShipment(shipment.id)}
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
            <DialogTitle>Edit Shipment</DialogTitle>
            <DialogDescription>Update shipment details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Order *</label>
              <Select value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o: any) => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {o.orderNumber} - {o.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tracking Number *</label>
              <Input
                placeholder="Enter tracking number"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Carrier *</label>
              <Select value={formData.carrier} onValueChange={(value) => setFormData({ ...formData, carrier: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select carrier" />
                </SelectTrigger>
                <SelectContent>
                  {CARRIERS.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Delivery</label>
              <Input
                type="date"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button onClick={handleEditShipment} className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Shipment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
