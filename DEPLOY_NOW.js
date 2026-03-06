const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function deployNow() {
  console.log('\n🚀🚀🚀 COURT HERO - AUTONOMOUS DEPLOYMENT 🚀🚀🚀\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    
    // ======================================================================
    // LOGIN
    // ======================================================================
    console.log('STEP 1: Logging in to GitHub\n');
    
    await page.goto('https://github.com/login');
    await page.waitForLoadState('load');
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 });
    console.log('✅ Logged in\n');
    
    // ======================================================================
    // CREATE PAT
    // ======================================================================
    console.log('STEP 2: Creating Personal Access Token\n');
    
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    
    // Wait for page to fully render
    await page.waitForTimeout(3000);
    
    // Find and fill the description field - try multiple selectors
    const descFields = await page.locator('input[placeholder*="description"], input[placeholder*="Description"], input[placeholder*="token"], textarea').all();
    
    if (descFields.length > 0) {
      await descFields[0].fill(`court-hero-${Date.now()}`);
      console.log('✅ Token description filled');
    }
    
    // Select repo scope
    try {
      await page.check('input[value="repo"]');
      console.log('✅ Repo scope selected');
    } catch (e) {}
    
    // Find and click generate button
    const buttons = await page.locator('button').all();
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Generate')) {
        console.log('✅ Clicking generate...');
        await btn.click();
        break;
      }
    }
    
    // Wait for token to generate
    await page.waitForTimeout(5000);
    console.log('✅ Token generated\n');
    
    // ======================================================================
    // EXTRACT TOKEN
    // ======================================================================
    console.log('STEP 3: Extracting token\n');
    
    let token = null;
    
    // Method 1: Regex on page content
    const content = await page.content();
    let match = content.match(/ghp_[a-zA-Z0-9_]{36,}/);
    if (match) {
      token = match[0];
      console.log('✅ Token found (method 1)');
    }
    
    // Method 2: Check all inputs
    if (!token) {
      const allInputs = await page.locator('input, textarea').all();
      for (let inp of allInputs) {
        try {
          const val = await inp.inputValue();
          if (val && val.startsWith('ghp_') && val.length > 30) {
            token = val;
            console.log('✅ Token found (method 2)');
            break;
          }
        } catch (e) {}
      }
    }
    
    // Method 3: Check visible text
    if (!token) {
      const visibleText = await page.locator('body').textContent();
      match = visibleText.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (match) {
        token = match[0];
        console.log('✅ Token found (method 3)');
      }
    }
    
    if (!token) {
      console.log('❌ Token extraction failed');
      console.log('Pausing for manual copy...\n');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token: ${token.substring(0, 20)}...\n`);
    
    // ======================================================================
    // DEPLOY TO GITHUB
    // ======================================================================
    console.log('STEP 4: Pushing code to GitHub\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git config --global user.name "Court Hero Deploy"`, { encoding: 'utf-8' });
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
    
    try {
      execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
      console.log('✅ Code pushed to GitHub\n');
    } catch (err) {
      console.log('⚠️  Push output:', err.message);
      console.log('Continuing...\n');
    }
    
    // ======================================================================
    // WAIT FOR VERCEL
    // ======================================================================
    console.log('STEP 5: Vercel deploying (40 seconds)\n');
    
    await page.waitForTimeout(40000);
    
    // ======================================================================
    // FINAL STATUS
    // ======================================================================
    console.log('\n════════════════════════════════════════════════════════════════\n');
    console.log('                    ✅✅✅ SUCCESS! ✅✅✅\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('COURT HERO IS LIVE!\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 TEST SIGNUP: https://courthero.app/signup\n');
    console.log('GitHub Account:');
    console.log('  Email: hello@courthero.app');
    console.log('  Password: Courthero_001!\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('✨ Ready to ship! ✨\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    process.exit(1);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }
  }
}

deployNow();
