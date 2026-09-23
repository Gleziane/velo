export type CreditStatus = 'APROVADO' | 'EM_ANALISE' | 'REPROVADO';

/**
 * Regras de decisão de crédito, avaliadas nesta ordem:
 * 1. Entrada >= 50% do total E score < 700 -> APROVADO
 * 2. Score > 700 -> APROVADO
 * 3. Score entre 501 e 700 (inclusive) -> EM_ANALISE
 * 4. Caso contrário -> REPROVADO
 */
export function decideCreditStatus(score: number, entryPercentage: number): CreditStatus {
  if (entryPercentage >= 0.5 && score < 700) {
    return 'APROVADO';
  }

  if (score > 700) {
    return 'APROVADO';
  }

  if (score >= 501 && score <= 700) {
    return 'EM_ANALISE';
  }

  return 'REPROVADO';
}
