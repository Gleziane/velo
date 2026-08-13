import { test, expect } from '../support/fixtures'

import { generateOrderCode, seedOrder } from '../support/helpers'
import { type OrderDetails } from '../support/actions/orderLookupActions'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.landing.goto()
    await app.navbar.openOrderLookup()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const orderData = {
      number: generateOrderCode(),
      status: 'APROVADO' as const,
      color: 'lunar-white' as const,
      wheelType: 'aero' as const,
      customerName: 'Fernando Papito',
      customerEmail: 'papito@velo.dev',
      paymentMethod: 'avista' as const,
      totalPrice: 40000,
    }

    await seedOrder(orderData)

    const order: OrderDetails = {
      number: orderData.number,
      status: 'APROVADO',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Fernando Papito',
        email: 'papito@velo.dev',
      },
      payment: 'À Vista',
    }

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const orderData = {
      number: generateOrderCode(),
      status: 'REPROVADO' as const,
      color: 'midnight-black' as const,
      wheelType: 'sport' as const,
      customerName: 'Steve Jobs',
      customerEmail: 'jobs@apple.com',
      paymentMethod: 'avista' as const,
      totalPrice: 40000,
    }

    await seedOrder(orderData)

    const order: OrderDetails = {
      number: orderData.number,
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@apple.com',
      },
      payment: 'À Vista',
    }

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const orderData = {
      number: generateOrderCode(),
      status: 'EM_ANALISE' as const,
      color: 'lunar-white' as const,
      wheelType: 'aero' as const,
      customerName: 'João da Silva',
      customerEmail: 'joao@velo.dev',
      paymentMethod: 'avista' as const,
      totalPrice: 40000,
    }

    await seedOrder(orderData)

    const order: OrderDetails = {
      number: orderData.number,
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'João da Silva',
        email: 'joao@velo.dev',
      },
      payment: 'À Vista',
    }

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()

    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const order = 'XYZ-INVALID'

    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFound()
  })
})
