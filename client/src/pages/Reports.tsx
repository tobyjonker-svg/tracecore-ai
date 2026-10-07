import { formatCurrency } from '@/lib/currency';
import { trpc } from '@/lib/trpc';
import { TrendingUp, ShoppingCart, Package, Factory, Users, ArrowRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

export default function Reports() {
  const [, navigate] = useLocation();
  const { data: orders = [] } = trpc.orders.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: runs = [] } = trpc.production.list.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();

  const totalRevenue = (orders as any[]).reduce((s: number, o: any) => s + parseFloat(o.totalPrice || 0), 0);
  const delivered = (orders as any[]).filter((o: any) => o.status === 'delivered');
  const avgOrder = totalRevenue / Math.max((orders as any[]).length, 1);
  const totalUnits = (runs as any[]).reduce((s: number, r: any) => s + (r.quantity || 0), 0);
  const approvedRuns = (runs as any[]).filter((r: any) => r.status === 'approved' || r.status === 'completed');
  const lowStock = (products as any[]).filter((p: any) => (p.currentStock || 0) <= (p.lowStockThreshold || 10));
  const lowInputs = (inputs as any[]).filter((i: any) => (i.currentStock || 0) <= (i.lowStockThreshold || 5));
  const totalStockValue = (products as any[]).reduce((s: number, p: any) => s + ((p.currentStock || 0) * parseFloat(p.sellingPrice || 0)), 0);

  const ordersByStatus = [
    { label: 'Pending', count: (orders as any[]).filter((o: any) => o.status === 'pending').length, color: 'bg-yellow-400' },
    { label: 'Processing', count: (orders as any[]).filter((o: any) => o.status === 'processing').length, color: 'bg-blue-400' },
    { label: 'Shipped', count: (orders as any[]).filter((o: any) => o.status === 'shipped').length, color: 'bg-purple-400' },
    { label: 'Delivered', count: (orders as any[]).filter((o: any) => o.status === 'delivered').length, color: 'bg-green-400' },
  ];
  const maxOrderCount = Math.max(...ordersByStatus.map(s => s.count), 1);

  const productStock = (products as any[]).map((p: any) => ({
    name: p.name,
    stock: p.currentStock || 0,
    threshold: p.lowStockThreshold || 10,
    value: (p.currentStock || 0) * parseFloat(p.sellingPrice || 0),
    isLow: (p.currentStock || 0) <= (p.lowStockThreshold || 10),
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Business performance overview</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue, user), sub: `${(orders as any[]).length} orders`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Avg Order Value', value: formatCurrency(avgOrder, user), sub: `${delivered.length} delivered`, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Units Produced', value: totalUnits, sub: `${approvedRuns.length} completed runs`, icon: Factory, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Stock Value', value: formatCurrency(totalStockValue, user), sub: `${(products as any[]).length} products`, icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", c.bg)}>
              <c.icon className={cn("w-4 h-4", c.color)} />
            </div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            <p className="text-xs text-muted-foreground/60">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orders by status */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">Orders by Status</h3>
          {(orders as any[]).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {ordersByStatus.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", s.color)}
                      style={{ width: `${(s.count / maxOrderCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product stock levels */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">Product Stock Levels</h3>
          {productStock.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No products yet</p>
          ) : (
            <div className="space-y-3">
              {productStock.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={cn("truncate max-w-[180px]", p.isLow ? 'text-red-400' : 'text-muted-foreground')}>{p.name}</span>
                    <span className="font-medium">{p.stock} units</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", p.isLow ? 'bg-red-400' : 'bg-green-400')}
                      style={{ width: `${Math.min(100, (p.stock / Math.max(p.stock, p.threshold)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Production summary */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">Production Summary</h3>
          {(runs as any[]).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No production runs yet</p>
          ) : (
            <div className="space-y-2">
              {[
                { label: 'Total Runs', value: (runs as any[]).length },
                { label: 'Completed / Approved', value: approvedRuns.length },
                { label: 'In Progress', value: (runs as any[]).filter((r: any) => r.status === 'in_progress').length },
                { label: 'Planned', value: (runs as any[]).filter((r: any) => r.status === 'planned').length },
                { label: 'Total Units Produced', value: totalUnits },
              ].map((s, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts summary */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-4">Stock Alerts</h3>
          {lowStock.length === 0 && lowInputs.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs text-green-400 font-medium">All stock levels healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.currentStock} {p.unit} remaining</p>
                  </div>
                </div>
              ))}
              {lowInputs.map((i: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.currentStock} {i.unit} remaining</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Operation stats */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-4">Operation Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {[
            { label: 'Suppliers', value: (suppliers as any[]).length },
            { label: 'Raw Inputs', value: (inputs as any[]).length },
            { label: 'Products', value: (products as any[]).length },
            { label: 'Low Stock Items', value: lowStock.length + lowInputs.length },
            { label: 'Total Orders', value: (orders as any[]).length },
          ].map((s, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
