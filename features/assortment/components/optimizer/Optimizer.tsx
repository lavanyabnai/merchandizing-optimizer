"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  ChevronDown,
  Info,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  BarChart3,
  Table as TableIcon,
  History,
} from "lucide-react";

import { ConstraintForm, type ConstraintFormValues } from "./ConstraintForm";
import { MustCarrySelector, ExcludeSelector } from "./ProductSelector";
import { ComparisonTable } from "./ComparisonTable";
import { ProfitLiftCard } from "./ProfitLiftCard";
import { SpaceAllocationChart } from "./SpaceAllocationChart";
import { OptimizationHistory } from "./OptimizationHistory";
import { useRunOptimization } from "@/features/assortment/api/use-run-optimization";
import { useGetProducts } from "@/features/assortment/api/use-get-products";
import { useAssortmentStore } from "@/features/assortment/store/use-assortment-store";
import type {
  ProductSummary,
  OptimizationResult,
  OptimizationSummary,
  ProductAllocation,
  SpaceAllocation,
} from "@/features/assortment/types";

// Demo data generators
function generateDemoProducts(): ProductSummary[] {
  const brands = ["Coca-Cola", "Pepsi", "Store Brand", "Sprite", "7-Up", "Fanta", "Sunkist", "A&W", "Barq's", "Red Bull", "Monster", "LaCroix", "Perrier"];
  const subcategories = ["Cola", "Lemon-Lime", "Orange", "Root Beer", "Energy", "Sparkling Water"];
  const products: ProductSummary[] = [];

  let id = 1;
  brands.forEach((brand) => {
    const subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    const sizes = ["12oz Can", "20oz Bottle", "2L Bottle"];
    sizes.forEach((size) => {
      products.push({
        id: `prod-${id}`,
        sku: `SKU-${String(id).padStart(4, "0")}`,
        name: `${brand} ${size}`,
        brand,
        brandTier: brand === "Store Brand" ? "Store Brand" : brand.includes("Cola") || brand.includes("Pepsi") ? "Premium" : "National A",
        subcategory,
        price: 1.99 + Math.random() * 3,
      });
      id++;
    });
  });

  return products;
}

function generateDemoResult(): OptimizationResult {
  const products = generateDemoProducts();

  const productAllocations: ProductAllocation[] = products.slice(0, 30).map((product, i) => {
    const currentFacings = Math.floor(Math.random() * 4) + 1;
    const optimizedFacings = Math.floor(Math.random() * 6) + (i < 10 ? 2 : 0);
    const change = optimizedFacings - currentFacings;
    const currentProfit = currentFacings * (50 + Math.random() * 100);
    const projectedProfit = optimizedFacings * (55 + Math.random() * 110);

    return {
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      subcategory: product.subcategory,
      currentFacings,
      optimizedFacings,
      change,
      currentProfit,
      projectedProfit,
      profitChange: projectedProfit - currentProfit,
    };
  });

  const subcategories = ["Cola", "Lemon-Lime", "Orange", "Root Beer", "Energy", "Sparkling Water"];
  const spaceAllocations: SpaceAllocation[] = subcategories.map((subcategory) => {
    const current = 15 + Math.floor(Math.random() * 10);
    const optimized = current + Math.floor(Math.random() * 8) - 4;
    return {
      subcategory,
      currentFacings: current,
      optimizedFacings: Math.max(5, optimized),
      change: optimized - current,
      currentPct: 0,
      optimizedPct: 0,
    };
  });

  // Calculate percentages
  const totalCurrent = spaceAllocations.reduce((sum, s) => sum + s.currentFacings, 0);
  const totalOptimized = spaceAllocations.reduce((sum, s) => sum + s.optimizedFacings, 0);
  spaceAllocations.forEach((s) => {
    s.currentPct = (s.currentFacings / totalCurrent) * 100;
    s.optimizedPct = (s.optimizedFacings / totalOptimized) * 100;
  });

  const currentProfit = productAllocations.reduce((sum, p) => sum + p.currentProfit, 0);
  const optimizedProfit = productAllocations.reduce((sum, p) => sum + p.projectedProfit, 0);

  return {
    runId: `run-${Date.now()}`,
    status: "completed",
    constraints: {
      totalFacings: 120,
      minFacingsPerSku: 1,
      maxFacingsPerSku: 6,
      minSkus: 20,
      maxSkus: 40,
      mustCarry: [],
      exclude: [],
    },
    currentProfit,
    optimizedProfit,
    profitLiftPct: ((optimizedProfit - currentProfit) / currentProfit) * 100,
    profitLiftAbsolute: optimizedProfit - currentProfit,
    productAllocations,
    spaceAllocations,
    executionTimeMs: 1234,
    createdAt: new Date().toISOString(),
  };
}

function generateDemoHistory(): OptimizationSummary[] {
  const statuses: Array<"completed" | "failed"> = ["completed", "completed", "completed", "failed"];
  return Array.from({ length: 5 }).map((_, i) => {
    const status = statuses[i] || "completed";
    return {
      runId: `run-${Date.now() - i * 86400000}`,
      storeId: i % 2 === 0 ? `store-${i + 1}` : undefined,
      status,
      profitLiftPct: status === "completed" ? 3 + Math.random() * 8 : undefined,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });
}

interface OptimizerProps {
  useDemoData?: boolean;
}

type ResultTab = "comparison" | "space" | "history";

function getDefaultOptimizationResult(): OptimizationResult {
  return generateDemoResult();
}

export function Optimizer({ useDemoData = true }: OptimizerProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [constraints, setConstraints] = useState<ConstraintFormValues | null>(null);
  const [mustCarryIds, setMustCarryIds] = useState<string[]>([]);
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [result, setResult] = useState<OptimizationResult | null>(() =>
    useDemoData ? getDefaultOptimizationResult() : null
  );
  const [history, setHistory] = useState<OptimizationSummary[]>(useDemoData ? generateDemoHistory() : []);
  const [resultTab, setResultTab] = useState<ResultTab>("comparison");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const { selectedStore } = useAssortmentStore();

  // Fetch products (or use demo data)
  const { data: productsData } = useGetProducts(selectedStore ?? undefined);

  const products: ProductSummary[] = useMemo(() => {
    if (useDemoData) {
      return generateDemoProducts();
    }
    return (productsData?.items || []).map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      brandTier: p.brandTier,
      subcategory: p.subcategory,
      price: p.price,
    }));
  }, [useDemoData, productsData]);

  // Run optimization mutation
  const runOptimization = useRunOptimization();

  const handleRunOptimization = useCallback(async () => {
    if (!constraints) return;

    setIsOptimizing(true);
    setOptimizationProgress(0);

    // Simulate progress for demo
    const progressInterval = setInterval(() => {
      setOptimizationProgress((prev) => Math.min(prev + 15, 90));
    }, 200);

    try {
      if (useDemoData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const demoResult = generateDemoResult();
        setResult(demoResult);

        // Add to history
        setHistory((prev) => [
          {
            runId: demoResult.runId,
            storeId: selectedStore ?? undefined,
            status: "completed",
            profitLiftPct: demoResult.profitLiftPct,
            createdAt: demoResult.createdAt,
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        const apiResult = await runOptimization.mutateAsync({
          storeId: selectedStore ?? undefined,
          constraints: {
            ...constraints,
            mustCarry: mustCarryIds,
            exclude: excludeIds,
            minSkus: 20,
            maxSkus: 50,
          },
        });
        setResult(apiResult);

        // Add to history
        setHistory((prev) => [
          {
            runId: apiResult.runId,
            storeId: selectedStore ?? undefined,
            status: apiResult.status,
            profitLiftPct: apiResult.profitLiftPct,
            createdAt: apiResult.createdAt,
          },
          ...prev.slice(0, 9),
        ]);
      }

      setOptimizationProgress(100);
    } catch (error) {
      console.error("Optimization failed:", error);
      // Add failed run to history
      setHistory((prev) => [
        {
          runId: `run-${Date.now()}`,
          storeId: selectedStore ?? undefined,
          status: "failed",
          createdAt: new Date().toISOString(),
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      clearInterval(progressInterval);
      setIsOptimizing(false);
    }
  }, [constraints, mustCarryIds, excludeIds, selectedStore, useDemoData, runOptimization]);

  const handleLoadRun = useCallback((runId: string) => {
    // In a real app, this would fetch the run from the API
    // For demo, we regenerate results
    const demoResult = generateDemoResult();
    demoResult.runId = runId;
    setResult(demoResult);
    setResultTab("comparison");
  }, []);

  const handleDeleteRun = useCallback((runId: string) => {
    setHistory((prev) => prev.filter((run) => run.runId !== runId));
    if (result?.runId === runId) {
      setResult(null);
    }
  }, [result]);

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
          About Assortment Optimization
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isAboutOpen ? "rotate-180" : ""}`}
          />
        </Button>
        {isAboutOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">
              What is Assortment Optimization?
            </p>
            <p className="mb-3">
              This tool uses a mathematical algorithm to find the best combination of products
              and shelf space allocation that maximizes profit while meeting business constraints.
            </p>
            <p className="font-medium text-foreground mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs mb-3">
              <li><strong>Input:</strong> Historical sales data, product profitability, current assortment</li>
              <li><strong>Constraints:</strong> Space limits, coverage requirements, must-carry items</li>
              <li><strong>Algorithm:</strong> Greedy heuristic prioritizing highest-profit items while ensuring coverage</li>
              <li><strong>Output:</strong> Recommended assortment with facing allocations and expected profit lift</li>
            </ol>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This is a decision-support tool. Always validate recommendations against
                local market knowledge, supplier relationships, and seasonal factors.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 grid-cols-[1fr_2fr] w-full">
        {/* Left Panel: Configuration */}
        <div className="space-y-4">
          {/* Constraint Form */}
          <ConstraintForm
            onValuesChange={setConstraints}
            disabled={isOptimizing}
          />

          {/* Must Carry Selector */}
          <MustCarrySelector
            products={products}
            selectedIds={mustCarryIds}
            excludedIds={excludeIds}
            onSelectionChange={setMustCarryIds}
            disabled={isOptimizing}
          />

          {/* Exclude Selector */}
          <ExcludeSelector
            products={products}
            selectedIds={excludeIds}
            excludedIds={mustCarryIds}
            onSelectionChange={setExcludeIds}
            disabled={isOptimizing}
          />

          {/* Run Optimization Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleRunOptimization}
            disabled={isOptimizing || !constraints}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Optimization
              </>
            )}
          </Button>

          {/* Progress */}
          {isOptimizing && (
            <div className="space-y-2">
              <Progress value={optimizationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {optimizationProgress < 100
                  ? "Finding optimal assortment..."
                  : "Finalizing results..."}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 w-full">
          {result ? (
            <>
              {/* Profit Lift Card */}
              <ProfitLiftCard
                currentProfit={result.currentProfit}
                optimizedProfit={result.optimizedProfit}
                profitLiftPct={result.profitLiftPct}
                profitLiftAbsolute={result.profitLiftAbsolute}
              />

              {/* Result Tabs */}
              <Tabs value={resultTab} onValueChange={(v) => setResultTab(v as ResultTab)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comparison" className="gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Comparison</span>
                  </TabsTrigger>
                  <TabsTrigger value="space" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Space</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">History</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="mt-4">
                  <ComparisonTable data={result.productAllocations} />
                </TabsContent>

                <TabsContent value="space" className="mt-4">
                  <SpaceAllocationChart data={result.spaceAllocations} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <OptimizationHistory
                    runs={history}
                    onLoadRun={handleLoadRun}
                    onDeleteRun={handleDeleteRun}
                    selectedRunId={result.runId}
                  />
                </TabsContent>
              </Tabs>

              {/* Success Alert */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="text-green-800 text-sm">
                    Optimization completed in {(result.executionTimeMs / 1000).toFixed(1)}s.
                    {result.profitLiftPct > 0 && (
                      <span className="font-medium">
                        {" "}Projected annual impact: +${((result.profitLiftAbsolute * 52) / 1000).toFixed(0)}K
                      </span>
                    )}
                  </p>
                </AlertDescription>
              </Alert>
            </>
          ) : (
            /* Empty State */
            <Card className="h-full min-h-[500px]">
              <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Ready to Optimize</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Configure your constraints on the left, then click &quot;Run Optimization&quot;
                  to find the profit-maximizing assortment for your store.
                </p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Set space and coverage constraints
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Add must-carry items (optional)
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Exclude discontinued products (optional)
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* History (when no results) */}
      {!result && history.length > 0 && (
        <>
          <Separator />
          <OptimizationHistory
            runs={history}
            onLoadRun={handleLoadRun}
            onDeleteRun={handleDeleteRun}
          />
        </>
      )}
    </div>
  );
}
