import { formatCurrency } from '@/lib/currency';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { ShoppingCart, Package, AlertCircle, TrendingUp, Factory, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

export function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: productionRuns = [], isLoading: runsLoading } = trpc.production.list.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();

  const totalRevenue = (orders as any[]).reduce((s: number, o: any) => s + parseFloat(o.totalPrice || 0), 0);
  const pendingOrders = (orders as any[]).filter((o: any) => o.status === 'pending' || o.status === 'processing');
  const lowStock = (products as any[]).filter((p: any) => (p.currentStock || 0) <= (p.lowStockThreshold || 10));
  const lowInputs = (inputs as any[]).filter((i: any) => (i.currentStock || 0) <= (i.lowStockThreshold || 5));
  const activeRuns = (productionRuns as any[]).filter((r: any) => r.status === 'in_progress' || r.status === 'planned');
  const totalStock = (products as any[]).reduce((s: number, p: any) => s + (p.currentStock || 0), 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue, user),
      sub: `${(orders as any[]).length} orders total`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      href: '/orders',
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.length,
      sub: pendingOrders.length === 0 ? 'All clear' : 'Need attention',
      icon: ShoppingCart,
      color: pendingOrders.length > 0 ? 'text-yellow-400' : 'text-green-400',
      bg: pendingOrders.length > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10',
      href: '/orders',
    },
    {
      label: 'Products in Stock',
      value: totalStock,
      sub: `${(products as any[]).length} products tracked`,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      href: '/products',
    },
    {
      label: 'Active Production',
      value: activeRuns.length,
      sub: activeRuns.length === 0 ? 'No active runs' : 'Runs in progress',
      icon: Factory,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      href: '/production',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening in your operation today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((c, i) => (
          <button key={i} onClick={() => navigate(c.href)}
            className="text-left bg-card border border-border rounded-xl p-4 hover:border-border/80 hover:bg-muted/30 transition-all group">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", c.bg)}>
              <c.icon className={cn("w-4 h-4", c.color)} />
            </div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            <p className="text-xs text-muted-foreground/60">{c.sub}</p>
          </button>
        ))}
      </div>

      {/* Alerts row */}
      {(lowStock.length > 0 || lowInputs.length > 0) && (
        <div className="space-y-2">
          {lowStock.length > 0 && (
            <button onClick={() => navigate('/products')}
              className="w-full flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 text-left hover:bg-red-500/10 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">Low product stock</p>
                  <p className="text-xs text-muted-foreground">
                    {lowStock.map((p: any) => `${p.name} (${p.currentStock} ${p.unit})`).join(' · ')}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {lowInputs.length > 0 && (
            <button onClick={() => navigate('/inputs')}
              className="w-full flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 text-left hover:bg-yellow-500/10 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Low raw material stock</p>
                  <p className="text-xs text-muted-foreground">
                    {lowInputs.map((i: any) => `${i.name} (${i.currentStock} ${i.unit})`).join(' · ')}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Two column bottom section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent orders */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {ordersLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : (orders as any[]).length === 0 ? (
            <div className="text-center py-6">
              <ShoppingCart className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No orders yet</p>
              <button onClick={() => navigate('/orders')} className="text-xs text-primary mt-1 hover:underline">Sync from WooCommerce</button>
            </div>
          ) : (
            <div className="space-y-2">
              {(orders as any[]).slice(0, 4).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">#{o.orderNumber} — {o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(Number(o.totalPrice), user)}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                    o.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                    o.status === 'shipped' ? 'bg-purple-500/10 text-purple-400' :
                    o.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  )}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products stock */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Product Stock</h3>
            <button onClick={() => navigate('/products')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {productsLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : (products as any[]).length === 0 ? (
            <div className="text-center py-6">
              <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No products yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(products as any[]).slice(0, 5).map((p: any) => {
                const pct = Math.min(100, Math.max(0, ((p.currentStock || 0) / Math.max(p.currentStock || 1, p.lowStockThreshold || 10)) * 100));
                const isLow = (p.currentStock || 0) <= (p.lowStockThreshold || 10);
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate max-w-[180px]">{p.name}</span>
                      <span className={cn("font-medium", isLow ? 'text-red-400' : 'text-muted-foreground')}>
                        {p.currentStock || 0} {p.unit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", isLow ? 'bg-red-400' : 'bg-green-400')}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active production runs */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Production Runs</h3>
            <button onClick={() => navigate('/production')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {runsLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : (productionRuns as any[]).length === 0 ? (
            <div className="text-center py-6">
              <Factory className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No production runs yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(productionRuns as any[]).slice(0, 4).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.runNumber}</p>
                    <p className="text-xs text-muted-foreground">Qty: {r.quantity}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                    r.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                    r.status === 'completed' || r.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    r.status === 'quality_check' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-muted text-muted-foreground'
                  )}>{r.status?.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3">Operation Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Suppliers', value: (suppliers as any[]).length, href: '/suppliers', icon: Users },
              { label: 'Raw Inputs Tracked', value: (inputs as any[]).length, href: '/inputs', icon: Package },
              { label: 'Avg Order Value', value: formatCurrency(totalRevenue / Math.max((orders as any[]).length, 1), user), href: '/orders', icon: TrendingUp },
              { label: 'Delivered Orders', value: (orders as any[]).filter((o: any) => o.status === 'delivered').length, href: '/orders', icon: ShoppingCart },
            ].map((s, i) => (
              <button key={i} onClick={() => navigate(s.href)}
                className="w-full flex items-center justify-between py-1.5 border-b border-border last:border-0 hover:text-primary transition-colors">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="text-sm font-semibold">{s.value}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
