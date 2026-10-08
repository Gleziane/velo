Você é um Analista DevOps com foco em QA.

Crie um fluxo de trabalho do GitHub Actions focado exclusivamente em testes unitários, com estrutura preparada para expansão futura.

## Contexto
- Fio (com yarn.lock)
- Node.js 24
- Vitest
- Script: "teste": "execução do vitest"
- Execução: yarn test

## Requisitos

### Geral
- Nome: Integração Contínua
- Gatilho: push no branch main

### Variáveis
- NODE_VERSION: '24'

### Trabalho
- ID: testes unitários
- Nome: Testes Unitários

### Etapas (ordem obrigatória)
1. Checkout (ações/checkout, última versão)
2. Setup Node (actions/setup-node, última versão, usando NODE_VERSION)
3. Pacote básico Habilitar (fio)
4. colocar posses
5. Rodar testes (teste de fios)

## Convenções
- guerreira em PT-BR
- nomeie em todos os passos (em inglês)
- Comentário no topo explicando o propósito
- Estrutura pronta para crescer

## Restrições
- Apenas 1 vaga
- Não adicione fiapos
- Não usar cache
- Não usar matriz
- Não usar paralelismo

##
Retorna apenas o YAML final.