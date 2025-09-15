# Deploying Full-Stack Poker Ledger to Vercel

Since you're creating a new repository, here's the complete deployment process:

## Prerequisites
- GitHub repository created and code pushed (see GITHUB_MIGRATION.md)
- Vercel account
- Supabase account

## Step 1: Set Up Supabase Database (5 minutes)

1. **Create Supabase account** at [supabase.com](https://supabase.com)
2. **Create new project**:
   - Name: `poker-ledger-db`
   - Password: Generate a strong one (save it!)
   - Region: Choose closest to you
3. **Get connection string**:
   - Go to Settings → Database
   - Copy the URI (starts with `postgresql://`)
   - Replace `[YOUR-PASSWORD]` with your actual password

## Step 2: Deploy Backend to Vercel (10 minutes)

1. **Go to** [vercel.com/new](https://vercel.com/new)
2. **Import your new repository**
3. **Configure the import**:
   - Root Directory: `poker-ledger-backend`
   - Framework Preset: Other
4. **Add environment variables**:
   ```
   DATABASE_URL = [your Supabase connection string]
   SECRET_KEY = [generate with: openssl rand -hex 32]
   FRONTEND_URL = https://poker-ledger-frontend.vercel.app
   ENVIRONMENT = production
   ```
   Note: Use a temporary FRONTEND_URL, we'll update it later
5. **Deploy!**
6. **Note your backend URL** (e.g., `https://poker-ledger-backend-username.vercel.app`)

## Step 3: Run Database Migrations (5 minutes)

```bash
cd poker-ledger-backend

# Create .env file with your Supabase URL
echo "DATABASE_URL=your_supabase_url_here" > .env

# Run migrations
alembic upgrade head
```

## Step 4: Deploy Frontend to Vercel (5 minutes)

1. **Go to** [vercel.com/new](https://vercel.com/new) again
2. **Import the same repository**
3. **Configure the import**:
   - Root Directory: `poker-ledger-settler`
   - Framework Preset: Create React App
4. **Add environment variable**:
   ```
   REACT_APP_API_URL = [your backend URL from Step 2]
   ```
   Example: `REACT_APP_API_URL = https://poker-ledger-backend-username.vercel.app`
5. **Deploy!**
6. **Note your frontend URL** (e.g., `https://poker-ledger-frontend-username.vercel.app`)

## Step 5: Update Backend CORS Settings (2 minutes)

1. **Go to your backend project** on Vercel dashboard
2. **Settings → Environment Variables**
3. **Update** `FRONTEND_URL` with your actual frontend URL from Step 4
4. **Redeploy** the backend (Deployments → ... → Redeploy)

## Step 6: Test Everything

1. Visit your frontend URL
2. Create a new account
3. Test all features:
   - Create game sessions
   - Add players (autocomplete should work)
   - Calculate settlements
   - Logout and login

## Quick Reference

Your deployed apps:
- **Frontend**: `https://poker-ledger-frontend-[username].vercel.app`
- **Backend**: `https://poker-ledger-backend-[username].vercel.app`
- **Database**: Hosted on Supabase

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
- Don't include trailing slashes

### Database Errors
- Check if Supabase project is active (pauses after 1 week on free tier)
- Verify DATABASE_URL is correct

### API Not Working
- Check REACT_APP_API_URL doesn't have `/api/v1` at the end
- Verify backend is deployed and running

## Custom Domains (Optional)

To use custom domains:
1. Frontend: Settings → Domains → Add `pokerledger.com`
2. Backend: Settings → Domains → Add `api.pokerledger.com`
3. Update `REACT_APP_API_URL` in frontend to new domain

## Success! 🎉

You now have:
- ✅ Separate frontend and backend deployments
- ✅ Professional GitHub repository
- ✅ Live URLs to share
- ✅ Full authentication system
- ✅ Database-backed application

Total deployment time: ~25 minutes 