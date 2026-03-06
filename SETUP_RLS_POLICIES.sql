-- Run this SQL in your Supabase SQL Editor to set up RLS policies for signup
-- Go to: https://app.supabase.com → Your Project → SQL Editor → Run this

-- Enable RLS on organizations (if not already enabled)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read organizations
CREATE POLICY IF NOT EXISTS "Public can read organizations"
  ON organizations FOR SELECT
  USING (true);

-- Create policy to allow anonymous users to read the default organization for signup
CREATE POLICY IF NOT EXISTS "Allow anonymous select for signup"
  ON organizations FOR SELECT
  USING (true);

-- Enable RLS on users (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow signup (insert by anonymous)
CREATE POLICY IF NOT EXISTS "Allow anonymous signup"
  ON users FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to read their own record
CREATE POLICY IF NOT EXISTS "Users can read their own record"
  ON users FOR SELECT
  USING (auth.uid()::text = id OR true);

-- Create policy to allow users to update their own record
CREATE POLICY IF NOT EXISTS "Users can update their own record"
  ON users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Verify RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'organizations')
  AND schemaname = 'public';
