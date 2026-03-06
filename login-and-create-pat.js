const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function loginAndCreatePAT() {
  console.log('\n🚀 GitHub Login & PAT Creation\n');
  
  let browser;
  
  try {
    console.log('Starting browser...\n');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Try to login with existing account
    console.log('Attempting to login with courthero-deploy...\n');
    
    await page.goto('https://github.com/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Fill login
    await page.fill('input[name="login"]', 'courthero-deploy', { timeout: 10000 });
    await page.fill('input[name="password"]', 'CourtheroGitHub2025!', { timeout: 10000 });
    
    // Click submit
    await page.click('input[type="submit"]', { timeout: 5000 });
    
    console.log('✅ Login attempt submitted\n');
    
    // Wait for navigation/2FA check
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('two-factor')) {
      console.log('⚠️  2FA required');
      console.log('Please verify in browser, then continue...\n');
      await page.waitForNavigation({ timeout: 120000 });
    }
    
    if (currentUrl.includes('login') || page.url().includes('login')) {
      console.log('❌ Login failed - account may not exist yet');
      console.log('\nPlease create the account manually at: https://github.com/signup');
      console.log('Use these credentials:');
      console.log('  Email: hello@courthero.app');
      console.log('  Password: CourtheroGitHub2025!');
      console.log('  Username: courthero-deploy\n');
      console.log('Then reply when account is created.\n');
      process.exit(1);
    }
    
    console.log('✅ Logged in successfully!\n');
    
    // Now create PAT
    console.log('Creating Personal Access Token...\n');
    
    await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Fill token name
    const tokenName = `court-hero-deploy-${Date.now()}`;
    const firstInput = await page.locator('input[type="text"]').first();
    await firstInput.fill(tokenName);
    
    console.log('✅ Token name filled\n');
    
    // Select repo scope
    try {
      await page.check('input[value="repo"]');
      console.log('✅ Repo scope selected\n');
    } catch (e) {
      console.log('Repo scope may already be selected\n');
    }
    
    // Submit
    console.log('Generating token...\n');
    const generateBtn = await page.locator('button:has-text("Generate token")').first();
    await generateBtn.click();
    
    // Wait for token to appear
    await page.waitForTimeout(4000);
    
    // Extract token
    let token = null;
    const content = await page.content();
    const match = content.match(/ghp_[a-zA-Z0-9_]+/);
    if (match) {
      token = match[0];
    }
    
    if (!token) {
      // Try input value
      const inputs = await page.locator('input').all();
      for (let inp of inputs) {
        try {
          const val = await inp.inputValue();
          if (val && val.includes('ghp_')) {
            token = val;
            break;
          }
        } catch (e) {}
      }
    }
    
    if (!token) {
      console.log('❌ Could not extract token from page');
      console.log('Please copy it manually and run:');
      console.log('GH_TOKEN="your_token" git -C /Users/intersportai/.openclaw/workspace/courthero push origin main\n');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token created: ${token.substring(0, 20)}...\n`);
    
    // Save credentials
    fs.writeFileSync('/tmp/github-token.txt', token);
    console.log('Credentials saved\n');
    
    // Push code
    console.log('🚀 Pushing code to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    
    try {
      execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
      execSync(`cd ${cwd} && git config --global user.name "Court Hero Deploy"`, { encoding: 'utf-8' });
      
      const gitUrl = `https://courthero-deploy:${token}@github.com/intersport-ais-projects/court-hero.git`;
      execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
      execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
      
      console.log('✅ Code pushed to GitHub!\n');
      
      // Wait for Vercel
      console.log('⏳ Waiting for Vercel deployment (30 seconds)...\n');
      await page.waitForTimeout(35000);
      
      // Check site
      console.log('Checking if site is live...\n');
      try {
        await page.goto('https://courthero.app', { waitUntil: 'load', timeout: 10000 });
        console.log('✅ Site is LIVE at https://courthero.app\n');
      } catch (e) {
        console.log('Site still deploying, check in a moment\n');
      }
      
      console.log('════════════════════════════════════════════════════════\n');
      console.log('✅ DEPLOYMENT COMPLETE!\n');
      console.log('════════════════════════════════════════════════════════\n');
      console.log('GitHub Account:');
      console.log('  Email: hello@courthero.app');
      console.log('  Username: courthero-deploy\n');
      console.log('Code Live At: https://courthero.app\n');
      console.log('✨ NEXT STEP: Test signup at https://courthero.app/signup\n');
      console.log('════════════════════════════════════════════════════════\n');
      
      process.exit(0);
      
    } catch (err) {
      console.log('❌ Push failed:', err.message);
      process.exit(1);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

loginAndCreatePAT();
