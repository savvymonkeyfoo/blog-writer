import { test, expect } from '@playwright/test'
import { TEST_TOPICS, TEST_INSTRUCTIONS } from './fixtures/test-data'

test.describe('Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows error for empty topic', async ({ page }) => {
    await page.locator('button:has-text("Generate Angles")').click()
    await expect(page.locator('text=Please enter a topic')).toBeVisible()
  })

  test('shows error for topic that is too short', async ({ page }) => {
    await page.locator('input[placeholder*="Enter your topic"]').fill(TEST_TOPICS.tooShort)
    await page.locator('button:has-text("Generate Angles")').click()
    await expect(page.locator('text=at least 5 characters')).toBeVisible()
  })

  test('prevents XSS in topic input', async ({ page }) => {
    await page.locator('input[placeholder*="Enter your topic"]').fill(TEST_TOPICS.xss)
    await page.locator('button:has-text("Generate Angles")').click()

    // Should show validation error or sanitize
    const errorMsg = page.locator('text=cannot contain')
    await expect(errorMsg).toBeVisible()
  })

  test('enforces character limit on topic input', async ({ page }) => {
    const topicInput = page.locator('input[placeholder*="Enter your topic"]')
    await topicInput.fill(TEST_TOPICS.tooLong)

    const value = await topicInput.inputValue()
    expect(value.length).toBeLessThanOrEqual(500)
  })
})
