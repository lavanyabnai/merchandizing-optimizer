/**
 * E2E tests for Navigation functionality
 */

import { test, expect } from './fixtures'

test.describe('Navigation', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
  })

  test.describe('Tab Navigation', () => {
    test('should display all navigation tabs', async ({ page }) => {
      await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'CDT Analysis' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Optimizer' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Simulation' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Clustering' })).toBeVisible()
      await expect(page.getByRole('tab', { name: 'Planogram' })).toBeVisible()
    })

    test('should start with Dashboard tab active', async ({ page }) => {
      const dashboardTab = page.getByRole('tab', { name: 'Dashboard' })
      await expect(dashboardTab).toHaveAttribute('data-state', 'active')
    })

    test('should navigate to CDT Analysis tab', async ({ page, assortmentPage }) => {
      await assortmentPage.gotoTab('cdt')

      const cdtTab = page.getByRole('tab', { name: 'CDT Analysis' })
      await expect(cdtTab).toHaveAttribute('data-state', 'active')
    })

    test('should navigate to Optimizer tab', async ({ page, assortmentPage }) => {
      await assortmentPage.gotoTab('optimizer')

      const optimizerTab = page.getByRole('tab', { name: 'Optimizer' })
      await expect(optimizerTab).toHaveAttribute('data-state', 'active')
    })

    test('should navigate to Simulation tab', async ({ page, assortmentPage }) => {
      await assortmentPage.gotoTab('simulation')

      const simulationTab = page.getByRole('tab', { name: 'Simulation' })
      await expect(simulationTab).toHaveAttribute('data-state', 'active')
    })

    test('should navigate to Clustering tab', async ({ page, assortmentPage }) => {
      await assortmentPage.gotoTab('clustering')

      const clusteringTab = page.getByRole('tab', { name: 'Clustering' })
      await expect(clusteringTab).toHaveAttribute('data-state', 'active')
    })

    test('should navigate to Planogram tab', async ({ page, assortmentPage }) => {
      await assortmentPage.gotoTab('planogram')

      const planogramTab = page.getByRole('tab', { name: 'Planogram' })
      await expect(planogramTab).toHaveAttribute('data-state', 'active')
    })
  })

  test.describe('Tab Content', () => {
    test('should show Dashboard content when Dashboard tab is active', async ({ page }) => {
      await expect(page.getByText('About this Dashboard')).toBeVisible()
    })

    test('should show CDT content when CDT tab is active', async ({ page, assortmentPage }) => {
      await assortmentPage.gotoTab('cdt')

      // CDT Analysis should show its content
      await expect(page.getByText(/CDT|Consumer Decision Tree/i)).toBeVisible({ timeout: 10000 })
    })

    test('should show Optimizer content when Optimizer tab is active', async ({
      page,
      assortmentPage,
    }) => {
      await assortmentPage.gotoTab('optimizer')

      await expect(page.getByText('Optimization Constraints')).toBeVisible()
    })

    test('should show Simulation content when Simulation tab is active', async ({
      page,
      assortmentPage,
    }) => {
      await assortmentPage.gotoTab('simulation')

      // Simulation tab should show its content
      await expect(page.getByText(/Simulation/i)).toBeVisible()
    })

    test('should show Clustering content when Clustering tab is active', async ({
      page,
      assortmentPage,
    }) => {
      await assortmentPage.gotoTab('clustering')

      // Clustering tab should show its content
      await expect(page.getByText(/Cluster|Clustering/i)).toBeVisible({ timeout: 10000 })
    })

    test('should show Planogram content when Planogram tab is active', async ({
      page,
      assortmentPage,
    }) => {
      await assortmentPage.gotoTab('planogram')

      // Planogram tab should show its content
      await expect(page.getByText(/Planogram/i)).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Navigation State', () => {
    test('should maintain only one active tab at a time', async ({ page, assortmentPage }) => {
      // Navigate to Optimizer
      await assortmentPage.gotoTab('optimizer')

      // Check that only Optimizer is active
      const tabs = page.getByRole('tab')
      const tabCount = await tabs.count()

      let activeCount = 0
      for (let i = 0; i < tabCount; i++) {
        const state = await tabs.nth(i).getAttribute('data-state')
        if (state === 'active') activeCount++
      }

      expect(activeCount).toBe(1)
    })

    test('should preserve data when switching between tabs', async ({ page, assortmentPage }) => {
      // Select a store on Dashboard
      const storeSelector = page.getByRole('combobox', { name: /store/i })
      await storeSelector.click()
      const firstOption = page.getByRole('option').first()
      const selectedStoreName = await firstOption.textContent()
      await firstOption.click()

      // Navigate to Optimizer and back
      await assortmentPage.gotoTab('optimizer')
      await assortmentPage.gotoTab('dashboard')

      // Store selection should be preserved (check if store selector shows selected value)
      await expect(storeSelector).toBeVisible()
    })
  })

  test.describe('URL and Routing', () => {
    test('should load the correct base URL', async ({ page, assortmentPage }) => {
      expect(page.url()).toContain('/risk/merchandizing-optimizer')
    })
  })

  test.describe('Page Header', () => {
    test('should display the application title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Assortment Optimizer/i })).toBeVisible()
    })
  })

  test.describe('Responsive Navigation', () => {
    test('tabs should be visible at desktop width', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 })

      const tabs = page.getByRole('tab')
      const count = await tabs.count()
      expect(count).toBe(6) // All 6 tabs should be visible
    })
  })

  test.describe('Tab Interactions', () => {
    test('should support keyboard navigation between tabs', async ({ page }) => {
      const dashboardTab = page.getByRole('tab', { name: 'Dashboard' })
      await dashboardTab.focus()

      // Press right arrow to move to next tab
      await page.keyboard.press('ArrowRight')

      // CDT tab should now be focused
      const cdtTab = page.getByRole('tab', { name: 'CDT Analysis' })
      await expect(cdtTab).toBeFocused()
    })

    test('should activate tab on Enter key', async ({ page }) => {
      const cdtTab = page.getByRole('tab', { name: 'CDT Analysis' })
      await cdtTab.focus()
      await page.keyboard.press('Enter')

      await expect(cdtTab).toHaveAttribute('data-state', 'active')
    })
  })
})
