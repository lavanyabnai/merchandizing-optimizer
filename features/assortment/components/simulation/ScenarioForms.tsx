"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Check,
  ChevronsUpDown,
  X,
  HelpCircle,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/features/assortment/types";

// ============================================================================
// Remove SKU Form
// ============================================================================

interface RemoveSkuFormProps {
  products: ProductSummary[];
  selectedSkuIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function RemoveSkuForm({
  products,
  selectedSkuIds,
  onSelectionChange,
  disabled = false,
}: RemoveSkuFormProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedProducts = useMemo(() => {
    return selectedSkuIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as ProductSummary[];
  }, [selectedSkuIds, products]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.filter((p) => !selectedSkuIds.includes(p.id));
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        !selectedSkuIds.includes(p.id) &&
        (p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query))
    );
  }, [products, searchQuery, selectedSkuIds]);

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

  const handleSelect = (productId: string) => {
    onSelectionChange([...selectedSkuIds, productId]);
  };

  const handleRemove = (productId: string) => {
    onSelectionChange(selectedSkuIds.filter((id) => id !== productId));
  };

  // Calculate estimated impact
  const estimatedImpact = useMemo(() => {
    const totalRevenue = selectedProducts.reduce((sum, p) => sum + p.price * 100, 0); // Rough estimate
    return totalRevenue;
  }, [selectedProducts]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Select SKUs to Remove
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Select one or more SKUs to simulate removal. The model calculates
                  how much demand transfers to substitutes vs. is lost (walk-away).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Products Chips */}
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedProducts.map((product) => (
              <Badge
                key={product.id}
                variant="secondary"
                className="gap-1 pr-1 bg-red-100 text-red-800 hover:bg-red-200"
              >
                <span className="max-w-[150px] truncate text-xs">
                  {product.name}
                </span>
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={disabled}
                  className="ml-1 rounded-full hover:bg-red-300 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Product Selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="w-full justify-between text-sm font-normal"
            >
              <span className="text-muted-foreground">
                Select SKUs to remove ({selectedSkuIds.length} selected)
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search products..."
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
                            {product.brand} · ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4",
                            selectedSkuIds.includes(product.id)
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

        {/* Impact Preview */}
        {selectedProducts.length > 0 && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>Impact Preview:</strong> Removing {selectedProducts.length} SKU(s)
              may affect ~${estimatedImpact.toLocaleString()} in weekly revenue.
              Run simulation to see full analysis.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Add SKU Form
// ============================================================================

export interface NewProductData {
  name: string;
  brand: string;
  subcategory: string;
  size: string;
  price: number;
  cost: number;
  similarToSku?: string;
  incrementalPct: number;
}

interface AddSkuFormProps {
  products: ProductSummary[];
  value: NewProductData;
  onChange: (data: NewProductData) => void;
  disabled?: boolean;
}

export function AddSkuForm({
  products,
  value,
  onChange,
  disabled = false,
}: AddSkuFormProps) {
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).sort();
  }, [products]);

  const subcategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.subcategory))).sort();
  }, [products]);

  const sizes = ["12oz Can", "20oz Bottle", "2L Bottle", "6-Pack", "12-Pack"];

  const handleChange = (field: keyof NewProductData, fieldValue: string | number) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const cannibalizationPct = 100 - value.incrementalPct;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            New Product Configuration
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Define the characteristics of the new product. Use "Similar to"
                  to base demand estimates on an existing product.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={value.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="New Beverage Product"
            disabled={disabled}
          />
        </div>

        {/* Brand & Subcategory */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={value.brand}
              onValueChange={(v) => handleChange("brand", v)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Select
              value={value.subcategory}
              onValueChange={(v) => handleChange("subcategory", v)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label>Size</Label>
          <Select
            value={value.size}
            onValueChange={(v) => handleChange("size", v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price & Cost */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min={0.5}
              max={50}
              step={0.5}
              value={value.price}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              min={0.1}
              max={40}
              step={0.25}
              value={value.cost}
              onChange={(e) => handleChange("cost", parseFloat(e.target.value) || 0)}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Similar To */}
        <div className="space-y-2">
          <Label>Similar To (for demand estimation)</Label>
          <Select
            value={value.similarToSku || ""}
            onValueChange={(v) => handleChange("similarToSku", v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional - select similar product" />
            </SelectTrigger>
            <SelectContent>
              {products.slice(0, 20).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.brand})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Incremental Demand */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Incremental Demand %</Label>
            <span className="text-sm font-bold text-primary">
              {value.incrementalPct}%
            </span>
          </div>
          <Slider
            value={[value.incrementalPct]}
            onValueChange={([v]) => handleChange("incrementalPct", v)}
            min={10}
            max={60}
            step={5}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Percentage of new product demand that is truly incremental (vs cannibalization)
          </p>
        </div>

        {/* Cannibalization Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Demand Split:</strong> {value.incrementalPct}% incremental (new to category)
            + {cannibalizationPct}% cannibalized from similar products
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Change Facings Form
// ============================================================================

interface ChangeFacingsFormProps {
  products: ProductSummary[];
  selectedSkuId: string | null;
  onSkuChange: (skuId: string) => void;
  currentFacings: number;
  newFacings: number;
  onFacingsChange: (facings: number) => void;
  disabled?: boolean;
}

export function ChangeFacingsForm({
  products,
  selectedSkuId,
  onSkuChange,
  currentFacings,
  newFacings,
  onFacingsChange,
  disabled = false,
}: ChangeFacingsFormProps) {
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedSkuId);
  }, [products, selectedSkuId]);

  const changePercent = currentFacings > 0
    ? ((newFacings - currentFacings) / currentFacings) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Change Facings Configuration
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Simulate increasing or decreasing shelf space for a product.
                  Uses space elasticity to estimate sales impact.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selector */}
        <div className="space-y-2">
          <Label>Select Product</Label>
          <Select
            value={selectedSkuId || ""}
            onValueChange={onSkuChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.brand}) - ${product.price.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <>
            {/* Current Facings */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Current Facings</span>
              <span className="text-lg font-bold">{currentFacings}</span>
            </div>

            {/* New Facings Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>New Facings</Label>
                <span className="text-sm font-bold text-primary">
                  {newFacings}
                </span>
              </div>
              <Slider
                value={[newFacings]}
                onValueChange={([v]) => onFacingsChange(v)}
                min={0}
                max={10}
                step={1}
                disabled={disabled}
              />
            </div>

            {/* Change Indicator */}
            {newFacings !== currentFacings && (
              <Alert className={cn(
                newFacings > currentFacings
                  ? "bg-green-50 border-green-200"
                  : "bg-orange-50 border-orange-200"
              )}>
                {newFacings > currentFacings ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                )}
                <AlertDescription className={cn(
                  "text-sm",
                  newFacings > currentFacings ? "text-green-800" : "text-orange-800"
                )}>
                  {newFacings > currentFacings ? "Increasing" : "Decreasing"} facings by{" "}
                  <strong>{Math.abs(changePercent).toFixed(0)}%</strong>
                  {" "}({currentFacings} → {newFacings})
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Change Price Form
// ============================================================================

interface ChangePriceFormProps {
  products: ProductSummary[];
  selectedSkuId: string | null;
  onSkuChange: (skuId: string) => void;
  currentPrice: number;
  newPrice: number;
  onPriceChange: (price: number) => void;
  disabled?: boolean;
}

export function ChangePriceForm({
  products,
  selectedSkuId,
  onSkuChange,
  currentPrice,
  newPrice,
  onPriceChange,
  disabled = false,
}: ChangePriceFormProps) {
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedSkuId);
  }, [products, selectedSkuId]);

  const priceChangePercent = currentPrice > 0
    ? ((newPrice - currentPrice) / currentPrice) * 100
    : 0;

  const minPrice = currentPrice * 0.5;
  const maxPrice = currentPrice * 1.5;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Price Change Configuration
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  Simulate price increases or decreases. Uses price elasticity
                  (-1.5 to -2.5 typical for beverages) to estimate volume impact.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selector */}
        <div className="space-y-2">
          <Label>Select Product</Label>
          <Select
            value={selectedSkuId || ""}
            onValueChange={onSkuChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.brand}) - ${product.price.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <>
            {/* Current Price */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <span className="text-lg font-bold">${currentPrice.toFixed(2)}</span>
            </div>

            {/* New Price Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newPrice">New Price ($)</Label>
                <span className="text-sm font-bold text-primary">
                  ${newPrice.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[newPrice]}
                onValueChange={([v]) => onPriceChange(v)}
                min={minPrice}
                max={maxPrice}
                step={0.1}
                disabled={disabled}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>${minPrice.toFixed(2)} (-50%)</span>
                <span>${maxPrice.toFixed(2)} (+50%)</span>
              </div>
            </div>

            {/* Change Indicator */}
            {Math.abs(priceChangePercent) > 0.5 && (
              <Alert className={cn(
                priceChangePercent > 0
                  ? "bg-purple-50 border-purple-200"
                  : "bg-blue-50 border-blue-200"
              )}>
                {priceChangePercent > 0 ? (
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                )}
                <AlertDescription className={cn(
                  "text-sm",
                  priceChangePercent > 0 ? "text-purple-800" : "text-blue-800"
                )}>
                  {priceChangePercent > 0 ? "Price increase" : "Price decrease"} of{" "}
                  <strong>{Math.abs(priceChangePercent).toFixed(1)}%</strong>
                  {" "}(${currentPrice.toFixed(2)} → ${newPrice.toFixed(2)})
                </AlertDescription>
              </Alert>
            )}

            {/* Price Elasticity Note */}
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Price elasticity for beverages typically ranges from -1.5 to -2.5.
              A 10% price increase may result in 15-25% volume decrease.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
