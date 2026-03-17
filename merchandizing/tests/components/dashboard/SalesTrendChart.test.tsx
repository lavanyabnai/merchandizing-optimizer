/**
 * Tests for SalesTrendChart component
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../utils'
import { SalesTrendChart, type WeeklySalesData } from '@/features/assortment/components/dashboard/SalesTrendChart'

const mockWeeklySales: WeeklySalesData[] = [
  { week: 1, revenue: 50000, profit: 15000, units: 12000 },
  { week: 2, revenue: 52000, profit: 15500, units: 12500 },
  { week: 3, revenue: 48000, profit: 14000, units: 11500 },
  { week: 4, revenue: 55000, profit: 16500, units: 13000 },
  { week: 5, revenue: 60000, profit: 18000, units: 14500 },
  { week: 10, revenue: 70000, profit: 21000, units: 17000 }, // Peak
  { week: 15, revenue: 45000, profit: 13000, units: 11000 }, // Low
  { week: 20, revenue: 65000, profit: 19500, units: 15500 },
]

describe('SalesTrendChart', () => {
  describe('Rendering', () => {
    it('renders chart title', () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      expect(screen.getByText('Weekly Sales Trend')).toBeInTheDocument()
    })

    it('renders metric selector with default value', () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      // Default metric is "revenue"
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders SVG chart when data is provided', () => {
      const { container } = render(<SalesTrendChart data={mockWeeklySales} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders empty state when no data', () => {
      render(<SalesTrendChart data={[]} />)

      expect(screen.getByText('No sales data available')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('renders card when loading', () => {
      const { container } = render(<SalesTrendChart data={[]} isLoading={true} />)

      // Should have card structure
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })

    it('does not show chart title when loading', () => {
      render(<SalesTrendChart data={mockWeeklySales} isLoading={true} />)

      // Title should not be visible when loading (skeleton shown instead)
      expect(screen.queryByText('Weekly Sales Trend')).not.toBeInTheDocument()
    })
  })

  describe('Metric Selection', () => {
    it('allows switching to profit metric', async () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      const combobox = screen.getByRole('combobox')
      fireEvent.click(combobox)

      const profitOption = screen.getByRole('option', { name: 'Profit' })
      fireEvent.click(profitOption)

      // Verify the selection changed - combobox should show new value
      expect(combobox).toHaveTextContent('Profit')
    })

    it('allows switching to units metric', async () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      const combobox = screen.getByRole('combobox')
      fireEvent.click(combobox)

      const unitsOption = screen.getByRole('option', { name: 'Units' })
      fireEvent.click(unitsOption)

      expect(combobox).toHaveTextContent('Units')
    })
  })

  describe('Trend Insights', () => {
    it('displays trend insights alert', () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      expect(screen.getByText(/Trend Insights:/)).toBeInTheDocument()
    })

    it('shows peak week in insights', () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      // Week 10 has the highest revenue (70000)
      expect(screen.getByText(/Week 10/)).toBeInTheDocument()
    })

    it('shows low week in insights', () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      // Week 15 has the lowest revenue (45000)
      expect(screen.getByText(/Week 15/)).toBeInTheDocument()
    })

    it('shows seasonality index', () => {
      render(<SalesTrendChart data={mockWeeklySales} />)

      expect(screen.getByText(/variation from mean/)).toBeInTheDocument()
    })
  })

  describe('Chart Elements', () => {
    it('renders SVG chart container', () => {
      const { container } = render(<SalesTrendChart data={mockWeeklySales} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders ResponsiveContainer wrapper', () => {
      const { container } = render(<SalesTrendChart data={mockWeeklySales} />)

      // Recharts ResponsiveContainer adds this class
      const wrapper = container.querySelector('.recharts-responsive-container')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders chart with multiple weeks', () => {
      const { container } = render(<SalesTrendChart data={mockWeeklySales} />)

      // Chart should be present
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePoint: WeeklySalesData[] = [
        { week: 1, revenue: 50000, profit: 15000, units: 12000 },
      ]

      const { container } = render(<SalesTrendChart data={singlePoint} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('handles data with zero values', () => {
      const dataWithZeros: WeeklySalesData[] = [
        { week: 1, revenue: 0, profit: 0, units: 0 },
        { week: 2, revenue: 50000, profit: 15000, units: 12000 },
      ]

      const { container } = render(<SalesTrendChart data={dataWithZeros} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('handles very large values', () => {
      const largeValues: WeeklySalesData[] = [
        { week: 1, revenue: 99999999, profit: 30000000, units: 5000000 },
        { week: 2, revenue: 88888888, profit: 25000000, units: 4500000 },
      ]

      const { container } = render(<SalesTrendChart data={largeValues} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
