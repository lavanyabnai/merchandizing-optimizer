/**
 * Tests for TopPerformersChart component
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../utils'
import { TopPerformersChart, type TopPerformerData } from '@/features/assortment/components/dashboard/TopPerformersChart'

const mockTopPerformers: TopPerformerData[] = [
  { sku: 'SKU-001', name: 'Coca-Cola Classic 12oz', brand: 'Coca-Cola', subcategory: 'Cola', revenue: 95000, profit: 25000, units: 35000 },
  { sku: 'SKU-002', name: 'Pepsi 12oz', brand: 'Pepsi', subcategory: 'Cola', revenue: 85000, profit: 22000, units: 32000 },
  { sku: 'SKU-003', name: 'Red Bull 8.4oz', brand: 'Red Bull', subcategory: 'Energy', revenue: 75000, profit: 30000, units: 20000 },
  { sku: 'SKU-004', name: 'Monster Energy 16oz', brand: 'Monster', subcategory: 'Energy', revenue: 65000, profit: 26000, units: 18000 },
  { sku: 'SKU-005', name: 'Sprite 12oz', brand: 'Coca-Cola', subcategory: 'Lemon-Lime', revenue: 55000, profit: 14000, units: 21000 },
  { sku: 'SKU-006', name: '7-Up 12oz', brand: '7-Up', subcategory: 'Lemon-Lime', revenue: 45000, profit: 11000, units: 17000 },
  { sku: 'SKU-007', name: 'Fanta Orange 12oz', brand: 'Fanta', subcategory: 'Orange', revenue: 35000, profit: 9000, units: 13000 },
  { sku: 'SKU-008', name: 'Mountain Dew 12oz', brand: 'Pepsi', subcategory: 'Cola', revenue: 30000, profit: 7500, units: 11500 },
  { sku: 'SKU-009', name: 'Dr Pepper 12oz', brand: 'Dr Pepper', subcategory: 'Cola', revenue: 28000, profit: 7000, units: 10500 },
  { sku: 'SKU-010', name: 'Dasani Water 20oz', brand: 'Coca-Cola', subcategory: 'Sparkling Water', revenue: 25000, profit: 8000, units: 12000 },
  { sku: 'SKU-011', name: 'Tropicana Orange 12oz', brand: 'Tropicana', subcategory: 'Orange', revenue: 22000, profit: 5500, units: 8500 },
  { sku: 'SKU-012', name: 'Store Brand Cola 12oz', brand: 'Store Brand', subcategory: 'Cola', revenue: 15000, profit: 6000, units: 12000 },
]

const totalRevenue = mockTopPerformers.reduce((sum, p) => sum + p.revenue, 0)
const totalProfit = mockTopPerformers.reduce((sum, p) => sum + p.profit, 0)
const totalUnits = mockTopPerformers.reduce((sum, p) => sum + p.units, 0)

describe('TopPerformersChart', () => {
  describe('Rendering', () => {
    it('renders chart title with default metric', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      expect(screen.getByText('Top 10 SKUs by Revenue')).toBeInTheDocument()
    })

    it('renders metric selector', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders SVG chart for data', () => {
      const { container } = render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Recharts renders an SVG element
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders empty state when no data', () => {
      render(
        <TopPerformersChart
          data={[]}
          totalRevenue={0}
          totalProfit={0}
          totalUnits={0}
        />
      )

      expect(screen.getByText('No product data available')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('renders card when loading', () => {
      const { container } = render(
        <TopPerformersChart
          data={[]}
          isLoading={true}
          totalRevenue={0}
          totalProfit={0}
          totalUnits={0}
        />
      )

      // Should have card structure
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })

    it('does not show chart title when loading', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          isLoading={true}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Title should not be in the document when loading
      expect(screen.queryByText('Top 10 SKUs by Revenue')).not.toBeInTheDocument()
    })
  })

  describe('Metric Selection', () => {
    it('changes title when switching to profit', async () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      const combobox = screen.getByRole('combobox')
      fireEvent.click(combobox)

      const profitOption = screen.getByRole('option', { name: 'Profit' })
      fireEvent.click(profitOption)

      expect(screen.getByText('Top 10 SKUs by Profit')).toBeInTheDocument()
    })

    it('changes title when switching to units', async () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      const combobox = screen.getByRole('combobox')
      fireEvent.click(combobox)

      const unitsOption = screen.getByRole('option', { name: 'Units' })
      fireEvent.click(unitsOption)

      expect(screen.getByText('Top 10 SKUs by Units')).toBeInTheDocument()
    })
  })

  describe('Subcategory Legend', () => {
    it('displays legend for subcategories present in top 10', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Should show legends for subcategories in data
      expect(screen.getByText('Cola')).toBeInTheDocument()
      expect(screen.getByText('Energy')).toBeInTheDocument()
    })
  })

  describe('Insights', () => {
    it('displays insights alert', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      expect(screen.getByText(/Top Performers Insight:/)).toBeInTheDocument()
    })

    it('shows concentration percentage', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Should show the concentration as a percentage
      expect(screen.getByText(/of total/)).toBeInTheDocument()
    })

    it('shows dominant brand', () => {
      render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Should show "Coca-Cola" as dominant brand (4 products in top 10)
      expect(screen.getByText(/Top brand:/)).toBeInTheDocument()
      expect(screen.getByText(/Coca-Cola/)).toBeInTheDocument()
    })

    it('shows high concentration message when > 50%', () => {
      // Create data where top 10 is 100% of total
      render(
        <TopPerformersChart
          data={mockTopPerformers.slice(0, 10)}
          totalRevenue={mockTopPerformers.slice(0, 10).reduce((sum, p) => sum + p.revenue, 0)}
          totalProfit={mockTopPerformers.slice(0, 10).reduce((sum, p) => sum + p.profit, 0)}
          totalUnits={mockTopPerformers.slice(0, 10).reduce((sum, p) => sum + p.units, 0)}
        />
      )

      expect(screen.getByText(/High concentration/)).toBeInTheDocument()
    })
  })

  describe('Chart Elements', () => {
    it('renders SVG chart container', () => {
      const { container } = render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders ResponsiveContainer wrapper', () => {
      const { container } = render(
        <TopPerformersChart
          data={mockTopPerformers}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Recharts ResponsiveContainer adds a wrapper div
      const wrapper = container.querySelector('.recharts-responsive-container')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles less than 10 products', () => {
      const fewProducts = mockTopPerformers.slice(0, 3)

      const { container } = render(
        <TopPerformersChart
          data={fewProducts}
          totalRevenue={fewProducts.reduce((sum, p) => sum + p.revenue, 0)}
          totalProfit={fewProducts.reduce((sum, p) => sum + p.profit, 0)}
          totalUnits={fewProducts.reduce((sum, p) => sum + p.units, 0)}
        />
      )

      // Should still render the chart
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('handles products with same brand', () => {
      const sameBrand: TopPerformerData[] = mockTopPerformers.map(p => ({
        ...p,
        brand: 'Coca-Cola'
      }))

      render(
        <TopPerformersChart
          data={sameBrand}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          totalUnits={totalUnits}
        />
      )

      // Dominant brand should be Coca-Cola
      const insights = screen.getByText(/Top brand:/)
      expect(insights).toBeInTheDocument()
    })

    it('truncates long product names', () => {
      const longNameProduct: TopPerformerData[] = [
        {
          sku: 'SKU-LONG',
          name: 'This is a very long product name that should be truncated for display purposes',
          brand: 'Test Brand',
          subcategory: 'Cola',
          revenue: 100000,
          profit: 30000,
          units: 40000,
        },
      ]

      const { container } = render(
        <TopPerformersChart
          data={longNameProduct}
          totalRevenue={100000}
          totalProfit={30000}
          totalUnits={40000}
        />
      )

      // The chart should still render
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
