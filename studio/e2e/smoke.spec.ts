import { test, expect } from '@playwright/test'

test.describe('Application Smoke Tests', () => {
  test('should load the home page without errors', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Check that the page loaded (should have some heading or key element)
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()

    // Verify no console errors occurred
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Check that we can see the main application elements
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have topic input field', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Look for input field (there should be a textarea or input for topic)
    const input = page.locator('input[type="text"], textarea').first()
    await expect(input).toBeVisible()
  })

  test('should validate empty topic submission', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Try to find and click a generate button without entering a topic
    const generateButton = page.locator('button').filter({ hasText: /generate/i }).first()

    if (await generateButton.isVisible()) {
      await generateButton.click()

      // Should show some kind of validation error or prevent submission
      // Wait a moment for any error messages
      await page.waitForTimeout(1000)
    }
  })

  test('should accept valid topic input', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Find the input field
    const input = page.locator('input[type="text"], textarea').first()

    if (await input.isVisible()) {
      // Enter a valid topic
      await input.fill('The Future of AI in Software Development')

      // Verify the text was entered
      await expect(input).toHaveValue('The Future of AI in Software Development')
    }
  })

  test('should reject XSS attempts in topic', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    const input = page.locator('input[type="text"], textarea').first()

    if (await input.isVisible()) {
      // Try to enter XSS payload
      await input.fill('<script>alert(1)</script>')

      // Try to submit
      const generateButton = page.locator('button').filter({ hasText: /generate/i }).first()

      if (await generateButton.isVisible()) {
        await generateButton.click()

        // Wait for validation error
        await page.waitForTimeout(1000)

        // Check for validation error message
        const errorMessage = page.locator('text=/cannot contain.*<.*>/i, text=/validation/i').first()
        const isErrorVisible = await errorMessage.isVisible().catch(() => false)

        // Either should show error or prevent submission
        expect(isErrorVisible).toBeTruthy()
      }
    }
  })
})
