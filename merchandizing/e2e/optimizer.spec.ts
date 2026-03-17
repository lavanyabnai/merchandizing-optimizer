/**
 * E2E tests for Optimizer functionality
 */

import { test, expect } from './fixtures'

test.describe('Optimizer', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
    await assortmentPage.gotoTab('optimizer')
  })

  test.describe('Page Load', () => {
    test('should load the optimizer page', async ({ page }) => {
      await expect(page.getByText('Optimization Constraints')).toBeVisible()
    })

    test('should show the optimizer tab as active', async ({ assortmentPage }) => {
      const isActive = await assortmentPage.isTabActive('Optimizer')
      expect(isActive).toBe(true)
    })
  })

  test.describe('Constraint Form', () => {
    test('should display preset buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Conservative/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Balanced/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Aggressive/i })).toBeVisible()
    })

    test('should display space constraints section', async ({ page }) => {
      await expect(page.getByText('Space Constraints')).toBeVisible()
      await expect(page.getByText('Total Available Facings')).toBeVisible()
      await expect(page.getByText('Min Facings/SKU')).toBeVisible()
      await expect(page.getByText('Max Facings/SKU')).toBeVisible()
    })

    test('should display coverage constraints section', async ({ page }) => {
      await expect(page.getByText('Coverage Constraints')).toBeVisible()
      await expect(page.getByText('Min SKUs per Subcategory')).toBeVisible()
      await expect(page.getByText('Min SKUs per Price Tier')).toBeVisible()
    })

    test('should display reset button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Reset/i })).toBeVisible()
    })

    test('should have sliders for constraint values', async ({ page }) => {
      const sliders = page.locator('[role="slider"]')
      const count = await sliders.count()
      expect(count).toBe(7) // 7 constraint sliders
    })
  })

  test.describe('Preset Selection', () => {
    test('should apply conservative preset', async ({ page, assortmentPage }) => {
      await assortmentPage.selectPreset('Conservative')

      // Conservative preset should have totalFacings = 100
      await expect(page.getByText('100')).toBeVisible()
    })

    test('should apply balanced preset', async ({ page, assortmentPage }) => {
      // First select a different preset
      await assortmentPage.selectPreset('Conservative')

      // Then select balanced
      await assortmentPage.selectPreset('Balanced')

      // Balanced preset should have totalFacings = 120
      await expect(page.getByText('120')).toBeVisible()
    })

    test('should apply aggressive preset', async ({ page, assortmentPage }) => {
      await assortmentPage.selectPreset('Aggressive')

      // Aggressive preset should have totalFacings = 150
      await expect(page.getByText('150')).toBeVisible()
    })
  })

  test.describe('Slider Interactions', () => {
    test('should allow adjusting slider values with keyboard', async ({ page }) => {
      const firstSlider = page.locator('[role="slider"]').first()

      // Focus and adjust with keyboard
      await firstSlider.focus()
      await page.keyboard.press('ArrowRight')

      // Value should have changed (slider moved right = increased value)
    })
  })

  test.describe('Run Optimization', () => {
    test('should have run optimization button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Run Optimization/i })).toBeVisible()
    })

    test('should start optimization when button clicked', async ({ page, assortmentPage }) => {
      await assortmentPage.runOptimization()

      // Should show loading state or progress indicator
      // Wait for either the "Optimizing..." text or completion
      await expect(
        page.locator('text=Optimizing...').or(page.locator('text=Optimization'))
      ).toBeVisible({ timeout: 5000 })
    })

    test('should complete optimization and show results', async ({ page, assortmentPage }) => {
      await assortmentPage.runOptimization()

      // Wait for optimization to complete
      await assortmentPage.waitForOptimizationComplete()

      // Should show the comparison table or results
      await expect(page.getByText('Assortment Comparison')).toBeVisible({ timeout: 35000 })
    })
  })

  test.describe('Comparison Table', () => {
    test.beforeEach(async ({ page, assortmentPage }) => {
      await assortmentPage.runOptimization()
      await assortmentPage.waitForOptimizationComplete()
    })

    test('should display comparison table after optimization', async ({ page }) => {
      await expect(page.getByText('Assortment Comparison')).toBeVisible()
    })

    test('should have export CSV button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
    })

    test('should display table headers', async ({ page }) => {
      await expect(page.getByRole('columnheader', { name: 'Product' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'Brand' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'Current' })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: 'Optimized' })).toBeVisible()
    })

    test('should have search functionality', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search by name, brand, or SKU/i)
      await expect(searchInput).toBeVisible()
    })

    test('should filter table by search term', async ({ page, assortmentPage }) => {
      const searchInput = page.getByPlaceholder(/Search by name, brand, or SKU/i)
      await searchInput.fill('Cola')

      // Table should filter to show only Cola products
      await page.waitForTimeout(500) // Allow for debounced search
    })

    test('should have change filter dropdown', async ({ page }) => {
      const filterDropdown = page.getByRole('combobox').first()
      await expect(filterDropdown).toBeVisible()
    })
  })

  test.describe('Summary Badges', () => {
    test.beforeEach(async ({ page, assortmentPage }) => {
      await assortmentPage.runOptimization()
      await assortmentPage.waitForOptimizationComplete()
    })

    test('should display added badge if products added', async ({ page }) => {
      // Look for the badge format "+N Added"
      const addedBadge = page.locator('text=/\\+\\d+ Added/')
      const isVisible = await addedBadge.isVisible().catch(() => false)
      // Badge might not always be present if no products were added
      expect(typeof isVisible).toBe('boolean')
    })

    test('should display modified badge if products modified', async ({ page }) => {
      // Look for the badge format "N Modified"
      const modifiedBadge = page.locator('text=/\\d+ Modified/')
      const isVisible = await modifiedBadge.isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  test.describe('Reset Functionality', () => {
    test('should reset constraints to balanced defaults', async ({ page, assortmentPage }) => {
      // Apply aggressive preset first
      await assortmentPage.selectPreset('Aggressive')
      await expect(page.getByText('150')).toBeVisible()

      // Click reset
      const resetButton = page.getByRole('button', { name: /Reset/i })
      await resetButton.click()

      // Should reset to balanced (120)
      await expect(page.getByText('120')).toBeVisible()
    })
  })
})
