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
