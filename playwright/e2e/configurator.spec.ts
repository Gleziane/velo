import { test } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
    test.beforeEach(async ({ app }) => {
        await app.configurator.goto()
    })

    test('não deve alterar o preço ao trocar a cor do veículo', async ({ app }) => {
        await app.configurator.validatePrice('R$ 40.000,00')

        await app.configurator.selectColor('midnight-black')

        await app.configurator.validatePrice('R$ 40.000,00')
        await app.configurator.validateCarImage('Velô Sprint - midnight-black with aero wheels')
    })

    test('deve atualizar o preço ao alterar as rodas para Sport e retornar ao valor inicial', async ({ app }) => {
        await app.configurator.validatePrice('R$ 40.000,00')

        await app.configurator.selectWheels('sport')
        await app.configurator.validatePrice('R$ 42.000,00')

        await app.configurator.validateCarImage('Velô Sprint - glacier-blue with sport wheels')

        await app.configurator.selectWheels('aero')
        await app.configurator.validatePrice('R$ 40.000,00')

        await app.configurator.validateCarImage('Velô Sprint - glacier-blue with aero wheels')
    })

    test('deve atualizar o preço ao adicionar e remover opcionais no checkout', async ({ app }) => {
        await app.configurator.validatePrice('R$ 40.000,00')

        await app.configurator.selectOptional('precision-park')
        await app.configurator.validatePrice('R$ 45.500,00')

        await app.configurator.selectOptional('flux-capacitor')
        await app.configurator.validatePrice('R$ 50.500,00')

        await app.configurator.removeOptional('precision-park')
        await app.configurator.validatePrice('R$ 45.000,00')

        await app.configurator.removeOptional('flux-capacitor')
        await app.configurator.validatePrice('R$ 40.000,00')

        await app.configurator.finishConfigurator()
        await app.checkout.validateSummaryPrice('R$ 40.000,00')
    })
})