/**
 * Database Initialization Endpoint
 * 
 * This endpoint initializes the database with required data for signup to work.
 * It's safe to call multiple times - idempotent operations.
 * 
 * Call this once after deployment to set up the default organization.
 * Usage: curl -X POST https://courthero.app/api/init
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Use admin client if available, otherwise anon
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const defaultOrgId = 'court-hero-default';
    const results: Record<string, any> = {};

    // Step 1: Check if default organization exists
    const { data: existing } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', defaultOrgId)
      .maybeSingle();

    if (existing) {
      results.organization = { status: 'already_exists', id: defaultOrgId };
    } else {
      // Step 2: Create default organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          id: defaultOrgId,
          name: 'Court Hero',
          plan_tier: 'community',
        })
        .select('id')
        .single();

      if (orgError) {
        results.organization = { status: 'error', error: orgError.message };
      } else {
        results.organization = { status: 'created', id: newOrg?.id };
      }
    }

    // Step 3: Log successful initialization
    const timestamp = new Date().toISOString();
    const logEntry = {
      type: 'INIT',
      timestamp,
      organization_id: defaultOrgId,
      success: !results.organization.error,
      results,
    };

    console.log('[INIT]', JSON.stringify(logEntry));

    return NextResponse.json(
      {
        success: !results.organization.error,
        timestamp,
        message: 'Database initialization complete. Signup is ready.',
        details: results,
      },
      { status: results.organization.error ? 500 : 200 }
    );
  } catch (error: any) {
    console.error('[INIT_ERROR]', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message:
          'Initialization failed. Check Vercel logs for details. ' +
          'You may need to manually run SQL in Supabase dashboard.',
      },
      { status: 500 }
    );
  }
}
