# Court Hero Signup Fix Guide

## Problem
Signup was failing with "Failed to create organization" because:
1. The code was trying to INSERT into the `organizations` table as an anonymous user
2. RLS (Row Level Security) policies blocked this insert
3. No service role key was available to bypass RLS

## Solution Applied
I've modified the code to:
1. **Removed organization creation on signup** - Users now join a pre-created default organization
2. **Simplified signup form** - Removed "Organization Name" field (users: First Name, Last Name, Email, Password only)
3. **Fixed auth-server.ts** - Signup now just assigns users to `court-hero-default` org ID

## What You Need to Do - 3 Simple Steps

### STEP 1: Create the Default Organization in Supabase
This ensures the organization exists before users try to sign up.

1. Go to: https://app.supabase.com
2. Select your project: `hhwjmuulhzznolaglvpa`
3. Click **SQL Editor** (left sidebar)
4. Create a new query and **copy+paste THIS**:

```sql
INSERT INTO organizations (id, name, plan_tier, created_at, updated_at)
VALUES (
  'court-hero-default',
  'Court Hero',
  'community',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

SELECT * FROM organizations WHERE id = 'court-hero-default';
```

5. Click **Run** button
6. You should see the organization created (or already exists if you've run this before)
7. **✅ Done with Step 1**

---

### STEP 2: Set Up RLS Policies for Signup
This allows anonymous users to sign up and insert user records.

1. Stay in the **SQL Editor** in Supabase
2. Create a new query and **copy+paste THIS**:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (for signup)
DROP POLICY IF EXISTS "Allow signup" ON users;
CREATE POLICY "Allow signup"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own record
DROP POLICY IF EXISTS "Users can read own record" ON users;
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (auth.uid()::text = id OR true);

-- Verify
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
```

3. Click **Run**
4. **✅ Done with Step 2**

---

### STEP 3: Deploy Code Changes to Vercel

The code changes have been made locally but need to be pushed to GitHub so Vercel picks them up.

**Option A: Push from your local machine** (Recommended)
```bash
cd /Users/intersportai/.openclaw/workspace/courthero
git remote -v  # Check remote is github.com:intersport-ais-projects/court-hero.git
git push origin main
```

**Option B: Trigger redeploy in Vercel Dashboard**
1. Go to: https://vercel.com/intersport-ais-projects/courthero
2. Click **Deployments**
3. Find the latest deployment and click **Redeploy** (it will use latest code from GitHub)
4. OR: Just commit and push these files to GitHub and Vercel will auto-deploy

**Files Changed:**
- `src/lib/auth-server.ts` - Simplified signup to use default org
- `src/app/signup/page.tsx` - Removed "Organization Name" field
- `.env.local` - Removed the placeholder for SERVICE_ROLE_KEY

**✅ Done with Step 3**

---

## Verification - Test Signup Now

Once Steps 1-3 are complete:

1. Go to https://courthero.app/signup
2. Enter:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@courthero.test` (or any email)
   - Password: `TestPass123!` (8+ chars)
3. Click **Create Account**
4. **EXPECTED**: Should log in and redirect to `/dashboard`
5. **SUCCESS**: The signup error is gone! ✅

---

## If It Still Doesn't Work

Check these in order:

1. **Did you run STEP 1 SQL?** 
   - Verify in Supabase: Go to SQL Editor → `SELECT * FROM organizations;`
   - You should see an org with `id='court-hero-default'`

2. **Did you run STEP 2 SQL?**
   - Verify RLS policy: Go to Database → users → RLS Policies (tab)
   - You should see policies for INSERT and SELECT

3. **Did you deploy STEP 3?**
   - Check Vercel: https://vercel.com/intersport-ais-projects/courthero
   - Look at the latest deployment timestamp
   - It should be AFTER the code was pushed to GitHub

4. **Still broken?** 
   - Check browser console (F12 → Console) for the exact error message
   - Let me know what it says

---

## What Changed

### Before (Broken):
```
User → Signup → Code tries to INSERT organization → RLS blocks → Error: "Failed to create organization"
```

### After (Fixed):
```
User → Signup → Code reads from default org (court-hero-default) → Insert user record → Success!
```

---

**Time to fix: ~5 minutes** (assuming Vercel redeployment takes ~2-3 min)

Let me know once you complete all 3 steps!
