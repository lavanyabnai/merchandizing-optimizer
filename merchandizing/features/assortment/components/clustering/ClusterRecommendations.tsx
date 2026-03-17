"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  ShoppingCart,
} from "lucide-react";
import type { ClusterProfile } from "@/features/assortment/types";

// Cluster colors
const CLUSTER_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#9B59B6",
  "#F39C12",
  "#1ABC9C",
  "#E91E63",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
];

// Generate recommendations based on cluster profile
function generateRecommendations(profile: ClusterProfile): {
  strategy: string;
  brandFocus: string[];
  priceFocus: string;
  subcategoryFocus: string[];
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let strategy = "";
  const brandFocus: string[] = [];
  let priceFocus = "Balanced";
  const subcategoryFocus: string[] = [];

  // Premium-focused clusters
  if (profile.isPremiumFocused || profile.premiumShare > 30) {
    strategy = "Premium & Innovation Focus";
    brandFocus.push("National A brands", "Premium imports", "Craft/specialty");
    priceFocus = "Premium & Mid-tier";
    recommendations.push(
      "Increase premium brand facings by 15-20%",
      "Feature new product innovations prominently",
      "Consider premium single-serve options",
      "Test limited edition and seasonal premium SKUs"
    );
    subcategoryFocus.push("Energy Drinks", "Premium Water");
  }

  // Value-focused clusters
  if (profile.isValueFocused || profile.storeBrandShare > 25) {
    strategy = "Value & Efficiency Focus";
    brandFocus.push("Store brands", "National B brands", "Value packs");
    priceFocus = "Value & Mid-tier";
    recommendations.push(
      "Expand private label assortment depth",
      "Feature multi-pack and family sizes",
      "Ensure competitive pricing vs. national brands",
      "Highlight value messaging on shelf"
    );
    subcategoryFocus.push("Soft Drinks", "Water");
  }

  // High traffic urban stores
  if (profile.dominantLocation === "Urban" && profile.avgTraffic > 5000) {
    if (!strategy) strategy = "Convenience & Impulse Focus";
    recommendations.push(
      "Maximize single-serve and grab-and-go options",
      "Stock chilled beverages near checkout",
      "Consider extended refrigerated sections"
    );
    subcategoryFocus.push("Energy Drinks", "Single-Serve");
  }

  // Suburban high income
  if (profile.dominantLocation === "Suburban" && profile.dominantIncome === "High") {
    if (!strategy) strategy = "Family & Premium Balance";
    brandFocus.push("Premium national brands", "Organic options");
    recommendations.push(
      "Balance multi-packs with premium singles",
      "Stock organic and health-conscious options",
      "Feature family-size value packs"
    );
    subcategoryFocus.push("Juices", "Sparkling Water");
  }

  // Rural/low traffic
  if (profile.dominantLocation === "Rural" || profile.avgTraffic < 2000) {
    if (!strategy) strategy = "Core Assortment Focus";
    recommendations.push(
      "Focus on core SKUs with proven velocity",
      "Reduce assortment complexity",
      "Prioritize must-stock national brands",
      "Minimize slow-moving specialty items"
    );
  }

  // Default if no specific strategy
  if (!strategy) {
    strategy = "Balanced Assortment";
    brandFocus.push("Mix of national and store brands");
    recommendations.push(
      "Maintain balanced brand tier representation",
      "Monitor velocity to optimize facings",
      "Test new products in select locations first"
    );
  }

  // Add profile-specific recommendations from the profile itself
  if (profile.recommendations && profile.recommendations.length > 0) {
    recommendations.push(...profile.recommendations);
  }

  return {
    strategy,
    brandFocus: brandFocus.length > 0 ? brandFocus : ["National A & B brands"],
    priceFocus,
    subcategoryFocus: subcategoryFocus.length > 0 ? subcategoryFocus : ["All categories"],
    recommendations: [...new Set(recommendations)].slice(0, 5), // Dedupe and limit
  };
}

interface ClusterRecommendationsProps {
  profiles: ClusterProfile[];
}

export function ClusterRecommendations({ profiles }: ClusterRecommendationsProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Assortment Recommendations by Cluster
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Tailored strategies based on each cluster&apos;s characteristics
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Help Section */}
        <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="text-xs text-muted-foreground">
                How Recommendations are Generated
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isHelpOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Recommendation Logic:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>High Premium Share</strong> → Focus on National A brands, premium sizes</li>
              <li><strong>High Private Label Share</strong> → Emphasize Store Brand depth, value positioning</li>
              <li><strong>Urban + High Traffic</strong> → More single-serve, grab-and-go options</li>
              <li><strong>Suburban + High Income</strong> → Multi-packs, family sizes, premium options</li>
              <li><strong>Rural + Low Traffic</strong> → Core assortment only, reduce complexity</li>
            </ul>
            <p className="italic">
              Note: These are directional guidelines. Always validate with local market knowledge.
            </p>
          </CollapsibleContent>
        </Collapsible>

        {/* Cluster Recommendations Accordion */}
        <Accordion type="multiple" defaultValue={profiles.map((_, i) => `cluster-${i}`)}>
          {profiles.map((profile, index) => {
            const recs = generateRecommendations(profile);
            const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length];

            return (
              <AccordionItem key={profile.clusterId} value={`cluster-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">
                      {profile.clusterName || `Cluster ${profile.clusterId + 1}`}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {profile.storeCount} stores
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-6 space-y-4">
                    {/* Strategy */}
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Strategy:</span>
                      <span className="text-sm">{recs.strategy}</span>
                    </div>

                    {/* Brand & Price Focus */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Brand Focus
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {recs.brandFocus.map((brand, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {brand}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Price Focus
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {recs.priceFocus}
                        </Badge>
                      </div>
                    </div>

                    {/* Top Subcategories */}
                    {recs.subcategoryFocus.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Focus Subcategories
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {recs.subcategoryFocus.map((subcat, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {subcat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations List */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Key Actions
                      </p>
                      <ul className="space-y-1.5">
                        {recs.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
