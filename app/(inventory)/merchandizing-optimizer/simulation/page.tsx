"use client";

import { Simulation } from "@/features/assortment/components/simulation";
import { StoreSelector } from "../_components/StoreSelector";

export default function SimulationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Monte Carlo Simulation</h1>
        <StoreSelector />
      </div>
      <Simulation useDemoData={false} />
    </div>
  );
}
