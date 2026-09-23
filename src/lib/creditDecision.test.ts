import { describe, expect, it } from 'vitest'

import { decideCreditStatus } from './creditDecision'

describe('decideCreditStatus', () => {
  describe('regra 1 - entrada alta (>= 50%) com score < 700', () => {
    it('aprova com score baixo e entrada exatamente em 50%', () => {
      expect(decideCreditStatus(300, 0.5)).toBe('APROVADO')
    })

    it('aprova com score baixo e entrada acima de 50%', () => {
      expect(decideCreditStatus(300, 0.6)).toBe('APROVADO')
    })

    it('aprova com score logo abaixo de 700 e entrada alta', () => {
      expect(decideCreditStatus(699, 0.5)).toBe('APROVADO')
    })

    it('não aplica a regra com entrada logo abaixo de 50%', () => {
      expect(decideCreditStatus(300, 0.4999)).toBe('REPROVADO')
    })
  })

  describe('regra 2 - score alto (> 700), independente da entrada', () => {
    it('aprova com score 701 e entrada zero', () => {
      expect(decideCreditStatus(701, 0)).toBe('APROVADO')
    })

    it('aprova com score muito alto mesmo sem entrada', () => {
      expect(decideCreditStatus(850, 0)).toBe('APROVADO')
    })
  })

  describe('regra 3 - score médio (501 a 700 inclusive) fica em análise', () => {
    it('fica em análise no limite inferior (501)', () => {
      expect(decideCreditStatus(501, 0)).toBe('EM_ANALISE')
    })

    it('fica em análise no limite superior (700), mesmo com entrada alta', () => {
      // score === 700 não satisfaz "score < 700" da regra 1 nem "score > 700" da regra 2,
      // então cai aqui mesmo com entrada >= 50% — comportamento documentado.
      expect(decideCreditStatus(700, 0.9)).toBe('EM_ANALISE')
    })

    it('fica em análise em um valor intermediário', () => {
      expect(decideCreditStatus(600, 0)).toBe('EM_ANALISE')
    })
  })

  describe('regra 4 - score baixo (<= 500) sem entrada suficiente é reprovado', () => {
    it('reprova no limite superior (500) sem entrada', () => {
      expect(decideCreditStatus(500, 0)).toBe('REPROVADO')
    })

    it('reprova com score muito baixo e entrada zero', () => {
      expect(decideCreditStatus(0, 0)).toBe('REPROVADO')
    })
  })

  describe('interação entre score e percentual de entrada', () => {
    it('não deixa a regra 3 (score médio) sobrepor a regra 1 (entrada alta)', () => {
      expect(decideCreditStatus(600, 0.5)).toBe('APROVADO')
    })

    it('entrada não afeta o resultado quando o score já é > 700', () => {
      expect(decideCreditStatus(750, 1)).toBe('APROVADO')
    })
  })
})
