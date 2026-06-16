const { chromium } = require('@playwright/test');

const BACKUP_TASK = `
📋 Tasks completed today
Worked on refining product requirements and aligning them with current implementation flow.
Reviewed and analyzed Twilio integration requirements for product communication workflows.
Explored and understood agent prompting logic and its expected behavior within the product.
Performed code-level analysis to better understand feature flow and implementation dependencies.
Supported client onboarding by reviewing checklist progress and pending setup items.
Conducted a live product delivery/demo session and walked the client through key workflows.
Captured client feedback and noted technical/actionable improvements for follow-up.
⚡ Challenges encountered and how you overcame them
Some parts of the implementation flow were unclear initially — resolved by analyzing the codebase and clarifying logic internally.
Twilio-related workflow understanding required deeper context — addressed by reviewing integration points and expected use cases.
Clients needed support during onboarding and delivery — handled through clear walkthroughs and real-time guidance.
🚧 Blockers faced
Waiting on a few client-side inputs and configuration details to complete the final setup.
Some implementation dependencies still need confirmation before moving ahead fully.
`.trim();

(async () => {
  const finalText = BACKUP_TASK;
  let browser;

  try {
    console.log('🚀 Starting automation...');
    
    browser = await chromium.launch({ headless: true });
    console.log('✅ Browser launched');

    const context = await browser.newContext({
      storageState: process.env.AUTH_STATE
        ? JSON.parse(process.env.AUTH_STATE)
        : undefined
    });
    console.log('✅ Auth context loaded');

    const page = await context.newPage();
    
    // Navigate with more robust waiting
    console.log('📡 Navigating to Kalvium portal...');
    await page.goto('https://kalvium.community/internships', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    console.log('✅ Page loaded');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-page-load.png', fullPage: true });
    console.log('📸 Screenshot saved');

    // Wait for page to be fully interactive
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check if we're logged in
    const pageContent = await page.content();
    if (pageContent.includes('Continue with Google') || pageContent.includes('Sign in')) {
      throw new Error('❌ Not logged in - auth.json may be expired. Please re-run login.js');
    }
    console.log('✅ Authentication verified');

    // Try multiple selectors for the Complete button
    console.log('🔍 Looking for Complete button...');
    const completeButton = await page.locator('text=Complete').or(
      page.locator('button:has-text("Complete")')
    ).or(
      page.locator('[aria-label*="Complete"]')
    ).first();

    await completeButton.waitFor({ state: 'visible', timeout: 30000 });
    await completeButton.click();
    console.log('✅ Clicked Complete button');

    await page.waitForTimeout(2000);

    // Click dropdown
    console.log('📋 Opening dropdown...');
    const combobox = page.locator('button[role="combobox"]');
    await combobox.waitFor({ state: 'visible', timeout: 10000 });
    await combobox.click();
    console.log('✅ Dropdown opened');

    // Select first option
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').first().click();
    console.log('✅ Selected option');

    // Fill the editor
    console.log('✏️ Filling report...');
    const editor = page.locator('div[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 10000 });
    await editor.click();
    await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.waitForTimeout(500);
    await editor.fill(finalText);
    console.log('✅ Report filled');

    // Force TipTap update
    await editor.press('Enter');
    await page.waitForTimeout(1000);

    // Scroll modal
    await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop = modal.scrollHeight;
    });

    // Submit
    console.log('📤 Submitting...');
    const submitBtn = page.locator('button[type="submit"]:has-text("Submit")');
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
    await submitBtn.click();
    console.log('✅ Submit button clicked');

    // Confirm submission
    await page.waitForSelector(
      'button[type="submit"]:has-text("Submit")',
      { state: 'detached', timeout: 15000 }
    );
    console.log('✅ Form submitted successfully');

    // Allow network to finish
    await page.waitForTimeout(2000);
    
    console.log('🎉 Automation completed successfully!');

  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    console.error('Stack:', error.stack);
    
    // Try to take error screenshot if page exists
    try {
      if (browser) {
        const pages = await browser.contexts()[0]?.pages();
        if (pages && pages[0]) {
          await pages[0].screenshot({ path: 'debug-error.png', fullPage: true });
          console.log('📸 Error screenshot saved');
        }
      }
    } catch (screenshotError) {
      console.error('Could not take screenshot:', screenshotError.message);
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
})();
