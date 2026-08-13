import { Page, expect } from '@playwright/test'

export class NavbarPage {
    constructor(private page: Page) { }

    async openOrderLookup() {
        await this.page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(this.page.getByRole('heading')).toContainText('Consultar Pedido')
    }
}
