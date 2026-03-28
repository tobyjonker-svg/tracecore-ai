/**
 * Workflow Customizer — Add/Remove Workflow Stages
 * Allows users to customize their workflow by enabling/disabling stages
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { FlaskConical, Factory, ShoppingCart, Truck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStage {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
  description: string;
}

const AVAILABLE_STAGES: WorkflowStage[] = [
  {
    id: 'inputs',
    name: 'Raw Materials',
    icon: FlaskConical,
    color: 'bg-primary/10 border-primary/20 text-primary',
    enabled: true,
    description: 'Track suppliers and raw material inventory',
  },
  {
    id: 'production',
    name: 'Production',
    icon: Factory,
    color: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    enabled: true,
    description: 'Manage production runs and manufacturing',
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: ShoppingCart,
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    enabled: true,
    description: 'Process and track customer orders',
  },
  {
    id: 'shipping',
    name: 'Shipping',
    icon: Truck,
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    enabled: true,
    description: 'Manage shipping and fulfillment',
  },
];

interface WorkflowCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowCustomizer({ open, onOpenChange }: WorkflowCustomizerProps) {
  const { state, dispatch } = useApp();
  const [stages, setStages] = useState<WorkflowStage[]>(
    AVAILABLE_STAGES.map(stage => ({
      ...stage,
      enabled:
        (stage.id === 'inputs' && state.workspace.enableInputs) ||
        (stage.id === 'production' && state.workspace.enableProductionRuns) ||
        (stage.id === 'orders' && state.workspace.enableOrders) ||
        (stage.id === 'shipping' && state.workspace.enableShipping),
    }))
  );

  const handleToggle = (id: string) => {
    setStages(stages.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleSave = () => {
    // Update app context with new workflow configuration
    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: {
        enableInputs: stages.find(s => s.id === 'inputs')?.enabled || false,
        enableProductionRuns: stages.find(s => s.id === 'production')?.enabled || false,
        enableOrders: stages.find(s => s.id === 'orders')?.enabled || false,
        enableShipping: stages.find(s => s.id === 'shipping')?.enabled || false,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Your Workflow</DialogTitle>
          <DialogDescription>
            Select which stages are relevant to your {state.workspace.businessType} business
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {stages.map(stage => {
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                onClick={() => handleToggle(stage.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left',
                  stage.enabled
                    ? 'border-primary bg-primary/5'
                    : 'border-muted bg-muted/30 opacity-60'
                )}
              >
                <div className={cn('p-2 rounded-lg shrink-0', stage.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{stage.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5',
                  stage.enabled
                    ? 'bg-primary border-primary'
                    : 'border-muted'
                )}>
                  {stage.enabled && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
