/**
 * Tests for useAssortmentStore Zustand store
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAssortmentStore } from '@/features/assortment/store/use-assortment-store'

describe('useAssortmentStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAssortmentStore())
    act(() => {
      result.current.reset()
    })
  })

  describe('Initial State', () => {
    it('should have null selected store', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.selectedStore).toBeNull()
    })

    it('should have empty selected subcategories', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.selectedSubcategories).toEqual([])
    })

    it('should have empty selected brand tiers', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.selectedBrandTiers).toEqual([])
    })

    it('should have dashboard as active tab', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.activeTab).toBe('dashboard')
    })

    it('should have default optimization constraints', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.optimizationConstraints).toEqual({
        totalFacings: 100,
        minFacingsPerSku: 1,
        maxFacingsPerSku: 6,
        minSkus: 10,
        maxSkus: 50,
        mustCarry: [],
        exclude: [],
        maxSkusPerBrand: undefined,
        minPremiumShare: undefined,
        maxPrivateLabelShare: undefined,
      })
    })

    it('should have default simulation config', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.simulationConfig).toEqual({
        numTrials: 5000,
        demandCv: 0.15,
      })
    })

    it('should have sidebar not collapsed', () => {
      const { result } = renderHook(() => useAssortmentStore())
      expect(result.current.isSidebarCollapsed).toBe(false)
    })
  })

  describe('Store Selection', () => {
    it('should set selected store', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSelectedStore('store-001')
      })

      expect(result.current.selectedStore).toBe('store-001')
    })

    it('should clear selected store', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSelectedStore('store-001')
        result.current.setSelectedStore(null)
      })

      expect(result.current.selectedStore).toBeNull()
    })
  })

  describe('Subcategory Selection', () => {
    it('should toggle subcategory on', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.toggleSubcategory('Cola')
      })

      expect(result.current.selectedSubcategories).toContain('Cola')
    })

    it('should toggle subcategory off', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.toggleSubcategory('Cola')
        result.current.toggleSubcategory('Cola')
      })

      expect(result.current.selectedSubcategories).not.toContain('Cola')
    })

    it('should set multiple subcategories', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSubcategories(['Cola', 'Energy', 'Water'])
      })

      expect(result.current.selectedSubcategories).toEqual(['Cola', 'Energy', 'Water'])
    })

    it('should clear all subcategories', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSubcategories(['Cola', 'Energy'])
        result.current.clearSubcategories()
      })

      expect(result.current.selectedSubcategories).toEqual([])
    })
  })

  describe('Brand Tier Selection', () => {
    it('should toggle brand tier on', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.toggleBrandTier('Premium')
      })

      expect(result.current.selectedBrandTiers).toContain('Premium')
    })

    it('should toggle brand tier off', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.toggleBrandTier('Premium')
        result.current.toggleBrandTier('Premium')
      })

      expect(result.current.selectedBrandTiers).not.toContain('Premium')
    })

    it('should set multiple brand tiers', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setBrandTiers(['Premium', 'National A'])
      })

      expect(result.current.selectedBrandTiers).toEqual(['Premium', 'National A'])
    })
  })

  describe('Tab Navigation', () => {
    it('should set active tab', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setActiveTab('optimizer')
      })

      expect(result.current.activeTab).toBe('optimizer')
    })

    it('should allow all valid tabs', () => {
      const { result } = renderHook(() => useAssortmentStore())
      const tabs = ['dashboard', 'cdt', 'optimizer', 'simulation', 'clustering', 'planogram'] as const

      tabs.forEach(tab => {
        act(() => {
          result.current.setActiveTab(tab)
        })
        expect(result.current.activeTab).toBe(tab)
      })
    })
  })

  describe('Optimization Constraints', () => {
    it('should update constraints partially', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setConstraints({ totalFacings: 150 })
      })

      expect(result.current.optimizationConstraints.totalFacings).toBe(150)
      expect(result.current.optimizationConstraints.minFacingsPerSku).toBe(1)
    })

    it('should reset constraints to default', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setConstraints({ totalFacings: 200, minFacingsPerSku: 5 })
        result.current.resetConstraints()
      })

      expect(result.current.optimizationConstraints.totalFacings).toBe(100)
      expect(result.current.optimizationConstraints.minFacingsPerSku).toBe(1)
    })

    it('should add must-carry SKU', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.addMustCarry('SKU-001')
      })

      expect(result.current.optimizationConstraints.mustCarry).toContain('SKU-001')
    })

    it('should not add duplicate must-carry SKU', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.addMustCarry('SKU-001')
        result.current.addMustCarry('SKU-001')
      })

      expect(result.current.optimizationConstraints.mustCarry).toEqual(['SKU-001'])
    })

    it('should remove must-carry SKU', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.addMustCarry('SKU-001')
        result.current.removeMustCarry('SKU-001')
      })

      expect(result.current.optimizationConstraints.mustCarry).not.toContain('SKU-001')
    })

    it('should add exclude SKU', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.addExclude('SKU-002')
      })

      expect(result.current.optimizationConstraints.exclude).toContain('SKU-002')
    })

    it('should not add duplicate exclude SKU', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.addExclude('SKU-002')
        result.current.addExclude('SKU-002')
      })

      expect(result.current.optimizationConstraints.exclude).toEqual(['SKU-002'])
    })

    it('should remove exclude SKU', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.addExclude('SKU-002')
        result.current.removeExclude('SKU-002')
      })

      expect(result.current.optimizationConstraints.exclude).not.toContain('SKU-002')
    })
  })

  describe('Simulation Config', () => {
    it('should update simulation config', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSimulationConfig({ numTrials: 10000 })
      })

      expect(result.current.simulationConfig.numTrials).toBe(10000)
      expect(result.current.simulationConfig.demandCv).toBe(0.15)
    })

    it('should update demand CV', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSimulationConfig({ demandCv: 0.25 })
      })

      expect(result.current.simulationConfig.demandCv).toBe(0.25)
    })
  })

  describe('Sidebar', () => {
    it('should toggle sidebar', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.isSidebarCollapsed).toBe(true)

      act(() => {
        result.current.toggleSidebar()
      })

      expect(result.current.isSidebarCollapsed).toBe(false)
    })
  })

  describe('Reset', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useAssortmentStore())

      act(() => {
        result.current.setSelectedStore('store-001')
        result.current.setSubcategories(['Cola', 'Energy'])
        result.current.setActiveTab('optimizer')
        result.current.setConstraints({ totalFacings: 200 })
        result.current.reset()
      })

      expect(result.current.selectedStore).toBeNull()
      expect(result.current.selectedSubcategories).toEqual([])
      expect(result.current.activeTab).toBe('dashboard')
      expect(result.current.optimizationConstraints.totalFacings).toBe(100)
    })
  })
})
