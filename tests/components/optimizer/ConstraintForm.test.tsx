/**
 * Tests for ConstraintForm component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils'
import { ConstraintForm, type ConstraintFormValues } from '@/features/assortment/components/optimizer/ConstraintForm'
import userEvent from '@testing-library/user-event'

describe('ConstraintForm', () => {
  describe('Rendering', () => {
    it('renders form title', () => {
      render(<ConstraintForm />)

      expect(screen.getByText('Optimization Constraints')).toBeInTheDocument()
    })

    it('renders preset buttons', () => {
      render(<ConstraintForm />)

      expect(screen.getByRole('button', { name: /Conservative/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Balanced/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Aggressive/i })).toBeInTheDocument()
    })

    it('renders reset button', () => {
      render(<ConstraintForm />)

      expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
    })

    it('renders space constraints section', () => {
      render(<ConstraintForm />)

      expect(screen.getByText('Space Constraints')).toBeInTheDocument()
      expect(screen.getByText('Total Available Facings')).toBeInTheDocument()
      expect(screen.getByText('Min Facings/SKU')).toBeInTheDocument()
      expect(screen.getByText('Max Facings/SKU')).toBeInTheDocument()
    })

    it('renders coverage constraints section', () => {
      render(<ConstraintForm />)

      expect(screen.getByText('Coverage Constraints')).toBeInTheDocument()
      expect(screen.getByText('Min SKUs per Subcategory')).toBeInTheDocument()
      expect(screen.getByText('Min SKUs per Price Tier')).toBeInTheDocument()
      expect(screen.getByText('Min SKUs/Brand')).toBeInTheDocument()
      expect(screen.getByText('Max SKUs/Brand')).toBeInTheDocument()
    })

    it('renders sliders for all constraint fields', () => {
      const { container } = render(<ConstraintForm />)

      // Check for slider elements
      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(7) // 7 constraint fields
    })
  })

  describe('Default Values', () => {
    it('uses balanced preset as default', () => {
      const { container } = render(<ConstraintForm />)

      // Balanced preset is the default - verify sliders are rendered with correct values
      const sliders = container.querySelectorAll('[role="slider"]')
      expect(sliders.length).toBe(7)

      // First slider should be total facings with value 120
      const totalFacingsSlider = sliders[0]
      expect(totalFacingsSlider).toHaveAttribute('aria-valuenow', '120')
    })

    it('uses provided default values', () => {
      const customDefaults: Partial<ConstraintFormValues> = {
        totalFacings: 150,
        minFacingsPerSku: 2,
      }

      render(<ConstraintForm defaultValues={customDefaults} />)

      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Preset Buttons', () => {
    it('applies conservative preset when clicked', async () => {
      const onValuesChange = vi.fn()
      render(<ConstraintForm onValuesChange={onValuesChange} />)

      const conservativeButton = screen.getByRole('button', { name: /Conservative/i })
      await userEvent.click(conservativeButton)

      expect(onValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          totalFacings: 100,
          minFacingsPerSku: 2,
          maxFacingsPerSku: 4,
        })
      )
    })

    it('applies balanced preset when clicked', async () => {
      const onValuesChange = vi.fn()
      render(<ConstraintForm onValuesChange={onValuesChange} />)

      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      expect(onValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          totalFacings: 120,
          minFacingsPerSku: 1,
          maxFacingsPerSku: 6,
        })
      )
    })

    it('applies aggressive preset when clicked', async () => {
      const onValuesChange = vi.fn()
      render(<ConstraintForm onValuesChange={onValuesChange} />)

      const aggressiveButton = screen.getByRole('button', { name: /Aggressive/i })
      await userEvent.click(aggressiveButton)

      expect(onValuesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          totalFacings: 150,
          minFacingsPerSku: 1,
          maxFacingsPerSku: 8,
        })
      )
    })
  })

  describe('Reset Button', () => {
    it('resets to balanced defaults when clicked', async () => {
      const onValuesChange = vi.fn()
      render(<ConstraintForm onValuesChange={onValuesChange} />)

      // First apply a different preset
      const aggressiveButton = screen.getByRole('button', { name: /Aggressive/i })
      await userEvent.click(aggressiveButton)

      // Then reset
      const resetButton = screen.getByRole('button', { name: /Reset/i })
      await userEvent.click(resetButton)

      // Should be called with balanced preset (default)
      const lastCall = onValuesChange.mock.calls[onValuesChange.mock.calls.length - 1][0]
      expect(lastCall.totalFacings).toBe(120)
      expect(lastCall.minFacingsPerSku).toBe(1)
      expect(lastCall.maxFacingsPerSku).toBe(6)
    })
  })

  describe('Slider Interactions', () => {
    it('calls onValuesChange when slider value changes', async () => {
      const onValuesChange = vi.fn()
      const { container } = render(<ConstraintForm onValuesChange={onValuesChange} />)

      // Find the first slider (total facings)
      const sliders = container.querySelectorAll('[role="slider"]')
      const totalFacingsSlider = sliders[0]

      // Simulate slider change by using keyboard
      totalFacingsSlider.focus()
      fireEvent.keyDown(totalFacingsSlider, { key: 'ArrowRight' })

      await waitFor(() => {
        expect(onValuesChange).toHaveBeenCalled()
      })
    })
  })

  describe('Disabled State', () => {
    it('disables all preset buttons when disabled prop is true', () => {
      render(<ConstraintForm disabled={true} />)

      expect(screen.getByRole('button', { name: /Conservative/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Balanced/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Aggressive/i })).toBeDisabled()
    })

    it('disables reset button when disabled', () => {
      render(<ConstraintForm disabled={true} />)

      expect(screen.getByRole('button', { name: /Reset/i })).toBeDisabled()
    })

    it('disables all sliders when disabled', () => {
      const { container } = render(<ConstraintForm disabled={true} />)

      const sliders = container.querySelectorAll('[role="slider"]')
      sliders.forEach(slider => {
        expect(slider).toHaveAttribute('data-disabled')
      })
    })
  })

  describe('Validation', () => {
    it('enforces minimum value for total facings (50)', () => {
      const { container } = render(<ConstraintForm />)

      const sliders = container.querySelectorAll('[role="slider"]')
      const totalFacingsSlider = sliders[0]

      // The slider min should be 50
      expect(totalFacingsSlider).toHaveAttribute('aria-valuemin', '50')
    })

    it('enforces maximum value for total facings (200)', () => {
      const { container } = render(<ConstraintForm />)

      const sliders = container.querySelectorAll('[role="slider"]')
      const totalFacingsSlider = sliders[0]

      // The slider max should be 200
      expect(totalFacingsSlider).toHaveAttribute('aria-valuemax', '200')
    })

    it('enforces min facings per SKU range (1-6)', () => {
      const { container } = render(<ConstraintForm />)

      const sliders = container.querySelectorAll('[role="slider"]')
      const minFacingsSlider = sliders[1]

      expect(minFacingsSlider).toHaveAttribute('aria-valuemin', '1')
      expect(minFacingsSlider).toHaveAttribute('aria-valuemax', '6')
    })

    it('enforces max facings per SKU range (1-10)', () => {
      const { container } = render(<ConstraintForm />)

      const sliders = container.querySelectorAll('[role="slider"]')
      const maxFacingsSlider = sliders[2]

      expect(maxFacingsSlider).toHaveAttribute('aria-valuemin', '1')
      expect(maxFacingsSlider).toHaveAttribute('aria-valuemax', '10')
    })
  })

  describe('Help Tooltips', () => {
    it('renders help icons for each slider field', () => {
      const { container } = render(<ConstraintForm />)

      // Each slider field should have a help icon (HelpCircle)
      const helpIcons = container.querySelectorAll('[class*="cursor-help"]')
      expect(helpIcons.length).toBe(7)
    })
  })

  describe('Value Display', () => {
    it('displays current value for each constraint', () => {
      render(<ConstraintForm />)

      // Balanced defaults: totalFacings=120, minFacingsPerSku=1, etc.
      expect(screen.getByText('120')).toBeInTheDocument() // totalFacings
    })
  })

  describe('Section Headers', () => {
    it('renders section headers with correct styling', () => {
      render(<ConstraintForm />)

      const spaceHeader = screen.getByText('Space Constraints')
      const coverageHeader = screen.getByText('Coverage Constraints')

      expect(spaceHeader).toHaveClass('text-sm', 'font-medium')
      expect(coverageHeader).toHaveClass('text-sm', 'font-medium')
    })
  })

  describe('Descriptions', () => {
    it('displays descriptions for constraint fields', () => {
      render(<ConstraintForm />)

      expect(screen.getByText('Maximum product facings on the shelf')).toBeInTheDocument()
      expect(screen.getByText('Minimum facings for each selected SKU')).toBeInTheDocument()
      expect(screen.getByText('Prevents brand dominance')).toBeInTheDocument()
    })
  })
})
