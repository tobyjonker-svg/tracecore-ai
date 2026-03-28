/**
 * Workflow Stage Editor — Customize workflow stage names and icons
 * Allows users to rename stages (e.g., "Raw Materials" → "Toys")
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { FlaskConical, Factory, ShoppingCart, Truck, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStage {
  id: string;
  defaultName: string;
  customName: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const DEFAULT_STAGES: WorkflowStage[] = [
  {
    id: 'inputs',
    defaultName: 'Raw Materials',
    customName: 'Raw Materials',
    icon: FlaskConical,
    color: 'bg-primary/10 border-primary/20 text-primary',
    description: 'Track suppliers and raw material inventory',
  },
  {
    id: 'production',
    defaultName: 'Production',
    customName: 'Production',
    icon: Factory,
    color: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    description: 'Manage production runs and manufacturing',
  },
  {
    id: 'orders',
    defaultName: 'Orders',
    customName: 'Orders',
    icon: ShoppingCart,
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    description: 'Process and track customer orders',
  },
  {
    id: 'shipping',
    defaultName: 'Shipping',
    customName: 'Shipping',
    icon: Truck,
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    description: 'Manage shipping and fulfillment',
  },
];

interface WorkflowStageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowStageEditor({ open, onOpenChange }: WorkflowStageEditorProps) {
  const { state, dispatch } = useApp();
  const [stages, setStages] = useState<WorkflowStage[]>(
    DEFAULT_STAGES.map(stage => ({
      ...stage,
      customName: state.workspace.workflowStageNames?.[stage.id] || stage.defaultName,
    }))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (stage: WorkflowStage) => {
    setEditingId(stage.id);
    setEditingName(stage.customName);
  };

  const handleSaveEdit = (stageId: string) => {
    if (!editingName.trim()) return;
    setStages(stages.map(s => 
      s.id === stageId ? { ...s, customName: editingName.trim() } : s
    ));
    setEditingId(null);
  };

  const handleResetToDefault = (stageId: string) => {
    const defaultStage = DEFAULT_STAGES.find(s => s.id === stageId);
    if (defaultStage) {
      setStages(stages.map(s => 
        s.id === stageId ? { ...s, customName: defaultStage.defaultName } : s
      ));
    }
  };

  const handleSave = () => {
    // Save custom stage names to workspace
    const stageNames: Record<string, string> = {};
    stages.forEach(stage => {
      stageNames[stage.id] = stage.customName;
    });

    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: {
        workflowStageNames: stageNames,
      },
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize Workflow Stage Names</DialogTitle>
          <DialogDescription>
            Rename your workflow stages to match your business (e.g., "Raw Materials" → "Toys")
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
          {stages.map(stage => {
            const Icon = stage.icon;
            const isEditing = editingId === stage.id;
            const isEnabled = 
              (stage.id === 'inputs' && state.workspace.enableInputs) ||
              (stage.id === 'production' && state.workspace.enableProductionRuns) ||
              (stage.id === 'orders' && state.workspace.enableOrders) ||
              (stage.id === 'shipping' && state.workspace.enableShipping);

            if (!isEnabled) return null;

            return (
              <div
                key={stage.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className={cn('p-2 rounded-lg shrink-0', stage.color)}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Stage Name</Label>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder={stage.defaultName}
                        className="h-8"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-sm text-foreground">{stage.customName}</p>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                      {stage.customName !== stage.defaultName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          (default: {stage.defaultName})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(stage.id)}
                        className="p-1.5 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(stage)}
                        className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {stage.customName !== stage.defaultName && (
                        <button
                          onClick={() => handleResetToDefault(stage.id)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors text-xs"
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
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
