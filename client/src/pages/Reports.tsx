/**
 * TraceCore AI — Reports Page
 * Design: Soft-Dark Enterprise
 * - Analytics charts: production, orders, stock trends
 * - Profit margin and forecasting placeholders
 */

import { useApp } from '@/contexts/AppContext';
import { BarChart3, TrendingUp, DollarSign, Zap, Lock } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';

const productionData = [
  { month: 'Oct', units: 85, runs: 4 },
  { month: 'Nov', units: 120, runs: 6 },
  { month: 'Dec', units: 95, runs: 5 },
  { month: 'Jan', units: 148, runs: 7 },
  { month: 'Feb', units: 132, runs: 6 },
  { month: 'Mar', units: 165, runs: 8 },
];

const revenueData = [
  { month: 'Oct', revenue: 4200, cost: 1800 },
  { month: 'Nov', revenue: 5800, cost: 2200 },
  { month: 'Dec', revenue: 4900, cost: 2000 },
  { month: 'Jan', revenue: 7200, cost: 2600 },
  { month: 'Feb', revenue: 6800, cost: 2400 },
  { month: 'Mar', revenue: 8100, cost: 2900 },
];

const forecastData = [
  { month: 'Apr', actual: null, forecast: 185 },
  { month: 'May', actual: null, forecast: 210 },
  { month: 'Jun', actual: null, forecast: 195 },
];

const allData = [...productionData.map(d => ({ ...d, forecast: null })), ...forecastData];

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

  const productDistribution = state.products.map(p => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name,
    value: p.stockOnHand,
  }));

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalCost = revenueData.reduce((s, d) => s + d.cost, 0);
  const margin = Math.round(((totalRevenue - totalCost) / totalRevenue) * 100);

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
          { label: 'Total Revenue (6mo)', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'Avg Profit Margin', value: `${margin}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/15' },
          { label: 'Units Produced (6mo)', value: productionData.reduce((s, d) => s + d.units, 0), icon: BarChart3, color: 'text-violet-400', bg: 'bg-violet-500/15' },
          { label: 'Production Runs', value: productionData.reduce((s, d) => s + d.runs, 0), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/15' },
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
          <p className="text-xs text-muted-foreground mb-4">Units produced per month + 3-month forecast</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={allData}>
              <defs>
                <linearGradient id="unitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.18 265)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 265)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.72 0.15 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="month" tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="units" stroke="oklch(0.65 0.18 265)" strokeWidth={2} fill="url(#unitsGrad)" name="Actual" />
              <Area type="monotone" dataKey="forecast" stroke="oklch(0.72 0.15 200)" strokeWidth={2} strokeDasharray="5 5" fill="url(#forecastGrad)" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue vs Cost */}
        <div className="tc-card">
          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] mb-1">Revenue vs Cost</h3>
          <p className="text-xs text-muted-foreground mb-4">6-month financial overview (simulated)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="month" tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'oklch(0.58 0.012 265)' }} />
              <Bar dataKey="revenue" fill="oklch(0.65 0.18 265)" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="cost" fill="oklch(0.72 0.15 200)" radius={[4, 4, 0, 0]} name="Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Stock Distribution */}
        <div className="tc-card">
          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] mb-1">Current Stock Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Units on hand per product</p>
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
              <div className="h-2 rounded-full bg-muted w-2/3" />
              <div className="h-24 rounded-xl bg-muted/50 flex items-center justify-center">
                <Lock className="w-6 h-6 text-muted-foreground/40" />
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/8 border border-primary/20">
              <p className="text-xs text-primary">
                Upgrade to TraceCore AI Pro to unlock demand forecasting, profit margin analysis, and automated reorder suggestions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Margin Trend */}
      <div className="tc-card">
        <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans'] mb-1">Profit Margin Trend</h3>
        <p className="text-xs text-muted-foreground mb-4">Monthly gross margin % (simulated)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={revenueData.map(d => ({
            month: d.month,
            margin: Math.round(((d.revenue - d.cost) / d.revenue) * 100),
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
            <XAxis dataKey="month" tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[50, 80]} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
            <Line
              type="monotone"
              dataKey="margin"
              stroke="oklch(0.68 0.16 145)"
              strokeWidth={2.5}
              dot={{ fill: 'oklch(0.68 0.16 145)', r: 4 }}
              name="Margin %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
