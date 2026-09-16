import { expect, Page } from '@playwright/test'

export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export type OrderDetails = {
  number: string
  status: OrderStatus
  color: string
  wheels: string
  customer: {
    name: string
    email: string
  }
  payment: string
}



const statusClasses = {
    APROVADO: ['bg-green-100', 'text-green-700', 'lucide-circle-check-big'],
    REPROVADO: ['bg-red-100', 'text-red-700', 'lucide-circle-x'],
    EM_ANALISE: ['bg-yellow-100', 'text-amber-700', 'lucide-clock'],
  } as const

  const validateStatusBadge = async (page: Page, status: OrderStatus, orderNumber: string) => {
    const [bgClass, textClass, iconClass] = statusClasses[status]
    const orderResult = page.getByTestId(`order-result-${orderNumber}`)
    const statusBadge = orderResult.locator('div').filter({ hasText: status }).last()

    await expect(statusBadge).toHaveClass(new RegExp(bgClass))
    await expect(statusBadge).toHaveClass(new RegExp(textClass))
    await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(iconClass))
  }
  
export function createOrderLookupActions(page: Page) {

const orderInput = page.getByRole('textbox', { name: 'Código do Pedido' })
const searchButton = page.getByRole('button', { name:'Buscar Pedido'})

  return {

    elements: {
      orderInput,
      searchButton
    },

    async searchOrder(code: string) {
      await page.getByRole('textbox', { name: 'Código do Pedido' }).fill(code)
      await page.getByRole('button', { name: 'Buscar Pedido' }).click()
    },

    async validateOrderDetails(details: OrderDetails) {
      const orderResult = page.getByTestId(`order-result-${details.number}`)

      await expect(orderResult).toContainText('Pedido')
      await expect(orderResult).toContainText(details.number)
      await expect(orderResult).toContainText(details.status)
      await expect(orderResult).toContainText('Velô Sprint')
      await expect(orderResult).toContainText(details.color)
      await expect(orderResult).toContainText('cream')
      await expect(orderResult).toContainText(details.wheels)
      await expect(orderResult).toContainText('Dados do Cliente')
      await expect(orderResult).toContainText(details.customer.name)
      await expect(orderResult).toContainText(details.customer.email)
      await expect(orderResult).toContainText('Data do Pedido')
      await expect(orderResult).toContainText(/\d{2}\/\d{2}\/\d{4}/)
      await expect(orderResult).toContainText('Pagamento')
      await expect(orderResult).toContainText(details.payment)
      await expect(orderResult).toContainText(/R\$\s*\d+\.\d+,\d+/)

      await validateStatusBadge(page, details.status, details.number)
    },

    async validateOrderNotFound() {
      await expect(page.locator('#root')).toMatchAriaSnapshot(`
        - img
        - heading "Pedido não encontrado" [level=3]
        - paragraph: Verifique o número do pedido e tente novamente
      `)
    },

    validateStatusBadge: (status: OrderStatus, orderNumber: string) =>
      validateStatusBadge(page, status, orderNumber),
  }
}
