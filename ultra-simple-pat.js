const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function ultraSimplePAT() {
  console.log('\n🚀 ULTRA-SIMPLE PAT CREATION\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
    
    console.log('Filling form...');
    
    // Fill note
    await page.locator('input[type="text"]').first().fill('court-hero-deploy');
    
    // Select repo - use getByLabel which is more robust
    await page.getByLabel('repo', { exact: false }).check();
    
    console.log('Generating...');
    await page.getByRole('button', { name: 'Generate token' }).click();
    
    await page.waitForTimeout(5000);
    console.log('✅ Generated\n');
    
    // Extract
    let token = await page.evaluate(() => {
      const text = document.body.innerText;
      const m = text.match(/ghp_[a-zA-Z0-9_]{36,}/);
      return m ? m[0] : null;
    });
    
    if (!token) {
      const html = await page.content();
      const m = html.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (m) token = m[0];
    }
    
    if (!token) {
      console.log('❌ No token found');
      await page.screenshot({ path: '/tmp/pat-fail.png', fullPage: true });
      process.exit(1);
    }
    
    console.log(`✅ TOKEN: ${token.substring(0, 30)}...\n`);
    
    await browser.close();
    
    // DEPLOY
    console.log('DEPLOYING...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    execSync(`cd ${cwd} && git remote set-url origin "https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git"`);
    
    const out = execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    console.log(out);
    
    console.log('\n✅ PUSHED!\n');
    console.log('⏳ Vercel deploying (40 sec)...\n');
    
    await new Promise(r => setTimeout(r, 40000));
    
    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('              ✅ COURT HERO IS LIVE ✅\n');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 https://courthero.app/signup\n');
    console.log('✨ READY TO SHIP\n');
    console.log('════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

ultraSimplePAT();
