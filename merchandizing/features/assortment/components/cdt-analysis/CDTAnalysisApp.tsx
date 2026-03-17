"use client";

import { useMemo, memo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  Treemap, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ScatterChart, Scatter,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Position,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ═══════════════════════════════════════════════════════════════
// SYNTHETIC DATA LAYER — Consistent across all analyses
// ═══════════════════════════════════════════════════════════════

const BRAND_COLORS: Record<string, string> = {
  "Coca-Cola": "#e53e3e",
  "Pepsi": "#3182ce",
  "Dr Pepper": "#805ad5",
  "Mountain Dew": "#38a169",
  "Sprite": "#48bb78",
  "Fanta": "#ed8936",
  "7UP": "#4fd1c5",
  "RC Cola": "#d69e2e",
};

const SUB_COMMODITY_COLORS: Record<string, string> = {
  Cola: "#e53e3e",
  "Lemon-Lime": "#48bb78",
  Orange: "#ed8936",
  "Specialty/Other": "#9f7aea",
};

// Chart color constants (hex values needed by recharts)
const CHART_COLORS = {
  teal: "#0d9488",
  tealLight: "#14b8a6",
  tealDark: "#0f766e",
  gold: "#b45309",
  orange: "#c2410c",
  pink: "#be185d",
  purple: "#7c3aed",
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
};

// ── Dataset schema ──
const DATA_FILES = [
  { name: "transaction_data.csv", rows: 2595732, cols: 7, desc: "Purchase transactions", pk: "basket_id + product_id", fk: "household_key, product_id" },
  { name: "product.csv", rows: 92339, cols: 6, desc: "Product master", pk: "product_id", fk: "—" },
  { name: "hh_demographic.csv", rows: 2500, cols: 8, desc: "Household demographics", pk: "household_key", fk: "—" },
  { name: "causal_data.csv", rows: 3439210, cols: 5, desc: "Promotion/display flags", pk: "product_id + store_id + week_no", fk: "product_id" },
  { name: "coupon.csv", rows: 1135, cols: 3, desc: "Coupon details", pk: "coupon_upc", fk: "product_id" },
  { name: "coupon_redempt.csv", rows: 2318, cols: 4, desc: "Coupon redemptions", pk: "household_key + coupon_upc + day", fk: "household_key, coupon_upc" },
  { name: "campaign_table.csv", rows: 30, cols: 3, desc: "Campaign definitions", pk: "campaign", fk: "—" },
  { name: "campaign_desc.csv", rows: 2500, cols: 2, desc: "HH campaign participation", pk: "household_key + campaign", fk: "household_key, campaign" },
];

const PRODUCT_HIERARCHY = {
  "Carbonated Soft Drinks": {
    Cola: {
      "Coca-Cola": ["Classic 12oz", "Classic 2L", "Zero 12oz", "Zero 2L", "Diet 12oz", "Diet 2L", "Cherry 12oz", "Vanilla 12oz"],
      "Pepsi": ["Original 12oz", "Original 2L", "Zero Sugar 12oz", "Zero Sugar 2L", "Diet 12oz", "Diet 2L", "Wild Cherry 12oz"],
      "RC Cola": ["Original 12oz", "Original 2L", "Diet 12oz"],
    },
    "Lemon-Lime": {
      "Sprite": ["Original 12oz", "Original 2L", "Zero 12oz", "Zero 2L", "Lymonade 12oz"],
      "7UP": ["Original 12oz", "Original 2L", "Zero Sugar 12oz", "Cherry 12oz"],
    },
    Orange: {
      "Fanta": ["Orange 12oz", "Orange 2L", "Grape 12oz", "Strawberry 12oz", "Pineapple 12oz"],
    },
    "Specialty/Other": {
      "Dr Pepper": ["Original 12oz", "Original 2L", "Zero 12oz", "Zero 2L", "Cherry 12oz", "Cream Soda 12oz"],
      "Mountain Dew": ["Original 12oz", "Original 2L", "Zero 12oz", "Code Red 12oz", "Baja Blast 12oz", "Voltage 12oz"],
    },
  },
};

// Brand-level metrics (consistent across analyses)
const BRAND_DATA = [
  { brand: "Coca-Cola", subCommodity: "Cola", revenue: 4850000, units: 3820000, households: 1875, penetration: 75.0, avgPrice: 1.27, repeatRate: 82.3, loyalty: 0.71, skuCount: 8, promoFreq: 0.28 },
  { brand: "Pepsi", subCommodity: "Cola", revenue: 3620000, units: 2940000, households: 1520, penetration: 60.8, avgPrice: 1.23, repeatRate: 76.1, loyalty: 0.64, skuCount: 7, promoFreq: 0.32 },
  { brand: "Dr Pepper", subCommodity: "Specialty/Other", revenue: 1980000, units: 1480000, households: 1180, penetration: 47.2, avgPrice: 1.34, repeatRate: 68.4, loyalty: 0.58, skuCount: 6, promoFreq: 0.22 },
  { brand: "Mountain Dew", subCommodity: "Specialty/Other", revenue: 1750000, units: 1350000, households: 1050, penetration: 42.0, avgPrice: 1.30, repeatRate: 64.2, loyalty: 0.52, skuCount: 6, promoFreq: 0.25 },
  { brand: "Sprite", subCommodity: "Lemon-Lime", revenue: 1420000, units: 1180000, households: 980, penetration: 39.2, avgPrice: 1.20, repeatRate: 61.8, loyalty: 0.55, skuCount: 5, promoFreq: 0.20 },
  { brand: "Fanta", subCommodity: "Orange", revenue: 980000, units: 780000, households: 720, penetration: 28.8, avgPrice: 1.26, repeatRate: 52.3, loyalty: 0.48, skuCount: 5, promoFreq: 0.18 },
  { brand: "7UP", subCommodity: "Lemon-Lime", revenue: 850000, units: 710000, households: 650, penetration: 26.0, avgPrice: 1.20, repeatRate: 48.7, loyalty: 0.44, skuCount: 4, promoFreq: 0.15 },
  { brand: "RC Cola", subCommodity: "Cola", revenue: 320000, units: 280000, households: 380, penetration: 15.2, avgPrice: 1.14, repeatRate: 35.2, loyalty: 0.38, skuCount: 3, promoFreq: 0.10 },
];

const totalRevenue = BRAND_DATA.reduce((s, b) => s + b.revenue, 0);

// CDT Readiness Scorecard for top commodities
const CDT_SCORECARD = [
  { commodity: "CARBONATED SOFT DRINKS", transactions: 482310, revenue: 15770000, skus: 44, brands: 8, subComm: 4, penetration: 82.4, repeatRate: 74.6, hhi: 0.148, priceRange: 3.2, score: 92.4 },
  { commodity: "SALTY SNACKS", transactions: 398200, revenue: 12340000, skus: 68, brands: 12, subComm: 6, penetration: 76.1, repeatRate: 68.3, hhi: 0.112, priceRange: 4.1, score: 89.1 },
  { commodity: "YOGURT", transactions: 356800, revenue: 8920000, skus: 82, brands: 9, subComm: 5, penetration: 71.3, repeatRate: 72.1, hhi: 0.165, priceRange: 3.8, score: 85.7 },
  { commodity: "CEREAL", transactions: 312400, revenue: 10450000, skus: 56, brands: 10, subComm: 4, penetration: 68.9, repeatRate: 65.8, hhi: 0.134, priceRange: 2.9, score: 83.2 },
  { commodity: "FROZEN PIZZA", transactions: 278900, revenue: 7680000, skus: 38, brands: 7, subComm: 3, penetration: 62.4, repeatRate: 58.7, hhi: 0.198, priceRange: 2.4, score: 74.8 },
  { commodity: "ICE CREAM", transactions: 245600, revenue: 6890000, skus: 72, brands: 11, subComm: 5, penetration: 58.2, repeatRate: 54.3, hhi: 0.125, priceRange: 3.5, score: 78.3 },
  { commodity: "COOKIES", transactions: 234100, revenue: 5670000, skus: 45, brands: 8, subComm: 4, penetration: 55.7, repeatRate: 52.1, hhi: 0.178, priceRange: 2.8, score: 71.6 },
  { commodity: "COFFEE", transactions: 218700, revenue: 9120000, skus: 34, brands: 6, subComm: 3, penetration: 52.1, repeatRate: 78.4, hhi: 0.215, priceRange: 4.5, score: 72.9 },
  { commodity: "PASTA", transactions: 198300, revenue: 3450000, skus: 28, brands: 5, subComm: 3, penetration: 48.6, repeatRate: 62.3, hhi: 0.248, priceRange: 2.1, score: 62.4 },
  { commodity: "JUICE", transactions: 187600, revenue: 5230000, skus: 52, brands: 9, subComm: 4, penetration: 46.3, repeatRate: 56.8, hhi: 0.152, priceRange: 3.2, score: 70.5 },
];

// Switching matrix (brand-to-brand transition probabilities)
const SWITCHING_MATRIX = [
  { from: "Coca-Cola", to: { "Coca-Cola": 0.71, Pepsi: 0.14, "RC Cola": 0.04, Sprite: 0.02, "7UP": 0.01, Fanta: 0.01, "Dr Pepper": 0.04, "Mountain Dew": 0.03 } },
  { from: "Pepsi", to: { "Coca-Cola": 0.16, Pepsi: 0.64, "RC Cola": 0.05, Sprite: 0.02, "7UP": 0.01, Fanta: 0.01, "Dr Pepper": 0.06, "Mountain Dew": 0.05 } },
  { from: "RC Cola", to: { "Coca-Cola": 0.22, Pepsi: 0.18, "RC Cola": 0.38, Sprite: 0.03, "7UP": 0.02, Fanta: 0.02, "Dr Pepper": 0.08, "Mountain Dew": 0.07 } },
  { from: "Sprite", to: { "Coca-Cola": 0.03, Pepsi: 0.02, "RC Cola": 0.01, Sprite: 0.55, "7UP": 0.28, Fanta: 0.04, "Dr Pepper": 0.04, "Mountain Dew": 0.03 } },
  { from: "7UP", to: { "Coca-Cola": 0.03, Pepsi: 0.03, "RC Cola": 0.01, Sprite: 0.32, "7UP": 0.44, Fanta: 0.05, "Dr Pepper": 0.06, "Mountain Dew": 0.06 } },
  { from: "Fanta", to: { "Coca-Cola": 0.04, Pepsi: 0.03, "RC Cola": 0.01, Sprite: 0.06, "7UP": 0.05, Fanta: 0.48, "Dr Pepper": 0.16, "Mountain Dew": 0.17 } },
  { from: "Dr Pepper", to: { "Coca-Cola": 0.05, Pepsi: 0.06, "RC Cola": 0.02, Sprite: 0.03, "7UP": 0.03, Fanta: 0.08, "Dr Pepper": 0.58, "Mountain Dew": 0.15 } },
  { from: "Mountain Dew", to: { "Coca-Cola": 0.04, Pepsi: 0.06, "RC Cola": 0.02, Sprite: 0.03, "7UP": 0.03, Fanta: 0.09, "Dr Pepper": 0.21, "Mountain Dew": 0.52 } },
];

const brands = ["Coca-Cola", "Pepsi", "RC Cola", "Sprite", "7UP", "Fanta", "Dr Pepper", "Mountain Dew"];

// Yule's Q matrix (negative = substitutes, positive = complements)
const YULES_Q: Record<string, Record<string, number>> = {
  "Coca-Cola": { "Coca-Cola": 1.00, Pepsi: -0.42, "RC Cola": -0.55, Sprite: 0.08, "7UP": 0.05, Fanta: 0.03, "Dr Pepper": 0.12, "Mountain Dew": 0.06 },
  Pepsi: { "Coca-Cola": -0.42, Pepsi: 1.00, "RC Cola": -0.48, Sprite: 0.06, "7UP": 0.04, Fanta: 0.02, "Dr Pepper": 0.15, "Mountain Dew": 0.11 },
  "RC Cola": { "Coca-Cola": -0.55, Pepsi: -0.48, "RC Cola": 1.00, Sprite: 0.02, "7UP": 0.01, Fanta: 0.01, "Dr Pepper": 0.04, "Mountain Dew": 0.03 },
  Sprite: { "Coca-Cola": 0.08, Pepsi: 0.06, "RC Cola": 0.02, Sprite: 1.00, "7UP": -0.52, Fanta: 0.09, "Dr Pepper": 0.05, "Mountain Dew": 0.04 },
  "7UP": { "Coca-Cola": 0.05, Pepsi: 0.04, "RC Cola": 0.01, Sprite: -0.52, "7UP": 1.00, Fanta: 0.07, "Dr Pepper": 0.06, "Mountain Dew": 0.05 },
  Fanta: { "Coca-Cola": 0.03, Pepsi: 0.02, "RC Cola": 0.01, Sprite: 0.09, "7UP": 0.07, Fanta: 1.00, "Dr Pepper": -0.28, "Mountain Dew": -0.31 },
  "Dr Pepper": { "Coca-Cola": 0.12, Pepsi: 0.15, "RC Cola": 0.04, Sprite: 0.05, "7UP": 0.06, Fanta: -0.28, "Dr Pepper": 1.00, "Mountain Dew": -0.38 },
  "Mountain Dew": { "Coca-Cola": 0.06, Pepsi: 0.11, "RC Cola": 0.03, Sprite: 0.04, "7UP": 0.05, Fanta: -0.31, "Dr Pepper": -0.38, "Mountain Dew": 1.00 },
};

// Weekly revenue trends (52 weeks)
const WEEKLY_TRENDS = Array.from({ length: 52 }, (_, i) => {
  const seasonality = 1 + 0.25 * Math.sin((i - 10) * Math.PI / 26);
  const noise = () => 0.9 + Math.random() * 0.2;
  return {
    week: i + 1,
    "Coca-Cola": Math.round(93000 * seasonality * noise()),
    Pepsi: Math.round(69500 * seasonality * noise()),
    "Dr Pepper": Math.round(38000 * seasonality * noise()),
    "Mountain Dew": Math.round(33500 * seasonality * noise()),
    Sprite: Math.round(27300 * seasonality * noise()),
  };
});

// Basket size distribution
const BASKET_DIST = [
  { size: "1-3", pct: 12.4 }, { size: "4-6", pct: 22.8 }, { size: "7-10", pct: 28.3 },
  { size: "11-15", pct: 19.6 }, { size: "16-20", pct: 10.2 }, { size: "21-30", pct: 4.8 }, { size: "31+", pct: 1.9 },
];

// Purchase frequency distribution
const FREQ_DIST = [
  { freq: "1x", pct: 18.2 }, { freq: "2-3x", pct: 24.6 }, { freq: "4-6x", pct: 22.1 },
  { freq: "7-12x", pct: 18.8 }, { freq: "13-24x", pct: 4.9 }, { freq: "25+", pct: 4.9 },
];

// CHAID splits
const CHAID_SPLITS = {
  level1: { attribute: "Sub-Commodity", chiSq: 4823.6, pValue: "<0.001", df: 3 },
  level2: { attribute: "Brand", chiSq: 2156.2, pValue: "<0.001", df: 7 },
  level3: { attribute: "Pack Size", chiSq: 487.3, pValue: "<0.001", df: 2 },
};

// Feature importances (CART)
const FEATURE_IMPORTANCE = [
  { feature: "Sub-Commodity", importance: 0.38, method: "CART" },
  { feature: "Brand", importance: 0.31, method: "CART" },
  { feature: "Pack Size", importance: 0.12, method: "CART" },
  { feature: "Price Tier", importance: 0.09, method: "CART" },
  { feature: "On Promo", importance: 0.06, method: "CART" },
  { feature: "HH Income", importance: 0.04, method: "CART" },
];

// Switching types breakdown
const SWITCHING_TYPES = [
  { type: "Same Brand, Diff Variant", value: 34.2, color: CHART_COLORS.teal },
  { type: "Diff Brand, Same Sub-Comm", value: 28.7, color: CHART_COLORS.gold },
  { type: "Diff Sub-Commodity", value: 18.4, color: CHART_COLORS.pink },
  { type: "Same Exact Product", value: 18.7, color: CHART_COLORS.green },
];

// CDT node summary for final tree
const CDT_NODES = [
  { id: "cola", subComm: "Cola", revShare: 55.7, penetration: 82.4, substitutionRate: 78.3, skus: 18, status: "well-represented", brands: "Coca-Cola, Pepsi, RC Cola" },
  { id: "lemon-lime", subComm: "Lemon-Lime", revShare: 14.4, penetration: 48.2, substitutionRate: 72.1, skus: 9, status: "under-spaced", brands: "Sprite, 7UP" },
  { id: "orange", subComm: "Orange", revShare: 6.2, penetration: 28.8, substitutionRate: 48.0, skus: 5, status: "over-spaced", brands: "Fanta" },
  { id: "specialty", subComm: "Specialty/Other", revShare: 23.7, penetration: 58.4, substitutionRate: 65.8, skus: 12, status: "under-spaced", brands: "Dr Pepper, Mountain Dew" },
];

// Assortment recommendations
const ASSORTMENT_RECS = [
  { sku: "Coca-Cola Classic 12oz", brand: "Coca-Cola", node: "Cola", type: "Essential", reason: "Highest penetration SKU (68.2%), category anchor" },
  { sku: "Pepsi Original 12oz", brand: "Pepsi", node: "Cola", type: "Essential", reason: "#2 penetration (52.1%), primary Coca-Cola substitute" },
  { sku: "RC Cola Diet 12oz", brand: "RC Cola", node: "Cola", type: "Rationalize", reason: "Only 4.8% penetration, high overlap with Diet Coke/Diet Pepsi" },
  { sku: "Sprite Original 12oz", brand: "Sprite", node: "Lemon-Lime", type: "Essential", reason: "Lemon-Lime anchor (34.1% penetration), low cross-sub-comm switching" },
  { sku: "7UP Cherry 12oz", brand: "7UP", node: "Lemon-Lime", type: "Rationalize", reason: "2.1% penetration, niche variant in crowded node" },
  { sku: "Mountain Dew Baja Blast 12oz", brand: "Mountain Dew", node: "Specialty/Other", type: "Gap Fill", reason: "High search interest, specialty node under-spaced vs. demand" },
  { sku: "Dr Pepper Original 12oz", brand: "Dr Pepper", node: "Specialty/Other", type: "Essential", reason: "Specialty anchor, unique flavor profile = low substitutability" },
  { sku: "Fanta Pineapple 12oz", brand: "Fanta", node: "Orange", type: "Rationalize", reason: "1.8% penetration, over-spaced Orange node" },
];

// Association rules
const ASSOC_RULES = [
  { antecedent: "Coca-Cola", consequent: "Sprite", support: 0.082, confidence: 0.21, lift: 1.42, interpretation: "Complement" },
  { antecedent: "Pepsi", consequent: "Mountain Dew", support: 0.068, confidence: 0.18, lift: 1.38, interpretation: "Complement" },
  { antecedent: "Coca-Cola", consequent: "Pepsi", support: 0.031, confidence: 0.08, lift: 0.42, interpretation: "Substitute" },
  { antecedent: "Sprite", consequent: "7UP", support: 0.018, confidence: 0.12, lift: 0.38, interpretation: "Substitute" },
  { antecedent: "Dr Pepper", consequent: "Mountain Dew", support: 0.024, confidence: 0.11, lift: 0.45, interpretation: "Substitute" },
  { antecedent: "Dr Pepper", consequent: "Coca-Cola", support: 0.071, confidence: 0.19, lift: 1.31, interpretation: "Complement" },
  { antecedent: "Fanta", consequent: "Sprite", support: 0.042, confidence: 0.22, lift: 1.48, interpretation: "Complement" },
  { antecedent: "Coca-Cola", consequent: "Fanta", support: 0.038, confidence: 0.10, lift: 1.25, interpretation: "Complement" },
];


// ═══════════════════════════════════════════════════════════════
// SHARED CHART STYLES (inline — required by recharts)
// ═══════════════════════════════════════════════════════════════

const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13 };
const axisTick = { fill: "#475569", fontSize: 12 };
const axisTickSm = { fill: "#475569", fontSize: 11 };
const gridStroke = "#e2e8f0";


// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

function AnalysisCard({ title, children, className = "", insight, methodology }: { title?: string; children: React.ReactNode; className?: string; insight?: string; methodology?: string }) {
  return (
    <Card className={`shadow-sm border-slate-200 ${className}`}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-700">{title}</CardTitle>
            {methodology && <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">{methodology}</Badge>}
          </div>
          {insight && <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-1">↳ {insight}</p>}
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-4"}>
        {children}
        {!title && insight && <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-3">↳ {insight}</p>}
      </CardContent>
    </Card>
  );
}

function Metric({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color: color || CHART_COLORS.teal }}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "well-represented": "bg-green-100 text-green-800 border-green-300",
    "under-spaced": "bg-amber-100 text-amber-800 border-amber-300",
    "over-spaced": "bg-red-100 text-red-800 border-red-300",
    Essential: "bg-green-100 text-green-800 border-green-300",
    Rationalize: "bg-red-100 text-red-800 border-red-300",
    "Gap Fill": "bg-blue-100 text-blue-800 border-blue-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}


// ═══════════════════════════════════════════════════════════════
// CDT TREE VISUALIZATION (React Flow)
// ═══════════════════════════════════════════════════════════════

const CDTNode = memo(({ data }: { data: any }) => {
  const levelStyles: Record<string, string> = {
    root: "bg-teal-50 border-teal-300 text-teal-800",
    subcommodity: "bg-white border-slate-200",
    brand: "bg-amber-50 border-amber-200",
    packsize: "bg-violet-50 border-violet-200",
  };
  const style = levelStyles[data.level] || levelStyles.root;

  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-sm ${style} min-w-[120px] text-center`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-2 !h-2" />
      <div className="font-semibold text-sm">{data.label}</div>
      {data.rev && <div className="text-xs text-slate-500 mt-0.5">{data.rev} rev</div>}
      {data.badge && (
        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium ${data.badgeClass}`}>
          {data.badge}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-2 !h-2" />
    </div>
  );
});
CDTNode.displayName = "CDTNode";

const initialNodes: Node[] = [
  // Root
  { id: "root", type: "cdtNode", position: { x: 450, y: 0 }, data: { label: "Carbonated Soft Drinks", level: "root", badge: "CDT Root", badgeClass: "bg-teal-100 text-teal-700" } },
  // Level 1 - Sub-Commodity
  { id: "cola", type: "cdtNode", position: { x: 50, y: 120 }, data: { label: "Cola", rev: "55.7%", level: "subcommodity" } },
  { id: "lemon-lime", type: "cdtNode", position: { x: 300, y: 120 }, data: { label: "Lemon-Lime", rev: "14.4%", level: "subcommodity" } },
  { id: "orange", type: "cdtNode", position: { x: 550, y: 120 }, data: { label: "Orange", rev: "6.2%", level: "subcommodity" } },
  { id: "specialty", type: "cdtNode", position: { x: 780, y: 120 }, data: { label: "Specialty/Other", rev: "23.7%", level: "subcommodity" } },
  // Level 2 - Brand
  { id: "coca-cola", type: "cdtNode", position: { x: -30, y: 250 }, data: { label: "Coca-Cola", rev: "30.8%", level: "brand" } },
  { id: "pepsi", type: "cdtNode", position: { x: 120, y: 250 }, data: { label: "Pepsi", rev: "23.0%", level: "brand" } },
  { id: "rc-cola", type: "cdtNode", position: { x: 120, y: 340 }, data: { label: "RC Cola", rev: "2.0%", level: "brand" } },
  { id: "sprite", type: "cdtNode", position: { x: 280, y: 250 }, data: { label: "Sprite", rev: "9.0%", level: "brand" } },
  { id: "7up", type: "cdtNode", position: { x: 400, y: 250 }, data: { label: "7UP", rev: "5.4%", level: "brand" } },
  { id: "fanta", type: "cdtNode", position: { x: 530, y: 250 }, data: { label: "Fanta", rev: "6.2%", level: "brand" } },
  { id: "dr-pepper", type: "cdtNode", position: { x: 720, y: 250 }, data: { label: "Dr Pepper", rev: "12.6%", level: "brand" } },
  { id: "mtn-dew", type: "cdtNode", position: { x: 880, y: 250 }, data: { label: "Mountain Dew", rev: "11.1%", level: "brand" } },
  // Level 3 - Pack Size (under Coca-Cola only)
  { id: "12oz", type: "cdtNode", position: { x: -60, y: 380 }, data: { label: "12oz Can", level: "packsize" } },
  { id: "2l", type: "cdtNode", position: { x: 50, y: 380 }, data: { label: "2L Bottle", level: "packsize" } },
];

const edgeDefaults = { type: "smoothstep" as const, animated: true, style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "6 3" } };

const initialEdges: Edge[] = [
  { id: "e-root-cola", source: "root", target: "cola", ...edgeDefaults },
  { id: "e-root-ll", source: "root", target: "lemon-lime", ...edgeDefaults },
  { id: "e-root-orange", source: "root", target: "orange", ...edgeDefaults },
  { id: "e-root-specialty", source: "root", target: "specialty", ...edgeDefaults },
  { id: "e-cola-cc", source: "cola", target: "coca-cola", ...edgeDefaults },
  { id: "e-cola-pepsi", source: "cola", target: "pepsi", ...edgeDefaults },
  { id: "e-cola-rc", source: "cola", target: "rc-cola", ...edgeDefaults },
  { id: "e-ll-sprite", source: "lemon-lime", target: "sprite", ...edgeDefaults },
  { id: "e-ll-7up", source: "lemon-lime", target: "7up", ...edgeDefaults },
  { id: "e-orange-fanta", source: "orange", target: "fanta", ...edgeDefaults },
  { id: "e-spec-dp", source: "specialty", target: "dr-pepper", ...edgeDefaults },
  { id: "e-spec-md", source: "specialty", target: "mtn-dew", ...edgeDefaults },
  { id: "e-cc-12oz", source: "coca-cola", target: "12oz", ...edgeDefaults },
  { id: "e-cc-2l", source: "coca-cola", target: "2l", ...edgeDefaults },
];

const cdtNodeTypes = { cdtNode: CDTNode };

function CDTTreeFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={cdtNodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
    >
      <Background color="#e2e8f0" gap={20} />
    </ReactFlow>
  );
}

function CDTTreeViz() {
  return (
    <>
      <div style={{ width: "100%", height: 520 }} className="rounded-lg border bg-slate-50/50">
        <ReactFlowProvider>
          <CDTTreeFlow />
        </ReactFlowProvider>
      </div>
      <div className="flex gap-6 mt-3 justify-center">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-teal-200 border border-teal-400" /><span className="text-sm text-slate-500">L1: Sub-Commodity</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" /><span className="text-sm text-slate-500">L2: Brand</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-violet-200 border border-violet-400" /><span className="text-sm text-slate-500">L3: Pack Size</span></div>
      </div>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function CDTAnalysisApp() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Consumer Decision Tree Analysis</h1>
            <p className="text-sm text-slate-500 mt-1">Carbonated Soft Drinks · Complete Journey · 2,500 Households · 52 Weeks</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-100 text-teal-800 border-teal-300">Layer 1: Category Intelligence</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">94.2% Confidence</Badge>
            <Badge variant="outline" className="text-slate-500">44 SKUs · 8 Brands · 2.5K HHs</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phase1">Data Exploration</TabsTrigger>
          <TabsTrigger value="phase2">Category Profile</TabsTrigger>
          <TabsTrigger value="phase3">CDT Build</TabsTrigger>
          <TabsTrigger value="phase4">Synthesis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewSection /></TabsContent>
        <TabsContent value="phase1"><Phase1Section /></TabsContent>
        <TabsContent value="phase2"><Phase2Section /></TabsContent>
        <TabsContent value="phase3"><Phase3Section /></TabsContent>
        <TabsContent value="phase4"><Phase4Section /></TabsContent>
      </Tabs>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════

function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Executive Summary" subtitle="Consolidated findings from the Consumer Decision Tree analysis of Carbonated Soft Drinks" />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Category Revenue", value: "$15.8M", color: CHART_COLORS.teal },
          { label: "Households", value: "2,500", color: CHART_COLORS.blue },
          { label: "Brands Analyzed", value: "8", color: CHART_COLORS.purple },
          { label: "SKUs in Category", value: "44", color: CHART_COLORS.orange },
          { label: "CDT Confidence", value: "94.2%", color: CHART_COLORS.green },
        ].map((m, i) => (
          <Card key={i} className="shadow-sm"><CardContent className="pt-4">
            <Metric {...m} />
          </CardContent></Card>
        ))}
      </div>

      {/* CDT Summary Tree */}
      <AnalysisCard title="The Consumer Decision Tree — Carbonated Soft Drinks"
        insight="Multi-method consensus (Switching Analysis + Yule's Q Dendrogram + CHAID + CART) confirms shoppers first segment by flavor type (Sub-Commodity), then select among competing brands within that segment, and finally choose pack size/variant.">
        <div className="py-5">
          <CDTTreeViz />
        </div>
      </AnalysisCard>

      {/* Method agreement */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Method Reconciliation">
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Method", "Level 1", "Level 2", "Level 3"].map(h => (
                    <TableHead key={h} className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { m: "Switching Matrix", l1: "Sub-Commodity", l2: "Brand", l3: "Pack Size" },
                  { m: "Yule's Q Dendrogram", l1: "Sub-Commodity", l2: "Brand", l3: "Variant" },
                  { m: "CHAID (\u03C7\u00B2 = 4824)", l1: "Sub-Commodity", l2: "Brand", l3: "Pack Size" },
                  { m: "CART Importance", l1: "Sub-Commodity (0.38)", l2: "Brand (0.31)", l3: "Pack Size (0.12)" },
                ].map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-slate-700">{r.m}</TableCell>
                    <TableCell className="text-teal-700 font-semibold">{r.l1}</TableCell>
                    <TableCell className="text-amber-600 font-semibold">{r.l2}</TableCell>
                    <TableCell className="text-violet-600 font-semibold">{r.l3}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AnalysisCard>

        <AnalysisCard title="Switching Type Breakdown" methodology="Sequential Switching Analysis">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={SWITCHING_TYPES} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {SWITCHING_TYPES.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PHASE 1 — DATA EXPLORATION
// ═══════════════════════════════════════════════════════════════

function Phase1Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Data Inventory & Exploration"
        subtitle="Understanding the Complete Journey dataset — schema, hierarchy depth, transaction patterns, and data quality. 30-40% of CDT project time is invested here." />

      {/* 1.1 Data Inventory */}
      <AnalysisCard title="1.1 — Data Inventory & Schema Discovery" methodology="8 CSV files · Entity-Relationship Mapping">
        <div className="overflow-x-auto rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["File", "Rows", "Columns", "Description", "Primary Key", "Foreign Keys"].map(h => (
                  <TableHead key={h} className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {DATA_FILES.map((f, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-teal-600 font-mono text-sm">{f.name}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{f.rows.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{f.cols}</TableCell>
                  <TableCell className="text-slate-600">{f.desc}</TableCell>
                  <TableCell className="font-mono text-sm text-amber-600">{f.pk}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-500">{f.fk}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* ER Diagram */}
      <AnalysisCard title="Entity-Relationship Diagram"
        insight="Household-level linkage exists through household_key, enabling co-purchase similarity analysis. Product hierarchy has 5 levels (Department → Commodity → Sub-Commodity → Brand → Product ID) — sufficient depth for CDT.">
        <div className="mt-4">
          <ERDiagram />
        </div>
      </AnalysisCard>

      {/* 1.2 Product Hierarchy */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="1.2 — Product Hierarchy Levels" methodology="5-Level Retailer Hierarchy"
          insight="44 unique SKUs across 8 brands and 4 sub-commodities. The hierarchy is retailer-defined — CDT will test if it matches the shopper's mental model.">
          <div className="mt-2">
            {[
              { level: "Department", count: 1, example: "BEVERAGES", color: CHART_COLORS.teal },
              { level: "Commodity", count: 1, example: "CARBONATED SOFT DRINKS", color: CHART_COLORS.tealLight },
              { level: "Sub-Commodity", count: 4, example: "Cola, Lemon-Lime, Orange, Specialty", color: CHART_COLORS.gold },
              { level: "Brand", count: 8, example: "Coca-Cola, Pepsi, Dr Pepper, ...", color: CHART_COLORS.orange },
              { level: "Product ID (SKU)", count: 44, example: "Coca-Cola Classic 12oz, ...", color: CHART_COLORS.purple },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0" style={{ marginLeft: i * 16 }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: l.color }}>
                    {l.level} <span className="text-slate-500 font-normal">({l.count})</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">{l.example}</div>
                </div>
              </div>
            ))}
          </div>
        </AnalysisCard>

        <AnalysisCard title="Hierarchy: Brands × Sub-Commodities" methodology="Cross-Tab Analysis">
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">Brand</TableHead>
                  {Object.keys(SUB_COMMODITY_COLORS).map(sc => (
                    <TableHead key={sc} className="text-center text-xs font-medium uppercase tracking-wider" style={{ color: SUB_COMMODITY_COLORS[sc] }}>{sc}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((b) => (
                  <TableRow key={b}>
                    <TableCell className="font-semibold text-sm" style={{ color: BRAND_COLORS[b] }}>{b}</TableCell>
                    {Object.keys(SUB_COMMODITY_COLORS).map(sc => {
                      const has = BRAND_DATA.find(d => d.brand === b)?.subCommodity === sc;
                      return (
                        <TableCell key={sc} className="text-center text-sm">
                          {has ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-green-600">&#10003;</span>
                          ) : (
                            <span className="text-slate-500/40">·</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AnalysisCard>
      </div>

      {/* 1.3 Transaction patterns */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="1.3 — Basket Size Distribution" methodology="482K Transactions">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BASKET_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="size" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pct" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="% of Baskets" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        <AnalysisCard title="Purchase Frequency (Category Trips/Year)" methodology="Household Behavior">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FREQ_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="freq" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pct" fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} name="% of Households" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Median: 5.2 trips/year · Mean: 7.8 trips/year · Heavy buyers (25+) = 4.9% of HHs but 22.1% of volume
          </p>
        </AnalysisCard>
      </div>

      <AnalysisCard title="Weekly Revenue Heatmap — Seasonality Check"
        insight="Strong summer seasonality (weeks 18-34) with peak in weeks 24-28. This is expected for carbonated beverages — CDT structure may differ between peak and off-peak seasons.">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={WEEKLY_TRENDS}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="week" tick={axisTick} label={{ value: "Week", position: "bottom", fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
            <YAxis tick={axisTick} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${(v / 1000).toFixed(1)}K`, ""]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {["Coca-Cola", "Pepsi", "Dr Pepper", "Mountain Dew", "Sprite"].map(b => (
              <Line key={b} type="monotone" dataKey={b} stroke={BRAND_COLORS[b]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </AnalysisCard>
    </div>
  );
}


const ERNode = memo(({ data }: { data: any }) => (
  <div className="w-[200px] px-5 py-4 rounded-xl border-2 shadow-md text-center bg-white" style={{ borderColor: data.color }}>
    <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
    <Handle type="target" position={Position.Left} id="left" className="!bg-slate-400 !w-2 !h-2" />
    <div className="font-mono font-bold text-base" style={{ color: data.color }}>{data.label}</div>
    <div className="text-sm text-slate-500 mt-1">{data.sub}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    <Handle type="source" position={Position.Right} id="right" className="!bg-slate-400 !w-2 !h-2" />
  </div>
));
ERNode.displayName = "ERNode";

const erNodeTypes = { erNode: ERNode };

const erInitialNodes: Node[] = [
  { id: "transaction", type: "erNode", position: { x: 380, y: 0 }, data: { label: "transaction_data", sub: "2.6M rows", color: CHART_COLORS.teal } },
  { id: "product", type: "erNode", position: { x: 50, y: 180 }, data: { label: "product", sub: "92K rows", color: CHART_COLORS.gold } },
  { id: "hh_demo", type: "erNode", position: { x: 710, y: 180 }, data: { label: "hh_demographic", sub: "2.5K rows", color: CHART_COLORS.purple } },
  { id: "causal", type: "erNode", position: { x: 50, y: 360 }, data: { label: "causal_data", sub: "3.4M rows", color: CHART_COLORS.orange } },
  { id: "coupon", type: "erNode", position: { x: 380, y: 360 }, data: { label: "coupon", sub: "1.1K rows", color: CHART_COLORS.pink } },
  { id: "coupon_red", type: "erNode", position: { x: 710, y: 360 }, data: { label: "coupon_redempt", sub: "2.3K rows", color: CHART_COLORS.red } },
];

const erEdgeStyle = { type: "smoothstep" as const, animated: true, style: { stroke: "#94a3b8", strokeWidth: 1.5, strokeDasharray: "6 3" } };

const erInitialEdges: Edge[] = [
  { id: "er-1", source: "transaction", target: "product", label: "product_id", ...erEdgeStyle },
  { id: "er-2", source: "transaction", target: "hh_demo", label: "household_key", ...erEdgeStyle },
  { id: "er-3", source: "product", target: "causal", label: "product_id", ...erEdgeStyle },
  { id: "er-4", source: "transaction", target: "coupon", label: "product_id", ...erEdgeStyle },
  { id: "er-5", source: "hh_demo", target: "coupon_red", label: "household_key", ...erEdgeStyle },
  { id: "er-6", source: "coupon", target: "coupon_red", sourceHandle: "right", targetHandle: "left", label: "coupon_upc", ...erEdgeStyle },
];

function ERFlow() {
  const [nodes, , onNodesChange] = useNodesState(erInitialNodes);
  const [edges, , onEdgesChange] = useEdgesState(erInitialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={erNodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.5}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
    >
      <Background color="#e2e8f0" gap={20} />
    </ReactFlow>
  );
}

function ERDiagram() {
  return (
    <div style={{ width: "100%", height: 520 }} className="rounded-lg border bg-slate-50/50">
      <ReactFlowProvider>
        <ERFlow />
      </ReactFlowProvider>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PHASE 2 — CATEGORY SELECTION & DEEP PROFILE
// ═══════════════════════════════════════════════════════════════

function Phase2Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Category Selection & Deep Exploration"
        subtitle="Identify the best category for CDT analysis and build deep behavioral profiles — brand loyalty, switching patterns, and the critical hypothesis for the CDT structure." />

      {/* 2.1 CDT Readiness Scorecard */}
      <AnalysisCard title="2.1 — CDT Readiness Scorecard" methodology="Composite Scoring: brands×0.3 + penetration×0.3 + repeat×0.2 + (1/HHI)×0.2"
        insight="Carbonated Soft Drinks scores highest (92.4) driven by strong brand diversity (8 brands), high penetration (82.4%), and competitive market structure (low HHI = 0.148). This ensures a CDT with genuine depth.">
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["#", "Commodity", "Transactions", "Revenue", "SKUs", "Brands", "Sub-Comm", "Penetration", "Repeat%", "HHI", "Score"].map(h => (
                  <TableHead key={h} className={`text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200 ${h !== "Commodity" ? "text-right" : ""}`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {CDT_SCORECARD.map((r, i) => (
                <TableRow key={i} className={i === 0 ? "bg-teal-50/50" : ""}>
                  <TableCell className={`text-right font-mono text-sm ${i === 0 ? "text-teal-600" : "text-slate-500"}`}>{i + 1}</TableCell>
                  <TableCell className={`text-sm ${i === 0 ? "font-bold text-teal-600" : "text-slate-700"}`}>
                    {r.commodity} {i === 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded border border-teal-300 text-xs font-medium text-teal-600 bg-teal-50">★ SELECTED</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.transactions.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">${(r.revenue / 1e6).toFixed(1)}M</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.skus}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.brands}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.subComm}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.penetration}%</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.repeatRate}%</TableCell>
                  <TableCell className="text-right font-mono text-sm text-slate-700">{r.hhi.toFixed(3)}</TableCell>
                  <TableCell className={`text-right font-bold font-mono text-sm ${i === 0 ? "text-teal-600" : i < 3 ? "text-green-600" : "text-slate-500"}`}>{r.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* 2.2 Category Deep Profile */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="2.2 — Revenue Share by Brand" methodology="Market Share Analysis">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BRAND_DATA.sort((a, b) => b.revenue - a.revenue)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} tickFormatter={(v: number) => `$${(v / 1e6).toFixed(1)}M`} />
              <YAxis dataKey="brand" type="category" width={90} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${(v / 1e6).toFixed(2)}M`} />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                {BRAND_DATA.sort((a, b) => b.revenue - a.revenue).map((e, i) => (
                  <Cell key={i} fill={BRAND_COLORS[e.brand]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        <AnalysisCard title="Household Penetration by Brand" methodology="% of 2,500 HHs">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BRAND_DATA.sort((a, b) => b.penetration - a.penetration)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <YAxis dataKey="brand" type="category" width={90} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="penetration" name="Penetration %" radius={[0, 4, 4, 0]}>
                {BRAND_DATA.sort((a, b) => b.penetration - a.penetration).map((e, i) => (
                  <Cell key={i} fill={BRAND_COLORS[e.brand]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* 2.3 Loyalty & Repeat */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="2.3 — Brand Loyalty Index vs. Penetration" methodology="Scatter: Loyalty = Share of Requirements"
          insight="Coca-Cola dominates both axes — high penetration AND high loyalty. RC Cola has low penetration and loyalty, suggesting it's a 'distress purchase' brand. Mountain Dew and Dr Pepper have niche but loyal followings.">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" dataKey="penetration" name="Penetration" unit="%" tick={axisTick} />
              <YAxis type="number" dataKey="loyalty" name="Loyalty" tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: number, name: string) => [name === "Penetration" ? `${v}%` : v.toFixed(2), name]} />
              <Scatter data={BRAND_DATA} fill={CHART_COLORS.teal}>
                {BRAND_DATA.map((e, i) => (
                  <Cell key={i} fill={BRAND_COLORS[e.brand]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {BRAND_DATA.map(b => (
              <span key={b.brand} className="text-sm flex items-center gap-1" style={{ color: BRAND_COLORS[b.brand] }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: BRAND_COLORS[b.brand] }} />
                {b.brand}
              </span>
            ))}
          </div>
        </AnalysisCard>

        <AnalysisCard title="Repeat Purchase Rate by Brand" methodology="% HHs buying 2+ times in 52 weeks">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BRAND_DATA.sort((a, b) => b.repeatRate - a.repeatRate)}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="brand" tick={axisTickSm} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={axisTick} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="repeatRate" name="Repeat Rate" radius={[4, 4, 0, 0]}>
                {BRAND_DATA.sort((a, b) => b.repeatRate - a.repeatRate).map((e, i) => (
                  <Cell key={i} fill={BRAND_COLORS[e.brand]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* 2.4 Revenue by Sub-Commodity */}
      <AnalysisCard title="2.4 — Revenue by Sub-Commodity" methodology="Treemap: Area = Revenue Share"
        insight="Cola dominates with 55.7% of revenue. Specialty/Other (Dr Pepper + Mountain Dew) is the second-largest segment at 23.7% — often under-represented in planograms.">
        <ResponsiveContainer width="100%" height={220}>
          <Treemap
            data={[
              { name: "Cola", size: 8790000 },
              { name: "Specialty/Other", size: 3730000 },
              { name: "Lemon-Lime", size: 2270000 },
              { name: "Orange", size: 980000 },
            ]}
            dataKey="size"
            aspectRatio={4 / 1}
            stroke="none"
            content={({ x, y, width, height, name }: any) => {
              const colorMap: Record<string, { bg: string; text: string }> = {
                Cola: { bg: "hsl(207, 90%, 54%)", text: "#ffffff" },
                "Specialty/Other": { bg: "hsl(267, 74%, 73%)", text: "#ffffff" },
                "Lemon-Lime": { bg: "hsl(325, 100%, 71%)", text: "#ffffff" },
                Orange: { bg: "hsl(39, 100%, 50%)", text: "#ffffff" },
              };
              const c = colorMap[name] || { bg: "#94a3b8", text: "#fff" };
              return (
                <g>
                  <rect x={x} y={y} width={width} height={height} rx={8}
                    fill={c.bg} stroke="#fff" strokeWidth={3} />
                  {width > 60 && (
                    <>
                      <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill={c.text} fontSize="14" fontWeight="700">{name}</text>
                      <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill={c.text} fontSize="12" opacity={0.85}>
                        {name === "Cola" ? "55.7%" : name === "Specialty/Other" ? "23.7%" : name === "Lemon-Lime" ? "14.4%" : "6.2%"}
                      </text>
                    </>
                  )}
                </g>
              );
            }}
          />
        </ResponsiveContainer>
      </AnalysisCard>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PHASE 3 — CDT CONSTRUCTION
// ═══════════════════════════════════════════════════════════════

function Phase3Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="CDT Construction — Multi-Method Evidence"
        subtitle="Four independent methods converge on the same hierarchy: Sub-Commodity → Brand → Pack Size. Each method adds unique evidence and nuance." />

      {/* 3.1 Switching Matrix */}
      <AnalysisCard title="3.1 — Brand Switching Matrix" methodology="Sequential Basket Analysis · n = 482K transactions"
        insight="Switching is overwhelmingly within sub-commodity. Cola brands (Coca-Cola ↔ Pepsi) show 14-16% cross-switching, while cross-sub-commodity switching (e.g., Cola → Lemon-Lime) is only 1-3%. This confirms Sub-Commodity as the primary decision node.">
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">From / To</TableHead>
                {brands.map(b => (
                  <TableHead key={b} className="text-center text-xs font-medium uppercase tracking-wider" style={{ color: BRAND_COLORS[b] }}>{b}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SWITCHING_MATRIX.map((row, i) => (
                <TableRow key={row.from}>
                  <TableCell className="font-semibold text-sm" style={{ color: BRAND_COLORS[row.from] }}>{row.from}</TableCell>
                  {brands.map(b => {
                    const val = row.to[b as keyof typeof row.to];
                    const isDiag = row.from === b;
                    const isHighSwitch = !isDiag && val >= 0.10;
                    return (
                      <TableCell key={b} className="text-center font-mono text-sm" style={{
                        background: isDiag ? "rgba(20,184,166,0.08)" : isHighSwitch ? "rgba(245,158,11,0.12)" : val >= 0.05 ? "rgba(245,158,11,0.04)" : "transparent",
                        fontWeight: isDiag || isHighSwitch ? 700 : 400,
                        color: isDiag ? "#0f766e" : isHighSwitch ? "#b45309" : "#334155",
                      }}>
                        {(val * 100).toFixed(0)}%
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* 3.2 Yule's Q */}
      <AnalysisCard title="3.2 — Yule's Q Co-Purchase Matrix" methodology="Association Strength · Q ∈ [-1, +1]"
        insight="Strong negative Q values (substitutes) cluster within sub-commodity: Coca-Cola ↔ RC Cola (Q = -0.55), Sprite ↔ 7UP (Q = -0.52). Positive Q values (complements) appear across sub-commodities: Coca-Cola + Sprite (Q = +0.08). This independently validates Sub-Commodity as L1.">
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">Brand</TableHead>
                {brands.map(b => (
                  <TableHead key={b} className="text-center text-xs font-medium uppercase tracking-wider" style={{ color: BRAND_COLORS[b] }}>{b}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((b1, i) => (
                <TableRow key={b1}>
                  <TableCell className="font-semibold text-sm" style={{ color: BRAND_COLORS[b1] }}>{b1}</TableCell>
                  {brands.map(b2 => {
                    const val = YULES_Q[b1]?.[b2] ?? 0;
                    const isDiag = b1 === b2;
                    let bg = "transparent";
                    let textColor: string | undefined = undefined;
                    if (isDiag) { bg = "rgba(20,184,166,0.06)"; textColor = "#94a3b8"; }
                    else if (val < -0.3) { bg = "rgba(229,62,62,0.15)"; textColor = "#dc2626"; }
                    else if (val < -0.1) { bg = "rgba(229,62,62,0.08)"; textColor = "#ef4444"; }
                    else if (val > 0.1) { bg = "rgba(20,184,166,0.10)"; textColor = "#0f766e"; }
                    return (
                      <TableCell key={b2} className="text-center font-mono text-sm" style={{
                        background: bg,
                        color: textColor,
                        fontWeight: Math.abs(val) > 0.3 ? 700 : 400,
                      }}>
                        {isDiag ? "\u2014" : val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex gap-5 mt-3 justify-center text-sm">
          <span className="text-red-500">&#9632; Strong Substitute (Q {"<"} -0.3)</span>
          <span className="text-red-400">&#9632; Moderate Substitute</span>
          <span className="text-teal-600">&#9632; Complement (Q {">"} +0.1)</span>
        </div>
      </AnalysisCard>

      {/* 3.3 CHAID */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="3.3 — CHAID Decision Tree Splits" methodology="Chi-Squared Automatic Interaction Detection">
          <div className="mt-2 space-y-3">
            {Object.entries(CHAID_SPLITS).map(([level, data], i) => {
              const colors = [
                { bg: "bg-teal-50", border: "border-teal-200", label: "text-teal-700", stat: "text-teal-500" },
                { bg: "bg-amber-50", border: "border-amber-200", label: "text-amber-700", stat: "text-amber-500" },
                { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-700", stat: "text-purple-500" },
              ][i];
              return (
                <div key={level} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Level {i + 1} Split</div>
                      <div className={`text-base font-bold ${colors.label}`}>{data.attribute}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-slate-800">{"\u03C7\u00B2"} = {data.chiSq.toLocaleString()}</div>
                      <div className={`text-sm ${colors.stat}`}>p {data.pValue} · df = {data.df}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AnalysisCard>

        <AnalysisCard title="3.4 — CART Feature Importance" methodology="Classification & Regression Trees">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={FEATURE_IMPORTANCE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} domain={[0, 0.45]} />
              <YAxis dataKey="feature" type="category" width={110} tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => (v * 100).toFixed(1) + "%"} />
              <Bar dataKey="importance" name="Importance" radius={[0, 4, 4, 0]}>
                {FEATURE_IMPORTANCE.map((_, i) => (
                  <Cell key={i} fill={[CHART_COLORS.teal, CHART_COLORS.gold, CHART_COLORS.purple, CHART_COLORS.orange, CHART_COLORS.pink, "#94a3b8"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Sub-Commodity (38%) + Brand (31%) = <strong className="text-teal-600">69% of splitting power</strong>
          </p>
        </AnalysisCard>
      </div>

      {/* 3.5 Association Rules */}
      <AnalysisCard title="3.5 — Association Rules (Apriori)" methodology="min_support = 0.01 · min_confidence = 0.05"
        insight="Complement pairs (lift > 1) span sub-commodities: Coca-Cola + Sprite, Pepsi + Mountain Dew. Substitute pairs (lift < 1) are within sub-commodity: Coca-Cola ↔ Pepsi, Sprite ↔ 7UP. This cross-validates Yule's Q findings.">
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["Antecedent", "\u2192", "Consequent", "Support", "Confidence", "Lift", "Type"].map(h => (
                  <TableHead key={h} className={`text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200 ${h !== "Antecedent" && h !== "Consequent" ? "text-center" : ""}`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ASSOC_RULES.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold" style={{ color: BRAND_COLORS[r.antecedent] }}>{r.antecedent}</TableCell>
                  <TableCell className="text-center text-slate-400">{"\u2192"}</TableCell>
                  <TableCell className="font-semibold" style={{ color: BRAND_COLORS[r.consequent] }}>{r.consequent}</TableCell>
                  <TableCell className="text-center font-mono text-sm text-slate-700">{r.support.toFixed(3)}</TableCell>
                  <TableCell className="text-center font-mono text-sm text-slate-700">{(r.confidence * 100).toFixed(0)}%</TableCell>
                  <TableCell className={`text-center font-mono text-sm font-bold ${r.lift > 1 ? "text-green-600" : "text-red-500"}`}>
                    {r.lift.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.interpretation === "Complement" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-green-600">&#10003; {r.interpretation}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-red-500">&#9675; {r.interpretation}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// PHASE 4 — SYNTHESIS & RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════

function Phase4Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Synthesis & Assortment Recommendations"
        subtitle="Translating CDT structure into actionable shelf strategy — node health assessment, assortment recommendations, and space-to-sales alignment." />

      {/* 4.1 CDT Node Health */}
      <AnalysisCard title="4.1 — CDT Node Health Assessment"
        insight="Lemon-Lime and Specialty/Other nodes are under-spaced relative to their revenue contribution and substitution rates. Orange is over-spaced — Fanta alone cannot justify 5 SKU slots when cross-sub-commodity switching is only 48%.">
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["Sub-Commodity", "Rev Share", "Penetration", "Substitution Rate", "SKUs", "Key Brands", "Status"].map(h => (
                  <TableHead key={h} className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {CDT_NODES.map((n, i) => (
                <TableRow key={i}>
                  <TableCell className="font-bold text-sm" style={{ color: SUB_COMMODITY_COLORS[n.subComm] }}>{n.subComm}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold text-slate-700">{n.revShare}%</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{n.penetration}%</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{n.substitutionRate}%</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700">{n.skus}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{n.brands}</TableCell>
                  <TableCell>
                    {n.status === "well-represented" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-green-600">&#10003; {n.status}</span>
                    ) : n.status === "under-spaced" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-amber-600">&#9675; {n.status}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-red-500">&#9675; {n.status}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* 4.2 Space-to-Sales */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="4.2 — Space vs. Sales Index" methodology="Index = (% Space / % Revenue) × 100">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { node: "Cola", spaceIndex: 95, color: SUB_COMMODITY_COLORS.Cola },
              { node: "Lemon-Lime", spaceIndex: 78, color: SUB_COMMODITY_COLORS["Lemon-Lime"] },
              { node: "Orange", spaceIndex: 132, color: SUB_COMMODITY_COLORS.Orange },
              { node: "Specialty", spaceIndex: 72, color: SUB_COMMODITY_COLORS["Specialty/Other"] },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="node" tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 11 }} />
              <YAxis tick={axisTick} domain={[0, 150]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="spaceIndex" name="Space-to-Sales Index" radius={[4, 4, 0, 0]}>
                {[SUB_COMMODITY_COLORS.Cola, SUB_COMMODITY_COLORS["Lemon-Lime"], SUB_COMMODITY_COLORS.Orange, SUB_COMMODITY_COLORS["Specialty/Other"]].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Index = 100 means space allocation matches revenue share. {">"} 100 = over-spaced, {"<"} 100 = under-spaced
          </p>
        </AnalysisCard>

        <AnalysisCard title="Brand Radar — Multi-Metric Comparison" methodology="Normalized 0-100 Scale">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={[
              { metric: "Revenue", "Coca-Cola": 100, Pepsi: 75, "Dr Pepper": 41, "Mountain Dew": 36 },
              { metric: "Penetration", "Coca-Cola": 100, Pepsi: 81, "Dr Pepper": 63, "Mountain Dew": 56 },
              { metric: "Loyalty", "Coca-Cola": 100, Pepsi: 90, "Dr Pepper": 82, "Mountain Dew": 73 },
              { metric: "Repeat Rate", "Coca-Cola": 100, Pepsi: 92, "Dr Pepper": 83, "Mountain Dew": 78 },
              { metric: "Price Index", "Coca-Cola": 95, Pepsi: 92, "Dr Pepper": 100, "Mountain Dew": 97 },
            ]}>
              <PolarGrid stroke={gridStroke} />
              <PolarAngleAxis dataKey="metric" tick={axisTick} />
              <PolarRadiusAxis tick={{ fill: "#94a3b8", fontSize: 9 }} domain={[0, 100]} />
              {["Coca-Cola", "Pepsi", "Dr Pepper", "Mountain Dew"].map(b => (
                <Radar key={b} name={b} dataKey={b} stroke={BRAND_COLORS[b]} fill={BRAND_COLORS[b]} fillOpacity={0.1} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* 4.3 Assortment Recommendations */}
      <AnalysisCard title="4.3 — CDT-Driven Assortment Recommendations"
        insight="The CDT reveals 3 actionable opportunities: (1) Rationalize RC Cola Diet and Fanta Pineapple (combined 6.6% penetration, high overlap with stronger SKUs). (2) Add Mountain Dew Baja Blast to fill the under-spaced Specialty node. (3) Maintain all Essential anchors — removing any would lose the sub-commodity node.">
        <div className="overflow-x-auto mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["SKU", "Brand", "CDT Node", "Action", "Rationale"].map(h => (
                  <TableHead key={h} className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-200">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ASSORTMENT_RECS.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-semibold text-sm text-slate-700">{r.sku}</TableCell>
                  <TableCell className="font-semibold text-sm" style={{ color: BRAND_COLORS[r.brand] }}>{r.brand}</TableCell>
                  <TableCell className="text-sm" style={{ color: SUB_COMMODITY_COLORS[CDT_NODES.find(n => n.subComm === r.node || n.id === r.node.toLowerCase().replace("/", "-"))?.subComm as string] || undefined }}>
                    {r.node}
                  </TableCell>
                  <TableCell>
                    {r.type === "Essential" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-green-600">&#10003; {r.type}</span>
                    ) : r.type === "Rationalize" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-amber-600">&#9675; {r.type}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium text-blue-600">+ {r.type}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-[300px] leading-relaxed">{r.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* 4.4 Final CDT Summary */}
      <AnalysisCard title="4.4 — Final CDT Summary">
        <div className="grid grid-cols-3 gap-6 py-4">
          <div className="text-center p-5 bg-teal-50 rounded-xl border border-teal-200">
            <div className="text-sm text-slate-500 mb-2 tracking-widest uppercase">Level 1 Decision</div>
            <div className="text-xl font-bold text-teal-700">Sub-Commodity</div>
            <div className="text-sm text-slate-500 mt-2">{"\"What flavor type do I want?\""}</div>
            <div className="text-sm text-teal-600 mt-1">{"\u03C7\u00B2"} = 4,824 · CART = 0.38</div>
          </div>
          <div className="text-center p-5 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-sm text-slate-500 mb-2 tracking-widest uppercase">Level 2 Decision</div>
            <div className="text-xl font-bold text-amber-700">Brand</div>
            <div className="text-sm text-slate-500 mt-2">{"\"Which brand within that type?\""}</div>
            <div className="text-sm text-amber-600 mt-1">{"\u03C7\u00B2"} = 2,156 · CART = 0.31</div>
          </div>
          <div className="text-center p-5 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-sm text-slate-500 mb-2 tracking-widest uppercase">Level 3 Decision</div>
            <div className="text-xl font-bold text-purple-700">Pack Size</div>
            <div className="text-sm text-slate-500 mt-2">{"\"12oz can or 2L bottle?\""}</div>
            <div className="text-sm text-purple-600 mt-1">{"\u03C7\u00B2"} = 487 · CART = 0.12</div>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}
