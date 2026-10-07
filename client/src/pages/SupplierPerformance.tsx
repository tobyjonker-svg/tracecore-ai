import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SupplierPerformance() {
  const { data: suppliers = [], isLoading } = trpc.suppliers.list.useQuery();
  const { data: inputs = [] } = trpc.inputs.list.useQuery();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Supplier Performance</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Track supplier reliability and material costs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{(suppliers as any[]).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Suppliers</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{(inputs as any[]).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Materials Tracked</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
        </div>
      </div>

      {/* Supplier list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (suppliers as any[]).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No suppliers yet</h3>
            <p className="text-sm text-muted-foreground">Add suppliers in the Suppliers page to track performance here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(suppliers as any[]).map((s: any) => {
            const supplierInputs = (inputs as any[]).filter((i: any) => i.supplierId === s.id);
            return (
              <Card key={s.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.email || s.phone || 'No contact info'} · {supplierInputs.length} materials supplied
                      </p>
                      {supplierInputs.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Supplies: {supplierInputs.map((i: any) => i.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className="w-3.5 h-3.5 text-muted-foreground/30" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Detailed performance tracking — order history, delivery times, and ratings — coming in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
