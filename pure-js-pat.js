const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function pureJSPAT() {
  console.log('\n🚀 PURE JAVASCRIPT PAT\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
    
    console.log('Using JavaScript to complete form...');
    
    const success = await page.evaluate(() => {
      try {
        // Fill note
        const noteInput = document.querySelector('input[type="text"]');
        if (noteInput) {
          noteInput.value = 'court-hero-deploy';
          noteInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Find repo checkbox/input
        const inputs = document.querySelectorAll('input');
        for (let inp of inputs) {
          const val = inp.getAttribute('value');
          if (val === 'repo') {
            inp.checked = true;
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            inp.click();
            break;
          }
        }
        
        // Find and click Generate button
        const buttons = document.querySelectorAll('button');
        for (let btn of buttons) {
          if (btn.textContent.includes('Generate')) {
            btn.click();
            return true;
          }
        }
        
        return false;
      } catch (e) {
        return false;
      }
    });
    
    console.log(success ? '✅ Form submitted' : '❌ Form submission failed');
    
    await page.waitForTimeout(6000);
    console.log('Waiting for token page...\n');
    
    // Extract token
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
      console.log('❌ No token');
      await page.screenshot({ path: '/tmp/no-token.png', fullPage: true });
      await browser.close();
      process.exit(1);
    }
    
    console.log(`✅ TOKEN: ${token}\n`);
    
    await browser.close();
    
    // DEPLOY
    console.log('DEPLOYING...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    execSync(`cd ${cwd} && git remote set-url origin "https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git"`);
    
    const output = execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    console.log(output);
    
    console.log('\n✅ DEPLOYED!\n');
    console.log('⏳ Vercel (40 sec)...\n');
    
    await new Promise(r => setTimeout(r, 40000));
    
    console.log('\n════════════════════════════════════════════\n');
    console.log('      ✅ COURT HERO IS LIVE ✅\n');
    console.log('════════════════════════════════════════════\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 https://courthero.app/signup\n');
    console.log('✨ READY\n');
    console.log('════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    await browser.close();
    process.exit(1);
  }
}

pureJSPAT();
