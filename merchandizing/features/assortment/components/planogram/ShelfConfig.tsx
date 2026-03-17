"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcw, HelpCircle, Check } from "lucide-react";

const DEFAULT_SHELF_WIDTH = 48;
const DEFAULT_NUM_SHELVES = 4;

export interface ShelfConfigValues {
  shelfWidth: number;
  numShelves: number;
}

interface ShelfConfigProps {
  values: ShelfConfigValues;
  onChange: (values: ShelfConfigValues) => void;
  onApply?: () => void;
  disabled?: boolean;
}

export function ShelfConfig({
  values,
  onChange,
  onApply,
  disabled = false,
}: ShelfConfigProps) {
  const handleReset = () => {
    onChange({
      shelfWidth: DEFAULT_SHELF_WIDTH,
      numShelves: DEFAULT_NUM_SHELVES,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Shelf Configuration
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shelf Width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Shelf Width</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">
                      Width of each shelf section. Standard sections are 48&quot;
                      (4 feet). Larger stores may use 72&quot; or 96&quot; sections.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-bold text-primary">
              {values.shelfWidth}&quot;
            </span>
          </div>
          <Slider
            value={[values.shelfWidth]}
            onValueChange={([v]) =>
              onChange({ ...values, shelfWidth: v })
            }
            min={48}
            max={96}
            step={12}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>48&quot; (4ft)</span>
            <span>72&quot; (6ft)</span>
            <span>96&quot; (8ft)</span>
          </div>
        </div>

        {/* Number of Shelves */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Number of Shelves</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">
                      Number of vertical shelf levels. Beverages typically use
                      4-6 shelves. More shelves = more variety, less per-product
                      visibility.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-bold text-primary">
              {values.numShelves}
            </span>
          </div>
          <Slider
            value={[values.numShelves]}
            onValueChange={([v]) =>
              onChange({ ...values, numShelves: v })
            }
            min={3}
            max={6}
            step={1}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 shelves</span>
            <span>6 shelves</span>
          </div>
        </div>

        {/* Apply Button */}
        {onApply && (
          <Button
            className="w-full"
            variant="secondary"
            onClick={onApply}
            disabled={disabled}
          >
            <Check className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
        )}

        {/* Quick Info */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">Total Capacity:</strong>{" "}
            {values.shelfWidth * values.numShelves} linear inches (
            {((values.shelfWidth * values.numShelves) / 12).toFixed(1)} feet)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
