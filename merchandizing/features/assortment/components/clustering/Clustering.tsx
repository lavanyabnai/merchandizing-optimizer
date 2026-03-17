"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Info, Layers, ChevronDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ClusterConfig, type ClusterConfigValues } from "./ClusterConfig";
import { ClusterScatter } from "./ClusterScatter";
import { ClusterProfiles } from "./ClusterProfiles";
import { ClusterRecommendations } from "./ClusterRecommendations";
import { useRunClustering } from "@/features/assortment/api/use-run-clustering";
import type {
  ClusteringResult,
  ClusterProfile,
  PCACoordinate,
} from "@/features/assortment/types";

// Demo data generators
function generateDemoClusterProfiles(nClusters: number): ClusterProfile[] {
  const formats = ["Express", "Standard", "Superstore"];
  const locations = ["Urban", "Suburban", "Rural"];
  const incomes = ["Low", "Medium", "High"];
  const clusterNames = [
    "Premium Urban",
    "Value Suburban",
    "Family Focus",
    "Convenience Core",
    "Rural Essential",
    "High-Traffic Hub",
    "Neighborhood Store",
    "Premium Destination",
  ];

  return Array.from({ length: nClusters }).map((_, i) => {
    const isPremium = i % 3 === 0;
    const isValue = i % 3 === 1;

    return {
      clusterId: i,
      clusterName: clusterNames[i % clusterNames.length],
      storeCount: 3 + Math.floor(Math.random() * 8),
      avgRevenue: 15000 + Math.random() * 35000,
      totalRevenue: 75000 + Math.random() * 150000,
      revenueSharePct: (100 / nClusters) + (Math.random() * 10 - 5),
      avgTraffic: 2000 + Math.random() * 6000,
      totalTraffic: 10000 + Math.random() * 30000,
      premiumShare: isPremium ? 25 + Math.random() * 20 : 10 + Math.random() * 15,
      nationalAShare: 30 + Math.random() * 20,
      nationalBShare: 15 + Math.random() * 15,
      storeBrandShare: isValue ? 20 + Math.random() * 15 : 5 + Math.random() * 10,
      avgBasket: 8 + Math.random() * 12,
      dominantFormat: formats[i % formats.length],
      dominantLocation: locations[i % locations.length],
      dominantIncome: incomes[Math.min(i, incomes.length - 1)],
      isPremiumFocused: isPremium,
      isValueFocused: isValue,
      recommendations: [],
    };
  });
}

function generateDemoPCACoordinates(nClusters: number): PCACoordinate[] {
  const coordinates: PCACoordinate[] = [];
  const storesPerCluster = 4 + Math.floor(Math.random() * 4);

  for (let cluster = 0; cluster < nClusters; cluster++) {
    // Generate cluster center
    const centerX = (Math.random() - 0.5) * 6;
    const centerY = (Math.random() - 0.5) * 6;

    for (let store = 0; store < storesPerCluster; store++) {
      coordinates.push({
        storeId: `store-${cluster}-${store}`,
        storeCode: `S${String(cluster * 10 + store + 1).padStart(3, "0")}`,
        clusterId: cluster,
        pc1: centerX + (Math.random() - 0.5) * 1.5,
        pc2: centerY + (Math.random() - 0.5) * 1.5,
        revenue: 15000 + Math.random() * 40000,
      });
    }
  }

  return coordinates;
}

function generateDemoResult(config: ClusterConfigValues): ClusteringResult {
  const nClusters = config.nClusters || (3 + Math.floor(Math.random() * 3));

  return {
    runId: `cluster-${Date.now()}`,
    method: config.method,
    nClusters,
    silhouetteScore: 0.35 + Math.random() * 0.25,
    inertia: 1000 + Math.random() * 2000,
    storeAssignments: [],
    clusterProfiles: generateDemoClusterProfiles(nClusters),
    pcaCoordinates: generateDemoPCACoordinates(nClusters),
    featuresUsed: config.features,
    status: "completed",
    executionTimeMs: 500 + Math.random() * 1500,
    createdAt: new Date().toISOString(),
  };
}

interface ClusteringProps {
  useDemoData?: boolean;
}

// Generate a default result to show on initial load
const DEFAULT_CLUSTER_CONFIG: ClusterConfigValues = {
  method: "kmeans",
  nClusters: 4,
  features: ["revenue", "traffic", "premiumShare"],
};

function getDefaultClusterResult(): ClusteringResult {
  return generateDemoResult(DEFAULT_CLUSTER_CONFIG);
}

export function Clustering({ useDemoData = true }: ClusteringProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [result, setResult] = useState<ClusteringResult | null>(() =>
    useDemoData ? getDefaultClusterResult() : null
  );
  const [isRunning, setIsRunning] = useState(false);

  const runClusteringMutation = useRunClustering();

  const handleRunClustering = useCallback(
    async (config: ClusterConfigValues) => {
      setIsRunning(true);

      try {
        if (useDemoData) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const demoResult = generateDemoResult(config);
          setResult(demoResult);
        } else {
          const apiResult = await runClusteringMutation.mutateAsync({
            method: config.method,
            nClusters: config.nClusters ?? undefined,
            features: config.features,
          });
          setResult(apiResult);
        }
      } catch (error) {
        console.error("Clustering failed:", error);
      } finally {
        setIsRunning(false);
      }
    },
    [useDemoData, runClusteringMutation]
  );

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
          About Store Clustering
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`}
          />
        </Button>
        {isAboutOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">
              What is Store Clustering?
            </p>
            <p className="mb-3">
              Store clustering groups similar stores together based on their
              characteristics and shopping patterns. Instead of creating custom
              assortments for every store, you can develop strategies for each
              cluster and apply them efficiently.
            </p>
            <p className="font-medium text-foreground mb-2">Why cluster stores?</p>
            <ul className="list-disc list-inside space-y-1 text-xs mb-3">
              <li>
                <strong>Efficiency:</strong> Manage 4-6 assortment strategies
                instead of hundreds
              </li>
              <li>
                <strong>Relevance:</strong> Match assortments to local shopper
                preferences
              </li>
              <li>
                <strong>Insights:</strong> Understand what drives performance
                differences
              </li>
            </ul>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Clustering results should be validated with local market
                knowledge. Periodically re-run clustering as store performance
                evolves.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 grid-cols-[1fr_2fr] w-full">
        {/* Left Panel: Configuration */}
        <div>
          <ClusterConfig
            onRunClustering={handleRunClustering}
            isRunning={isRunning}
          />
        </div>

        {/* Right Panel: Results */}
        {/* Right Panel: Results */}
        <div className="space-y-6 w-full">
          {result ? (
            <>
              {/* Two-column layout: Scatter + Profiles */}
              <div className="grid gap-6 xl:grid-cols-5">
                {/* Scatter Plot - Larger */}
                <div className="xl:col-span-3">
                  <ClusterScatter
                    data={result.pcaCoordinates}
                    silhouetteScore={result.silhouetteScore}
                    nClusters={result.nClusters}
                  />
                </div>

                {/* Cluster Profiles - Side */}
                <div className="xl:col-span-2">
                  <ClusterProfiles profiles={result.clusterProfiles} />
                </div>
              </div>

              <Separator />

              {/* Full-width Recommendations */}
              <ClusterRecommendations profiles={result.clusterProfiles} />
            </>
          ) : (
            /* Empty State */
            <Card className="h-full min-h-[500px]">
              <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to Cluster</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Configure clustering parameters on the left, then click
                  &quot;Run Clustering&quot; to group stores by similarity.
                </p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Select clustering method (K-Means or GMM)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Choose number of clusters or auto-detect
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Select features to use for grouping
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
