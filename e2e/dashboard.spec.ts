/**
 * E2E tests for Dashboard functionality
 */

import { test, expect } from './fixtures'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ assortmentPage }) => {
    await assortmentPage.goto()
  })

  test.describe('Page Load', () => {
    test('should load the dashboard page', async ({ page, assortmentPage }) => {
      // Dashboard should be the default tab
      await expect(page.getByText('About this Dashboard')).toBeVisible()
    })

    test('should display the page title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /Assortment Optimizer/i })).toBeVisible()
    })

    test('should show the dashboard tab as active', async ({ assortmentPage }) => {
      const isActive = await assortmentPage.isTabActive('Dashboard')
      expect(isActive).toBe(true)
    })
  })

  test.describe('About Section', () => {
    test('should toggle about section when clicking the button', async ({ page, assortmentPage }) => {
      // Initially the expanded content should not be visible
      await expect(page.locator('text=What this shows:')).not.toBeVisible()

      // Click to expand
      await assortmentPage.toggleAboutSection()

      // Now the content should be visible
      await expect(page.locator('text=What this shows:')).toBeVisible()
      await expect(page.locator('text=How to use it:')).toBeVisible()
    })

    test('should show financial performance information', async ({ page, assortmentPage }) => {
      await assortmentPage.toggleAboutSection()

      await expect(page.locator('text=Financial Performance:')).toBeVisible()
      await expect(page.locator('text=Space Productivity:')).toBeVisible()
    })

    test('should collapse about section when clicking again', async ({ page, assortmentPage }) => {
      // Expand
      await assortmentPage.toggleAboutSection()
      await expect(page.locator('text=What this shows:')).toBeVisible()

      // Collapse
      await assortmentPage.toggleAboutSection()
      await expect(page.locator('text=What this shows:')).not.toBeVisible()
    })
  })

  test.describe('Charts', () => {
    test('should render charts on the dashboard', async ({ page, assortmentPage }) => {
      await assortmentPage.waitForCharts()

      const hasCharts = await assortmentPage.hasCharts()
      expect(hasCharts).toBe(true)
    })

    test('should display Weekly Sales Trend chart', async ({ page }) => {
      await expect(page.getByText('Weekly Sales Trend')).toBeVisible()
    })

    test('should display Top SKUs chart', async ({ page }) => {
      await expect(page.getByText(/Top 10 SKUs/)).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('KPI Cards', () => {
    test('should display KPI section', async ({ page, assortmentPage }) => {
      await assortmentPage.waitForDashboardLoad()

      // KPI section should be present with grid layout
      const gridSection = page.locator('.grid').first()
      await expect(gridSection).toBeVisible()
    })
  })

  test.describe('Store Selection', () => {
    test('should have a store selector', async ({ page }) => {
      const storeSelector = page.getByRole('combobox', { name: /store/i })
      await expect(storeSelector).toBeVisible()
    })

    test('should allow selecting a different store', async ({ page, assortmentPage }) => {
      // Click on the store selector
      await page.getByRole('combobox', { name: /store/i }).click()

      // Should show dropdown options
      const options = page.getByRole('option')
      const count = await options.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Subcategory Filter', () => {
    test('should have subcategory filter button', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /subcategories/i })
      await expect(filterButton).toBeVisible()
    })

    test('should open filter dropdown when clicked', async ({ page, assortmentPage }) => {
      await assortmentPage.toggleSubcategoryFilter()

      // Should show checkboxes for subcategories
      const checkboxes = page.getByRole('checkbox')
      const count = await checkboxes.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Responsive Layout', () => {
    test('should display grid layout for charts', async ({ page }) => {
      const grids = page.locator('.grid')
      const count = await grids.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Data Loading', () => {
    test('should load demo data successfully', async ({ page, assortmentPage }) => {
      await assortmentPage.waitForDashboardLoad()

      // Charts should be rendered with data
      await assortmentPage.waitForCharts()
      const hasCharts = await assortmentPage.hasCharts()
      expect(hasCharts).toBe(true)
    })
  })
})
