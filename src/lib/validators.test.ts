import { describe, expect, it } from 'vitest'

import { orderSchema, type OrderFormData } from './validators'

const validData: OrderFormData = {
  name: 'Fernando',
  surname: 'Papito',
  email: 'papito@velo.dev',
  phone: '(11) 98765-4321',
  cpf: '123.456.789-01',
  store: 'Velô Paulista - Av. Paulista, 1000',
  terms: true,
}

const errorsFor = (overrides: Partial<Record<keyof OrderFormData, unknown>>) => {
  const result = orderSchema.safeParse({ ...validData, ...overrides })
  return result.success ? [] : result.error.errors.map((err) => err.message)
}

describe('orderSchema', () => {
  it('aceita um formulário com todos os dados válidos', () => {
    expect(orderSchema.safeParse(validData).success).toBe(true)
  })

  it('retorna um erro por campo quando o formulário está vazio', () => {
    const result = orderSchema.safeParse({
      name: '',
      surname: '',
      email: '',
      phone: '',
      cpf: '',
      store: '',
      terms: false,
    })

    expect(result.success).toBe(false)
    expect(result.success ? [] : result.error.errors.map((err) => err.path[0])).toEqual([
      'name',
      'surname',
      'email',
      'phone',
      'cpf',
      'store',
      'terms',
    ])
  })

  describe('email', () => {
    it.each([
      'papito@velo.dev',
      'nome.sobrenome@velo.com.br',
      'qa+checkout@velo.dev',
    ])('aceita o e-mail válido %s', (email) => {
      expect(errorsFor({ email })).toEqual([])
    })

    it.each([
      ['vazio', ''],
      ['sem @', 'papito.velo.dev'],
      ['sem domínio', 'papito@'],
      ['sem usuário', '@velo.dev'],
      ['sem TLD', 'papito@velo'],
      ['com espaço', 'papito @velo.dev'],
      ['com dois @', 'papito@@velo.dev'],
    ])('rejeita e-mail %s', (_, email) => {
      expect(errorsFor({ email })).toEqual(['Email inválido'])
    })

    it('rejeita e-mail que não é string', () => {
      expect(orderSchema.safeParse({ ...validData, email: 123 }).success).toBe(false)
    })
  })

  describe('cpf', () => {
    it('aceita o CPF mascarado com 14 caracteres', () => {
      expect(errorsFor({ cpf: '123.456.789-01' })).toEqual([])
    })

    it.each([
      ['vazio', ''],
      ['sem máscara (11 dígitos)', '12345678901'],
      ['incompleto', '123.456.789-0'],
    ])('rejeita CPF %s', (_, cpf) => {
      expect(errorsFor({ cpf })).toEqual(['Document inválido'])
    })

    it('documenta o comportamento atual: não valida os dígitos verificadores', () => {
      expect(errorsFor({ cpf: '000.000.000-00' })).toEqual([])
    })

    it('documenta o comportamento atual: aceita qualquer texto com 14 caracteres ou mais', () => {
      expect(errorsFor({ cpf: 'abcdefghijklmn' })).toEqual([])
    })
  })
})
