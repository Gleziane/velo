# Prompt: Criação/Atualização de Testes Playwright

Use este prompt ao criar ou atualizar testes end-to-end com Playwright neste projeto.

## Instruções

1. Antes de criar um teste novo, verifique se já existe um Page Object ou teste similar em `/playwright` ou `/tests` que possa ser reutilizado.
2. Estruture o teste seguindo Arrange / Act / Assert, com comentários curtos separando as seções apenas se necessário para legibilidade.
3. Priorize seletores nesta ordem:
   1. `getByRole()`
   2. `data-testid` (via `getByTestId()`)
   3. Outros seletores do Playwright, apenas se os anteriores não forem viáveis.
4. Nunca utilize XPath.
5. Nunca utilize `waitForTimeout`. Prefira assertions com auto-retry (`expect(locator).toBeVisible()`, etc.) ou `waitForResponse`/`waitForURL` quando necessário aguardar um evento específico.
6. Não modifique `playwright.config.ts` sem autorização explícita.
7. Não modifique `package.json` sem autorização explícita.
8. Mantenha o teste isolado e determinístico — evite dependência de estado deixado por outros testes.

## Saída esperada

- Arquivo de teste (ou Page Object) criado/atualizado seguindo os padrões acima.
- Breve explicação do que foi feito e por quê, sem alterar comportamento existente além do solicitado.
