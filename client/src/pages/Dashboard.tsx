import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingCart, Package, AlertCircle, Loader2 } from 'lucide-react';

export function Dashboard() {
  // Fetch all data
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: productionRuns = [], isLoading: productionLoading } = trpc.production.list.useQuery();
  const { data: shipments = [], isLoading: shipmentsLoading } = trpc.shipments.list.useQuery();

  const isLoading = ordersLoading || productsLoading || productionLoading || shipmentsLoading;

  // Calculate KPIs
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  const lowStockItems = products.filter((p: any) => p.currentStock <= (p.lowStockThreshold || 10)).length;

  // Orders by status for chart
  const ordersByStatus = [
    { name: 'Pending', count: orders.filter((o: any) => o.status === 'pending').length },
    { name: 'Processing', count: orders.filter((o: any) => o.status === 'processing').length },
    { name: 'Shipped', count: orders.filter((o: any) => o.status === 'shipped').length },
    { name: 'Delivered', count: orders.filter((o: any) => o.status === 'delivered').length },
  ];

  // Production status for chart
  const productionByStatus = [
    { name: 'Planned', count: productionRuns.filter((r: any) => r.status === 'planned').length },
    { name: 'In Progress', count: productionRuns.filter((r: any) => r.status === 'in_progress').length },
    { name: 'Completed', count: productionRuns.filter((r: any) => r.status === 'completed').length },
  ];

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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your supply chain operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByStatus}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Production Runs by Status</CardTitle>
            <CardDescription>Distribution of production statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productionByStatus}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Production Runs</p>
              <p className="text-2xl font-bold">{productionRuns.filter((r: any) => r.status === 'in_progress').length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shipments In Transit</p>
              <p className="text-2xl font-bold">{shipments.filter((s: any) => s.status === 'in_transit').length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">${(totalRevenue / (totalOrders || 1)).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered Orders</p>
              <p className="text-2xl font-bold">{orders.filter((o: any) => o.status === 'delivered').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
