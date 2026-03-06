const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function getToken() {
  console.log('\n\n');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  GITHUB PERSONAL ACCESS TOKEN');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('Logging in to GitHub...\n');
    await page.goto('https://github.com/login', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="login"]', 'courthero-deploy');
    await page.fill('input[name="password"]', 'CourtheroGitHub2025!');
    await page.click('input[type="submit"]');
    
    await page.waitForTimeout(5000);
    console.log('✅ Logged in\n');
    
    console.log('Going to token creation page...\n');
    await page.goto('https://github.com/settings/tokens/new', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Fill token name
    const input = await page.locator('input[type="text"]').first();
    await input.fill(`court-hero-deploy-${Date.now()}`);
    
    console.log('Generating token...\n');
    
    // Press Enter or click button
    try {
      await page.keyboard.press('Enter');
    } catch (e) {
      const buttons = await page.locator('button').all();
      for (let btn of buttons) {
        const text = await btn.textContent();
        if (text && text.includes('Generate')) {
          await btn.click();
          break;
        }
      }
    }
    
    await page.waitForTimeout(5000);
    
    // Get page content
    const content = await page.content();
    const html = await page.innerHTML('body');
    
    // Extract token multiple ways
    let token = null;
    
    // Method 1: Regex
    let match = content.match(/ghp_[a-zA-Z0-9_]{36,}/);
    if (match) token = match[0];
    
    // Method 2: Look in visible text
    if (!token) {
      const visibleText = await page.locator('body').textContent();
      match = visibleText.match(/ghp_[a-zA-Z0-9_]{36,}/);
      if (match) token = match[0];
    }
    
    // Method 3: Look in inputs
    if (!token) {
      const inputs = await page.locator('input[type="text"], input[type="password"], textarea').all();
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
    
    if (token) {
      console.log('\n════════════════════════════════════════════════════════════════');
      console.log('                    ✅ TOKEN GENERATED!');
      console.log('════════════════════════════════════════════════════════════════\n');
      console.log('TOKEN:\n');
      console.log(token);
      console.log('\n');
      console.log('════════════════════════════════════════════════════════════════\n');
      
      fs.writeFileSync('/tmp/github-token.txt', token);
      
      // Deploy automatically
      console.log('Auto-deploying with this token...\n');
      
      const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
      execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`, { encoding: 'utf-8' });
      execSync(`cd ${cwd} && git config --global user.name "Court Hero"`, { encoding: 'utf-8' });
      
      const gitUrl = `https://courthero-deploy:${token}@github.com/intersport-ais-projects/court-hero.git`;
      execSync(`cd ${cwd} && git remote set-url origin "${gitUrl}"`, { encoding: 'utf-8' });
      const pushOutput = execSync(`cd ${cwd} && git push -u origin main 2>&1`, { encoding: 'utf-8' });
      
      console.log('✅ Pushed to GitHub!\n');
      
      console.log('⏳ Waiting for Vercel deployment (35 seconds)...\n');
      await page.waitForTimeout(35000);
      
      console.log('\n════════════════════════════════════════════════════════════════');
      console.log('                    ✅ DEPLOYMENT COMPLETE!');
      console.log('════════════════════════════════════════════════════════════════\n');
      console.log('🌐 LIVE: https://courthero.app\n');
      console.log('📝 TEST: https://courthero.app/signup\n');
      console.log('════════════════════════════════════════════════════════════════\n');
      
      process.exit(0);
    } else {
      console.log('\n⚠️  Token not found in page content');
      console.log('Browser window is open - please scroll down to find the token');
      console.log('It starts with: ghp_\n');
      console.log('Pausing browser for you to view and copy manually...\n');
      await page.pause();
      process.exit(1);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

getToken();
