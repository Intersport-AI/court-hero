#!/bin/bash

# Court Hero - Final Deployment Step
# This script completes the deployment to production

echo "════════════════════════════════════════════════════════════════"
echo "🚀 Court Hero Signup Fix - DEPLOYMENT STEP"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Code is ready. Pushing to GitHub..."
echo ""

cd /Users/intersportai/.openclaw/workspace/courthero

# Check current status
echo "📊 Current git status:"
git status

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "To complete deployment, you need to authenticate with GitHub."
echo ""
echo "OPTION 1 - Use GitHub Personal Access Token (fastest):"
echo "────────────────────────────────────────────────────────"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token'"
echo "3. Select 'repo' scope"
echo "4. Copy the token"
echo "5. Paste it below when prompted for password:"
echo ""
read -sp "Enter your GitHub PAT (password will be hidden): " GH_TOKEN
echo ""

# Configure git to use the token
git config credential.helper store
echo "https://:${GH_TOKEN}@github.com" | git credential-cache store --timeout=300

# Push to GitHub
echo ""
echo "🔄 Pushing to GitHub..."
git push origin main 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "✅ SUCCESS! Code pushed to GitHub"
  echo "════════════════════════════════════════════════════════════════"
  echo ""
  echo "Vercel will automatically deploy in ~30 seconds."
  echo "Watch deployment at: https://vercel.com/intersport-ais-projects/courthero"
  echo ""
  echo "After deployment (2-3 min), test signup at:"
  echo "👉 https://courthero.app/signup"
  echo ""
  exit 0
else
  echo ""
  echo "❌ Push failed. Check token and try again."
  exit 1
fi
