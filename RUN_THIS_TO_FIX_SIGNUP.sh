#!/bin/bash

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🚀 Court Hero Signup Fix - Final Step                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your Supabase dashboard is open. Let's get your database password."
echo ""
echo "STEP 1: In your Supabase dashboard, go to:"
echo "   Settings → Database → Connection Pooling"
echo ""
echo "STEP 2: Copy the CONNECTION STRING and paste it below."
echo "   Format: postgres://postgres:PASSWORD@hhwjmuulhzznolaglvpa.supabase.co:5432/postgres"
echo ""
echo "STEP 3: I'll extract the password and initialize your database."
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "Paste your Supabase connection string here: " CONNECTION_STRING

# Extract password from connection string
# Format: postgres://postgres:PASSWORD@host:port/db
if [[ $CONNECTION_STRING =~ postgres://postgres:([^@]+)@ ]]; then
    DB_PASSWORD="${BASH_REMATCH[1]}"
    echo ""
    echo "✅ Password extracted!"
    echo ""
else
    echo "❌ Invalid connection string format"
    echo "Expected: postgres://postgres:PASSWORD@hhwjmuulhzznolaglvpa.supabase.co:5432/postgres"
    exit 1
fi

echo "════════════════════════════════════════════════════════════════"
echo "🔧 Initializing database schema..."
echo "════════════════════════════════════════════════════════════════"
echo ""

cd /Users/intersportai/.openclaw/workspace/courthero

export SUPABASE_DB_PASSWORD="$DB_PASSWORD"

# Run the Python initialization script
python3 init-db.py

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║ ✅ SUCCESS! Database schema initialized!                      ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. The code is ready to deploy"
    echo "   2. Push to GitHub: cd /Users/intersportai/.openclaw/workspace/courthero && git push origin main"
    echo "   3. Vercel will auto-deploy in ~30 seconds"
    echo "   4. Test signup at: https://courthero.app/signup"
    echo ""
    exit 0
else
    echo ""
    echo "❌ Database initialization failed"
    exit 1
fi
