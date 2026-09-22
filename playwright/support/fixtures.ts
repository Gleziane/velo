import { test as base, expect } from '@playwright/test'

import { createLandingActions } from './actions/landingActions'
import { createNavbarActions } from './actions/navbarActions'
import { createOrderLookupActions } from './actions/orderLookupActions'

import { mockCreditAnalysis } from './mock.api'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createSuccessActions } from './actions/successActions'

type App = {
  landing: ReturnType<typeof createLandingActions>
  navbar: ReturnType<typeof createNavbarActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
  mock: {
    creditAnalysis: (score: number) => Promise<void>
  }
  success: ReturnType<typeof createSuccessActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      landing: createLandingActions(page),
      navbar: createNavbarActions(page),
      orderLookup: createOrderLookupActions(page),
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      success: createSuccessActions(page),
      mock: {
        creditAnalysis: async (score: number) => {
          await mockCreditAnalysis(page, score)
        },
      },

    }

    await use(app)
  },
})

export { expect }
