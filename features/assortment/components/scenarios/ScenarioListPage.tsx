"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Eye, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

import { useGetAssortmentScenarios } from "@/features/assortment/api/use-get-assortment-scenarios";
import { useDeleteAssortmentScenario } from "@/features/assortment/api/use-delete-assortment-scenario";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ScenarioTypeFilter = "all" | "optimization" | "simulation" | "clustering";

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
      return (
        <Badge variant="outline">
          {type ?? "Unknown"}
        </Badge>
      );
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
      return (
        <Badge variant="outline">
          {status ?? "Unknown"}
        </Badge>
      );
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function renderKeyMetrics(
  type: string | null | undefined,
  summary: Record<string, unknown> | null | undefined
): React.ReactNode {
  if (!summary || typeof summary !== "object") {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  switch (type) {
    case "optimization": {
      const profitLiftPct = summary.profitLiftPct as number | undefined;
      if (profitLiftPct !== undefined && profitLiftPct !== null) {
        const isPositive = profitLiftPct >= 0;
        return (
          <span
            className={
              isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"
            }
          >
            {isPositive ? "+" : ""}
            {profitLiftPct.toFixed(1)}% profit lift
          </span>
        );
      }
      return <span className="text-muted-foreground text-xs">No metrics</span>;
    }

    case "simulation": {
      const probabilityPositive = summary.probabilityPositive as number | undefined;
      if (probabilityPositive !== undefined && probabilityPositive !== null) {
        return (
          <span className="font-medium">
            {(probabilityPositive * 100).toFixed(1)}% prob. positive
          </span>
        );
      }
      return <span className="text-muted-foreground text-xs">No metrics</span>;
    }

    case "clustering": {
      const nClusters = summary.nClusters as number | undefined;
      const silhouetteScore = summary.silhouetteScore as number | undefined;
      const parts: string[] = [];
      if (nClusters !== undefined && nClusters !== null) {
        parts.push(`${nClusters} clusters`);
      }
      if (silhouetteScore !== undefined && silhouetteScore !== null) {
        parts.push(`sil. ${silhouetteScore.toFixed(3)}`);
      }
      if (parts.length > 0) {
        return <span className="font-medium">{parts.join(" / ")}</span>;
      }
      return <span className="text-muted-foreground text-xs">No metrics</span>;
    }

    default:
      return <span className="text-muted-foreground text-xs">-</span>;
  }
}

// ---------------------------------------------------------------------------
// Delete button with confirmation
// ---------------------------------------------------------------------------

function DeleteScenarioButton({ scenarioId }: { scenarioId: string }) {
  const deleteMutation = useDeleteAssortmentScenario(scenarioId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete scenario?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this scenario and all its results. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ScenarioListPage() {
  const [typeFilter, setTypeFilter] = useState<ScenarioTypeFilter>("all");

  const scenariosQuery = useGetAssortmentScenarios(
    typeFilter === "all" ? undefined : typeFilter
  );

  const scenarios = scenariosQuery.data ?? [];

  const filterButtons: { label: string; value: ScenarioTypeFilter }[] = [
    { label: "All", value: "all" },
    { label: "Optimization", value: "optimization" },
    { label: "Simulation", value: "simulation" },
    { label: "Clustering", value: "clustering" },
  ];

  // Loading state
  if (scenariosQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading scenarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (scenariosQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive mb-2">
              Failed to load scenarios
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {scenariosQuery.error?.message ?? "An unexpected error occurred."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scenariosQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Scenarios</CardTitle>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={typeFilter === btn.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(btn.value)}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {scenarios.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No scenarios found
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {typeFilter === "all"
                ? "Run an optimization, simulation, or clustering analysis to create your first scenario."
                : `No ${typeFilter} scenarios found. Try running a new ${typeFilter} analysis or switch to a different filter.`}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[130px]">Type</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead>Key Metrics</TableHead>
                <TableHead className="w-[180px]">Created</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario: Record<string, unknown>) => {
                const id = scenario.id as string;
                const name = (scenario.name as string) || "Untitled";
                const type = scenario.type as string | null | undefined;
                const status = scenario.status as string | null | undefined;
                const summary = scenario.summary as Record<string, unknown> | null | undefined;
                const createdAt = scenario.createdAt as string | null | undefined;

                return (
                  <TableRow key={id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {id.length > 8 ? `${id.slice(0, 8)}...` : id}
                    </TableCell>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{getTypeBadge(type)}</TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell className="text-sm">
                      {renderKeyMetrics(type, summary)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/merchandizing-optimizer/scenarios/${id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteScenarioButton scenarioId={id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
