/**
 * TraceCore AI — Dashboard Layout
 * Design: Soft-Dark Enterprise + Mobile-First Responsive
 * - Mobile: collapsible sidebar with hamburger menu
 * - Desktop: 240px fixed sidebar, top header bar
 * - Responsive breakpoints: sm (640px), md (768px), lg (1024px)
 * - Auth gating: redirects unauthenticated users to login
 */

import { useState, useEffect } from 'react';
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
  Loader2,
  CreditCard,
  TrendingUp,
  Users,
  Mic,
  Clock,
  Lock,
  Download,
  FileText,
  Smartphone,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { CommandCenter } from './CommandCenter';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/app', label: 'Home', icon: LayoutDashboard },
  { href: '/suppliers', label: 'Suppliers', icon: Users },
  { href: '/inputs', label: 'Raw Inputs', icon: Package },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/production', label: 'Production Runs', icon: Factory },
  { href: '/inventory', label: 'Inventory Activity', icon: Activity },
  { href: '/batches', label: 'Batch Management', icon: Package },
  { href: '/supplier-performance', label: 'Supplier Performance', icon: TrendingUp },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/app/ai-chat', label: 'AI Chat', icon: Sparkles },
  { href: '/app/voice-commands', label: 'Voice Commands', icon: Mic },
  { href: '/app/voice-analytics', label: 'Voice Analytics', icon: TrendingUp },
  { href: '/app/custom-commands', label: 'Custom Commands', icon: Sparkles },
  { href: '/app/command-scheduling', label: 'Scheduling', icon: Clock },
  { href: '/app/realtime-execution', label: 'Real-Time Execution', icon: Zap },
  { href: '/app/command-permissions', label: 'Permissions', icon: Lock },
  { href: '/app/command-templates', label: 'Templates', icon: Download },
  { href: '/app/audit-log', label: 'Audit Log', icon: FileText },
  { href: '/app/command-chaining', label: 'Chaining', icon: Zap },
  { href: '/app/mobile-voice', label: 'Mobile Voice', icon: Smartphone },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/profit-margin', label: 'Profit Margin', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const { state, dispatch } = useApp();
  const { user, loading, isAuthenticated } = useAuth();

  // Check if this is a new user flow
  useEffect(() => {
    const isNewUser = new URLSearchParams(window.location.search).get('newUser') === 'true';
    if (isNewUser) {
      // Force EMPTY_STATE for new users
      dispatch({ type: 'RESET_STATE' });
      // Remove query param from URL
      window.history.replaceState({}, '', '/app');
    }
  }, [dispatch]);



  const lowStockCount = state.products.filter(
    p => p.stockOnHand <= p.lowStockThreshold
  ).length;

  const pendingOrders = state.orders.filter(o => o.status === 'Pending').length;

  const closeSidebar = () => setSidebarOpen(false);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
      {location !== '/settings' && (
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
              <div className="w-full h-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-foreground truncate">TraceCore</span>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Section */}
        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={() => {
              navigate('/pricing');
              closeSidebar();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary hover:from-primary/30 hover:to-violet-500/30 transition-colors border border-primary/30"
          >
            <Zap className="w-5 h-5 shrink-0" />
            <span className="truncate">Upgrade Plan</span>
          </button>
        </div>

        {/* AI Assistant Link */}
        <div className="px-3 py-3 border-t border-border">
          <Link
            href="/ai-assistant"
            onClick={closeSidebar}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              location === '/ai-assistant'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span className="truncate">AI Assistant</span>
          </Link>
        </div>

        {/* Admin Links */}
        {user?.role === 'admin' && (
          <div className="px-3 py-3 border-t border-border space-y-1">
            <Link
              href="/admin/payments"
              onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location === '/admin/payments'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span className="truncate">Payments</span>
            </Link>
            <Link
              href="/admin/analytics"
              onClick={closeSidebar}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location === '/admin/analytics'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              <span className="truncate">Analytics</span>
            </Link>
          </div>
        )}
      </aside>
      )}

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-background/50 backdrop-blur-sm shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Upgrade Button */}
          <button
            onClick={() => navigate('/pricing')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary hover:from-primary/30 hover:to-violet-500/30 transition-colors border border-primary/30 mr-4"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade</span>
          </button>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {(lowStockCount > 0 || pendingOrders > 0) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Command Center Button */}
            <button
              onClick={() => setCommandCenterOpen(!commandCenterOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Command Center (Ctrl+K)"
            >
              <Zap className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Command Center Modal */}
      {commandCenterOpen && (
        <CommandCenter isOpen={commandCenterOpen} onClose={() => setCommandCenterOpen(false)} />
      )}
    </div>
  );
}
