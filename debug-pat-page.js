const { chromium } = require('playwright');

async function debugPage() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://github.com/settings/tokens/new');
  await page.waitForLoadState('load');
  await page.waitForTimeout(3000);
  
  // Fill note
  await page.locator('input[type="text"]').first().fill('court-hero-deploy');
  console.log('✅ Note filled');
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/pat-form.png', fullPage: true });
  console.log('✅ Screenshot saved to /tmp/pat-form.png');
  
  // Get all checkboxes
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  console.log(`Found ${checkboxes.length} checkboxes`);
  
  // Try to find repo checkbox by iterating
  for (let i = 0; i < Math.min(checkboxes.length, 5); i++) {
    const cb = checkboxes[i];
    const value = await cb.getAttribute('value');
    const name = await cb.getAttribute('name');
    console.log(`Checkbox ${i}: value="${value}", name="${name}"`);
    
    if (value === 'repo' || (name && name.includes('repo'))) {
      console.log(`✅ Found repo checkbox at index ${i}`);
      await cb.check();
      console.log('✅ Checked repo');
      break;
    }
  }
  
  await page.screenshot({ path: '/tmp/pat-form-filled.png', fullPage: true });
  console.log('✅ Final screenshot: /tmp/pat-form-filled.png');
  
  await browser.close();
  process.exit(0);
}

debugPage();
