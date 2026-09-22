import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/ordersRepository'

/// CT04 - Checkout - Validação de Campos Obrigatórios e Dados Inválidos
/// Refatorado com:
/// - Proposta 1: Múltiplos testes pequenos
/// - Proposta 2: Page Object Model (app.checkout)
/// - Proposta 5: Estrutura com beforeEach e AAA (Arrange, Act, Assert)

test.describe('CT04 - Checkout - Validação de Campos Obrigatórios', () => {
    test.beforeEach(async ({ app }) => {
        await test.step('Arrange - Setup comum para todos os testes', async () => {
            await app.checkout.goto()
            await expect(app.checkout.elements.submitButton).toBeVisible()
        })
    })

    test('CT04.1 - deve validar nome com menos de 2 caracteres', async ({ page, app }) => {
        const invalidName = 'A'

        await test.step('Act - Preencher nome inválido e submeter', async () => {
            await app.checkout.elements.nameInput.fill(invalidName)
            await app.checkout.submit()
        })

        await test.step('Assert - Validar erro de nome', async () => {
            const errorXPath = "//p[contains(text(), 'Nome deve ter')]"
            const errorElement = page.locator(`xpath=${errorXPath}`)
            await expect(errorElement).toBeVisible()
        })
    })

    test('CT04.2 - deve validar lastname com menos de 2 caracteres', async ({ page, app }) => {
        const validName = 'Fernando'
        const invalidSurname = 'S'

        await test.step('Act - Preencher nome válido e sobrenome inválido, e submeter', async () => {
            await app.checkout.elements.nameInput.fill(validName)
            await app.checkout.elements.surnameInput.fill(invalidSurname)
            await app.checkout.submit()
        })

        await test.step('Assert - Validar erro de sobrenome', async () => {
            const errorXPath = "//p[contains(text(), 'Lastname deve ter')]"
            const errorElement = page.locator(`xpath=${errorXPath}`)
            await expect(errorElement).toBeVisible()
        })
    })

    test('CT04.3 - deve validar email inválido', async ({ page, app }) => {
        await test.step('Arrange - Preencher dados válidos (exceto email)', async () => {
            await app.checkout.elements.nameInput.fill('João')
            await app.checkout.elements.surnameInput.fill('Silva')
            await app.checkout.elements.phoneInput.fill('(11)99999-9999')
            await app.checkout.elements.cpfInput.fill('529.982.247-25')
        })

        await test.step('Act - Preencher email inválido e confirmar', async () => {
            await app.checkout.elements.emailInput.fill('cliente@.com')
            await app.checkout.submit()
        })

        await test.step('Assert - Validar erro de email', async () => {
            const errorXPath = "//p[contains(text(), 'Email inválido')]"
            const errorElement = page.locator(`xpath=${errorXPath}`)
            await expect(errorElement).toBeVisible()
        })
    })

    test('CT04.4 - deve validar document inválido', async ({ page, app }) => {
        await test.step('Arrange - Preencher dados válidos (exceto documento)', async () => {
            await app.checkout.elements.nameInput.fill('João')
            await app.checkout.elements.surnameInput.fill('Silva')
            await app.checkout.elements.emailInput.fill('joao.silva@email.com')
            await app.checkout.elements.phoneInput.fill('(11)99999-9999')
        })

        await test.step('Act - Deixar o Document em branco e confirmar', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Validar erro de documento', async () => {
            const errorXPath = "//p[contains(text(), 'Document inválido')]"
            const errorElement = page.locator(`xpath=${errorXPath}`)
            await expect(errorElement).toBeVisible()
        })
    })

    test('CT04.5 - deve validar loja obrigatória', async ({ page, app }) => {
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }

        await test.step('Act - Preencher dados mas NÃO selecionar loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectPaymentMethod('avista')
            await app.checkout.submit()
        })

        await test.step('Assert - Validar erro de loja obrigatória', async () => {
            const errorXPath = "//p[contains(text(), 'Selecione uma loja')]"
            const errorElement = page.locator(`xpath=${errorXPath}`)
            await expect(errorElement).toBeVisible()
        })
    })

    test('CT04.6 - deve validar aceitação de termos obrigatória', async ({ page, app }) => {
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        await test.step('Act - Preencher todos os dados mas NÃO aceitar termos', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
            await app.checkout.selectPaymentMethod('avista')
            // Não executar acceptTerms()
            await app.checkout.submit()
        })

        await test.step('Assert - Validar erro de aceite de termos', async () => {
            const errorXPath = "//p[contains(text(), 'Aceite os termos')]"
            const errorElement = page.locator(`xpath=${errorXPath}`)
            await expect(errorElement).toBeVisible()
        })
    })

    test('CT04.7 - deve permitir submissão com todos os dados válidos', async ({ page, app }) => {
        const customerData = {
            name: 'Fernando',
            surname: 'Papito',
            email: 'papito@velo.dev',
            phone: '11987654321',
            cpf: '12345678901',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        await test.step('Checkpoint - Validar estado antes de ações críticas', async () => {
            await expect(app.checkout.elements.submitButton).toBeEnabled()
        })

        await test.step('Act - Preencher dados, loja, pagamento e aceitar termos', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
            await app.checkout.selectPaymentMethod('avista')
            await app.checkout.acceptTerms()
        })

        await test.step('Assert - Validar que checkbox está marcado antes de submeter', async () => {
            await expect(app.checkout.elements.termsCheckbox).toBeChecked()
        })

        await test.step('Act - Submeter', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Deve navegar para página de sucesso ou pedido', async () => {
            await expect(page).toHaveURL(/\/(success|pedido)/, { timeout: 10000 })
        })
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
        }

        const storeOption = 'Velô Paulista - Av. Paulista, 1000'

        await test.step('Arrange - Limpar pedido anterior', async () => {
            await deleteOrderByEmail(customerData.email)
        })

        await test.step('Arrange - Iniciar na Landing Page', async () => {
            await app.landing.goto()
        })

        await test.step('Act - Ir da Landing Page para o Configurador', async () => {
            await app.landing.goToConfigurator()
        })

        await test.step('Assert - Configuração padrão do veículo (sem trocas de cor, roda ou opcionais)', async () => {
            await app.configurator.validatePrice('R$ 40.000,00')
        })

        await test.step('Act - Seguir do Configurador para o Checkout', async () => {
            await app.configurator.finishConfigurator()
        })

        await test.step('Assert - Checkpoint: formulário de checkout disponível para preenchimento', async () => {
            await expect(app.checkout.elements.submitButton).toBeEnabled()
        })

        await test.step('Act - Preencher dados pessoais e selecionar a loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar a forma de pagamento "À Vista"', async () => {
            await app.checkout.selectPaymentMethod('avista')
        })

        await test.step('Assert - Resumo deve refletir o valor à vista do carro configurado', async () => {
            await app.checkout.validateSummaryPrice('R$ 40.000,00')
        })

        await test.step('Act - Aceitar os termos de uso', async () => {
            await app.checkout.acceptTerms()
        })

        await test.step('Assert - Checkpoint antes de submeter', async () => {
            await expect(app.checkout.elements.termsCheckbox).toBeChecked()
        })

        await test.step('Act - Confirmar o pedido', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Pedido aprovado imediatamente, sem análise de crédito', async () => {
            await app.success.validateApproved()
        })
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

        await test.step('Arrange - Limpar pedido anterior e mockar score alto (> 700)', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', (route) =>
                route.fulfill({ json: { status: 'Done', score: 850 } })
            )
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.validatePrice('R$ 40.000,00')
            await app.configurator.finishConfigurator()
        })

        await test.step('Assert - Checkpoint: formulário de checkout disponível para preenchimento', async () => {
            await expect(app.checkout.elements.submitButton).toBeEnabled()
        })

        await test.step('Act - Preencher dados pessoais e selecionar a loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar "Financiamento" mantendo a entrada em R$ 0', async () => {
            await app.checkout.selectPaymentMethod('financiamento')
        })

        await test.step('Assert - Parcela (12x) reflete o cálculo com juros de 2% a.m.', async () => {
            await app.checkout.validateInstallment(installmentValue)
        })

        await test.step('Act - Aceitar os termos de uso', async () => {
            await app.checkout.acceptTerms()
            await expect(app.checkout.elements.termsCheckbox).toBeChecked()
        })

        await test.step('Act - Confirmar o pedido (dispara a análise de crédito mockada)', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score > 700 aprova o pedido automaticamente, sem verificação manual', async () => {
            await app.success.validateApproved()
        })
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
        let orderNumber = ''

        await test.step('Arrange - Limpar pedido anterior e mockar score médio (501-700)', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', (route) =>
                route.fulfill({ json: { status: 'Done', score: 600 } })
            )
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados, selecionar loja e financiamento sem entrada', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar o pedido (dispara a análise de crédito mockada)', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score entre 501 e 700 mantém o pedido em análise manual', async () => {
            await app.success.validatePending()
        })

        await test.step('Act - Capturar o número do pedido gerado e ir para a Consulta de Pedido', async () => {
            orderNumber = await app.success.getOrderNumber()
            await app.success.goToOrderLookup()
            await app.orderLookup.searchOrder(orderNumber)
        })

        await test.step('Assert - Badge de status também reflete "em análise" na consulta de pedido', async () => {
            await app.orderLookup.validateStatusBadge('EM_ANALISE', orderNumber)
        })
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

        await test.step('Arrange - Limpar pedido anterior e mockar score baixo (<= 500)', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', (route) =>
                route.fulfill({ json: { status: 'Done', score: 300 } })
            )
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados, selecionar loja e financiamento sem entrada (< 50%)', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar o pedido (dispara a análise de crédito mockada)', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score <= 500 sem entrada relevante reprova o pedido', async () => {
            await app.success.validateReproved()
        })

        let orderNumber = ''
        await test.step('Act - Capturar o número do pedido gerado e ir para a Consulta de Pedido', async () => {
            orderNumber = await app.success.getOrderNumber()
            await app.success.goToOrderLookup()
            await app.orderLookup.searchOrder(orderNumber)
        })

        await test.step('Assert - Badge de status também reflete "reprovado" na consulta de pedido', async () => {
            await app.orderLookup.validateStatusBadge('REPROVADO', orderNumber)
        })
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

        await test.step('Arrange - Limpar pedido anterior e mockar score baixo (<= 500)', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', (route) =>
                route.fulfill({ json: { status: 'Done', score: 300 } })
            )
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout com o carro base (R$ 40.000,00)', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados, selecionar loja e financiamento com entrada de 50% (R$ 20.000,00)', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.fillEntryValue(entryValue)
        })

        await test.step('Assert - Parcela recalculada sobre o valor restante a financiar', async () => {
            await app.checkout.validateInstallment(installmentValue)
        })

        await test.step('Act - Aceitar os termos de uso', async () => {
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar o pedido (dispara a análise de crédito mockada)', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Entrada >= 50% aprova o pedido mesmo com score baixo', async () => {
            await app.success.validateApproved()
        })
    })
})

test.describe('CT10 - Regra de entrada mínima para aprovação', () => {

    test('CT10.0 - deve reprovar o pedido quando não houver entrada e o score for baixo', async ({ page, app }) => {
        const customerData = {
            name: 'Rafael',
            surname: 'Torres',
            email: 'sem.entrada@velo.dev',
            phone: '11987654321',
            cpf: '12345678909',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const entryValue = 0

        await test.step('Arrange - Limpar pedido anterior e mockar score baixo', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', async (route) => {
                await route.fulfill({ json: { status: 'Done', score: 300 } })
            })
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados do cliente e selecionar loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar financiamento sem entrada', async () => {
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.fillEntryValue(entryValue)
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar pedido e executar análise de crédito', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Sem entrada + score baixo = REPROVADO', async () => {
            await app.success.validateReproved()
        })
    })

    test('CT10.1 - deve reprovar o pedido quando a entrada for inferior a 50% e o score for baixo', async ({ page, app }) => {
        const customerData = {
            name: 'Rafael',
            surname: 'Torres',
            email: 'entrada.inferior.50@velo.dev',
            phone: '11987654322',
            cpf: '98765432100',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const entryValue = 16000 // 40% de R$ 40.000,00

        await test.step('Arrange - Limpar pedido anterior e mockar score baixo', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', async (route) => {
                await route.fulfill({ json: { status: 'Done', score: 300 } })
            })
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados do cliente e selecionar loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar financiamento com entrada inferior a 50%', async () => {
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.fillEntryValue(entryValue)
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar pedido e executar análise de crédito', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score baixo + entrada < 50% = REPROVADO', async () => {
            await app.success.validateReproved()
        })
    })

    test('CT10.2 - deve aprovar o pedido quando a entrada for exatamente 50% e o score for baixo', async ({ page, app }) => {
        const customerData = {
            name: 'Mariana',
            surname: 'Oliveira',
            email: 'entrada.exatamente.50@velo.dev',
            phone: '11987654323',
            cpf: '52998224725',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const entryValue = 20000 // 50% de R$ 40.000,00

        await test.step('Arrange - Limpar pedido anterior e mockar score baixo', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', async (route) => {
                await route.fulfill({ json: { status: 'Done', score: 300 } })
            })
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados do cliente e selecionar loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar financiamento com entrada exatamente igual a 50%', async () => {
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.fillEntryValue(entryValue)
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar pedido e executar análise de crédito', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score baixo + entrada >= 50% = APROVADO', async () => {
            await app.success.validateApproved()
        })
    })

    test('CT10.3 - deve aprovar o pedido quando a entrada for superior a 50% e o score for baixo', async ({ page, app }) => {
        const customerData = {
            name: 'Camila',
            surname: 'Santos',
            email: 'entrada.superior.50@velo.dev',
            phone: '11987654324',
            cpf: '11144477735',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const entryValue = 24000 // 60% de R$ 40.000,00

        await test.step('Arrange - Limpar pedido anterior e mockar score baixo', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', async (route) => {
                await route.fulfill({ json: { status: 'Done', score: 300 } })
            })
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados do cliente e selecionar loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar financiamento com entrada superior a 50%', async () => {
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.fillEntryValue(entryValue)
            await app.checkout.acceptTerms()
        })

        await test.step('Act - Confirmar pedido e executar análise de crédito', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score baixo + entrada > 50% = APROVADO', async () => {
            await app.success.validateApproved()
        })
    })
})

test.describe('CT10.4 - Checkout e Análise de Crédito - Financiamento com Score Baixo (Reprovado)', () => {
    test('CT10.4 - deve reprovar o pedido quando a entrada for menor que 50% e o score for baixo', async ({ page, app }) => {
        const customerData = {
            name: 'Rafael',
            surname: 'Torres',
            email: 'score.baixo@velo.dev',
            phone: '11987654325',
            cpf: '39053344705',
        }
        const storeOption = 'Velô Paulista - Av. Paulista, 1000'
        const entryValue = 16000 // 40% de R$ 40.000,00

        await test.step('Arrange - Limpar pedido anterior e mockar score <= 500', async () => {
            await deleteOrderByEmail(customerData.email)
            await page.route('**/functions/v1/credit-analysis', async (route) => {
                await route.fulfill({ json: { status: 'Done', score: 300 } })
            })
        })

        await test.step('Arrange - Ir da Landing Page ao Checkout', async () => {
            await app.landing.goto()
            await app.landing.goToConfigurator()
            await app.configurator.finishConfigurator()
        })

        await test.step('Act - Preencher dados do cliente e selecionar loja', async () => {
            await app.checkout.fillCustomerData(customerData)
            await app.checkout.selectStore(storeOption)
        })

        await test.step('Act - Selecionar financiamento e entrada inferior a 50%', async () => {
            await app.checkout.selectPaymentMethod('financiamento')
            await app.checkout.fillEntryValue(entryValue)
            await app.checkout.acceptTerms()
        })

        // Assert - Validar cálculo da parcela
        // Informe aqui o valor real esperado pelo sistema
        // await app.checkout.validateInstallment('R$ X.XXX,XX')

        await test.step('Act - Confirmar pedido e executar análise de crédito', async () => {
            await app.checkout.submit()
        })

        await test.step('Assert - Score <= 500 + entrada < 50% = REPROVADO', async () => {
            await app.success.validateReproved()
        })
    })
})
