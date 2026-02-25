"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Play, HelpCircle, ChevronDown, Loader2 } from "lucide-react";
import type { ClusteringMethod } from "@/features/assortment/types";

const AVAILABLE_FEATURES = [
  { id: "revenue", label: "Revenue", description: "Total store revenue" },
  { id: "traffic", label: "Traffic", description: "Weekly customer traffic" },
  { id: "premium_share", label: "Premium Share", description: "% of premium brand sales" },
  { id: "pl_share", label: "Private Label Share", description: "% of store brand sales" },
  { id: "basket_size", label: "Basket Size", description: "Average transaction value" },
  { id: "energy_share", label: "Energy Drinks", description: "% of energy drink sales" },
];

const DEFAULT_FEATURES = ["revenue", "traffic", "premium_share"];

export interface ClusterConfigValues {
  method: ClusteringMethod;
  nClusters: number | null;
  autoK: boolean;
  features: string[];
}

interface ClusterConfigProps {
  onRunClustering: (config: ClusterConfigValues) => void;
  isRunning?: boolean;
  disabled?: boolean;
}

export function ClusterConfig({
  onRunClustering,
  isRunning = false,
  disabled = false,
}: ClusterConfigProps) {
  const [method, setMethod] = useState<ClusteringMethod>("kmeans");
  const [autoK, setAutoK] = useState(true);
  const [nClusters, setNClusters] = useState(4);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(DEFAULT_FEATURES);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((f) => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleRun = () => {
    onRunClustering({
      method,
      nClusters: autoK ? null : nClusters,
      autoK,
      features: selectedFeatures,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Clustering Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Help Section */}
        <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                Understanding Clustering Methods
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isHelpOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">K-Means:</strong> Groups stores
              into K distinct clusters based on similarity. Fast and works well
              when clusters are spherical.
            </p>
            <p>
              <strong className="text-foreground">GMM:</strong> Probabilistic
              approach where stores have probability of belonging to each cluster.
              Better at handling overlapping clusters.
            </p>
            <p>
              <strong className="text-foreground">How many clusters?</strong>{" "}
              Usually 3-6 clusters work best for store networks. Too few loses
              nuance; too many makes strategies impractical.
            </p>
          </CollapsibleContent>
        </Collapsible>

        {/* Method Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Clustering Method</Label>
          <RadioGroup
            value={method}
            onValueChange={(v) => setMethod(v as ClusteringMethod)}
            className="grid grid-cols-2 gap-4"
            disabled={disabled || isRunning}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="kmeans" id="kmeans" />
              <Label htmlFor="kmeans" className="cursor-pointer">
                K-Means
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gmm" id="gmm" />
              <Label htmlFor="gmm" className="cursor-pointer">
                Gaussian Mixture (GMM)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Number of Clusters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Number of Clusters</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-k"
                checked={autoK}
                onCheckedChange={(checked) => setAutoK(checked === true)}
                disabled={disabled || isRunning}
              />
              <Label htmlFor="auto-k" className="text-xs cursor-pointer">
                Auto-detect
              </Label>
            </div>
          </div>

          {autoK ? (
            <p className="text-xs text-muted-foreground">
              Optimal K will be determined automatically using silhouette score
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">2</span>
                <span className="text-sm font-bold text-primary">{nClusters}</span>
                <span className="text-xs text-muted-foreground">10</span>
              </div>
              <Slider
                value={[nClusters]}
                onValueChange={([v]) => setNClusters(v)}
                min={2}
                max={10}
                step={1}
                disabled={disabled || isRunning}
              />
            </div>
          )}
        </div>

        {/* Feature Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Features to Use</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">
                    Select which store characteristics to use for clustering.
                    More features provide nuance but may dilute primary patterns.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_FEATURES.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={selectedFeatures.includes(feature.id)}
                  onCheckedChange={() => handleFeatureToggle(feature.id)}
                  disabled={disabled || isRunning}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor={feature.id}
                        className="text-xs cursor-pointer"
                      >
                        {feature.label}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">{feature.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>

          {selectedFeatures.length < 2 && (
            <p className="text-xs text-destructive">
              Select at least 2 features for meaningful clustering
            </p>
          )}
        </div>

        {/* Run Button */}
        <Button
          className="w-full"
          onClick={handleRun}
          disabled={disabled || isRunning || selectedFeatures.length < 2}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Clustering...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Clustering
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
