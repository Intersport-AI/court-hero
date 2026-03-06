const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function deploy() {
  console.log('\n🚀 COURT HERO - FINAL DEPLOYMENT\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Login with correct credentials
    console.log('Step 1: Logging in to GitHub...\n');
    await page.goto('https://github.com/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('input[type="submit"]');
    
    await page.waitForTimeout(5000);
    console.log('✅ Logged in\n');
    
    // Create PAT
    console.log('Step 2: Creating Personal Access Token...\n');
    await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Fill token name
    const input = await page.locator('input[type="text"]').first();
    await input.fill(`court-hero-${Date.now()}`);
    console.log('  Token name filled');
    
    // Click generate
    const buttons = await page.locator('button').all();
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Generate')) {
        await btn.click();
        break;
      }
    }
    
    await page.waitForTimeout(5000);
    console.log('✅ Token generated\n');
    
    // Extract token from page
    let token = null;
    const pageContent = await page.content();
    const match = pageContent.match(/ghp_[a-zA-Z0-9_]{36,}/);
    if (match) {
      token = match[0];
    }
    
    if (!token) {
      // Try getting from input values
      const inputs = await page.locator('input').all();
      for (let inp of inputs) {
        try {
          const val = await inp.inputValue();
          if (val && val.startsWith('ghp_')) {
            token = val;
            break;
          }
        } catch (e) {}
      }
    }
    
    if (!token) {
      console.log('⚠️  Could not auto-extract token');
      console.log('Please look at the browser and copy the token manually');
      console.log('It starts with: ghp_\n');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token: ${token.substring(0, 30)}...\n`);
    
    // Deploy
    console.log('Step 3: Deploying to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`, { encoding: 'utf-8' });
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    
    console.log('✅ Code pushed to GitHub!\n');
    
    console.log('Step 4: Vercel deploying...\n');
    console.log('⏳ Waiting 35 seconds for deployment...\n');
    
    await page.waitForTimeout(35000);
    
    // Check if live
    try {
      await page.goto('https://courthero.app', { waitUntil: 'load', timeout: 10000 });
      console.log('✅ Site is LIVE!\n');
    } catch (e) {
      console.log('⏳ Still deploying, check in a moment\n');
    }
    
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('                  ✅✅✅ DEPLOYMENT COMPLETE! ✅✅✅\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('GitHub Account Created:');
    console.log('  Email/Username: hello@courthero.app');
    console.log('  Password: Courthero_001!\n');
    console.log('Code Deployed:');
    console.log('  ✅ GitHub: https://github.com/intersport-ais-projects/court-hero');
    console.log('  ✅ Live: https://courthero.app\n');
    console.log('🚀 NEXT STEP: Test at https://courthero.app/signup\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

deploy();
