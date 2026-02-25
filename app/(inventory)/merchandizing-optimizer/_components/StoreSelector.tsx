"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssortmentFilters } from "@/features/assortment/hooks/use-assortment-filters";

export function StoreSelector() {
  const { selectedStore, setSelectedStore, stores, storesLoading } =
    useAssortmentFilters();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium whitespace-nowrap">Store:</label>
      <Select
        value={selectedStore || "all"}
        onValueChange={(value) =>
          setSelectedStore(value === "all" ? null : value)
        }
        disabled={storesLoading}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder={storesLoading ? "Loading..." : "All Stores"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stores</SelectItem>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name} ({store.format})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
