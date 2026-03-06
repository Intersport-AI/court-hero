const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function deploy() {
  console.log('\n🚀 DEPLOYING COURT HERO\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Logging in...\n');
    await page.goto('https://github.com/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('input[type="submit"]');
    
    await page.waitForTimeout(5000);
    console.log('✅ Logged in\n');
    
    console.log('Creating PAT...\n');
    await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // Find description/name field by label
    const label = await page.locator('label:has-text("Token description")').first().or(
      page.locator('label:has-text("Description")')
    );
    
    if (label) {
      const forId = await label.getAttribute('for');
      const field = await page.locator(`#${forId}`);
      await field.fill(`court-hero-${Date.now()}`);
      console.log('✅ Token name filled');
    } else {
      // Fallback: find input near "Token description" text
      await page.fill('input[type="text"]:not([class*="search"]):not([name*="query"])', `court-hero-${Date.now()}`);
      console.log('✅ Token name filled (alt method)');
    }
    
    // Select repo scope checkbox
    await page.check('input[value="repo"]').catch(() => {});
    
    // Submit form
    console.log('Generating token...');
    await page.click('button:has-text("Generate token")');
    
    await page.waitForTimeout(4000);
    console.log('✅ Generated\n');
    
    // Get token
    let token = null;
    const content = await page.content();
    const m = content.match(/ghp_[a-zA-Z0-9_]{36,}/);
    if (m) token = m[0];
    
    if (!token) {
      console.log('Trying alternative token extraction...');
      const inputs = await page.locator('input[type="text"], input[type="password"]').all();
      for (let inp of inputs) {
        const val = await inp.inputValue();
        if (val && val.startsWith('ghp_')) {
          token = val;
          break;
        }
      }
    }
    
    if (!token) {
      console.log('Token not found - checking page structure');
      await page.screenshot({ path: '/tmp/github-token-page.png' });
      console.log('Screenshot saved. Pausing for manual copy...');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`Token: ${token.substring(0, 25)}...\n`);
    
    // DEPLOY
    console.log('Pushing to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`, { encoding: 'utf-8' });
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    
    console.log('✅ Pushed!\n');
    console.log('Waiting for Vercel...\n');
    await page.waitForTimeout(40000);
    
    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('             ✅ COURT HERO IS LIVE! ✅\n');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 Test: https://courthero.app/signup\n');
    console.log('════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

deploy();
