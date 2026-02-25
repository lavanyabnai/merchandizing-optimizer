"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  History,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptimizationSummary, OptimizationStatus } from "@/features/assortment/types";

interface OptimizationHistoryProps {
  runs: OptimizationSummary[];
  onLoadRun: (runId: string) => void;
  onDeleteRun: (runId: string) => void;
  isLoading?: boolean;
  selectedRunId?: string;
}

function getStatusConfig(status: OptimizationStatus) {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-100",
        label: "Completed",
      };
    case "running":
      return {
        icon: Loader2,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Running",
        animate: true,
      };
    case "pending":
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "Pending",
      };
    case "failed":
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Failed",
      };
    case "cancelled":
      return {
        icon: XCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        label: "Cancelled",
      };
    default:
      return {
        icon: Clock,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        label: status,
      };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function OptimizationHistory({
  runs,
  onLoadRun,
  onDeleteRun,
  isLoading,
  selectedRunId,
}: OptimizationHistoryProps) {
  const handleDelete = (runId: string) => {
    onDeleteRun(runId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">
            Optimization History
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  View and load past optimization runs. Click to view results
                  or delete to remove from history.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No optimization runs yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure constraints and run optimization to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => {
              const statusConfig = getStatusConfig(run.status);
              const StatusIcon = statusConfig.icon;
              const isSelected = run.runId === selectedRunId;
              const isPositive = (run.profitLiftPct ?? 0) >= 0;

              return (
                <div
                  key={run.runId}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  {/* Status Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                    statusConfig.bgColor
                  )}>
                    <StatusIcon
                      className={cn(
                        "h-4 w-4",
                        statusConfig.color,
                        statusConfig.animate && "animate-spin"
                      )}
                    />
                  </div>

                  {/* Run Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {run.storeId ? `Store ${run.storeId}` : "All Stores"}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(run.createdAt)}
                      </span>
                      {run.status === "completed" && run.profitLiftPct !== undefined && (
                        <span className={cn(
                          "text-xs font-medium flex items-center gap-0.5",
                          isPositive ? "text-green-600" : "text-red-600"
                        )}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {isPositive ? "+" : ""}{run.profitLiftPct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {run.status === "completed" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onLoadRun(run.runId)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Load results</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <AlertDialog>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Delete run</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete optimization run?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this optimization run and its results.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(run.runId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
