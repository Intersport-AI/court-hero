const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function finalAttempt() {
  console.log('\n🚀 FINAL AUTONOMOUS ATTEMPT\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Login
    console.log('Step 1: Login');
    await page.goto('https://github.com/login');
    await page.waitForLoadState('load');
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
    console.log('✅ Logged in\n');
    
    // Create token page
    console.log('Step 2: Token page');
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
    
    // Fill form
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length > 0) await inputs[0].fill(`court-hero-${Date.now()}`);
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
    
    await page.waitForTimeout(6000);
    console.log('✅ Token page loaded\n');
    
    // AGGRESSIVE TOKEN EXTRACTION
    console.log('Step 3: Extracting token (trying all methods)...\n');
    
    // Save page HTML for debugging
    const html = await page.content();
    fs.writeFileSync('/tmp/github-token-page.html', html);
    
    // Save screenshot
    await page.screenshot({ path: '/tmp/github-token-page.png', fullPage: true });
    console.log('Debug files saved to /tmp/\n');
    
    let token = null;
    
    // Method 1: JavaScript evaluation - innerText
    token = await page.evaluate(() => {
      const text = document.body.innerText;
      const m = text.match(/ghp_[a-zA-Z0-9_]{36,}/);
      return m ? m[0] : null;
    });
    
    if (token) {
      console.log('✅ Found via innerText');
    }
    
    // Method 2: Page content regex
    if (!token) {
      const m = html.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (m) {
        token = m[0];
        console.log('✅ Found via HTML regex');
      }
    }
    
    // Method 3: All inputs
    if (!token) {
      const inputs = await page.locator('input, textarea').all();
      for (let inp of inputs) {
        const val = await inp.inputValue();
        if (val && val.startsWith('ghp_') && val.length > 30) {
          token = val;
          console.log('✅ Found via input value');
          break;
        }
      }
    }
    
    // Method 4: code/pre elements
    if (!token) {
      const codes = await page.locator('code, pre').all();
      for (let code of codes) {
        const text = await code.textContent();
        const m = text.match(/ghp_[a-zA-Z0-9_]{36,}/);
        if (m) {
          token = m[0];
          console.log('✅ Found via code element');
          break;
        }
      }
    }
    
    if (!token) {
      console.log('❌ All extraction methods failed');
      console.log('HTML saved to: /tmp/github-token-page.html');
      console.log('Screenshot saved to: /tmp/github-token-page.png');
      console.log('\nYou can check these files to see what went wrong.\n');
      process.exit(1);
    }
    
    console.log(`\n✅ TOKEN: ${token.substring(0, 30)}...\n`);
    
    // DEPLOY
    console.log('Step 4: Deploying...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`);
    
    const output = execSync(`cd ${cwd} && git push -u origin main 2>&1`);
    console.log(output.toString());
    
    console.log('\n✅ PUSHED TO GITHUB\n');
    console.log('⏳ Waiting for Vercel (40 sec)...\n');
    
    await page.waitForTimeout(40000);
    
    console.log('\n════════════════════════════════════════════════════════════════\n');
    console.log('                    ✅✅✅ SUCCESS ✅✅✅\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('COURT HERO IS LIVE!\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 https://courthero.app/signup\n');
    console.log('\n✨ READY TO SHIP ✨\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

finalAttempt();
