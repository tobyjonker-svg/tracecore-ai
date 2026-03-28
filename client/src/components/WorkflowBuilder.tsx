/**
 * Customizable Workflow Builder
 * Allows users to define their own business workflow stages
 * Supports drag-and-drop, add/remove stages, and preset templates
 */

import { useState } from 'react';
import { Plus, X, GripVertical, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface WorkflowStage {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface WorkflowTemplate {
  name: string;
  description: string;
  stages: Omit<WorkflowStage, 'id'>[];
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    name: 'Manufacturing',
    description: 'For manufacturers and production businesses',
    stages: [
      { name: 'Suppliers', icon: '🏭', color: 'bg-blue-500' },
      { name: 'Raw Materials', icon: '📦', color: 'bg-purple-500' },
      { name: 'Production', icon: '⚙️', color: 'bg-orange-500' },
      { name: 'Inventory', icon: '📊', color: 'bg-green-500' },
      { name: 'Orders', icon: '🚚', color: 'bg-red-500' },
    ],
  },
  {
    name: 'Retail',
    description: 'For retailers and resellers',
    stages: [
      { name: 'Suppliers', icon: '🏪', color: 'bg-blue-500' },
      { name: 'Purchasing', icon: '💳', color: 'bg-purple-500' },
      { name: 'Inventory', icon: '📦', color: 'bg-green-500' },
      { name: 'Sales', icon: '💰', color: 'bg-orange-500' },
      { name: 'Fulfillment', icon: '🚚', color: 'bg-red-500' },
    ],
  },
  {
    name: 'Service Business',
    description: 'For service providers and consultants',
    stages: [
      { name: 'Leads', icon: '📞', color: 'bg-blue-500' },
      { name: 'Proposals', icon: '📄', color: 'bg-purple-500' },
      { name: 'Contracts', icon: '✍️', color: 'bg-orange-500' },
      { name: 'Delivery', icon: '⚡', color: 'bg-green-500' },
      { name: 'Follow-up', icon: '⭐', color: 'bg-red-500' },
    ],
  },
  {
    name: 'Wholesale',
    description: 'For wholesale and distribution',
    stages: [
      { name: 'Procurement', icon: '🛒', color: 'bg-blue-500' },
      { name: 'Warehouse', icon: '🏢', color: 'bg-purple-500' },
      { name: 'Quality Check', icon: '✅', color: 'bg-orange-500' },
      { name: 'Distribution', icon: '🚛', color: 'bg-green-500' },
      { name: 'Delivery', icon: '🚚', color: 'bg-red-500' },
    ],
  },
];

const ICON_OPTIONS = ['🏭', '📦', '⚙️', '📊', '🚚', '🏪', '💳', '💰', '📞', '📄', '✍️', '⭐', '✅', '🛒', '🏢', '🚛', '⚡', '🎯', '📈', '🔧'];
const COLOR_OPTIONS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

interface WorkflowBuilderProps {
  onWorkflowChange?: (stages: WorkflowStage[]) => void;
  defaultTemplate?: string;
}

export default function WorkflowBuilder({ onWorkflowChange, defaultTemplate }: WorkflowBuilderProps) {
  const [stages, setStages] = useState<WorkflowStage[]>(() => {
    const template = WORKFLOW_TEMPLATES.find(t => t.name === defaultTemplate) || WORKFLOW_TEMPLATES[0];
    return template.stages.map((stage, idx) => ({
      ...stage,
      id: `stage-${idx}`,
    }));
  });

  const [showTemplates, setShowTemplates] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddStage = () => {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      icon: '🎯',
      color: 'bg-blue-500',
    };
    const newStages = [...stages, newStage];
    setStages(newStages);
    onWorkflowChange?.(newStages);
  };

  const handleRemoveStage = (id: string) => {
    const newStages = stages.filter(s => s.id !== id);
    setStages(newStages);
    onWorkflowChange?.(newStages);
  };

  const handleUpdateStage = (id: string, updates: Partial<WorkflowStage>) => {
    const newStages = stages.map(s => (s.id === id ? { ...s, ...updates } : s));
    setStages(newStages);
    onWorkflowChange?.(newStages);
  };

  const handleApplyTemplate = (template: WorkflowTemplate) => {
    const newStages = template.stages.map((stage, idx) => ({
      ...stage,
      id: `stage-${idx}`,
    }));
    setStages(newStages);
    onWorkflowChange?.(newStages);
    setShowTemplates(false);
  };

  const handleStartEdit = (stage: WorkflowStage) => {
    setEditingId(stage.id);
    setEditingName(stage.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      handleUpdateStage(editingId, { name: editingName });
      setEditingId(null);
      setEditingName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Workflow Templates</h3>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {showTemplates ? 'Hide' : 'Show'} Templates
          </button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WORKFLOW_TEMPLATES.map((template) => (
              <button
                key={template.name}
                onClick={() => handleApplyTemplate(template)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
              >
                <p className="font-medium text-foreground">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                <div className="flex gap-1 mt-2">
                  {template.stages.slice(0, 3).map((stage, idx) => (
                    <span key={idx} className="text-xs">{stage.icon}</span>
                  ))}
                  {template.stages.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{template.stages.length - 3}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Workflow */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Your Workflow Stages</h3>

        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
              {/* Drag Handle */}
              <div className="text-muted-foreground cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Stage Number */}
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{idx + 1}</span>
              </div>

              {/* Icon Selector */}
              <div className="relative group">
                <button className="text-2xl hover:scale-110 transition-transform">
                  {stage.icon}
                </button>
                <div className="hidden group-hover:grid grid-cols-5 gap-2 absolute top-full left-0 mt-2 p-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => handleUpdateStage(stage.id, { icon })}
                      className="text-xl hover:scale-125 transition-transform"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stage Name */}
              {editingId === stage.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Stage name"
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => handleStartEdit(stage)}
                  className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors"
                >
                  {stage.name}
                </button>
              )}

              {/* Color Selector */}
              <div className="relative group">
                <div className={cn('w-6 h-6 rounded-full cursor-pointer hover:ring-2 ring-primary', stage.color)} />
                <div className="hidden group-hover:grid grid-cols-5 gap-2 absolute top-full right-0 mt-2 p-2 bg-card border border-border rounded-lg shadow-lg z-10">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleUpdateStage(stage.id, { color })}
                      className={cn('w-6 h-6 rounded-full hover:ring-2 ring-primary', color)}
                    />
                  ))}
                </div>
              </div>

              {/* Remove Button */}
              {stages.length > 1 && (
                <button
                  onClick={() => handleRemoveStage(stage.id)}
                  className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Stage Button */}
        <Button
          onClick={handleAddStage}
          variant="outline"
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Stage
        </Button>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Preview</h3>
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {stages.map((stage, idx) => (
              <div key={stage.id} className="flex flex-col items-center flex-shrink-0">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-xl', stage.color)}>
                  {stage.icon}
                </div>
                <p className="text-xs font-medium text-foreground mt-2 text-center max-w-[80px]">{stage.name}</p>
                {idx < stages.length - 1 && (
                  <div className="hidden md:block absolute left-[calc(50%+40px)] w-12 h-0.5 bg-border mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Customize Your Workflow</p>
          <p>Click on stage names to edit them, use the color picker to customize colors, and select icons from the dropdown. Add or remove stages as needed.</p>
        </div>
      </div>
    </div>
  );
}
