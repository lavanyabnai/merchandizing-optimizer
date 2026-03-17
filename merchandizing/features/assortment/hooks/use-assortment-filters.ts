/**
 * Custom hook for managing assortment filters
 */

import { useMemo } from "react";
import { useAssortmentStore } from "../store/use-assortment-store";
import { useGetSubcategories } from "../api/use-get-products";
import { useGetStoreOptions } from "../api/use-get-stores";
import type { BrandTier, StoreSummary } from "../types";

const BRAND_TIERS: BrandTier[] = ["Premium", "National A", "National B", "Store Brand"];

export const useAssortmentFilters = () => {
  // Get store state
  const {
    selectedStore,
    selectedSubcategories,
    selectedBrandTiers,
    setSelectedStore,
    toggleSubcategory,
    setSubcategories,
    clearSubcategories,
    toggleBrandTier,
    setBrandTiers,
  } = useAssortmentStore();

  // Fetch options
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useGetSubcategories();
  const { data: stores = [], isLoading: storesLoading } = useGetStoreOptions();

  // Compute selected store details
  const selectedStoreDetails = useMemo(() => {
    if (!selectedStore) return null;
    return stores.find((s: StoreSummary) => s.id === selectedStore) || null;
  }, [selectedStore, stores]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedStore !== null ||
      selectedSubcategories.length > 0 ||
      selectedBrandTiers.length > 0
    );
  }, [selectedStore, selectedSubcategories, selectedBrandTiers]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedStore(null);
    clearSubcategories();
    setBrandTiers([]);
  };

  // Select all subcategories
  const selectAllSubcategories = () => {
    setSubcategories(subcategories);
  };

  // Select all brand tiers
  const selectAllBrandTiers = () => {
    setBrandTiers(BRAND_TIERS);
  };

  return {
    // State
    selectedStore,
    selectedStoreDetails,
    selectedSubcategories,
    selectedBrandTiers,
    hasActiveFilters,

    // Options
    subcategories,
    stores,
    brandTiers: BRAND_TIERS,

    // Loading states
    isLoading: subcategoriesLoading || storesLoading,
    subcategoriesLoading,
    storesLoading,

    // Actions - Store
    setSelectedStore,

    // Actions - Subcategories
    toggleSubcategory,
    setSubcategories,
    clearSubcategories,
    selectAllSubcategories,

    // Actions - Brand tiers
    toggleBrandTier,
    setBrandTiers,
    selectAllBrandTiers,

    // Actions - All filters
    clearAllFilters,
  };
};
