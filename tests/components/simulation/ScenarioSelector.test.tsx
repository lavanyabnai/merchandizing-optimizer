/**
 * Tests for ScenarioSelector component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../utils'
import { ScenarioSelector } from '@/features/assortment/components/simulation/ScenarioSelector'
import type { ScenarioType } from '@/features/assortment/types'
import userEvent from '@testing-library/user-event'

describe('ScenarioSelector', () => {
  const defaultProps = {
    selectedScenario: 'remove_sku' as ScenarioType,
    onScenarioChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders scenario type label', () => {
      render(<ScenarioSelector {...defaultProps} />)

      expect(screen.getByText('Scenario Type')).toBeInTheDocument()
    })

    it('renders all scenario options', () => {
      render(<ScenarioSelector {...defaultProps} />)

      expect(screen.getByText('Remove SKU(s)')).toBeInTheDocument()
      expect(screen.getByText('Add New SKU')).toBeInTheDocument()
      expect(screen.getByText('Change Facings')).toBeInTheDocument()
      expect(screen.getByText('Change Price')).toBeInTheDocument()
    })

    it('renders scenario descriptions', () => {
      render(<ScenarioSelector {...defaultProps} />)

      expect(screen.getByText('What if we delist these products?')).toBeInTheDocument()
      expect(screen.getByText('What if we introduce a new product?')).toBeInTheDocument()
      expect(screen.getByText('What if we reallocate shelf space?')).toBeInTheDocument()
      expect(screen.getByText('What if we adjust pricing?')).toBeInTheDocument()
    })

    it('renders help icon', () => {
      const { container } = render(<ScenarioSelector {...defaultProps} />)

      const helpIcon = container.querySelector('[class*="cursor-help"]')
      expect(helpIcon).toBeInTheDocument()
    })

    it('renders 4 scenario buttons', () => {
      render(<ScenarioSelector {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(4)
    })
  })

  describe('Selection State', () => {
    it('highlights selected scenario (remove_sku)', () => {
      render(
        <ScenarioSelector
          {...defaultProps}
          selectedScenario="remove_sku"
        />
      )

      const removeButton = screen.getByRole('button', { name: /Remove SKU/i })
      expect(removeButton).toHaveClass('bg-red-50')
    })

    it('highlights selected scenario (add_sku)', () => {
      render(
        <ScenarioSelector
          {...defaultProps}
          selectedScenario="add_sku"
        />
      )

      const addButton = screen.getByRole('button', { name: /Add New SKU/i })
      expect(addButton).toHaveClass('bg-green-50')
    })

    it('highlights selected scenario (change_facings)', () => {
      render(
        <ScenarioSelector
          {...defaultProps}
          selectedScenario="change_facings"
        />
      )

      const facingsButton = screen.getByRole('button', { name: /Change Facings/i })
      expect(facingsButton).toHaveClass('bg-blue-50')
    })

    it('highlights selected scenario (change_price)', () => {
      render(
        <ScenarioSelector
          {...defaultProps}
          selectedScenario="change_price"
        />
      )

      const priceButton = screen.getByRole('button', { name: /Change Price/i })
      expect(priceButton).toHaveClass('bg-purple-50')
    })
  })

  describe('Scenario Selection', () => {
    it('calls onScenarioChange when clicking remove SKU', async () => {
      const onScenarioChange = vi.fn()
      render(
        <ScenarioSelector
          selectedScenario="add_sku"
          onScenarioChange={onScenarioChange}
        />
      )

      const removeButton = screen.getByRole('button', { name: /Remove SKU/i })
      await userEvent.click(removeButton)

      expect(onScenarioChange).toHaveBeenCalledWith('remove_sku')
    })

    it('calls onScenarioChange when clicking add SKU', async () => {
      const onScenarioChange = vi.fn()
      render(
        <ScenarioSelector
          selectedScenario="remove_sku"
          onScenarioChange={onScenarioChange}
        />
      )

      const addButton = screen.getByRole('button', { name: /Add New SKU/i })
      await userEvent.click(addButton)

      expect(onScenarioChange).toHaveBeenCalledWith('add_sku')
    })

    it('calls onScenarioChange when clicking change facings', async () => {
      const onScenarioChange = vi.fn()
      render(
        <ScenarioSelector
          selectedScenario="remove_sku"
          onScenarioChange={onScenarioChange}
        />
      )

      const facingsButton = screen.getByRole('button', { name: /Change Facings/i })
      await userEvent.click(facingsButton)

      expect(onScenarioChange).toHaveBeenCalledWith('change_facings')
    })

    it('calls onScenarioChange when clicking change price', async () => {
      const onScenarioChange = vi.fn()
      render(
        <ScenarioSelector
          selectedScenario="remove_sku"
          onScenarioChange={onScenarioChange}
        />
      )

      const priceButton = screen.getByRole('button', { name: /Change Price/i })
      await userEvent.click(priceButton)

      expect(onScenarioChange).toHaveBeenCalledWith('change_price')
    })
  })

  describe('Disabled State', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(
        <ScenarioSelector
          {...defaultProps}
          disabled={true}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })

    it('does not call onScenarioChange when disabled', async () => {
      const onScenarioChange = vi.fn()
      render(
        <ScenarioSelector
          selectedScenario="remove_sku"
          onScenarioChange={onScenarioChange}
          disabled={true}
        />
      )

      const addButton = screen.getByRole('button', { name: /Add New SKU/i })
      await userEvent.click(addButton)

      expect(onScenarioChange).not.toHaveBeenCalled()
    })

    it('buttons are not disabled by default', () => {
      render(<ScenarioSelector {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Layout', () => {
    it('renders buttons in a grid', () => {
      const { container } = render(<ScenarioSelector {...defaultProps} />)

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-2', 'lg:grid-cols-4')
    })

    it('buttons have proper structure with icon and label', () => {
      render(<ScenarioSelector {...defaultProps} />)

      const removeButton = screen.getByRole('button', { name: /Remove SKU/i })
      expect(removeButton).toContainElement(removeButton.querySelector('svg'))
    })
  })

  describe('Accessibility', () => {
    it('buttons are focusable', () => {
      render(<ScenarioSelector {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})
