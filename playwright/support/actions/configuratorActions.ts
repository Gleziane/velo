import { expect, Page } from '@playwright/test'

export type ExteriorColor = 'glacier-blue' | 'midnight-black' | 'lunar-white'
export type WheelType = 'aero' | 'sport'
export type OptionalFeature = 'precision-park' | 'flux-capacitor'

const optionalLabels: Record<OptionalFeature, string> = {
  'precision-park': 'Precision Park',
  'flux-capacitor': 'Flux Capacitor',
}

export function createConfiguratorActions(page: Page) {
  const priceElement = page.getByTestId('total-price')
  const carExteriorImage = page.getByTestId('car-exterior-image')
  const colorOptions = {
    'glacier-blue': page.getByTestId('color-option-glacier-blue'),
    'midnight-black': page.getByTestId('color-option-midnight-black'),
    'lunar-white': page.getByTestId('color-option-lunar-white'),
  }
  const wheelOptions = {
    aero: page.getByRole('button', { name: 'Aero Wheels' }),
    sport: page.getByRole('button', { name: 'Sport Wheels' }),
  }
  const optionalOptions = {
    'precision-park': page.getByRole('checkbox', { name: new RegExp(optionalLabels['precision-park']) }),
    'flux-capacitor': page.getByRole('checkbox', { name: new RegExp(optionalLabels['flux-capacitor']) }),
  }
  const checkoutButton = page.getByRole('button', { name: 'Monte o Seu' })

  return {
    elements: {
      priceElement,
      carExteriorImage,
      colorOptions,
      wheelOptions,
      optionalOptions,
      checkoutButton,
    },

    async goto() {
      await page.goto('/configure')
      await expect(priceElement).toBeVisible()
    },

    async selectColor(color: ExteriorColor) {
      await colorOptions[color].click({ force: true })
    },

    async selectWheels(wheelType: WheelType) {
      await wheelOptions[wheelType].click()
    },

    async selectOptional(feature: OptionalFeature) {
      await optionalOptions[feature].check()
    },

    async removeOptional(feature: OptionalFeature) {
      await optionalOptions[feature].uncheck()
    },

    async finishConfigurator() {
      await checkoutButton.click()
      await expect(page).toHaveURL(/\/order$/)
    },

    async validatePrice(price: string) {
      await expect(priceElement).toHaveText(price)
    },

    async validateCarImage(alt: string) {
      await expect(carExteriorImage).toHaveAttribute('alt', alt)
    },

  }
}
