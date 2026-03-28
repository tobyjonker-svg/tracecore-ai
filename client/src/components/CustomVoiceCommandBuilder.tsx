/**
 * CustomVoiceCommandBuilder
 * Allows users to create and customize voice commands for their business
 */

import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface CustomCommand {
  id: string;
  keyword: string;
  action: string;
  description: string;
  enabled: boolean;
}

interface CustomVoiceCommandBuilderProps {
  onCommandsUpdate?: (commands: CustomCommand[]) => void;
}

export function CustomVoiceCommandBuilder({ onCommandsUpdate }: CustomVoiceCommandBuilderProps) {
  const { state } = useApp() as any;
  const [commands, setCommands] = useState<CustomCommand[]>(
    state.workspace.aiConfig?.customCommands || []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CustomCommand>>({});
  const [showForm, setShowForm] = useState(false);
  const [newCommand, setNewCommand] = useState<Partial<CustomCommand>>({
    keyword: '',
    action: '',
    description: '',
    enabled: true,
  });

  // Generate dynamic suggestions based on user's products and suppliers
  const generateSuggestions = () => {
    const suggestions: string[] = [];

    // Product-based commands
    state.products.forEach((product: any) => {
      suggestions.push(`add ${product.name}`);
      suggestions.push(`check ${product.name} stock`);
      suggestions.push(`mark ${product.name} shipped`);
    });

    // Supplier-based commands
    state.suppliers.forEach((supplier: any) => {
      suggestions.push(`add input from ${supplier.name}`);
      suggestions.push(`contact ${supplier.name}`);
    });

    return Array.from(new Set(suggestions)); // Remove duplicates
  };

  const addCommand = () => {
    if (!newCommand.keyword || !newCommand.action) {
      alert('Please fill in keyword and action');
      return;
    }

    const command: CustomCommand = {
      id: `cmd-${Date.now()}`,
      keyword: newCommand.keyword as string,
      action: newCommand.action as string,
      description: newCommand.description || '',
      enabled: newCommand.enabled !== false,
    };

    const updated = [...commands, command];
    setCommands(updated);
    setNewCommand({ keyword: '', action: '', description: '', enabled: true });
    setShowForm(false);
    onCommandsUpdate?.(updated);
  };

  const updateCommand = (id: string) => {
    const updated = commands.map(cmd =>
      cmd.id === id ? { ...cmd, ...editForm } : cmd
    );
    setCommands(updated);
    setEditingId(null);
    setEditForm({});
    onCommandsUpdate?.(updated);
  };

  const deleteCommand = (id: string) => {
    const updated = commands.filter(cmd => cmd.id !== id);
    setCommands(updated);
    onCommandsUpdate?.(updated);
  };

  const toggleCommand = (id: string) => {
    const updated = commands.map(cmd =>
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    );
    setCommands(updated);
    onCommandsUpdate?.(updated);
  };

  const suggestions = generateSuggestions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Custom Voice Commands</h3>
          <p className="text-sm text-muted-foreground">
            Create custom voice commands tailored to your business
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          New Command
        </button>
      </div>

      {/* Add New Command Form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-4 font-medium text-foreground">Add New Voice Command</h4>

          <div className="space-y-4">
            {/* Keyword Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Voice Keyword
              </label>
              <input
                type="text"
                placeholder="e.g., 'add makeup', 'mark shipped'"
                value={newCommand.keyword || ''}
                onChange={(e) => setNewCommand({ ...newCommand, keyword: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This is what users will say to trigger the command
              </p>
            </div>

            {/* Action Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Action
              </label>
              <input
                type="text"
                placeholder="e.g., 'add-product', 'mark-shipped'"
                value={newCommand.action || ''}
                onChange={(e) => setNewCommand({ ...newCommand, action: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="What does this command do?"
                value={newCommand.description || ''}
                onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Suggestions based on your products:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNewCommand({ ...newCommand, keyword: suggestion })}
                      className="rounded-full bg-muted px-3 py-1 text-xs text-foreground hover:bg-muted/80"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={addCommand}
                className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Add Command
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commands List */}
      <div className="space-y-2">
        {commands.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No custom commands yet. Create one to get started!
            </p>
          </div>
        ) : (
          commands.map((command) => (
            <div
              key={command.id}
              className={cn(
                'rounded-lg border border-border p-4 transition-all',
                !command.enabled && 'opacity-50'
              )}
            >
              {editingId === command.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.keyword || command.keyword}
                    onChange={(e) => setEditForm({ ...editForm, keyword: e.target.value })}
                    placeholder="Keyword"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                  <input
                    type="text"
                    value={editForm.action || command.action}
                    onChange={(e) => setEditForm({ ...editForm, action: e.target.value })}
                    placeholder="Action"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                  <input
                    type="text"
                    value={editForm.description || command.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateCommand(command.id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 flex items-center justify-center gap-1 rounded bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={command.enabled}
                        onChange={() => toggleCommand(command.id)}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium text-foreground">"{command.keyword}"</p>
                        <p className="text-xs text-muted-foreground">{command.description}</p>
                        <p className="mt-1 text-xs text-blue-500">Action: {command.action}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(command.id);
                        setEditForm(command);
                      }}
                      className="rounded p-2 hover:bg-muted"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteCommand(command.id)}
                      className="rounded p-2 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-500/10 p-4">
        <p className="text-sm text-blue-600">
          💡 <strong>Tip:</strong> Use simple, memorable keywords that match your business operations.
          For example: "add makeup", "mark packed", "schedule production".
        </p>
      </div>
    </div>
  );
}
