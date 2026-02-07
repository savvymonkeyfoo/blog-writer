import { test, expect } from '@playwright/test'

test.describe('Progress Stepper Visual Test', () => {
  test('active step should have dark navy background with visible white number', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')

    // Wait for the progress stepper to be visible
    await page.waitForSelector('[data-testid="progress-stepper"], .hidden.md\\:block', { timeout: 10000 })

    // Find the active step (step 1 - IDEATION)
    const activeStep = page.locator('button').filter({ hasText: /^1$/ }).first()

    // Wait for the element to be visible
    await activeStep.waitFor({ state: 'visible' })

    // Get computed styles
    const backgroundColor = await activeStep.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    const color = await activeStep.evaluate((el) => {
      return window.getComputedStyle(el).color
    })

    const borderWidth = await activeStep.evaluate((el) => {
      return window.getComputedStyle(el).borderWidth
    })

    console.log('Active step styles:', { backgroundColor, color, borderWidth })

    // Check that background is dark navy (rgb(10, 22, 40) = #0A1628)
    expect(backgroundColor).toBe('rgb(10, 22, 40)')

    // Check that text color is white
    expect(color).toMatch(/rgb\(255,\s*255,\s*255\)|rgb\(248,\s*250,\s*252\)/)

    // Check that border is present (3px)
    expect(borderWidth).toBe('3px')

    // Take a screenshot for visual verification
    await page.screenshot({
      path: '/Users/mikejones/Projects/Blog writer/studio/e2e/screenshots/progress-stepper.png',
      fullPage: false
    })

    console.log('✓ Active step has correct dark navy background')
    console.log('✓ Active step has white text')
    console.log('✓ Screenshot saved to e2e/screenshots/progress-stepper.png')
  })
})
