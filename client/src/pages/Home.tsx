/**
 * TraceCore AI — Home Dashboard
 * Design: Soft-Dark Enterprise
 * - KPI cards with animated counters
 * - Activity feed
 * - Mini charts (recharts)
 * - Workflow overview banner
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDateTime, timeAgo } from '@/lib/store';
import { useAuth } from '@/_core/hooks/useAuth';
import { OnboardingTour } from '@/components/OnboardingTour';
import { WorkflowCustomizer } from '@/components/WorkflowCustomizer';
import { DASHBOARD_TOUR_STEPS, getOnboardingState, markTourComplete } from '@/lib/onboarding';
import {
  Package,
  FlaskConical,
  ShoppingCart,
  AlertTriangle,
  Factory,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Truck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

// Mock chart data - will be replaced with real data
const getProductionChartData = (products: any[]) => {
  const hasData = products.length > 0;
  if (!hasData) {
    return [
      { day: 'Mon', units: 0 },
      { day: 'Tue', units: 0 },
      { day: 'Wed', units: 0 },
      { day: 'Thu', units: 0 },
      { day: 'Fri', units: 0 },
      { day: 'Sat', units: 0 },
      { day: 'Sun', units: 0 },
    ];
  }
  return [
    { day: 'Mon', units: 15 },
    { day: 'Tue', units: 28 },
    { day: 'Wed', units: 20 },
    { day: 'Thu', units: 35 },
    { day: 'Fri', units: 42 },
    { day: 'Sat', units: 18 },
    { day: 'Sun', units: 30 },
  ];
};

const getOrdersChartData = (orders: any[]) => {
  const hasData = orders.length > 0;
  if (!hasData) {
    return [
      { week: 'W1', orders: 0 },
      { week: 'W2', orders: 0 },
      { week: 'W3', orders: 0 },
      { week: 'W4', orders: 0 },
      { week: 'W5', orders: 0 },
      { week: 'W6', orders: 0 },
    ];
  }
  return [
    { week: 'W1', orders: 4 },
    { week: 'W2', orders: 7 },
    { week: 'W3', orders: 5 },
    { week: 'W4', orders: 9 },
    { week: 'W5', orders: 12 },
    { week: 'W6', orders: 8 },
  ];
};

const stockTrendData = [
  { month: 'Oct', stock: 120 },
  { month: 'Nov', stock: 98 },
  { month: 'Dec', stock: 145 },
  { month: 'Jan', stock: 132 },
  { month: 'Feb', stock: 110 },
  { month: 'Mar', stock: 123 },
];

function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  trendLabel,
  href,
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  href?: string;
  delay?: number;
}) {
  const content = (
    <div
      className="tc-card-hover relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'text-emerald-400 bg-emerald-500/10',
              trend === 'down' && 'text-red-400 bg-red-500/10',
              trend === 'neutral' && 'text-muted-foreground bg-muted'
            )}
          >
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {trendLabel}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-foreground font-['Plus_Jakarta_Sans'] mb-1">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {href && (
        <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground/40" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { state } = useApp();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const onboardingState = getOnboardingState();

  const totalProducts = state.products.length;
  const totalInputs = state.inputs.length;
  const pendingOrders = state.orders.filter(o => o.status === 'Pending').length;
  const lowStockProducts = state.products.filter(p => p.stockOnHand <= p.lowStockThreshold);
  const todayRuns = state.productionRuns.filter(r => {
    const d = new Date(r.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const recentActivity = [...state.inventoryActivity]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const recentOrders = [...state.orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 page-enter">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">
            Good morning, {state.workspace.name} 👋
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs md:text-sm">
            Here's what's happening in your operations today.
          </p>
          {!onboardingState.hasCompletedTour && (
            <button
              onClick={() => setIsTourOpen(true)}
              className="mt-3 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Take a guided tour
            </button>
          )}
        </div>
        <div className="text-right text-xs md:text-sm">
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-primary font-medium mt-0.5">
            {state.workspace.businessType}
          </p>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <KpiCard
          label="Total Products"
          value={totalProducts}
          icon={Package}
          iconColor="text-primary"
          iconBg="bg-primary/15"
          trend="up"
          trendLabel="+2 this month"
          href="/products"
          delay={0}
        />
        <KpiCard
          label="Raw Inputs"
          value={totalInputs}
          icon={FlaskConical}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/15"
          trend="neutral"
          trendLabel="Stable"
          href="/inputs"
          delay={50}
        />
        <KpiCard
          label="Pending Orders"
          value={pendingOrders}
          icon={ShoppingCart}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/15"
          trend={pendingOrders > 0 ? 'up' : 'neutral'}
          trendLabel={pendingOrders > 0 ? 'Needs action' : 'All clear'}
          href="/orders"
          delay={100}
        />
        <KpiCard
          label="Low Stock Warnings"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          iconColor={lowStockProducts.length > 0 ? 'text-red-400' : 'text-emerald-400'}
          iconBg={lowStockProducts.length > 0 ? 'bg-red-500/15' : 'bg-emerald-500/15'}
          trend={lowStockProducts.length > 0 ? 'down' : 'up'}
          trendLabel={lowStockProducts.length > 0 ? 'Restock needed' : 'All stocked'}
          href="/products"
          delay={150}
        />
        <KpiCard
          label="Production Today"
          value={todayRuns}
          icon={Factory}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15"
          trend="up"
          trendLabel="Active"
          href="/production"
          delay={200}
        />
      </div>

      {/* ── Low Stock Alert Banner ─────────────────────────────── */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">
            <span className="font-semibold">Low stock alert:</span>{' '}
            {lowStockProducts.map(p => p.name).join(', ')} —{' '}
            consider scheduling a production run.
          </p>
          <a href="/products" className="text-xs text-red-400 hover:text-red-300 font-medium underline underline-offset-2 cursor-pointer">
            View Products
          </a>
        </div>
      )}

      {/* ── Charts Row ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Production Volume Chart */}
        <div className="tc-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
                Production Volume
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Units produced this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +18% vs last week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={getProductionChartData(state.productionRuns)}>
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.18 265)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 265)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'oklch(0.165 0.009 265)',
                  border: '1px solid oklch(1 0 0 / 9%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'oklch(0.92 0.005 265)',
                }}
                cursor={{ stroke: 'oklch(0.65 0.18 265)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="units"
                stroke="oklch(0.65 0.18 265)"
                strokeWidth={2}
                fill="url(#prodGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="tc-card">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
              Orders Trend
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Last 6 weeks</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={getOrdersChartData(state.orders)} barSize={18}>
              <XAxis
                dataKey="week"
                tick={{ fill: 'oklch(0.58 0.012 265)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'oklch(0.165 0.009 265)',
                  border: '1px solid oklch(1 0 0 / 9%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'oklch(0.92 0.005 265)',
                }}
                cursor={{ fill: 'oklch(1 0 0 / 5%)' }}
              />
              <Bar dataKey="orders" fill="oklch(0.65 0.18 265)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Activity + Orders ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Activity Feed */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
              Inventory Activity
            </h3>
            <a href="/inventory" className="text-xs text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    activity.changeAmount > 0
                      ? 'bg-emerald-500/15'
                      : 'bg-red-500/15'
                  )}
                >
                  {activity.changeAmount > 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    <span
                      className={cn(
                        'font-semibold font-mono text-xs mr-1',
                        activity.changeAmount > 0 ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {activity.changeAmount > 0 ? '+' : ''}{activity.changeAmount}
                    </span>
                    {activity.itemName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.actionType} · {timeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="tc-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
              Recent Orders
            </h3>
            <a href="/orders" className="text-xs text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => {
              const statusColor =
                order.status === 'Shipped'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : order.status === 'Packed'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-blue-400 bg-blue-500/10 border-blue-500/20';

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                        {timeAgo(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border shrink-0',
                      statusColor
                    )}
                  >
                    {order.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Workflow Banner ────────────────────────────────────── */}
      <div className="tc-card overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
              Core Operations Workflow
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your {state.workspace.businessType} workflow</p>
          </div>
          <button onClick={() => setIsCustomizerOpen(true)} className="text-xs text-primary hover:text-primary/80 font-medium">
            Customize
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.workspace.enableInputs && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <FlaskConical className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Raw Materials</span>
            </div>
          )}
          {state.workspace.enableProductionRuns && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Factory className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-400 font-medium">Production</span>
            </div>
          )}
          {state.workspace.enableOrders && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Orders</span>
            </div>
          )}
          {state.workspace.enableShipping && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Shipping</span>
            </div>
          )}
          {!state.workspace.enableInputs && !state.workspace.enableProductionRuns && !state.workspace.enableOrders && !state.workspace.enableShipping && (
            <p className="text-sm text-muted-foreground italic">No workflow stages configured. Go to Settings to customize.</p>
          )}
        </div>
      </div>

      {/* ── Stock Overview ─────────────────────────────────────── */}
      <div className="tc-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
            Product Stock Overview
          </h3>
          <a href="/products" className="text-xs text-primary hover:text-primary/80 cursor-pointer flex items-center gap-1">
            Manage <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-3">
          {state.products.map(product => {
            const pct = Math.min(100, (product.stockOnHand / Math.max(product.lowStockThreshold * 3, 1)) * 100);
            const isLow = product.stockOnHand <= product.lowStockThreshold;
            return (
              <div key={product.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{product.name}</span>
                  <div className="flex items-center gap-2">
                    {isLow && (
                      <span className="tc-badge-low-stock">LOW STOCK</span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      {product.stockOnHand} units
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isLow ? 'bg-red-400' : 'bg-primary'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Suppliers Quick View ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {state.suppliers.slice(0, 4).map(supplier => {
          const inputCount = state.inputs.filter(i => i.supplierId === supplier.id).length;
          return (
            <div key={supplier.id} className="tc-card-hover">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center mb-3">
                <Truck className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-sm font-medium text-foreground leading-snug">{supplier.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {inputCount} input{inputCount !== 1 ? 's' : ''} sourced
              </p>
            </div>
          );
        })}
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        open={isTourOpen}
        onOpenChange={setIsTourOpen}
      />
      <WorkflowCustomizer open={isCustomizerOpen} onOpenChange={setIsCustomizerOpen} />
    </div>
  );
}
