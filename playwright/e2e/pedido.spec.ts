import { test, expect } from '@playwright/test';

///AAA - Arrange, Act, Assert

test('deve consultar um pedido aprovado', async ({ page }) => {


// Arrange    await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  

  // Act
  await page.getByTestId('search-order-id').fill('VLO-90CG8W');
  
    // Clique + espera da API (boa prática)
    await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/orders') && resp.status() === 200
      ),
      page.getByTestId('search-order-button').click()
    ]);

    await expect(page.getByTestId('order-result-id')).toBeVisible();
    await expect(page.getByTestId('order-result-id')).toContainText('VLO-90CG8W');
  
    await expect(page.getByTestId('order-result-status')).toBeVisible();
    await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
  });