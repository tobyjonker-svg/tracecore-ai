/**
 * TraceCore AI — Dashboard Layout
 * Design: Soft-Dark Enterprise + Mobile-First Responsive
 * - Mobile: collapsible sidebar with hamburger menu
 * - Desktop: 240px fixed sidebar, top header bar
 * - Responsive breakpoints: sm (640px), md (768px), lg (1024px)
 */

import { useState } from 'react';
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
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useApp();

  const lowStockCount = state.products.filter(
    p => p.stockOnHand <= p.lowStockThreshold
  ).length;

  const pendingOrders = state.orders.filter(o => o.status === 'Pending').length;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Mobile Overlay ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed md:relative flex flex-col w-60 shrink-0 border-r border-border h-screen transition-transform duration-300 z-40',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'var(--sidebar)' }}
      >
        {/* Logo + Close Button */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
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
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Badge */}
        <div className="px-4 py-3">
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center shrink-0">
                <Zap className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-medium text-sidebar-foreground truncate">
                {state.workspace.name}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'sidebar-active'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/30'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.label === 'Products' && lowStockCount > 0 && (
                    <span className="ml-auto text-xs font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full shrink-0">
                      {lowStockCount}
                    </span>
                  )}
                  {item.label === 'Orders' && pendingOrders > 0 && (
                    <span className="ml-auto text-xs font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full shrink-0">
                      {pendingOrders}
                    </span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant */}
        <Link href="/ai-assistant">
          <a
            onClick={closeSidebar}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 mx-3 mb-4 rounded-lg transition-all duration-200',
              location === '/ai-assistant'
                ? 'sidebar-active'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/30'
            )}
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">AI Assistant</p>
              <p className="text-xs text-muted-foreground">Operations co-pilot</p>
            </div>
          </a>
        </Link>

        {/* User Profile */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-bold text-sm text-primary">
              MA
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                MycoAlchemy Admin
              </p>
              <p className="text-xs text-muted-foreground truncate">admin@mycoalchemy.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-foreground">
                {state.workspace.businessType}
              </h1>
            </div>
          </div>

          {/* Right Side: Notifications + Alerts */}
          <div className="flex items-center gap-2 md:gap-4">
            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="text-xs md:text-sm font-semibold text-red-400">
                  {lowStockCount} low stock
                </span>
              </div>
            )}
            <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {pendingOrders > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
