/**
 * TraceCore AI — AI Command Context
 * Manages command history, execution, and feedback.
 */

import React, { createContext, useContext, useState } from 'react';
import { ParsedCommand, CommandResult } from '@/lib/aiCommands';

export interface CommandHistoryItem {
  id: string;
  timestamp: string;
  input: string;
  parsed: ParsedCommand;
  result: CommandResult;
}

export interface AICommandContextValue {
  history: CommandHistoryItem[];
  isListening: boolean;
  lastResult: CommandResult | null;
  addToHistory: (item: CommandHistoryItem) => void;
  clearHistory: () => void;
  setIsListening: (listening: boolean) => void;
  setLastResult: (result: CommandResult | null) => void;
}

const AICommandContext = createContext<AICommandContextValue | null>(null);

export function AICommandProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);

  const addToHistory = (item: CommandHistoryItem) => {
    setHistory(prev => [item, ...prev].slice(0, 50)); // Keep last 50 commands
  };

  const clearHistory = () => {
    setHistory([]);
    setLastResult(null);
  };

  return (
    <AICommandContext.Provider
      value={{
        history,
        isListening,
        lastResult,
        addToHistory,
        clearHistory,
        setIsListening,
        setLastResult,
      }}
    >
      {children}
    </AICommandContext.Provider>
  );
}

export function useAICommand() {
  const ctx = useContext(AICommandContext);
  if (!ctx) throw new Error('useAICommand must be used within AICommandProvider');
  return ctx;
}
