/**
 * TraceCore AI — Dashboard Layout
 * Design: Soft-Dark Enterprise
 * - 240px fixed sidebar, top header bar, scrollable main content
 * - Sidebar: rounded pill active states, indigo accent
 * - Header: workspace switcher, breadcrumb, user avatar
 */

import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Truck,
  FlaskConical,
  Package,
  ShoppingCart,
  Factory,
  Activity,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/inputs', label: 'Inputs', icon: FlaskConical },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/production', label: 'Production Runs', icon: Factory },
  { href: '/inventory', label: 'Inventory Activity', icon: Activity },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { state } = useApp();

  const lowStockCount = state.products.filter(
    p => p.stockOnHand <= p.lowStockThreshold
  ).length;

  const pendingOrders = state.orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="flex flex-col w-60 shrink-0 border-r border-border"
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663448206084/JqzfJcQaypCLFt4Ngi48YW/tracecore-logo-mark-QVLR8hoY73SbDxsybutWod.webp"
              alt="TraceCore AI"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground font-['Plus_Jakarta_Sans']">
              TraceCore AI
            </p>
            <p className="text-xs text-muted-foreground truncate">{state.workspace.name}</p>
          </div>
        </div>

        {/* Workspace Badge */}
        <div className="px-4 py-3">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground truncate">
                {state.workspace.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/'
              ? location === '/'
              : location.startsWith(href);

            return (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer group',
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span className="truncate">{label}</span>
                  {label === 'Orders' && pendingOrders > 0 && (
                    <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      {pendingOrders}
                    </span>
                  )}
                  {label === 'Products' && lowStockCount > 0 && (
                    <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                      {lowStockCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Teaser */}
        <div className="p-3 border-t border-border">
          <Link href="/ai-assistant">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Operations co-pilot</p>
              </div>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-violet-500/60 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">MA</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">MycoAlchemy Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@mycoalchemy.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Area ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">
              {NAV_ITEMS.find(n =>
                n.href === '/' ? location === '/' : location.startsWith(n.href)
              )?.label ?? 'TraceCore AI'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Low stock alert */}
            {lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot" />
                <span className="text-xs text-red-400 font-medium">
                  {lowStockCount} low stock
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {(lowStockCount > 0 || pendingOrders > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            {/* Business type badge */}
            <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-xs text-primary font-medium">
                {state.workspace.businessType}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
