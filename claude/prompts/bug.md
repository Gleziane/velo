# Prompt: Investigação e Correção de Bug

Use este prompt ao investigar uma falha reportada em teste ou aplicação.

## Instruções

1. Leia os arquivos relacionados ao bug (teste que falhou, código da aplicação, Page Object envolvido) antes de propor qualquer alteração.
2. Explique o problema encontrado de forma clara:
   - O que era esperado.
   - O que de fato aconteceu.
   - Causa raiz identificada.
3. Verifique se o problema está no teste, no Page Object ou na aplicação — não assuma que é sempre o teste.
4. Proponha a menor alteração possível para corrigir o problema, preservando o comportamento existente que não está relacionado ao bug.
5. Não utilize `waitForTimeout` como solução para flakiness — identifique a condição correta de espera (`expect(...).toBeVisible()`, `waitForResponse`, etc.).
6. Não altere `playwright.config.ts` ou `package.json` sem autorização.
7. Não faça commit automaticamente.

## Saída esperada

- Diagnóstico do bug (causa raiz).
- Correção mínima aplicada ou proposta.
- Confirmação de que o comportamento existente foi preservado.
