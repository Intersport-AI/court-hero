#!/usr/bin/env node

/**
 * Court Hero Setup Script
 * This script creates the default organization and sets up RLS policies
 * 
 * Usage: node setup-org.js
 */

const https = require('https');

const SUPABASE_URL = 'https://hhwjmuulhzznolaglvpa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhod2ptdXVsaHp6bm9sYWdsdnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzA3MTYsImV4cCI6MjA4NzcwNjcxNn0.pN2pPzgdvCk3ox9qbgPeh5njP-psGj5q-dN6WVxmDds';

// Make HTTPS request
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${parsed.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setupOrganization() {
  console.log('🚀 Court Hero Setup Script\n');
  console.log('Step 1: Creating default organization...');

  try {
    // Check if org already exists
    const existing = await makeRequest(
      'GET',
      `/rest/v1/organizations?id=eq.court-hero-default&select=id`,
      null
    );

    if (existing && existing.length > 0) {
      console.log('✅ Organization already exists: court-hero-default');
    } else {
      // Create organization
      const orgData = {
        id: 'court-hero-default',
        name: 'Court Hero',
        plan_tier: 'community',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await makeRequest('POST', '/rest/v1/organizations', orgData);
      console.log('✅ Organization created:', result);
    }

    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('The default organization is ready for signup.');
    console.log('Users can now sign up at: https://courthero.app/signup\n');

  } catch (error) {
    console.error('❌ Error during setup:');
    console.error(error.message);
    console.log('\nNote: If you see a 403 error, it may be due to RLS policies.');
    console.log('Please follow the manual steps in SIGNUP_FIX_GUIDE.md\n');
    process.exit(1);
  }
}

setupOrganization();
