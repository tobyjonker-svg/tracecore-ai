# TraceCore AI Environment Setup

This document describes how to configure TraceCore AI for different deployment scenarios.

## Development (Default)

The app works out of the box with mock data stored in localStorage. No environment variables are required.

```bash
npm run dev
```

## Production with Supabase

To connect to Supabase for persistent data storage and authentication:

### 1. Create a Supabase Project

Visit [https://supabase.com](https://supabase.com) and create a new project.

### 2. Set Environment Variables

Create a `.env.local` file in the project root with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Schema

In your Supabase SQL editor, run the SQL schema provided in `client/src/lib/supabase.ts` (see the SQL comments section).

### 4. Enable Authentication

In Supabase dashboard, enable Email/Password authentication under Authentication > Providers.

### 5. Update AuthContext

Uncomment the Supabase integration code in `client/src/contexts/AuthContext.tsx`:

```typescript
// Uncomment these lines:
// import { createClient } from '@supabase/supabase-js';
// const { data, error } = await supabase.auth.signInWithPassword({ email, password });
```

### 6. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## GitHub Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TraceCore AI"
git branch -M main
git remote add origin https://github.com/your-username/tracecore-ai.git
git push -u origin main
```

### 2. Create `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Vercel Deployment

### 1. Connect GitHub Repository

Visit [https://vercel.com](https://vercel.com), sign in, and import your GitHub repository.

### 2. Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Add Environment Variables

In Vercel project settings, add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Deploy

Click "Deploy" and Vercel will automatically build and deploy your app.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `VITE_APP_TITLE` | No | Application title |
| `VITE_APP_LOGO` | No | Application logo URL |
| `VITE_ENABLE_VOICE_COMMANDS` | No | Enable voice command feature |
| `VITE_ENABLE_AI_COMMANDS` | No | Enable AI command feature |

## Troubleshooting

### Supabase Connection Issues

1. Verify your URL and key are correct
2. Check that RLS policies are properly configured
3. Ensure database tables exist (run the SQL schema)

### Build Errors

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear build cache: `rm -rf dist`
3. Check TypeScript errors: `npm run check`

### Deployment Issues

1. Check Vercel build logs for errors
2. Ensure all environment variables are set
3. Verify GitHub repository is connected correctly
