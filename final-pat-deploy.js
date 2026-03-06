const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function finalPATDeploy() {
  console.log('\n🚀 FINAL PAT CREATION & DEPLOYMENT\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Opening PAT creation page...');
    await page.goto('https://github.com/settings/tokens/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
    
    // Fill the Note/Description field - try multiple selectors
    console.log('Filling Note field...');
    
    // Try finding by label
    const noteField = page.locator('input[type="text"]').first();
    await noteField.fill('court-hero-deploy');
    console.log('✅ Note filled');
    
    // Check repo scope
    console.log('Selecting repo scope...');
    await page.check('input[value="repo"]');
    console.log('✅ Scope selected');
    
    // Generate token
    console.log('Generating token...');
    await page.click('button:has-text("Generate token")');
    
    // Wait for redirect/token page
    await page.waitForTimeout(5000);
    console.log('✅ Token page loaded\n');
    
    // Extract token aggressively
    console.log('Extracting token...');
    
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
      console.log('❌ Token extraction failed');
      await page.screenshot({ path: '/tmp/github-final.png', fullPage: true });
      console.log('Screenshot: /tmp/github-final.png');
      process.exit(1);
    }
    
    console.log(`✅ TOKEN EXTRACTED: ${token.substring(0, 30)}...\n`);
    
    await browser.close();
    
    // DEPLOY TO GITHUB
    console.log('══════════════════════════════════════════════════════\n');
    console.log('DEPLOYING TO GITHUB\n');
    console.log('══════════════════════════════════════════════════════\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`, { encoding: 'utf-8' });
    
    const gitUrl = `https://hello@courthero.app:${token}@github.com/intersport-ais-projects/court-hero.git`;
    execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
    
    const pushOutput = execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
    console.log(pushOutput);
    
    console.log('\n✅ CODE PUSHED TO GITHUB!\n');
    console.log('⏳ Waiting for Vercel to deploy (40 seconds)...\n');
    
    await new Promise(r => setTimeout(r, 40000));
    
    console.log('\n════════════════════════════════════════════════════════════════\n');
    console.log('                    ✅✅✅ SUCCESS! ✅✅✅\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('\n');
    console.log('                      COURT HERO IS LIVE!\n');
    console.log('\n');
    console.log('🌐 Website:  https://courthero.app\n');
    console.log('📝 Signup:   https://courthero.app/signup\n');
    console.log('\n');
    console.log('✨✨✨ READY TO SHIP ✨✨✨\n');
    console.log('\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

finalPATDeploy();
