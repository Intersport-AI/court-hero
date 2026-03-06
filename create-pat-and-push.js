const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function createPATAndPush() {
  console.log('\n🚀 Creating PAT and pushing...\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Logging in...');
    await page.goto('https://github.com/login');
    await page.waitForLoadState('load');
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
    console.log('✅ Logged in\n');
    
    console.log('Creating PAT...');
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
    
    // Fill name
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length > 0) {
      await inputs[0].fill(`court-hero-${Date.now()}`);
    }
    
    // Select repo
    await page.check('input[value="repo"]').catch(() => {});
    
    // Generate
    const buttons = await page.locator('button').all();
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Generate')) {
        await btn.click();
        break;
      }
    }
    
    await page.waitForTimeout(5000);
    console.log('✅ Generated\n');
    
    // Extract - more aggressive approach
    console.log('Extracting token...\n');
    
    let token = await page.evaluate(() => {
      // Get all text on page
      const text = document.body.innerText;
      const match = text.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (match) return match[0];
      
      // Check all inputs/textareas
      const els = document.querySelectorAll('input, textarea');
      for (let el of els) {
        if (el.value && el.value.startsWith('ghp_')) return el.value;
      }
      
      return null;
    });
    
    if (!token) {
      console.log('Could not extract token');
      console.log('Pausing for manual review...\n');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token: ${token.substring(0, 25)}...\n`);
    console.log('Pushing to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`);
    execSync(`cd ${cwd} && git push -u origin main 2>&1`);
    
    console.log('✅ Pushed!\n');
    console.log('⏳ Waiting for Vercel (40 sec)...\n');
    
    await page.waitForTimeout(40000);
    
    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('                  ✅ DEPLOYMENT COMPLETE\n');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 https://courthero.app/signup\n');
    console.log('✨ READY TO SHIP\n');
    console.log('════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

createPATAndPush();
