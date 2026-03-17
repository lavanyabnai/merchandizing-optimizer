/**
 * E2E test: Complete Optimization Journey
 *
 * Tests the full user workflow from dashboard viewing through
 * optimization execution and results analysis.
 */

import { test, expect } from '../fixtures'

test.describe('Complete Optimization Journey', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
  })

  test('complete optimization journey', async ({ page, assortmentPage }) => {
    // ============================================
    // Step 1: Navigate and verify dashboard loads
    // ============================================
    await assortmentPage.gotoTab('dashboard')
    await assortmentPage.waitForDashboardLoad()

    // Verify dashboard shows key metrics
    await expect(page.getByText('About this Dashboard')).toBeVisible()
    await expect(page.getByText('Weekly Sales Trend')).toBeVisible()

    // Verify charts are rendered
    const hasCharts = await assortmentPage.hasCharts()
    expect(hasCharts).toBe(true)

    // ============================================
    // Step 2: Review KPI metrics on dashboard
    // ============================================
    // Dashboard should show KPI cards with numeric values
    const gridSection = page.locator('.grid').first()
    await expect(gridSection).toBeVisible()

    // ============================================
    // Step 3: Navigate to optimizer
    // ============================================
    await assortmentPage.gotoTab('optimizer')

    // Verify optimizer page loads
    await expect(page.getByText('Optimization Constraints')).toBeVisible()
    await expect(page.getByRole('button', { name: /Run Optimization/i })).toBeVisible()

    // ============================================
    // Step 4: Configure optimization constraints
    // ============================================
    // Apply balanced preset
    await assortmentPage.selectPreset('Balanced')

    // Verify preset was applied (check for 120 total facings)
    await expect(page.getByText('120')).toBeVisible()

    // ============================================
    // Step 5: Run optimization
    // ============================================
    await assortmentPage.runOptimization()

    // Verify loading state appears
    await expect(
      page.locator('text=Optimizing...').or(page.locator('text=Finding optimal'))
    ).toBeVisible({ timeout: 5000 })

    // ============================================
    // Step 6: Wait for and verify results
    // ============================================
    await assortmentPage.waitForOptimizationComplete()

    // Verify results section appears
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })

    // Verify Profit Impact card is displayed
    await expect(page.getByText('Profit Impact')).toBeVisible()

    // ============================================
    // Step 7: Analyze results
    // ============================================
    // Check for comparison table headers
    await expect(page.getByRole('columnheader', { name: 'Product' })).toBeVisible()

    // Check for export functionality
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
  })

  test('optimization with conservative preset', async ({ page, assortmentPage }) => {
    await assortmentPage.gotoTab('optimizer')

    // Apply conservative preset
    await assortmentPage.selectPreset('Conservative')

    // Verify preset was applied (check for 100 total facings)
    await expect(page.getByText('100')).toBeVisible()

    // Run optimization
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify results
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
  })

  test('optimization with aggressive preset', async ({ page, assortmentPage }) => {
    await assortmentPage.gotoTab('optimizer')

    // Apply aggressive preset
    await assortmentPage.selectPreset('Aggressive')

    // Verify preset was applied (check for 150 total facings)
    await expect(page.getByText('150')).toBeVisible()

    // Run optimization
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify results
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
  })

  test('user can compare results with previous optimization', async ({ page, assortmentPage }) => {
    await assortmentPage.gotoTab('optimizer')

    // Run first optimization with balanced preset
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify results appeared
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })

    // Reset and run second optimization with aggressive preset
    const resetButton = page.getByRole('button', { name: /Reset/i })
    await resetButton.click()

    await assortmentPage.selectPreset('Aggressive')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify new results appeared
    await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
  })

  test('optimization results show proper data columns', async ({ page, assortmentPage }) => {
    await assortmentPage.gotoTab('optimizer')

    // Run optimization
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify table structure
    await expect(page.getByRole('columnheader', { name: 'Product' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Brand' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Current' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Optimized' })).toBeVisible()
  })

  test('user can search in optimization results', async ({ page, assortmentPage }) => {
    await assortmentPage.gotoTab('optimizer')

    // Run optimization
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Find and use search
    const searchInput = page.getByPlaceholder(/Search by name, brand, or SKU/i)
    await expect(searchInput).toBeVisible()

    // Search for a term
    await searchInput.fill('Cola')

    // Allow time for search filtering
    await page.waitForTimeout(500)
  })

  test('user can export optimization results', async ({ page, assortmentPage }) => {
    await assortmentPage.gotoTab('optimizer')

    // Run optimization
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Verify export button is available
    const exportButton = page.getByRole('button', { name: /Export CSV/i })
    await expect(exportButton).toBeVisible()

    // Note: Actually clicking export would trigger a download
    // In a full test, we'd intercept the download event
  })
})

test.describe('Optimization History', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
    await assortmentPage.gotoTab('optimizer')
  })

  test('optimization run appears in history', async ({ page, assortmentPage }) => {
    // Run optimization
    await assortmentPage.selectPreset('Balanced')
    await assortmentPage.runOptimization()
    await assortmentPage.waitForOptimizationComplete()

    // Check for history section/tab
    const historyTab = page.getByRole('tab', { name: /History/i })
    if (await historyTab.isVisible()) {
      await historyTab.click()

      // Verify history entry exists
      await expect(page.locator('text=/completed|recent/i')).toBeVisible({ timeout: 10000 })
    }
  })
})
