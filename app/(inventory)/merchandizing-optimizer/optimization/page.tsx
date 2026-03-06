"use client";

import { Optimizer } from "@/features/assortment/components/optimizer";
import { StoreSelector } from "../_components/StoreSelector";

export default function OptimizationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Assortment Optimization</h1>
        <StoreSelector />
      </div>
      <Optimizer useDemoData={false} />
    </div>
  );
}
