# Vidhya X — Production Deployment Guide

## 1. Hosting Architecture
Vidhya X is a high-performance Single Page Application (SPA) built with React, TypeScript, and Vite. It can be hosted on any modern static CDN platform:
- **Vercel**
- **Cloudflare Pages**
- **Netlify**
- **Google Cloud Run / Firebase App Hosting**

---

## 2. Environment Variables Configuration
In your production hosting dashboard (e.g. Vercel Project Settings > Environment Variables), define:
```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
```

*Never expose `SUPABASE_SERVICE_ROLE_KEY` in static hosting environment variables.*

---

## 3. Build & Output Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Rewrites**: Ensure all unmatched routes rewrite to `/index.html` (e.g. `vercel.json` or `_redirects` for React Router).

Example `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. Supabase Edge Functions Deployment
Install the Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref [YOUR-PROJECT-ID]

# Deploy functions
supabase functions deploy purchase-approval
supabase functions deploy secure-pdf-url
supabase functions deploy test-scoring
supabase functions deploy admin-provision
```
