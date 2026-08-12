import { test, expect } from '@playwright/test';

import { OrderLockupPage } from './support/pages/OrderLockupPage';


test.describe('Consultar Pedido', () => {


  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/lookup');

    await page.getByRole('link', {
      name: /Consultar Pedido/i,
    }).click();

    await expect(
      page.getByRole('heading', {
        name: /Consultar Pedido/i,
      })
    ).toBeVisible();
  });

  test('Deve consultar um pedido APROVADO', async ({ page }) => {
    // Arrange
    const order = {
      number: 'VLO-Q8ZD8X',
      status: 'APROVADO',
      color: 'Glacier Blue',
      interior: 'cream',
      wheels: 'aero Wheels',
      customer: {
        name: 'KLEBER ZANDONA',
        email: 'kleberzandona@gmail.com',
      },
      payment: 'À Vista',
    };

    // Act
    const orderLockupPage = new OrderLockupPage(page);

    await orderLockupPage.searchOrder (order.number);

    // Assert
    const orderResult = orderLockupPage.getOrderResult(order.number);

    await expect(orderResult).toBeVisible();
    await expect(orderResult).toContainText(order.number);
    await expect(orderResult).toContainText(order.status);

    await expect(orderResult).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: Glacier Blue
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: aero Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: KLEBER ZANDONA
      - paragraph: Email
      - paragraph: kleberzandona@gmail.com
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d{2}\\/\\d{2}\\/\\d{4}/
      - heading "Pagamento" [level=4]
      - paragraph: À Vista
      - paragraph: /R\\$ [\\d\\.]+,\\d{2}/
    `);
    const statusBadge = orderLockupPage.getStatusBadge(order.status);

    await expect(statusBadge).toHaveClass(/bg-green-100/);
    await expect(statusBadge).toHaveClass(/text-green-700/);

    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toBeVisible();


  });

  test('Deve consultar um pedido REPROVADO', async ({ page }) => {
    // Arrange
    const order = {
      number: 'VLO-LSD27Q',
      status: 'REPROVADO',
      color: 'Midnight Black',
      interior: 'cream',
      wheels: 'sport Wheels',
      customer: {
        name: 'Malu Cat',
        email: 'glezianealves@gmail.com',
      },
      payment: 'À Vista',
    };

    // Act
    const orderLockupPage = new OrderLockupPage(page);

    await orderLockupPage.searchOrder (order.number);



    // Assert
    const orderResult = orderLockupPage.getOrderResult(order.number);

    await expect(orderResult).toBeVisible();
    await expect(orderResult).toContainText(order.number);
    await expect(orderResult).toContainText(order.status);

    await expect(orderResult).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: REPROVADO
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: Midnight Black
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: sport Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: Malu Cat
      - paragraph: Email
      - paragraph: glezianealves@gmail.com
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d{2}\\/\\d{2}\\/\\d{4}/
      - heading "Pagamento" [level=4]
      - paragraph: À Vista
      - paragraph: /R\\$ [\\d\\.]+,\\d{2}/
    `);

    const statusBadge = orderLockupPage.getStatusBadge(order.status);

    await expect(statusBadge).toHaveClass(/bg-red-100/);
    await expect(statusBadge).toHaveClass(/text-red-700/);

    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toBeVisible();
  });

  test('Deve consultar um pedido EM_ANÁLISE', async ({ page }) => {
    // Arrange
    const order = {
      number: 'VLO-3R5HB6',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      interior: 'cream',
      wheels: 'aero Wheels',
      customer: {
        name: 'Pepe Hulck',
        email: 'glezianealves@gmail.com',
      },
      payment: 'À Vista',
    };
  
    // Act
    const orderLockupPage = new OrderLockupPage(page);

    await orderLockupPage.searchOrder (order.number);

    // Assert
    const orderResult = orderLockupPage.getOrderResult(order.number);
  
    await expect(orderResult).toBeVisible();
    await expect(orderResult).toContainText(order.number);
    await expect(orderResult).toContainText(order.status);
  
    await expect(orderResult).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - img
      - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: Lunar White
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: aero Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: Pepe Hulck
      - paragraph: Email
      - paragraph: glezianealves@gmail.com
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d{2}\\/\\d{2}\\/\\d{4}/
      - heading "Pagamento" [level=4]
      - paragraph: À Vista
      - paragraph: /R\\$ [\\d\\.]+,\\d{2}/
    `);
    const statusBadge = orderLockupPage.getStatusBadge(order.status);

    await expect(statusBadge).toHaveClass(/bg-yellow-100/);
    await expect(statusBadge).toHaveClass(/text-amber-700/);

    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toBeVisible();
  });
    

  test('Deve exibir mensagem de pedido não encontrado', async ({ page }) => {
    // Arrange
    const order = 'VLO-000000';

    // Act
    const orderLockupPage = new OrderLockupPage(page);

    await orderLockupPage.searchOrder(order);
    // Assert
    await expect(orderLockupPage.getNotFoundHeading()).toBeVisible();
    await expect(orderLockupPage.getNotFoundMessage()).toBeVisible();

    await expect(orderLockupPage.getNotFoundHeading()).toHaveText('Pedido não encontrado');
    await expect(orderLockupPage.getNotFoundMessage()).toHaveText(
      'Verifique o número do pedido e tente novamente'
    );

    await expect(orderLockupPage.getNotFoundHeading()).toMatchAriaSnapshot(`
      - heading "Pedido não encontrado" [level=3]
    `);
    await expect(orderLockupPage.getNotFoundMessage()).toMatchAriaSnapshot(`
      - paragraph: Verifique o número do pedido e tente novamente
    `);
  });

});