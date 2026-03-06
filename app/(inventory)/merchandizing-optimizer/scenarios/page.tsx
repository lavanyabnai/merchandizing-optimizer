"use client";

import { ScenarioListPage } from "@/features/assortment/components/scenarios/ScenarioListPage";

export default function ScenariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scenario History</h1>
      <ScenarioListPage />
    </div>
  );
}
