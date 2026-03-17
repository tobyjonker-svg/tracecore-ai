/**
 * TraceCore AI — Inventory Activity Page
 * Design: Soft-Dark Enterprise
 * - Timeline of all stock changes (audit log)
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatDateTime } from '@/lib/store';
import { InventoryActionType } from '@/lib/store';
import {
  Activity, ArrowUpRight, ArrowDownRight, Filter, Package, FlaskConical,
  Factory, ShoppingCart, Truck, Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTION_CONFIG: Record<InventoryActionType, { color: string; bg: string; icon: React.ElementType }> = {
  'Production Run': { color: 'text-violet-400', bg: 'bg-violet-500/15', icon: Factory },
  'Order Shipped': { color: 'text-red-400', bg: 'bg-red-500/15', icon: ShoppingCart },
  'Stock Adjustment': { color: 'text-amber-400', bg: 'bg-amber-500/15', icon: Wrench },
  'Supplier Purchase': { color: 'text-cyan-400', bg: 'bg-cyan-500/15', icon: Truck },
  'Manual Update': { color: 'text-primary', bg: 'bg-primary/15', icon: Wrench },
};

export default function InventoryActivity() {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<InventoryActionType | 'All'>('All');
  const [filterItemType, setFilterItemType] = useState<'all' | 'product' | 'input'>('all');

  const sorted = [...state.inventoryActivity].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filtered = sorted.filter(a => {
    if (filterType !== 'All' && a.actionType !== filterType) return false;
    if (filterItemType !== 'all' && a.itemType !== filterItemType) return false;
    return true;
  });

  const totalIn = sorted.filter(a => a.changeAmount > 0).reduce((s, a) => s + a.changeAmount, 0);
  const totalOut = Math.abs(sorted.filter(a => a.changeAmount < 0).reduce((s, a) => s + a.changeAmount, 0));

  return (
    <div className="p-6 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Plus_Jakarta_Sans']">Inventory Activity</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Complete audit log of all stock changes across your operation.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="tc-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Events</p>
          <p className="text-3xl font-bold text-foreground font-['Plus_Jakarta_Sans']">{sorted.length}</p>
        </div>
        <div className="tc-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Units In</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-emerald-400 font-['Plus_Jakarta_Sans']">+{totalIn}</p>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="tc-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Units Out</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-red-400 font-['Plus_Jakarta_Sans']">-{totalOut}</p>
            <ArrowDownRight className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex flex-wrap gap-2">
          {(['All', 'Production Run', 'Order Shipped', 'Supplier Purchase', 'Stock Adjustment', 'Manual Update'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all',
                filterType === type
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-2">
          {(['all', 'product', 'input'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterItemType(t)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1',
                filterItemType === t
                  ? 'bg-muted text-foreground border-border'
                  : 'text-muted-foreground border-border hover:text-foreground'
              )}
            >
              {t === 'product' && <Package className="w-3 h-3" />}
              {t === 'input' && <FlaskConical className="w-3 h-3" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="tc-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground font-['Plus_Jakarta_Sans']">
            Activity Log ({filtered.length} events)
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No activity matches your filters.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[2.75rem] top-0 bottom-0 w-px bg-border" />

            <div className="divide-y divide-border">
              {filtered.map((activity, i) => {
                const cfg = ACTION_CONFIG[activity.actionType] ?? ACTION_CONFIG['Manual Update'];
                const ActionIcon = cfg.icon;
                const isPositive = activity.changeAmount > 0;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors card-enter"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative z-10',
                      cfg.bg
                    )}>
                      <ActionIcon className={cn('w-4 h-4', cfg.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            <span className={cn(
                              'font-bold font-mono mr-1.5',
                              isPositive ? 'text-emerald-400' : 'text-red-400'
                            )}>
                              {isPositive ? '+' : ''}{activity.changeAmount}
                            </span>
                            <span className="font-medium">{activity.itemName}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {activity.notes}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            cfg.bg, cfg.color
                          )}>
                            {activity.actionType}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
