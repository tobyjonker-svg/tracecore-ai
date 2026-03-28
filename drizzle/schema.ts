import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Workspaces - each company/business gets one workspace
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  logo: text("logo"), // URL to logo
  branding: text("branding"), // JSON string for custom colors, fonts, etc.
  tier: mysqlEnum("tier", ["free", "pro", "pro_plus"]).default("free").notNull(),
  // Workflow and business details from signup
  workflowTemplate: varchar("workflowTemplate", { length: 100 }), // e.g., 'Manufacturing', 'Retail', etc.
  workflowStages: text("workflowStages"), // JSON array of workflow stages
  currency: varchar("currency", { length: 3 }).default("ZAR").notNull(), // ZAR, USD, EUR, etc.
  region: varchar("region", { length: 50 }).default("ZA").notNull(), // Country/region code
  language: varchar("language", { length: 10 }).default("en").notNull(), // Language code
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

// Subscriptions - track active subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  tier: mysqlEnum("tier", ["free", "pro", "pro_plus"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  paystackReference: varchar("paystackReference", { length: 255 }), // Paystack subscription reference
  monthlyAmount: int("monthlyAmount"), // Amount in kobo (1 ZAR = 100 kobo)
  nextBillingDate: timestamp("nextBillingDate"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Payments - track all transactions
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  subscriptionId: int("subscriptionId"),
  amount: int("amount").notNull(), // Amount in kobo
  currency: varchar("currency", { length: 3 }).default("ZAR").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  paystackReference: varchar("paystackReference", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // card, eft, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Usage tracking - for tier limits (Free: 5 limit, Pro/Pro Plus: unlimited)
export const usageTracking = mysqlTable("usageTracking", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  productsCount: int("productsCount").default(0).notNull(),
  suppliersCount: int("suppliersCount").default(0).notNull(),
  inputsCount: int("inputsCount").default(0).notNull(),
  clientsCount: int("clientsCount").default(0).notNull(),
  productionRunsCount: int("productionRunsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

// WooCommerce integrations - for syncing orders
export const woocommerceIntegrations = mysqlTable("woocommerceIntegrations", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  storeUrl: varchar("storeUrl", { length: 255 }).notNull(),
  consumerKey: varchar("consumerKey", { length: 255 }).notNull(),
  consumerSecret: varchar("consumerSecret", { length: 255 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WoocommerceIntegration = typeof woocommerceIntegrations.$inferSelect;
export type InsertWoocommerceIntegration = typeof woocommerceIntegrations.$inferInsert;


// Workflow Stages - store user's custom workflow configuration
export const workflowStages = mysqlTable("workflowStages", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  stageOrder: int("stageOrder").notNull(), // 1, 2, 3, etc.
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull(), // emoji
  color: varchar("color", { length: 50 }).notNull(), // bg-color class
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkflowStage = typeof workflowStages.$inferSelect;
export type InsertWorkflowStage = typeof workflowStages.$inferInsert;

// Workflow Analytics - track template usage and customizations
export const workflowAnalytics = mysqlTable("workflowAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId"),
  templateUsed: varchar("templateUsed", { length: 100 }), // Manufacturing, Retail, Service, etc.
  customizationCount: int("customizationCount").default(0).notNull(), // How many stages were customized
  stagesCount: int("stagesCount").notNull(), // Total number of stages
  source: varchar("source", { length: 50 }).default("landing").notNull(), // landing, settings, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkflowAnalytics = typeof workflowAnalytics.$inferSelect;
export type InsertWorkflowAnalytics = typeof workflowAnalytics.$inferInsert;


// Suppliers - track suppliers and their information
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  contactPerson: varchar("contactPerson", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// Products - track products with cost and selling price
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }),
  // Cost tracking
  costPerUnit: int("costPerUnit"), // Cost in cents (e.g., 6000 = 60.00 ZAR)
  currency: varchar("currency", { length: 3 }).default("ZAR").notNull(),
  // Selling price tracking
  sellingPrice: int("sellingPrice"), // Selling price in cents
  // Inventory
  currentStock: int("currentStock").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Inventory Activity - track all inventory movements
export const inventoryActivity = mysqlTable("inventoryActivity", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  productId: int("productId").notNull(),
  type: mysqlEnum("type", ["purchase", "sale", "adjustment", "production"]).notNull(),
  quantity: int("quantity").notNull(),
  costPerUnit: int("costPerUnit"), // Cost per unit at time of transaction
  sellingPrice: int("sellingPrice"), // Selling price at time of transaction
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryActivity = typeof inventoryActivity.$inferSelect;
export type InsertInventoryActivity = typeof inventoryActivity.$inferInsert;
