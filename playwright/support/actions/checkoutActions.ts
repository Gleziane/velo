import { expect, Page } from '@playwright/test'

export type PaymentMethod = 'avista' | 'financiamento'

export type CustomerData = {
  name: string
  surname: string
  email: string
  phone: string
  cpf: string
}

const paymentTestIds: Record<PaymentMethod, string> = {
  avista: 'payment-avista',
  financiamento: 'payment-financiamento',
}

export function createCheckoutActions(page: Page) {
  const elements = {
    nameInput: page.getByTestId('checkout-name'),
    surnameInput: page.getByTestId('checkout-surname'),
    emailInput: page.getByTestId('checkout-email'),
    phoneInput: page.getByTestId('checkout-phone'),
    cpfInput: page.getByTestId('checkout-cpf'),
    storeSelect: page.getByLabel('Loja para Retirada'),
    cashPaymentButton: page.getByTestId(paymentTestIds.avista),
    financingPaymentButton: page.getByTestId(paymentTestIds.financiamento),
    entryValueInput: page.getByLabel('Valor da Entrada'),
    termsCheckbox: page.getByLabel(/Li e aceito os Termos de Uso/),
    submitButton: page.getByRole('button', { name: 'Confirmar Pedido' }),
    summaryPrice: page.getByTestId('summary-total-price'),
    alerts: {
      name: page.getByTestId('error-checkout-name'),
      lastname: page.getByTestId('error-checkout-surname'),
      email: page.getByTestId('error-checkout-email'),
      phone: page.getByTestId('error-checkout-phone'),
      document: page.getByTestId('error-checkout-cpf'),
      store: page.getByTestId('error-checkout-store'),
      terms: page.getByTestId('error-checkout-terms'),
    },
  }

  return {
    elements,

    async goto() {
      await page.goto('http://localhost:5173/order')
      await expect(elements.submitButton).toBeVisible()
    },

    async fillCustomerData(data: CustomerData) {
      await elements.nameInput.fill(data.name)
      await elements.surnameInput.fill(data.surname)
      await elements.emailInput.fill(data.email)
      await elements.phoneInput.fill(data.phone)
      await elements.cpfInput.fill(data.cpf)
    },

    async selectStore(store: string) {
      await elements.storeSelect.click()
      await page.getByRole('option', { name: store }).click()
    },

    async selectPaymentMethod(paymentMethod: PaymentMethod) {
      const paymentButton = paymentMethod === 'avista'
        ? elements.cashPaymentButton
        : elements.financingPaymentButton

      await paymentButton.click()
    },

    async fillEntryValue(value: number) {
      await elements.entryValueInput.fill(String(value))
    },

    async acceptTerms() {
      await elements.termsCheckbox.check()
    },

    async submit() {
      await elements.submitButton.click()
    },

    async validateSummaryPrice(price: string) {
      await expect(elements.summaryPrice).toHaveText(price)
    },

    async validateInstallment(installment: string) {
      await expect(elements.financingPaymentButton).toContainText(installment)
    },

    async validateFieldError(field: string, message: string) {
      await expect(page.getByText(message).first()).toBeVisible()
      await expect(page.getByLabel(field)).toHaveClass(/border-destructive/)
    },
  }
}
   