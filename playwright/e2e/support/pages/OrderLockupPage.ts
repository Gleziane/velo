import { Locator, Page } from '@playwright/test';

export class OrderLockupPage {
    constructor(private page: Page) {}

    async searchOrder(numero: string) {
        await this.page.getByRole('textbox', { name: 'Código do Pedido' }).fill(numero);
        await this.page.getByRole('button', { name: 'Buscar Pedido' }).click();
    }

    getOrderResult(orderNumber: string): Locator {
        return this.page.getByTestId(`order-result-${orderNumber}`);
    }

    getStatusBadge(status: string): Locator {
        return this.page.getByText(status, { exact: true });
    }

    getNotFoundHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Pedido não encontrado' });
    }

    getNotFoundMessage(): Locator {
        return this.page.getByText('Verifique o número do pedido e tente novamente');
    }
}
   