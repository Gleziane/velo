import { test, expect } from '../support/fixtures'

import { generateOrderCode, seedOrder } from '../support/helpers'
import { type OrderDetails } from '../support/actions/orderLookupActions'

import pedidosData from '../support/fixtures/pedidos/pedidos.json' with { type: 'json' }


/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.landing.goto()
    await app.navbar.openOrderLookup()
  })

  test.describe('Pedidos válidos', () => {
    pedidosData.pedidosValidos.forEach((fixture) => {
      test(fixture.descricao, async ({ app }) => {
        // Arrange
        const orderData = {
          number: generateOrderCode(),
          ...fixture.orderData,
        }

        await seedOrder(orderData as any)

        const expectedOrder: OrderDetails = {
          number: orderData.number,
          ...fixture.expectedOrder,
        }

        // Act
        await app.orderLookup.searchOrder(expectedOrder.number)

        // Assert
        await app.orderLookup.validateOrderDetails(expectedOrder)
      })
    })
  })

  test.describe('Pedidos inválidos', () => {
    test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
      // Arrange
      const order = generateOrderCode()

      // Act
      await app.orderLookup.searchOrder(order)

      // Assert
      await app.orderLookup.validateOrderNotFound()
    })

    test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
      // Arrange
      const order = pedidosData.pedidosInvalidos[1].orderCode

      // Act
      await app.orderLookup.searchOrder(order)

      // Assert
      await app.orderLookup.validateOrderNotFound()
    })
  })
})
