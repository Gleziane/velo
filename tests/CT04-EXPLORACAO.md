# CT04 - Exploração Manual (Fase 1)

**Data:** 31/08/2026  
**Automator:** QA Specialist - Playwright MCP

## Descobertas da Exploração

### ✅ Elementos Identificados

#### Inputs Validados
- ✅ `checkout-name` - Nome (mín. 2 caracteres)
- ✅ `checkout-surname` - Sobrenome (mín. 2 caracteres)
- ✅ `checkout-email` - Email (formato válido)
- ✅ `checkout-phone` - Telefone (11 dígitos)
- ✅ `checkout-cpf` - CPF (11 dígitos)

#### Select
- ✅ `Loja para Retirada` - Seletor de lojas obrigatório

#### Checkbox
- ✅ `Li e aceito os Termos de Uso e Política de Privacidade` - Obrigatório

#### Botões
- ✅ `Confirmar Pedido` - Validação no submit
- ✅ `payment-avista` - Forma de pagamento à vista
- ✅ `payment-financiamento` - Forma de pagamento financiamento

---

## 🔍 Comportamento de Validação Descoberto

### Validação por Campo (Blur)
Quando o usuário sai de um campo (blur), a validação é acionada:

```typescript
// Exemplo: Nome com 1 caractere
await nameInput.fill('A');
await surnameInput.focus(); // blur no nome
// Resultado: "Nome deve ter pelo menos 2 caracteres"
```

### Mensagens de Erro Descobertas

| Campo | Mensagem | Trigger |
|-------|----------|---------|
| Nome | "Nome deve ter pelo menos 2 caracteres" | Input < 2 chars ou vazio |
| Sobrenome | "Sobrenome deve ter pelo menos 2 caracteres" | Input < 2 chars ou vazio |
| Email | "Email inválido" | Formato não-email ou vazio |
| Telefone | "Telefone inválido" | Incompleto ou vazio |
| CPF | "CPF inválido" | Incompleto ou vazio |
| Loja | "Selecione uma loja" | Campo vazio |
| Termos | "Aceite os termos" | Checkbox não marcado |

---

## 🎯 Estrutura DOM

```html
<!-- Campo com erro -->
<div>
  <text>Nome</text>
  <input data-testid="checkout-name" type="text" />
  <p class="text-sm text-destructive">Nome deve ter pelo menos 2 caracteres</p>
</div>
```

**Classe de erro:** `text-destructive`

---

## ✨ Padrão Detectado

1. **Validação Real-time**: Conforme o usuário digita e sai do campo
2. **Mensagens em `<p>` com classe `destructive`**
3. **Cada campo tem sua própria mensagem**
4. **Validação é independente por campo**

---

## Próxima Fase: Implementação

Baseado nesta exploração, os testes serão implementados seguindo:
- ✅ **Sem `waitForTimeout()`** - Usar auto-waiting do Playwright
- ✅ **Com `.first()`** - Para evitar strict mode violations
- ✅ **Com checkpoints** - Validar estado antes de interações
- ✅ **Page Object Model** - Centralizar localizadores

