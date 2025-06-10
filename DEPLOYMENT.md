# BrAInstormer Deployment Guide

## 🚀 Netlify Deployment with Neon PostgreSQL

### Step 1: Create Neon Database (CURRENT STEP)

1. **Sign up for Neon**: Go to [neon.tech](https://neon.tech) and create a free account
2. **Create a new project**: Click "New Project" 
3. **Configure project**:
   - Project name: `brainstormer`
   - Database name: `brainstormer`
   - Region: Choose closest to your users
4. **Get connection string**: Copy the connection string from the dashboard
   - Format: `postgresql://username:password@hostname:5432/database_name`

### Step 2: Update Environment Variables

Create a new `.env.local` file with your production values:

```bash
# Database - Replace with your Neon connection string
DATABASE_URL="postgresql://your-neon-connection-string"

# NextAuth.js - IMPORTANT: Change these for production
NEXTAUTH_URL="https://your-netlify-domain.netlify.app"
NEXTAUTH_SECRET="your-super-secure-secret-key-here"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
```

### Step 3: Run Database Migration

```bash
# Install dependencies if needed
npm install

# Generate Prisma client for PostgreSQL
npx prisma generate

# Create and apply migration to Neon database
npx prisma migrate dev --name init

# Verify connection
npx prisma db push
```

### Step 4: Test Locally with PostgreSQL

```bash
# Start development server
npm run dev

# Test all features:
# - User signup/signin
# - Brainstorming with countdown
# - Project enhancement
# - Assignment and review
# - Q&A system
```

### Step 5: Deploy to Netlify

1. **Push to Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Netlify will auto-detect Next.js settings

3. **Add Environment Variables** in Netlify Dashboard:
   - `DATABASE_URL` = Your Neon connection string
   - `NEXTAUTH_URL` = Your Netlify domain (e.g., https://yourapp.netlify.app)
   - `NEXTAUTH_SECRET` = Strong random secret
   - `OPENAI_API_KEY` = Your OpenAI API key

4. **Deploy**: Click "Deploy site"

### Step 6: Post-Deployment Setup

1. **Update NEXTAUTH_URL**: Once deployed, update the environment variable with your actual Netlify URL
2. **Test Production**: Verify all functionality works in production
3. **Set up Custom Domain** (optional): Add your own domain in Netlify settings

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure DATABASE_URL is correct and Neon database is active
2. **NextAuth Errors**: Verify NEXTAUTH_URL matches your domain exactly
3. **Build Failures**: Check that all environment variables are set in Netlify
4. **Prisma Issues**: Run `npx prisma generate` before building

### Environment Variables Checklist:
- [ ] DATABASE_URL (Neon PostgreSQL)
- [ ] NEXTAUTH_URL (Your Netlify domain)
- [ ] NEXTAUTH_SECRET (Strong random string)
- [ ] OPENAI_API_KEY (From OpenAI dashboard)

## 📊 Database Schema

The app uses these tables:
- `users` - User accounts and authentication
- `projects` - Brainstormed projects with status tracking
- `project_assignments` - Project review assignments
- `reviews` - Reviewer notes and feedback
- `questions` - Questions from reviewers
- `answers` - Answers from project owners

## 🎯 Next Steps

After successful deployment:
1. Create multiple test users to verify assignment system
2. Test the full workflow: Brainstorm → Enhance → Assign → Review → Q&A
3. Monitor performance and optimize as needed
4. Set up error tracking (optional)

---

**Current Status**: Step 1 completed - Database migration configured ✅
**Next**: Create Neon database and update DATABASE_URL