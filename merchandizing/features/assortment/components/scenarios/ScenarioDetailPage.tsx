"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Play, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

import { useGetAssortmentScenario } from "@/features/assortment/api/use-get-assortment-scenario";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ScenarioDetailPageProps {
  scenarioId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeBadge(type: string | null | undefined) {
  switch (type) {
    case "optimization":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
          Optimization
        </Badge>
      );
    case "simulation":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
          Simulation
        </Badge>
      );
    case "clustering":
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
          Clustering
        </Badge>
      );
    default:
      return <Badge variant="outline">{type ?? "Unknown"}</Badge>;
  }
}

function getStatusBadge(status: string | null | undefined) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
          Completed
        </Badge>
      );
    case "running":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
          Running
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 border-gray-200">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status ?? "Unknown"}</Badge>;
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getRerunPath(type: string | null | undefined): string {
  switch (type) {
    case "optimization":
      return "/merchandizing-optimizer/optimization";
    case "simulation":
      return "/merchandizing-optimizer/simulation";
    case "clustering":
      return "/merchandizing-optimizer/clustering";
    default:
      return "/merchandizing-optimizer";
  }
}

// ---------------------------------------------------------------------------
// Safe accessor helpers for JSONB data
// ---------------------------------------------------------------------------

function safeNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function safeString(val: unknown): string {
  if (val === null || val === undefined) return "-";
  return String(val);
}

function safeArray(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  return [];
}

// ---------------------------------------------------------------------------
// Input Parameters section
// ---------------------------------------------------------------------------

function InputParametersSection({
  inputs,
}: {
  inputs: Record<string, unknown> | null | undefined;
}) {
  if (!inputs || typeof inputs !== "object") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No input parameters recorded for this scenario.
          </p>
        </CardContent>
      </Card>
    );
  }

  const entries = Object.entries(inputs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Input Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map(([key, value]) => {
            const isComplex =
              typeof value === "object" && value !== null;
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                </span>
                {isComplex ? (
                  <pre className="text-sm bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="text-sm">{safeString(value)}</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Optimization Results
// ---------------------------------------------------------------------------

function OptimizationResults({
  results,
}: {
  results: Record<string, unknown>;
}) {
  const currentProfit = safeNumber(results.currentProfit);
  const optimizedProfit = safeNumber(results.optimizedProfit);
  const profitLiftPct = safeNumber(results.profitLiftPct);
  const profitLiftAbsolute = safeNumber(results.profitLiftAbsolute);

  const productAllocations = safeArray(results.productAllocations) as Array<
    Record<string, unknown>
  >;
  const spaceAllocations = safeArray(results.spaceAllocations) as Array<
    Record<string, unknown>
  >;

  const isPositive = (profitLiftPct ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Profit Summary */}
      <Card className={isPositive ? "border-green-200" : "border-red-200"}>
        <CardHeader>
          <CardTitle className="text-base">Profit Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Current Profit
              </p>
              <p className="text-xl font-bold text-muted-foreground">
                {currentProfit !== null ? formatCurrency(currentProfit) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Optimized Profit
              </p>
              <p
                className={`text-xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {optimizedProfit !== null
                  ? formatCurrency(optimizedProfit)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Profit Lift</p>
              <p
                className={`text-xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {profitLiftPct !== null ? formatPercent(profitLiftPct) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Absolute Change
              </p>
              <p
                className={`text-xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {profitLiftAbsolute !== null
                  ? `${profitLiftAbsolute > 0 ? "+" : ""}${formatCurrency(profitLiftAbsolute)}`
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Allocations */}
      {productAllocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Current Facings</TableHead>
                  <TableHead className="text-right">
                    Optimized Facings
                  </TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productAllocations.map(
                  (alloc: Record<string, unknown>, idx: number) => {
                    const change = safeNumber(alloc.change);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">
                          {safeString(alloc.sku)}
                        </TableCell>
                        <TableCell>{safeString(alloc.name)}</TableCell>
                        <TableCell className="text-right">
                          {safeString(alloc.currentFacings)}
                        </TableCell>
                        <TableCell className="text-right">
                          {safeString(alloc.optimizedFacings)}
                        </TableCell>
                        <TableCell className="text-right">
                          {change !== null ? (
                            <span
                              className={
                                change > 0
                                  ? "text-green-600 font-medium"
                                  : change < 0
                                    ? "text-red-600 font-medium"
                                    : "text-muted-foreground"
                              }
                            >
                              {change > 0 ? "+" : ""}
                              {change}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Space Allocations */}
      {spaceAllocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Space Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcategory</TableHead>
                  <TableHead className="text-right">Current %</TableHead>
                  <TableHead className="text-right">Optimized %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spaceAllocations.map(
                  (alloc: Record<string, unknown>, idx: number) => {
                    return (
                      <TableRow key={idx}>
                        <TableCell>{safeString(alloc.subcategory)}</TableCell>
                        <TableCell className="text-right">
                          {safeNumber(alloc.currentPct) !== null
                            ? `${(safeNumber(alloc.currentPct)!).toFixed(1)}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {safeNumber(alloc.optimizedPct) !== null
                            ? `${(safeNumber(alloc.optimizedPct)!).toFixed(1)}%`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simulation Results
// ---------------------------------------------------------------------------

function SimulationResults({
  results,
}: {
  results: Record<string, unknown>;
}) {
  const revenueChangePct = safeNumber(results.revenueChangePct);
  const profitChangePct = safeNumber(results.profitChangePct);
  const probabilityPositive = safeNumber(results.probabilityPositive);
  const probabilityNegative = safeNumber(results.probabilityNegative);
  const probabilityBreakeven = safeNumber(results.probabilityBreakeven);
  const baselineRevenue = safeNumber(results.baselineRevenue);
  const baselineProfit = safeNumber(results.baselineProfit);
  const revenueChange = safeNumber(results.revenueChange);
  const profitChange = safeNumber(results.profitChange);
  const trialsCompleted = safeNumber(results.trialsCompleted);
  const executionTimeMs = safeNumber(results.executionTimeMs);

  const scenarioDescription = results.scenarioDescription as string | undefined;
  const scenarioType = results.scenarioType as string | undefined;
  const parameters = results.parameters as Record<string, unknown> | undefined;

  const profitCi90 = results.profitCi90 as [number, number] | undefined;
  const profitCi95 = results.profitCi95 as [number, number] | undefined;
  const revenueCi95 = results.revenueCi95 as [number, number] | undefined;

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Simulation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Revenue Change
              </p>
              <p
                className={`text-xl font-bold ${
                  (revenueChangePct ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {revenueChangePct !== null
                  ? formatPercent(revenueChangePct)
                  : "-"}
              </p>
              {revenueChange !== null && (
                <p className="text-xs text-muted-foreground">
                  {revenueChange > 0 ? "+" : ""}
                  {formatCurrency(revenueChange)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Profit Change
              </p>
              <p
                className={`text-xl font-bold ${
                  (profitChangePct ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {profitChangePct !== null
                  ? formatPercent(profitChangePct)
                  : "-"}
              </p>
              {profitChange !== null && (
                <p className="text-xs text-muted-foreground">
                  {profitChange > 0 ? "+" : ""}
                  {formatCurrency(profitChange)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Probability Positive
              </p>
              <p className="text-xl font-bold">
                {probabilityPositive !== null
                  ? `${(probabilityPositive * 100).toFixed(1)}%`
                  : "-"}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Additional probability stats */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Prob. Negative
              </p>
              <p className="text-sm font-medium">
                {probabilityNegative !== null
                  ? `${(probabilityNegative * 100).toFixed(1)}%`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Prob. Breakeven
              </p>
              <p className="text-sm font-medium">
                {probabilityBreakeven !== null
                  ? `${(probabilityBreakeven * 100).toFixed(1)}%`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Baseline Revenue
              </p>
              <p className="text-sm font-medium">
                {baselineRevenue !== null
                  ? formatCurrency(baselineRevenue)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Baseline Profit
              </p>
              <p className="text-sm font-medium">
                {baselineProfit !== null
                  ? formatCurrency(baselineProfit)
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Intervals */}
      {(profitCi90 || profitCi95 || revenueCi95) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confidence Intervals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profitCi90 && Array.isArray(profitCi90) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Profit 90% CI
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(profitCi90[0])} to{" "}
                    {formatCurrency(profitCi90[1])}
                  </p>
                </div>
              )}
              {profitCi95 && Array.isArray(profitCi95) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Profit 95% CI
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(profitCi95[0])} to{" "}
                    {formatCurrency(profitCi95[1])}
                  </p>
                </div>
              )}
              {revenueCi95 && Array.isArray(revenueCi95) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Revenue 95% CI
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(revenueCi95[0])} to{" "}
                    {formatCurrency(revenueCi95[1])}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Description & Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Scenario Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarioType && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Scenario Type
                </p>
                <p className="text-sm font-medium">
                  {scenarioType.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {scenarioDescription && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm">{scenarioDescription}</p>
              </div>
            )}
            {parameters &&
              typeof parameters === "object" &&
              Object.keys(parameters).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Parameters
                  </p>
                  <pre className="text-sm bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(parameters, null, 2)}
                  </pre>
                </div>
              )}
            <div className="flex gap-6">
              {trialsCompleted !== null && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Trials Completed
                  </p>
                  <p className="text-sm font-medium">
                    {trialsCompleted.toLocaleString()}
                  </p>
                </div>
              )}
              {executionTimeMs !== null && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Execution Time
                  </p>
                  <p className="text-sm font-medium">
                    {(executionTimeMs / 1000).toFixed(2)}s
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Clustering Results
// ---------------------------------------------------------------------------

function ClusteringResults({
  results,
}: {
  results: Record<string, unknown>;
}) {
  const nClusters = safeNumber(results.nClusters);
  const silhouetteScore = safeNumber(results.silhouetteScore);
  const method = results.method as string | undefined;
  const executionTimeMs = safeNumber(results.executionTimeMs);
  const featuresUsed = safeArray(results.featuresUsed) as string[];

  const clusterProfiles = safeArray(results.clusterProfiles) as Array<
    Record<string, unknown>
  >;

  return (
    <div className="space-y-6">
      {/* Clustering Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clustering Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Number of Clusters
              </p>
              <p className="text-xl font-bold">
                {nClusters !== null ? nClusters : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Silhouette Score
              </p>
              <p className="text-xl font-bold">
                {silhouetteScore !== null ? silhouetteScore.toFixed(3) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Method</p>
              <p className="text-sm font-medium uppercase">
                {method ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Execution Time
              </p>
              <p className="text-sm font-medium">
                {executionTimeMs !== null
                  ? `${(executionTimeMs / 1000).toFixed(2)}s`
                  : "-"}
              </p>
            </div>
          </div>

          {featuresUsed.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Features Used
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {featuresUsed.map((feature: string) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cluster Profiles Table */}
      {clusterProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cluster Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cluster</TableHead>
                  <TableHead className="text-right">Store Count</TableHead>
                  <TableHead className="text-right">Avg Revenue</TableHead>
                  <TableHead>Dominant Format</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusterProfiles.map(
                  (profile: Record<string, unknown>, idx: number) => {
                    const avgRevenue = safeNumber(profile.avgRevenue);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {safeString(profile.clusterName)}
                        </TableCell>
                        <TableCell className="text-right">
                          {safeString(profile.storeCount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {avgRevenue !== null
                            ? formatCurrency(avgRevenue)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {safeString(profile.dominantFormat)}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results dispatcher
// ---------------------------------------------------------------------------

function ResultsSection({
  type,
  results,
}: {
  type: string | null | undefined;
  results: Record<string, unknown> | null | undefined;
}) {
  if (!results || typeof results !== "object") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No results available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Results will appear here once the scenario finishes running.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (type) {
    case "optimization":
      return <OptimizationResults results={results} />;
    case "simulation":
      return <SimulationResults results={results} />;
    case "clustering":
      return <ClusteringResults results={results} />;
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ScenarioDetailPage({ scenarioId }: ScenarioDetailPageProps) {
  const scenarioQuery = useGetAssortmentScenario(scenarioId);
  const scenario = scenarioQuery.data as Record<string, unknown> | undefined;

  // Loading state
  if (scenarioQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/merchandizing-optimizer/scenarios">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Scenarios
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-16">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">
                Loading scenario...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error / not found state
  if (scenarioQuery.isError || !scenario) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/merchandizing-optimizer/scenarios">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Scenarios
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm text-destructive mb-2">
                {scenarioQuery.isError
                  ? "Failed to load scenario"
                  : "Scenario not found"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {scenarioQuery.error?.message ??
                  "The scenario you are looking for does not exist or has been deleted."}
              </p>
              <Link href="/merchandizing-optimizer/scenarios">
                <Button variant="outline" size="sm">
                  Return to Scenario List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract scenario fields
  const name = (scenario.name as string) || "Untitled Scenario";
  const type = scenario.type as string | null | undefined;
  const status = scenario.status as string | null | undefined;
  const createdAt = scenario.createdAt as string | null | undefined;
  const inputs = scenario.inputs as Record<string, unknown> | null | undefined;
  const results = scenario.results as
    | Record<string, unknown>
    | null
    | undefined;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/merchandizing-optimizer/scenarios">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Scenarios
          </Button>
        </Link>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge(type)}
                {getStatusBadge(status)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Created {formatDate(createdAt)}</span>
              </div>
            </div>

            {/* Re-run button */}
            <Link href={getRerunPath(type)}>
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Re-run with same inputs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Input Parameters */}
      <InputParametersSection inputs={inputs} />

      {/* Results */}
      <ResultsSection type={type} results={results} />
    </div>
  );
}
