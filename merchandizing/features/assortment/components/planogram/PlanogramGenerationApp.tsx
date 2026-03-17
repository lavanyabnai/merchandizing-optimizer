"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Package, Zap, BarChart3, Eye, Grid3X3,
  Play, Download, Upload, ChevronDown, ChevronRight,
  Lock, ArrowUpRight, ArrowDownRight,
  Target, TrendingUp, DollarSign,
  Search, X,
  LayoutGrid, Minus, Plus,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Fixture {
  id: string;
  type: "SHELF" | "PEGBOARD" | "BASKET" | "CHILLER" | "FREEZER" | "ENDCAP";
  width_mm: number;
  height_mm: number;
  depth_mm: number;
  y_position_mm: number;
  material: "WIRE" | "WOOD" | "GLASS" | "METAL";
  weight_capacity_kg: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  width_mm: number;
  height_mm: number;
  depth_mm: number;
  price: number;
  cost: number;
  margin_pct: number;
  min_facings: number;
  max_facings: number;
  upc: string;
  image_url: string | null;
}

interface Position {
  id: string;
  fixture_id: string;
  product_id: string;
  x_position_mm: number;
  facings: number;
  depth_count: number;
  stack_height: number;
  orientation: "FRONT" | "LEFT" | "RIGHT" | "TOP" | "LAY_FLAT";
  is_locked: boolean;
}

interface PerformanceData {
  product_id: string;
  unit_sales_weekly: number;
  dollar_sales_weekly: number;
  profit_weekly: number;
  service_level_pct: number;
  space_elasticity_beta: number;
  days_of_supply: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO DATA
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<string, string> = {
  "Carbonated": "#EF4444",
  "Cola": "#EF4444",
  "Lemon-Lime": "#84CC16",
  "Flavored": "#A855F7",
  "Energy": "#F59E0B",
  "Sports": "#3B82F6",
  "Water": "#06B6D4",
  "Juice": "#F97316",
  "Tea": "#10B981",
  "Coffee": "#78350F",
};

const MATERIAL_STYLES: Record<string, { fill: string; stroke: string }> = {
  WIRE: { fill: "#F1F5F9", stroke: "#94A3B8" },
  WOOD: { fill: "#FEF3C7", stroke: "#D97706" },
  GLASS: { fill: "#E0F2FE", stroke: "#0284C7" },
  METAL: { fill: "#F1F5F9", stroke: "#64748B" },
};

const EYE_LEVEL_ZONES = [
  { name: "STRETCH", min_mm: 1600, max_mm: 2000, color: "#FEF3C7", multiplier: 0.85 },
  { name: "EYE LEVEL", min_mm: 1200, max_mm: 1600, color: "#DCFCE7", multiplier: 1.20 },
  { name: "TOUCH", min_mm: 700, max_mm: 1200, color: "#DBEAFE", multiplier: 1.00 },
  { name: "STOOP", min_mm: 0, max_mm: 700, color: "#FEE2E2", multiplier: 0.75 },
];

// Floor plan departments
const FLOOR_DEPARTMENTS = [
  { name: "Produce", area: 80, color: "#4ADE80", x: 0, y: 0, w: 35, h: 35, gondolas: [
    { id: "g1", label: "Produce A1", x: 3, y: 10, w: 8, h: 4 },
    { id: "g2", label: "Produce A2", x: 14, y: 10, w: 8, h: 4 },
  ]},
  { name: "Dairy", area: 64, color: "#38BDF8", x: 38, y: 0, w: 28, h: 35, gondolas: [] },
  { name: "Frozen", area: 64, color: "#67E8F9", x: 69, y: 0, w: 28, h: 35, gondolas: [] },
  { name: "Beverages", area: 120, color: "#C4B5FD", x: 0, y: 38, w: 35, h: 40, gondolas: [
    { id: "g3", label: "Beverages A1", x: 3, y: 42, w: 10, h: 4 },
    { id: "g4", label: "Beverages A2", x: 3, y: 52, w: 10, h: 4 },
    { id: "g5", label: "Beverages A3", x: 3, y: 62, w: 10, h: 4 },
  ]},
  { name: "Grocery", area: 150, color: "#86EFAC", x: 38, y: 38, w: 59, h: 40, gondolas: [
    { id: "g6", label: "Grocery B1", x: 40, y: 42, w: 10, h: 4 },
    { id: "g7", label: "Grocery C1", x: 55, y: 42, w: 10, h: 4 },
    { id: "g8", label: "Grocery B2", x: 40, y: 52, w: 10, h: 4 },
    { id: "g9", label: "Grocery C2", x: 55, y: 52, w: 10, h: 4 },
    { id: "g10", label: "Grocery B3", x: 40, y: 62, w: 10, h: 4 },
  ]},
  { name: "Checkout", area: 112, color: "#FCA5A5", x: 0, y: 81, w: 97, h: 14, gondolas: [] },
];

const DEMO_FIXTURES: Fixture[] = [
  { id: "f1", type: "SHELF", width_mm: 1200, height_mm: 50, depth_mm: 450, y_position_mm: 1700, material: "WIRE", weight_capacity_kg: 50 },
  { id: "f2", type: "SHELF", width_mm: 1200, height_mm: 50, depth_mm: 450, y_position_mm: 1300, material: "WIRE", weight_capacity_kg: 50 },
  { id: "f3", type: "SHELF", width_mm: 1200, height_mm: 50, depth_mm: 450, y_position_mm: 900, material: "WOOD", weight_capacity_kg: 50 },
  { id: "f4", type: "SHELF", width_mm: 1200, height_mm: 50, depth_mm: 450, y_position_mm: 500, material: "METAL", weight_capacity_kg: 50 },
  { id: "f5", type: "SHELF", width_mm: 1200, height_mm: 50, depth_mm: 450, y_position_mm: 100, material: "WIRE", weight_capacity_kg: 50 },
];

const DEMO_PRODUCTS: Product[] = [
  { id: "pr1", name: "Coca-Cola Classic 330ml", brand: "Coca-Cola", category: "Carbonated", subcategory: "Cola", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.29, cost: 0.45, margin_pct: 65.1, min_facings: 2, max_facings: 8, upc: "049000042566", image_url: null },
  { id: "pr2", name: "Diet Coke 330ml", brand: "Coca-Cola", category: "Carbonated", subcategory: "Cola", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.29, cost: 0.45, margin_pct: 65.1, min_facings: 1, max_facings: 6, upc: "049000042573", image_url: null },
  { id: "pr3", name: "Red Bull 250ml", brand: "Red Bull", category: "Energy", subcategory: "Energy", width_mm: 53, height_mm: 135, depth_mm: 53, price: 2.99, cost: 1.20, margin_pct: 59.9, min_facings: 2, max_facings: 6, upc: "611269991000", image_url: null },
  { id: "pr4", name: "Pepsi 330ml", brand: "Pepsi", category: "Carbonated", subcategory: "Cola", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.19, cost: 0.42, margin_pct: 64.7, min_facings: 2, max_facings: 6, upc: "012000001536", image_url: null },
  { id: "pr5", name: "Dr Pepper 330ml", brand: "Dr Pepper", category: "Carbonated", subcategory: "Flavored", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.29, cost: 0.44, margin_pct: 65.9, min_facings: 1, max_facings: 4, upc: "078000113464", image_url: null },
  { id: "pr6", name: "Gatorade Lemon-Lime 591ml", brand: "Gatorade", category: "Sports", subcategory: "Sports", width_mm: 70, height_mm: 230, depth_mm: 70, price: 1.99, cost: 0.80, margin_pct: 59.8, min_facings: 1, max_facings: 4, upc: "052000328752", image_url: null },
  { id: "pr7", name: "Liquid Death Water 500ml", brand: "Liquid Death", category: "Water", subcategory: "Water", width_mm: 66, height_mm: 170, depth_mm: 66, price: 1.79, cost: 0.65, margin_pct: 63.7, min_facings: 1, max_facings: 4, upc: "850742007013", image_url: null },
  { id: "pr8", name: "Sprite 330ml", brand: "Coca-Cola", category: "Carbonated", subcategory: "Lemon-Lime", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.29, cost: 0.45, margin_pct: 65.1, min_facings: 1, max_facings: 6, upc: "049000050103", image_url: null },
  { id: "pr9", name: "Monster Energy 473ml", brand: "Monster", category: "Energy", subcategory: "Energy", width_mm: 66, height_mm: 168, depth_mm: 66, price: 2.49, cost: 0.95, margin_pct: 61.8, min_facings: 2, max_facings: 5, upc: "070847811169", image_url: null },
  { id: "pr10", name: "Dasani Water 591ml", brand: "Dasani", category: "Water", subcategory: "Water", width_mm: 66, height_mm: 210, depth_mm: 66, price: 1.49, cost: 0.35, margin_pct: 76.5, min_facings: 1, max_facings: 6, upc: "049000042238", image_url: null },
  { id: "pr11", name: "Fanta Orange 330ml", brand: "Coca-Cola", category: "Carbonated", subcategory: "Flavored", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.19, cost: 0.42, margin_pct: 64.7, min_facings: 1, max_facings: 4, upc: "049000031034", image_url: null },
  { id: "pr12", name: "Mountain Dew 330ml", brand: "PepsiCo", category: "Carbonated", subcategory: "Lemon-Lime", width_mm: 66, height_mm: 115, depth_mm: 66, price: 1.19, cost: 0.40, margin_pct: 66.4, min_facings: 1, max_facings: 5, upc: "012000001253", image_url: null },
];

const DEMO_POSITIONS: Position[] = [
  { id: "pos1", fixture_id: "f2", product_id: "pr1", x_position_mm: 0, facings: 4, depth_count: 3, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos2", fixture_id: "f2", product_id: "pr4", x_position_mm: 264, facings: 3, depth_count: 3, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos3", fixture_id: "f2", product_id: "pr8", x_position_mm: 462, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos4", fixture_id: "f3", product_id: "pr2", x_position_mm: 0, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos5", fixture_id: "f3", product_id: "pr5", x_position_mm: 198, facings: 3, depth_count: 3, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos6", fixture_id: "f3", product_id: "pr11", x_position_mm: 396, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos7", fixture_id: "f3", product_id: "pr12", x_position_mm: 594, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos8", fixture_id: "f1", product_id: "pr3", x_position_mm: 0, facings: 4, depth_count: 3, stack_height: 1, orientation: "FRONT", is_locked: true },
  { id: "pos9", fixture_id: "f1", product_id: "pr9", x_position_mm: 212, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos10", fixture_id: "f4", product_id: "pr6", x_position_mm: 0, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos11", fixture_id: "f4", product_id: "pr7", x_position_mm: 210, facings: 3, depth_count: 2, stack_height: 1, orientation: "FRONT", is_locked: false },
  { id: "pos12", fixture_id: "f5", product_id: "pr10", x_position_mm: 0, facings: 4, depth_count: 3, stack_height: 2, orientation: "FRONT", is_locked: false },
];

const DEMO_PERFORMANCE: PerformanceData[] = [
  { product_id: "pr1", unit_sales_weekly: 48, dollar_sales_weekly: 61.92, profit_weekly: 40.32, service_level_pct: 97.2, space_elasticity_beta: 0.15, days_of_supply: 3.5 },
  { product_id: "pr2", unit_sales_weekly: 24, dollar_sales_weekly: 30.96, profit_weekly: 20.16, service_level_pct: 95.8, space_elasticity_beta: 0.12, days_of_supply: 4.2 },
  { product_id: "pr3", unit_sales_weekly: 36, dollar_sales_weekly: 107.64, profit_weekly: 64.44, service_level_pct: 98.1, space_elasticity_beta: 0.20, days_of_supply: 4.7 },
  { product_id: "pr4", unit_sales_weekly: 30, dollar_sales_weekly: 35.70, profit_weekly: 23.10, service_level_pct: 96.5, space_elasticity_beta: 0.14, days_of_supply: 4.0 },
  { product_id: "pr5", unit_sales_weekly: 18, dollar_sales_weekly: 23.22, profit_weekly: 15.30, service_level_pct: 94.0, space_elasticity_beta: 0.10, days_of_supply: 5.0 },
  { product_id: "pr6", unit_sales_weekly: 12, dollar_sales_weekly: 23.88, profit_weekly: 14.28, service_level_pct: 91.0, space_elasticity_beta: 0.18, days_of_supply: 3.3 },
  { product_id: "pr7", unit_sales_weekly: 20, dollar_sales_weekly: 35.80, profit_weekly: 22.80, service_level_pct: 96.0, space_elasticity_beta: 0.13, days_of_supply: 4.5 },
  { product_id: "pr8", unit_sales_weekly: 22, dollar_sales_weekly: 28.38, profit_weekly: 18.48, service_level_pct: 95.5, space_elasticity_beta: 0.11, days_of_supply: 4.1 },
  { product_id: "pr9", unit_sales_weekly: 28, dollar_sales_weekly: 69.72, profit_weekly: 43.12, service_level_pct: 96.8, space_elasticity_beta: 0.17, days_of_supply: 3.8 },
  { product_id: "pr10", unit_sales_weekly: 32, dollar_sales_weekly: 47.68, profit_weekly: 36.48, service_level_pct: 97.5, space_elasticity_beta: 0.09, days_of_supply: 5.2 },
  { product_id: "pr11", unit_sales_weekly: 15, dollar_sales_weekly: 17.85, profit_weekly: 11.55, service_level_pct: 93.2, space_elasticity_beta: 0.11, days_of_supply: 5.5 },
  { product_id: "pr12", unit_sales_weekly: 19, dollar_sales_weekly: 22.61, profit_weekly: 15.01, service_level_pct: 94.8, space_elasticity_beta: 0.12, days_of_supply: 4.8 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZATION ENGINE (Simple heuristic for demo)
// ═══════════════════════════════════════════════════════════════════════════════

function optimizePlanogram(
  products: Product[],
  fixtures: Fixture[],
  performance: PerformanceData[],
  objective: "MAX_PROFIT" | "MAX_REVENUE" | "MAX_SERVICE_LEVEL",
  categoryBlocking: boolean,
  eyeLevelPriority: boolean,
): Position[] {
  const perfMap = new Map(performance.map(p => [p.product_id, p]));
  const sorted = [...products].sort((a, b) => {
    const pa = perfMap.get(a.id);
    const pb = perfMap.get(b.id);
    if (!pa || !pb) return 0;
    switch (objective) {
      case "MAX_PROFIT": return pb.profit_weekly - pa.profit_weekly;
      case "MAX_REVENUE": return pb.dollar_sales_weekly - pa.dollar_sales_weekly;
      case "MAX_SERVICE_LEVEL": return pb.service_level_pct - pa.service_level_pct;
    }
  });

  // Sort fixtures by y position (higher = eye level priority)
  const sortedFixtures = [...fixtures].sort((a, b) => {
    if (eyeLevelPriority) {
      const aEye = a.y_position_mm >= 1200 && a.y_position_mm <= 1600;
      const bEye = b.y_position_mm >= 1200 && b.y_position_mm <= 1600;
      if (aEye && !bEye) return -1;
      if (!aEye && bEye) return 1;
    }
    return b.y_position_mm - a.y_position_mm;
  });

  const positions: Position[] = [];
  let posId = 1;

  if (categoryBlocking) {
    const byCat = new Map<string, Product[]>();
    sorted.forEach(p => {
      const cat = p.subcategory || p.category;
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat)!.push(p);
    });

    let fixtureIdx = 0;
    let xPos = 0;

    for (const [, catProducts] of byCat) {
      for (const product of catProducts) {
        if (fixtureIdx >= sortedFixtures.length) break;
        const fixture = sortedFixtures[fixtureIdx];
        const perf = perfMap.get(product.id);
        const facings = Math.min(
          Math.max(product.min_facings, Math.round((perf?.dollar_sales_weekly ?? 30) / 15)),
          product.max_facings
        );
        const productWidth = product.width_mm * facings;

        if (xPos + productWidth > fixture.width_mm) {
          fixtureIdx++;
          xPos = 0;
          if (fixtureIdx >= sortedFixtures.length) break;
        }

        positions.push({
          id: `opt-pos-${posId++}`,
          fixture_id: sortedFixtures[fixtureIdx].id,
          product_id: product.id,
          x_position_mm: xPos,
          facings,
          depth_count: 2,
          stack_height: 1,
          orientation: "FRONT",
          is_locked: false,
        });
        xPos += productWidth;
      }
    }
  } else {
    let fixtureIdx = 0;
    let xPos = 0;

    for (const product of sorted) {
      if (fixtureIdx >= sortedFixtures.length) break;
      const fixture = sortedFixtures[fixtureIdx];
      const perf = perfMap.get(product.id);
      const facings = Math.min(
        Math.max(product.min_facings, Math.round((perf?.dollar_sales_weekly ?? 30) / 15)),
        product.max_facings
      );
      const productWidth = product.width_mm * facings;

      if (xPos + productWidth > fixture.width_mm) {
        fixtureIdx++;
        xPos = 0;
        if (fixtureIdx >= sortedFixtures.length) break;
      }

      positions.push({
        id: `opt-pos-${posId++}`,
        fixture_id: sortedFixtures[fixtureIdx].id,
        product_id: product.id,
        x_position_mm: xPos,
        facings,
        depth_count: 2,
        stack_height: 1,
        orientation: "FRONT",
        is_locked: false,
      });
      xPos += productWidth;
    }
  }

  return positions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function PlanogramGenerationApp() {
  // State
  const [fixtures] = useState<Fixture[]>(DEMO_FIXTURES);
  const [products] = useState<Product[]>(DEMO_PRODUCTS);
  const [positions, setPositions] = useState<Position[]>(DEMO_POSITIONS);
  const [performance] = useState<PerformanceData[]>(DEMO_PERFORMANCE);

  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [hoveredPositionId, setHoveredPositionId] = useState<string | null>(null);
  const [showEyeLevelZones, setShowEyeLevelZones] = useState(false);
  const [showGridSnap, setShowGridSnap] = useState(true);
  const [rightPanel, setRightPanel] = useState<"properties" | "analytics">("properties");
  const [sidebarTab, setSidebarTab] = useState<"planogram" | "floorplan">("planogram");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<Record<string, boolean>>({});
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [optimizeObjective, setOptimizeObjective] = useState<"MAX_PROFIT" | "MAX_REVENUE" | "MAX_SERVICE_LEVEL">("MAX_PROFIT");
  const [categoryBlocking, setCategoryBlocking] = useState(true);
  const [eyeLevelPriority, setEyeLevelPriority] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState(0);
  const [planogramStatus] = useState<"DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED">("DRAFT");
  const [undoStack, setUndoStack] = useState<Position[][]>([]);
  const [redoStack, setRedoStack] = useState<Position[][]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Derived data
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const perfMap = useMemo(() => new Map(performance.map(p => [p.product_id, p])), [performance]);
  const selectedPosition = useMemo(
    () => positions.find(p => p.id === selectedPositionId) ?? null,
    [positions, selectedPositionId]
  );

  const selectedProduct = useMemo(
    () => selectedPosition ? productMap.get(selectedPosition.product_id) ?? null : null,
    [selectedPosition, productMap]
  );

  const selectedPerformance = useMemo(
    () => selectedPosition ? perfMap.get(selectedPosition.product_id) ?? null : null,
    [selectedPosition, perfMap]
  );

  // Group products by category for sidebar
  const productsByCategory = useMemo(() => {
    const groups = new Map<string, Product[]>();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
    filtered.forEach(p => {
      const cat = p.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(p);
    });
    return groups;
  }, [products, sidebarSearch]);

  // Metrics
  const metrics = useMemo(() => {
    const totalFixtureWidth = fixtures.reduce((sum, f) => sum + f.width_mm, 0);
    const usedWidth = positions.reduce((sum, pos) => {
      const product = productMap.get(pos.product_id);
      return sum + (product ? product.width_mm * pos.facings : 0);
    }, 0);
    const utilization = totalFixtureWidth > 0 ? (usedWidth / totalFixtureWidth) * 100 : 0;
    const totalProducts = new Set(positions.map(p => p.product_id)).size;
    const totalFacings = positions.reduce((sum, p) => sum + p.facings, 0);
    const totalRevenue = positions.reduce((sum, pos) => {
      const perf = perfMap.get(pos.product_id);
      return sum + (perf?.dollar_sales_weekly ?? 0);
    }, 0);
    const totalProfit = positions.reduce((sum, pos) => {
      const perf = perfMap.get(pos.product_id);
      return sum + (perf?.profit_weekly ?? 0);
    }, 0);
    const avgServiceLevel = positions.length > 0
      ? positions.reduce((sum, pos) => sum + (perfMap.get(pos.product_id)?.service_level_pct ?? 0), 0) / positions.length
      : 0;
    const revenuePerFoot = usedWidth > 0 ? totalRevenue / (usedWidth / 304.8) : 0;

    return { totalFixtureWidth, usedWidth, utilization, totalProducts, totalFacings, totalRevenue, totalProfit, avgServiceLevel, revenuePerFoot };
  }, [fixtures, positions, productMap, perfMap]);

  // Analytics by category
  const categoryAnalytics = useMemo(() => {
    const cats = new Map<string, { category: string; color: string; facings: number; skus: number; revenue: number; profit: number; spaceShare: number }>();
    positions.forEach(pos => {
      const product = productMap.get(pos.product_id);
      const perf = perfMap.get(pos.product_id);
      if (!product) return;
      const cat = product.subcategory || product.category;
      if (!cats.has(cat)) {
        cats.set(cat, { category: cat, color: CATEGORY_COLORS[cat] || "#6B7280", facings: 0, skus: 0, revenue: 0, profit: 0, spaceShare: 0 });
      }
      const entry = cats.get(cat)!;
      entry.facings += pos.facings;
      entry.skus++;
      entry.revenue += perf?.dollar_sales_weekly ?? 0;
      entry.profit += perf?.profit_weekly ?? 0;
    });
    const totalFacings = metrics.totalFacings;
    cats.forEach(c => { c.spaceShare = totalFacings > 0 ? (c.facings / totalFacings) * 100 : 0; });
    return Array.from(cats.values()).sort((a, b) => b.revenue - a.revenue);
  }, [positions, productMap, perfMap, metrics.totalFacings]);

  // Actions
  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), positions]);
    setRedoStack([]);
  }, [positions]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    setRedoStack(prev => [...prev, positions]);
    setPositions(undoStack[undoStack.length - 1]);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, positions]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    setUndoStack(prev => [...prev, positions]);
    setPositions(redoStack[redoStack.length - 1]);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, positions]);

  const updatePosition = useCallback((posId: string, updates: Partial<Position>) => {
    pushUndo();
    setPositions(prev => prev.map(p => p.id === posId ? { ...p, ...updates } : p));
  }, [pushUndo]);

  const handleOptimize = useCallback(() => {
    setIsOptimizing(true);
    setOptimizeProgress(0);
    const interval = setInterval(() => {
      setOptimizeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      pushUndo();
      const newPositions = optimizePlanogram(products, fixtures, performance, optimizeObjective, categoryBlocking, eyeLevelPriority);
      setPositions(newPositions);
      setIsOptimizing(false);
      setOptimizeProgress(100);
      setShowOptimizeDialog(false);
    }, 2500);
  }, [products, fixtures, performance, optimizeObjective, categoryBlocking, eyeLevelPriority, pushUndo]);

  // ═════════════════════════════════════════════════════════════════════════════
  // CANVAS RENDERING
  // ═════════════════════════════════════════════════════════════════════════════

  const SCALE = 0.45; // px per mm
  const PLANOGRAM_HEIGHT = 2000;
  const PLANOGRAM_WIDTH = 1200;

  const getFixtureScreenY = (fixture: Fixture) =>
    (PLANOGRAM_HEIGHT - fixture.y_position_mm - fixture.height_mm) * SCALE;

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-slate-50 rounded-xl border overflow-hidden">
      {/* ─── LEFT SIDEBAR: Product Catalog ─── */}
      <aside className="w-72 bg-white border-r text-slate-800 flex flex-col overflow-hidden shrink-0">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSidebarTab("planogram")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              sidebarTab === "planogram"
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Planogram
          </button>
          <button
            onClick={() => setSidebarTab("floorplan")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              sidebarTab === "floorplan"
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Floor Plan
          </button>
        </div>

        {sidebarTab === "planogram" ? (
          <>
            {/* Search */}
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                  className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 rounded-lg px-8 py-2 border border-slate-200 focus:outline-none focus:border-slate-400"
                />
                {sidebarSearch && (
                  <button onClick={() => setSidebarSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-700" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Array.from(productsByCategory.entries()).map(([category, catProducts]) => {
                const isCollapsed = sidebarCollapsed[category] ?? false;
                const color = CATEGORY_COLORS[category] || "#6B7280";
                return (
                  <div key={category}>
                    <button
                      onClick={() => setSidebarCollapsed(prev => ({ ...prev, [category]: !prev[category] }))}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span>{category}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-100">{catProducts.length}</Badge>
                      {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {!isCollapsed && (
                      <div className="px-2 pb-2 space-y-1">
                        {catProducts.map(product => {
                          const isPlaced = positions.some(p => p.product_id === product.id);
                          const isSelected = isPlaced && positions.find(p => p.product_id === product.id)?.id === selectedPositionId;
                          const catColor = CATEGORY_COLORS[product.subcategory] || color;
                          return (
                            <div
                              key={product.id}
                              className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all border-l-[3px] ${
                                isSelected
                                  ? "bg-blue-50 border-l-blue-500"
                                  : isPlaced
                                    ? "bg-slate-50 border-l-green-500 hover:bg-slate-100"
                                    : "bg-transparent border-l-transparent hover:bg-slate-50 hover:border-l-slate-300"
                              }`}
                              onClick={() => {
                                const pos = positions.find(p => p.product_id === product.id);
                                if (pos) {
                                  setSelectedPositionId(pos.id === selectedPositionId ? null : pos.id);
                                  setRightPanel("properties");
                                }
                              }}
                            >
                              {/* Avatar */}
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                                style={{ backgroundColor: catColor }}
                              >
                                {product.brand.charAt(0)}
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                                <p className="text-xs text-slate-500 truncate">{product.brand} · {product.upc}</p>
                                <p className="text-xs text-slate-400">{product.width_mm}x{product.height_mm}x{product.depth_mm}mm · ${product.price.toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500">
              {products.length} products · {positions.length} placed
            </div>
          </>
        ) : (
          <>
            {/* Floor Plan Tab - White theme sidebar */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-800">
              {/* Header */}
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-800">Floor Plan Editor</h3>
                <p className="text-xs text-slate-500 mt-0.5">Store Layout · 1000 sqm</p>
              </div>

              {/* Add Gondola Section */}
              <div className="p-4 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Add Gondola</h4>
                <div className="space-y-2">
                  {[
                    { label: "4ft (1.2m)", width: 16 },
                    { label: "8ft (2.4m)", width: 24 },
                    { label: "12ft (3.6m)", width: 32 },
                    { label: "Endcap", width: 10 },
                    { label: "Wall Unit", width: 40 },
                  ].map(gondola => (
                    <div key={gondola.label} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className="h-5 bg-slate-300 rounded-sm group-hover:bg-slate-400 transition-colors"
                        style={{ width: gondola.width }}
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{gondola.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Section */}
              <div className="p-4 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">View</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Show Traffic Flow</span>
                </label>
              </div>

              {/* Departments Section */}
              <div className="p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Departments ({FLOOR_DEPARTMENTS.length})
                </h4>
                <div className="space-y-2.5">
                  {FLOOR_DEPARTMENTS.map(dept => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: dept.color }} />
                        <span className="text-sm text-slate-700">{dept.name}</span>
                      </div>
                      <span className="text-sm text-slate-400">{dept.area}m²</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Total: {FLOOR_DEPARTMENTS.reduce((sum, d) => sum + d.area, 0)} m²
                </p>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {sidebarTab === "planogram" ? (
        <>
        {/* Toolbar */}
        <div className="h-11 bg-white border-b flex items-center px-3 gap-1.5 shrink-0">
          <Button size="sm" variant="default" className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
          <div className="w-px h-5 bg-gray-200" />
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleUndo} disabled={undoStack.length === 0}>
            Undo
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleRedo} disabled={redoStack.length === 0}>
            Redo
          </Button>
          <div className="w-px h-5 bg-gray-200" />
          <Button
            size="sm"
            variant={showEyeLevelZones ? "default" : "outline"}
            className={`h-7 text-xs ${showEyeLevelZones ? "bg-green-600 hover:bg-green-700 border-green-600" : ""}`}
            onClick={() => setShowEyeLevelZones(!showEyeLevelZones)}
          >
            <Eye className="h-3 w-3 mr-1" /> Eye Level
          </Button>
          <Button
            size="sm"
            variant={showGridSnap ? "default" : "outline"}
            className={`h-7 text-xs ${showGridSnap ? "bg-blue-600 hover:bg-blue-700 border-blue-600" : ""}`}
            onClick={() => setShowGridSnap(!showGridSnap)}
          >
            <Grid3X3 className="h-3 w-3 mr-1" /> Snap
          </Button>
          <div className="w-px h-5 bg-gray-200" />
          <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => setShowOptimizeDialog(true)}>
            <Zap className="h-3 w-3 mr-1" /> Auto-Generate
          </Button>
          <div className="w-px h-5 bg-gray-200" />
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Upload className="h-3 w-3 mr-1" /> Import
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Download className="h-3 w-3 mr-1" /> Export
          </Button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Right panel toggle */}
          <div className="flex bg-gray-100 rounded p-0.5 ml-1">
            <button
              onClick={() => setRightPanel("properties")}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${rightPanel === "properties" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Properties
            </button>
            <button
              onClick={() => setRightPanel("analytics")}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${rightPanel === "analytics" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Analytics
            </button>
          </div>

          <div className="flex-1" />

          {/* Status badge */}
          <Badge
            variant="outline"
            className={`text-[10px] cursor-pointer ${
              planogramStatus === "DRAFT" ? "border-gray-300 text-gray-600" :
              planogramStatus === "IN_REVIEW" ? "border-yellow-400 text-yellow-700 bg-yellow-50" :
              planogramStatus === "APPROVED" ? "border-green-400 text-green-700 bg-green-50" :
              "border-blue-400 text-blue-700 bg-blue-50"
            }`}
          >
            {planogramStatus.replace("_", " ")}
          </Badge>
        </div>

        {/* Canvas + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div ref={canvasRef} className="flex-1 overflow-auto bg-slate-100 p-6 relative">
            {/* Optimize Dialog Overlay */}
            {showOptimizeDialog && (
              <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
                <Card className="w-[420px] shadow-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      Auto-Generate Planogram
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isOptimizing ? (
                      <div className="space-y-3 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          Optimizing layout...
                        </div>
                        <Progress value={Math.min(optimizeProgress, 100)} className="h-2" />
                        <p className="text-xs text-slate-500">
                          Running CP-SAT solver with {categoryBlocking ? "category blocking" : "free placement"}, {eyeLevelPriority ? "eye-level priority" : "standard"} constraints...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Optimization Objective</Label>
                          <Select value={optimizeObjective} onValueChange={(v) => setOptimizeObjective(v as typeof optimizeObjective)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MAX_PROFIT">Maximize Profit</SelectItem>
                              <SelectItem value="MAX_REVENUE">Maximize Revenue</SelectItem>
                              <SelectItem value="MAX_SERVICE_LEVEL">Maximize Service Level</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-xs font-medium">Constraints</Label>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">Category Blocking</span>
                            <Switch checked={categoryBlocking} onCheckedChange={setCategoryBlocking} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">Eye-Level Priority (top sellers)</span>
                            <Switch checked={eyeLevelPriority} onCheckedChange={setEyeLevelPriority} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => setShowOptimizeDialog(false)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="flex-1 h-8 text-xs bg-purple-600 hover:bg-purple-700" onClick={handleOptimize}>
                            <Play className="h-3 w-3 mr-1" /> Run Optimization
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Planogram Canvas */}
            <div className="w-full relative bg-white rounded-lg shadow-sm border p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Beverage Gondola — Bay 1</h3>
                  <p className="text-[11px] text-slate-500">1200mm × 2000mm · 5 shelves · L→R traffic flow</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {metrics.utilization.toFixed(0)}% utilized
                </Badge>
              </div>

              {/* Gondola visualization */}
              <div className="relative w-full" style={{ height: PLANOGRAM_HEIGHT * SCALE + 20 }}>
                {/* Eye level zones */}
                {showEyeLevelZones && EYE_LEVEL_ZONES.map(zone => (
                  <div
                    key={zone.name}
                    className="absolute left-0 right-0 flex items-center justify-end pr-1"
                    style={{
                      top: (PLANOGRAM_HEIGHT - zone.max_mm) * SCALE,
                      height: (zone.max_mm - zone.min_mm) * SCALE,
                      backgroundColor: zone.color,
                      opacity: 0.3,
                    }}
                  >
                    <span className="text-[9px] font-medium text-slate-600 bg-white/70 px-1 rounded">{zone.name} ({zone.multiplier}x)</span>
                  </div>
                ))}

                {/* Grid lines */}
                {showGridSnap && Array.from({ length: Math.floor(PLANOGRAM_WIDTH / 100) + 1 }).map((_, i) => (
                  <div
                    key={`grid-v-${i}`}
                    className="absolute top-0 bottom-0 border-l border-dashed border-slate-200"
                    style={{ left: i * 100 * SCALE }}
                  />
                ))}

                {/* Fixtures and products */}
                {fixtures.map(fixture => {
                  const fixtureY = getFixtureScreenY(fixture);
                  const matStyle = MATERIAL_STYLES[fixture.material];
                  const fixturePositions = positions.filter(p => p.fixture_id === fixture.id);

                  return (
                    <div key={fixture.id}>
                      {/* Fixture shelf */}
                      <div
                        className="absolute rounded-sm border-b-[3px]"
                        style={{
                          left: 0,
                          top: fixtureY,
                          width: fixture.width_mm * SCALE,
                          height: 300 * SCALE,
                          backgroundColor: matStyle.fill,
                          borderColor: matStyle.stroke,
                        }}
                      >
                        {/* Products on this fixture */}
                        {fixturePositions.map(pos => {
                          const product = productMap.get(pos.product_id);
                          if (!product) return null;
                          const perf = perfMap.get(pos.product_id);
                          const w = product.width_mm * pos.facings * SCALE;
                          const h = Math.min(product.height_mm * pos.stack_height * SCALE, 280 * SCALE);
                          const catColor = CATEGORY_COLORS[product.subcategory] || CATEGORY_COLORS[product.category] || "#6B7280";
                          const isSelected = selectedPositionId === pos.id;
                          const isHovered = hoveredPositionId === pos.id;

                          return (
                            <TooltipProvider key={pos.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`absolute bottom-[3px] cursor-pointer transition-all border ${
                                      isSelected ? "ring-2 ring-blue-500 z-10 border-blue-500" :
                                      isHovered ? "ring-1 ring-blue-300 z-10 border-blue-300" :
                                      "border-black/20"
                                    }`}
                                    style={{
                                      left: pos.x_position_mm * SCALE,
                                      width: w,
                                      height: h,
                                      backgroundColor: catColor,
                                      opacity: pos.is_locked ? 0.6 : 0.85,
                                    }}
                                    onClick={() => setSelectedPositionId(pos.id === selectedPositionId ? null : pos.id)}
                                    onMouseEnter={() => setHoveredPositionId(pos.id)}
                                    onMouseLeave={() => setHoveredPositionId(null)}
                                  >
                                    {/* Product label */}
                                    {w > 35 && (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-0.5 overflow-hidden">
                                        <span className="text-[8px] font-semibold leading-tight text-center truncate w-full">{product.brand}</span>
                                        {w > 55 && <span className="text-[7px] opacity-80 leading-tight truncate w-full text-center">x{pos.facings}</span>}
                                      </div>
                                    )}
                                    {/* Lock indicator */}
                                    {pos.is_locked && (
                                      <Lock className="absolute top-0.5 right-0.5 h-2.5 w-2.5 text-white/70" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-medium text-sm">{product.name}</p>
                                    <div className="text-xs text-muted-foreground space-y-0.5">
                                      <p>Brand: {product.brand} · {product.subcategory}</p>
                                      <p>Facings: {pos.facings} · Depth: {pos.depth_count} · Stack: {pos.stack_height}</p>
                                      <p>Width: {product.width_mm * pos.facings}mm ({(product.width_mm * pos.facings / 25.4).toFixed(1)}&quot;)</p>
                                      <p>Price: ${product.price.toFixed(2)} · Margin: {product.margin_pct.toFixed(1)}%</p>
                                      {perf && (
                                        <>
                                          <p>Weekly Sales: ${perf.dollar_sales_weekly.toFixed(2)} · Profit: ${perf.profit_weekly.toFixed(2)}</p>
                                          <p>Service Level: {perf.service_level_pct.toFixed(1)}% · DoS: {perf.days_of_supply.toFixed(1)}</p>
                                        </>
                                      )}
                                      {pos.is_locked && <p className="text-yellow-600 font-medium">Position locked</p>}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>

                      {/* Shelf label */}
                      <div
                        className="absolute text-[9px] text-slate-400 font-medium"
                        style={{
                          left: fixture.width_mm * SCALE + 6,
                          top: fixtureY + 300 * SCALE / 2 - 6,
                        }}
                      >
                        {fixture.type === "SHELF" ? `${fixture.material}` : fixture.type}
                      </div>
                    </div>
                  );
                })}

                {/* Width ruler */}
                <div className="absolute left-0 right-0 flex justify-between text-[9px] text-slate-400" style={{ top: PLANOGRAM_HEIGHT * SCALE + 4 }}>
                  <span>0</span>
                  <span>300mm</span>
                  <span>600mm</span>
                  <span>900mm</span>
                  <span>1200mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT PANEL ─── */}
          <div className="w-72 bg-white border-l overflow-y-auto shrink-0">
            {rightPanel === "properties" ? (
              <div className="p-3 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">Properties</h3>

                {selectedPosition && selectedProduct ? (
                  <>
                    {/* Product info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: CATEGORY_COLORS[selectedProduct.subcategory] || "#6B7280" }}>
                          {selectedProduct.brand.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{selectedProduct.name}</p>
                          <p className="text-[10px] text-slate-500">{selectedProduct.brand} · {selectedProduct.subcategory}</p>
                        </div>
                      </div>
                    </div>

                    {/* Position controls */}
                    <div className="space-y-3">
                      <Label className="text-[11px] font-medium text-slate-600">Position Controls</Label>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 mb-1 block">Facings</span>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updatePosition(selectedPosition.id, { facings: Math.max(selectedProduct.min_facings, selectedPosition.facings - 1) })}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-bold w-6 text-center">{selectedPosition.facings}</span>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updatePosition(selectedPosition.id, { facings: Math.min(selectedProduct.max_facings, selectedPosition.facings + 1) })}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-[9px] text-slate-400">{selectedProduct.min_facings}–{selectedProduct.max_facings} range</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 mb-1 block">Depth</span>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updatePosition(selectedPosition.id, { depth_count: Math.max(1, selectedPosition.depth_count - 1) })}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-bold w-6 text-center">{selectedPosition.depth_count}</span>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updatePosition(selectedPosition.id, { depth_count: Math.min(6, selectedPosition.depth_count + 1) })}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 mb-1 block">Stack Height</span>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updatePosition(selectedPosition.id, { stack_height: Math.max(1, selectedPosition.stack_height - 1) })}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-bold w-6 text-center">{selectedPosition.stack_height}</span>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updatePosition(selectedPosition.id, { stack_height: Math.min(3, selectedPosition.stack_height + 1) })}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 mb-1 block">Orientation</span>
                          <Select value={selectedPosition.orientation} onValueChange={(v) => updatePosition(selectedPosition.id, { orientation: v as Position["orientation"] })}>
                            <SelectTrigger className="h-7 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FRONT">Front</SelectItem>
                              <SelectItem value="LEFT">Left</SelectItem>
                              <SelectItem value="RIGHT">Right</SelectItem>
                              <SelectItem value="TOP">Top</SelectItem>
                              <SelectItem value="LAY_FLAT">Lay Flat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Lock toggle */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-600">Lock Position</span>
                        <Switch checked={selectedPosition.is_locked} onCheckedChange={(v) => updatePosition(selectedPosition.id, { is_locked: v })} />
                      </div>
                    </div>

                    {/* Performance metrics */}
                    {selectedPerformance && (
                      <div className="space-y-2 pt-2 border-t">
                        <Label className="text-[11px] font-medium text-slate-600">Performance</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Weekly Sales", value: `$${selectedPerformance.dollar_sales_weekly.toFixed(2)}`, icon: DollarSign },
                            { label: "Weekly Profit", value: `$${selectedPerformance.profit_weekly.toFixed(2)}`, icon: TrendingUp },
                            { label: "Service Level", value: `${selectedPerformance.service_level_pct.toFixed(1)}%`, icon: Target },
                            { label: "Days of Supply", value: selectedPerformance.days_of_supply.toFixed(1), icon: Package },
                          ].map(m => (
                            <div key={m.label} className="bg-slate-50 rounded p-2">
                              <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                <m.icon className="h-3 w-3" />
                                {m.label}
                              </div>
                              <p className="text-xs font-bold mt-0.5">{m.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-50 rounded p-2">
                          <div className="flex items-center gap-1 text-[9px] text-slate-500">
                            <BarChart3 className="h-3 w-3" />
                            Space Elasticity (β)
                          </div>
                          <p className="text-xs font-bold mt-0.5">{selectedPerformance.space_elasticity_beta.toFixed(2)}</p>
                          <p className="text-[9px] text-slate-400">
                            {selectedPerformance.space_elasticity_beta > 0.15 ? "High responsiveness to space" : "Low responsiveness to space"}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="rounded-full bg-slate-100 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <LayoutGrid className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500">Click a product on the planogram to view and edit its properties</p>
                  </div>
                )}
              </div>
            ) : (
              /* Analytics Panel */
              <div className="p-3 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">Space Analytics</h3>

                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Utilization", value: `${metrics.utilization.toFixed(0)}%`, color: metrics.utilization > 85 ? "text-green-600" : metrics.utilization > 70 ? "text-yellow-600" : "text-red-600" },
                    { label: "SKUs", value: metrics.totalProducts.toString(), color: "text-slate-800" },
                    { label: "Weekly Rev", value: `$${metrics.totalRevenue.toFixed(0)}`, color: "text-slate-800" },
                    { label: "Rev/Lin.Ft", value: `$${metrics.revenuePerFoot.toFixed(0)}`, color: "text-slate-800" },
                    { label: "Total Profit", value: `$${metrics.totalProfit.toFixed(0)}`, color: "text-green-600" },
                    { label: "Avg SL%", value: `${metrics.avgServiceLevel.toFixed(1)}%`, color: metrics.avgServiceLevel > 95 ? "text-green-600" : "text-yellow-600" },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-slate-50 rounded p-2">
                      <p className="text-[9px] text-slate-500">{kpi.label}</p>
                      <p className={`text-sm font-bold ${kpi.color}`}>{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Utilization bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Space Utilization</span>
                    <span className="font-medium">{metrics.utilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.utilization} className="h-2" />
                  <p className="text-[9px] text-slate-400">Target: 85–95% for optimal balance</p>
                </div>

                {/* Category breakdown */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-medium text-slate-600">By Category</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] h-7 px-1">Category</TableHead>
                        <TableHead className="text-[10px] h-7 px-1 text-right">Facings</TableHead>
                        <TableHead className="text-[10px] h-7 px-1 text-right">Share</TableHead>
                        <TableHead className="text-[10px] h-7 px-1 text-right">Rev</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryAnalytics.map(cat => (
                        <TableRow key={cat.category}>
                          <TableCell className="text-[10px] py-1 px-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="truncate">{cat.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] py-1 px-1 text-right font-medium">{cat.facings}</TableCell>
                          <TableCell className="text-[10px] py-1 px-1 text-right">{cat.spaceShare.toFixed(0)}%</TableCell>
                          <TableCell className="text-[10px] py-1 px-1 text-right">${cat.revenue.toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Space-to-Sales efficiency */}
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-[11px] font-medium text-slate-600">Space vs Sales Efficiency</Label>
                  {categoryAnalytics.map(cat => {
                    const revenueShare = metrics.totalRevenue > 0 ? (cat.revenue / metrics.totalRevenue) * 100 : 0;
                    const diff = revenueShare - cat.spaceShare;
                    return (
                      <div key={cat.category} className="flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="flex-1 truncate">{cat.category}</span>
                        <span className={`font-medium ${diff > 2 ? "text-green-600" : diff < -2 ? "text-red-600" : "text-slate-600"}`}>
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                        </span>
                        {diff > 2 ? <ArrowUpRight className="h-3 w-3 text-green-500" /> :
                         diff < -2 ? <ArrowDownRight className="h-3 w-3 text-red-500" /> :
                         <Minus className="h-3 w-3 text-slate-400" />}
                      </div>
                    );
                  })}
                  <p className="text-[9px] text-slate-400 pt-1">
                    Positive = revenue share exceeds space share (efficient). Negative = over-spaced relative to sales.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SUMMARY BAR ─── */}
        <div className="h-8 bg-white border-t flex items-center px-4 text-[10px] text-slate-500 gap-4 shrink-0">
          <span><strong className="text-slate-700">{metrics.totalProducts}</strong> SKUs</span>
          <span className="text-slate-300">|</span>
          <span><strong className="text-slate-700">{metrics.totalFacings}</strong> facings</span>
          <span className="text-slate-300">|</span>
          <span><strong className={metrics.utilization > 85 ? "text-green-600" : "text-yellow-600"}>{metrics.utilization.toFixed(1)}%</strong> utilized</span>
          <span className="text-slate-300">|</span>
          <span>Rev: <strong className="text-slate-700">${metrics.totalRevenue.toFixed(0)}</strong>/wk</span>
          <span className="text-slate-300">|</span>
          <span>Profit: <strong className="text-green-600">${metrics.totalProfit.toFixed(0)}</strong>/wk</span>
          <span className="text-slate-300">|</span>
          <span>Service: <strong className="text-slate-700">{metrics.avgServiceLevel.toFixed(1)}%</strong></span>
          <div className="flex-1" />
          <span className="text-slate-400">1200mm × 2000mm · {fixtures.length} fixtures</span>
        </div>
        </>
        ) : (
        <>
          {/* ─── FLOOR PLAN EDITOR ─── */}
          <div className="flex-1 overflow-auto bg-slate-50 p-8 flex items-start justify-center">
            <div className="relative bg-white border-2 border-slate-300 rounded-lg shadow-sm" style={{ width: 600, height: 520 }}>
              {/* Department zones */}
              {FLOOR_DEPARTMENTS.map(dept => (
                <div
                  key={dept.name}
                  className="absolute rounded border cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    left: `${dept.x}%`,
                    top: `${dept.y}%`,
                    width: `${dept.w}%`,
                    height: `${dept.h}%`,
                    backgroundColor: dept.color + "30",
                    borderColor: dept.color + "60",
                  }}
                >
                  <div className="p-2">
                    <p className="text-xs font-bold" style={{ color: dept.color }}>{dept.name}</p>
                    <p className="text-[10px] text-slate-500">{dept.area} m²</p>
                  </div>
                  {/* Gondolas inside department */}
                  {dept.gondolas.map(g => (
                    <div
                      key={g.id}
                      className="absolute bg-white border border-slate-300 rounded-sm flex items-center justify-center cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
                      style={{
                        left: `${((g.x - dept.x) / dept.w) * 100}%`,
                        top: `${((g.y - dept.y) / dept.h) * 100}%`,
                        width: `${(g.w / dept.w) * 100}%`,
                        height: `${(g.h / dept.h) * 100}%`,
                      }}
                    >
                      <span className="text-[8px] text-slate-500 truncate px-0.5">{g.label}</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Entrance arrow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full flex flex-col items-center pt-2">
                <div className="w-px h-6 bg-blue-500" />
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-blue-500 rotate-180 -mt-px" />
                <span className="text-xs font-bold text-blue-600 mt-1 tracking-wider">ENTRANCE</span>
              </div>
            </div>
          </div>

          {/* Floor plan summary bar */}
          <div className="h-8 bg-white border-t flex items-center justify-end px-4 text-[10px] text-slate-400 shrink-0">
            100%
          </div>
        </>
        )}
      </div>
    </div>
  );
}
