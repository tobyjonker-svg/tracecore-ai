import { trpc } from '@/lib/trpc';
import { Activity, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InventoryActivity() {
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();
  const { data: runs = [] } = trpc.production.list.useQuery();
  const { data: orders = [] } = trpc.orders.list.useQuery();

  // Build activity feed from production runs and orders
  const activities: any[] = [];

  (runs as any[]).forEach((r: any) => {
    activities.push({
      id: 'run-' + r.id,
      type: 'production',
      icon: Package,
      color: r.status === 'approved' || r.status === 'completed' ? 'text-green-400' : 'text-blue-400',
      bg: r.status === 'approved' || r.status === 'completed' ? 'bg-green-500/10' : 'bg-blue-500/10',
      title: `Production Run ${r.runNumber}`,
      detail: `${r.quantity} units · ${r.status?.replace('_', ' ')}`,
      date: r.createdAt,
      direction: 'in',
    });
  });

  (orders as any[]).forEach((o: any) => {
    activities.push({
      id: 'order-' + o.id,
      type: 'order',
      icon: TrendingDown,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      title: `Order #${o.orderNumber} — ${o.customerName}`,
      detail: `R${Number(o.totalPrice).toFixed(2)} · ${o.status}`,
      date: o.createdAt,
      direction: 'out',
    });
  });

  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Inventory Activity</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Stock movements and inventory changes</p>
      </div>

      {/* Stock snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(products as any[]).map((p: any) => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1 truncate">{p.name}</p>
            <p className={cn("text-xl font-bold", (p.currentStock || 0) <= (p.lowStockThreshold || 10) ? 'text-red-400' : '')}>
              {p.currentStock || 0}
            </p>
            <p className="text-xs text-muted-foreground">{p.unit} in stock</p>
          </div>
        ))}
      </div>

      {/* Raw inputs snapshot */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3">Raw Material Levels</h3>
        <div className="space-y-2">
          {(inputs as any[]).map((i: any) => {
            const isLow = (i.currentStock || 0) <= (i.lowStockThreshold || 5);
            const pct = Math.min(100, ((i.currentStock || 0) / Math.max(i.currentStock || 1, i.lowStockThreshold || 5)) * 100);
            return (
              <div key={i.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={cn(isLow ? 'text-red-400' : 'text-muted-foreground')}>{i.name}</span>
                  <span className="font-medium">{i.currentStock} {i.unit}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", isLow ? 'bg-red-400' : 'bg-blue-400')}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-4">Recent Activity</h3>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">Activity will appear as you create production runs and process orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 20).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", a.bg)}>
                  <a.icon className={cn("w-4 h-4", a.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium",
                    a.direction === 'in' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                  )}>
                    {a.direction === 'in' ? '↑ IN' : '↓ OUT'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.date ? new Date(a.date).toLocaleDateString('en-ZA') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
