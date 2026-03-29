# TraceCore AI - Project TODO

## Phase 1: Email Notification System
- [x] Implement tRPC email endpoint for banking details
- [x] Set up email sending after payment form submission

## Phase 2: Payment Page Display
- [x] Display banking details on payment confirmation page
- [x] Add FNB account information (T Jonker, 63198166035)
- [x] Show email form for customer notifications

## Phase 3: Sign Up Button & Flow
- [x] Update "Get Started" button to go directly to free trial (/app)
- [x] Keep "Sign In" button for existing users (OAuth login)
- [x] Update hero section CTA button to match

## Phase 4: Upgrade Buttons in Sidebar
- [x] Add Subscription Plan section to Settings page
- [x] Display current plan (Free tier)
- [x] Show item limit (5/∞)
- [x] Add "View Plans" and "Upgrade to Pro" buttons
- [x] Add gradient styling to make upgrade section prominent

## Phase 5: Testing & Publishing
- [x] Verify landing page routing (Get Started → /app, Sign In → OAuth)
- [x] Verify Settings page shows upgrade section
- [x] Verify all pages render without errors
- [x] Check dev server status

## Phase 6: Landing Page & Onboarding Improvements
- [x] Create dashboard preview carousel (Home, Products, Orders screens)
- [x] Implement clean onboarding for new clients (empty dashboard)
- [x] Redirect new clients to Settings page for business setup

## Phase 7: Suppliers Page Enhancements
- [x] Add description field to suppliers
- [x] Add email field to suppliers
- [x] Add contact details field to suppliers
- [x] Add website field to suppliers
- [x] Add upgrade section to Suppliers page

## Additional Features (Future)
- [ ] Connect Supabase database (replace localStorage)
- [ ] Deploy to Vercel
- [ ] Connect custom domains (tracecoreai.com, tracecoreai.co.za)
- [ ] WooCommerce integration
- [ ] WordPress integration
- [ ] QuickBooks integration
- [ ] Xero integration
- [ ] Paystack payment gateway (pending approval)
- [ ] Marketing assets (social media graphics, ad copy)

## Known Issues (Resolved)
- ✅ OAuth login endpoint fixed
- ✅ Free trial access enabled
- ✅ Payment page routing fixed
- ✅ Dashboard preview image added
- ✅ Nested anchor tag errors fixed
- ✅ Voice command system optimized for mobile

## Phase 8: Critical Onboarding & Navigation Fixes
- [x] Upload and replace carousel images with user-provided screenshots (t1, t2, t3)
- [x] Fix onboarding: ensure clean dashboard loads, then redirects to Settings
- [x] Add upgrade button to sidebar navigation
- [x] Add upgrade button to top navigation bar
- [ ] Test "Get Started Free" flow end-to-end
- [ ] Verify Settings page loads without demo data
- [ ] Verify redirect to Settings happens automatically for new clients

## Phase 9: Fixed Signup Flow to Settings
- [x] Changed "Get Started Free" button to redirect to /settings instead of /app
- [x] Changed "Start Free Trial" button to redirect to /settings instead of /app
- [x] Hide sidebar when on Settings page for clean setup experience
- [x] Remove auto-redirect logic from DashboardLayout

## Phase 10: Settings Page Improvements
- [x] Clear demo workspace name (empty field for user input)
- [x] Expand business types to 10+ options (15 total)
- [x] Make team members section editable (add/edit/delete buttons)
- [x] Add workflow customization toggles (Inputs, Orders, Shipping, Production Runs)
- [x] Test all Settings page changes

## Phase 11: Dashboard Navigation from Settings
- [x] Add save success state tracking
- [x] Add "Explore Dashboard" button that appears after saving
- [x] Button navigates to /app dashboard
- [x] Button disappears after 5 seconds if not clicked

## Phase 12: Clean Slate Dashboard Verification
- [x] EMPTY_STATE has all empty arrays (suppliers, inputs, products, production runs, orders, inventory activity)
- [x] AppContext uses EMPTY_STATE for new users
- [x] New users get completely clean dashboard with no demo data
- [x] Users can start adding their own data immediately

## Phase 13: Voice Command Execution System
- [x] Wire voice commands to execute app actions (add product, mark shipped, etc.)
- [x] Create voice command handlers for each action
- [x] Add visual feedback when voice commands execute
- [x] Test all voice commands end-to-end

## Phase 14: Admin Payment Dashboard
- [x] Create admin payment dashboard page
- [x] Display incoming payments with timestamps
- [x] Add manual payment confirmation button
- [x] One-click account upgrade trigger
- [x] Payment history and status tracking

## Phase 15: Email Template Customization
- [x] Create email template editor in Settings
- [x] Allow users to customize banking details email
- [x] Add company logo upload
- [x] Add custom payment terms field
- [x] Add custom message field
- [x] Preview email before saving

## Phase 16: Connect Payment Dashboard to tRPC Backend
- [x] Create payment database helpers in server/db.ts
- [x] Implement tRPC payment queries (list, stats, getById)
- [x] Implement tRPC payment mutations (confirm, reject, create)
- [x] Connect AdminPaymentDashboard to tRPC hooks
- [x] Add real-time payment filtering and search
- [x] Implement CSV export functionality
- [x] Add payment detail modal with actions
- [x] Create comprehensive payment router tests (22 tests)
- [x] All tests passing (43 total)


## Phase 17: Redesign Signup Page for All Business Types
- [x] Update hero text from "manufacturing" to "business operations"
- [x] Rewrite operations workflow description for broader audience (retail, wholesale, services, etc.)
- [x] Create customizable workflow builder component with 4 templates
- [x] Allow users to define custom workflow stages (add/remove/edit/reorder)
- [x] Integrate workflow builder into signup page
- [x] Add "Why Choose TraceCore" section highlighting customization
- [x] Create 23 comprehensive WorkflowBuilder tests
- [x] All 66 tests passing


## Phase 18: Save User Workflows to Database
- [x] Add workflow_stages table to database schema
- [x] Add workflow_analytics table to database schema
- [x] Create database helpers for workflow operations
- [x] Create tRPC procedures for saving/retrieving workflows
- [x] Database migration completed successfully

## Phase 19: Expand Workflow Templates Gallery
- [x] Add 6 new industry-specific templates (E-Commerce, SaaS/Tech, Real Estate, Food & Beverage, Logistics)
- [x] Update WorkflowBuilder with 10 total templates
- [x] Add template descriptions and use case info
- [x] All templates include emoji icons and color coding

## Phase 20: Workflow Analytics Dashboard
- [x] Create workflow analytics tRPC router with 5 procedures
- [x] Create WorkflowAnalytics admin dashboard page
- [x] Display template usage charts (bar chart + pie chart)
- [x] Show customization statistics table
- [x] Display recent events log
- [x] Add CSV export functionality
- [x] Add refresh button for real-time updates
- [x] Integrated analytics link into sidebar (admin only)
- [x] All 90 tests passing (24 workflow + 9 payment + 23 builder + 11 email + 22 payment router + 1 auth)


## Phase 21: Cost & Margin Tracking System
- [x] Create tRPC products router with CRUD procedures (createProduct, updateProduct, getProducts, deleteProduct)
- [x] Build products management UI page at /app/products with form for adding/editing products
- [x] Implement real-time profit margin calculations in products form
- [x] Create profit margin reporting dashboard showing inventory value, selling value, and margin %
- [x] Write comprehensive tests for products router and margin calculations (23 tests passing)
- [x] Verify admin payment analytics is accessible from sidebar
- [x] Add Profit Margin Report page with CSV export
- [x] Integrate products router into main tRPC router
- [x] Add Products and Profit Margin links to sidebar navigation


## Bug Fixes
- [x] Products page crashes when accessing /products - Fixed: getWorkspaceWithPayments was expecting workspaceId but receiving userId
- [x] Created new getWorkspaceByUserId helper function in db.ts
- [x] Updated all 6 products router procedures to use getWorkspaceByUserId(ctx.user.id)
- [x] Updated products tests to mock getWorkspaceByUserId
- [x] Products page crashes 5 seconds after load - Fixed: Removed error callbacks from tRPC queries that were triggering redirects
- [x] Rewrote Products.tsx with proper error handling and graceful fallbacks
- [x] All 113 tests passing, zero TypeScript errors

- [x] Fixed Sign In button not working - Updated OAuth login endpoint to accept frontend origin parameter
- [x] getLoginUrl now passes window.location.origin to server for correct redirect URI
- [x] OAuth callback now uses correct domain for deployed environment

- [x] Implemented local sign-in endpoint at /api/auth/local-signin to bypass OAuth when auth.manus.im is unreachable
- [x] Added sign-in dialog to Landing page with email and name fields
- [x] Local sign-in creates session and redirects to dashboard
- [x] All 113 tests passing with local sign-in implementation

- [x] Fixed local sign-in redirect - added 500ms delay to ensure session cookie is set before redirecting
- [x] Added better error logging to debug sign-in issues
- [x] All 113 tests passing with redirect fix

- [x] Fixed sign-in redirect URL from "/" to "/app" to go to dashboard instead of landing page
- [x] All 113 tests passing with correct redirect


## Phase 22: Test Products Page & Continue Features
- [ ] Test Products page end-to-end (add product, verify margins, delete, check report updates)
- [ ] Add Inventory Activity Tracking with purchase/sale/adjustment transactions
- [ ] Implement Product Search by name/SKU and filter by margin range
- [ ] Add product categorization with category-level margin analysis
- [ ] Implement bulk price adjustments with impact preview

- [x] Fixed critical routing bug - moved Landing route to end so /products reaches DashboardRouter
- [x] Products page now properly renders with DashboardLayout
- [x] All 113 tests passing with routing fix


## Current Issues
- [x] Products page crashes 2 seconds after loading - Fixed: getDb() was checking process.env.DATABASE_URL instead of ENV.databaseUrl
- [x] Changed getDb() to use ENV.databaseUrl from server/_core/env.ts
- [x] All 113 tests passing with database fix

- [x] Fixed Products page 401 UNAUTHORIZED error - Root cause: user had no workspace after local sign-in
- [x] Added createWorkspace() function to server/db.ts
- [x] Updated local sign-in endpoint to create workspace for user when they sign in
- [x] All 113 tests passing with workspace creation fix


## Phase 23: Complete Supply Chain Tracking (Inputs → Products → Profit)

### Database Schema Updates
- [x] Created inputs table in drizzle/schema.ts with: id, workspaceId, name, description, supplierId, costPerUnit, unit, currentStock, lowStockThreshold
- [x] Ran pnpm db:push - migration applied successfully (0007_bouncy_aqueduct.sql)
- [x] Inputs table now tracks raw materials (powder, oils, capsules, etc.) purchased from suppliers

### Inputs Management Page
- [x] Created tRPC inputs router with 5 CRUD procedures: list, create, update, delete, getById
- [x] Created Inputs page at /app/inputs with add/edit/delete form
- [x] Shows input name, description, cost per unit, unit type (kg, liters, units, etc.)
- [x] Displays list of all inputs with edit/delete action buttons
- [x] Integrated inputs router into main tRPC router
- [x] Fixed App.tsx import to use named import for Inputs component
- [ ] Add sidebar link to Inputs page

### Products Page Updates
- [ ] Update Products form to link to inputs (dropdown to select which input is used)
- [ ] Add conversion_ratio field (e.g., "1kg input makes 100 capsules")
- [ ] Calculate input_cost_per_unit automatically (input cost / conversion ratio)
- [ ] Show input cost in product list and edit form
- [ ] Update margin calculation to include input cost

### Profit Margin Report Enhancement
- [ ] Add "Input Cost" column showing cost per unit from linked input
- [ ] Add "Product Selling Price" column
- [ ] Add "Profit Per Unit" column (selling price - input cost)
- [ ] Add "Margin %" column (profit / selling price * 100)
- [ ] Add summary showing total input value, total product value, total profit
- [ ] Add filter by input type to see which inputs are most profitable

### Testing
- [x] All 113 tests passing with inputs router integration
- [ ] Write tests for inputs router (CRUD operations)
- [ ] Write tests for supply chain calculations (input cost → product profit)
- [ ] Write tests for profit margin report with inputs included

### End-to-End Testing
- [ ] Add an input (e.g., "Powder", 2000 rand per kg)
- [ ] Add a product linked to that input (e.g., "Capsules", 5000 rand, 1kg makes 100 capsules)
- [ ] Verify product shows input cost (20 rand per capsule)
- [ ] Verify profit margin report shows full chain
- [ ] Test editing input cost and verify product margins update


## Phase 24: Inventory Activity Log
- [x] Create inventory_activity table in schema to track transactions (purchase, sale, adjustment)
- [x] Add tRPC router for inventory activities with CRUD procedures
- [x] Create Inventory Activity page showing transaction history with timestamps
- [x] Add filters by transaction type, date range, product
- [x] Implement cost history tracking for trend analysis
- [x] Integrated inventory router into main tRPC router
- [x] InventoryLog page at /app/inventory-log with full transaction tracking

## Phase 25: Batch/Lot Tracking
- [x] Add batch_number, expiry_date, quality_status fields to products table
- [x] Create batchLots table with batch management schema
- [x] Implement batch/lot tracking with quality status (pending, approved, rejected, expired)
- [x] Add expiry date tracking and getExpiringBatches helper
- [x] Create tRPC batches router with 6 procedures (list, create, getById, update, delete, getExpiring)
- [x] Integrated batches router into main tRPC router
- [x] Database migration applied successfully (0009_abnormal_stingray.sql)
- [x] Comprehensive batch tests written and passing (6 tests)

## Phase 26: Supplier Management
- [x] Create supplierPricingHistory table for tracking price changes over time
- [x] Create supplierPerformance table with metrics (on-time delivery, quality issues, ratings)
- [x] Create tRPC suppliers router with 9 procedures
- [x] Add database helpers for supplier operations
- [x] Integrated suppliers router into main tRPC router
- [x] Database migration applied successfully (0010_blue_prowler.sql)
- [x] All 119 tests passing (8 test files, 0 TypeScript errors)


## Phase 27: Build Batch/Lot Management UI Page
- [x] Create Batches page at /app/batches with batch list and management forms
- [x] Add form to create new batch with batchNumber, quantity, expiryDate, qualityStatus
- [x] Implement edit batch form with pre-filled values
- [x] Add delete batch with confirmation dialog
- [x] Display batch list with columns: batchNumber, quantity, expiryDate, qualityStatus, actions
- [x] Add filter by quality status and product
- [x] Show expiry date warnings (red for expired, yellow for expiring soon)
- [x] Add sidebar link to Batches page
- [x] Batches page fully functional with real-time expiry tracking

## Phase 28: Create Supplier Performance Dashboard
- [x] Create SupplierPerformance page at /app/supplier-performance
- [x] Display supplier list with performance metrics (on-time delivery %, quality issues, rating)
- [x] Add charts: on-time delivery trend, quality issues over time, supplier ratings
- [x] Show pricing history for each supplier with price trend chart
- [x] Add supplier comparison table (side-by-side metrics)
- [x] Implement CSV export for supplier performance data
- [x] Add filter by date range and supplier
- [x] Add sidebar link to Supplier Performance page
- [x] Dashboard shows all supplier KPIs and performance trends

## Phase 29: Implement Inventory Alerts System
- [x] Create alerts table in database schema with type, severity, isRead fields
- [x] Add tRPC alerts router with 6 procedures: list, create, getUnread, markAsRead, markAllAsRead, delete, getById
- [x] Database migration 0011_tearful_nicolaos.sql applied successfully
- [x] Alerts backend fully integrated with workspace isolation
- [x] All 119 tests passing (8 test files)
- [ ] Create alerts history page at /app/alerts (UI component)
- [ ] Add alerts bell icon to top navigation with unread count
- [ ] Implement real-time alert notifications (toast notifications)
