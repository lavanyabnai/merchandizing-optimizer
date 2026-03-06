"use client";

import { Planogram } from "@/features/assortment/components/planogram";
import { StoreSelector } from "../_components/StoreSelector";

export default function PlanogramPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Planogram</h1>
        <StoreSelector />
      </div>
      <Planogram useDemoData={false} />
    </div>
  );
}
