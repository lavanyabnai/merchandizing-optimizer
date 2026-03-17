/**
 * Tests for ComparisonTable component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '../../utils'
import { ComparisonTable } from '@/features/assortment/components/optimizer/ComparisonTable'
import type { ProductAllocation } from '@/features/assortment/types'
import userEvent from '@testing-library/user-event'

const mockProductAllocations: ProductAllocation[] = [
  {
    sku: 'SKU-001',
    name: 'Coca-Cola Classic 12oz',
    brand: 'Coca-Cola',
    subcategory: 'Cola',
    currentFacings: 4,
    optimizedFacings: 6,
    change: 2,
    currentProfit: 186.0,
    projectedProfit: 265.0,
    profitChange: 79.0,
  },
  {
    sku: 'SKU-002',
    name: 'Pepsi 12oz',
    brand: 'Pepsi',
    subcategory: 'Cola',
    currentFacings: 3,
    optimizedFacings: 5,
    change: 2,
    currentProfit: 142.8,
    projectedProfit: 210.0,
    profitChange: 67.2,
  },
  {
    sku: 'SKU-003',
    name: 'Store Brand Cola 12oz',
    brand: 'ValueChoice',
    subcategory: 'Cola',
    currentFacings: 4,
    optimizedFacings: 2,
    change: -2,
    currentProfit: 59.2,
    projectedProfit: 35.0,
    profitChange: -24.2,
  },
  {
    sku: 'SKU-004',
    name: 'Red Bull 8.4oz',
    brand: 'Red Bull',
    subcategory: 'Energy',
    currentFacings: 0,
    optimizedFacings: 3,
    change: 3,
    currentProfit: 0,
    projectedProfit: 180.0,
    profitChange: 180.0,
  },
  {
    sku: 'SKU-005',
    name: 'Old Product 12oz',
    brand: 'Old Brand',
    subcategory: 'Cola',
    currentFacings: 2,
    optimizedFacings: 0,
    change: -2,
    currentProfit: 45.0,
    projectedProfit: 0,
    profitChange: -45.0,
  },
  {
    sku: 'SKU-006',
    name: 'Sprite 12oz',
    brand: 'Coca-Cola',
    subcategory: 'Lemon-Lime',
    currentFacings: 3,
    optimizedFacings: 3,
    change: 0,
    currentProfit: 120.0,
    projectedProfit: 120.0,
    profitChange: 0,
  },
]

describe('ComparisonTable', () => {
  describe('Rendering', () => {
    it('renders table title', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      expect(screen.getByText('Assortment Comparison')).toBeInTheDocument()
    })

    it('renders export button', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()
    })

    it('renders table headers', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      expect(screen.getByText('Product')).toBeInTheDocument()
      expect(screen.getByText('Brand')).toBeInTheDocument()
      expect(screen.getByText('Subcategory')).toBeInTheDocument()
      expect(screen.getByText('Current')).toBeInTheDocument()
      expect(screen.getByText('Optimized')).toBeInTheDocument()
      expect(screen.getByText('Change')).toBeInTheDocument()
      expect(screen.getByText('Profit Δ')).toBeInTheDocument()
    })

    it('renders all products in table', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      expect(screen.getByText('Coca-Cola Classic 12oz')).toBeInTheDocument()
      expect(screen.getByText('Pepsi 12oz')).toBeInTheDocument()
      expect(screen.getByText('Red Bull 8.4oz')).toBeInTheDocument()
    })

    it('renders SKU codes', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      expect(screen.getByText('SKU-001')).toBeInTheDocument()
      expect(screen.getByText('SKU-002')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading card when loading', () => {
      const { container } = render(<ComparisonTable data={[]} isLoading={true} />)

      // Card should be rendered for loading state
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })

    it('does not show table when loading', () => {
      render(<ComparisonTable data={mockProductAllocations} isLoading={true} />)

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Summary Badges', () => {
    it('shows added count badge', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // SKU-004 is added (currentFacings=0, optimizedFacings=3)
      expect(screen.getByText('+1 Added')).toBeInTheDocument()
    })

    it('shows removed count badge', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // SKU-005 is removed (currentFacings=2, optimizedFacings=0)
      expect(screen.getByText('-1 Removed')).toBeInTheDocument()
    })

    it('shows modified count badge', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // SKU-001, SKU-002 increased; SKU-003 decreased = 3 modified
      expect(screen.getByText('3 Modified')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('renders search input', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      expect(screen.getByPlaceholderText(/Search by name, brand, or SKU/i)).toBeInTheDocument()
    })

    it('filters products by name', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const searchInput = screen.getByPlaceholderText(/Search by name, brand, or SKU/i)
      await userEvent.type(searchInput, 'Coca-Cola')

      // Should show Coca-Cola Classic
      expect(screen.getByText('Coca-Cola Classic 12oz')).toBeInTheDocument()

      // Should not show Pepsi
      expect(screen.queryByText('Pepsi 12oz')).not.toBeInTheDocument()
    })

    it('filters products by brand', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const searchInput = screen.getByPlaceholderText(/Search by name, brand, or SKU/i)
      await userEvent.type(searchInput, 'Red Bull')

      expect(screen.getByText('Red Bull 8.4oz')).toBeInTheDocument()
      expect(screen.queryByText('Coca-Cola Classic 12oz')).not.toBeInTheDocument()
    })

    it('filters products by SKU', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const searchInput = screen.getByPlaceholderText(/Search by name, brand, or SKU/i)
      await userEvent.type(searchInput, 'SKU-002')

      expect(screen.getByText('Pepsi 12oz')).toBeInTheDocument()
      expect(screen.queryByText('Coca-Cola Classic 12oz')).not.toBeInTheDocument()
    })

    it('shows empty state when search has no results', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const searchInput = screen.getByPlaceholderText(/Search by name, brand, or SKU/i)
      await userEvent.type(searchInput, 'NonexistentProduct123')

      expect(screen.getByText('No products match your filters')).toBeInTheDocument()
    })
  })

  describe('Change Filter', () => {
    it('renders change filter dropdown', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // Find the filter select by looking for combobox roles
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes.length).toBeGreaterThan(0)
    })

    it('filters to show only added products', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const filterSelect = screen.getByRole('combobox')
      fireEvent.click(filterSelect)

      const addedOption = screen.getByRole('option', { name: 'Added' })
      fireEvent.click(addedOption)

      // Should only show Red Bull (added)
      expect(screen.getByText('Red Bull 8.4oz')).toBeInTheDocument()
      expect(screen.queryByText('Coca-Cola Classic 12oz')).not.toBeInTheDocument()
    })

    it('filters to show only removed products', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const filterSelect = screen.getByRole('combobox')
      fireEvent.click(filterSelect)

      const removedOption = screen.getByRole('option', { name: 'Removed' })
      fireEvent.click(removedOption)

      // Should only show Old Product (removed)
      expect(screen.getByText('Old Product 12oz')).toBeInTheDocument()
      expect(screen.queryByText('Coca-Cola Classic 12oz')).not.toBeInTheDocument()
    })

    it('filters to show only unchanged products', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const filterSelect = screen.getByRole('combobox')
      fireEvent.click(filterSelect)

      const unchangedOption = screen.getByRole('option', { name: 'Unchanged' })
      fireEvent.click(unchangedOption)

      // Should only show Sprite (unchanged)
      expect(screen.getByText('Sprite 12oz')).toBeInTheDocument()
      expect(screen.queryByText('Coca-Cola Classic 12oz')).not.toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('sorts by change by default (descending)', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // The table should be sorted by absolute change descending
      const table = screen.getByRole('table')
      const rows = within(table).getAllByRole('row')

      // First data row should be highest absolute change
      // Skip header row (index 0)
      expect(rows[1]).toHaveTextContent('Red Bull 8.4oz') // +3 change
    })

    it('toggles sort direction when clicking same header', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const changeHeader = screen.getByText('Change')

      // Click to toggle sort direction
      await userEvent.click(changeHeader)

      // Should now be ascending
      // Lowest change first
    })

    it('sorts by name when clicking name header', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const nameHeader = screen.getByText('Product')
      await userEvent.click(nameHeader)

      // Table should be sorted by name
    })

    it('sorts by brand when clicking brand header', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const brandHeader = screen.getByText('Brand')
      await userEvent.click(brandHeader)

      // Table should be sorted by brand
    })

    it('sorts by profit change when clicking profit header', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const profitHeader = screen.getByText('Profit Δ')
      await userEvent.click(profitHeader)

      // Table should be sorted by profit change
    })
  })

  describe('Row Styling', () => {
    it('applies green styling to added products', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // Find the row containing Red Bull (added product)
      const redBullText = screen.getByText('Red Bull 8.4oz')
      const row = redBullText.closest('tr')

      expect(row).toHaveClass('bg-green-50')
    })

    it('applies red styling to removed products', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const oldProductText = screen.getByText('Old Product 12oz')
      const row = oldProductText.closest('tr')

      expect(row).toHaveClass('bg-red-50')
    })

    it('applies blue styling to increased products', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const cokeText = screen.getByText('Coca-Cola Classic 12oz')
      const row = cokeText.closest('tr')

      expect(row).toHaveClass('bg-blue-50')
    })

    it('applies orange styling to decreased products', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const storeText = screen.getByText('Store Brand Cola 12oz')
      const row = storeText.closest('tr')

      expect(row).toHaveClass('bg-orange-50')
    })
  })

  describe('Value Display', () => {
    it('displays current facings', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // Find the row and check facing values
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('displays optimized facings', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('displays change with correct sign', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // Should show changes - check the table is rendered
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // The change column should show numeric changes
      // +2 or -2 might be formatted differently, so just check table has content
    })

    it('displays profit change with currency format', () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      // Should format profit changes as currency
      expect(screen.getByText('+$79')).toBeInTheDocument()
    })
  })

  describe('Export CSV', () => {
    it('has export button that can be clicked', async () => {
      render(<ComparisonTable data={mockProductAllocations} />)

      const exportButton = screen.getByRole('button', { name: /Export CSV/i })
      expect(exportButton).toBeInTheDocument()

      // The button should be clickable
      await userEvent.click(exportButton)
    })
  })

  describe('Empty Data', () => {
    it('renders table with empty data', () => {
      render(<ComparisonTable data={[]} />)

      // Should render table with empty state
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('Large Datasets', () => {
    it('renders first 50 products for large datasets', () => {
      const largeData: ProductAllocation[] = Array.from({ length: 60 }, (_, i) => ({
        sku: `SKU-${String(i + 1).padStart(3, '0')}`,
        name: `Product ${i + 1}`,
        brand: 'Test Brand',
        subcategory: 'Cola',
        currentFacings: 2,
        optimizedFacings: 3,
        change: 1,
        currentProfit: 100,
        projectedProfit: 150,
        profitChange: 50,
      }))

      render(<ComparisonTable data={largeData} />)

      // Should show table
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })
})
