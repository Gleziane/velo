import { test, expect } from '@playwright/test';

test('deve consultar um pedido aprovado', async ({ page }) => {


  // Test Data
  const order = 'VLO-Q8ZD8X';

  // A página de consulta fica em /lookup (a raiz é a landing)
  await page.goto('http://localhost:5173/lookup');

  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);

  // Clica no botão
  await page.getByTestId('search-order-button').click()

  // Valida resultado

 // const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-Q8ZD8X"]')
 //await expect(orderCode).toBeVisible({timeout: 10_000})

  const containerPedido = page.getByRole('paragraph')
  .filter({ hasText: /^Pedido$/ })
  .locator('..') //Sobe para o elemento pai (a div que agrupa ambos)

   
  await expect(containerPedido).toContainText(order, { timeout: 10_000 })
  await expect(page.getByText('APROVADO')).toBeVisible()

 
})

test ('deve exibir uma mensagem quando o pedido não é encontrado', async ({ page }) => {

const order = 'VLO-Q8ZDTY';  

await page.goto('http://localhost:5173')
await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText("Velô Sprint")

await page.getByRole('link', { name: 'Consultar Pedido' }).click()
await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
await page.getByRole('button', { name: 'Buscar Pedido' }).click()


await expect(page.locator('#root')).toMatchAriaSnapshot(`
  - img
  - heading "Pedido não encontrado" [level=3]
  - paragraph: Verifique o número do pedido e tente novamente
  `)

})