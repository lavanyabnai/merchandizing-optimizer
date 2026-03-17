"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Plus,
  Minus,
  Equal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductAllocation } from "@/features/assortment/types";

type ChangeFilter = "all" | "added" | "removed" | "increased" | "decreased" | "unchanged";
type SortField = "name" | "brand" | "subcategory" | "currentFacings" | "optimizedFacings" | "change" | "profitChange";
type SortDirection = "asc" | "desc";

interface ComparisonTableProps {
  data: ProductAllocation[];
  isLoading?: boolean;
}

function getRowStatus(allocation: ProductAllocation): {
  status: ChangeFilter;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
} {
  if (allocation.currentFacings === 0 && allocation.optimizedFacings > 0) {
    return {
      status: "added",
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: <Plus className="h-3.5 w-3.5" />,
    };
  }
  if (allocation.currentFacings > 0 && allocation.optimizedFacings === 0) {
    return {
      status: "removed",
      color: "text-red-700",
      bgColor: "bg-red-50",
      icon: <Minus className="h-3.5 w-3.5" />,
    };
  }
  if (allocation.change > 0) {
    return {
      status: "increased",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: <ArrowUp className="h-3.5 w-3.5" />,
    };
  }
  if (allocation.change < 0) {
    return {
      status: "decreased",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      icon: <ArrowDown className="h-3.5 w-3.5" />,
    };
  }
  return {
    status: "unchanged",
    color: "text-muted-foreground",
    bgColor: "",
    icon: <Equal className="h-3.5 w-3.5" />,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChange(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

export function ComparisonTable({ data, isLoading }: ComparisonTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("change");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.subcategory.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query)
      );
    }

    // Change type filter
    if (changeFilter !== "all") {
      result = result.filter((item) => {
        const { status } = getRowStatus(item);
        return status === changeFilter;
      });
    }

    return result;
  }, [data, searchQuery, changeFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "brand":
          comparison = a.brand.localeCompare(b.brand);
          break;
        case "subcategory":
          comparison = a.subcategory.localeCompare(b.subcategory);
          break;
        case "currentFacings":
          comparison = a.currentFacings - b.currentFacings;
          break;
        case "optimizedFacings":
          comparison = a.optimizedFacings - b.optimizedFacings;
          break;
        case "change":
          comparison = Math.abs(a.change) - Math.abs(b.change);
          break;
        case "profitChange":
          comparison = a.profitChange - b.profitChange;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const added = data.filter((d) => getRowStatus(d).status === "added").length;
    const removed = data.filter((d) => getRowStatus(d).status === "removed").length;
    const changed = data.filter(
      (d) =>
        getRowStatus(d).status === "increased" ||
        getRowStatus(d).status === "decreased"
    ).length;
    return { added, removed, changed };
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "SKU",
      "Name",
      "Brand",
      "Subcategory",
      "Current Facings",
      "Optimized Facings",
      "Change",
      "Current Profit",
      "Projected Profit",
      "Profit Change",
    ];

    const rows = sortedData.map((item) => [
      item.sku,
      item.name,
      item.brand,
      item.subcategory,
      item.currentFacings,
      item.optimizedFacings,
      item.change,
      item.currentProfit.toFixed(2),
      item.projectedProfit.toFixed(2),
      item.profitChange.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimization-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
        )}
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">
              Assortment Comparison
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">
                    Compare current vs optimized facing allocations. Green = Added,
                    Red = Removed, Blue = Increased, Orange = Decreased.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>

        {/* Stats summary */}
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            +{stats.added} Added
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            -{stats.removed} Removed
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {stats.changed} Modified
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, brand, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={changeFilter} onValueChange={(v) => setChangeFilter(v as ChangeFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by change" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Changes</SelectItem>
              <SelectItem value="added">Added</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
              <SelectItem value="increased">Increased</SelectItem>
              <SelectItem value="decreased">Decreased</SelectItem>
              <SelectItem value="unchanged">Unchanged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Product</SortableHeader>
                <SortableHeader field="brand">Brand</SortableHeader>
                <SortableHeader field="subcategory">Subcategory</SortableHeader>
                <SortableHeader field="currentFacings">Current</SortableHeader>
                <SortableHeader field="optimizedFacings">Optimized</SortableHeader>
                <SortableHeader field="change">Change</SortableHeader>
                <SortableHeader field="profitChange">Profit Δ</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No products match your filters
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.slice(0, 50).map((allocation) => {
                  const { color, bgColor, icon } = getRowStatus(allocation);

                  return (
                    <TableRow
                      key={allocation.sku}
                      className={cn(bgColor, "transition-colors")}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate max-w-[200px]">
                            {allocation.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {allocation.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{allocation.brand}</TableCell>
                      <TableCell className="text-sm">{allocation.subcategory}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {allocation.currentFacings}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {allocation.optimizedFacings}
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1 font-medium text-sm", color)}>
                          {icon}
                          {formatChange(allocation.change)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            allocation.profitChange > 0
                              ? "text-green-600"
                              : allocation.profitChange < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                          )}
                        >
                          {allocation.profitChange > 0 ? "+" : ""}
                          {formatCurrency(allocation.profitChange)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {sortedData.length > 50 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing 50 of {sortedData.length} products. Export to CSV to see all.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
