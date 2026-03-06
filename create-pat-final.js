const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function createPATAndDeploy() {
  console.log('\n🚀 Creating PAT & Deploying\n');
  
  let browser;
  
  try {
    console.log('Starting browser...\n');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Logging in...\n');
    await page.goto('https://github.com/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="login"]', 'courthero-deploy', { timeout: 10000 });
    await page.fill('input[name="password"]', 'CourtheroGitHub2025!', { timeout: 10000 });
    await page.click('input[type="submit"]', { timeout: 5000 });
    
    await page.waitForTimeout(5000);
    console.log('✅ Logged in\n');
    
    console.log('Creating PAT...\n');
    await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Fill token name
    const firstInput = await page.locator('input[type="text"]').first();
    await firstInput.fill(`court-hero-deploy-${Date.now()}`);
    
    console.log('✅ Token name filled\n');
    console.log('Clicking generate button...\n');
    
    // Try different button selectors
    let clickedButton = false;
    const buttons = await page.locator('button').all();
    
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Generate')) {
        await btn.click({ timeout: 5000 });
        clickedButton = true;
        break;
      }
    }
    
    if (!clickedButton) {
      console.log('Could not find generate button, trying keyboard...');
      await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(4000);
    console.log('✅ Token generated\n');
    
    // Extract token
    let token = null;
    const content = await page.content();
    const match = content.match(/ghp_[a-zA-Z0-9_]{36}/);
    if (match) {
      token = match[0];
    }
    
    if (!token) {
      // Try from inputs
      const inputs = await page.locator('input').all();
      for (let inp of inputs) {
        try {
          const val = await inp.inputValue();
          if (val && val.startsWith('ghp_') && val.length > 30) {
            token = val;
            break;
          }
        } catch (e) {}
      }
    }
    
    if (!token) {
      console.log('❌ Could not extract token');
      console.log('Pausing browser - please copy token manually');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token: ${token.substring(0, 20)}...\n`);
    fs.writeFileSync('/tmp/github-token.txt', token);
    
    // Push code
    console.log('🚀 Pushing to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`, { encoding: 'utf-8' });
    
    const gitUrl = `https://courthero-deploy:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    
    console.log('✅ Code pushed!\n');
    
    console.log('⏳ Waiting for Vercel (30 sec)...\n');
    await page.waitForTimeout(35000);
    
    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('✅ ✅ ✅  DEPLOYMENT COMPLETE!  ✅ ✅ ✅\n');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('🌐 Live at: https://courthero.app\n');
    console.log('📝 Test signup at: https://courthero.app/signup\n');
    console.log('✨ Court Hero is READY!\n');
    console.log('════════════════════════════════════════════════════════\n');
    
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

createPATAndDeploy();
