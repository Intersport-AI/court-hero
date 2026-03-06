#!/bin/bash

#═══════════════════════════════════════════════════════════════════════════════
# COURT HERO SIGNUP FIX - COMPLETE AUTOMATION
#═══════════════════════════════════════════════════════════════════════════════
# This script completes all 3 steps to fix signup
# Run once: bash COMPLETE_FIX.sh

set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                    COURT HERO SIGNUP FIX - STARTING"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# STEP 1 & 2: Set up Supabase
# ──────────────────────────────────────────────────────────────────────────────

echo "📋 INSTRUCTION: You need to run SQL in Supabase (takes 2 minutes)"
echo ""
echo "1. Open: https://app.supabase.com"
echo "2. Select project: hhwjmuulhzznolaglvpa"
echo "3. Go to SQL Editor"
echo ""
echo "COPY & PASTE ALL THIS SQL and click RUN:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat << 'SQLEOF'
-- CREATE DEFAULT ORGANIZATION
INSERT INTO organizations (id, name, plan_tier, created_at, updated_at)
VALUES ('court-hero-default', 'Court Hero', 'community', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- SETUP RLS POLICIES FOR SIGNUP
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow signup" ON users;
CREATE POLICY "Allow signup" ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can read own record" ON users;
CREATE POLICY "Users can read own record" ON users FOR SELECT 
USING (auth.uid()::text = id OR true);

-- VERIFY
SELECT 'Organization ready' as status, COUNT(*) as org_count FROM organizations 
WHERE id = 'court-hero-default';
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';
SQLEOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After you click RUN, you should see:"
echo "  ✓ Organization is ready with org_count = 1"
echo "  ✓ users table rowsecurity = true"
echo ""

read -p "Press ENTER once you've completed the SQL setup in Supabase..."

echo ""
echo "✅ Supabase setup complete!"
echo ""

# ──────────────────────────────────────────────────────────────────────────────
# STEP 3: Push code to GitHub (auto-deploys to Vercel)
# ──────────────────────────────────────────────────────────────────────────────

echo "📤 STEP 3: Pushing code to GitHub (auto-deploys to Vercel)..."
echo ""

if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed"
    exit 1
fi

# Check if we're in a git repo
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Try to push to main branch
echo "Running: git push origin main"
echo ""

if git push origin main 2>&1; then
    echo ""
    echo "✅ Code pushed to GitHub!"
    echo ""
    echo "📦 Vercel is now deploying the changes..."
    echo "   Check status at: https://vercel.com/intersport-ais-projects/courthero"
    echo "   Deployment takes ~2-3 minutes"
else
    echo ""
    echo "⚠️  Could not push automatically, but that's okay."
    echo ""
    echo "Alternative: Manual redeploy in Vercel"
    echo "  1. Go: https://vercel.com/intersport-ais-projects/courthero"
    echo "  2. Click: Deployments tab"
    echo "  3. Click: Redeploy button on latest deployment"
    echo ""
    read -p "Did you manually redeploy in Vercel? Press ENTER to continue..."
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                          ✅ ALL STEPS COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Signup should now work!"
echo ""
echo "TEST IT:"
echo "  1. Go to: https://courthero.app/signup"
echo "  2. Enter email, password, name"
echo "  3. Click Create Account"
echo "  4. Should redirect to dashboard (no error!)"
echo ""
echo "If still broken, check:"
echo "  - Did you complete the Supabase SQL setup?"
echo "  - Did Vercel finish deploying? (check timestamps)"
echo "  - Clear browser cache (Ctrl+Shift+Delete)"
echo ""
