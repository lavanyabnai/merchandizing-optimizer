"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronsUpDown, X, HelpCircle, Star, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/features/assortment/types";

interface ProductSelectorProps {
  products: ProductSummary[];
  selectedIds: string[];
  excludedIds?: string[]; // IDs that cannot be selected (mutual exclusivity)
  onSelectionChange: (ids: string[]) => void;
  title: string;
  description: string;
  helpText: string;
  icon?: React.ReactNode;
  variant?: "mustCarry" | "exclude";
  disabled?: boolean;
  maxSelections?: number;
}

export function ProductSelector({
  products,
  selectedIds,
  excludedIds = [],
  onSelectionChange,
  title,
  description,
  helpText,
  icon,
  variant = "mustCarry",
  disabled = false,
  maxSelections,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out excluded products and already selected ones for display
  const availableProducts = useMemo(() => {
    return products.filter(
      (p) => !excludedIds.includes(p.id) && !selectedIds.includes(p.id)
    );
  }, [products, excludedIds, selectedIds]);

  // Filter based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.subcategory.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }, [availableProducts, searchQuery]);

  // Group products by subcategory
  const groupedProducts = useMemo(() => {
    const groups: Record<string, ProductSummary[]> = {};
    filteredProducts.forEach((product) => {
      if (!groups[product.subcategory]) {
        groups[product.subcategory] = [];
      }
      groups[product.subcategory].push(product);
    });
    return groups;
  }, [filteredProducts]);

  // Get selected products for display
  const selectedProducts = useMemo(() => {
    return selectedIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as ProductSummary[];
  }, [selectedIds, products]);

  const handleSelect = (productId: string) => {
    if (maxSelections && selectedIds.length >= maxSelections) {
      return;
    }
    onSelectionChange([...selectedIds, productId]);
  };

  const handleRemove = (productId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== productId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const variantStyles = {
    mustCarry: {
      badge: "bg-green-100 text-green-800 hover:bg-green-200",
      icon: <Star className="h-4 w-4 text-green-600" />,
    },
    exclude: {
      badge: "bg-red-100 text-red-800 hover:bg-red-200",
      icon: <Ban className="h-4 w-4 text-red-600" />,
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon || styles.icon}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Selected Products Chips */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedProducts.map((product) => (
              <Badge
                key={product.id}
                variant="secondary"
                className={cn("gap-1 pr-1", styles.badge)}
              >
                <span className="max-w-[150px] truncate text-xs">
                  {product.name}
                </span>
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={disabled}
                  className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Product Selector Dropdown */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled || (maxSelections !== undefined && selectedIds.length >= maxSelections)}
              className="w-full justify-between text-sm font-normal"
            >
              <span className="text-muted-foreground">
                {maxSelections
                  ? `Select products (${selectedIds.length}/${maxSelections})`
                  : `Select products (${selectedIds.length} selected)`}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search by name, brand, or SKU..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                {Object.entries(groupedProducts).map(([subcategory, prods]) => (
                  <CommandGroup key={subcategory} heading={subcategory}>
                    {prods.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={`${product.name} ${product.brand} ${product.sku}`}
                        onSelect={() => {
                          handleSelect(product.id);
                          setSearchQuery("");
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {product.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.brand} · {product.sku} · ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4",
                            selectedIds.includes(product.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Count indicator */}
        <p className="text-xs text-muted-foreground text-right">
          {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} selected
          {excludedIds.length > 0 && (
            <span className="ml-2">
              · {excludedIds.length} unavailable
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

// Convenience wrappers for must-carry and exclude selectors

interface MustCarrySelectorProps {
  products: ProductSummary[];
  selectedIds: string[];
  excludedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function MustCarrySelector({
  products,
  selectedIds,
  excludedIds,
  onSelectionChange,
  disabled,
}: MustCarrySelectorProps) {
  return (
    <ProductSelector
      products={products}
      selectedIds={selectedIds}
      excludedIds={excludedIds}
      onSelectionChange={onSelectionChange}
      title="Must-Carry SKUs"
      description="Products that must be included regardless of profitability"
      helpText="These products will always be included in the optimized assortment. Use for hero SKUs, contractual obligations, or traffic-driving items that customers expect."
      variant="mustCarry"
      disabled={disabled}
    />
  );
}

interface ExcludeSelectorProps {
  products: ProductSummary[];
  selectedIds: string[];
  excludedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function ExcludeSelector({
  products,
  selectedIds,
  excludedIds,
  onSelectionChange,
  disabled,
}: ExcludeSelectorProps) {
  return (
    <ProductSelector
      products={products}
      selectedIds={selectedIds}
      excludedIds={excludedIds}
      onSelectionChange={onSelectionChange}
      title="Exclude SKUs"
      description="Products to remove from consideration"
      helpText="These products will never be included in the optimized assortment. Use for discontinued items, supplier issues, or products you want to phase out."
      variant="exclude"
      disabled={disabled}
    />
  );
}
