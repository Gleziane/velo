import { Page, expect } from '@playwright/test'

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

export class OrderLockupPage {
    private readonly statusClasses = {
        APROVADO: ['bg-green-100', 'text-green-700', 'lucide-circle-check-big'],
        REPROVADO: ['bg-red-100', 'text-red-700', 'lucide-circle-x'],
        EM_ANALISE: ['bg-amber-100', 'text-amber-700', 'lucide-clock']
    } as const

    constructor(private page: Page) { }

    async searchOrder(code: string) {
        await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(code)
        await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
    }

    async validateOrderDetails(details: OrderDetails) {
        await expect(this.page.getByTestId(`order-result-${details.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${details.number}
      - status:
        - img
        - text: ${details.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${details.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${details.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${details.customer.name}
      - paragraph: Email
      - paragraph: ${details.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${details.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

        await this.validateStatusBadge(details.status)
    }

    async validateOrderNotFound() {
        await expect(this.page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
    }

    async validateStatusBadge(status: OrderStatus) {
        const [bgClass, textClass, iconClass] = this.statusClasses[status]
        const statusBadge = this.page.getByRole('status').filter({ hasText: status })

        await expect(statusBadge).toHaveClass(new RegExp(bgClass))
        await expect(statusBadge).toHaveClass(new RegExp(textClass))
        await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(iconClass))
    }
}