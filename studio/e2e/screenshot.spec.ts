import { test } from '@playwright/test'

test('capture application screenshot', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: 'test-results/app-screenshot.png', fullPage: true })
  console.log('Screenshot saved to test-results/app-screenshot.png')
})
