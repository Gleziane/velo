import { expect, Page } from '@playwright/test'

// A navegação para /success só ocorre depois da gravação do pedido no Supabase
// (e da análise de crédito no financiamento), que pode passar do timeout padrão.
const SUBMIT_NAVIGATION_TIMEOUT = 10000

export function createSuccessActions(page: Page) {
  const elements = {
    status: page.getByTestId('success-status'),
    orderId: page.getByTestId('order-id'),
  }

  return {
    elements,

    async validateApproved() {
      await expect(page).toHaveURL(/\/success/, { timeout: SUBMIT_NAVIGATION_TIMEOUT })
      await expect(elements.status).toHaveText('Pedido Aprovado!')
      await expect(elements.orderId).toHaveText(/^VLO-/)
    },

    async validatePending() {
      await expect(page).toHaveURL(/\/success/, { timeout: SUBMIT_NAVIGATION_TIMEOUT })
      await expect(elements.status).toHaveText('Pedido em Análise')
      await expect(elements.orderId).toHaveText(/^VLO-/)
    },

    async validateReproved() {
      await expect(page).toHaveURL(/\/success/, { timeout: SUBMIT_NAVIGATION_TIMEOUT })
      await expect(elements.status).toHaveText('Crédito Reprovado')
      await expect(elements.orderId).toHaveText(/^VLO-/)
    },

    async getOrderNumber() {
      await expect(elements.orderId).toHaveText(/^VLO-/)
      return (await elements.orderId.textContent()) ?? ''
    },

    async goToOrderLookup() {
      await page.getByTestId('goto-consultar').click()
      await expect(page).toHaveURL(/\/lookup$/)
    },
  }
}
