/**
 * Integration tests for optimization workflow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../utils'
import { Optimizer } from '@/features/assortment/components/optimizer/Optimizer'
import { resetStore, setStoreState } from '../utils'
import userEvent from '@testing-library/user-event'

describe('Optimization Flow Integration', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Complete Optimization Journey', () => {
    it('should render optimizer with empty state', async () => {
      render(<Optimizer useDemoData={true} />)

      // Should show the empty state message
      expect(screen.getByText('Ready to Optimize')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Run Optimization/i })).toBeDisabled()
    })

    it('should enable run button after selecting preset', async () => {
      render(<Optimizer useDemoData={true} />)

      // Configure constraints using preset
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Button should now be enabled
      expect(screen.getByRole('button', { name: /Run Optimization/i })).not.toBeDisabled()
    })

    it('should show loading state during optimization', async () => {
      render(<Optimizer useDemoData={true} />)

      // Configure and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Should show loading state
      expect(screen.getByText('Optimizing...')).toBeInTheDocument()
    })

    it('should complete optimization and show results', async () => {
      render(<Optimizer useDemoData={true} />)

      // Configure and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByText(/Optimization completed/)).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Verify results are displayed - Comparison tab content
      expect(screen.getByText('Assortment Comparison')).toBeInTheDocument()
    }, 10000)

    it('should allow switching between result tabs', async () => {
      render(<Optimizer useDemoData={true} />)

      // Configure and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByText(/Optimization completed/)).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Switch to Space tab
      const spaceTab = screen.getByRole('tab', { name: /Space/i })
      await userEvent.click(spaceTab)

      // Switch to History tab
      const historyTab = screen.getByRole('tab', { name: /History/i })
      await userEvent.click(historyTab)

      // Switch back to Comparison tab
      const comparisonTab = screen.getByRole('tab', { name: /Comparison/i })
      await userEvent.click(comparisonTab)

      expect(comparisonTab).toHaveAttribute('data-state', 'active')
    }, 10000)
  })

  describe('Constraint Configuration', () => {
    it('should apply conservative preset', async () => {
      render(<Optimizer useDemoData={true} />)

      const conservativeButton = screen.getByRole('button', { name: /Conservative/i })
      await userEvent.click(conservativeButton)

      // Run button should be enabled after selecting preset
      expect(screen.getByRole('button', { name: /Run Optimization/i })).not.toBeDisabled()
    })

    it('should apply aggressive preset', async () => {
      render(<Optimizer useDemoData={true} />)

      const aggressiveButton = screen.getByRole('button', { name: /Aggressive/i })
      await userEvent.click(aggressiveButton)

      // Run button should be enabled after selecting preset
      expect(screen.getByRole('button', { name: /Run Optimization/i })).not.toBeDisabled()
    })

    it('should disable form during optimization', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Start optimization
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Check that preset buttons are disabled during optimization
      expect(screen.getByRole('button', { name: /Conservative/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Balanced/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Aggressive/i })).toBeDisabled()
    })
  })

  describe('Results Analysis', () => {
    it('should display profit lift card after optimization', async () => {
      render(<Optimizer useDemoData={true} />)

      // Configure and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Wait for run button to be enabled
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await waitFor(() => {
        expect(runButton).not.toBeDisabled()
      })

      await userEvent.click(runButton)

      // Wait for results (increased timeout for CI)
      // ProfitLiftCard shows "Profit Impact" as title (may be multiple instances)
      await waitFor(
        () => {
          const profitImpactElements = screen.getAllByText(/Profit Impact/i)
          expect(profitImpactElements.length).toBeGreaterThan(0)
        },
        { timeout: 10000 }
      )
    }, 15000)

    it('should display comparison table with product allocations', async () => {
      render(<Optimizer useDemoData={true} />)

      // Configure and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByText('Assortment Comparison')).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    }, 10000)
  })

  describe('Store Selection', () => {
    it('should work with selected store from state', async () => {
      // Set a store in the state
      setStoreState({ selectedStore: 'store-001' })

      render(<Optimizer useDemoData={true} />)

      // Configure and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByText(/Optimization completed/)).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    }, 10000)
  })

  describe('Error Handling', () => {
    it('should keep run button disabled without constraints', () => {
      render(<Optimizer useDemoData={true} />)

      // Without selecting any preset, the run button should be disabled
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      expect(runButton).toBeDisabled()
    })
  })

  describe('About Section', () => {
    it('should toggle about section visibility', async () => {
      render(<Optimizer useDemoData={true} />)

      const aboutButton = screen.getByRole('button', { name: /About Assortment Optimization/i })

      // Initially collapsed - about content should not be visible
      expect(screen.queryByText('What is Assortment Optimization?')).not.toBeInTheDocument()

      // Click to expand
      await userEvent.click(aboutButton)

      // Should show about content
      expect(screen.getByText('What is Assortment Optimization?')).toBeInTheDocument()

      // Click again to collapse
      await userEvent.click(aboutButton)

      // Should hide about content
      expect(screen.queryByText('What is Assortment Optimization?')).not.toBeInTheDocument()
    })
  })
})
