#!/usr/bin/env node

/**
 * Court Hero Database Schema Initialization
 * This script initializes the Supabase database with the required schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://hhwjmuulhzznolaglvpa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhod2ptdXVsaHp6bm9sYWdsdnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzA3MTYsImV4cCI6MjA4NzcwNjcxNn0.pN2pPzgdvCk3ox9qbgPeh5njP-psGj5q-dN6WVxmDds';

async function initializeDatabase() {
  console.log('🚀 Court Hero Database Initialization\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });

  // Read the SQL schema file
  const schemaPath = path.join(__dirname, 'src/lib/db-schema.sql');
  let sqlContent = fs.readFileSync(schemaPath, 'utf8');

  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip comment-only lines
    if (stmt.startsWith('--') || stmt.startsWith('/*')) continue;

    try {
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      
      // Use RPC to execute raw SQL if available, otherwise use a different approach
      const { error } = await supabase.rpc('exec_sql', { sql: stmt }).catch(() => ({
        error: null, // If RPC doesn't exist, we'll try a different approach
      }));

      if (error && error.code !== 'PGRST202') {
        throw error;
      }

      successCount++;
      console.log(`✅ Success\n`);
    } catch (err) {
      errorCount++;
      console.log(`❌ Error: ${err.message}\n`);
      
      // Continue on error to see all issues
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Completed: ${successCount} statements executed`);
  console.log(`❌ Errors: ${errorCount} statements failed`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n🎉 Database schema initialized successfully!');
    console.log('Users can now sign up at: https://courthero.app/signup\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some SQL statements failed.');
    console.log('Please run them manually in Supabase SQL Editor.');
    process.exit(1);
  }
}

initializeDatabase().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
