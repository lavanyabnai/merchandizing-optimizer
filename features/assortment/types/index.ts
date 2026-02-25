/**
 * TypeScript types for Assortment Optimizer feature
 */

// =============================================================================
// Enums
// =============================================================================

export type BrandTier = "Premium" | "National A" | "National B" | "Store Brand";

export type StoreFormat = "Express" | "Standard" | "Superstore";

export type LocationType = "Urban" | "Suburban" | "Rural";

export type IncomeIndex = "Low" | "Medium" | "High";

export type OptimizationStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ScenarioType =
  | "remove_sku"
  | "add_sku"
  | "change_facings"
  | "change_price";

export type ClusteringMethod = "kmeans" | "gmm";

export type AssortmentTab =
  | "dashboard"
  | "cdt"
  | "optimizer"
  | "simulation"
  | "clustering"
  | "planogram";

// =============================================================================
// Product Types
// =============================================================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  brandTier: BrandTier;
  subcategory: string;
  size: string;
  packType: string;
  price: number;
  cost: number;
  widthInches: number;
  spaceElasticity: number;
  flavor?: string;
  priceTier?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  brand: string;
  brandTier: BrandTier;
  subcategory: string;
  price: number;
}

// =============================================================================
// Store Types
// =============================================================================

export interface Store {
  id: string;
  storeCode: string;
  name: string;
  format: StoreFormat;
  locationType: LocationType;
  incomeIndex: IncomeIndex;
  totalFacings: number;
  numShelves: number;
  shelfWidthInches: number;
  weeklyTraffic: number;
  region?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSummary {
  id: string;
  storeCode: string;
  name: string;
  format: StoreFormat;
  locationType: LocationType;
}

// =============================================================================
// Sales Types
// =============================================================================

export interface Sale {
  id: string;
  productId: string;
  storeId: string;
  weekNumber: number;
  year: number;
  unitsSold: number;
  revenue: number;
  facings: number;
  onPromotion: boolean;
  createdAt: string;
}

export interface SalesSummary {
  productId: string;
  storeId: string;
  totalUnits: number;
  totalRevenue: number;
  avgFacings: number;
  weeksOnPromotion: number;
}

// =============================================================================
// Optimization Types
// =============================================================================

export interface OptimizationConstraints {
  totalFacings: number;
  minFacingsPerSku: number;
  maxFacingsPerSku: number;
  minSkus: number;
  maxSkus: number;
  mustCarry: string[];
  exclude: string[];
  maxSkusPerBrand?: number;
  minPremiumShare?: number;
  maxPrivateLabelShare?: number;
}

export interface ProductAllocation {
  sku: string;
  name: string;
  brand: string;
  subcategory: string;
  currentFacings: number;
  optimizedFacings: number;
  change: number;
  currentProfit: number;
  projectedProfit: number;
  profitChange: number;
}

export interface SpaceAllocation {
  subcategory: string;
  currentFacings: number;
  optimizedFacings: number;
  change: number;
  currentPct: number;
  optimizedPct: number;
}

export interface OptimizationResult {
  runId: string;
  storeId?: string;
  status: OptimizationStatus;
  constraints: OptimizationConstraints;
  currentProfit: number;
  optimizedProfit: number;
  profitLiftPct: number;
  profitLiftAbsolute: number;
  productAllocations: ProductAllocation[];
  spaceAllocations: SpaceAllocation[];
  executionTimeMs: number;
  createdAt: string;
}

export interface OptimizationSummary {
  runId: string;
  storeId?: string;
  status: OptimizationStatus;
  profitLiftPct?: number;
  createdAt: string;
}

// =============================================================================
// Simulation Types
// =============================================================================

export interface SimulationConfig {
  numTrials: number;
  demandCv: number;
  priceElasticityMean: number;
  priceElasticityStd: number;
  spaceElasticityStd: number;
  walkRateMean: number;
  walkRateStd: number;
  randomSeed?: number;
}

export interface DistributionStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

export interface PercentileStats {
  p5: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export interface SimulationResult {
  runId: string;
  scenarioType: ScenarioType;
  scenarioDescription: string;
  status: OptimizationStatus;
  parameters: Record<string, unknown>;
  config: SimulationConfig;
  baselineRevenue: number;
  baselineProfit: number;
  revenueStats: DistributionStats;
  revenuePercentiles: PercentileStats;
  revenueChange: number;
  revenueChangePct: number;
  profitStats: DistributionStats;
  profitPercentiles: PercentileStats;
  profitChange: number;
  profitChangePct: number;
  probabilityPositive: number;
  probabilityNegative: number;
  probabilityBreakeven: number;
  probabilityExceedTarget?: number;
  profitCi90: [number, number];
  profitCi95: [number, number];
  revenueCi95: [number, number];
  trialsCompleted: number;
  executionTimeMs: number;
  createdAt: string;
}

export interface SimulationSummary {
  runId: string;
  scenarioType: ScenarioType;
  status: OptimizationStatus;
  profitMean?: number;
  probabilityPositive?: number;
  createdAt: string;
  executionTimeMs?: number;
}

// =============================================================================
// Clustering Types
// =============================================================================

export interface ClusteringRequest {
  method: ClusteringMethod;
  nClusters?: number;
  maxClusters: number;
  features: string[];
  randomSeed?: number;
}

export interface ClusterProfile {
  clusterId: number;
  clusterName: string;
  storeCount: number;
  avgRevenue: number;
  totalRevenue: number;
  revenueSharePct: number;
  avgTraffic: number;
  totalTraffic: number;
  premiumShare: number;
  nationalAShare: number;
  nationalBShare: number;
  storeBrandShare: number;
  avgBasket: number;
  dominantFormat: string;
  dominantLocation: string;
  dominantIncome: string;
  isPremiumFocused: boolean;
  isValueFocused: boolean;
  recommendations: string[];
}

export interface StoreClusterAssignment {
  storeId: string;
  storeCode: string;
  storeName: string;
  clusterId: number;
  clusterName: string;
}

export interface PCACoordinate {
  storeId: string;
  storeCode: string;
  clusterId: number;
  pc1: number;
  pc2: number;
  revenue: number;
}

export interface ClusteringResult {
  runId: string;
  method: ClusteringMethod;
  nClusters: number;
  silhouetteScore: number;
  inertia?: number;
  storeAssignments: StoreClusterAssignment[];
  clusterProfiles: ClusterProfile[];
  pcaCoordinates: PCACoordinate[];
  featuresUsed: string[];
  status: OptimizationStatus;
  executionTimeMs: number;
  createdAt: string;
}

export interface ClusteringSummary {
  runId: string;
  method: ClusteringMethod;
  nClusters: number;
  silhouetteScore?: number;
  status: OptimizationStatus;
  createdAt: string;
}

// =============================================================================
// CDT (Consumer Decision Tree) Types
// =============================================================================

export interface CDTNode {
  id: string;
  name: string;
  level: number;
  type: "category" | "segment" | "attribute" | "brand" | "sku";
  share: number;
  growth: number;
  children?: CDTNode[];
}

export interface CDTData {
  categoryName: string;
  root: CDTNode;
  totalRevenue: number;
  periodStart: string;
  periodEnd: string;
}

// =============================================================================
// Dashboard Types
// =============================================================================

export interface DashboardMetrics {
  totalRevenue: number;
  totalProfit: number;
  totalUnits: number;
  avgMargin: number;
  skuCount: number;
  storeCount: number;
  topSubcategories: { name: string; revenue: number; share: number }[];
  brandTierMix: { tier: BrandTier; share: number }[];
  recentOptimizations: OptimizationSummary[];
}

// =============================================================================
// Filter Types
// =============================================================================

export interface AssortmentFilters {
  storeId?: string;
  subcategories: string[];
  brandTiers: BrandTier[];
  priceTiers: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
