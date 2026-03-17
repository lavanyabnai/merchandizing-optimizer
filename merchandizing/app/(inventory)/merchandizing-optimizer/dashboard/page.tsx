"use client";

import { AssortmentTabs } from "../_components/AssortmentTabs";
import { StoreSelector } from "../_components/StoreSelector";
import { SubcategoryFilter } from "../_components/SubcategoryFilter";
import { Dashboard } from "@/features/assortment/components/dashboard";
import { CDTAnalysis } from "@/features/assortment/components/cdt";
import { Optimizer } from "@/features/assortment/components/optimizer";
import { Simulation } from "@/features/assortment/components/simulation";
import { Clustering } from "@/features/assortment/components/clustering";
import { Planogram } from "@/features/assortment/components/planogram";
import type { AssortmentTab } from "@/features/assortment/types";

// Tab content renderer
function renderTabContent(tab: AssortmentTab) {
  switch (tab) {
    case "dashboard":
      return <Dashboard useDemoData={true} />;
    case "cdt":
      return <CDTAnalysis useDemoData={true} />;
    case "optimizer":
      return <Optimizer useDemoData={true} />;
    case "simulation":
      return <Simulation useDemoData={true} />;
    case "clustering":
      return <Clustering useDemoData={true} />;
    case "planogram":
      return <Planogram useDemoData={true} />;
    default:
      return null;
  }
}

export default function AssortmentOptimizerPage() {
  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StoreSelector />
        <SubcategoryFilter />
      </div>

      {/* Main Content with Tabs */}
      <AssortmentTabs renderTabContent={renderTabContent} />
    </div>
  );
}
