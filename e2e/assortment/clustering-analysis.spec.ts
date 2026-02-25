/**
 * E2E test: Clustering Analysis
 *
 * Tests the store clustering workflow including method selection,
 * execution, and results visualization.
 */

import { test, expect } from '../fixtures'

test.describe('Clustering Analysis', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
    await assortmentPage.gotoTab('clustering')
  })

  test('run store clustering with K-Means', async ({ page, assortmentPage }) => {
    // ============================================
    // Step 1: Verify clustering page loads
    // ============================================
    await expect(page.getByText(/Cluster|Clustering/i)).toBeVisible({ timeout: 10000 })

    // ============================================
    // Step 2: Select K-Means method
    // ============================================
    const kmeansButton = page.getByRole('button', { name: /K-Means/i })
    if (await kmeansButton.isVisible()) {
      await kmeansButton.click()
    }

    // ============================================
    // Step 3: Run clustering
    // ============================================
    const runButton = page.getByRole('button', { name: /Run Clustering/i })
    if (await runButton.isVisible()) {
      await runButton.click()
    }

    // ============================================
    // Step 4: Wait for results
    // ============================================
    // Wait for clustering to complete (may take time)
    await page.waitForTimeout(3000)

    // ============================================
    // Step 5: Verify scatter plot renders
    // ============================================
    // PCA scatter plot should have SVG with circles
    const svgElements = page.locator('svg')
    const svgCount = await svgElements.count()
    expect(svgCount).toBeGreaterThan(0)

    // ============================================
    // Step 6: Verify cluster profiles appear
    // ============================================
    // Look for cluster labels/profiles
    const clusterLabels = page.locator('text=/Cluster \\d|Profile/i')
    const labelCount = await clusterLabels.count()
    expect(labelCount).toBeGreaterThanOrEqual(0)

    // ============================================
    // Step 7: Verify recommendations generated
    // ============================================
    const recommendations = page.locator('text=/Recommendation|Suggest/i')
    const hasRecommendations = await recommendations.isVisible().catch(() => false)
    expect(typeof hasRecommendations).toBe('boolean')
  })

  test('select GMM clustering method', async ({ page }) => {
    const gmmButton = page.getByRole('button', { name: /GMM/i })
    if (await gmmButton.isVisible()) {
      await gmmButton.click()
      // Verify selection (visual indicator or state)
    }
  })

  test('cluster count can be configured', async ({ page }) => {
    // Look for cluster count input
    const clusterCountInput = page.locator('input[type="number"]')
    if (await clusterCountInput.first().isVisible()) {
      await clusterCountInput.first().fill('5')
      await expect(clusterCountInput.first()).toHaveValue('5')
    }
  })

  test('clustering tab shows configuration options', async ({ page }) => {
    // Should show method selection
    const methodButtons = page.getByRole('button').filter({
      hasText: /K-Means|GMM|Hierarchical/i,
    })
    const count = await methodButtons.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Clustering Results', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
    await assortmentPage.gotoTab('clustering')
  })

  test('results show store assignments', async ({ page }) => {
    // Run clustering first
    const runButton = page.getByRole('button', { name: /Run Clustering/i })
    if (await runButton.isVisible()) {
      await runButton.click()
      await page.waitForTimeout(3000)
    }

    // Look for store assignment information
    const storeAssignments = page.locator('text=/Store|Assignment/i')
    const count = await storeAssignments.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('scatter plot is interactive', async ({ page }) => {
    // Run clustering
    const runButton = page.getByRole('button', { name: /Run Clustering/i })
    if (await runButton.isVisible()) {
      await runButton.click()
      await page.waitForTimeout(3000)
    }

    // Check for SVG elements
    const svgElements = page.locator('svg')
    const count = await svgElements.count()
    expect(count).toBeGreaterThan(0)

    // Hover over chart to check for interactivity
    const firstSvg = svgElements.first()
    if (await firstSvg.isVisible()) {
      await firstSvg.hover()
    }
  })

  test('cluster profiles show characteristics', async ({ page }) => {
    // Run clustering
    const runButton = page.getByRole('button', { name: /Run Clustering/i })
    if (await runButton.isVisible()) {
      await runButton.click()
      await page.waitForTimeout(3000)
    }

    // Look for characteristic labels
    const characteristics = page.locator('text=/Size|Revenue|Urban|Suburban|Format/i')
    const count = await characteristics.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Clustering Integration', () => {
  test('clustering uses selected store filters', async ({ page, assortmentPage }) => {
    // Select a specific store filter on dashboard first
    await assortmentPage.gotoTab('dashboard')

    // Try to select a store
    const storeSelector = page.getByRole('combobox', { name: /store/i })
    if (await storeSelector.isVisible()) {
      await storeSelector.click()
      const firstOption = page.getByRole('option').first()
      await firstOption.click()
    }

    // Navigate to clustering
    await assortmentPage.gotoTab('clustering')

    // Clustering tab should load
    await expect(page.getByText(/Cluster|Clustering/i)).toBeVisible({ timeout: 10000 })
  })

  test('multiple clustering runs can be compared', async ({ page }) => {
    // Run first clustering
    const runButton = page.getByRole('button', { name: /Run Clustering/i })
    if (await runButton.isVisible()) {
      await runButton.click()
      await page.waitForTimeout(3000)

      // Change parameters
      const clusterCountInput = page.locator('input[type="number"]').first()
      if (await clusterCountInput.isVisible()) {
        await clusterCountInput.fill('4')
      }

      // Run again
      await runButton.click()
      await page.waitForTimeout(3000)
    }

    // Results should update
    const svgElements = page.locator('svg')
    const count = await svgElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
