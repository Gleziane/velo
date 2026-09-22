import { expect, Page } from '@playwright/test'

export function createLandingActions(page: Page) {
  return {
    async goto() {
      await page.goto('/')
      await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
    },

    async goToConfigurator() {
      await page.getByTestId('hero-cta-primary').click()
      await expect(page).toHaveURL(/\/configure$/)
    },
  }
}
