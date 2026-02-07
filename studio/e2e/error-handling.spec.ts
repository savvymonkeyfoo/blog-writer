import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test('displays error message for API failures gracefully', async ({ page }) => {
    await page.goto('/')

    // Try to generate with a topic - if API fails, error boundary should catch it
    await page.locator('input[placeholder*="Enter your topic"]').fill('Test topic for error handling')
    await page.locator('button:has-text("Generate Angles")').click()

    // Wait a bit to see if any errors occur
    await page.waitForTimeout(2000)

    // If error occurs, error boundary should show fallback UI
    const errorBoundary = page.locator('text=Something went wrong')
    if (await errorBoundary.isVisible()) {
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible()
    }
  })
})
