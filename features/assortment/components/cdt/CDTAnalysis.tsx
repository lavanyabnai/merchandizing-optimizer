"use client";

import { useState, useMemo } from "react";
import { SunburstChart, type CDTNode } from "./SunburstChart";
import { AttributeImportance, DEFAULT_ATTRIBUTE_DATA } from "./AttributeImportance";
import { SwitchingMatrix, type SwitchingMatrixData } from "./SwitchingMatrix";
import { SwitchingBehavior, DEFAULT_SWITCHING_DATA } from "./SwitchingBehavior";
import { useGetCDTData, buildCDTHierarchy } from "@/features/assortment/api/use-get-cdt-data";
import { useAssortmentStore } from "@/features/assortment/store/use-assortment-store";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, Info, CheckCircle2 } from "lucide-react";
import type { BrandTier } from "@/features/assortment/types";

// Demo data for development
function generateDemoData() {
  const subcategories = ["Cola", "Lemon-Lime", "Orange", "Root Beer", "Sparkling Water", "Energy"];
  const brandsBySubcat: Record<string, string[]> = {
    Cola: ["Coca-Cola", "Pepsi", "Store Brand Cola"],
    "Lemon-Lime": ["Sprite", "7-Up", "Sierra Mist"],
    Orange: ["Fanta", "Sunkist", "Crush"],
    "Root Beer": ["A&W", "Barq's", "Mug"],
    "Sparkling Water": ["LaCroix", "Perrier", "Topo Chico"],
    Energy: ["Red Bull", "Monster", "Rockstar"],
  };
  const sizes = ["12oz Can", "20oz Bottle", "2L Bottle", "6-Pack", "12-Pack"];

  // Build hierarchy
  const root: CDTNode = {
    id: "beverages",
    name: "Beverages",
    children: [],
  };

  subcategories.forEach((subcategory) => {
    const subcatNode: CDTNode = {
      id: `subcat-${subcategory}`,
      name: subcategory,
      children: [],
    };

    const brands = brandsBySubcat[subcategory] || [];
    brands.forEach((brand) => {
      const brandNode: CDTNode = {
        id: `brand-${subcategory}-${brand}`,
        name: brand,
        children: [],
      };

      sizes.forEach((size) => {
        const value = Math.round(10000 + Math.random() * 50000);
        brandNode.children!.push({
          id: `size-${subcategory}-${brand}-${size}`,
          name: size,
          value,
        });
      });

      subcatNode.children!.push(brandNode);
    });

    root.children!.push(subcatNode);
  });

  // Brand switching data
  const allBrands = Object.values(brandsBySubcat).flat();
  const brandSwitching: SwitchingMatrixData[] = [];
  allBrands.forEach((from, i) => {
    allBrands.forEach((to, j) => {
      if (i !== j) {
        brandSwitching.push({
          from,
          to,
          probability: Math.round((0.1 + Math.random() * 0.4) * 100) / 100,
        });
      }
    });
  });

  // Subcategory switching data
  const subcategorySwitching: SwitchingMatrixData[] = [];
  subcategories.forEach((from, i) => {
    subcategories.forEach((to, j) => {
      if (i !== j) {
        subcategorySwitching.push({
          from,
          to,
          probability: Math.round((0.15 + Math.random() * 0.35) * 100) / 100,
        });
      }
    });
  });

  return {
    hierarchy: root,
    brandSwitching,
    subcategorySwitching,
  };
}

interface CDTAnalysisProps {
  useDemoData?: boolean;
}

export function CDTAnalysis({ useDemoData = true }: CDTAnalysisProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { selectedStore } = useAssortmentStore();

  // Fetch real data (when API is connected)
  const { data: cdtData, isLoading } = useGetCDTData(selectedStore ?? undefined);

  // Use demo data or real data
  const { hierarchy, brandSwitching, subcategorySwitching, attributeImportance, switchingBehavior } =
    useMemo(() => {
      if (useDemoData) {
        const demoData = generateDemoData();
        return {
          ...demoData,
          attributeImportance: DEFAULT_ATTRIBUTE_DATA,
          switchingBehavior: DEFAULT_SWITCHING_DATA,
        };
      }

      if (cdtData) {
        return cdtData;
      }

      // Fallback empty state
      return {
        hierarchy: { id: "root", name: "Beverages", children: [] } as CDTNode,
        brandSwitching: [] as SwitchingMatrixData[],
        subcategorySwitching: [] as SwitchingMatrixData[],
        attributeImportance: DEFAULT_ATTRIBUTE_DATA,
        switchingBehavior: DEFAULT_SWITCHING_DATA,
      };
    }, [useDemoData, cdtData]);

  const effectiveLoading = isLoading && !useDemoData;

  return (
    <div className="space-y-6">
      {/* About Section */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => setIsAboutOpen(!isAboutOpen)}
        >
          <Info className="h-4 w-4" />
          About CDT Analysis
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`}
          />
        </Button>
        {isAboutOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">
              What is a Consumer Decision Tree (CDT)?
            </p>
            <p className="mb-3">
              A CDT maps how shoppers navigate through a category to make purchase decisions.
              Understanding this journey helps you:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <strong>Optimize shelf layout</strong> to match how customers shop
              </li>
              <li>
                <strong>Identify substitution patterns</strong> when items are out of stock
              </li>
              <li>
                <strong>Prioritize assortment decisions</strong> based on what matters most
              </li>
              <li>
                <strong>Reduce lost sales</strong> by understanding walk-away behavior
              </li>
            </ul>
            <p className="font-medium text-foreground mb-2">How to use these insights:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Structure planograms to follow the decision hierarchy</li>
              <li>Ensure coverage at each decision node (subcategory, brand, size)</li>
              <li>Monitor stockouts on high-affinity items to minimize lost sales</li>
            </ol>
          </div>
        )}
      </div>

      {/* Main Layout: Sunburst on left, Importance + Behavior on right */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Sunburst Chart */}
        <SunburstChart data={hierarchy} isLoading={effectiveLoading} />

        {/* Right: Attribute Importance + Switching Behavior */}
        <div className="space-y-6">
          <AttributeImportance data={attributeImportance} isLoading={effectiveLoading} />
          <SwitchingBehavior data={switchingBehavior} isLoading={effectiveLoading} />
        </div>
      </div>

      <Separator />

      {/* Full-width: Switching Matrix */}
      <SwitchingMatrix
        brandData={brandSwitching}
        subcategoryData={subcategorySwitching}
        isLoading={effectiveLoading}
      />

      <Separator />

      {/* Key Takeaways */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <p className="font-medium text-green-800 mb-2">
            Key Takeaways from CDT Analysis:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
            <li>
              <strong>Protect Hero SKUs:</strong> With a 9% walk-away rate, ensure top sellers are
              always in stock
            </li>
            <li>
              <strong>Maintain Subcategory Breadth:</strong> Shoppers decide subcategory first -
              cover all segments
            </li>
            <li>
              <strong>Leverage Brand Loyalty:</strong> Premium brands have loyal customers - don't
              force substitution
            </li>
            <li>
              <strong>Use Affinity for Adjacencies:</strong> Place high-affinity products near each
              other on shelf
            </li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
