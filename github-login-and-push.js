#!/usr/bin/env node

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function deployToGithub() {
  console.log('🚀 GITHUB LOGIN & DEPLOYMENT\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Step 1: Login to GitHub
    console.log('Step 1: Logging into GitHub...\n');
    await page.goto('https://github.com/login', { waitUntil: 'networkidle' });
    
    // Fill in email
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    
    // Click sign in
    await page.click('input[type="submit"][value="Sign in"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Logged into GitHub\n');

    // Step 2: Check if 2FA is needed
    if (page.url().includes('sessions/two-factor')) {
      console.log('⚠️  2FA detected - waiting for manual entry...\n');
      await page.waitForNavigation({ timeout: 60000 });
    }

    // Step 3: Navigate to token creation page
    console.log('Step 2: Creating Personal Access Token...\n');
    await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'load' });
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for form to load
    await page.waitForTimeout(2000);
    
    // Fill in token name
    const tokenName = `court-hero-deploy-${Date.now()}`;
    try {
      await page.fill('input[name="description"]', tokenName);
    } catch (e) {
      console.log('Using alternative selector for token name...');
      await page.fill('input[placeholder="New personal access token"]', tokenName);
    }
    
    // Select 'repo' scope
    try {
      const repoCheckbox = await page.$('input[value="repo"]');
      if (repoCheckbox) {
        await repoCheckbox.check();
      }
    } catch (e) {
      console.log('Repo scope may already be selected');
    }
    
    // Generate token
    try {
      await page.click('button:has-text("Generate token")');
    } catch (e) {
      // Try alternative button selector
      await page.click('button[type="submit"]');
    }
    
    // Wait for token to appear
    await page.waitForTimeout(3000);
    
    // Copy the token - try multiple selectors
    let token = null;
    try {
      token = await page.locator('input[readonly]').inputValue();
    } catch (e) {
      try {
        const tokenElements = await page.locator('input[type="password"]').or(page.locator('code')).all();
        for (const elem of tokenElements) {
          const value = await elem.inputValue();
          if (value && value.startsWith('ghp_')) {
            token = value;
            break;
          }
        }
      } catch (e2) {
        // Try to get from page content
        const content = await page.content();
        const match = content.match(/ghp_[a-zA-Z0-9_]+/);
        if (match) {
          token = match[0];
        }
      }
    }
    if (!token) {
      console.log('⚠️  Could not extract token from page');
      console.log('Please copy the token manually and run:');
      console.log('GH_TOKEN="your_token" git push origin main');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token created: ${token.substring(0, 20)}...\n`);
    
    // Save token to file temporarily
    fs.writeFileSync('/tmp/gh-token.txt', token);
    
    // Step 4: Push to GitHub
    console.log('Step 3: Pushing code to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    
    try {
      execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
      execSync(`cd ${cwd} && git config --global user.name "Court Hero Deploy"`, { encoding: 'utf-8' });
      
      const pushCmd = `cd ${cwd} && GIT_ASKPASS=/bin/true GH_TOKEN="${token}" git push https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git main 2>&1`;
      
      const result = execSync(pushCmd, { encoding: 'utf-8' });
      
      if (result.includes('error') || result.includes('fatal')) {
        console.error('❌ Git push failed:', result);
        process.exit(1);
      }
      
      console.log('✅ Code pushed to GitHub!');
      console.log('Vercel will auto-deploy in ~30 seconds\n');
      console.log('✅ DEPLOYMENT COMPLETE\n');
      console.log('Test live at: https://courthero.app\n');
      
    } catch (err) {
      console.error('❌ Git push error:', err.message);
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

deployToGithub().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
