"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssortmentStore } from "@/features/assortment/store/use-assortment-store";
import type { AssortmentTab } from "@/features/assortment/types";

const TAB_CONFIG: { value: AssortmentTab; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "cdt", label: "CDT Analysis" },
  { value: "optimizer", label: "Optimizer" },
  { value: "simulation", label: "Simulation" },
  { value: "clustering", label: "Clustering" },
  { value: "planogram", label: "Planogram" },
];

interface AssortmentTabsProps {
  renderTabContent: (tab: AssortmentTab) => React.ReactNode;
}

export function AssortmentTabs({ renderTabContent }: AssortmentTabsProps) {
  const { activeTab, setActiveTab } = useAssortmentStore();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as AssortmentTab)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-6">
        {TAB_CONFIG.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TAB_CONFIG.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {renderTabContent(tab.value)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
