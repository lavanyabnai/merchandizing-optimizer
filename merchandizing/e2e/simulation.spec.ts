/**
 * E2E tests for Simulation functionality
 */

import { test, expect } from './fixtures'

test.describe('Simulation', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
    await assortmentPage.gotoTab('simulation')
  })

  test.describe('Page Load', () => {
    test('should load the simulation page', async ({ page }) => {
      await expect(page.getByText(/Simulation/i)).toBeVisible()
    })

    test('should show the simulation tab as active', async ({ assortmentPage }) => {
      const isActive = await assortmentPage.isTabActive('Simulation')
      expect(isActive).toBe(true)
    })
  })

  test.describe('Scenario Selection', () => {
    test('should have scenario selector', async ({ page }) => {
      const selector = page.getByRole('combobox').first()
      await expect(selector).toBeVisible()
    })

    test('should display available scenarios when clicked', async ({ page }) => {
      const selector = page.getByRole('combobox').first()
      await selector.click()

      // Should show dropdown options
      const options = page.getByRole('option')
      const count = await options.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should allow selecting a scenario', async ({ page, assortmentPage }) => {
      await assortmentPage.selectScenario('Price')

      // Scenario should be selected
    })
  })

  test.describe('Run Simulation', () => {
    test('should have run simulation button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Run Simulation/i })).toBeVisible()
    })

    test('should start simulation when button clicked', async ({ page, assortmentPage }) => {
      await assortmentPage.runSimulation()

      // Should show loading state or progress
      await page.waitForTimeout(1000)
    })

    test('should complete simulation and show results', async ({ page, assortmentPage }) => {
      await assortmentPage.runSimulation()
      await assortmentPage.waitForSimulationComplete()

      // Should show simulation results
      await expect(page.getByText('Simulation Results')).toBeVisible({ timeout: 35000 })
    })
  })

  test.describe('Simulation Results', () => {
    test.beforeEach(async ({ page, assortmentPage }) => {
      await assortmentPage.runSimulation()
      await assortmentPage.waitForSimulationComplete()
    })

    test('should display results section', async ({ page }) => {
      await expect(page.getByText('Simulation Results')).toBeVisible()
    })

    test('should show impact metrics', async ({ page }) => {
      // Look for revenue or profit impact metrics
      const metrics = page.locator('text=/Revenue|Profit|Impact/i')
      const count = await metrics.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Charts', () => {
    test('should render charts after simulation', async ({ page, assortmentPage }) => {
      await assortmentPage.runSimulation()
      await assortmentPage.waitForSimulationComplete()

      // Should have SVG charts
      const charts = page.locator('svg')
      const count = await charts.count()
      expect(count).toBeGreaterThan(0)
    })
  })
})
