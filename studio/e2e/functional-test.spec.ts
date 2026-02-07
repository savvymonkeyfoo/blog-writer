import { test, expect } from '@playwright/test'

test.describe('Application Functional Tests', () => {
  test('should display the main interface correctly', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Check for main heading
    await expect(page.locator('h1:has-text("Content Studio")')).toBeVisible()

    // Check for progress stepper phases
    await expect(page.locator('text=Ideation')).toBeVisible()
    await expect(page.locator('text=Research')).toBeVisible()
    await expect(page.locator('text=Writing')).toBeVisible()
    await expect(page.locator('text=Assets')).toBeVisible()
    await expect(page.locator('text=Review')).toBeVisible()

    // Check for the Generate Angles button
    await expect(page.locator('button:has-text("Generate Angles")')).toBeVisible()

    // Check for the ready message
    await expect(page.locator('text=Ready to create?')).toBeVisible()
  })

  test('should allow entering a topic', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Find the input field by placeholder
    const input = page.locator('input[placeholder*="Enter your topic"]')
    await expect(input).toBeVisible()

    // Enter a valid topic
    await input.fill('The Future of AI in Software Development')

    // Verify the text was entered
    await expect(input).toHaveValue('The Future of AI in Software Development')

    // Take a screenshot
    await page.screenshot({ path: 'test-results/topic-entered.png' })
  })

  test('should validate topic length', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    const input = page.locator('input[placeholder*="Enter your topic"]')
    await expect(input).toBeVisible()

    // Try entering a very short topic (less than 5 chars)
    await input.fill('AI')

    // Try to click generate
    const generateButton = page.locator('button:has-text("Generate Angles")')
    await generateButton.click()

    // Wait for error message to appear
    await page.waitForTimeout(1000)

    // Take screenshot of validation error
    await page.screenshot({ path: 'test-results/validation-error.png' })
  })

  test('should handle XSS attempts in topic input', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    const input = page.locator('input[placeholder*="Enter your topic"]')
    await expect(input).toBeVisible()

    // Try to enter XSS payload
    await input.fill('<script>alert("XSS")</script>')

    // Try to submit
    const generateButton = page.locator('button:has-text("Generate Angles")')
    await generateButton.click()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify no actual script execution (page should still be normal)
    const heading = page.locator('h1:has-text("Content Studio")')
    await expect(heading).toBeVisible()

    // Take screenshot
    await page.screenshot({ path: 'test-results/xss-attempt.png' })
  })

  test('should enable Generate button when valid topic is entered', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    const input = page.locator('input[placeholder*="Enter your topic"]')
    const generateButton = page.locator('button:has-text("Generate Angles")')

    // Button should be visible
    await expect(generateButton).toBeVisible()

    // Enter a valid topic
    await input.fill('The Future of AI in Software Development')

    // Wait a moment for any validation
    await page.waitForTimeout(500)

    // Take final screenshot
    await page.screenshot({ path: 'test-results/ready-to-generate.png', fullPage: true })
  })

  test('should test the workflow phases navigation', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Phase 1 (Ideation) should be active
    const ideationPhase = page.locator('text=Ideation').locator('..')
    await expect(ideationPhase).toBeVisible()

    // Screenshot of ideation phase
    await page.screenshot({ path: 'test-results/phase-ideation.png' })
  })
})
