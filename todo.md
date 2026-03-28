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


## Phase 21: Redesign Free Trial Signup Flow
- [ ] Review current signup/trial pages
- [ ] Remove "Danger Zone" section from trial page
- [ ] Replace with workflow template gallery (Step 1)
- [ ] Build template picker with customization
- [ ] Create business details form (Step 2)
- [ ] Add currency selection (ZAR + others)
- [ ] Add region/country selection
- [ ] Add language selection
- [ ] Create multi-step form navigation
- [ ] Add form state management
- [ ] Implement multi-language support (i18n)
- [ ] Test complete signup flow end-to-end


## Phase 21: Redesign Free Trial Signup Flow
- [x] Review current signup/trial pages
- [x] Create new SignupFlow multi-step page (replaces /settings redirect)
- [x] Step 1: Workflow template gallery with 10 templates
- [x] Step 1: Workflow customization with WorkflowBuilder
- [x] Step 2: Business details form (business name, currency, region, language)
- [x] Step 2: Currency selection (10 currencies including ZAR, USD, EUR, etc.)
- [x] Step 2: Region/country selection (11 regions including African countries)
- [x] Step 2: Language selection (10 languages including South African languages)
- [x] Step 3: Account creation (email, password, confirmation)
- [x] Multi-step form navigation (Back/Next buttons with validation)
- [x] Form state management (persist data across all steps)
- [x] Progress indicator showing current step
- [x] Summary cards showing selected configuration
- [x] Landing page buttons now point to /signup
- [x] Created 35 comprehensive SignupFlow tests
- [x] All 125 tests passing


## Phase 22: Connect Signup Form to Backend Account Creation
- [x] Review user schema and add workflow/business detail fields to workspaces table
- [x] Add database migration for new fields (workflowTemplate, workflowStages, currency, region, language)
- [x] Create database helper functions (createUserWithSignup, getUserByEmail, getWorkspaceByUserId)
- [x] Create tRPC signup procedure with validation
- [x] Add email uniqueness validation
- [x] Add checkEmailAvailable tRPC query
- [x] Connect SignupFlow form to tRPC signup mutation
- [x] Handle signup errors and display validation messages with toast
- [x] Add loading state and spinner during signup
- [x] Save workflow configuration to database (JSON format)
- [x] Save business details (currency, region, language) to workspace
- [x] Create workspace for new user with free tier
- [x] Redirect to dashboard after signup
- [x] Create 33 comprehensive auth router tests
- [x] All 158 tests passing (35 signup + 23 builder + 24 workflow + 22 payment + 33 auth + 11 email + 9 dashboard + 1 logout)


## Phase 23: Fix Dashboard to Display User's Business Name and Workflow
- [x] Load workspace data after signup completion using trpc.auth.getWorkspace
- [x] Update AppContext with user's workspace information
- [x] Display user's business name in Home page greeting (from workspace.name)
- [x] Load user's workflow stages from database
- [x] Filter sidebar navigation to show only selected workflow stages
- [x] Removed hardcoded workflow items that weren't selected
- [x] Keep core items (Home, Settings, Reports, Inventory Activity, Upgrade, AI Assistant)
- [x] Dynamic navigation filters based on workflow stage names
- [x] Verify business name displays correctly in greeting
- [x] Verify business name persists across page refreshes
- [x] All 158 tests passing


## Phase 24: Fix Home Page and Settings to Match User's Workflow
- [x] Fix production volume chart to show flat line (0 data) for new users
- [x] Fix orders trend chart to show flat line (0 data) for new users
- [x] Update Core Operations Workflow section to show only user's selected workflow stages
- [x] Remove workflow stages that user didn't select (e.g., don't show "Production" for Retail users)
- [x] Add "Customize" button to home page workflow section
- [x] Create WorkflowCustomizer modal component for home page and settings
- [x] Allow users to add/remove stages from their workflow
- [x] Update Settings page to display user's workflow configuration
- [x] Add workflow editing capability to Settings page with Customize button
- [x] Workflow changes saved to AppContext (persisted in localStorage)
- [x] Created WorkflowCustomizer component with 4 workflow stages
- [x] All 158 tests passing (no regressions)
- [x] TypeScript compilation with no errors
- [x] Dev server running smoothly with HMR updates


## Phase 25: Fix Business Name Persistence & Add Workflow Stage Customization
- [ ] Fix business name not persisting from signup to dashboard (Maninki 3D should display)
- [ ] Verify workspace name is loaded from database after signup
- [ ] Add workflow stage name customization (allow renaming "Raw Materials" to "Toys", etc.)
- [ ] Create workflow stage editor in Settings page
- [ ] Allow users to customize each stage name and icon
- [ ] Save custom stage names to database
- [ ] Display custom stage names in sidebar and home page

## Phase 26: Build Comprehensive Guided Onboarding Tour
- [ ] Create OnboardingTour component with multi-step walkthrough
- [ ] Step 1: Welcome & business name confirmation
- [ ] Step 2: Workflow overview (show selected stages)
- [ ] Step 3: Workflow stage customization (rename stages)
- [ ] Step 4: Home dashboard overview
- [ ] Step 5: Sidebar navigation tour
- [ ] Step 6: AI setup walkthrough
- [ ] Step 7: Settings configuration
- [ ] Step 8: Voice commands setup
- [ ] Step 9: Getting started (first product/order)
- [ ] Auto-start tour for new users
- [ ] Allow users to skip or resume tour
- [ ] Mark tour as complete in workspace
