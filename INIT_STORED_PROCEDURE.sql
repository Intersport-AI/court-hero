-- Run this in Supabase SQL Editor to create a stored procedure
-- This allows the anonymous user to initialize the default organization

-- Create a stored procedure to ensure default org exists
CREATE OR REPLACE FUNCTION public.ensure_default_organization()
RETURNS TEXT AS $$
DECLARE
  org_id TEXT := 'court-hero-default';
BEGIN
  -- Check if org already exists
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = org_id) THEN
    -- Create it
    INSERT INTO public.organizations (id, name, plan_tier)
    VALUES (org_id, 'Court Hero', 'community');
  END IF;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow anonymous users to call this function
GRANT EXECUTE ON FUNCTION public.ensure_default_organization() TO anon;

-- Verify it works
SELECT public.ensure_default_organization() as default_org_id;
