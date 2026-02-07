import { Page, expect } from '@playwright/test'

export async function waitForPhase(page: Page, phaseName: string) {
  await expect(
    page.locator('[data-testid="progress-stepper"]')
      .locator(`text=${phaseName}`)
  ).toBeVisible()
}

export async function waitForLoading(page: Page) {
  await expect(page.locator('text=Generating...')).toBeVisible()
  await expect(page.locator('text=Generating...')).not.toBeVisible({ timeout: 60000 })
}
