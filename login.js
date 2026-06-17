const { chromium } = require('@playwright/test');
const readline = require('readline');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🚀 Opening Kalvium internships page...');
  await page.goto('https://kalvium.community/internships');
  
  await page.waitForLoadState('networkidle');

  console.log('\n📋 INSTRUCTIONS:');
  console.log('👉 Click "Continue with Google"');
  console.log('👉 Select YOUR Kalvium email (@kalvium.community)');
  console.log('👉 WAIT until you see the internships dashboard (with "Complete" button)');
  console.log('👉 Make sure you can see your report form/buttons');
  console.log('👉 THEN press ENTER here to save the session\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  await new Promise(resolve => {
    rl.question('Press ENTER when logged in: ', () => {
      rl.close();
      resolve();
    });
  });

  // Verify we're actually logged in before saving
  const currentUrl = page.url();
  const buttons = await page.locator('button').allTextContents();
  
  console.log('\n🔍 Verification:');
  console.log(`   URL: ${currentUrl}`);
  console.log(`   Buttons found: ${buttons.slice(0, 5).join(', ')}`);
  
  if (buttons.some(b => b.includes('Continue with Google'))) {
    console.log('\n❌ Warning: Still seeing login button. Make sure you completed login!');
    console.log('   auth.json might not work properly.');
  }

  await context.storageState({ path: 'auth.json' });
  console.log('\n✅ auth.json saved successfully');
  console.log('   You can now close the browser window.');

  await page.waitForTimeout(2000);
  await browser.close();
})();
