import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsMVP() {
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: productionRuns = [], isLoading: productionLoading } = trpc.production.list.useQuery();

  const isLoading = ordersLoading || productsLoading || productionLoading;

  // Sales data
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + parseFloat(o.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalRevenue / (totalOrders || 1);

  // Inventory data
  const totalInventoryValue = products.reduce((sum: number, p: any) => sum + (p.currentStock * parseFloat(p.costPerUnit || 0)), 0);
  const lowStockCount = products.filter((p: any) => p.currentStock <= (p.lowStockThreshold || 10)).length;

  // Production data
  const completedProduction = productionRuns.filter((r: any) => r.status === 'completed').length;
  const totalProduced = productionRuns.reduce((sum: number, r: any) => sum + (r.quantity || 0), 0);

  // Chart data
  const revenueByMonth = [
    { month: 'Jan', revenue: 5000 },
    { month: 'Feb', revenue: 7200 },
    { month: 'Mar', revenue: totalRevenue },
  ];

  const exportCSV = (filename: string, data: any[]) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}`);
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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">Export data and view analytics</p>
      </div>

      {/* Sales Report */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
          <CardDescription>Revenue and order analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">R{totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">R{avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          <Button onClick={() => exportCSV('orders.csv', orders)} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Orders as CSV
          </Button>
        </CardContent>
      </Card>

      {/* Inventory Report */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Report</CardTitle>
          <CardDescription>Stock levels and inventory value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold">R{totalInventoryValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-500">{lowStockCount}</p>
            </div>
          </div>
          <Button onClick={() => exportCSV('products.csv', products)} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Products as CSV
          </Button>
        </CardContent>
      </Card>

      {/* Production Report */}
      <Card>
        <CardHeader>
          <CardTitle>Production Report</CardTitle>
          <CardDescription>Production runs and output</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Runs</p>
              <p className="text-2xl font-bold">{productionRuns.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedProduction}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Produced</p>
              <p className="text-2xl font-bold">{totalProduced}</p>
            </div>
          </div>
          <Button onClick={() => exportCSV('production.csv', productionRuns)} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Production Runs as CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
