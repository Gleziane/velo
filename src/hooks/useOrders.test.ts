import { describe, expect, it } from 'vitest'

import { dbOrderToOrder, type DbOrder } from './useOrders'

const baseDbOrder: DbOrder = {
  id: 'uuid-1',
  order_number: 'VLO-ABC123',
  color: 'glacier-blue',
  wheel_type: 'aero',
  optionals: null,
  customer_name: 'Fernando Papito',
  customer_email: 'papito@velo.dev',
  customer_phone: '11987654321',
  customer_cpf: '12345678901',
  payment_method: 'avista',
  total_price: 40000,
  status: 'APROVADO',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('dbOrderToOrder', () => {
  describe('separação de nome e sobrenome (customer_name)', () => {
    it('separa nome e sobrenome quando há exatamente duas palavras', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, customer_name: 'Fernando Papito' })
      expect(order.customer.name).toBe('Fernando')
      expect(order.customer.surname).toBe('Papito')
    })

    it('usa a primeira palavra como nome e junta o restante como sobrenome quando há mais de duas palavras', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, customer_name: 'Maria da Silva Santos' })
      expect(order.customer.name).toBe('Maria')
      expect(order.customer.surname).toBe('da Silva Santos')
    })

    it('deixa o sobrenome vazio quando há apenas uma palavra', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, customer_name: 'Madonna' })
      expect(order.customer.name).toBe('Madonna')
      expect(order.customer.surname).toBe('')
    })

    it('não lança erro para customer_name vazio', () => {
      expect(() => dbOrderToOrder({ ...baseDbOrder, customer_name: '' })).not.toThrow()
      const order = dbOrderToOrder({ ...baseDbOrder, customer_name: '' })
      expect(order.customer.name).toBe('')
      expect(order.customer.surname).toBe('')
    })
  })

  describe('optionals', () => {
    it('converte optionals nulo do banco em array vazio', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, optionals: null })
      expect(order.configuration.optionals).toEqual([])
    })

    it('preserva a lista de optionals quando presente', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, optionals: ['precision-park'] })
      expect(order.configuration.optionals).toEqual(['precision-park'])
    })
  })

  describe('totalPrice', () => {
    it('converte total_price numérico normalmente', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, total_price: 42000 })
      expect(order.totalPrice).toBe(42000)
      expect(typeof order.totalPrice).toBe('number')
    })

    it('converte total_price vindo como string do banco (numeric/decimal)', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, total_price: '42000.50' as unknown as number })
      expect(order.totalPrice).toBe(42000.5)
      expect(typeof order.totalPrice).toBe('number')
    })
  })

  describe('demais campos', () => {
    it('usa order_number do banco como id do pedido', () => {
      const order = dbOrderToOrder({ ...baseDbOrder, order_number: 'VLO-XYZ789' })
      expect(order.id).toBe('VLO-XYZ789')
    })

    it('mapeia status, paymentMethod e createdAt diretamente', () => {
      const order = dbOrderToOrder({
        ...baseDbOrder,
        status: 'REPROVADO',
        payment_method: 'financiamento',
        created_at: '2026-03-05T10:00:00.000Z',
      })
      expect(order.status).toBe('REPROVADO')
      expect(order.paymentMethod).toBe('financiamento')
      expect(order.createdAt).toBe('2026-03-05T10:00:00.000Z')
    })

    it('inicia customer.store vazio (preenchido depois pelo chamador)', () => {
      const order = dbOrderToOrder(baseDbOrder)
      expect(order.customer.store).toBe('')
    })
  })
})
