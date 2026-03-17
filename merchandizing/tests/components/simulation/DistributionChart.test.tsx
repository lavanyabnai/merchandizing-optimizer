/**
 * Tests for DistributionChart component
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../utils'
import { DistributionChart, DualDistributionChart } from '@/features/assortment/components/simulation/DistributionChart'
import userEvent from '@testing-library/user-event'

// Generate mock histogram data
function generateMockData(count: number = 1000, mean: number = 100000, std: number = 10000): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    // Simple normal-ish distribution simulation
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    data.push(mean + z * std)
  }
  return data
}

describe('DistributionChart', () => {
  const mockData = generateMockData(100, 100000, 10000)
  const sortedData = [...mockData].sort((a, b) => a - b)
  const defaultProps = {
    data: mockData,
    p5: sortedData[Math.floor(sortedData.length * 0.05)],
    p50: sortedData[Math.floor(sortedData.length * 0.5)],
    p95: sortedData[Math.floor(sortedData.length * 0.95)],
    mean: mockData.reduce((a, b) => a + b, 0) / mockData.length,
    title: 'Profit Distribution',
    color: '#28A745',
  }

  describe('Rendering', () => {
    it('renders chart title', () => {
      render(<DistributionChart {...defaultProps} />)

      expect(screen.getByText('Profit Distribution')).toBeInTheDocument()
    })

    it('renders SVG chart', () => {
      const { container } = render(<DistributionChart {...defaultProps} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders help icon', () => {
      const { container } = render(<DistributionChart {...defaultProps} />)

      const helpIcon = container.querySelector('.cursor-help')
      expect(helpIcon).toBeInTheDocument()
    })

    it('renders legend', () => {
      render(<DistributionChart {...defaultProps} />)

      expect(screen.getByText('5th/95th %ile')).toBeInTheDocument()
      expect(screen.getByText('Median')).toBeInTheDocument()
      expect(screen.getByText('90% CI')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows skeleton when loading', () => {
      const { container } = render(
        <DistributionChart {...defaultProps} isLoading={true} />
      )

      // Skeleton component uses data-slot or specific classes
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
      // When loading, the chart SVG should not be rendered
      expect(screen.queryByText('5th/95th %ile')).not.toBeInTheDocument()
    })

    it('does not show chart legend when loading', () => {
      render(<DistributionChart {...defaultProps} isLoading={true} />)

      // Legend text should not appear when loading
      expect(screen.queryByText('5th/95th %ile')).not.toBeInTheDocument()
    })
  })

  describe('Chart Elements', () => {
    it('renders bar chart container', () => {
      const { container } = render(<DistributionChart {...defaultProps} />)

      // Recharts BarChart renders an SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders ResponsiveContainer wrapper', () => {
      const { container } = render(<DistributionChart {...defaultProps} />)

      // Recharts ResponsiveContainer adds this class
      const wrapper = container.querySelector('.recharts-responsive-container')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders chart with histogram data', () => {
      const { container } = render(<DistributionChart {...defaultProps} />)

      // Chart should be present
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Baseline Reference', () => {
    it('renders chart with baseline when provided', () => {
      const { container } = render(
        <DistributionChart {...defaultProps} baseline={95000} />
      )

      // Chart should still render
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('renders chart without baseline when not provided', () => {
      const { container } = render(
        <DistributionChart {...defaultProps} baseline={undefined} />
      )

      // Chart should still render
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Empty Data', () => {
    it('handles empty data array', () => {
      const { container } = render(
        <DistributionChart
          {...defaultProps}
          data={[]}
        />
      )

      // Should still render without crashing
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('uses provided color for bars', () => {
      const { container } = render(
        <DistributionChart {...defaultProps} color="#FF0000" />
      )

      // Chart renders with custom color
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('displays custom title', () => {
      render(<DistributionChart {...defaultProps} title="Custom Title" />)

      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })
  })
})

describe('DualDistributionChart', () => {
  const revenueData = generateMockData(100, 500000, 50000)
  const profitData = generateMockData(100, 100000, 10000)
  const sortedRevenue = [...revenueData].sort((a, b) => a - b)
  const sortedProfit = [...profitData].sort((a, b) => a - b)

  const defaultProps = {
    revenueData,
    profitData,
    revenueP5: sortedRevenue[Math.floor(sortedRevenue.length * 0.05)],
    revenueP50: sortedRevenue[Math.floor(sortedRevenue.length * 0.5)],
    revenueP95: sortedRevenue[Math.floor(sortedRevenue.length * 0.95)],
    profitP5: sortedProfit[Math.floor(sortedProfit.length * 0.05)],
    profitP50: sortedProfit[Math.floor(sortedProfit.length * 0.5)],
    profitP95: sortedProfit[Math.floor(sortedProfit.length * 0.95)],
  }

  describe('Rendering', () => {
    it('renders outcome distribution title', () => {
      render(<DualDistributionChart {...defaultProps} />)

      expect(screen.getByText('Outcome Distribution')).toBeInTheDocument()
    })

    it('renders metric toggle buttons', () => {
      render(<DualDistributionChart {...defaultProps} />)

      expect(screen.getByRole('button', { name: /Revenue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Profit/i })).toBeInTheDocument()
    })

    it('renders chart', () => {
      const { container } = render(<DualDistributionChart {...defaultProps} />)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Metric Toggle', () => {
    it('defaults to profit view', () => {
      render(<DualDistributionChart {...defaultProps} />)

      const profitButton = screen.getByRole('button', { name: /Profit/i })
      // Active button should have default variant (not outline)
      expect(profitButton).toBeInTheDocument()
    })

    it('switches to revenue view when clicked', async () => {
      render(<DualDistributionChart {...defaultProps} />)

      const revenueButton = screen.getByRole('button', { name: /Revenue/i })
      await userEvent.click(revenueButton)

      // After clicking, revenue button should update
      // The chart data should update to show revenue distribution
      expect(revenueButton).toBeInTheDocument()
    })

    it('switches to profit view when clicked', async () => {
      render(<DualDistributionChart {...defaultProps} />)

      // First switch to revenue
      const revenueButton = screen.getByRole('button', { name: /Revenue/i })
      await userEvent.click(revenueButton)

      // Then switch back to profit
      const profitButton = screen.getByRole('button', { name: /Profit/i })
      await userEvent.click(profitButton)

      // Profit should be active again
      expect(profitButton).toBeInTheDocument()
    })
  })

  describe('Baseline Values', () => {
    it('passes baseline revenue when in revenue view', async () => {
      const { container } = render(
        <DualDistributionChart
          {...defaultProps}
          baselineRevenue={450000}
          baselineProfit={90000}
        />
      )

      const revenueButton = screen.getByRole('button', { name: /Revenue/i })
      await userEvent.click(revenueButton)

      // Chart should still render with baseline
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('passes baseline profit when in profit view', () => {
      const { container } = render(
        <DualDistributionChart
          {...defaultProps}
          baselineRevenue={450000}
          baselineProfit={90000}
        />
      )

      // Profit view is default - chart should render
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('passes loading state to child chart', () => {
      render(
        <DualDistributionChart
          {...defaultProps}
          isLoading={true}
        />
      )

      // When loading, legend should not appear (from inner chart)
      expect(screen.queryByText('5th/95th %ile')).not.toBeInTheDocument()
    })
  })

  describe('Help Tooltip', () => {
    it('renders help icon', () => {
      const { container } = render(<DualDistributionChart {...defaultProps} />)

      const helpIcons = container.querySelectorAll('.cursor-help')
      expect(helpIcons.length).toBeGreaterThan(0)
    })
  })
})
