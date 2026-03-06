const { chromium } = require('playwright');

async function authorizeGH() {
  console.log('Authorizing gh CLI via browser...\n');
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://github.com/login/device');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    
    // Click "Continue as CourtHero"
    const buttons = await page.locator('button').all();
    for (let btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('CourtHero')) {
        console.log('Clicking Continue as CourtHero...');
        await btn.click();
        break;
      }
    }
    
    // Wait for authorization to complete
    await page.waitForTimeout(5000);
    
    console.log('✅ Authorization complete\n');
    await browser.close();
    
    process.exit(0);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

authorizeGH();
