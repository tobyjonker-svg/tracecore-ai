import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Batches() {
  const { data: batches = [], isLoading, refetch } = trpc.batches.list.useQuery({ workspaceId: 0 });
  const { data: products = [] } = trpc.products.list.useQuery();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batch Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track production batch lots and quality control</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" />Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (batches as any[]).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">No batch lots yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Batch lots are created automatically when you complete a production run. Complete your first production run to see batch data here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(batches as any[]).map((b: any) => (
            <Card key={b.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{b.batchNumber || 'Batch ' + b.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {b.quantity} · Status: {b.status}
                    </p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                    b.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    b.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  )}>{b.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
