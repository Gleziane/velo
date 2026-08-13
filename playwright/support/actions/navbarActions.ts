import { expect, Page } from '@playwright/test'

export function createNavbarActions(page: Page) {
  return {
    async openOrderLookup() {
      await page.getByRole('link', { name: 'Consultar Pedido' }).click()
      await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    },
  }
}
