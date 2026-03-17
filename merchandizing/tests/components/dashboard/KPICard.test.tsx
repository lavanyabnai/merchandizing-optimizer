/**
 * Tests for KPICard component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils'
import { KPICard, type KPIFormat, type KPITrend } from '@/features/assortment/components/dashboard/KPICard'
import { DollarSign, TrendingUp, Package } from 'lucide-react'

describe('KPICard', () => {
  describe('Value Formatting', () => {
    it('formats currency values correctly', () => {
      render(
        <KPICard
          title="Total Revenue"
          value={1250000}
          format="currency"
        />
      )

      expect(screen.getByText('$1,250,000')).toBeInTheDocument()
    })

    it('formats percentage values correctly', () => {
      render(
        <KPICard
          title="Profit Margin"
          value={28.5}
          format="percent"
        />
      )

      expect(screen.getByText('28.5%')).toBeInTheDocument()
    })

    it('formats decimal values correctly', () => {
      render(
        <KPICard
          title="GMROI"
          value={2.85}
          format="decimal"
        />
      )

      expect(screen.getByText('2.85x')).toBeInTheDocument()
    })

    it('formats number values correctly', () => {
      render(
        <KPICard
          title="SKU Count"
          value={1500}
          format="number"
        />
      )

      expect(screen.getByText('1,500')).toBeInTheDocument()
    })

    it('includes suffix when provided', () => {
      render(
        <KPICard
          title="Linear Feet"
          value={48}
          format="number"
          suffix="ft"
        />
      )

      expect(screen.getByText('48 ft')).toBeInTheDocument()
    })
  })

  describe('Trend Indicator', () => {
    it('shows upward trend with green color', () => {
      render(
        <KPICard
          title="Revenue"
          value={1250000}
          previousValue={1000000}
          format="currency"
        />
      )

      // 25% increase should show upward trend
      const trendIndicator = screen.getByText('25.0%')
      expect(trendIndicator).toBeInTheDocument()
      expect(trendIndicator.closest('div')).toHaveClass('text-green-600')
    })

    it('shows downward trend with red color', () => {
      render(
        <KPICard
          title="Revenue"
          value={750000}
          previousValue={1000000}
          format="currency"
        />
      )

      // 25% decrease should show downward trend
      const trendIndicator = screen.getByText('25.0%')
      expect(trendIndicator).toBeInTheDocument()
      expect(trendIndicator.closest('div')).toHaveClass('text-red-600')
    })

    it('shows neutral trend when change is minimal', () => {
      render(
        <KPICard
          title="Revenue"
          value={1000500}
          previousValue={1000000}
          format="currency"
        />
      )

      // 0.05% increase should show neutral trend
      const trendIndicator = screen.getByText('0.1%')
      expect(trendIndicator).toBeInTheDocument()
      expect(trendIndicator.closest('div')).toHaveClass('text-gray-500')
    })

    it('uses provided trend instead of calculating', () => {
      render(
        <KPICard
          title="Revenue"
          value={1250000}
          previousValue={1000000}
          format="currency"
          trend="down"
        />
      )

      // Even though value increased, trend is set to "down"
      const trendIndicator = screen.getByText('25.0%')
      expect(trendIndicator).toBeInTheDocument()
      expect(trendIndicator.closest('div')).toHaveClass('text-red-600')
    })

    it('does not show trend when no previous value', () => {
      render(
        <KPICard
          title="Revenue"
          value={1250000}
          format="currency"
        />
      )

      // Should not show any percentage change
      expect(screen.queryByText(/%/)).not.toBeInTheDocument()
    })
  })

  describe('Title and Icon', () => {
    it('displays the title correctly', () => {
      render(
        <KPICard
          title="Total Revenue"
          value={1250000}
          format="currency"
        />
      )

      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    it('renders icon when provided', () => {
      render(
        <KPICard
          title="Revenue"
          value={1250000}
          format="currency"
          icon={<DollarSign data-testid="dollar-icon" />}
        />
      )

      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument()
    })
  })

  describe('Tooltip', () => {
    it('renders help icon when tooltip is provided', () => {
      const { container } = render(
        <KPICard
          title="GMROI"
          value={2.85}
          format="decimal"
          tooltip="Gross Margin Return on Investment"
        />
      )

      // Find the help icon (HelpCircle) by its class - TooltipTrigger uses asChild
      const helpIcon = container.querySelector('.cursor-help')
      expect(helpIcon).toBeInTheDocument()
    })

    it('does not render help icon when no tooltip', () => {
      const { container } = render(
        <KPICard
          title="Revenue"
          value={1250000}
          format="currency"
        />
      )

      // Should not find the help icon
      const helpIcon = container.querySelector('.cursor-help')
      expect(helpIcon).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero values', () => {
      render(
        <KPICard
          title="Revenue"
          value={0}
          format="currency"
        />
      )

      expect(screen.getByText('$0')).toBeInTheDocument()
    })

    it('handles very large numbers', () => {
      render(
        <KPICard
          title="Revenue"
          value={9999999999}
          format="currency"
        />
      )

      expect(screen.getByText('$9,999,999,999')).toBeInTheDocument()
    })

    it('handles negative numbers', () => {
      render(
        <KPICard
          title="Change"
          value={-500}
          format="currency"
        />
      )

      expect(screen.getByText('-$500')).toBeInTheDocument()
    })

    it('handles zero previous value (no division by zero)', () => {
      render(
        <KPICard
          title="Revenue"
          value={1000}
          previousValue={0}
          format="currency"
        />
      )

      // Should handle zero division gracefully - shows 0% change
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <KPICard
          title="Revenue"
          value={1250000}
          format="currency"
          className="custom-class"
        />
      )

      // Find the Card element and check for custom class
      const card = container.querySelector('.custom-class')
      expect(card).toBeInTheDocument()
    })
  })
})
