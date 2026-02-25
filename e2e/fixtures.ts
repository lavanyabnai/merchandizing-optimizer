/**
 * Playwright test fixtures and helpers for E2E tests
 */

import { test as base, expect, type Page, type BrowserContext } from '@playwright/test'

// Simulation result type
export interface SimulationResult {
  scenarioType: string
  revenueImpact: number
  profitImpact: number
  confidenceInterval: { lower: number; upper: number }
}

// Optimization result type
export interface OptimizationResult {
  profitLift: number
  profitLiftPct: number
  addedSkus: number
  removedSkus: number
  modifiedSkus: number
}

// Custom test fixture types
interface AssortmentFixtures {
  assortmentPage: AssortmentPage
  authenticatedPage: Page
}

/**
 * Page Object Model for Assortment Optimizer
 */
export class AssortmentPage {
  constructor(private page: Page) {}

  // URLs
  readonly baseUrl = '/risk/merchandizing-optimizer'

  // Navigation methods
  async goto() {
    await this.page.goto(this.baseUrl)
    await this.page.waitForLoadState('networkidle')
  }

  async gotoTab(tab: 'dashboard' | 'cdt' | 'optimizer' | 'simulation' | 'clustering' | 'planogram') {
    const tabMap: Record<string, string> = {
      dashboard: 'Dashboard',
      cdt: 'CDT Analysis',
      optimizer: 'Optimizer',
      simulation: 'Simulation',
      clustering: 'Clustering',
      planogram: 'Planogram',
    }
    await this.page.getByRole('tab', { name: tabMap[tab] }).click()
    await this.page.waitForLoadState('networkidle')
  }

  // Store selector methods
  async selectStore(storeName: string) {
    await this.page.getByRole('combobox', { name: /store/i }).click()
    await this.page.getByRole('option', { name: storeName }).click()
  }

  async getSelectedStore(): Promise<string> {
    const combobox = this.page.getByRole('combobox', { name: /store/i })
    return await combobox.textContent() ?? ''
  }

  // Subcategory filter methods
  async toggleSubcategoryFilter() {
    await this.page.getByRole('button', { name: /subcategories/i }).click()
  }

  async selectSubcategory(subcategory: string) {
    await this.toggleSubcategoryFilter()
    await this.page.getByRole('checkbox', { name: subcategory }).click()
  }

  // Dashboard methods
  async waitForDashboardLoad() {
    await this.page.waitForSelector('text=Weekly Sales Trend', { timeout: 10000 })
  }

  async getKPIValue(title: string): Promise<string | null> {
    const card = this.page.locator(`text=${title}`).locator('..')
    const value = await card.locator('p').first().textContent()
    return value
  }

  // Optimizer methods
  async selectPreset(preset: 'Conservative' | 'Balanced' | 'Aggressive') {
    await this.page.getByRole('button', { name: preset }).click()
  }

  async runOptimization() {
    await this.page.getByRole('button', { name: /run optimization/i }).click()
  }

  async waitForOptimizationComplete() {
    await this.page.waitForSelector('text=Optimization completed', { timeout: 30000 })
  }

  async isOptimizing(): Promise<boolean> {
    return await this.page.locator('text=Optimizing...').isVisible()
  }

  // Simulation methods
  async selectScenario(scenario: string) {
    await this.page.getByRole('combobox').first().click()
    await this.page.getByRole('option', { name: new RegExp(scenario, 'i') }).click()
  }

  async runSimulation() {
    await this.page.getByRole('button', { name: /run simulation/i }).click()
  }

  async waitForSimulationComplete() {
    await this.page.waitForSelector('text=Simulation Results', { timeout: 30000 })
  }

  // About section methods
  async toggleAboutSection() {
    await this.page.getByRole('button', { name: /about/i }).click()
  }

  async isAboutSectionVisible(): Promise<boolean> {
    return await this.page.locator('text=What this shows:').isVisible()
  }

  // Chart methods
  async hasCharts(): Promise<boolean> {
    const svgs = await this.page.locator('svg').count()
    return svgs > 0
  }

  // Tab methods
  async getActiveTab(): Promise<string | null> {
    const activeTab = this.page.locator('[data-state="active"][role="tab"]')
    return await activeTab.textContent()
  }

  async isTabActive(tabName: string): Promise<boolean> {
    const tab = this.page.getByRole('tab', { name: tabName })
    const state = await tab.getAttribute('data-state')
    return state === 'active'
  }

  // Export methods
  async clickExportCSV() {
    await this.page.getByRole('button', { name: /export csv/i }).click()
  }

  // Table methods
  async getTableRowCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').count()
    return rows
  }

  async searchInTable(query: string) {
    const searchInput = this.page.getByPlaceholder(/search/i)
    await searchInput.fill(query)
  }

  // Wait helpers
  async waitForCharts() {
    await this.page.waitForSelector('svg', { timeout: 10000 })
  }

  async waitForTable() {
    await this.page.waitForSelector('table', { timeout: 10000 })
  }

  // ============================================================
  // Enhanced methods for complete user journeys
  // ============================================================

  // Constraint methods
  async setConstraint(name: string, value: number) {
    // Find slider by associated label text
    const sliderSection = this.page.locator(`text=${name}`).locator('..')
    const slider = sliderSection.locator('[role="slider"]')

    // Set slider value via keyboard
    await slider.focus()
    // Calculate steps needed (simplified - real implementation may need adjustment)
    const currentValue = await slider.getAttribute('aria-valuenow')
    const current = parseInt(currentValue ?? '0', 10)
    const steps = value - current

    for (let i = 0; i < Math.abs(steps); i++) {
      await this.page.keyboard.press(steps > 0 ? 'ArrowRight' : 'ArrowLeft')
    }
  }

  async addMustCarry(sku: string) {
    // Click on Must-Carry section to expand if needed
    const mustCarrySection = this.page.locator('text=Must-Carry Products').locator('..')
    await mustCarrySection.click()

    // Search and select the SKU
    const searchInput = this.page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill(sku)
      await this.page.getByRole('option', { name: new RegExp(sku, 'i') }).click()
    }
  }

  async addExclude(sku: string) {
    // Click on Exclude section to expand if needed
    const excludeSection = this.page.locator('text=Exclude Products').locator('..')
    await excludeSection.click()

    // Search and select the SKU
    const searchInput = this.page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill(sku)
      await this.page.getByRole('option', { name: new RegExp(sku, 'i') }).click()
    }
  }

  async getOptimizationResult(): Promise<OptimizationResult> {
    await this.waitForOptimizationComplete()

    // Extract profit lift percentage from the Profit Impact card
    const profitLiftText = await this.page.locator('text=/[+-]?\\d+\\.?\\d*%/').first().textContent()
    const profitLiftPct = parseFloat(profitLiftText?.replace('%', '') ?? '0')

    // Extract summary badges
    const addedText = await this.page.locator('text=/\\+\\d+ Added/').textContent().catch(() => '+0 Added')
    const removedText = await this.page.locator('text=/\\d+ Removed/').textContent().catch(() => '0 Removed')
    const modifiedText = await this.page.locator('text=/\\d+ Modified/').textContent().catch(() => '0 Modified')

    const addedSkus = parseInt(addedText?.match(/\d+/)?.[0] ?? '0', 10)
    const removedSkus = parseInt(removedText?.match(/\d+/)?.[0] ?? '0', 10)
    const modifiedSkus = parseInt(modifiedText?.match(/\d+/)?.[0] ?? '0', 10)

    return {
      profitLift: 0, // Would need to parse from actual dollar amount
      profitLiftPct,
      addedSkus,
      removedSkus,
      modifiedSkus,
    }
  }

  // Simulation methods
  async selectScenarioType(scenarioType: 'remove_sku' | 'add_sku' | 'change_facings' | 'change_price') {
    const scenarioMap: Record<string, string> = {
      remove_sku: 'Remove SKU',
      add_sku: 'Add SKU',
      change_facings: 'Change Facings',
      change_price: 'Change Price',
    }

    // Click on scenario type button
    await this.page.getByRole('button', { name: new RegExp(scenarioMap[scenarioType], 'i') }).click()
  }

  async configureSimulation(numTrials: number = 1000, demandCv: number = 0.2) {
    // Find and set number of trials input
    const trialsInput = this.page.locator('input[type="number"]').first()
    if (await trialsInput.isVisible()) {
      await trialsInput.fill(numTrials.toString())
    }
  }

  async getSimulationResult(): Promise<SimulationResult> {
    await this.waitForSimulationComplete()

    // Extract metrics from results section
    const revenueText = await this.page.locator('text=/Revenue.*[+-]?\\$?[\\d,]+/i').textContent().catch(() => '0')
    const profitText = await this.page.locator('text=/Profit.*[+-]?\\$?[\\d,]+/i').textContent().catch(() => '0')

    const revenueImpact = parseFloat(revenueText?.match(/[\d,]+/)?.[0]?.replace(',', '') ?? '0')
    const profitImpact = parseFloat(profitText?.match(/[\d,]+/)?.[0]?.replace(',', '') ?? '0')

    return {
      scenarioType: 'unknown',
      revenueImpact,
      profitImpact,
      confidenceInterval: { lower: 0, upper: 0 },
    }
  }

  async saveScenario(name: string) {
    const saveButton = this.page.getByRole('button', { name: /save/i })
    if (await saveButton.isVisible()) {
      await saveButton.click()
      const nameInput = this.page.getByPlaceholder(/name/i)
      if (await nameInput.isVisible()) {
        await nameInput.fill(name)
        await this.page.getByRole('button', { name: /confirm|save/i }).click()
      }
    }
  }

  // Clustering methods
  async selectClusteringMethod(method: 'kmeans' | 'gmm') {
    const methodMap: Record<string, string> = {
      kmeans: 'K-Means',
      gmm: 'GMM',
    }
    await this.page.getByRole('button', { name: new RegExp(methodMap[method], 'i') }).click()
  }

  async setClusterCount(count: number) {
    const input = this.page.locator('input[type="number"]').first()
    if (await input.isVisible()) {
      await input.fill(count.toString())
    }
  }

  async runClustering() {
    await this.page.getByRole('button', { name: /run clustering/i }).click()
  }

  async waitForClusteringComplete() {
    await this.page.waitForSelector('text=/Clustering Results|Cluster Profiles/i', { timeout: 30000 })
  }

  async getClusterCount(): Promise<number> {
    await this.waitForClusteringComplete()

    // Count cluster cards or profiles
    const clusterElements = this.page.locator('text=/Cluster \\d+/')
    const count = await clusterElements.count()
    return count
  }

  async hasClusterScatterPlot(): Promise<boolean> {
    const scatterPlot = this.page.locator('svg').locator('circle')
    const count = await scatterPlot.count()
    return count > 0
  }

  // CDT methods
  async waitForCDTLoad() {
    await this.page.waitForSelector('text=/Consumer Decision Tree|CDT Analysis/i', { timeout: 10000 })
  }

  async hasSunburstChart(): Promise<boolean> {
    // Sunburst charts typically have path elements
    const paths = this.page.locator('svg path')
    const count = await paths.count()
    return count > 5 // Sunburst has many path segments
  }

  async drillDownCDT(segment: string) {
    await this.page.locator(`svg path[aria-label*="${segment}"]`).click()
  }

  // Planogram methods
  async waitForPlanogramLoad() {
    await this.page.waitForSelector('text=/Planogram|Shelf/i', { timeout: 10000 })
  }

  async hasShelfDisplay(): Promise<boolean> {
    const shelves = this.page.locator('[class*="shelf"]')
    const count = await shelves.count()
    return count > 0
  }

  async getProductCount(): Promise<number> {
    const products = this.page.locator('[class*="product"]')
    return await products.count()
  }

  // Error handling helpers
  async hasErrorMessage(): Promise<boolean> {
    const errorElements = this.page.locator('[role="alert"], text=/error|failed/i')
    return await errorElements.first().isVisible().catch(() => false)
  }

  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator('[role="alert"]').first()
    if (await errorElement.isVisible()) {
      return await errorElement.textContent()
    }
    return null
  }

  async clickRetry() {
    await this.page.getByRole('button', { name: /retry|try again/i }).click()
  }

  // Loading state helpers
  async isLoading(): Promise<boolean> {
    const loadingIndicators = this.page.locator('[class*="spinner"], [class*="loading"], [class*="skeleton"]')
    return await loadingIndicators.first().isVisible().catch(() => false)
  }

  async waitForLoadingComplete() {
    await this.page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      const spinners = document.querySelectorAll('[class*="animate-spin"]')
      const loadingTexts = document.querySelectorAll('[class*="loading"]')
      return skeletons.length === 0 && spinners.length === 0 && loadingTexts.length === 0
    }, { timeout: 30000 })
  }
}

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<AssortmentFixtures>({
  assortmentPage: async ({ page }, use) => {
    const assortmentPage = new AssortmentPage(page)
    await use(assortmentPage)
  },
})

export { expect }

/**
 * Common test helpers
 */
export const helpers = {
  /**
   * Wait for page to be fully loaded (no network activity)
   */
  async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle')
  },

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(page: Page, name: string) {
    await page.screenshot({ path: `e2e/screenshots/${name}.png` })
  },

  /**
   * Wait for any loading spinners to disappear
   */
  async waitForLoadingComplete(page: Page) {
    // Wait for any skeleton loaders or spinners to disappear
    await page.waitForFunction(() => {
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      const spinners = document.querySelectorAll('[class*="animate-spin"]')
      return skeletons.length === 0 && spinners.length === 0
    }, { timeout: 15000 })
  },

  /**
   * Format number as currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  },

  /**
   * Format number as percentage
   */
  formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  },
}
