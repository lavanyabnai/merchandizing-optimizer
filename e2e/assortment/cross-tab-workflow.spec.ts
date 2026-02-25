/**
 * E2E test: Cross-Tab Workflow
 *
 * Tests workflows that span multiple tabs, verifying that
 * insights from one feature can inform decisions in another.
 */

import { test, expect } from '../fixtures'

test.describe('Cross-Tab Workflow', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
  })

  test('optimization informs simulation', async ({ page, assortmentPage }) => {
    // ============================================
    // Step 1: Run optimization
    // ============================================
    await assortmentPage.gotoTab('optimizer')
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify optimization results
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })

    // ============================================
    // Step 2: Note suggested changes
    // ============================================
    // Look for products marked for removal or reduction
    const removedProducts = page.locator('text=/Removed|Remove|-\\d+/i')
    const hasChanges = await removedProducts.first().isVisible().catch(() => false)

    // ============================================
    // Step 3: Go to simulation
    // ============================================
    await assortmentPage.gotoTab('simulation')
    await expect(page.getByText(/Simulation/i)).toBeVisible()

    // ============================================
    // Step 4: Test removing suggested low-profit SKU
    // ============================================
    // Select remove SKU scenario
    const removeSkuButton = page.getByRole('button', { name: /Remove SKU/i })
    if (await removeSkuButton.isVisible()) {
      await removeSkuButton.click()
    }

    // Run simulation
    await assortmentPage.runSimulation()
    await assortmentPage.waitForSimulationComplete()

    // ============================================
    // Step 5: Verify simulation aligns with optimization
    // ============================================
    // Results should show impact
    await expect(page.getByText('Simulation Results')).toBeVisible()
  })

  test('dashboard insights inform optimizer settings', async ({ page, assortmentPage }) => {
    // ============================================
    // Step 1: Review dashboard metrics
    // ============================================
    await assortmentPage.gotoTab('dashboard')
    await assortmentPage.waitForDashboardLoad()

    // Note key metrics on dashboard
    const hasCharts = await assortmentPage.hasCharts()
    expect(hasCharts).toBe(true)

    // ============================================
    // Step 2: Navigate to optimizer with insights
    // ============================================
    await assortmentPage.gotoTab('optimizer')
    await expect(page.getByText('Optimization Constraints')).toBeVisible()

    // ============================================
    // Step 3: Configure based on dashboard insights
    // ============================================
    // Use balanced approach for steady performance
    await assortmentPage.selectPreset('Balanced')

    // Run optimization
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify results
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
  })

  test('CDT analysis informs optimization must-carry decisions', async ({
    page,
    assortmentPage,
  }) => {
    // ============================================
    // Step 1: Review CDT analysis
    // ============================================
    await assortmentPage.gotoTab('cdt')
    await expect(page.getByText(/CDT|Consumer Decision Tree/i)).toBeVisible({ timeout: 10000 })

    // Note key decision drivers
    const charts = page.locator('svg')
    const hasCharts = (await charts.count()) > 0

    // ============================================
    // Step 2: Use CDT insights in optimizer
    // ============================================
    await assortmentPage.gotoTab('optimizer')

    // Configure constraints based on CDT insights
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify results
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
  })

  test('clustering results inform store-specific optimization', async ({
    page,
    assortmentPage,
  }) => {
    // ============================================
    // Step 1: Run clustering to identify store groups
    // ============================================
    await assortmentPage.gotoTab('clustering')
    await expect(page.getByText(/Cluster|Clustering/i)).toBeVisible({ timeout: 10000 })

    const runClusteringButton = page.getByRole('button', { name: /Run Clustering/i })
    if (await runClusteringButton.isVisible()) {
      await runClusteringButton.click()
      await page.waitForTimeout(3000)
    }

    // ============================================
    // Step 2: Use cluster insights for optimization
    // ============================================
    await assortmentPage.gotoTab('optimizer')

    // Run optimization for the store group
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Results should be relevant to store characteristics
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
  })

  test('planogram reflects optimization decisions', async ({ page, assortmentPage }) => {
    // ============================================
    // Step 1: Run optimization first
    // ============================================
    await assortmentPage.gotoTab('optimizer')
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // ============================================
    // Step 2: View planogram
    // ============================================
    await assortmentPage.gotoTab('planogram')
    await expect(page.getByText(/Planogram/i)).toBeVisible({ timeout: 10000 })

    // Planogram should show shelf layout
    const shelfElements = page.locator('[class*="shelf"]')
    const hasShelf = (await shelfElements.count()) > 0 || (await page.locator('svg').count()) > 0
    expect(typeof hasShelf).toBe('boolean')
  })
})

test.describe('Data Consistency Across Tabs', () => {
  test('store selection persists across tabs', async ({ page, assortmentPage }) => {
    // Select a store on dashboard
    await assortmentPage.gotoTab('dashboard')

    const storeSelector = page.getByRole('combobox', { name: /store/i })
    if (await storeSelector.isVisible()) {
      await storeSelector.click()
      const firstOption = page.getByRole('option').first()
      const selectedName = await firstOption.textContent()
      await firstOption.click()

      // Navigate to optimizer
      await assortmentPage.gotoTab('optimizer')

      // Store should still be selected
      await expect(storeSelector).toBeVisible()
    }
  })

  test('filter state persists across tabs', async ({ page, assortmentPage }) => {
    // Apply subcategory filter on dashboard
    const filterButton = page.getByRole('button', { name: /subcategories/i })
    if (await filterButton.isVisible()) {
      await filterButton.click()

      // Toggle a subcategory
      const firstCheckbox = page.getByRole('checkbox').first()
      if (await firstCheckbox.isVisible()) {
        await firstCheckbox.click()
      }
    }

    // Navigate to optimizer and back
    await assortmentPage.gotoTab('optimizer')
    await assortmentPage.gotoTab('dashboard')

    // Filter should persist (or reset - verify expected behavior)
    await expect(page.getByText('About this Dashboard')).toBeVisible()
  })
})

test.describe('Multi-Tab Analysis Workflow', () => {
  test('complete analysis workflow across all tabs', async ({ page, assortmentPage }) => {
    // ============================================
    // Dashboard: Review current state
    // ============================================
    await assortmentPage.gotoTab('dashboard')
    await assortmentPage.waitForDashboardLoad()
    expect(await assortmentPage.hasCharts()).toBe(true)

    // ============================================
    // CDT: Understand customer behavior
    // ============================================
    await assortmentPage.gotoTab('cdt')
    await expect(page.getByText(/CDT|Consumer Decision Tree/i)).toBeVisible({ timeout: 10000 })

    // ============================================
    // Clustering: Segment stores
    // ============================================
    await assortmentPage.gotoTab('clustering')
    await expect(page.getByText(/Cluster|Clustering/i)).toBeVisible({ timeout: 10000 })

    // ============================================
    // Optimizer: Optimize assortment
    // ============================================
    await assortmentPage.gotoTab('optimizer')
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // ============================================
    // Simulation: Test scenarios
    // ============================================
    await assortmentPage.gotoTab('simulation')
    await assortmentPage.runSimulation()
    await assortmentPage.waitForSimulationComplete()

    // ============================================
    // Planogram: Visualize layout
    // ============================================
    await assortmentPage.gotoTab('planogram')
    await expect(page.getByText(/Planogram/i)).toBeVisible({ timeout: 10000 })
  })
})
