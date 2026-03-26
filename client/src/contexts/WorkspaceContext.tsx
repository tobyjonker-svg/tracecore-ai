/**
 * TraceCore AI — Workspace Context
 * Manages multi-workspace and client customization.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessType } from '@/lib/store';

export interface WorkspaceConfig {
  id: string;
  name: string;
  businessType: BusinessType;
  customCategory?: string;
  customProductLabel?: string;
  customSupplierLabel?: string;
  customOrderLabel?: string;
  customInventoryLabel?: string;
  lowStockThresholdDefault?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceContextValue {
  currentWorkspace: WorkspaceConfig | null;
  workspaces: WorkspaceConfig[];
  isLoading: boolean;
  createWorkspace: (config: Omit<WorkspaceConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<WorkspaceConfig>) => Promise<void>;
  switchWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const WORKSPACE_STORAGE_KEY = 'tracecore-workspaces';
const CURRENT_WORKSPACE_KEY = 'tracecore-current-workspace';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceConfig[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      const currentId = localStorage.getItem(CURRENT_WORKSPACE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        setWorkspaces(parsed);

        if (currentId) {
          const current = parsed.find((w: WorkspaceConfig) => w.id === currentId);
          if (current) {
            setCurrentWorkspace(current);
          } else if (parsed.length > 0) {
            setCurrentWorkspace(parsed[0]);
          }
        } else if (parsed.length > 0) {
          setCurrentWorkspace(parsed[0]);
        }
      }
    } catch (error) {
      console.error('Failed to restore workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWorkspace = async (config: Omit<WorkspaceConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newWorkspace: WorkspaceConfig = {
      ...config,
      id: `ws-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      lowStockThresholdDefault: config.lowStockThresholdDefault || 10,
    };

    const updated = [...workspaces, newWorkspace];
    setWorkspaces(updated);
    setCurrentWorkspace(newWorkspace);
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(CURRENT_WORKSPACE_KEY, newWorkspace.id);
  };

  const updateWorkspace = async (id: string, updates: Partial<WorkspaceConfig>) => {
    const updated = workspaces.map(w =>
      w.id === id
        ? {
            ...w,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : w
    );

    setWorkspaces(updated);

    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(updated.find(w => w.id === id) || null);
    }

    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(updated));
  };

  const switchWorkspace = (id: string) => {
    const workspace = workspaces.find(w => w.id === id);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem(CURRENT_WORKSPACE_KEY, id);
    }
  };

  const deleteWorkspace = async (id: string) => {
    const updated = workspaces.filter(w => w.id !== id);
    setWorkspaces(updated);

    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(updated.length > 0 ? updated[0] : null);
      if (updated.length > 0) {
        localStorage.setItem(CURRENT_WORKSPACE_KEY, updated[0].id);
      } else {
        localStorage.removeItem(CURRENT_WORKSPACE_KEY);
      }
    }

    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        isLoading,
        createWorkspace,
        updateWorkspace,
        switchWorkspace,
        deleteWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
