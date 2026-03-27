/**
 * TraceCore AI — Reports Page
 * Design: Soft-Dark Enterprise
 * - Analytics charts: production, orders, stock trends
 * - All metrics calculated from actual app state
 */

import { useApp } from '@/contexts/AppContext';
import { BarChart3, TrendingUp, DollarSign, Zap, Lock } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';

const PRODUCT_COLORS = [
  'oklch(0.65 0.18 265)',
  'oklch(0.72 0.15 200)',
  'oklch(0.68 0.16 145)',
  'oklch(0.72 0.18 55)',
  'oklch(0.65 0.2 15)',
];

const tooltipStyle = {
  contentStyle: {
    background: 'oklch(0.165 0.009 265)',
    border: '1px solid oklch(1 0 0 / 9%)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'oklch(0.92 0.005 265)',
  },
};

export default function Reports() {
  const { state } = useApp();

  // Calculate metrics from actual app state
  const totalProductionRuns = state.productionRuns.length;
  const totalUnitsProduced = state.productionRuns.reduce((sum, run) => sum + run.quantity, 0);
  
  // Calculate revenue from shipped orders (assuming $50 per unit as placeholder)
  const totalRevenue = state.orders
    .filter(o => o.status === 'Shipped')
    .reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => itemSum + (item.quantity * 50), 0);
      return sum + orderTotal;
    }, 0);

  // Calculate cost (assuming 40% of revenue)
  const totalCost = totalRevenue * 0.4;
  const margin = totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0;

  // Product distribution from actual stock
  const productDistribution = state.products.map(p => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name,
    value: p.stockOnHand,
  }));

  // Generate monthly data from production runs
  const monthlyData: Record<string, { month: string; units: number; runs: number }> = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  months.forEach(month => {
    monthlyData[month] = { month, units: 0, runs: 0 };
  });

  state.productionRuns.forEach(run => {
    const date = new Date(run.createdAt);
    const month = months[date.getMonth()];
    if (monthlyData[month]) {
      monthlyData[month].units += run.quantity;
      monthlyData[month].runs += 1;
    }
  });

  const productionData = Object.values(monthlyData).filter(d => d.units > 0 || d.runs > 0);
  
  // If no data, show empty state
  const hasData = productionData.length > 0 || state.products.length > 0 || state.orders.length > 0;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 page-enter">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Analytics and insights for your manufacturing operations.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'Profit Margin', value: `${margin}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/15' },
          { label: 'Units Produced', value: totalUnitsProduced, icon: BarChart3, color: 'text-violet-400', bg: 'bg-violet-500/15' },
          { label: 'Production Runs', value: totalProductionRuns, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="tc-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Production Volume */}
        <div className="tc-card">
          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] mb-1">Production Volume</h3>
          <p className="text-xs text-muted-foreground mb-4">Units produced by month</p>
          {productionData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No production data yet. Add production runs to see charts.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="unitsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.18 265)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.18 265)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                <XAxis dataKey="month" tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="units" stroke="oklch(0.65 0.18 265)" strokeWidth={2} fill="url(#unitsGrad)" name="Units" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders Overview */}
        <div className="tc-card">
          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] mb-1">Orders Overview</h3>
          <p className="text-xs text-muted-foreground mb-4">Order status distribution</p>
          {state.orders.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No orders yet. Create orders to see analytics.
            </div>
          ) : (
            <div className="space-y-3">
              {['Pending', 'Packed', 'Shipped'].map(status => {
                const count = state.orders.filter(o => o.status === status).length;
                const percentage = state.orders.length > 0 ? Math.round((count / state.orders.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">{status}</span>
                      <span className="text-xs font-mono text-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Stock Distribution */}
        <div className="tc-card">
          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] mb-1">Current Stock Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Units on hand per product</p>
          {productDistribution.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
              No products yet. Add products to see distribution.
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {productDistribution.map((_, index) => (
                      <Cell key={index} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {productDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: PRODUCT_COLORS[i % PRODUCT_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                    <span className="text-xs font-mono text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Forecasting Placeholder */}
        <div className="tc-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">AI Demand Forecasting</h3>
              <span className="tc-badge-info">
                <Zap className="w-3 h-3" />
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              TraceCore AI will predict demand based on historical sales, seasonal trends, and supplier lead times.
            </p>
            <div className="space-y-3 opacity-60 pointer-events-none">
              <div className="h-2 rounded-full bg-muted w-3/4" />
              <div className="h-2 rounded-full bg-muted w-full" />
              <div className="h-2 rounded-full bg-muted w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
