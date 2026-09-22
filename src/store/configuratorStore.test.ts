import { beforeEach, describe, expect, it } from 'vitest'

import {
  calculateInstallment,
  calculateTotalPrice,
  formatPrice,
  migrateConfiguratorPersistedState,
  useConfiguratorStore,
  type CarConfiguration,
  type Order,
} from './configuratorStore'

const baseConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
}

const defaultState = useConfiguratorStore.getState()

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'VLO-0001',
  configuration: baseConfig,
  totalPrice: 40000,
  customer: {
    name: 'Fernando',
    surname: 'Papito',
    email: 'papito@velo.dev',
    phone: '11987654321',
    cpf: '12345678901',
    store: 'Velô Paulista',
  },
  paymentMethod: 'avista',
  status: 'APROVADO',
  createdAt: new Date().toISOString(),
  ...overrides,
})

beforeEach(() => {
  useConfiguratorStore.setState(defaultState, true)
  localStorage.clear()
})

describe('calculateTotalPrice', () => {
  it('retorna o preço base para rodas aero sem opcionais', () => {
    expect(calculateTotalPrice(baseConfig)).toBe(40000)
  })

  it('soma o valor das rodas esportivas', () => {
    expect(calculateTotalPrice({ ...baseConfig, wheelType: 'sport' })).toBe(42000)
  })

  it('soma o opcional precision-park isolado', () => {
    expect(calculateTotalPrice({ ...baseConfig, optionals: ['precision-park'] })).toBe(45500)
  })

  it('soma o opcional flux-capacitor isolado', () => {
    expect(calculateTotalPrice({ ...baseConfig, optionals: ['flux-capacitor'] })).toBe(45000)
  })

  it('soma os dois opcionais juntos', () => {
    expect(
      calculateTotalPrice({ ...baseConfig, optionals: ['precision-park', 'flux-capacitor'] })
    ).toBe(50500)
  })

  it('soma rodas esportivas e os dois opcionais', () => {
    expect(
      calculateTotalPrice({
        ...baseConfig,
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      })
    ).toBe(52500)
  })

  it('não lança erro quando optionals não é um array (estado corrompido/legado)', () => {
    const malformed = { ...baseConfig, optionals: undefined as unknown as [] }
    expect(() => calculateTotalPrice(malformed)).not.toThrow()
    expect(calculateTotalPrice(malformed)).toBe(40000)
  })

  it('ignora valores desconhecidos na lista de opcionais', () => {
    const withUnknown = { ...baseConfig, optionals: ['inexistente'] as unknown as CarConfiguration['optionals'] }
    expect(calculateTotalPrice(withUnknown)).toBe(40000)
  })

  it('documenta o comportamento atual: opcional duplicado soma duas vezes', () => {
    expect(
      calculateTotalPrice({ ...baseConfig, optionals: ['precision-park', 'precision-park'] })
    ).toBe(51000)
  })
})

describe('calculateInstallment', () => {
  it('retorna 0 para total 0', () => {
    expect(calculateInstallment(0)).toBe(0)
  })

  it('calcula a parcela para o total do carro base (12x, 2% a.m.)', () => {
    expect(calculateInstallment(40000)).toBe(3782.38)
  })

  it('não retorna NaN/Infinity para totais muito pequenos', () => {
    const result = calculateInstallment(1)
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBe(0.09)
  })

  it('arredonda o resultado para 2 casas decimais', () => {
    expect(calculateInstallment(10000.005)).toBe(945.6)
  })
})

// Intl.NumberFormat('pt-BR') separa o símbolo do valor com um espaço
// não-quebrável (U+00A0), não um espaço comum.
const NBSP = ' '

describe('formatPrice', () => {
  it('formata um valor inteiro em reais', () => {
    expect(formatPrice(40000)).toBe(`R$${NBSP}40.000,00`)
  })

  it('formata zero', () => {
    expect(formatPrice(0)).toBe(`R$${NBSP}0,00`)
  })

  it('formata um valor com centavos', () => {
    expect(formatPrice(1234.5)).toBe(`R$${NBSP}1.234,50`)
  })

  it('formata um valor com múltiplos separadores de milhar', () => {
    expect(formatPrice(1234567.89)).toBe(`R$${NBSP}1.234.567,89`)
  })

  it('formata um valor negativo', () => {
    expect(formatPrice(-100)).toBe(`-R$${NBSP}100,00`)
  })
})

describe('migrateConfiguratorPersistedState', () => {
  it('mantém opcionais válidos sem alteração', () => {
    const state = { configuration: { optionals: ['precision-park'] } }
    expect(migrateConfiguratorPersistedState(state).configuration.optionals).toEqual([
      'precision-park',
    ])
  })

  it('filtra opcionais inválidos misturados com válidos', () => {
    const state = { configuration: { optionals: ['precision-park', 'legado-x'] } }
    expect(migrateConfiguratorPersistedState(state).configuration.optionals).toEqual([
      'precision-park',
    ])
  })

  it('filtra entradas que não são string sem lançar erro', () => {
    const state = { configuration: { optionals: [123, null, {}] } }
    expect(() => migrateConfiguratorPersistedState(state)).not.toThrow()
    expect(migrateConfiguratorPersistedState(state).configuration.optionals).toEqual([])
  })

  it('transforma optionals que não é array em lista vazia', () => {
    const state = { configuration: { optionals: 'sport' } }
    expect(migrateConfiguratorPersistedState(state).configuration.optionals).toEqual([])
  })

  it('não lança erro quando configuration está ausente', () => {
    const state = {}
    expect(() => migrateConfiguratorPersistedState(state)).not.toThrow()
    expect(migrateConfiguratorPersistedState(state)).toEqual({})
  })

  it('não lança erro quando o estado persistido é nulo', () => {
    expect(() => migrateConfiguratorPersistedState(null)).not.toThrow()
    expect(migrateConfiguratorPersistedState(null)).toBeNull()
  })
})

describe('useConfiguratorStore - estado inicial', () => {
  it('começa com a configuração, viewMode, orders e sessão default', () => {
    const state = useConfiguratorStore.getState()
    expect(state.configuration).toEqual(baseConfig)
    expect(state.viewMode).toBe('exterior')
    expect(state.orders).toEqual([])
    expect(state.currentUserEmail).toBeNull()
  })
})

describe('useConfiguratorStore - setExteriorColor / setInteriorColor', () => {
  it('setExteriorColor atualiza a cor externa e preserva os demais campos', () => {
    useConfiguratorStore.getState().setExteriorColor('midnight-black')
    const { configuration } = useConfiguratorStore.getState()
    expect(configuration.exteriorColor).toBe('midnight-black')
    expect(configuration.interiorColor).toBe('carbon-black')
    expect(configuration.wheelType).toBe('aero')
  })

  it('setExteriorColor força o viewMode de volta para exterior', () => {
    useConfiguratorStore.getState().setInteriorColor('deep-blue')
    expect(useConfiguratorStore.getState().viewMode).toBe('interior')

    useConfiguratorStore.getState().setExteriorColor('lunar-white')
    expect(useConfiguratorStore.getState().viewMode).toBe('exterior')
  })

  it('setInteriorColor atualiza a cor interna e preserva os demais campos', () => {
    useConfiguratorStore.getState().setInteriorColor('deep-blue')
    const { configuration } = useConfiguratorStore.getState()
    expect(configuration.interiorColor).toBe('deep-blue')
    expect(configuration.exteriorColor).toBe('glacier-blue')
    expect(configuration.wheelType).toBe('aero')
  })

  it('setInteriorColor força o viewMode para interior', () => {
    expect(useConfiguratorStore.getState().viewMode).toBe('exterior')
    useConfiguratorStore.getState().setInteriorColor('deep-blue')
    expect(useConfiguratorStore.getState().viewMode).toBe('interior')
  })
})

describe('useConfiguratorStore - setWheelType', () => {
  it('atualiza o tipo de roda', () => {
    useConfiguratorStore.getState().setWheelType('sport')
    expect(useConfiguratorStore.getState().configuration.wheelType).toBe('sport')
  })

  it('não altera o viewMode (ao contrário dos setters de cor)', () => {
    useConfiguratorStore.getState().setInteriorColor('deep-blue')
    expect(useConfiguratorStore.getState().viewMode).toBe('interior')

    useConfiguratorStore.getState().setWheelType('sport')
    expect(useConfiguratorStore.getState().viewMode).toBe('interior')
  })
})

describe('useConfiguratorStore - toggleOptional', () => {
  it('adiciona um opcional ausente', () => {
    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['precision-park'])
  })

  it('remove um opcional já presente', () => {
    useConfiguratorStore.getState().toggleOptional('precision-park')
    useConfiguratorStore.getState().toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual([])
  })

  it('alternar duas vezes o mesmo opcional retorna ao estado original', () => {
    const before = useConfiguratorStore.getState().configuration.optionals
    useConfiguratorStore.getState().toggleOptional('flux-capacitor')
    useConfiguratorStore.getState().toggleOptional('flux-capacitor')
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(before)
  })

  it('alternar um opcional não afeta os demais já presentes', () => {
    useConfiguratorStore.getState().toggleOptional('precision-park')
    useConfiguratorStore.getState().toggleOptional('flux-capacitor')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')
  })

  it('não lança erro quando optionals está indefinido no estado', () => {
    useConfiguratorStore.setState((state) => ({
      configuration: { ...state.configuration, optionals: undefined as unknown as [] },
    }))
    expect(() => useConfiguratorStore.getState().toggleOptional('precision-park')).not.toThrow()
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['precision-park'])
  })
})

describe('useConfiguratorStore - setViewMode', () => {
  it('define o viewMode como exterior', () => {
    useConfiguratorStore.getState().setViewMode('exterior')
    expect(useConfiguratorStore.getState().viewMode).toBe('exterior')
  })

  it('define o viewMode como interior', () => {
    useConfiguratorStore.getState().setViewMode('interior')
    expect(useConfiguratorStore.getState().viewMode).toBe('interior')
  })
})

describe('useConfiguratorStore - addOrder', () => {
  it('adiciona um pedido à lista vazia', () => {
    const order = makeOrder()
    useConfiguratorStore.getState().addOrder(order)
    expect(useConfiguratorStore.getState().orders).toEqual([order])
  })

  it('preserva pedidos anteriores ao adicionar um novo', () => {
    const first = makeOrder({ id: 'VLO-0001' })
    const second = makeOrder({ id: 'VLO-0002' })
    useConfiguratorStore.getState().addOrder(first)
    useConfiguratorStore.getState().addOrder(second)
    expect(useConfiguratorStore.getState().orders).toEqual([first, second])
  })
})

describe('useConfiguratorStore - login / logout / getUserOrders', () => {
  it('login retorna true e define currentUserEmail quando existe pedido com o e-mail', () => {
    const order = makeOrder({ customer: { ...makeOrder().customer, email: 'cliente@velo.dev' } })
    useConfiguratorStore.getState().addOrder(order)

    const result = useConfiguratorStore.getState().login('cliente@velo.dev')

    expect(result).toBe(true)
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('cliente@velo.dev')
  })

  it('login retorna false e não altera currentUserEmail quando não há pedido com o e-mail', () => {
    const result = useConfiguratorStore.getState().login('inexistente@velo.dev')

    expect(result).toBe(false)
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
  })

  it('documenta o comportamento atual: login é sensível a maiúsculas/minúsculas', () => {
    const order = makeOrder({ customer: { ...makeOrder().customer, email: 'cliente@velo.dev' } })
    useConfiguratorStore.getState().addOrder(order)

    const result = useConfiguratorStore.getState().login('CLIENTE@velo.dev')

    expect(result).toBe(false)
  })

  it('login substitui o e-mail da sessão em vez de mesclar', () => {
    const first = makeOrder({ customer: { ...makeOrder().customer, email: 'primeiro@velo.dev' } })
    const second = makeOrder({ customer: { ...makeOrder().customer, email: 'segundo@velo.dev' } })
    useConfiguratorStore.getState().addOrder(first)
    useConfiguratorStore.getState().addOrder(second)

    useConfiguratorStore.getState().login('primeiro@velo.dev')
    useConfiguratorStore.getState().login('segundo@velo.dev')

    expect(useConfiguratorStore.getState().currentUserEmail).toBe('segundo@velo.dev')
  })

  it('logout zera currentUserEmail após login', () => {
    const order = makeOrder({ customer: { ...makeOrder().customer, email: 'cliente@velo.dev' } })
    useConfiguratorStore.getState().addOrder(order)
    useConfiguratorStore.getState().login('cliente@velo.dev')

    useConfiguratorStore.getState().logout()

    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
  })

  it('logout não lança erro quando já está deslogado', () => {
    expect(() => useConfiguratorStore.getState().logout()).not.toThrow()
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
  })

  it('getUserOrders retorna lista vazia quando não há sessão', () => {
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([])
  })

  it('getUserOrders retorna apenas os pedidos do e-mail logado', () => {
    const ownOrder = makeOrder({ id: 'VLO-A', customer: { ...makeOrder().customer, email: 'cliente@velo.dev' } })
    const otherOrder = makeOrder({ id: 'VLO-B', customer: { ...makeOrder().customer, email: 'outro@velo.dev' } })
    useConfiguratorStore.getState().addOrder(ownOrder)
    useConfiguratorStore.getState().addOrder(otherOrder)

    useConfiguratorStore.getState().login('cliente@velo.dev')

    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([ownOrder])
  })

  it('getUserOrders retorna lista vazia quando o e-mail da sessão não tem pedidos', () => {
    useConfiguratorStore.setState({ currentUserEmail: 'sem-pedidos@velo.dev' })
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([])
  })
})

describe('useConfiguratorStore - resetConfiguration', () => {
  it('restaura a configuração para o default depois de alterações', () => {
    useConfiguratorStore.getState().setExteriorColor('midnight-black')
    useConfiguratorStore.getState().setWheelType('sport')
    useConfiguratorStore.getState().toggleOptional('precision-park')

    useConfiguratorStore.getState().resetConfiguration()

    expect(useConfiguratorStore.getState().configuration).toEqual(baseConfig)
  })

  it('não afeta orders, currentUserEmail ou viewMode', () => {
    const order = makeOrder({ customer: { ...makeOrder().customer, email: 'cliente@velo.dev' } })
    useConfiguratorStore.getState().addOrder(order)
    useConfiguratorStore.getState().login('cliente@velo.dev')
    useConfiguratorStore.getState().setInteriorColor('deep-blue')

    useConfiguratorStore.getState().resetConfiguration()

    const state = useConfiguratorStore.getState()
    expect(state.orders).toEqual([order])
    expect(state.currentUserEmail).toBe('cliente@velo.dev')
    expect(state.viewMode).toBe('interior')
  })
})
