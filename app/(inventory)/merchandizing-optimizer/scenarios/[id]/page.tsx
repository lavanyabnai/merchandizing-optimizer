"use client";

import { useParams } from "next/navigation";
import { ScenarioDetailPage } from "@/features/assortment/components/scenarios/ScenarioDetailPage";

export default function ScenarioDetailRoute() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <ScenarioDetailPage scenarioId={params.id} />
    </div>
  );
}
