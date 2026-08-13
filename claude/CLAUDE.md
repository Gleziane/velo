# Projeto

Este é um projeto Playwright + TypeScript.

## Estrutura

```
README.md
CLAUDE.md
package.json
playwright.config.ts
src/
tests/
playwright/
claude/
```

## Objetivos

Manter testes legíveis, reutilizáveis e estáveis.

## Convenções

- Utilize Page Object Model.
- Utilize Arrange / Act / Assert.
- Prefira getByRole.
- Utilize data-testid quando existir.
- Não utilize waitForTimeout.

## Antes de modificar

Leia todos os arquivos relacionados.

## Nunca

- Modifique package.json sem autorização.
- Altere playwright.config.ts sem autorização.
- Remova testes existentes.
