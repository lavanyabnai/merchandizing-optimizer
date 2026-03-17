"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  ChevronDown,
  Info,
  AlertTriangle,
  Loader2,
  BarChart3,
  ListChecks,
  GitCompare,
  Save,
  RotateCcw,
} from "lucide-react";

import { ScenarioSelector } from "./ScenarioSelector";
import {
  RemoveSkuForm,
  AddSkuForm,
  ChangeFacingsForm,
  ChangePriceForm,
  type NewProductData,
} from "./ScenarioForms";
import { SimulationConfig, DEFAULT_CONFIG } from "./SimulationConfig";
import { SimulationResults } from "./SimulationResults";
import { ScenarioComparison } from "./ScenarioComparison";
import {
  useSimulateRemoveSku,
  useSimulateAddSku,
  useSimulateChangeFacings,
  useSimulateChangePrice,
} from "@/features/assortment/api/use-run-simulation";
import { useGetProducts } from "@/features/assortment/api/use-get-products";
import { useAssortmentStore } from "@/features/assortment/store/use-assortment-store";
import type {
  Product,
  ProductSummary,
  SimulationResult,
  SimulationConfig as SimulationConfigType,
  ScenarioType,
} from "@/features/assortment/types";

// Demo data generators
function generateDemoProducts(): ProductSummary[] {
  const brands = [
    "Coca-Cola",
    "Pepsi",
    "Store Brand",
    "Sprite",
    "7-Up",
    "Fanta",
    "Sunkist",
    "A&W",
    "Barq's",
    "Red Bull",
    "Monster",
    "LaCroix",
    "Perrier",
  ];
  const subcategories = [
    "Cola",
    "Lemon-Lime",
    "Orange",
    "Root Beer",
    "Energy",
    "Sparkling Water",
  ];
  const products: ProductSummary[] = [];

  let id = 1;
  brands.forEach((brand) => {
    const subcategory =
      subcategories[Math.floor(Math.random() * subcategories.length)];
    const sizes = ["12oz Can", "20oz Bottle", "2L Bottle"];
    sizes.forEach((size) => {
      products.push({
        id: `prod-${id}`,
        sku: `SKU-${String(id).padStart(4, "0")}`,
        name: `${brand} ${size}`,
        brand,
        brandTier:
          brand === "Store Brand"
            ? "Store Brand"
            : brand.includes("Cola") || brand.includes("Pepsi")
            ? "Premium"
            : "National A",
        subcategory,
        price: 1.99 + Math.random() * 3,
      });
      id++;
    });
  });

  return products;
}

function generateDemoSimulationResult(
  scenarioType: ScenarioType,
  description: string
): SimulationResult {
  const baselineRevenue = 45000 + Math.random() * 10000;
  const baselineProfit = baselineRevenue * (0.25 + Math.random() * 0.1);

  // Generate realistic change based on scenario type
  let profitChangePct: number;
  switch (scenarioType) {
    case "remove_sku":
      profitChangePct = -5 + Math.random() * 8; // -5% to +3%
      break;
    case "add_sku":
      profitChangePct = -2 + Math.random() * 10; // -2% to +8%
      break;
    case "change_facings":
      profitChangePct = -3 + Math.random() * 8; // -3% to +5%
      break;
    case "change_price":
      profitChangePct = -8 + Math.random() * 12; // -8% to +4%
      break;
    default:
      profitChangePct = Math.random() * 5;
  }

  const profitChange = baselineProfit * (profitChangePct / 100);
  const revenueChangePct = profitChangePct * 0.7 + (Math.random() - 0.5) * 2;
  const revenueChange = baselineRevenue * (revenueChangePct / 100);

  const profitMean = baselineProfit + profitChange;
  const profitStd = Math.abs(profitChange) * 0.5 + baselineProfit * 0.05;

  const revenueMean = baselineRevenue + revenueChange;
  const revenueStd = Math.abs(revenueChange) * 0.5 + baselineRevenue * 0.03;

  // Calculate probability of positive outcome
  const zScore = profitChange / profitStd;
  const probabilityPositive = 0.5 + 0.5 * Math.tanh(zScore * 0.8);

  return {
    runId: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    scenarioType,
    scenarioDescription: description,
    status: "completed",
    parameters: {},
    config: {
      numTrials: 5000,
      demandCv: 0.15,
      priceElasticityMean: -2.0,
      priceElasticityStd: 0.3,
      spaceElasticityStd: 0.1,
      walkRateMean: 0.09,
      walkRateStd: 0.02,
    },
    baselineRevenue,
    baselineProfit,
    revenueStats: {
      mean: revenueMean,
      std: revenueStd,
      min: revenueMean - 3 * revenueStd,
      max: revenueMean + 3 * revenueStd,
      median: revenueMean - revenueStd * 0.1,
    },
    revenuePercentiles: {
      p5: revenueMean - 1.645 * revenueStd,
      p10: revenueMean - 1.28 * revenueStd,
      p25: revenueMean - 0.674 * revenueStd,
      p50: revenueMean,
      p75: revenueMean + 0.674 * revenueStd,
      p90: revenueMean + 1.28 * revenueStd,
      p95: revenueMean + 1.645 * revenueStd,
    },
    revenueChange,
    revenueChangePct,
    profitStats: {
      mean: profitMean,
      std: profitStd,
      min: profitMean - 3 * profitStd,
      max: profitMean + 3 * profitStd,
      median: profitMean - profitStd * 0.1,
    },
    profitPercentiles: {
      p5: profitMean - 1.645 * profitStd,
      p10: profitMean - 1.28 * profitStd,
      p25: profitMean - 0.674 * profitStd,
      p50: profitMean,
      p75: profitMean + 0.674 * profitStd,
      p90: profitMean + 1.28 * profitStd,
      p95: profitMean + 1.645 * profitStd,
    },
    profitChange,
    profitChangePct,
    probabilityPositive,
    probabilityNegative: 1 - probabilityPositive,
    probabilityBreakeven: 0.05,
    profitCi90: [profitMean - 1.645 * profitStd, profitMean + 1.645 * profitStd],
    profitCi95: [profitMean - 1.96 * profitStd, profitMean + 1.96 * profitStd],
    revenueCi95: [revenueMean - 1.96 * revenueStd, revenueMean + 1.96 * revenueStd],
    trialsCompleted: 5000,
    executionTimeMs: 800 + Math.random() * 400,
    createdAt: new Date().toISOString(),
  };
}

interface SavedScenario {
  id: string;
  name: string;
  result: SimulationResult;
}

interface SimulationProps {
  useDemoData?: boolean;
}

type ResultTab = "distribution" | "summary" | "compare";

function getDefaultSimulationResult(): SimulationResult {
  return generateDemoSimulationResult(
    "remove_sku",
    "Remove Coca-Cola 12oz Can (Sample Scenario)"
  );
}

export function Simulation({ useDemoData = true }: SimulationProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioType>("remove_sku");
  const [config, setConfig] = useState<SimulationConfigType>(DEFAULT_CONFIG);
  const [result, setResult] = useState<SimulationResult | null>(() =>
    useDemoData ? getDefaultSimulationResult() : null
  );
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [resultTab, setResultTab] = useState<ResultTab>("distribution");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Form state for each scenario type
  const [removeSkuIds, setRemoveSkuIds] = useState<string[]>([]);
  const [addSkuData, setAddSkuData] = useState<NewProductData>({
    name: "",
    brand: "",
    subcategory: "",
    size: "12oz Can",
    price: 2.99,
    cost: 1.5,
    incrementalPct: 30,
  });
  const [facingsData, setFacingsData] = useState({
    skuId: "",
    currentFacings: 0,
    newFacings: 0,
  });
  const [priceData, setPriceData] = useState({
    skuId: "",
    currentPrice: 0,
    newPrice: 0,
  });

  const { selectedStore } = useAssortmentStore();

  // Fetch products
  const { data: productsData } = useGetProducts({
    storeId: selectedStore ?? undefined,
  });

  const products: ProductSummary[] = useMemo(() => {
    if (useDemoData) {
      return generateDemoProducts();
    }
    return (productsData?.items || []).map((p: Product) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      brandTier: p.brandTier,
      subcategory: p.subcategory,
      price: p.price,
    }));
  }, [useDemoData, productsData]);

  // Note: brands and subcategories are derived from products inside AddSkuForm

  // Mutations
  const removeSkuMutation = useSimulateRemoveSku();
  const addSkuMutation = useSimulateAddSku();
  const changeFacingsMutation = useSimulateChangeFacings();
  const changePriceMutation = useSimulateChangePrice();

  // Get scenario description
  const getScenarioDescription = useCallback(() => {
    switch (selectedScenario) {
      case "remove_sku": {
        const selectedProducts = products.filter((p) =>
          removeSkuIds.includes(p.id)
        );
        if (selectedProducts.length === 0) return "Select SKUs to remove";
        if (selectedProducts.length === 1)
          return `Remove ${selectedProducts[0].name}`;
        return `Remove ${selectedProducts.length} SKUs`;
      }
      case "add_sku":
        return addSkuData.name
          ? `Add ${addSkuData.name}`
          : "Configure new product";
      case "change_facings": {
        const product = products.find((p) => p.id === facingsData.skuId);
        if (!product) return "Select a SKU";
        return `Change ${product.name} facings from ${facingsData.currentFacings} to ${facingsData.newFacings}`;
      }
      case "change_price": {
        const product = products.find((p) => p.id === priceData.skuId);
        if (!product) return "Select a SKU";
        return `Change ${product.name} price from $${priceData.currentPrice.toFixed(2)} to $${priceData.newPrice.toFixed(2)}`;
      }
      default:
        return "";
    }
  }, [
    selectedScenario,
    products,
    removeSkuIds,
    addSkuData,
    facingsData,
    priceData,
  ]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    switch (selectedScenario) {
      case "remove_sku":
        return removeSkuIds.length > 0;
      case "add_sku":
        return (
          addSkuData.name.trim() !== "" &&
          addSkuData.brand !== "" &&
          addSkuData.subcategory !== "" &&
          addSkuData.price > 0 &&
          addSkuData.cost > 0
        );
      case "change_facings":
        return (
          facingsData.skuId !== "" &&
          facingsData.newFacings !== facingsData.currentFacings
        );
      case "change_price":
        return (
          priceData.skuId !== "" && priceData.newPrice !== priceData.currentPrice
        );
      default:
        return false;
    }
  }, [selectedScenario, removeSkuIds, addSkuData, facingsData, priceData]);

  // Run simulation
  const handleRunSimulation = useCallback(async () => {
    if (!isFormValid) return;

    setIsSimulating(true);
    setSimulationProgress(0);

    const progressInterval = setInterval(() => {
      setSimulationProgress((prev) => Math.min(prev + 12, 90));
    }, 150);

    try {
      let simulationResult: SimulationResult;

      if (useDemoData) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        simulationResult = generateDemoSimulationResult(
          selectedScenario,
          getScenarioDescription()
        );
      } else {
        switch (selectedScenario) {
          case "remove_sku":
            simulationResult = await removeSkuMutation.mutateAsync({
              skuIds: removeSkuIds,
              config,
              storeId: selectedStore ?? undefined,
            });
            break;
          case "add_sku":
            simulationResult = await addSkuMutation.mutateAsync({
              ...addSkuData,
              config,
              storeId: selectedStore ?? undefined,
            });
            break;
          case "change_facings":
            simulationResult = await changeFacingsMutation.mutateAsync({
              skuId: facingsData.skuId,
              newFacings: facingsData.newFacings,
              config,
              storeId: selectedStore ?? undefined,
            });
            break;
          case "change_price":
            simulationResult = await changePriceMutation.mutateAsync({
              skuId: priceData.skuId,
              newPrice: priceData.newPrice,
              config,
              storeId: selectedStore ?? undefined,
            });
            break;
          default:
            throw new Error("Invalid scenario type");
        }
      }

      setResult(simulationResult);
      setSimulationProgress(100);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      clearInterval(progressInterval);
      setIsSimulating(false);
    }
  }, [
    isFormValid,
    useDemoData,
    selectedScenario,
    getScenarioDescription,
    config,
    selectedStore,
    removeSkuIds,
    addSkuData,
    facingsData,
    priceData,
    removeSkuMutation,
    addSkuMutation,
    changeFacingsMutation,
    changePriceMutation,
  ]);

  // Save scenario for comparison
  const handleSaveScenario = useCallback(() => {
    if (!result) return;

    if (savedScenarios.length >= 3) {
      return; // Max 3 scenarios
    }

    const newScenario: SavedScenario = {
      id: result.runId,
      name: getScenarioDescription(),
      result,
    };

    setSavedScenarios((prev) => [...prev, newScenario]);
    setResultTab("compare");
  }, [result, savedScenarios.length, getScenarioDescription]);

  // Remove saved scenario
  const handleRemoveScenario = useCallback((id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setResult(null);
    setRemoveSkuIds([]);
    setAddSkuData({
      name: "",
      brand: "",
      subcategory: "",
      size: "12oz Can",
      price: 2.99,
      cost: 1.5,
      incrementalPct: 30,
    });
    setFacingsData({ skuId: "", currentFacings: 0, newFacings: 0 });
    setPriceData({ skuId: "", currentPrice: 0, newPrice: 0 });
  }, []);

  // Handle SKU selection for facings/price scenarios
  const handleSkuSelect = useCallback(
    (skuId: string) => {
      const product = products.find((p) => p.id === skuId);
      if (!product) return;

      if (selectedScenario === "change_facings") {
        const currentFacings = Math.floor(Math.random() * 4) + 1; // Demo data
        setFacingsData({
          skuId,
          currentFacings,
          newFacings: currentFacings,
        });
      } else if (selectedScenario === "change_price") {
        setPriceData({
          skuId,
          currentPrice: product.price,
          newPrice: product.price,
        });
      }
    },
    [products, selectedScenario]
  );

  // Render scenario form
  const renderScenarioForm = () => {
    switch (selectedScenario) {
      case "remove_sku":
        return (
          <RemoveSkuForm
            products={products}
            selectedSkuIds={removeSkuIds}
            onSelectionChange={setRemoveSkuIds}
            disabled={isSimulating}
          />
        );
      case "add_sku":
        return (
          <AddSkuForm
            products={products}
            value={addSkuData}
            onChange={setAddSkuData}
            disabled={isSimulating}
          />
        );
      case "change_facings":
        return (
          <ChangeFacingsForm
            products={products}
            selectedSkuId={facingsData.skuId || null}
            onSkuChange={handleSkuSelect}
            currentFacings={facingsData.currentFacings}
            newFacings={facingsData.newFacings}
            onFacingsChange={(value) =>
              setFacingsData((prev) => ({ ...prev, newFacings: value }))
            }
            disabled={isSimulating}
          />
        );
      case "change_price":
        return (
          <ChangePriceForm
            products={products}
            selectedSkuId={priceData.skuId || null}
            onSkuChange={handleSkuSelect}
            currentPrice={priceData.currentPrice}
            newPrice={priceData.newPrice}
            onPriceChange={(value) =>
              setPriceData((prev) => ({ ...prev, newPrice: value }))
            }
            disabled={isSimulating}
          />
        );
      default:
        return null;
    }
  };

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
          About Monte Carlo Simulation
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isAboutOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
        {isAboutOpen && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">
              What is Monte Carlo Simulation?
            </p>
            <p className="mb-3">
              Monte Carlo simulation generates thousands of random demand
              scenarios to understand the range of possible outcomes for
              assortment changes. Instead of a single point estimate, you get a
              full distribution of potential results.
            </p>
            <p className="font-medium text-foreground mb-2">
              How to interpret results:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs mb-3">
              <li>
                <strong>Expected Value:</strong> The average outcome across all
                simulations
              </li>
              <li>
                <strong>Confidence Interval:</strong> The range where 95% of
                outcomes fall
              </li>
              <li>
                <strong>P(Positive):</strong> Probability that the change
                improves profit
              </li>
              <li>
                <strong>Downside Risk:</strong> The 5th percentile shows
                worst-case scenario
              </li>
            </ul>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Results are statistical estimates based on model assumptions.
                Actual outcomes may vary due to factors not captured in the
                simulation.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Scenario Selector */}
      <ScenarioSelector
        selectedScenario={selectedScenario}
        onScenarioChange={(scenario) => {
          setSelectedScenario(scenario);
          handleReset();
        }}
        disabled={isSimulating}
      />

      {/* Main Layout */}
      <div className="grid gap-6 grid-cols-[1fr_2fr] w-full">
        {/* Left Panel: Configuration */}
        <div className="space-y-4">
          {/* Scenario Form */}
          {renderScenarioForm()}

          {/* Simulation Config */}
          <SimulationConfig
            config={config}
            onChange={setConfig}
            disabled={isSimulating}
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleRunSimulation}
              disabled={isSimulating || !isFormValid}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              disabled={isSimulating}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          {isSimulating && (
            <div className="space-y-2">
              <Progress value={simulationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Running {config.numTrials.toLocaleString()} simulations...
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 w-full">
          {result ? (
            <>
              {/* Result Tabs */}
              <Tabs
                value={resultTab}
                onValueChange={(v) => setResultTab(v as ResultTab)}
              >
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="distribution" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Distribution</span>
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="gap-2">
                      <ListChecks className="h-4 w-4" />
                      <span className="hidden sm:inline">Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="compare" className="gap-2">
                      <GitCompare className="h-4 w-4" />
                      <span className="hidden sm:inline">Compare</span>
                      {savedScenarios.length > 0 && (
                        <span className="ml-1 text-xs bg-primary/20 px-1.5 rounded-full">
                          {savedScenarios.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveScenario}
                    disabled={
                      savedScenarios.length >= 3 ||
                      savedScenarios.some((s) => s.id === result.runId)
                    }
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Scenario
                  </Button>
                </div>

                <TabsContent value="distribution" className="mt-4">
                  <SimulationResults result={result} />
                </TabsContent>

                <TabsContent value="summary" className="mt-4">
                  <SimulationResults result={result} />
                </TabsContent>

                <TabsContent value="compare" className="mt-4">
                  <ScenarioComparison
                    scenarios={savedScenarios}
                    onRemoveScenario={handleRemoveScenario}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            /* Empty State */
            <Card className="h-full min-h-[500px]">
              <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Ready to Simulate
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Configure a what-if scenario on the left, then click
                  &quot;Run Simulation&quot; to see the distribution of
                  possible outcomes.
                </p>
                <div className="grid gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-medium">
                      1
                    </span>
                    Remove SKU - What if we delist products?
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-medium">
                      2
                    </span>
                    Add SKU - What if we introduce a new product?
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                      3
                    </span>
                    Change Facings - What if we adjust shelf space?
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-medium">
                      4
                    </span>
                    Change Price - What if we adjust pricing?
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
