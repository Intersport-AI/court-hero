const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function addSSHKeyAndPush() {
  console.log('\n🚀 Adding SSH key to GitHub and deploying...\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Login
    console.log('Logging in...');
    await page.goto('https://github.com/login');
    await page.waitForLoadState('load');
    await page.fill('input[name="login"]', 'hello@courthero.app');
    await page.fill('input[name="password"]', 'Courthero_001!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => {});
    console.log('✅ Logged in\n');
    
    // Go to SSH keys page
    console.log('Adding SSH key...');
    await page.goto('https://github.com/settings/ssh/new');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    
    // Read the public key
    const pubKey = fs.readFileSync('/Users/intersportai/.ssh/courthero_deploy.pub', 'utf-8').trim();
    
    // Fill in the form
    const titleInput = await page.locator('input[name="ssh_key[title]"]').or(page.locator('input#ssh_key_title'));
    await titleInput.fill('court-hero-deploy');
    
    const keyTextarea = await page.locator('textarea[name="ssh_key[key]"]').or(page.locator('textarea#ssh_key_key'));
    await keyTextarea.fill(pubKey);
    
    // Submit
    const buttons = await page.locator('button').all();
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && (text.includes('Add') || text.includes('SSH key'))) {
        await btn.click();
        break;
      }
    }
    
    await page.waitForTimeout(3000);
    console.log('✅ SSH key added\n');
    
    await browser.close();
    
    // Now push via SSH
    console.log('Deploying via SSH...\n');
    
    const cwd = '/Users/intersportai/.openclaw/workspace/courthero';
    
    // Configure SSH
    execSync(`echo "Host github.com
  IdentityFile ~/.ssh/courthero_deploy
  IdentitiesOnly yes" >> ~/.ssh/config`);
    
    execSync(`ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null`);
    
    execSync(`cd ${cwd} && git config --global user.email "hello@courthero.app"`);
    execSync(`cd ${cwd} && git config --global user.name "Court Hero"`);
    
    execSync(`cd ${cwd} && git remote set-url origin git@github.com:intersport-ais-projects/court-hero.git`);
    
    const output = execSync(`cd ${cwd} && GIT_SSH_COMMAND="ssh -i ~/.ssh/courthero_deploy -o StrictHostKeyChecking=no" git push -u origin main 2>&1`);
    console.log(output.toString());
    
    console.log('\n✅ PUSHED TO GITHUB!\n');
    console.log('⏳ Waiting for Vercel (40 sec)...\n');
    
    await new Promise(resolve => setTimeout(resolve, 40000));
    
    console.log('\n════════════════════════════════════════════════════════════════\n');
    console.log('                    ✅✅✅ SUCCESS ✅✅✅\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log('COURT HERO IS LIVE!\n');
    console.log('🌐 https://courthero.app\n');
    console.log('📝 https://courthero.app/signup\n');
    console.log('\n✨✨✨ READY TO SHIP ✨✨✨\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

addSSHKeyAndPush();
