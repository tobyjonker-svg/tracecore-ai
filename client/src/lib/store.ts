/**
 * TraceCore AI — Global Data Store
 * Design: Soft-Dark Enterprise
 * 
 * In-memory store simulating the database model.
 * All state is managed via React context and persisted in localStorage.
 */

export type BusinessType =
  | 'Herbal Medicine'
  | 'Mushroom Extracts'
  | 'Cosmetics'
  | 'Food Production'
  | 'Toy Manufacturing'
  | 'Nutraceuticals'
  | 'Supplements'
  | 'Essential Oils'
  | 'Skincare'
  | 'Beverages'
  | 'Spices & Seasonings'
  | 'Herbal Tea'
  | 'Craft Goods'
  | 'Artisanal Products'
  | 'Other';

export interface AIConfig {
  voiceEnabled: boolean;
  commandsEnabled: boolean;
  customPrompt: string;
  selectedCommands: string[];
  setupCompleted: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  businessType: BusinessType;
  customCategory?: string;
  createdAt: string;
  tier: 'free' | 'pro' | 'pro_plus';
  // Workflow customization
  enableInputs: boolean;
  enableOrders: boolean;
  enableShipping: boolean;
  enableProductionRuns: boolean;
  // AI Configuration
  aiConfig?: AIConfig;
}

export interface Supplier {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  email?: string;
  contactDetails?: string;
  website?: string;
  contactInfo: string;
  createdAt: string;
}

export interface Input {
  id: string;
  workspaceId: string;
  name: string;
  supplierId: string;
  stockOnHand: number;
  unit: string;
  createdAt: string;
}

export interface Product {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  stockOnHand: number;
  lowStockThreshold: number;
  createdAt: string;
}

export interface ProductionRun {
  id: string;
  workspaceId: string;
  productId: string;
  quantity: number;
  notes: string;
  createdAt: string;
}

export type OrderStatus = 'Pending' | 'Packed' | 'Shipped';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  workspaceId: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export type InventoryActionType =
  | 'Production Run'
  | 'Order Shipped'
  | 'Stock Adjustment'
  | 'Supplier Purchase'
  | 'Manual Update';

export interface InventoryActivity {
  id: string;
  workspaceId: string;
  actionType: InventoryActionType;
  itemName: string;
  itemType: 'product' | 'input';
  referenceId: string;
  changeAmount: number;
  notes: string;
  createdAt: string;
}

export interface AppState {
  workspace: Workspace;
  suppliers: Supplier[];
  inputs: Input[];
  products: Product[];
  productionRuns: ProductionRun[];
  orders: Order[];
  inventoryActivity: InventoryActivity[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WORKSPACE_ID = 'ws-mycoalchemy';

// Empty state for new clients
export const EMPTY_STATE: AppState = {
  workspace: {
    id: WORKSPACE_ID,
    name: '',
    businessType: 'Other',
    createdAt: new Date().toISOString(),
    tier: 'free',
    enableInputs: true,
    enableOrders: true,
    enableShipping: true,
    enableProductionRuns: true,
    aiConfig: {
      voiceEnabled: false,
      commandsEnabled: false,
      customPrompt: '',
      selectedCommands: [],
      setupCompleted: false,
    },
  },
  suppliers: [],
  inputs: [],
  products: [],
  productionRuns: [],
  orders: [],
  inventoryActivity: [],
};

export const INITIAL_STATE: AppState = {
  workspace: {
    id: WORKSPACE_ID,
    name: 'MycoAlchemy',
    businessType: 'Mushroom Extracts',
    createdAt: '2025-01-15T08:00:00Z',
    tier: 'pro_plus',
    enableInputs: true,
    enableOrders: true,
    enableShipping: true,
    enableProductionRuns: true,
  },

  suppliers: [
    {
      id: 'sup-1',
      workspaceId: WORKSPACE_ID,
      name: 'Pacific Botanicals',
      contactInfo: 'orders@pacificbotanicals.com · +1 (541) 846-6704',
      createdAt: '2025-01-20T09:00:00Z',
    },
    {
      id: 'sup-2',
      workspaceId: WORKSPACE_ID,
      name: 'Bulk Apothecary',
      contactInfo: 'sales@bulkapothecary.com · +1 (888) 728-7612',
      createdAt: '2025-02-01T10:00:00Z',
    },
    {
      id: 'sup-3',
      workspaceId: WORKSPACE_ID,
      name: 'SKS Bottle & Packaging',
      contactInfo: 'info@sks-bottle.com · +1 (518) 880-6980',
      createdAt: '2025-02-10T11:00:00Z',
    },
    {
      id: 'sup-4',
      workspaceId: WORKSPACE_ID,
      name: 'Grain & Spore Co.',
      contactInfo: 'hello@grainandspore.com · +1 (503) 555-0192',
      createdAt: '2025-03-01T08:30:00Z',
    },
  ],

  inputs: [
    {
      id: 'inp-1',
      workspaceId: WORKSPACE_ID,
      name: "Lion's Mane Powder",
      supplierId: 'sup-1',
      stockOnHand: 4500,
      unit: 'g',
      createdAt: '2025-01-25T09:00:00Z',
    },
    {
      id: 'inp-2',
      workspaceId: WORKSPACE_ID,
      name: 'Reishi Mushroom Extract',
      supplierId: 'sup-1',
      stockOnHand: 2200,
      unit: 'g',
      createdAt: '2025-01-25T09:05:00Z',
    },
    {
      id: 'inp-3',
      workspaceId: WORKSPACE_ID,
      name: 'Cordyceps Powder',
      supplierId: 'sup-4',
      stockOnHand: 1800,
      unit: 'g',
      createdAt: '2025-02-01T10:00:00Z',
    },
    {
      id: 'inp-4',
      workspaceId: WORKSPACE_ID,
      name: 'Alcohol 96%',
      supplierId: 'sup-2',
      stockOnHand: 85,
      unit: 'L',
      createdAt: '2025-02-05T11:00:00Z',
    },
    {
      id: 'inp-5',
      workspaceId: WORKSPACE_ID,
      name: 'Glass Dropper Bottles 100ml',
      supplierId: 'sup-3',
      stockOnHand: 340,
      unit: 'units',
      createdAt: '2025-02-10T12:00:00Z',
    },
    {
      id: 'inp-6',
      workspaceId: WORKSPACE_ID,
      name: 'Packaging Labels',
      supplierId: 'sup-3',
      stockOnHand: 18,
      unit: 'sheets',
      createdAt: '2025-02-15T09:00:00Z',
    },
    {
      id: 'inp-7',
      workspaceId: WORKSPACE_ID,
      name: 'Vegetable Glycerin',
      supplierId: 'sup-2',
      stockOnHand: 12,
      unit: 'L',
      createdAt: '2025-03-01T10:00:00Z',
    },
  ],

  products: [
    {
      id: 'prod-1',
      workspaceId: WORKSPACE_ID,
      name: "Lion's Mane Tincture 100ml",
      description: 'Dual-extract tincture for cognitive support and nerve regeneration.',
      stockOnHand: 48,
      lowStockThreshold: 20,
      createdAt: '2025-02-01T09:00:00Z',
    },
    {
      id: 'prod-2',
      workspaceId: WORKSPACE_ID,
      name: 'Reishi Tincture 100ml',
      description: 'Adaptogenic mushroom tincture for immune support and stress relief.',
      stockOnHand: 12,
      lowStockThreshold: 15,
      createdAt: '2025-02-05T10:00:00Z',
    },
    {
      id: 'prod-3',
      workspaceId: WORKSPACE_ID,
      name: 'Cordyceps Capsules 60ct',
      description: 'Energy and endurance support with 500mg Cordyceps per capsule.',
      stockOnHand: 35,
      lowStockThreshold: 25,
      createdAt: '2025-02-10T11:00:00Z',
    },
    {
      id: 'prod-4',
      workspaceId: WORKSPACE_ID,
      name: 'Mushroom Blend Tincture 50ml',
      description: '7-mushroom adaptogenic blend for overall wellness and vitality.',
      stockOnHand: 6,
      lowStockThreshold: 10,
      createdAt: '2025-02-15T12:00:00Z',
    },
    {
      id: 'prod-5',
      workspaceId: WORKSPACE_ID,
      name: 'Chaga Extract Powder 100g',
      description: 'Wild-harvested Chaga mushroom extract, rich in antioxidants.',
      stockOnHand: 22,
      lowStockThreshold: 15,
      createdAt: '2025-03-01T09:00:00Z',
    },
  ],

  productionRuns: [
    {
      id: 'pr-1',
      workspaceId: WORKSPACE_ID,
      productId: 'prod-1',
      quantity: 30,
      notes: 'Batch #LM-2025-031. Used 900g Lion\'s Mane powder, 3L alcohol.',
      createdAt: '2025-03-15T08:00:00Z',
    },
    {
      id: 'pr-2',
      workspaceId: WORKSPACE_ID,
      productId: 'prod-3',
      quantity: 20,
      notes: 'Batch #CO-2025-028. Standard formulation.',
      createdAt: '2025-03-14T09:30:00Z',
    },
    {
      id: 'pr-3',
      workspaceId: WORKSPACE_ID,
      productId: 'prod-2',
      quantity: 15,
      notes: 'Batch #RE-2025-019. Extended extraction time for potency.',
      createdAt: '2025-03-13T10:00:00Z',
    },
    {
      id: 'pr-4',
      workspaceId: WORKSPACE_ID,
      productId: 'prod-5',
      quantity: 10,
      notes: 'Batch #CH-2025-007. Wild-harvested Chaga, premium grade.',
      createdAt: '2025-03-12T11:00:00Z',
    },
    {
      id: 'pr-5',
      workspaceId: WORKSPACE_ID,
      productId: 'prod-1',
      quantity: 25,
      notes: 'Batch #LM-2025-030. Replenishment run.',
      createdAt: '2025-03-10T08:30:00Z',
    },
  ],

  orders: [
    {
      id: 'ord-1',
      workspaceId: WORKSPACE_ID,
      customerName: 'Green Leaf Wellness',
      status: 'Pending',
      items: [
        { id: 'oi-1', orderId: 'ord-1', productId: 'prod-1', quantity: 6 },
        { id: 'oi-2', orderId: 'ord-1', productId: 'prod-2', quantity: 4 },
      ],
      createdAt: '2025-03-17T07:00:00Z',
    },
    {
      id: 'ord-2',
      workspaceId: WORKSPACE_ID,
      customerName: 'Holistic Hub Toronto',
      status: 'Packed',
      items: [
        { id: 'oi-3', orderId: 'ord-2', productId: 'prod-3', quantity: 10 },
        { id: 'oi-4', orderId: 'ord-2', productId: 'prod-1', quantity: 5 },
      ],
      createdAt: '2025-03-16T09:00:00Z',
    },
    {
      id: 'ord-3',
      workspaceId: WORKSPACE_ID,
      customerName: 'Roots & Remedy',
      status: 'Shipped',
      items: [
        { id: 'oi-5', orderId: 'ord-3', productId: 'prod-4', quantity: 8 },
      ],
      createdAt: '2025-03-15T10:00:00Z',
    },
    {
      id: 'ord-4',
      workspaceId: WORKSPACE_ID,
      customerName: 'Fungi & Friends Market',
      status: 'Pending',
      items: [
        { id: 'oi-6', orderId: 'ord-4', productId: 'prod-5', quantity: 5 },
        { id: 'oi-7', orderId: 'ord-4', productId: 'prod-2', quantity: 3 },
      ],
      createdAt: '2025-03-17T11:00:00Z',
    },
    {
      id: 'ord-5',
      workspaceId: WORKSPACE_ID,
      customerName: 'Vitality Collective',
      status: 'Shipped',
      items: [
        { id: 'oi-8', orderId: 'ord-5', productId: 'prod-1', quantity: 12 },
        { id: 'oi-9', orderId: 'ord-5', productId: 'prod-3', quantity: 8 },
      ],
      createdAt: '2025-03-14T08:00:00Z',
    },
  ],

  inventoryActivity: [
    {
      id: 'ia-1',
      workspaceId: WORKSPACE_ID,
      actionType: 'Production Run',
      itemName: "Lion's Mane Tincture 100ml",
      itemType: 'product',
      referenceId: 'pr-1',
      changeAmount: +30,
      notes: 'Batch #LM-2025-031',
      createdAt: '2025-03-15T08:00:00Z',
    },
    {
      id: 'ia-2',
      workspaceId: WORKSPACE_ID,
      actionType: 'Order Shipped',
      itemName: 'Mushroom Blend Tincture 50ml',
      itemType: 'product',
      referenceId: 'ord-3',
      changeAmount: -8,
      notes: 'Order #ord-3 — Roots & Remedy',
      createdAt: '2025-03-15T10:00:00Z',
    },
    {
      id: 'ia-3',
      workspaceId: WORKSPACE_ID,
      actionType: 'Production Run',
      itemName: 'Cordyceps Capsules 60ct',
      itemType: 'product',
      referenceId: 'pr-2',
      changeAmount: +20,
      notes: 'Batch #CO-2025-028',
      createdAt: '2025-03-14T09:30:00Z',
    },
    {
      id: 'ia-4',
      workspaceId: WORKSPACE_ID,
      actionType: 'Order Shipped',
      itemName: "Lion's Mane Tincture 100ml",
      itemType: 'product',
      referenceId: 'ord-5',
      changeAmount: -12,
      notes: 'Order #ord-5 — Vitality Collective',
      createdAt: '2025-03-14T08:00:00Z',
    },
    {
      id: 'ia-5',
      workspaceId: WORKSPACE_ID,
      actionType: 'Production Run',
      itemName: 'Reishi Tincture 100ml',
      itemType: 'product',
      referenceId: 'pr-3',
      changeAmount: +15,
      notes: 'Batch #RE-2025-019',
      createdAt: '2025-03-13T10:00:00Z',
    },
    {
      id: 'ia-6',
      workspaceId: WORKSPACE_ID,
      actionType: 'Supplier Purchase',
      itemName: 'Alcohol 96%',
      itemType: 'input',
      referenceId: 'sup-2',
      changeAmount: +50,
      notes: 'Received from Bulk Apothecary',
      createdAt: '2025-03-12T14:00:00Z',
    },
    {
      id: 'ia-7',
      workspaceId: WORKSPACE_ID,
      actionType: 'Production Run',
      itemName: 'Chaga Extract Powder 100g',
      itemType: 'product',
      referenceId: 'pr-4',
      changeAmount: +10,
      notes: 'Batch #CH-2025-007',
      createdAt: '2025-03-12T11:00:00Z',
    },
    {
      id: 'ia-8',
      workspaceId: WORKSPACE_ID,
      actionType: 'Supplier Purchase',
      itemName: 'Glass Dropper Bottles 100ml',
      itemType: 'input',
      referenceId: 'sup-3',
      changeAmount: +200,
      notes: 'Received from SKS Bottle & Packaging',
      createdAt: '2025-03-11T10:00:00Z',
    },
    {
      id: 'ia-9',
      workspaceId: WORKSPACE_ID,
      actionType: 'Production Run',
      itemName: "Lion's Mane Tincture 100ml",
      itemType: 'product',
      referenceId: 'pr-5',
      changeAmount: +25,
      notes: 'Batch #LM-2025-030',
      createdAt: '2025-03-10T08:30:00Z',
    },
    {
      id: 'ia-10',
      workspaceId: WORKSPACE_ID,
      actionType: 'Order Shipped',
      itemName: 'Cordyceps Capsules 60ct',
      itemType: 'product',
      referenceId: 'ord-5',
      changeAmount: -8,
      notes: 'Order #ord-5 — Vitality Collective',
      createdAt: '2025-03-14T08:00:00Z',
    },
  ],
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
