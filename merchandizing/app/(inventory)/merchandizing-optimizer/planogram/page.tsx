"use client";

import { PlanogramGenerationApp } from "@/features/assortment/components/planogram/PlanogramGenerationApp";
import { StoreSelector } from "../_components/StoreSelector";

export default function PlanogramPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Planogram Generation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Physical shelf layout. Eye-level placement, brand blocking, fixture constraints.
          </p>
        </div>
        <StoreSelector />
      </div>
      <PlanogramGenerationApp />
    </div>
  );
}
