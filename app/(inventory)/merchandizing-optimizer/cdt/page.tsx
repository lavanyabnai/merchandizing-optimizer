"use client";

import { CDTAnalysis } from "@/features/assortment/components/cdt";
import { StoreSelector } from "../_components/StoreSelector";
import { SubcategoryFilter } from "../_components/SubcategoryFilter";

export default function CDTPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">CDT Analysis</h1>
        <div className="flex items-center gap-4">
          <StoreSelector />
          <SubcategoryFilter />
        </div>
      </div>
      <CDTAnalysis useDemoData={false} />
    </div>
  );
}
