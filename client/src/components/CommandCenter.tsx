/**
 * TraceCore AI — Command Center
 * Integrated command input, voice trigger, and feedback panel.
 */

import React, { useState } from 'react';
import { Send, Zap, History, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAICommand } from '@/contexts/AICommandContext';
import { parseCommand, executeCommand } from '@/lib/aiCommands';
import { VoiceCommandButton } from './VoiceCommandButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandCenter({ isOpen, onClose }: CommandCenterProps) {
  const { state, dispatch } = useApp();
  const { history, lastResult, addToHistory, setLastResult } = useAICommand();
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecuteCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    setIsExecuting(true);
    try {
      const parsed = parseCommand(commandText);
      const result = executeCommand(parsed, state);

      // Add to history
      addToHistory({
        id: `cmd-${Date.now()}`,
        timestamp: new Date().toISOString(),
        input: commandText,
        parsed,
        result,
      });

      setLastResult(result);

      // Execute action if successful
      if (result.success && result.action) {
        dispatch(result.action as any);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }

      setInput('');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    // Auto-execute if confidence is high
    const parsed = parseCommand(transcript);
    if (parsed.confidence > 0.8) {
      setTimeout(() => handleExecuteCommand(transcript), 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full md:w-[600px] md:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Command Center</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Input Area */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Command Input
            </label>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isExecuting) {
                    handleExecuteCommand(input);
                  }
                }}
                placeholder="Type a command or use voice..."
                className="flex-1"
                disabled={isExecuting}
              />
              <VoiceCommandButton onTranscript={handleVoiceTranscript} />
              <Button
                onClick={() => handleExecuteCommand(input)}
                disabled={isExecuting || !input.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div
              className={cn(
                'p-3 rounded-lg text-sm',
                lastResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/20 text-red-300'
              )}
            >
              {lastResult.message}
            </div>
          )}

          {/* Help */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-medium">Example commands:</p>
            <ul className="space-y-1 ml-2 list-disc">
              <li>create product lion's mane</li>
              <li>add 20 stock to lion's mane</li>
              <li>log production run of 30 cordyceps</li>
              <li>create order for john</li>
              <li>mark order shipped</li>
            </ul>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <History className="w-3 h-3" />
                Recent Commands
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {history.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="text-xs p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted transition"
                    onClick={() => {
                      setInput(item.input);
                      handleExecuteCommand(item.input);
                    }}
                  >
                    <div className="text-foreground">{item.input}</div>
                    <div className={item.result.success ? 'text-emerald-400' : 'text-red-400'}>
                      {item.result.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
