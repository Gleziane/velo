import { test as base, expect } from '@playwright/test'

import { createLandingActions } from './actions/landingActions'
import { createNavbarActions } from './actions/navbarActions'
import { createOrderLookupActions } from './actions/orderLookupActions'

type App = {
  landing: ReturnType<typeof createLandingActions>
  navbar: ReturnType<typeof createNavbarActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      landing: createLandingActions(page),
      navbar: createNavbarActions(page),
      orderLookup: createOrderLookupActions(page),
    }

    await use(app)
  },
})

export { expect }
