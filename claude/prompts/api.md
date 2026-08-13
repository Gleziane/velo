# Prompt: Testes/Chamadas de API

Use este prompt ao criar testes ou interações com API neste projeto (via `request` context do Playwright ou similar).

## Instruções

1. Verifique se já existe um helper ou fixture de API reutilizável antes de criar um novo.
2. Utilize o `APIRequestContext` do Playwright (`request`) em vez de bibliotecas externas, salvo se já houver uma em uso no projeto.
3. Estruture o teste seguindo Arrange / Act / Assert.
4. Valide status code, contrato de resposta (schema/campos esperados) e efeitos colaterais relevantes.
5. Não utilize `waitForTimeout` para aguardar respostas assíncronas — utilize `waitForResponse` ou aguarde a própria chamada da API.
6. Não exponha credenciais, tokens ou dados sensíveis diretamente no código — utilize variáveis de ambiente (`.env`) já configuradas no projeto.
7. Não altere `playwright.config.ts` ou `package.json` sem autorização.

## Saída esperada

- Teste ou helper de API criado/atualizado seguindo os padrões acima.
- Explicação objetiva do que a chamada valida.
