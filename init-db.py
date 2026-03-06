#!/usr/bin/env python3

"""
Court Hero Database Schema Initialization
Connects directly to Supabase PostgreSQL and initializes the schema
"""

import sys
import os

# Try to import psycopg2, install if needed
try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("📦 Installing psycopg2...")
    os.system("pip install psycopg2-binary")
    import psycopg2
    import psycopg2.extras

def main():
    print("🚀 Court Hero Database Initialization\n")
    
    # Supabase PostgreSQL connection details
    # Format: postgres://[user]:[password]@[host]:5432/[database]
    # Supabase default: postgres://postgres:[password]@[project].supabase.co:5432/postgres
    
    DB_HOST = 'hhwjmuulhzznolaglvpa.supabase.co'
    DB_PORT = 5432
    DB_NAME = 'postgres'
    DB_USER = 'postgres'
    
    print("📝 Supabase Database Details:")
    print(f"  Host: {DB_HOST}")
    print(f"  Port: {DB_PORT}")
    print(f"  Database: {DB_NAME}")
    print(f"  User: {DB_USER}")
    print()
    
    # Get password from environment or user input
    db_password = os.environ.get('SUPABASE_DB_PASSWORD')
    if not db_password:
        print("⚠️  SUPABASE_DB_PASSWORD environment variable not set")
        print("Please set it and try again:")
        print("  export SUPABASE_DB_PASSWORD='your_postgres_password'")
        print()
        print("You can find the password in Supabase Dashboard:")
        print("  1. Go to https://app.supabase.com")
        print("  2. Select your project")
        print("  3. Settings → Database → Connection Pooling → Connection String")
        print()
        return False
    
    try:
        print("🔗 Connecting to Supabase PostgreSQL...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=db_password,
            sslmode='require'
        )
        
        cursor = conn.cursor()
        print("✅ Connected!\n")
        
        # Read SQL schema
        schema_file = 'src/lib/db-schema.sql'
        print(f"📋 Reading schema from {schema_file}...")
        
        with open(schema_file, 'r') as f:
            sql_content = f.read()
        
        # Execute the entire schema
        print("⏳ Executing schema...\n")
        cursor.execute(sql_content)
        conn.commit()
        
        print("✅ Schema initialized successfully!\n")
        
        # Verify organizations table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'organizations'
            );
        """)
        
        org_exists = cursor.fetchone()[0]
        if org_exists:
            print("✅ organizations table created")
        
        # Verify users table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """)
        
        users_exists = cursor.fetchone()[0]
        if users_exists:
            print("✅ users table created")
        
        print()
        print("=" * 60)
        print("🎉 Database schema initialized successfully!")
        print("=" * 60)
        print()
        print("Users can now sign up at: https://courthero.app/signup\n")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as err:
        print(f"❌ Database Error: {err}")
        print()
        print("If you get 'password authentication failed':")
        print("  Check your Supabase password")
        print()
        print("If you get 'connection refused':")
        print("  Make sure you're connected to the internet")
        return False
    except FileNotFoundError:
        print(f"❌ Schema file not found: {schema_file}")
        return False
    except Exception as err:
        print(f"❌ Error: {err}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
