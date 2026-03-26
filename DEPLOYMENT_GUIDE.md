# TraceCore AI — Deployment & Setup Guide

This guide covers everything needed to deploy TraceCore AI to production, connect to Supabase, and push to GitHub.

## Quick Start (Development)

```bash
cd /home/ubuntu/tracecore-ai
npm install
npm run dev
```

The app will run at `http://localhost:3000` with mock data in localStorage.

## Architecture Overview

**Frontend Stack**: React 19 + Vite + TypeScript + Tailwind CSS 4
**State Management**: React Context + localStorage (development) or Supabase (production)
**Authentication**: Custom AuthContext (ready for Supabase integration)
**Commands**: AI command system with voice recognition support

## Deployment Scenarios

### Scenario 1: Vercel (Recommended)

Vercel provides the fastest path to production with zero-config deployment.

#### Step 1: Push to GitHub

```bash
cd /home/ubuntu/tracecore-ai
git init
git add .
git commit -m "Initial commit: TraceCore AI production-ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tracecore-ai.git
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Visit [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `tracecore-ai` repository
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

#### Step 3: Configure Environment Variables (Optional)

For Supabase integration:

1. In Vercel dashboard, go to Settings > Environment Variables
2. Add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
3. Redeploy

**Result**: Your app is live at `https://tracecore-ai-XXXX.vercel.app`

### Scenario 2: Netlify

Netlify is another excellent static hosting option.

#### Step 1: Connect GitHub Repository

1. Visit [https://app.netlify.com/signup](https://app.netlify.com/signup)
2. Click "Connect to Git"
3. Authorize GitHub and select `tracecore-ai`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

#### Step 2: Add Environment Variables

In Netlify dashboard > Site settings > Build & deploy > Environment:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Scenario 3: Self-Hosted (Docker)

For complete control over deployment.

#### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

#### Step 2: Build and Run

```bash
docker build -t tracecore-ai .
docker run -p 3000:3000 -e VITE_SUPABASE_URL=... -e VITE_SUPABASE_ANON_KEY=... tracecore-ai
```

## Supabase Integration

### Step 1: Create Supabase Project

1. Visit [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create
4. Wait for project to initialize

### Step 2: Get Credentials

In your Supabase project:

1. Go to Settings > API
2. Copy **Project URL** (VITE_SUPABASE_URL)
3. Copy **anon public** key (VITE_SUPABASE_ANON_KEY)

### Step 3: Create Database Schema

In Supabase SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  workspace_id UUID NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  stock_on_hand INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  customer_name TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL
);

-- Production Runs table
CREATE TABLE production_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Activity table
CREATE TABLE inventory_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  action_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  reference_id TEXT,
  change_amount INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for products)
CREATE POLICY "Users can view products in their workspace"
  ON products FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert products in their workspace"
  ON products FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM users WHERE id = auth.uid()
  ));
```

### Step 4: Enable Authentication

In Supabase dashboard:

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure email templates if needed

### Step 5: Update Frontend

In `client/src/contexts/AuthContext.tsx`, uncomment Supabase code:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// In login function:
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

## Custom Domain Setup

### Vercel

1. In Vercel project settings, go to Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `tracecore.yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel provides automatic SSL certificates

### Netlify

1. In Netlify site settings, go to Domain management
2. Click "Add custom domain"
3. Enter your domain
4. Update DNS records as instructed
5. Netlify provides automatic SSL certificates

## Monitoring & Maintenance

### Performance Monitoring

- Use Vercel Analytics (built-in)
- Monitor Core Web Vitals
- Track error rates

### Database Backups

For Supabase:

1. Enable automated backups in project settings
2. Set backup frequency (daily recommended)
3. Store backups in separate region for disaster recovery

### Updates & Security

```bash
# Check for dependency updates
npm outdated

# Update packages
npm update

# Audit security vulnerabilities
npm audit
npm audit fix
```

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify `package.json` scripts are correct
4. Try local build: `npm run build`

### Supabase Connection Issues

1. Verify credentials in environment variables
2. Check RLS policies are not blocking access
3. Ensure database tables exist
4. Test connection with Supabase CLI: `supabase status`

### Performance Issues

1. Enable Vercel Analytics
2. Check bundle size: `npm run build` and review dist folder
3. Optimize images and assets
4. Consider caching strategies

## Next Steps

1. **Add Authentication UI**: Create login/signup pages
2. **Implement Real-time Updates**: Use Supabase real-time subscriptions
3. **Add Notifications**: Integrate email/SMS alerts
4. **Mobile App**: Build React Native version
5. **API**: Create backend API for advanced features

## Support & Resources

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **React Docs**: [https://react.dev](https://react.dev)
- **Vite Docs**: [https://vitejs.dev](https://vitejs.dev)
