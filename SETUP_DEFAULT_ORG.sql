-- Run this SQL in your Supabase SQL Editor to set up the default organization
-- Go to: https://app.supabase.com → Your Project → SQL Editor → Run this

-- Create the default organization that all new users will join
INSERT INTO organizations (id, name, plan_tier, created_at, updated_at)
VALUES (
  'court-hero-default',
  'Court Hero',
  'community',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify it was created
SELECT * FROM organizations WHERE id = 'court-hero-default';
