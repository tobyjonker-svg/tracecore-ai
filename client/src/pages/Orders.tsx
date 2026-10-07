import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { ShoppingCart, Package, CheckCircle, Clock, Truck, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Clock },
};

export default function Orders() {
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState('all');

  const { data: orders = [], isLoading, refetch } = trpc.orders.list.useQuery();
  const updateMutation = trpc.orders.update.useMutation({
    onSuccess: () => { utils.orders.list.invalidate(); toast.success('Order updated'); },
    onError: (e) => toast.error(e.message),
  });
  const pullMutation = trpc.woocommerce.pullOrdersFromWooCommerce.useMutation({
    onSuccess: (data: any) => {
      utils.orders.list.invalidate();
      toast.success('Synced ' + (data.imported || 0) + ' new orders from WooCommerce');
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = filter === 'all'
    ? (orders as any[])
    : (orders as any[]).filter((o: any) => o.status === filter);

  const counts = {
    all: (orders as any[]).length,
    pending: (orders as any[]).filter((o: any) => o.status === 'pending').length,
    processing: (orders as any[]).filter((o: any) => o.status === 'processing').length,
    shipped: (orders as any[]).filter((o: any) => o.status === 'shipped').length,
    delivered: (orders as any[]).filter((o: any) => o.status === 'delivered').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Customer orders from MycoAlchemy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" />Refresh
          </Button>
          <Button size="sm" onClick={() => pullMutation.mutate()} disabled={pullMutation.isPending}>
            <RefreshCw className={cn("w-4 h-4 mr-1", pullMutation.isPending && "animate-spin")} />
            Sync WooCommerce
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All (' + counts.all + ')' },
          { key: 'pending', label: 'Pending (' + counts.pending + ')' },
          { key: 'processing', label: 'Processing (' + counts.processing + ')' },
          { key: 'shipped', label: 'Shipped (' + counts.shipped + ')' },
          { key: 'delivered', label: 'Delivered (' + counts.delivered + ')' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => pullMutation.mutate()}>
              Sync from WooCommerce
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => {
            const sc = statusConfig[order.status] || statusConfig.pending;
            const Icon = sc.icon;
            return (
              <Card key={order.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">#{order.orderNumber}</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1', sc.color)}>
                          <Icon className="w-3 h-3" />{sc.label}
                        </span>
                        
                        <a href={'https://mycoalchemy.co.za/wp-admin/post.php?post=' + order.orderNumber + '&action=edit'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          WooCommerce <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {order.quantity} &nbsp;·&nbsp; Total: <strong>R{Number(order.totalPrice).toFixed(2)}</strong>
                      </p>
                      {order.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {order.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: order.id, status: 'processing' })}>
                          <Package className="w-3 h-3 mr-1" />Process
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: order.id, status: 'shipped' })}>
                          <Truck className="w-3 h-3 mr-1" />Ship
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: order.id, status: 'delivered' })}>
                          <CheckCircle className="w-3 h-3 mr-1" />Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
