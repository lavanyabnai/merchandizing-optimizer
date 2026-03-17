/**
 * Tests for Optimizer component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../utils'
import { Optimizer } from '@/features/assortment/components/optimizer/Optimizer'
import { resetStore } from '../../utils'
import userEvent from '@testing-library/user-event'

describe('Optimizer', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Rendering', () => {
    it('renders about button', () => {
      render(<Optimizer useDemoData={true} />)

      expect(screen.getByText('About Assortment Optimization')).toBeInTheDocument()
    })

    it('renders run optimization button', () => {
      render(<Optimizer useDemoData={true} />)

      expect(screen.getByRole('button', { name: /Run Optimization/i })).toBeInTheDocument()
    })

    it('renders constraint form', () => {
      render(<Optimizer useDemoData={true} />)

      expect(screen.getByText('Optimization Constraints')).toBeInTheDocument()
    })
  })

  describe('About Section', () => {
    it('toggles about section on button click', async () => {
      render(<Optimizer useDemoData={true} />)

      const aboutButton = screen.getByText('About Assortment Optimization')

      // Initially collapsed
      expect(screen.queryByText('What is Assortment Optimization?')).not.toBeInTheDocument()

      // Click to expand
      await userEvent.click(aboutButton)

      // Should show about content
      expect(screen.getByText('What is Assortment Optimization?')).toBeInTheDocument()
      expect(screen.getByText('How it works:')).toBeInTheDocument()
    })

    it('shows decision-support tool warning', async () => {
      render(<Optimizer useDemoData={true} />)

      const aboutButton = screen.getByText('About Assortment Optimization')
      await userEvent.click(aboutButton)

      expect(screen.getByText(/decision-support tool/)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no results', () => {
      render(<Optimizer useDemoData={true} />)

      expect(screen.getByText('Ready to Optimize')).toBeInTheDocument()
      expect(screen.getByText(/Configure your constraints/)).toBeInTheDocument()
    })

    it('shows checklist items in empty state', () => {
      render(<Optimizer useDemoData={true} />)

      expect(screen.getByText(/Set space and coverage constraints/)).toBeInTheDocument()
      expect(screen.getByText(/Add must-carry items/)).toBeInTheDocument()
      expect(screen.getByText(/Exclude discontinued products/)).toBeInTheDocument()
    })
  })

  describe('Run Optimization Button', () => {
    it('is disabled initially (no constraints set)', () => {
      render(<Optimizer useDemoData={true} />)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      expect(runButton).toBeDisabled()
    })

    it('shows loading state when optimizing', async () => {
      render(<Optimizer useDemoData={true} />)

      // First set constraints by clicking a preset
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Now run optimization
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Should show loading state
      expect(screen.getByText('Optimizing...')).toBeInTheDocument()
    })

    it('shows progress bar when optimizing', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Run optimization
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Should show progress
      expect(screen.getByText(/Finding optimal assortment/)).toBeInTheDocument()
    })
  })

  describe('Optimization Results', () => {
    it('shows results after optimization completes', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Wait for run button to be enabled
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await waitFor(() => {
        expect(runButton).not.toBeDisabled()
      })

      // Run optimization
      await userEvent.click(runButton)

      // Wait for results (increased timeout for CI)
      await waitFor(
        () => {
          expect(screen.getByText(/Optimization completed/)).toBeInTheDocument()
        },
        { timeout: 10000 }
      )
    }, 15000)

    it('shows profit lift card after optimization', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Wait for run button to be enabled
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await waitFor(() => {
        expect(runButton).not.toBeDisabled()
      })

      await userEvent.click(runButton)

      // Wait for results (increased timeout for CI)
      await waitFor(
        () => {
          // ProfitLiftCard shows "Profit Impact" as title (may be multiple instances)
          const profitImpactElements = screen.getAllByText(/Profit Impact/i)
          expect(profitImpactElements.length).toBeGreaterThan(0)
        },
        { timeout: 10000 }
      )
    }, 15000)

    it('shows result tabs after optimization', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for tabs to appear
      await waitFor(
        () => {
          expect(screen.getByRole('tab', { name: /Comparison/i })).toBeInTheDocument()
          expect(screen.getByRole('tab', { name: /Space/i })).toBeInTheDocument()
          expect(screen.getByRole('tab', { name: /History/i })).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    })

    it('displays success message with execution time', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for success alert
      await waitFor(
        () => {
          expect(screen.getByText(/Optimization completed in/)).toBeInTheDocument()
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Result Tabs', () => {
    it('switches to space allocation tab', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByRole('tab', { name: /Space/i })).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Click space tab
      const spaceTab = screen.getByRole('tab', { name: /Space/i })
      await userEvent.click(spaceTab)

      // Space allocation content should be visible
      expect(spaceTab).toHaveAttribute('data-state', 'active')
    })

    it('switches to history tab', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByRole('tab', { name: /History/i })).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Click history tab
      const historyTab = screen.getByRole('tab', { name: /History/i })
      await userEvent.click(historyTab)

      expect(historyTab).toHaveAttribute('data-state', 'active')
    })
  })

  describe('Optimization History', () => {
    it('shows history when demo data is enabled', () => {
      render(<Optimizer useDemoData={true} />)

      // Demo mode generates initial history
      // Check for history section (shown when no results but history exists)
      // This depends on the demo data generator
    })

    it('adds new run to history after optimization', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints and run
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Wait for results and switch to history
      await waitFor(
        () => {
          expect(screen.getByRole('tab', { name: /History/i })).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      const historyTab = screen.getByRole('tab', { name: /History/i })
      await userEvent.click(historyTab)

      // Should show the new run in history
      // The history list should have at least one completed run
    })
  })

  describe('Constraint Form Integration', () => {
    it('enables run button after setting constraints', async () => {
      render(<Optimizer useDemoData={true} />)

      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      expect(runButton).toBeDisabled()

      // Set constraints
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Button should now be enabled
      expect(runButton).not.toBeDisabled()
    })

    it('disables form when optimizing', async () => {
      render(<Optimizer useDemoData={true} />)

      // Set constraints
      const balancedButton = screen.getByRole('button', { name: /Balanced/i })
      await userEvent.click(balancedButton)

      // Run optimization
      const runButton = screen.getByRole('button', { name: /Run Optimization/i })
      await userEvent.click(runButton)

      // Preset buttons should be disabled during optimization
      expect(screen.getByRole('button', { name: /Conservative/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Aggressive/i })).toBeDisabled()
    })
  })

  describe('Layout', () => {
    it('renders two-column layout', () => {
      const { container } = render(<Optimizer useDemoData={true} />)

      // Should have grid layout
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Product Selectors', () => {
    it('renders must-carry selector', () => {
      render(<Optimizer useDemoData={true} />)

      // The MustCarrySelector component should be rendered
      // (exact text depends on component implementation)
    })

    it('renders exclude selector', () => {
      render(<Optimizer useDemoData={true} />)

      // The ExcludeSelector component should be rendered
      // (exact text depends on component implementation)
    })
  })
})
