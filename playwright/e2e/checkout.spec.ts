import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/ordersRepository'

/// CT04 - Checkout - Validação de Campos Obrigatórios e Dados Inválidos
/// Refatorado com:
/// - Proposta 1: Múltiplos testes pequenos
/// - Proposta 2: Page Object Model (app.checkout)
/// - Proposta 5: Estrutura com beforeEach e AAA (Arrange, Act, Assert)

test.describe('CT04 - Checkout - Validação de Campos Obrigatórios', () => {
    test.beforeEach(async ({ app }) => {
        // Arrange - Setup comum para todos os testes
        await app.checkout.goto()
        await expect(app.checkout.elements.submitButton).toBeVisible()
    })

    test('CT04.1 - deve validar nome com menos de 2 caracteres', async ({ page, app }) => {
        // Arrange
        const invalidName = 'A'

        // Act
        await app.checkout.elements.nameInput.fill(invalidName)
        await app.checkout.submit()

        // Assert - Validar erro usando XPath
        const errorXPath = "//p[contains(text(), 'Nome deve ter')]"
        const errorElement = page.locator(`xpath=${errorXPath}`)
        await expect(errorElement).toBeVisible()
    })

    test('CT04.2 - deve validar lastname com menos de 2 caracteres', async ({ page, app }) => {
        // Arrange
        const validName = 'Fernando'
        const invalidSurname = 'S'

        // Act
        await app.checkout.elements.nameInput.fill(validName)
        await app.checkout.elements.surnameInput.fill(invalidSurname)
        await app.checkout.submit()

        // Assert - Validar erro usando XPath
        const errorXPath = "//p[contains(text(), 'Lastname deve ter')]"
        const errorElement = page.locator(`xpath=${errorXPath}`)
        await expect(errorElement).toBeVisible()
    })

    test('CT04.3 - deve validar email inválido', async ({ page, app }) => {
        // Arrange
        await app.checkout.elements.nameInput.fill('João')
        await app.checkout.elements.surnameInput.fill('Silva')
        await app.checkout.elements.phoneInput.fill('(11)99999-9999')
        await app.checkout.elements.cpfInput.fill('529.982.247-25')

        // Act - Preencher email inválido e confirmar
        await app.checkout.elements.emailInput.fill('cliente@.com')
        await app.checkout.submit()

        // Assert - Validar erro usando XPath
        const errorXPath = "//p[contains(text(), 'Email inválido')]"
        const errorElement = page.locator(`xpath=${errorXPath}`)
        await expect(errorElement).toBeVisible()
    })

    test('CT04.4 - deve validar document inválido', async ({ page, app }) => {
        // Arrange
        await app.checkout.elements.nameInput.fill('João')
        await app.checkout.elements.surnameInput.fill('Silva')
        await app.checkout.elements.emailInput.fill('joao.silva@email.com')
        await app.checkout.elements.phoneInput.fill('(11)99999-9999')

        // Act - Deixar o Document em branco e confirmar
        await app.checkout.submit()

        // Assert - Validar erro usando XPath
        const errorXPath = "//p[contains(text(), 'Document inválido')]"
        const errorElement = page.locator(`xpath=${errorXPath}`)
        await expect(errorElement).toBeVisible()
    })

    test('CT04.5 - deve validar loja obrigatória', async ({ page, app }) => {
        // Arrange
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
            

        }

        // Act - Preencher dados mas NÃO selecionar loja
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectPaymentMethod('avista')
        await app.checkout.submit()

        // Assert - Validar erro usando XPath
        const errorXPath = "//p[contains(text(), 'Selecione uma loja')]"
        const errorElement = page.locator(`xpath=${errorXPath}`)
        await expect(errorElement).toBeVisible()
    })

    test('CT04.6 - deve validar aceitação de termos obrigatória', async ({ page, app }) => {
        // Arrange
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        // Act - Preencher todos os dados mas NÃO aceitar termos
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)
        await app.checkout.selectPaymentMethod('avista')
        // Não executar acceptTerms()
        await app.checkout.submit()

        // Assert - Validar erro usando XPath
        const errorXPath = "//p[contains(text(), 'Aceite os termos')]"
        const errorElement = page.locator(`xpath=${errorXPath}`)
        await expect(errorElement).toBeVisible()
    })

    test('CT04.7 - deve permitir submissão com todos os dados válidos', async ({ page, app }) => {
        // Arrange
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        // Checkpoint - Validar estado antes de ações críticas
        await expect(app.checkout.elements.submitButton).toBeEnabled()

        // Act
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)
        await app.checkout.selectPaymentMethod('avista')
        await app.checkout.acceptTerms()

        // Assert - Validar que checkbox está marcado antes de submeter
        await expect(app.checkout.elements.termsCheckbox).toBeChecked()

        // Act - Submeter
        await app.checkout.submit()

        // Assert - Deve navegar para página de sucesso ou pedido
        await expect(page).toHaveURL(/\/(success|pedido)/, { timeout: 10000 })
    })
})

test.describe('CT05 - Checkout e Confirmação - Pagamento à Vista (Fluxo Feliz)', () => {
    test('CT05.1 - deve aprovar o pedido imediatamente ao confirmar pagamento à vista com dados válidos', async ({ app }) => {
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
            store: 'velô Paulista',
            PaymentMethod: 'avista',
            totalPrice: 'R$ 40.000,00',
        }

        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        await deleteOrderByEmail(customerData.email)

        // Arrange - Iniciar na Landing Page
        await app.landing.goto()

        // Act - Ir da Landing Page para o Configurador
        await app.landing.goToConfigurator()

        // Assert - Configuração padrão do veículo (sem trocas de cor, roda ou opcionais)
        await app.configurator.validatePrice('R$ 40.000,00')

        // Act - Seguir do Configurador para o Checkout
        await app.configurator.finishConfigurator()

        // Assert - Checkpoint: formulário de checkout disponível para preenchimento
        await expect(app.checkout.elements.submitButton).toBeEnabled()

        // Act - Preencher dados pessoais e selecionar a loja
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)

        // Act - Selecionar a forma de pagamento "À Vista"
        await app.checkout.selectPaymentMethod('avista')

        // Assert - Resumo deve refletir o valor à vista do carro configurado
        await app.checkout.validateSummaryPrice('R$ 40.000,00')

        // Act - Aceitar os termos de uso
        await app.checkout.acceptTerms()

        // Assert - Checkpoint antes de submeter
        await expect(app.checkout.elements.termsCheckbox).toBeChecked()

        // Act - Confirmar o pedido
        await app.checkout.submit()

        // Assert - Pedido aprovado imediatamente, sem análise de crédito
        await app.success.validateApproved()
    })
})

test.describe('CT06 - Checkout e Análise de Crédito - Financiamento com Score Alto (Aprovado)', () => {
    test('CT06.1 - deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ page, app }) => {
        const customerData = {
            name: 'Camila',
            surname: 'Ferreira',
            email: 'score.alto@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const installmentValue = 'R$ 3.400,00'

        await deleteOrderByEmail(customerData.email)

        // Arrange - Mockar a análise de crédito para retornar um score alto (> 700)
        await page.route('**/functions/v1/credit-analysis', (route) =>
            route.fulfill({ json: { status: 'Done', score: 850 } })
        )

        // Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)
        await app.landing.goto()
        await app.landing.goToConfigurator()
        await app.configurator.validatePrice('R$ 40.000,00')
        await app.configurator.finishConfigurator()

        // Assert - Checkpoint: formulário de checkout disponível para preenchimento
        await expect(app.checkout.elements.submitButton).toBeEnabled()

        // Act - Preencher dados pessoais e selecionar a loja
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)

        // Act - Selecionar "Financiamento" mantendo a entrada em R$ 0
        await app.checkout.selectPaymentMethod('financiamento')

        // Assert - Parcela (12x) reflete o cálculo com juros de 2% a.m.
        await app.checkout.validateInstallment(installmentValue)

        // Act - Aceitar os termos de uso
        await app.checkout.acceptTerms()
        await expect(app.checkout.elements.termsCheckbox).toBeChecked()

        // Act - Confirmar o pedido (dispara a análise de crédito mockada)
        await app.checkout.submit()

        // Assert - Score > 700 aprova o pedido automaticamente, sem verificação manual
        await app.success.validateApproved()
    })
})

test.describe('CT07 - Checkout e Análise de Crédito - Financiamento com Score Médio (Em análise)', () => {
    test('CT07.1 - deve marcar o pedido como EM_ANALISE quando o score do CPF estiver entre 501 e 700', async ({ page, app }) => {
        const customerData = {
            name: 'Marcos',
            surname: 'Lima',
            email: 'score.medio@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        await deleteOrderByEmail(customerData.email)

        // Arrange - Mockar a análise de crédito para retornar um score médio (501-700)
        await page.route('**/functions/v1/credit-analysis', (route) =>
            route.fulfill({ json: { status: 'Done', score: 600 } })
        )

        // Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)
        await app.landing.goto()
        await app.landing.goToConfigurator()
        await app.configurator.finishConfigurator()

        // Act - Preencher dados, selecionar loja e financiamento sem entrada
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)
        await app.checkout.selectPaymentMethod('financiamento')
        await app.checkout.acceptTerms()

        // Act - Confirmar o pedido (dispara a análise de crédito mockada)
        await app.checkout.submit()

        // Assert - Score entre 501 e 700 mantém o pedido em análise manual
        await app.success.validatePending()

        // Act - Capturar o número do pedido gerado e ir para a Consulta de Pedido
        const orderNumber = await app.success.getOrderNumber()
        await app.success.goToOrderLookup()
        await app.orderLookup.searchOrder(orderNumber)

        // Assert - Badge de status também reflete "em análise" na consulta de pedido
        await app.orderLookup.validateStatusBadge('EM_ANALISE', orderNumber)
    })

    test('CT07.2 - deve marcar o pedido como EM_ANALISE com massa de dados alternativa (CPF 45253814000)', async ({ page, app }) => {
        const customerData = {
            name: 'Juliana',
            surname: 'Rocha',
            email: 'score.medio.massa2@velo.dev',
            phone: '11987654321',
            cpf: '45253814000',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        let orderNumber = ''

        await test.step('Arrange - Limpar pedido anterior e mockar score médio (501-700)', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', (route) =>
                route.fulfill({ json: { status: 'Done', score: 650 } })
            )
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout com o carro base', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step(`Act - Preencher CPF ${customerData.cpf} (massa alternativa), selecionar loja e financiamento sem entrada`, async () => {
            await app.checkout.fillCustomerData(customerData)
            await expect(app.checkout.elements.cpfInput).toHaveValue('452.538.140-00')
            await app.checkout.selectStore(storeOption)
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.acceptTerms()
        })

        await test.step(`Act - Confirmar o pedido com CPF ${customerData.cpf} (dispara a análise de crédito mockada)`, async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score entre 501 e 700 mantém o pedido em análise manual', async () => {
            await app.success.validatePending()
        })

        await test.step('Act - Capturar o número do pedido e ir para a Consulta de Pedido', async () => {
            orderNumber = await app.success.getOrderNumber()
            await app.success.goToOrderLookup()
            await app.orderLookup.searchOrder(orderNumber)
        })

        await test.step('Assert - Badge de status também reflete "em análise" na consulta de pedido', async () => {
            await app.orderLookup.validateStatusBadge('EM_ANALISE', orderNumber)
        })
    })
})

test.describe('CT08 - Checkout e Análise de Crédito - Financiamento com Score Baixo (Reprovado)', () => {
    test('CT08.1 - deve reprovar o crédito quando o score do CPF for menor ou igual a 500 e a entrada for inferior a 50%', async ({ page, app }) => {
        const customerData = {
            name: 'Beatriz',
            surname: 'Souza',
            email: 'score.baixo@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        await deleteOrderByEmail(customerData.email)

        // Arrange - Mockar a análise de crédito para retornar um score baixo (<= 500)
        await page.route('**/functions/v1/credit-analysis', (route) =>
            route.fulfill({ json: { status: 'Done', score: 300 } })
        )

        // Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)
        await app.landing.goto()
        await app.landing.goToConfigurator()
        await app.configurator.finishConfigurator()

        // Act - Preencher dados, selecionar loja e financiamento sem entrada (< 50%)
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)
        await app.checkout.selectPaymentMethod('financiamento')
        await app.checkout.acceptTerms()

        // Act - Confirmar o pedido (dispara a análise de crédito mockada)
        await app.checkout.submit()

        // Assert - Score <= 500 sem entrada relevante reprova o pedido
        await app.success.validateReproved()

        // Act - Capturar o número do pedido gerado e ir para a Consulta de Pedido
        const orderNumber = await app.success.getOrderNumber()
        await app.success.goToOrderLookup()
        await app.orderLookup.searchOrder(orderNumber)

        // Assert - Badge de status também reflete "reprovado" na consulta de pedido
        await app.orderLookup.validateStatusBadge('REPROVADO', orderNumber)
    })
})

test.describe('CT09 - Checkout e Exceção de Crédito - Financiamento com Entrada >= 50% e Score Baixo (Aprovado)', () => {
    test('CT09.1 - deve aprovar o pedido quando a entrada for maior ou igual a 50% do total, mesmo com score baixo', async ({ page, app }) => {
        const customerData = {
            name: 'Rafael',
            surname: 'Torres',
            email: 'entrada.alta@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const entryValue = 20000
        const installmentValue = 'R$ 1.700,00'

        await deleteOrderByEmail(customerData.email)

        // Arrange - Mockar a análise de crédito para retornar um score baixo (<= 500)
        await page.route('**/functions/v1/credit-analysis', (route) =>
            route.fulfill({ json: { status: 'Done', score: 300 } })
        )

        // Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)
        await app.landing.goto()
        await app.landing.goToConfigurator()
        await app.configurator.finishConfigurator()

        // Act - Preencher dados, selecionar loja e financiamento com entrada de 50% (R$ 20.000,00)
        await app.checkout.fillCustomerData(customerData)
        await app.checkout.selectStore(storeOption)
        await app.checkout.selectPaymentMethod('financiamento')
        await app.checkout.fillEntryValue(entryValue)

        // Assert - Parcela recalculada sobre o valor restante a financiar
        await app.checkout.validateInstallment(installmentValue)

        await app.checkout.acceptTerms()

        // Act - Confirmar o pedido (dispara a análise de crédito mockada)
        await app.checkout.submit()

        // Assert - Entrada >= 50% aprova o pedido mesmo com score baixo
        await app.success.validateApproved()
    })
})
