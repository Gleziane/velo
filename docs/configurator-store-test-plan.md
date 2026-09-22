# Configurator Store — Test Plan

Cobertura de testes unitários proposta para `src/store/configuratorStore.ts`. Ponto de partida para o desenvolvedor aplicar o primeiro ciclo de testes unitários do projeto.

- **Arquivo alvo:** `src/store/configuratorStore.ts`
- **Framework:** Vitest (já instalado e configurado — ver `vitest.config.ts`)
- **Testes implementados em:** `src/store/configuratorStore.test.ts`
- **Rodar com:** `yarn test:unit` (ou `yarn test:unit:watch` durante o desenvolvimento)

## 1. Escopo e não-escopo

O arquivo mistura dois tipos de unidade: funções puras de precificação e um store Zustand com efeitos colaterais (persistência em `localStorage`, sessão do usuário).

**Dentro do escopo**
- `calculateTotalPrice`, `calculateInstallment`, `formatPrice` — funções puras.
- Todas as ações do `useConfiguratorStore` — testadas via `getState()` / `setState()`, sem renderizar componentes React.
- `migrateConfiguratorPersistedState` — extraída do `persist()` para ficar testável isoladamente (ver seção 7).

**Fora do escopo**
- Internals do Zustand e do middleware `persist`.
- Componentes React que consomem o store via JSX (é teste de componente/E2E, não unitário do store).
- Comportamento real do `localStorage` do navegador além do polyfill em memória usado nos testes (`src/test/setup.ts`).

## 2. Ferramentas e setup

O projeto usa Vite mas não tinha nenhuma ferramenta de teste unitário configurada. Foi adicionado:

- `vitest` (`^2.1.9`, compatível com o `vite ^5.4.19` do projeto) como devDependency.
- `vitest.config.ts` na raiz, reaproveitando o alias `@` do `vite.config.ts`, `environment: 'node'`.
- `src/test/setup.ts` com um polyfill em memória de `localStorage` (o `jsdom` mais recente exige Node ≥24.15, incompatível com o Node do ambiente; como o store só precisa de `getItem`/`setItem`/`removeItem`/`clear`, um polyfill simples evita essa dependência).
- Scripts `test:unit` e `test:unit:watch` no `package.json`.
- Arquivo de teste colocado ao lado do código-fonte: `src/store/configuratorStore.test.ts` (convenção padrão do Vitest).

## 3. Isolamento entre testes

`useConfiguratorStore` é um singleton criado uma única vez no módulo. Sem reset, um teste vaza estado (configuração, pedidos, sessão) para o próximo.

```ts
const initialState = useConfiguratorStore.getState()

beforeEach(() => {
  useConfiguratorStore.setState(initialState, true) // true = substitui o estado inteiro
  localStorage.clear()
})
```

## 4. `calculateTotalPrice(config)`

Soma o preço base às rodas esportivas e a cada opcional válido presente no array.

| # | Cenário | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Configuração base (aero, sem opcionais) | `optionals: []` | `40000` |
| 2 | Rodas esportivas somam ao preço base | `wheelType: 'sport'` | `42000` |
| 3 | Opcional isolado: precision-park | `['precision-park']` | `45500` |
| 4 | Opcional isolado: flux-capacitor | `['flux-capacitor']` | `45000` |
| 5 | Dois opcionais somados | ambos | `50500` |
| 6 | Rodas esportivas + dois opcionais | sport + ambos | `52500` |
| 7 | *(defensivo)* `optionals` não é array | `optionals: undefined` | Não lança erro; trata como `[]` |
| 8 | *(defensivo)* valor desconhecido na lista | `['inexistente']` | Ignorado silenciosamente |
| 9 | *(gap documentado)* opcional duplicado no array | `['precision-park','precision-park']` | Hoje soma **duas vezes** (`51000`) — comportamento atual documentado, não corrigido silenciosamente. `toggleOptional` nunca gera duplicata, mas a função em si não se protege. |

## 5. `calculateInstallment(total)`

Fórmula de parcela "Price" (juros compostos, 2% a.m., 12x), arredondada para 2 casas decimais.

| # | Cenário | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Total zero | `0` | `0` |
| 2 | Total típico (carro base) | `40000` | `3782.38` (calculado com a própria fórmula do arquivo, via `node -e`) |
| 3 | Total pequeno | `1` | `0.09` — não retorna `NaN`/`Infinity` |
| 4 | Arredondamento para 2 casas | `10000.005` | `945.6` (confirma `Math.round(x*100)/100`) |

Não testado: total negativo — a regra de negócio garante total ≥ 0 antes de chegar aqui; não vale gastar cobertura nesse caso a menos que o time queira travar o comportamento por contrato.

## 6. `formatPrice(value)`

Wrapper de `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

| # | Entrada | Resultado esperado |
|---|---|---|
| 1 | `40000` | `"R$ 40.000,00"` |
| 2 | `0` | `"R$ 0,00"` |
| 3 | `1234.5` | `"R$ 1.234,50"` |
| 4 | `1234567.89` | `"R$ 1.234.567,89"` |
| 5 | `-100` | Formato negativo do Intl (ex.: `"-R$ 100,00"`) |

## 7. `migrateConfiguratorPersistedState` (migração versão 2)

A função vivia inline dentro da configuração do `persist(...)` e não era exportada — não dava para chamá-la isoladamente em um teste. Foi extraída para uma função nomeada e exportada, referenciada dentro do `persist()`. Nenhum comportamento mudou.

| # | Cenário | Entrada | Resultado esperado |
|---|---|---|---|
| 1 | Todos os opcionais persistidos são válidos | `['precision-park']` | Lista passa sem alteração |
| 2 | Mistura de válidos e inválidos | `['precision-park','legado-x']` | Só os válidos sobrevivem |
| 3 | Entradas que não são string | `[123, null, {}]` | Filtradas sem lançar erro |
| 4 | `optionals` não é array | `optionals: "sport"` | Vira `[]` |
| 5 | `configuration` ausente no estado persistido | `{}` | Retorna o estado sem tocar em nada |
| 6 | *(defensivo)* estado persistido nulo | `null` | Não lança erro |

## 8. Estado inicial do store

Um único teste de sanidade, para travar o "contrato" do estado default:

- `configuration` = glacier-blue / carbon-black / aero / `[]`
- `viewMode` = `'exterior'`
- `orders` = `[]`
- `currentUserEmail` = `null`

## 9. `setExteriorColor` / `setInteriorColor`

Cada setter de cor também força o `viewMode` correspondente — efeito colateral testado explicitamente.

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | `setExteriorColor('midnight-black')` | `exteriorColor` atualizado; `interiorColor`/`wheelType` inalterados |
| 2 | `setExteriorColor` chamado com `viewMode: 'interior'` | `viewMode` volta para `'exterior'` |
| 3 | `setInteriorColor('deep-blue')` | `interiorColor` atualizado; demais campos inalterados |
| 4 | `setInteriorColor` chamado com `viewMode: 'exterior'` | `viewMode` vira `'interior'` |

## 10. `setWheelType`

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | `setWheelType('sport')` | `wheelType` atualizado |
| 2 | *(contraste)* chamado com `viewMode` já em `'interior'` | `viewMode` **permanece** `'interior'` — ao contrário dos setters de cor, este não mexe no `viewMode`. |

## 11. `toggleOptional`

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Adicionar opcional ausente | Lista passa a conter o opcional |
| 2 | Remover opcional já presente | Opcional some da lista |
| 3 | Alternar duas vezes o mesmo opcional | Lista volta ao estado original |
| 4 | Alternar um opcional não afeta outro já presente | Lista mantém os demais itens intactos |
| 5 | *(defensivo)* `configuration.optionals` forçado para `undefined` via `setState` | Não lança erro; trata como lista vazia |

## 12. `setViewMode`

Setter direto, sem efeitos colaterais — um teste por valor (`'exterior'` e `'interior'`).

## 13. `addOrder`

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Adicionar pedido à lista vazia | `orders` passa a ter 1 item |
| 2 | Adicionar pedido com `orders` já populado | Pedidos anteriores preservados, na mesma ordem |

## 14. `login` / `logout` / `getUserOrders`

A "sessão" depende inteiramente de existir um pedido com aquele e-mail — não há cadastro de usuário separado.

**`login(email)`**

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | E-mail com pedido existente | Retorna `true`; `currentUserEmail` definido |
| 2 | E-mail sem nenhum pedido | Retorna `false`; `currentUserEmail` permanece `null` |
| 3 | *(gap documentado)* mesmo e-mail com caixa diferente | Hoje falha (comparação `===`, sensível a maiúsculas) — comportamento atual documentado, avaliar com o time se deveria ser case-insensitive |
| 4 | Login bem-sucedido enquanto já logado com outro e-mail válido | `currentUserEmail` é substituído, não mesclado |

**`logout()`**
- Após login, zera `currentUserEmail` para `null`.
- Chamar já deslogado não lança erro (idempotente).

**`getUserOrders()`**

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Sem sessão (`currentUserEmail: null`) | Retorna `[]` |
| 2 | Logado, com pedidos de múltiplos e-mails no store | Retorna apenas os pedidos do e-mail da sessão atual |
| 3 | *(defensivo)* `currentUserEmail` setado direto para um e-mail sem pedidos | Retorna `[]`, sem erro |

## 15. `resetConfiguration`

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Alterar cor/roda/opcionais e então resetar | `configuration` volta exatamente ao default |
| 2 | *(isolamento de estado)* resetar com `orders` e `currentUserEmail` preenchidos | `orders`, `currentUserEmail` e `viewMode` **não são afetados** — só `configuration` muda |

## 16. Checklist de cobertura

- [x] Setup do Vitest configurado (`vitest.config.ts`, `src/test/setup.ts`, scripts no `package.json`)
- [x] `beforeEach` reseta o store inteiro e limpa `localStorage`
- [x] `calculateTotalPrice` — 9 cenários
- [x] `calculateInstallment` — 4 cenários
- [x] `formatPrice` — 5 cenários
- [x] Estado inicial do store travado em teste próprio
- [x] `setExteriorColor` / `setInteriorColor` — 4 cenários
- [x] `setWheelType` — 2 cenários, incluindo o contraste com os setters de cor
- [x] `toggleOptional` — 5 cenários
- [x] `setViewMode` — 2 valores
- [x] `addOrder` — 2 cenários
- [x] `login` / `logout` / `getUserOrders` — 8 cenários
- [x] `resetConfiguration` — 2 cenários, incluindo isolamento de estado
- [x] `migrateConfiguratorPersistedState` extraída e testada — 6 cenários
- [x] Gaps documentados (case-sensitivity do e-mail, duplicata em `optionals`) comunicados via comentários nos próprios testes

## Gaps encontrados (não corrigidos, apenas documentados)

1. **`login(email)` é case-sensitive.** `"A@x.com"` não encontra um pedido salvo como `"a@x.com"`. Pode ser intencional ou um bug — avaliar com o time.
2. **`calculateTotalPrice` soma opcionais duplicados duas vezes.** Não ocorre via `toggleOptional` (que nunca duplica), mas a função não se protege se chamada diretamente com um array malformado.
