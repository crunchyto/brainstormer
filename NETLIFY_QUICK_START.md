# ⚡ Quick Start: Deploy BrAInstormer to Netlify

## 🎯 5-Minute Deployment Guide

### Step 1: Connect to Netlify (2 minutes)
1. Go to [netlify.com](https://netlify.com) and login with GitHub
2. Click **"New site from Git"**
3. Select **GitHub** and authorize Netlify
4. Choose repository: **`crunchyto/brainstormer`**
5. Keep default settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click **"Deploy site"**

### Step 2: Configure Environment Variables (2 minutes)
Go to **Site Settings → Environment Variables** and add:

```bash
DATABASE_URL
postgresql://neondb_owner:npg_Ik4fq6hvRVAX@ep-tiny-sky-a265ydho-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET  
bf8c12a847d8f5c9e3b2a1d9f6e4c7b5a8d3f2e1c6b9a4d7f0e3c8b5a2d9f6e1c4

OPENAI_API_KEY
your-openai-api-key-here

NEXT_TELEMETRY_DISABLED
1
```

### Step 3: Update Domain and Redeploy (1 minute)
1. Copy your Netlify domain (e.g., `amazing-app-123.netlify.app`)
2. Add environment variable:
   ```
   NEXTAUTH_URL
   https://YOUR-DOMAIN.netlify.app
   ```
3. Go to **Deploys** and click **"Trigger deploy"**

## ✅ Deployment Complete!

Your BrAInstormer app should now be live! 🎉

### Test Your Deployment:
1. Visit your Netlify URL
2. Create a new account
3. Start a brainstorming session
4. Test the full workflow

---

**Need detailed instructions?** See `NETLIFY_DEPLOYMENT.md`

**Issues?** Run `npm run deploy:check` locally first