import { test as base, expect } from '@playwright/test'

import { createLandingActions } from './actions/landingActions'
import { createNavbarActions } from './actions/navbarActions'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createSuccessActions } from './actions/successActions'

type App = {
  landing: ReturnType<typeof createLandingActions>
  navbar: ReturnType<typeof createNavbarActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
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
    }

    await use(app)
  },
})

export { expect }
