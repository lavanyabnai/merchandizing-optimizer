/**
 * Zustand store for Assortment Optimizer state management
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AssortmentTab,
  OptimizationConstraints,
  BrandTier,
} from "../types";

// Default optimization constraints
const DEFAULT_CONSTRAINTS: OptimizationConstraints = {
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
};

interface AssortmentState {
  // Selection state
  selectedStore: string | null;
  selectedSubcategories: string[];
  selectedBrandTiers: BrandTier[];

  // Navigation state
  activeTab: AssortmentTab;

  // Optimization configuration
  optimizationConstraints: OptimizationConstraints;

  // Simulation configuration
  simulationConfig: {
    numTrials: number;
    demandCv: number;
  };

  // UI state
  isSidebarCollapsed: boolean;

  // Actions - Selection
  setSelectedStore: (storeId: string | null) => void;
  toggleSubcategory: (subcategory: string) => void;
  setSubcategories: (subcategories: string[]) => void;
  clearSubcategories: () => void;
  toggleBrandTier: (tier: BrandTier) => void;
  setBrandTiers: (tiers: BrandTier[]) => void;

  // Actions - Navigation
  setActiveTab: (tab: AssortmentTab) => void;

  // Actions - Optimization
  setConstraints: (constraints: Partial<OptimizationConstraints>) => void;
  resetConstraints: () => void;
  addMustCarry: (sku: string) => void;
  removeMustCarry: (sku: string) => void;
  addExclude: (sku: string) => void;
  removeExclude: (sku: string) => void;

  // Actions - Simulation
  setSimulationConfig: (config: Partial<{ numTrials: number; demandCv: number }>) => void;

  // Actions - UI
  toggleSidebar: () => void;

  // Actions - Reset
  reset: () => void;
}

export const useAssortmentStore = create<AssortmentState>()(
  persist(
    (set) => ({
      // Initial state
      selectedStore: null,
      selectedSubcategories: [],
      selectedBrandTiers: [],
      activeTab: "dashboard",
      optimizationConstraints: DEFAULT_CONSTRAINTS,
      simulationConfig: {
        numTrials: 5000,
        demandCv: 0.15,
      },
      isSidebarCollapsed: false,

      // Selection actions
      setSelectedStore: (storeId) =>
        set({ selectedStore: storeId }),

      toggleSubcategory: (subcategory) =>
        set((state) => ({
          selectedSubcategories: state.selectedSubcategories.includes(subcategory)
            ? state.selectedSubcategories.filter((s) => s !== subcategory)
            : [...state.selectedSubcategories, subcategory],
        })),

      setSubcategories: (subcategories) =>
        set({ selectedSubcategories: subcategories }),

      clearSubcategories: () =>
        set({ selectedSubcategories: [] }),

      toggleBrandTier: (tier) =>
        set((state) => ({
          selectedBrandTiers: state.selectedBrandTiers.includes(tier)
            ? state.selectedBrandTiers.filter((t) => t !== tier)
            : [...state.selectedBrandTiers, tier],
        })),

      setBrandTiers: (tiers) =>
        set({ selectedBrandTiers: tiers }),

      // Navigation actions
      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      // Optimization actions
      setConstraints: (constraints) =>
        set((state) => ({
          optimizationConstraints: {
            ...state.optimizationConstraints,
            ...constraints,
          },
        })),

      resetConstraints: () =>
        set({ optimizationConstraints: DEFAULT_CONSTRAINTS }),

      addMustCarry: (sku) =>
        set((state) => ({
          optimizationConstraints: {
            ...state.optimizationConstraints,
            mustCarry: state.optimizationConstraints.mustCarry.includes(sku)
              ? state.optimizationConstraints.mustCarry
              : [...state.optimizationConstraints.mustCarry, sku],
          },
        })),

      removeMustCarry: (sku) =>
        set((state) => ({
          optimizationConstraints: {
            ...state.optimizationConstraints,
            mustCarry: state.optimizationConstraints.mustCarry.filter(
              (s) => s !== sku
            ),
          },
        })),

      addExclude: (sku) =>
        set((state) => ({
          optimizationConstraints: {
            ...state.optimizationConstraints,
            exclude: state.optimizationConstraints.exclude.includes(sku)
              ? state.optimizationConstraints.exclude
              : [...state.optimizationConstraints.exclude, sku],
          },
        })),

      removeExclude: (sku) =>
        set((state) => ({
          optimizationConstraints: {
            ...state.optimizationConstraints,
            exclude: state.optimizationConstraints.exclude.filter(
              (s) => s !== sku
            ),
          },
        })),

      // Simulation actions
      setSimulationConfig: (config) =>
        set((state) => ({
          simulationConfig: {
            ...state.simulationConfig,
            ...config,
          },
        })),

      // UI actions
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // Reset action
      reset: () =>
        set({
          selectedStore: null,
          selectedSubcategories: [],
          selectedBrandTiers: [],
          activeTab: "dashboard",
          optimizationConstraints: DEFAULT_CONSTRAINTS,
          simulationConfig: {
            numTrials: 5000,
            demandCv: 0.15,
          },
        }),
    }),
    {
      name: "assortment-store",
      partialize: (state) => ({
        // Only persist certain fields
        selectedStore: state.selectedStore,
        selectedSubcategories: state.selectedSubcategories,
        activeTab: state.activeTab,
        optimizationConstraints: state.optimizationConstraints,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
