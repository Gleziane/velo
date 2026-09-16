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

## Integração com Supabase

O servidor MCP do Supabase está configurado no arquivo `.mcp.json` deste projeto.

### Autenticar o MCP

Execute em um terminal comum, na raiz do projeto:

```bash
claude /mcp
```

Selecione o servidor `supabase` e inicie o fluxo de autenticação. O servidor pode aparecer como `Pending approval` até essa etapa ser concluída.

### Instalar Agent Skills (opcional)

Para adicionar instruções, scripts e recursos especializados do Supabase às ferramentas de IA:

```bash
npx skills add supabase/agent-skills
```

## Antes de modificar

Leia todos os arquivos relacionados.

## Nunca

- Modifique package.json sem autorização.
- Altere playwright.config.ts sem autorização.
- Remova testes existentes.
