# Prompt: Review de Código

Use este prompt para revisar código (testes, Page Objects, utilitários) antes de considerar a tarefa concluída.

## Instruções

1. Leia o arquivo completo antes de comentar qualquer trecho.
2. Verifique aderência aos padrões definidos em `CLAUDE.md`:
   - Uso de Playwright Test.
   - Estrutura Arrange / Act / Assert.
   - Uso de `getByRole()` como prioridade de seletor.
   - Uso de `data-testid` quando disponível.
   - Ausência de XPath.
   - Ausência de `waitForTimeout`.
3. Verifique se há reaproveitamento de código/Page Objects existentes antes de sugerir criação de novos arquivos.
4. Aponte problemas de forma objetiva: arquivo, linha e motivo.
5. Sugira a menor alteração possível para corrigir cada problema.
6. Não aplique alterações automaticamente — apenas relate os achados, a menos que solicitado.

## Saída esperada

- Lista de problemas encontrados (se houver), com arquivo e linha.
- Para cada problema: descrição objetiva + sugestão de correção mínima.
- Se nenhum problema for encontrado, informe explicitamente que o código está de acordo com os padrões.
