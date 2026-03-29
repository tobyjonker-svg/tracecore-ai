import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, Star, Truck, AlertCircle, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function SupplierPerformance() {
  const { data: suppliers, isLoading: suppliersLoading } = trpc.suppliers.list.useQuery();
  const { data: allPerformance, isLoading: performanceLoading } = trpc.suppliers.getAllPerformance.useQuery();
  const { data: pricingHistory } = trpc.suppliers.getPricingHistory.useQuery({});

  // Calculate performance statistics
  const stats = useMemo(() => {
    if (!allPerformance) return { avgOnTimeDelivery: 0, avgRating: 0, totalOrders: 0, qualityIssues: 0 };

    let totalOnTime = 0;
    let totalRating = 0;
    let totalOrders = 0;
    let totalQualityIssues = 0;

    allPerformance.forEach((perf) => {
      totalOnTime += perf.onTimeDeliveries || 0;
      totalRating += parseFloat(perf.averageRating?.toString() || "0");
      totalOrders += perf.totalOrders || 0;
      totalQualityIssues += perf.qualityIssues || 0;
    });

    const count = allPerformance.length || 1;
    return {
      avgOnTimeDelivery: count > 0 ? Math.round((totalOnTime / totalOrders) * 100) : 0,
      avgRating: (totalRating / count).toFixed(2),
      totalOrders,
      qualityIssues: totalQualityIssues,
    };
  }, [allPerformance]);

  // Prepare data for on-time delivery chart
  const onTimeDeliveryData = useMemo(() => {
    if (!suppliers || !allPerformance) return [];

    return suppliers.map((supplier) => {
      const perf = allPerformance.find((p) => p.supplierId === supplier.id);
      const totalOrders = perf?.totalOrders || 0;
      const onTimePercent =
        perf && totalOrders > 0 ? Math.round(((perf.onTimeDeliveries || 0) / totalOrders) * 100) : 0;

      return {
        name: supplier.name,
        onTime: onTimePercent,
        late: 100 - onTimePercent,
      };
    });
  }, [suppliers, allPerformance]);

  // Prepare data for supplier ratings
  const ratingsData = useMemo(() => {
    if (!suppliers || !allPerformance) return [];

    return suppliers.map((supplier) => {
      const perf = allPerformance.find((p) => p.supplierId === supplier.id);
      return {
        name: supplier.name,
        rating: parseFloat(perf?.averageRating?.toString() || "0"),
      };
    });
  }, [suppliers, allPerformance]);

  // Prepare data for quality issues
  const qualityData = useMemo(() => {
    if (!suppliers || !allPerformance) return [];

    return suppliers.map((supplier) => {
      const perf = allPerformance.find((p) => p.supplierId === supplier.id);
      return {
        name: supplier.name,
        issues: perf?.qualityIssues || 0,
      };
    });
  }, [suppliers, allPerformance]);

  // Prepare data for pricing trends
  const pricingTrendData = useMemo(() => {
    if (!pricingHistory) return [];

    // Group by input and get average prices over time
    const grouped: any = {};
    pricingHistory.forEach((item: any) => {
      if (!grouped[item.inputId]) {
        grouped[item.inputId] = [];
      }
      grouped[item.inputId].push({
        date: new Date(item.effectiveDate || item.createdAt).toLocaleDateString(),
        price: parseFloat(item.price.toString()),
      });
    });

    // Return first input's pricing trend
    const firstInputData = Object.values(grouped)[0] as any[];
    return firstInputData ? firstInputData.slice(-6) : [];
  }, [pricingHistory]);

  // Prepare supplier comparison data
  const comparisonData = useMemo(() => {
    if (!suppliers || !allPerformance) return [];

    return suppliers.map((supplier) => {
      const perf = allPerformance.find((p) => p.supplierId === supplier.id);
      const totalOrders = perf?.totalOrders || 0;
      const onTimePercent =
        perf && totalOrders > 0 ? Math.round(((perf.onTimeDeliveries || 0) / totalOrders) * 100) : 0;

      return {
        id: supplier.id,
        name: supplier.name,
        onTimeDelivery: onTimePercent,
        rating: parseFloat(perf?.averageRating?.toString() || "0"),
        qualityIssues: perf?.qualityIssues || 0,
        totalOrders: perf?.totalOrders || 0,
        totalSpent: parseFloat(perf?.totalSpent?.toString() || "0"),
      };
    });
  }, [suppliers, allPerformance]);

  const handleExportCSV = () => {
    if (!comparisonData) return;

    const headers = ["Supplier", "On-Time Delivery %", "Rating", "Quality Issues", "Total Orders", "Total Spent"];
    const rows = comparisonData.map((item) => [
      item.name,
      item.onTimeDelivery,
      item.rating,
      item.qualityIssues,
      item.totalOrders,
      `R${item.totalSpent.toFixed(2)}`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `supplier-performance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (suppliersLoading || performanceLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Supplier Performance</h1>
          <p className="text-muted-foreground mt-1">Track supplier metrics, ratings, and pricing trends</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg On-Time Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.avgOnTimeDelivery}%
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.avgRating}
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quality Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.qualityIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">Reported issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-Time Delivery Chart */}
        <Card>
          <CardHeader>
            <CardTitle>On-Time Delivery Rate</CardTitle>
            <CardDescription>Percentage of on-time deliveries per supplier</CardDescription>
          </CardHeader>
          <CardContent>
            {onTimeDeliveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={onTimeDeliveryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" stackId="a" fill="#10b981" name="On Time" />
                  <Bar dataKey="late" stackId="a" fill="#ef4444" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Supplier Ratings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Ratings</CardTitle>
            <CardDescription>Average rating per supplier (0-5)</CardDescription>
          </CardHeader>
          <CardContent>
            {ratingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Quality Issues Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Issues</CardTitle>
            <CardDescription>Number of reported quality issues per supplier</CardDescription>
          </CardHeader>
          <CardContent>
            {qualityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="issues" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Trends</CardTitle>
            <CardDescription>Average input pricing over time</CardDescription>
          </CardHeader>
          <CardContent>
            {pricingTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pricingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R${typeof value === 'number' ? value.toFixed(2) : value}`} />
                  <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No pricing data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Supplier Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Comparison</CardTitle>
          <CardDescription>Side-by-side supplier performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Supplier</th>
                    <th className="text-center py-3 px-4 font-medium">On-Time %</th>
                    <th className="text-center py-3 px-4 font-medium">Rating</th>
                    <th className="text-center py-3 px-4 font-medium">Quality Issues</th>
                    <th className="text-center py-3 px-4 font-medium">Total Orders</th>
                    <th className="text-right py-3 px-4 font-medium">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{supplier.name}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {supplier.onTimeDelivery}%
                          {supplier.onTimeDelivery >= 90 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {supplier.rating.toFixed(1)}
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {supplier.qualityIssues > 0 ? (
                          <div className="flex items-center justify-center gap-1 text-red-600">
                            {supplier.qualityIssues}
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">{supplier.totalOrders}</td>
                      <td className="py-3 px-4 text-right font-medium">R{supplier.totalSpent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No supplier data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
