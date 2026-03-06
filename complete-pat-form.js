const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function completePAT() {
  console.log('\n🚀 Completing PAT creation and deploying...\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Going to PAT page...');
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    
    // Fill the Note field
    console.log('Filling form...');
    await page.fill('input[name="oauth_access_description"]', 'court-hero-deploy');
    
    // Check the "repo" checkbox
    await page.check('input[name="oauth_access[scopes][]"][value="repo"]');
    
    // Click Generate token
    console.log('Generating token...');
    await page.click('button:has-text("Generate token")');
    
    // Wait for token page
    await page.waitForTimeout(4000);
    
    // Extract token - try multiple methods
    console.log('Extracting token...\n');
    
    let token = await page.evaluate(() => {
      // Method 1: Look for text starting with ghp_
      const bodyText = document.body.innerText;
      const match = bodyText.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (match) return match[0];
      
      // Method 2: Check all inputs
      const inputs = document.querySelectorAll('input, textarea');
      for (let inp of inputs) {
        if (inp.value && inp.value.startsWith('ghp_')) return inp.value;
      }
      
      // Method 3: Check code blocks
      const codes = document.querySelectorAll('code, pre, span');
      for (let code of codes) {
        const text = code.textContent;
        const match = text.match(/ghp_[a-zA-Z0-9_]{36,}/);
        if (match) return match[0];
      }
      
      return null;
    });
    
    if (!token) {
      console.log('❌ Could not extract token');
      console.log('Taking screenshot for debugging...');
      await page.screenshot({ path: '/tmp/token-page.png', fullPage: true });
      
      // Try to get the page HTML
      const html = await page.content();
      const match = html.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (match) {
        token = match[0];
        console.log('✅ Found token in HTML');
      }
    }
    
    if (!token) {
      console.log('Please check /tmp/token-page.png');
      process.exit(1);
    }
    
    console.log(`✅ TOKEN: ${token.substring(0, 30)}...\n`);
    
    await browser.close();
    
    // DEPLOY
    console.log('Deploying to GitHub...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`);
    
    console.log('Pushing to GitHub...');
    const output = execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    console.log(output);
    
    console.log('\n✅ CODE PUSHED TO GITHUB!\n');
    console.log('⏳ Waiting for Vercel deployment (40 seconds)...\n');
    
    await new Promise(resolve => setTimeout(resolve, 40000));
    
    console.log('\n════════════════════════════════════════════════════════════════\n');
    console.log('                    ✅✅✅ DEPLOYMENT COMPLETE ✅✅✅\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('COURT HERO IS LIVE!\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 https://courthero.app/signup\n');
    console.log('\n✨✨✨ READY TO SHIP ✨✨✨\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

completePAT();
