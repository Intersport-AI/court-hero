#!/usr/bin/env python3

import subprocess
import sys
import os
from getpass import getpass

print("\n" + "="*70)
print("🚀 COURT HERO SIGNUP FIX - FINAL STEP")
print("="*70 + "\n")

print("Your Supabase is open. Here's what to do:\n")
print("1. Look at your Supabase Dashboard")
print("2. Go to: Settings → Database → Connection Pooling")
print("3. You should see a Connection String like:")
print("   postgres://postgres:YOUR_PASSWORD@hhwjmuulhzznolaglvpa.supabase.co:5432/postgres")
print("4. Copy the entire connection string")
print()

# Get connection string
conn_string = input("📋 Paste your Supabase connection string here: ").strip()

# Extract password
if 'postgres://' not in conn_string:
    print("❌ Invalid format. Must start with 'postgres://'")
    sys.exit(1)

try:
    # Format: postgres://postgres:PASSWORD@host:port/db
    parts = conn_string.split('@')[0]  # Get "postgres://postgres:PASSWORD"
    password = parts.split(':')[2]      # Get PASSWORD (after second colon)
except:
    print("❌ Could not extract password from connection string")
    print("Expected format: postgres://postgres:PASSWORD@hhwjmuulhzznolaglvpa.supabase.co:5432/postgres")
    sys.exit(1)

print()
print("✅ Password extracted!")
print()
print("="*70)
print("⏳ Initializing database schema...")
print("="*70)
print()

# Set environment and run init script
os.environ['SUPABASE_DB_PASSWORD'] = password
os.chdir('/Users/intersportai/.openclaw/workspace/courthero')

result = subprocess.run([sys.executable, 'init-db.py'], capture_output=False)

if result.returncode == 0:
    print()
    print("="*70)
    print("✅ SUCCESS! Database is initialized!")
    print("="*70)
    print()
    print("🚀 NEXT: Push code to GitHub and Vercel will auto-deploy:")
    print()
    print("   cd /Users/intersportai/.openclaw/workspace/courthero")
    print("   git push origin main")
    print()
    print("⏳ Wait 2-3 minutes for Vercel to deploy")
    print()
    print("✅ TEST: Go to https://courthero.app/signup")
    print()
    sys.exit(0)
else:
    print()
    print("❌ Database initialization failed")
    print("Check the error above and try again")
    sys.exit(1)
