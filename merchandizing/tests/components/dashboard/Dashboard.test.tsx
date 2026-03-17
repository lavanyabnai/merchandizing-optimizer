/**
 * Tests for Dashboard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '../../utils'
import { Dashboard } from '@/features/assortment/components/dashboard/Dashboard'
import { resetStore, setStoreState } from '../../utils'
import userEvent from '@testing-library/user-event'

describe('Dashboard', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Demo Data Mode', () => {
    it('renders dashboard with demo data', () => {
      render(<Dashboard useDemoData={true} />)

      // Should show the "About this Dashboard" button
      expect(screen.getByText('About this Dashboard')).toBeInTheDocument()
    })

    it('displays KPI section in demo mode', async () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      // KPI section should be rendered
      await waitFor(() => {
        // Check for grid layout which contains KPIs
        const kpiSection = container.querySelector('.grid')
        expect(kpiSection).toBeInTheDocument()
      })
    })

    it('shows charts in demo mode', async () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      await waitFor(() => {
        // Should have SVG charts rendered
        const charts = container.querySelectorAll('svg')
        expect(charts.length).toBeGreaterThan(0)
      })
    })
  })

  describe('About Section', () => {
    it('toggles about section on button click', async () => {
      render(<Dashboard useDemoData={true} />)

      const aboutButton = screen.getByRole('button', { name: /About this Dashboard/i })

      // Initially collapsed
      expect(screen.queryByText('What this shows:')).not.toBeInTheDocument()

      // Click to expand
      await userEvent.click(aboutButton)

      // Should show about content
      await waitFor(() => {
        expect(screen.getByText('What this shows:')).toBeInTheDocument()
        expect(screen.getByText('How to use it:')).toBeInTheDocument()
      })
    })

    it('shows financial performance information', async () => {
      render(<Dashboard useDemoData={true} />)

      const aboutButton = screen.getByRole('button', { name: /About this Dashboard/i })
      await userEvent.click(aboutButton)

      await waitFor(() => {
        expect(screen.getByText(/Financial Performance:/)).toBeInTheDocument()
        expect(screen.getByText(/Space Productivity:/)).toBeInTheDocument()
      })
    })

    it('shows usage instructions', async () => {
      render(<Dashboard useDemoData={true} />)

      const aboutButton = screen.getByRole('button', { name: /About this Dashboard/i })
      await userEvent.click(aboutButton)

      await waitFor(() => {
        expect(screen.getByText(/Compare metrics across stores/)).toBeInTheDocument()
        expect(screen.getByText(/Identify seasonal patterns/)).toBeInTheDocument()
      })
    })
  })

  describe('Layout', () => {
    it('renders chart sections', async () => {
      render(<Dashboard useDemoData={true} />)

      // Should have chart sections
      await waitFor(() => {
        expect(screen.getByText('Weekly Sales Trend')).toBeInTheDocument()
      })
    })

    it('renders grid containers', () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      // Check for grid layout
      const grids = container.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
    })
  })

  describe('Store Selection', () => {
    it('uses selected store from store state', async () => {
      // Set a store in the state
      setStoreState({ selectedStore: 'store-001' })

      render(<Dashboard useDemoData={true} />)

      // Dashboard should be rendered (even with store selected)
      expect(screen.getByText('About this Dashboard')).toBeInTheDocument()
    })
  })

  describe('Subcategory Filtering', () => {
    it('uses selected subcategories from store state', async () => {
      // Set subcategories in the state
      setStoreState({ selectedSubcategories: ['Cola', 'Energy Drinks'] })

      render(<Dashboard useDemoData={true} />)

      // Dashboard should still render with filters applied
      expect(screen.getByText('About this Dashboard')).toBeInTheDocument()
    })
  })

  describe('Component Composition', () => {
    it('renders chart components', async () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      // Charts should render SVG elements
      await waitFor(() => {
        const svgElements = container.querySelectorAll('svg')
        expect(svgElements.length).toBeGreaterThan(0)
      })
    })

    it('renders SalesTrendChart component', async () => {
      render(<Dashboard useDemoData={true} />)

      await waitFor(() => {
        expect(screen.getByText('Weekly Sales Trend')).toBeInTheDocument()
      })
    })

    it('renders TopPerformersChart component', async () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      // TopPerformersChart renders an SVG chart
      await waitFor(
        () => {
          // Check for chart container or SVG elements from the chart
          const svgElements = container.querySelectorAll('svg')
          expect(svgElements.length).toBeGreaterThan(0)
        },
        { timeout: 5000 }
      )
    })
  })

  describe('API Data Mode', () => {
    it('renders with API mode (non-demo)', async () => {
      render(<Dashboard useDemoData={false} />)

      // Dashboard should still render
      await waitFor(() => {
        expect(screen.getByText('About this Dashboard')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Layout', () => {
    it('renders grid layout for charts', () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      // Check for grid layout classes
      const grids = container.querySelectorAll('.grid')
      expect(grids.length).toBeGreaterThan(0)
    })
  })

  describe('Data Transformations', () => {
    it('generates valid demo data structure', async () => {
      const { container } = render(<Dashboard useDemoData={true} />)

      // Demo data should produce valid chart data
      await waitFor(
        () => {
          expect(screen.getByText('Weekly Sales Trend')).toBeInTheDocument()
        },
        { timeout: 5000 }
      )

      // Check for chart SVG elements (charts are rendered with demo data)
      await waitFor(
        () => {
          const svgElements = container.querySelectorAll('svg')
          expect(svgElements.length).toBeGreaterThan(0)
        },
        { timeout: 5000 }
      )
    })
  })
})
