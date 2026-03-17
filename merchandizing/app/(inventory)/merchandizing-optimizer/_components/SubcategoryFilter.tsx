"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssortmentFilters } from "@/features/assortment/hooks/use-assortment-filters";

const DEMO_SUBCATEGORIES = ["Cola", "Lemon-Lime", "Orange", "Root Beer", "Sparkling Water", "Energy"];

export function SubcategoryFilter() {
  const {
    selectedSubcategories,
    subcategories: apiSubcategories,
    subcategoriesLoading,
    toggleSubcategory,
    clearSubcategories,
    selectAllSubcategories,
  } = useAssortmentFilters();

  const subcategories = apiSubcategories.length > 0 ? apiSubcategories : DEMO_SUBCATEGORIES;

  if (subcategoriesLoading) {
    return <div className="text-sm text-muted-foreground">Loading filters...</div>;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium whitespace-nowrap">Subcategory:</span>
      <div className="flex gap-1 flex-wrap">
        {subcategories.map((subcategory) => {
          const isSelected = selectedSubcategories.includes(subcategory);
          return (
            <Badge
              key={subcategory}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSubcategory(subcategory)}
            >
              {subcategory}
            </Badge>
          );
        })}
      </div>
      {selectedSubcategories.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearSubcategories}>
          Clear
        </Button>
      )}
      {selectedSubcategories.length !== subcategories.length && subcategories.length > 0 && (
        <Button variant="ghost" size="sm" onClick={selectAllSubcategories}>
          All
        </Button>
      )}
    </div>
  );
}
