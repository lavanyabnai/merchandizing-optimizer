"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Store, Users, DollarSign, TrendingUp, MapPin, Building2 } from "lucide-react";
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

interface ClusterProfileCardProps {
  profile: ClusterProfile;
  color: string;
  maxRevenue: number;
  maxTraffic: number;
}

function ClusterProfileCard({
  profile,
  color,
  maxRevenue,
  maxTraffic,
}: ClusterProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-sm font-medium"
            style={{ color }}
          >
            {profile.clusterName || `Cluster ${profile.clusterId + 1}`}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            <Store className="h-3 w-3 mr-1" />
            {profile.storeCount} stores
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    Avg Revenue
                  </div>
                  <p className="text-sm font-semibold">
                    ${profile.avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <Progress
                    value={(profile.avgRevenue / maxRevenue) * 100}
                    className="h-1"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Average weekly revenue per store</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Avg Traffic
                  </div>
                  <p className="text-sm font-semibold">
                    {profile.avgTraffic.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <Progress
                    value={(profile.avgTraffic / maxTraffic) * 100}
                    className="h-1"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Average weekly customer traffic</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Brand Mix Bars */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Brand Mix</p>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span>Premium Share</span>
              <span className="font-medium">{profile.premiumShare.toFixed(1)}%</span>
            </div>
            <Progress
              value={profile.premiumShare}
              className="h-2"
              style={{
                // @ts-expect-error CSS variable
                "--progress-background": "#9B59B6",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span>Private Label Share</span>
              <span className="font-medium">{profile.storeBrandShare.toFixed(1)}%</span>
            </div>
            <Progress
              value={profile.storeBrandShare}
              className="h-2"
              style={{
                // @ts-expect-error CSS variable
                "--progress-background": "#3498DB",
              }}
            />
          </div>
        </div>

        {/* Dominant Characteristics */}
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  {profile.dominantFormat}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Most common store format</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {profile.dominantLocation}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Most common location type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {profile.isPremiumFocused && (
            <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-100">
              <TrendingUp className="h-3 w-3 mr-1" />
              Premium Focus
            </Badge>
          )}

          {profile.isValueFocused && (
            <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
              <DollarSign className="h-3 w-3 mr-1" />
              Value Focus
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ClusterProfilesProps {
  profiles: ClusterProfile[];
}

export function ClusterProfiles({ profiles }: ClusterProfilesProps) {
  // Calculate max values for relative bar sizes
  const maxRevenue = Math.max(...profiles.map((p) => p.avgRevenue));
  const maxTraffic = Math.max(...profiles.map((p) => p.avgTraffic));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Cluster Profiles</h3>
          <p className="text-xs text-muted-foreground">
            Characteristics that define each store segment
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profiles.map((profile, index) => (
          <ClusterProfileCard
            key={profile.clusterId}
            profile={profile}
            color={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
            maxRevenue={maxRevenue}
            maxTraffic={maxTraffic}
          />
        ))}
      </div>

      {/* Profile insight */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Profile Insight:</strong> Use these
        characteristics to name and describe each cluster (e.g., &quot;Premium Urban&quot;,
        &quot;Value Suburban&quot;). This helps communicate strategies across the organization.
      </div>
    </div>
  );
}
