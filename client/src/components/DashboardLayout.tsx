/**
 * TraceCore AI — Dashboard Layout
 * Design: Soft-Dark Enterprise + Mobile-First Responsive
 * - Mobile: collapsible sidebar with hamburger menu
 * - Desktop: 240px fixed sidebar, top header bar
 * - Responsive breakpoints: sm (640px), md (768px), lg (1024px)
 * - Auth gating: only renders when authenticated
 */

import { useState, useEffect, useRef } from 'react';
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
import { trpc } from '@/lib/trpc';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const NAV_ITEMS = [
  { href: '/app', label: 'Home', icon: LayoutDashboard },
  { href: '/suppliers', label: 'Suppliers', icon: Users },
  { href: '/inputs', label: 'Raw Inputs', icon: Package },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/production', label: 'Production', icon: Factory },
  { href: '/inventory-log', label: 'Inventory', icon: Activity },
  { href: '/batches', label: 'Batches', icon: FlaskConical },
  { href: '/supplier-performance', label: 'Supplier Perf', icon: BarChart3 },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const { state, dispatch } = useApp();
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation()[0];
  
  // ONLY fetch protected queries when auth is confirmed
  const { data: unreadAlerts = [] } = trpc.alerts.getUnread.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  // Check if this is a new user flow
  useEffect(() => {
    const isNewUser = new URLSearchParams(window.location.search).get('newUser') === 'true';
    if (isNewUser) {
      dispatch({ type: 'RESET_STATE' });
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

  // If not authenticated, show nothing (useAuth will handle redirect if needed)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Authenticating...</p>
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
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Pro+ Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-emerald-500">Pro+ Active</p>
              <p className="text-xs text-muted-foreground truncate">Premium features unlocked</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-foreground">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">TraceCore AI</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Alerts Dropdown */}
            <Popover open={alertsOpen} onOpenChange={setAlertsOpen}>
              <PopoverTrigger asChild>
                <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      {unreadAlerts.length} unread alerts
                    </p>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {unreadAlerts.slice(0, 5).map((alert: any) => (
                      <div key={alert.id} className="p-2 bg-muted rounded text-sm">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                  <Link href="/alerts">
                    <a className="text-xs text-primary hover:underline">View all alerts →</a>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            {/* Command Center */}
            <button
              onClick={() => setCommandCenterOpen(!commandCenterOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Zap className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* User Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48">
                <div className="space-y-2">
                  <Link href="/settings">
                    <a className="block px-3 py-2 text-sm hover:bg-muted rounded transition-colors">
                      Settings
                    </a>
                  </Link>
                  <button
                    onClick={() => {
                      // Logout logic here
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-red-500"
                  >
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Command Center Modal */}
      {commandCenterOpen && (
        <CommandCenter isOpen={commandCenterOpen} onClose={() => setCommandCenterOpen(false)} />
      )}
    </div>
  );
}
