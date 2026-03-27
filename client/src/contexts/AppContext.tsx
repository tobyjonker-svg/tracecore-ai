/**
 * TraceCore AI — Application Context
 * Manages all global state with localStorage persistence.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AppState,
  INITIAL_STATE,
  EMPTY_STATE,
  Supplier,
  Input,
  Product,
  ProductionRun,
  Order,
  OrderItem,
  OrderStatus,
  InventoryActivity,
  InventoryActionType,
  generateId,
} from '@/lib/store';

// ─── Action Types ─────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_SUPPLIER'; payload: Omit<Supplier, 'id' | 'workspaceId' | 'createdAt'> }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_INPUT'; payload: Omit<Input, 'id' | 'workspaceId' | 'createdAt'> }
  | { type: 'UPDATE_INPUT_STOCK'; payload: { id: string; stock: number } }
  | { type: 'DELETE_INPUT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Omit<Product, 'id' | 'workspaceId' | 'createdAt'> }
  | { type: 'UPDATE_PRODUCT'; payload: Partial<Product> & { id: string } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_PRODUCTION_RUN'; payload: Omit<ProductionRun, 'id' | 'workspaceId' | 'createdAt'> }
  | { type: 'ADD_ORDER'; payload: { customerName: string; items: Omit<OrderItem, 'id' | 'orderId'>[] } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: OrderStatus } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'ADD_INVENTORY_ACTIVITY'; payload: Omit<InventoryActivity, 'id' | 'workspaceId' | 'createdAt'> }
  | { type: 'RESET_STATE' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  const wsId = state.workspace.id;
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_SUPPLIER': {
      const supplier: Supplier = {
        id: generateId('sup'),
        workspaceId: wsId,
        createdAt: now,
        ...action.payload,
      };
      return { ...state, suppliers: [supplier, ...state.suppliers] };
    }

    case 'DELETE_SUPPLIER': {
      return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.payload) };
    }

    case 'ADD_INPUT': {
      const input: Input = {
        id: generateId('inp'),
        workspaceId: wsId,
        createdAt: now,
        ...action.payload,
      };
      const activity: InventoryActivity = {
        id: generateId('ia'),
        workspaceId: wsId,
        actionType: 'Supplier Purchase',
        itemName: input.name,
        itemType: 'input',
        referenceId: input.id,
        changeAmount: input.stockOnHand,
        notes: `New input added: ${input.name}`,
        createdAt: now,
      };
      return {
        ...state,
        inputs: [input, ...state.inputs],
        inventoryActivity: [activity, ...state.inventoryActivity],
      };
    }

    case 'UPDATE_INPUT_STOCK': {
      return {
        ...state,
        inputs: state.inputs.map(i =>
          i.id === action.payload.id ? { ...i, stockOnHand: action.payload.stock } : i
        ),
      };
    }

    case 'DELETE_INPUT': {
      return { ...state, inputs: state.inputs.filter(i => i.id !== action.payload) };
    }

    case 'ADD_PRODUCT': {
      const product: Product = {
        id: generateId('prod'),
        workspaceId: wsId,
        createdAt: now,
        ...action.payload,
      };
      return { ...state, products: [product, ...state.products] };
    }

    case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };
    }

    case 'DELETE_PRODUCT': {
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    }

    case 'ADD_PRODUCTION_RUN': {
      const run: ProductionRun = {
        id: generateId('pr'),
        workspaceId: wsId,
        createdAt: now,
        ...action.payload,
      };
      const product = state.products.find(p => p.id === run.productId);
      const updatedProducts = state.products.map(p =>
        p.id === run.productId
          ? { ...p, stockOnHand: p.stockOnHand + run.quantity }
          : p
      );
      const activity: InventoryActivity = {
        id: generateId('ia'),
        workspaceId: wsId,
        actionType: 'Production Run',
        itemName: product?.name ?? 'Unknown Product',
        itemType: 'product',
        referenceId: run.id,
        changeAmount: +run.quantity,
        notes: run.notes || `Production run: ${run.quantity} units`,
        createdAt: now,
      };
      return {
        ...state,
        productionRuns: [run, ...state.productionRuns],
        products: updatedProducts,
        inventoryActivity: [activity, ...state.inventoryActivity],
      };
    }

    case 'ADD_ORDER': {
      const orderId = generateId('ord');
      const items: OrderItem[] = action.payload.items.map(item => ({
        id: generateId('oi'),
        orderId,
        ...item,
      }));
      const order: Order = {
        id: orderId,
        workspaceId: wsId,
        customerName: action.payload.customerName,
        status: 'Pending',
        items,
        createdAt: now,
      };
      return { ...state, orders: [order, ...state.orders] };
    }

    case 'UPDATE_ORDER_STATUS': {
      const { id, status } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (!order) return state;

      let updatedProducts = state.products;
      const newActivities: InventoryActivity[] = [];

      if (status === 'Shipped' && order.status !== 'Shipped') {
        // Deduct stock for each item
        updatedProducts = state.products.map(product => {
          const item = order.items.find(i => i.productId === product.id);
          if (item) {
            return { ...product, stockOnHand: Math.max(0, product.stockOnHand - item.quantity) };
          }
          return product;
        });

        // Log inventory activities
        order.items.forEach(item => {
          const product = state.products.find(p => p.id === item.productId);
          newActivities.push({
            id: generateId('ia'),
            workspaceId: wsId,
            actionType: 'Order Shipped',
            itemName: product?.name ?? 'Unknown Product',
            itemType: 'product',
            referenceId: id,
            changeAmount: -item.quantity,
            notes: `Order #${id.slice(-4)} — ${order.customerName}`,
            createdAt: now,
          });
        });
      }

      const updatedOrders = state.orders.map(o =>
        o.id === id ? { ...o, status } : o
      );

      return {
        ...state,
        orders: updatedOrders,
        products: updatedProducts,
        inventoryActivity: [...newActivities, ...state.inventoryActivity],
      };
    }

    case 'DELETE_ORDER': {
      return { ...state, orders: state.orders.filter(o => o.id !== action.payload) };
    }

    case 'ADD_INVENTORY_ACTIVITY': {
      const activity: InventoryActivity = {
        id: generateId('ia'),
        workspaceId: wsId,
        createdAt: now,
        ...action.payload,
      };
      return { ...state, inventoryActivity: [activity, ...state.inventoryActivity] };
    }

    case 'RESET_STATE': {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'tracecore-ai-state';
const ONBOARDED_KEY = 'tracecore-ai-onboarded';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      const hasOnboarded = localStorage.getItem(ONBOARDED_KEY);
      return hasOnboarded ? initial : EMPTY_STATE;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (state.workspace.name !== 'My Business') {
      localStorage.setItem(ONBOARDED_KEY, 'true');
    }
  }, [state.workspace.name]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
