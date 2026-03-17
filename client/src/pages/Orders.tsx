/**
 * TraceCore AI — Orders Page
 * Design: Soft-Dark Enterprise
 * - Create orders with multiple products
 * - Status: Pending → Packed → Shipped (auto-deducts stock)
 * - Stock warning if order exceeds available stock
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDateTime } from '@/lib/store';
import { OrderStatus } from '@/lib/store';
import {
  ShoppingCart, Plus, Trash2, AlertTriangle, Package, ChevronDown, ChevronUp,
  Truck, CheckCircle, Clock, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderItemDraft {
  productId: string;
  quantity: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType; next?: OrderStatus; nextLabel?: string }> = {
  Pending: {
    label: 'Pending',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    icon: Clock,
    next: 'Packed',
    nextLabel: 'Mark Packed',
  },
  Packed: {
    label: 'Packed',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: Package,
    next: 'Shipped',
    nextLabel: 'Mark Shipped',
  },
  Shipped: {
    label: 'Shipped',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle,
  },
};

export default function Orders() {
  const { state, dispatch } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<OrderItemDraft[]>([{ productId: '', quantity: 1 }]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');

  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof OrderItemDraft, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Check if any item exceeds stock
  const stockWarnings = items.filter(item => {
    if (!item.productId || item.quantity <= 0) return false;
    const product = state.products.find(p => p.id === item.productId);
    return product && item.quantity > product.stockOnHand;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) { toast.error('Customer name is required'); return; }
    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one product to the order'); return; }

    dispatch({
      type: 'ADD_ORDER',
      payload: {
        customerName: customerName.trim(),
        items: validItems,
      },
    });
    setCustomerName('');
    setItems([{ productId: '', quantity: 1 }]);
    toast.success(`Order created for ${customerName.trim()}`);
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    if (newStatus === 'Shipped') {
      // Check stock availability
      const insufficientItems = order.items.filter(item => {
        const product = state.products.find(p => p.id === item.productId);
        return product && item.quantity > product.stockOnHand;
      });

      if (insufficientItems.length > 0) {
        const names = insufficientItems.map(item => {
          const product = state.products.find(p => p.id === item.productId);
          return product?.name ?? 'Unknown';
        });
        toast.error(`Insufficient stock for: ${names.join(', ')}. Cannot ship.`);
        return;
      }
    }

    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status: newStatus } });
    toast.success(`Order marked as ${newStatus}`);
  };

  const filteredOrders = filterStatus === 'All'
    ? state.orders
    : state.orders.filter(o => o.status === filterStatus);

  const pendingCount = state.orders.filter(o => o.status === 'Pending').length;
  const packedCount = state.orders.filter(o => o.status === 'Packed').length;
  const shippedCount = state.orders.filter(o => o.status === 'Shipped').length;

  return (
    <div className="p-6 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Orders</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage outgoing orders. Shipping automatically deducts product stock.
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { status: 'Pending' as OrderStatus, count: pendingCount, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { status: 'Packed' as OrderStatus, count: packedCount, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { status: 'Shipped' as OrderStatus, count: shippedCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(({ status, count, color, bg }) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)}
            className={cn(
              'tc-card text-center transition-all duration-150',
              filterStatus === status ? `border ${bg}` : 'hover:bg-muted/30'
            )}
          >
            <p className={cn('text-2xl font-bold font-["Plus_Jakarta_Sans"]', color)}>{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{status}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Order Form */}
        <div className="lg:col-span-1">
          <div className="tc-card sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">Create Order</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Green Leaf Wellness"
                  className="bg-muted/50 border-border focus:border-primary/50"
                />
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Products</Label>
                {items.map((item, idx) => {
                  const product = state.products.find(p => p.id === item.productId);
                  const isOverStock = product && item.quantity > product.stockOnHand;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex gap-2 items-start">
                        <Select
                          value={item.productId}
                          onValueChange={v => updateItem(idx, 'productId', v)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border flex-1 text-xs h-8">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {state.products.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.stockOnHand})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                          min="1"
                          className={cn(
                            'bg-muted/50 border-border w-16 h-8 text-xs text-center',
                            isOverStock && 'border-red-500/50'
                          )}
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {isOverStock && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Only {product?.stockOnHand} in stock
                        </p>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add product
                </button>
              </div>

              {stockWarnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">
                    Some items exceed available stock. Order can be created but cannot be shipped until stock is replenished.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Create Order
              </Button>
            </form>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {filterStatus === 'All' ? 'All Orders' : `${filterStatus} Orders`} ({filteredOrders.length})
            </h2>
            {filterStatus !== 'All' && (
              <button
                onClick={() => setFilterStatus('All')}
                className="text-xs text-primary hover:text-primary/80"
              >
                Clear filter
              </button>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="tc-card text-center py-12">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {filterStatus === 'All' ? 'No orders yet.' : `No ${filterStatus.toLowerCase()} orders.`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order, i) => {
              const statusCfg = STATUS_CONFIG[order.status];
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="tc-card card-enter"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                            {order.customerName}
                          </h3>
                          <span className={cn(
                            'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
                            statusCfg.color
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                          {formatDateTime(order.createdAt)} ·{' '}
                          <span className="font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusCfg.next && (
                        <Button
                          size="sm"
                          className={cn(
                            'h-7 text-xs',
                            statusCfg.next === 'Shipped'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          )}
                          onClick={() => handleStatusUpdate(order.id, statusCfg.next!)}
                        >
                          {statusCfg.next === 'Shipped' && <Truck className="w-3 h-3 mr-1" />}
                          {statusCfg.nextLabel}
                        </Button>
                      )}
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { dispatch({ type: 'DELETE_ORDER', payload: order.id }); toast.success('Order removed'); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {order.items.map(item => {
                        const product = state.products.find(p => p.id === item.productId);
                        const isOverStock = product && item.quantity > product.stockOnHand;
                        return (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-foreground">{product?.name ?? 'Unknown'}</span>
                              {isOverStock && (
                                <span className="tc-badge-low-stock text-xs">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Insufficient stock
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-muted-foreground">×{item.quantity}</span>
                          </div>
                        );
                      })}
                      {order.status === 'Shipped' && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                          <CheckCircle className="w-3 h-3" />
                          Stock deducted automatically on shipment
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
