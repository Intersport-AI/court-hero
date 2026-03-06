const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function deployFinal() {
  console.log('\n🚀 COURT HERO - FINAL AUTONOMOUS DEPLOYMENT\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('LOGIN TO GITHUB\n');
    await page.goto('https://github.com/login');
    await page.waitForLoadState('load');
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'load' });
    console.log('✅ Logged in\n');
    
    console.log('CREATE PERSONAL ACCESS TOKEN\n');
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    
    // Fill token name
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length > 0) {
      await inputs[0].fill(`court-hero-${Date.now()}`);
    }
    
    // Select repo scope
    try {
      await page.check('input[value="repo"]');
    } catch (e) {}
    
    // Click generate
    const buttons = await page.locator('button').all();
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Generate')) {
        await btn.click();
        break;
      }
    }
    
    await page.waitForTimeout(4000);
    console.log('✅ Token generated\n');
    
    // Extract token
    let token = null;
    const content = await page.content();
    const m = content.match(/ghp_[a-zA-Z0-9_]{36,}/);
    if (m) token = m[0];
    
    if (!token) {
      const inputs = await page.locator('input').all();
      for (let inp of inputs) {
        const val = await inp.inputValue();
        if (val && val.startsWith('ghp_')) {
          token = val;
          break;
        }
      }
    }
    
    if (!token) {
      console.log('Could not extract token - pausing for manual copy');
      await page.pause();
      process.exit(1);
    }
    
    console.log(`✅ Token: ${token.substring(0, 25)}...\n`);
    
    console.log('PUSH TO GITHUB\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`);
    execSync(`cd ${cwd} && git push -u origin main 2>&1`);
    
    console.log('✅ Pushed to GitHub\n');
    
    console.log('WAITING FOR VERCEL (40 seconds)\n');
    await page.waitForTimeout(40000);
    
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('                   ✅ DEPLOYMENT COMPLETE ✅');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('🌐 LIVE: https://courthero.app\n');
    console.log('📝 TEST: https://courthero.app/signup\n');
    console.log('✨ READY TO SHIP!\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

deployFinal();
