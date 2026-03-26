/**
 * TraceCore AI — Supabase Integration
 * Configuration and client setup for Supabase backend.
 * 
 * To activate:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local
 * 3. Uncomment the initialization code below
 */

// import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get config from environment
export const supabaseConfig: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Initialize Supabase client when ready
// export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

/**
 * Database schema (SQL) to create in Supabase:
 * 
 * -- Users table (extends Supabase auth)
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id),
 *   email TEXT UNIQUE NOT NULL,
 *   name TEXT,
 *   workspace_id UUID NOT NULL,
 *   role TEXT DEFAULT 'user',
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Workspaces table
 * CREATE TABLE workspaces (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   business_type TEXT NOT NULL,
 *   custom_category TEXT,
 *   custom_product_label TEXT,
 *   custom_supplier_label TEXT,
 *   custom_order_label TEXT,
 *   custom_inventory_label TEXT,
 *   low_stock_threshold_default INTEGER DEFAULT 10,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Suppliers table
 * CREATE TABLE suppliers (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id),
 *   name TEXT NOT NULL,
 *   contact_info TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Inputs (raw materials) table
 * CREATE TABLE inputs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id),
 *   supplier_id UUID NOT NULL REFERENCES suppliers(id),
 *   name TEXT NOT NULL,
 *   stock_on_hand INTEGER DEFAULT 0,
 *   unit TEXT DEFAULT 'unit',
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Products table
 * CREATE TABLE products (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id),
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   stock_on_hand INTEGER DEFAULT 0,
 *   low_stock_threshold INTEGER DEFAULT 10,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Production Runs table
 * CREATE TABLE production_runs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id),
 *   product_id UUID NOT NULL REFERENCES products(id),
 *   quantity INTEGER NOT NULL,
 *   notes TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Orders table
 * CREATE TABLE orders (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id),
 *   customer_name TEXT NOT NULL,
 *   status TEXT DEFAULT 'Pending',
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Order Items table
 * CREATE TABLE order_items (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   order_id UUID NOT NULL REFERENCES orders(id),
 *   product_id UUID NOT NULL REFERENCES products(id),
 *   quantity INTEGER NOT NULL
 * );
 * 
 * -- Inventory Activity table
 * CREATE TABLE inventory_activity (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   workspace_id UUID NOT NULL REFERENCES workspaces(id),
 *   action_type TEXT NOT NULL,
 *   item_name TEXT NOT NULL,
 *   item_type TEXT NOT NULL,
 *   reference_id TEXT,
 *   change_amount INTEGER,
 *   notes TEXT,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security (RLS)
 * ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE inputs ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE inventory_activity ENABLE ROW LEVEL SECURITY;
 * 
 * -- RLS Policies (example for products)
 * CREATE POLICY "Users can view products in their workspace"
 *   ON products FOR SELECT
 *   USING (workspace_id IN (
 *     SELECT workspace_id FROM users WHERE id = auth.uid()
 *   ));
 * 
 * CREATE POLICY "Users can insert products in their workspace"
 *   ON products FOR INSERT
 *   WITH CHECK (workspace_id IN (
 *     SELECT workspace_id FROM users WHERE id = auth.uid()
 *   ));
 */

// Helper functions for common Supabase operations
export const supabaseHelpers = {
  /**
   * Fetch products for a workspace
   */
  async fetchProducts(workspaceId: string) {
    // return supabase
    //   .from('products')
    //   .select('*')
    //   .eq('workspace_id', workspaceId)
    //   .order('created_at', { ascending: false });
  },

  /**
   * Create a new product
   */
  async createProduct(workspaceId: string, product: any) {
    // return supabase
    //   .from('products')
    //   .insert([{ ...product, workspace_id: workspaceId }]);
  },

  /**
   * Update product stock
   */
  async updateProductStock(productId: string, stockOnHand: number) {
    // return supabase
    //   .from('products')
    //   .update({ stock_on_hand: stockOnHand })
    //   .eq('id', productId);
  },

  /**
   * Fetch orders for a workspace
   */
  async fetchOrders(workspaceId: string) {
    // return supabase
    //   .from('orders')
    //   .select('*, order_items(*)')
    //   .eq('workspace_id', workspaceId)
    //   .order('created_at', { ascending: false });
  },

  /**
   * Create a new order
   */
  async createOrder(workspaceId: string, order: any) {
    // return supabase
    //   .from('orders')
    //   .insert([{ ...order, workspace_id: workspaceId }]);
  },

  /**
   * Fetch inventory activity log
   */
  async fetchInventoryActivity(workspaceId: string) {
    // return supabase
    //   .from('inventory_activity')
    //   .select('*')
    //   .eq('workspace_id', workspaceId)
    //   .order('created_at', { ascending: false });
  },
};
