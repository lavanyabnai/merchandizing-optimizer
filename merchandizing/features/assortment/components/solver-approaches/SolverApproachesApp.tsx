"use client";

import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Line, PieChart, Pie, Cell, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, ComposedChart,
  Area, AreaChart,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell as TCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & COLORS
// ═══════════════════════════════════════════════════════════════

const CHART_COLORS = {
  teal: "#0d9488", tealLight: "#14b8a6", tealDark: "#0f766e",
  gold: "#b45309", orange: "#c2410c", pink: "#be185d",
  purple: "#7c3aed", red: "#dc2626", green: "#16a34a", blue: "#2563eb",
};

const BRAND_COLORS: Record<string, string> = {
  "Coca-Cola": "#e53e3e", Pepsi: "#3182ce", "Dr Pepper": "#805ad5",
  "Mountain Dew": "#38a169", Sprite: "#48bb78", Fanta: "#ed8936",
  "7UP": "#4fd1c5", "RC Cola": "#d69e2e",
};

const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13 };
const axisTick = { fill: "#475569", fontSize: 12 };
const axisTick_sm = { fill: "#475569", fontSize: 11 };
const gridStroke = "#e2e8f0";

// ═══════════════════════════════════════════════════════════════
// DATA — CSD cola dataset
// ═══════════════════════════════════════════════════════════════

const SKU_DATA = [
  // Cola - Coca-Cola (8)
  { id: 1, sku: "Coca-Cola Classic 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", price: 1.29, margin: 0.38, weeklyUnits: 892, choiceShare: 0.142, utility: 2.18, mustCarry: true },
  { id: 2, sku: "Coca-Cola Classic 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", price: 2.49, margin: 0.52, weeklyUnits: 534, choiceShare: 0.085, utility: 1.72, mustCarry: true },
  { id: 3, sku: "Coca-Cola Zero 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", price: 1.29, margin: 0.37, weeklyUnits: 612, choiceShare: 0.097, utility: 1.89, mustCarry: false },
  { id: 4, sku: "Coca-Cola Zero 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", price: 2.49, margin: 0.51, weeklyUnits: 298, choiceShare: 0.047, utility: 1.31, mustCarry: false },
  { id: 5, sku: "Coca-Cola Diet 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", price: 1.29, margin: 0.36, weeklyUnits: 578, choiceShare: 0.092, utility: 1.84, mustCarry: false },
  { id: 6, sku: "Coca-Cola Diet 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", price: 2.49, margin: 0.50, weeklyUnits: 245, choiceShare: 0.039, utility: 1.18, mustCarry: false },
  { id: 7, sku: "Coca-Cola Cherry 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", price: 1.39, margin: 0.41, weeklyUnits: 189, choiceShare: 0.030, utility: 0.92, mustCarry: false },
  { id: 8, sku: "Coca-Cola Vanilla 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", price: 1.39, margin: 0.40, weeklyUnits: 142, choiceShare: 0.023, utility: 0.71, mustCarry: false },
  // Cola - Pepsi (7)
  { id: 9, sku: "Pepsi Original 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", price: 1.25, margin: 0.36, weeklyUnits: 756, choiceShare: 0.120, utility: 2.04, mustCarry: true },
  { id: 10, sku: "Pepsi Original 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", price: 2.39, margin: 0.49, weeklyUnits: 489, choiceShare: 0.078, utility: 1.65, mustCarry: true },
  { id: 11, sku: "Pepsi Zero Sugar 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", price: 1.25, margin: 0.35, weeklyUnits: 423, choiceShare: 0.067, utility: 1.52, mustCarry: false },
  { id: 12, sku: "Pepsi Zero Sugar 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", price: 2.39, margin: 0.48, weeklyUnits: 234, choiceShare: 0.037, utility: 1.12, mustCarry: false },
  { id: 13, sku: "Pepsi Diet 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", price: 1.25, margin: 0.35, weeklyUnits: 389, choiceShare: 0.062, utility: 1.44, mustCarry: false },
  { id: 14, sku: "Pepsi Diet 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", price: 2.39, margin: 0.48, weeklyUnits: 178, choiceShare: 0.028, utility: 0.98, mustCarry: false },
  { id: 15, sku: "Pepsi Wild Cherry 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", price: 1.35, margin: 0.39, weeklyUnits: 201, choiceShare: 0.032, utility: 0.96, mustCarry: false },
  // Cola - RC Cola (3)
  { id: 16, sku: "RC Cola Original 12oz", brand: "RC Cola", subCommodity: "Cola", size: "12oz", price: 1.09, margin: 0.31, weeklyUnits: 156, choiceShare: 0.025, utility: 0.68, mustCarry: true },
  { id: 17, sku: "RC Cola Original 2L", brand: "RC Cola", subCommodity: "Cola", size: "2L", price: 1.99, margin: 0.44, weeklyUnits: 98, choiceShare: 0.016, utility: 0.42, mustCarry: true },
  { id: 18, sku: "RC Cola Diet 12oz", brand: "RC Cola", subCommodity: "Cola", size: "12oz", price: 1.09, margin: 0.30, weeklyUnits: 67, choiceShare: 0.011, utility: 0.18, mustCarry: false },
  // Lemon-Lime - Sprite (5)
  { id: 19, sku: "Sprite Original 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", price: 1.19, margin: 0.34, weeklyUnits: 412, choiceShare: 0.066, utility: 1.48, mustCarry: true },
  { id: 20, sku: "Sprite Original 2L", brand: "Sprite", subCommodity: "Lemon-Lime", size: "2L", price: 2.29, margin: 0.48, weeklyUnits: 267, choiceShare: 0.042, utility: 1.22, mustCarry: true },
  { id: 21, sku: "Sprite Zero 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", price: 1.19, margin: 0.33, weeklyUnits: 198, choiceShare: 0.031, utility: 0.94, mustCarry: false },
  { id: 22, sku: "Sprite Zero 2L", brand: "Sprite", subCommodity: "Lemon-Lime", size: "2L", price: 2.29, margin: 0.47, weeklyUnits: 134, choiceShare: 0.021, utility: 0.72, mustCarry: false },
  { id: 23, sku: "Sprite Lymonade 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", price: 1.39, margin: 0.40, weeklyUnits: 112, choiceShare: 0.018, utility: 0.58, mustCarry: false },
  // Lemon-Lime - 7UP (4)
  { id: 24, sku: "7UP Original 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", price: 1.15, margin: 0.33, weeklyUnits: 234, choiceShare: 0.037, utility: 1.12, mustCarry: true },
  { id: 25, sku: "7UP Original 2L", brand: "7UP", subCommodity: "Lemon-Lime", size: "2L", price: 2.19, margin: 0.46, weeklyUnits: 178, choiceShare: 0.028, utility: 0.92, mustCarry: true },
  { id: 26, sku: "7UP Zero Sugar 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", price: 1.15, margin: 0.32, weeklyUnits: 112, choiceShare: 0.018, utility: 0.58, mustCarry: false },
  { id: 27, sku: "7UP Cherry 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", price: 1.29, margin: 0.37, weeklyUnits: 89, choiceShare: 0.014, utility: 0.44, mustCarry: false },
  // Orange - Fanta (5)
  { id: 28, sku: "Fanta Orange 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", price: 1.25, margin: 0.36, weeklyUnits: 245, choiceShare: 0.039, utility: 1.18, mustCarry: true },
  { id: 29, sku: "Fanta Orange 2L", brand: "Fanta", subCommodity: "Orange", size: "2L", price: 2.29, margin: 0.48, weeklyUnits: 167, choiceShare: 0.027, utility: 0.88, mustCarry: true },
  { id: 30, sku: "Fanta Grape 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", price: 1.29, margin: 0.37, weeklyUnits: 134, choiceShare: 0.021, utility: 0.72, mustCarry: false },
  { id: 31, sku: "Fanta Strawberry 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", price: 1.29, margin: 0.37, weeklyUnits: 98, choiceShare: 0.016, utility: 0.52, mustCarry: false },
  { id: 32, sku: "Fanta Pineapple 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", price: 1.29, margin: 0.36, weeklyUnits: 78, choiceShare: 0.012, utility: 0.38, mustCarry: false },
  // Specialty/Other - Dr Pepper (6)
  { id: 33, sku: "Dr Pepper Original 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", price: 1.35, margin: 0.40, weeklyUnits: 412, choiceShare: 0.066, utility: 1.48, mustCarry: true },
  { id: 34, sku: "Dr Pepper Original 2L", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "2L", price: 2.59, margin: 0.55, weeklyUnits: 278, choiceShare: 0.044, utility: 1.28, mustCarry: true },
  { id: 35, sku: "Dr Pepper Zero 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", price: 1.35, margin: 0.39, weeklyUnits: 298, choiceShare: 0.047, utility: 1.31, mustCarry: false },
  { id: 36, sku: "Dr Pepper Zero 2L", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "2L", price: 2.59, margin: 0.54, weeklyUnits: 156, choiceShare: 0.025, utility: 0.88, mustCarry: false },
  { id: 37, sku: "Dr Pepper Cherry 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", price: 1.39, margin: 0.41, weeklyUnits: 167, choiceShare: 0.027, utility: 0.82, mustCarry: false },
  { id: 38, sku: "Dr Pepper Cream Soda 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", price: 1.39, margin: 0.40, weeklyUnits: 134, choiceShare: 0.021, utility: 0.68, mustCarry: false },
  // Specialty/Other - Mountain Dew (6)
  { id: 39, sku: "Mountain Dew Original 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", price: 1.29, margin: 0.38, weeklyUnits: 378, choiceShare: 0.060, utility: 1.44, mustCarry: true },
  { id: 40, sku: "Mountain Dew Original 2L", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "2L", price: 2.49, margin: 0.52, weeklyUnits: 245, choiceShare: 0.039, utility: 1.18, mustCarry: true },
  { id: 41, sku: "Mountain Dew Zero 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", price: 1.29, margin: 0.37, weeklyUnits: 189, choiceShare: 0.030, utility: 0.92, mustCarry: false },
  { id: 42, sku: "Mountain Dew Code Red 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", price: 1.35, margin: 0.39, weeklyUnits: 156, choiceShare: 0.025, utility: 0.78, mustCarry: false },
  { id: 43, sku: "Mountain Dew Baja Blast 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", price: 1.39, margin: 0.40, weeklyUnits: 134, choiceShare: 0.021, utility: 0.68, mustCarry: false },
  { id: 44, sku: "Mountain Dew Voltage 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", price: 1.35, margin: 0.38, weeklyUnits: 98, choiceShare: 0.016, utility: 0.52, mustCarry: false },
];

const CLUSTERS = [
  { id: "C1", name: "Urban", stores: 187, cola: 14, lemonLime: 6, orange: 4, specialty: 5, total: 29 },
  { id: "C2", name: "Suburban", stores: 243, cola: 18, lemonLime: 8, orange: 6, specialty: 7, total: 39 },
  { id: "C3", name: "Premium", stores: 98, cola: 12, lemonLime: 5, orange: 5, specialty: 6, total: 28 },
  { id: "C4", name: "Rural", stores: 232, cola: 16, lemonLime: 8, orange: 6, specialty: 6, total: 36 },
];

const FACING_WIDTH = 0.5; // ft per facing

// Column Generation iteration trace
const COLGEN_ITERATIONS = [
  { iter: 1, skuAdded: "Coca-Cola Zero 12oz", reducedCost: 4.82, objImprovement: 4.82, cumulativeRevenue: 18245, gapToLPBound: 8.4 },
  { iter: 2, skuAdded: "Pepsi Zero Sugar 12oz", reducedCost: 3.91, objImprovement: 3.91, cumulativeRevenue: 18632, gapToLPBound: 6.9 },
  { iter: 3, skuAdded: "Coca-Cola Diet 12oz", reducedCost: 3.54, objImprovement: 3.54, cumulativeRevenue: 18984, gapToLPBound: 5.7 },
  { iter: 4, skuAdded: "Dr Pepper Zero 12oz", reducedCost: 3.12, objImprovement: 3.12, cumulativeRevenue: 19298, gapToLPBound: 4.8 },
  { iter: 5, skuAdded: "Mountain Dew Zero 12oz", reducedCost: 2.78, objImprovement: 2.78, cumulativeRevenue: 19574, gapToLPBound: 4.1 },
  { iter: 6, skuAdded: "Sprite Zero 12oz", reducedCost: 2.34, objImprovement: 2.34, cumulativeRevenue: 19812, gapToLPBound: 3.4 },
  { iter: 7, skuAdded: "Pepsi Diet 12oz", reducedCost: 1.98, objImprovement: 1.98, cumulativeRevenue: 20008, gapToLPBound: 2.8 },
  { iter: 8, skuAdded: "Coca-Cola Cherry 12oz", reducedCost: 1.45, objImprovement: 1.45, cumulativeRevenue: 20154, gapToLPBound: 2.1 },
  { iter: 9, skuAdded: "Fanta Grape 12oz", reducedCost: 1.12, objImprovement: 1.12, cumulativeRevenue: 20264, gapToLPBound: 1.6 },
  { iter: 10, skuAdded: "7UP Zero Sugar 12oz", reducedCost: 0.87, objImprovement: 0.87, cumulativeRevenue: 20352, gapToLPBound: 1.2 },
  { iter: 11, skuAdded: "Dr Pepper Cherry 12oz", reducedCost: 0.64, objImprovement: 0.64, cumulativeRevenue: 20416, gapToLPBound: 0.9 },
  { iter: 12, skuAdded: "Mountain Dew Code Red 12oz", reducedCost: 0.48, objImprovement: 0.48, cumulativeRevenue: 20462, gapToLPBound: 0.6 },
  { iter: 13, skuAdded: "Pepsi Wild Cherry 12oz", reducedCost: 0.31, objImprovement: 0.31, cumulativeRevenue: 20494, gapToLPBound: 0.4 },
  { iter: 14, skuAdded: "Fanta Strawberry 12oz", reducedCost: 0.18, objImprovement: 0.18, cumulativeRevenue: 20512, gapToLPBound: 0.2 },
  { iter: 15, skuAdded: "Coca-Cola Vanilla 12oz", reducedCost: 0.09, objImprovement: 0.09, cumulativeRevenue: 20521, gapToLPBound: 0.1 },
];

// Benders decomposition iterations
const BENDERS_ITERATIONS = [
  { iter: 1, cutType: "Optimality", constraintAdded: "Revenue linear approx at x^0", upperBound: 24180, lowerBound: 19730, gap: 18.4, activeCuts: 1 },
  { iter: 2, cutType: "Feasibility", constraintAdded: "Space infeasibility cut C2", upperBound: 23420, lowerBound: 19892, gap: 15.1, activeCuts: 2 },
  { iter: 3, cutType: "Optimality", constraintAdded: "MNL substitution cut #1", upperBound: 22810, lowerBound: 20048, gap: 12.1, activeCuts: 3 },
  { iter: 4, cutType: "Optimality", constraintAdded: "Revenue gradient cut at x^3", upperBound: 22340, lowerBound: 20156, gap: 9.8, activeCuts: 4 },
  { iter: 5, cutType: "Feasibility", constraintAdded: "Brand limit feasibility C1", upperBound: 21980, lowerBound: 20245, gap: 7.9, activeCuts: 5 },
  { iter: 6, cutType: "Optimality", constraintAdded: "Substitution interaction cut", upperBound: 21650, lowerBound: 20312, gap: 6.2, activeCuts: 6 },
  { iter: 7, cutType: "Optimality", constraintAdded: "Revenue concavity cut #2", upperBound: 21340, lowerBound: 20378, gap: 4.5, activeCuts: 7 },
  { iter: 8, cutType: "Optimality", constraintAdded: "Cross-elasticity bound", upperBound: 21080, lowerBound: 20425, gap: 3.1, activeCuts: 8 },
  { iter: 9, cutType: "Optimality", constraintAdded: "Tightened LP relaxation", upperBound: 20890, lowerBound: 20462, gap: 2.0, activeCuts: 8 },
  { iter: 10, cutType: "Optimality", constraintAdded: "Subgradient cut at x^9", upperBound: 20740, lowerBound: 20498, gap: 1.2, activeCuts: 9 },
  { iter: 11, cutType: "Optimality", constraintAdded: "Final tightening cut", upperBound: 20620, lowerBound: 20524, gap: 0.5, activeCuts: 9 },
  { iter: 12, cutType: "Optimality", constraintAdded: "Convergence verified", upperBound: 20585, lowerBound: 20524, gap: 0.3, activeCuts: 10 },
];

// Hierarchical Level 2: Brand allocation per sub-commodity per cluster (ft)
const HIERARCHICAL_BRAND_ALLOC = [
  { cluster: "C1", subCommodity: "Cola", brand: "Coca-Cola", spaceFt: 7, brand2: "Pepsi", spaceFt2: 5, brand3: "RC Cola", spaceFt3: 2 },
  { cluster: "C1", subCommodity: "Lemon-Lime", brand: "Sprite", spaceFt: 3.5, brand2: "7UP", spaceFt2: 2.5, brand3: "", spaceFt3: 0 },
  { cluster: "C1", subCommodity: "Orange", brand: "Fanta", spaceFt: 4, brand2: "", spaceFt2: 0, brand3: "", spaceFt3: 0 },
  { cluster: "C1", subCommodity: "Specialty/Other", brand: "Dr Pepper", spaceFt: 2.5, brand2: "Mountain Dew", spaceFt2: 2.5, brand3: "", spaceFt3: 0 },
  { cluster: "C2", subCommodity: "Cola", brand: "Coca-Cola", spaceFt: 9, brand2: "Pepsi", spaceFt2: 6.5, brand3: "RC Cola", spaceFt3: 2.5 },
  { cluster: "C2", subCommodity: "Lemon-Lime", brand: "Sprite", spaceFt: 4.5, brand2: "7UP", spaceFt2: 3.5, brand3: "", spaceFt3: 0 },
  { cluster: "C2", subCommodity: "Orange", brand: "Fanta", spaceFt: 6, brand2: "", spaceFt2: 0, brand3: "", spaceFt3: 0 },
  { cluster: "C2", subCommodity: "Specialty/Other", brand: "Dr Pepper", spaceFt: 3.5, brand2: "Mountain Dew", spaceFt2: 3.5, brand3: "", spaceFt3: 0 },
  { cluster: "C3", subCommodity: "Cola", brand: "Coca-Cola", spaceFt: 6, brand2: "Pepsi", spaceFt2: 4, brand3: "RC Cola", spaceFt3: 2 },
  { cluster: "C3", subCommodity: "Lemon-Lime", brand: "Sprite", spaceFt: 3, brand2: "7UP", spaceFt2: 2, brand3: "", spaceFt3: 0 },
  { cluster: "C3", subCommodity: "Orange", brand: "Fanta", spaceFt: 5, brand2: "", spaceFt2: 0, brand3: "", spaceFt3: 0 },
  { cluster: "C3", subCommodity: "Specialty/Other", brand: "Dr Pepper", spaceFt: 3, brand2: "Mountain Dew", spaceFt2: 3, brand3: "", spaceFt3: 0 },
  { cluster: "C4", subCommodity: "Cola", brand: "Coca-Cola", spaceFt: 8, brand2: "Pepsi", spaceFt2: 5.5, brand3: "RC Cola", spaceFt3: 2.5 },
  { cluster: "C4", subCommodity: "Lemon-Lime", brand: "Sprite", spaceFt: 4.5, brand2: "7UP", spaceFt2: 3.5, brand3: "", spaceFt3: 0 },
  { cluster: "C4", subCommodity: "Orange", brand: "Fanta", spaceFt: 6, brand2: "", spaceFt2: 0, brand3: "", spaceFt3: 0 },
  { cluster: "C4", subCommodity: "Specialty/Other", brand: "Dr Pepper", spaceFt: 3, brand2: "Mountain Dew", spaceFt2: 3, brand3: "", spaceFt3: 0 },
];

// Solver comparison data
const SOLVER_COMPARISON = [
  { method: "Column Generation", objective: 20521, solveTime: 142, gap: 0.1, variables: 44, constraints: 128, scalability: "Medium" },
  { method: "Benders Decomposition", objective: 20524, solveTime: 238, gap: 0.3, variables: 88, constraints: 196, scalability: "High" },
  { method: "Hierarchical Multi-Level", objective: 20389, solveTime: 23, gap: 0.8, variables: 44, constraints: 84, scalability: "Very High" },
];

// Revenue by method and cluster
const REVENUE_BY_METHOD_CLUSTER = [
  { cluster: "C1 Urban", colGen: 4812, benders: 4825, hierarchical: 4768 },
  { cluster: "C2 Suburban", colGen: 6438, benders: 6451, hierarchical: 6392 },
  { cluster: "C3 Premium", colGen: 3642, benders: 3638, hierarchical: 3612 },
  { cluster: "C4 Rural", colGen: 5629, benders: 5610, hierarchical: 5617 },
];

// SKU agreement across methods
const SKU_AGREEMENT = {
  allThree: 35,
  colGenAndBenders: 2,
  colGenAndHierarchical: 1,
  bendersAndHierarchical: 0,
  colGenOnly: 0,
  bendersOnly: 1,
  hierarchicalOnly: 0,
  totalColGen: 38,
  totalBenders: 38,
  totalHierarchical: 36,
};

// Final consensus assortment (abbreviated for the table)
const FINAL_ASSORTMENT = [
  { sku: "Coca-Cola Classic 12oz", brand: "Coca-Cola", action: "Must-Carry", facingsC1: 4, facingsC2: 5, facingsC3: 3, facingsC4: 4, reason: "Top choice share (14.2%), all solvers agree" },
  { sku: "Pepsi Original 12oz", brand: "Pepsi", action: "Must-Carry", facingsC1: 3, facingsC2: 4, facingsC3: 3, facingsC4: 4, reason: "2nd highest utility (2.04), core brand" },
  { sku: "Coca-Cola Classic 2L", brand: "Coca-Cola", action: "Must-Carry", facingsC1: 3, facingsC2: 4, facingsC3: 2, facingsC4: 3, reason: "Key large-format, high margin ($0.52)" },
  { sku: "Coca-Cola Zero 12oz", brand: "Coca-Cola", action: "Add", facingsC1: 3, facingsC2: 3, facingsC3: 2, facingsC4: 3, reason: "ColGen iter 1, highest reduced cost (4.82)" },
  { sku: "Pepsi Original 2L", brand: "Pepsi", action: "Must-Carry", facingsC1: 2, facingsC2: 3, facingsC3: 2, facingsC4: 3, reason: "Strong volume (489/wk), high margin" },
  { sku: "Pepsi Zero Sugar 12oz", brand: "Pepsi", action: "Add", facingsC1: 2, facingsC2: 3, facingsC3: 2, facingsC4: 2, reason: "ColGen iter 2, growing diet segment" },
  { sku: "Coca-Cola Diet 12oz", brand: "Coca-Cola", action: "Add", facingsC1: 2, facingsC2: 3, facingsC3: 2, facingsC4: 2, reason: "ColGen iter 3, strong repeat purchase" },
  { sku: "Dr Pepper Original 12oz", brand: "Dr Pepper", action: "Must-Carry", facingsC1: 2, facingsC2: 3, facingsC3: 2, facingsC4: 2, reason: "Specialty leader, loyal customer base" },
  { sku: "Mountain Dew Original 12oz", brand: "Mountain Dew", action: "Must-Carry", facingsC1: 2, facingsC2: 3, facingsC3: 2, facingsC4: 2, reason: "High energy segment, youth appeal" },
  { sku: "Sprite Original 12oz", brand: "Sprite", action: "Must-Carry", facingsC1: 2, facingsC2: 3, facingsC3: 2, facingsC4: 2, reason: "Lemon-Lime category anchor" },
  { sku: "Fanta Orange 12oz", brand: "Fanta", action: "Must-Carry", facingsC1: 2, facingsC2: 2, facingsC3: 2, facingsC4: 2, reason: "Orange category anchor" },
  { sku: "7UP Original 12oz", brand: "7UP", action: "Must-Carry", facingsC1: 2, facingsC2: 2, facingsC3: 1, facingsC4: 2, reason: "Secondary lemon-lime, price positioning" },
  { sku: "RC Cola Diet 12oz", brand: "RC Cola", action: "Remove", facingsC1: 0, facingsC2: 0, facingsC3: 0, facingsC4: 0, reason: "Lowest utility (0.18), no solver selected" },
  { sku: "Fanta Pineapple 12oz", brand: "Fanta", action: "Remove", facingsC1: 0, facingsC2: 0, facingsC3: 0, facingsC4: 0, reason: "Low volume (78/wk), utility 0.38" },
  { sku: "7UP Cherry 12oz", brand: "7UP", action: "Remove", facingsC1: 0, facingsC2: 0, facingsC3: 0, facingsC4: 0, reason: "Low utility (0.44), cannibalized by Sprite" },
  { sku: "Mountain Dew Voltage 12oz", brand: "Mountain Dew", action: "Remove", facingsC1: 0, facingsC2: 0, facingsC3: 0, facingsC4: 0, reason: "Lowest Mtn Dew variant, poor shelf productivity" },
  { sku: "Coca-Cola Vanilla 12oz", brand: "Coca-Cola", action: "Add", facingsC1: 1, facingsC2: 1, facingsC3: 0, facingsC4: 1, reason: "ColGen iter 15, marginal but positive" },
  { sku: "Pepsi Wild Cherry 12oz", brand: "Pepsi", action: "Add", facingsC1: 1, facingsC2: 2, facingsC3: 1, facingsC4: 1, reason: "ColGen iter 13, flavor differentiation" },
];

// Non-selected SKU reduced costs (all negative = optimal)
const REMAINING_REDUCED_COSTS = [
  { sku: "RC Cola Diet 12oz", reducedCost: -1.42 },
  { sku: "Fanta Pineapple 12oz", reducedCost: -0.98 },
  { sku: "7UP Cherry 12oz", reducedCost: -0.76 },
  { sku: "Mountain Dew Voltage 12oz", reducedCost: -0.62 },
  { sku: "Sprite Zero 2L", reducedCost: -0.41 },
  { sku: "Coca-Cola Diet 2L", reducedCost: -0.28 },
];

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function AnalysisCard({ title, badge, insight, children }: { title: string; badge?: string; insight?: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-700">{title}</CardTitle>
          {badge && <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">{badge}</Badge>}
        </div>
        {insight && <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-1">{insight}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Metric({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color: color || "#0d9488" }}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Must-Carry": "bg-green-100 text-green-800 border-green-300",
    Grow: "bg-blue-100 text-blue-800 border-blue-300",
    Rationalize: "bg-red-100 text-red-800 border-red-300",
    Review: "bg-amber-100 text-amber-800 border-amber-300",
    Optimal: "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Sub-Optimal": "bg-orange-100 text-orange-800 border-orange-300",
    Add: "bg-blue-100 text-blue-800 border-blue-300",
    Remove: "bg-red-100 text-red-800 border-red-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}

// ═══════════════════════════════════════════════════════════════
// SECTION: OVERVIEW
// ═══════════════════════════════════════════════════════════════

function OverviewSection() {
  const solverMethods = [
    { name: "Column Generation", approach: "Iteratively add best SKU to restricted master problem using reduced costs from pricing subproblem", whenToUse: "Medium SKU pools (50-200), interpretable iterations needed", complexity: "O(n * k) per iteration", strengths: "Transparent, warm-startable, good LP bounds" },
    { name: "Benders Decomposition", approach: "Split into binary master (SKU selection) and continuous sub (MNL demand evaluation), exchange cuts", whenToUse: "Complex nonlinear demand models, need optimality certificate", complexity: "O(2^n) worst case, practical: 10-20 cuts", strengths: "Handles nonlinearity, proven optimal gap" },
    { name: "Hierarchical Multi-Level", approach: "Decompose by CDT hierarchy: Category > Sub-category > Brand > SKU, solve each level independently", whenToUse: "Large-scale (200+ SKUs, 50+ clusters), time-constrained", complexity: "O(sum of sub-problems)", strengths: "37x faster, scalable, aligns with org structure" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { value: 44, label: "Total SKUs", color: CHART_COLORS.teal },
          { value: 8, label: "Brands", color: CHART_COLORS.blue },
          { value: 4, label: "Store Clusters", color: CHART_COLORS.purple },
          { value: 760, label: "Total Stores", color: CHART_COLORS.gold },
          { value: 3, label: "Solver Methods", color: CHART_COLORS.green },
        ].map((kpi) => (
          <Card key={kpi.label} className="shadow-sm border-slate-200">
            <CardContent className="pt-4 pb-4">
              <Metric value={kpi.value} label={kpi.label} color={kpi.color} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Diagram */}
      <AnalysisCard title="Optimization Pipeline" badge="Architecture" insight="Space budgets from Layer 1 feed into three parallel solver approaches, each producing an optimal assortment with facing plan.">
        <div className="flex items-center justify-center gap-2 py-6 flex-wrap">
          <div className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-center">
            <div className="text-xs text-slate-500">Input</div>
            <div className="text-sm font-semibold text-slate-700">Space Budgets</div>
            <div className="text-xs text-slate-400">from Layer 1</div>
          </div>
          <div className="text-slate-400 text-xl font-bold">&rarr;</div>
          <div className="flex flex-col gap-2">
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 text-center">
              <div className="text-sm font-semibold text-teal-700">Column Generation</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center">
              <div className="text-sm font-semibold text-blue-700">Benders Decomposition</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-center">
              <div className="text-sm font-semibold text-purple-700">Hierarchical Multi-Level</div>
            </div>
          </div>
          <div className="text-slate-400 text-xl font-bold">&rarr;</div>
          <div className="bg-green-50 border border-green-300 rounded-lg px-4 py-3 text-center">
            <div className="text-xs text-green-600">Output</div>
            <div className="text-sm font-semibold text-green-700">Final Assortment</div>
            <div className="text-xs text-green-500">+ Facing Plan</div>
          </div>
        </div>
      </AnalysisCard>

      {/* Solver Methods Summary */}
      <AnalysisCard title="Solver Methods Comparison" badge="3 Approaches">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Method</TableHead>
              <TableHead>Approach</TableHead>
              <TableHead>When to Use</TableHead>
              <TableHead className="w-[140px]">Complexity</TableHead>
              <TableHead>Strengths</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solverMethods.map((m) => (
              <TableRow key={m.name}>
                <TCell className="font-medium text-slate-700">{m.name}</TCell>
                <TCell className="text-xs text-slate-600">{m.approach}</TCell>
                <TCell className="text-xs text-slate-600">{m.whenToUse}</TCell>
                <TCell className="text-xs font-mono text-slate-500">{m.complexity}</TCell>
                <TCell className="text-xs text-slate-600">{m.strengths}</TCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: PHASE 1 — Data & Setup
// ═══════════════════════════════════════════════════════════════

function Phase1Section() {
  const top20Utility = useMemo(() =>
    [...SKU_DATA].sort((a, b) => b.utility - a.utility).slice(0, 20),
    []
  );

  const constraintSummary = [
    { constraint: "Must-Carry SKUs", description: "Top 2 SKUs per brand by volume", count: `${SKU_DATA.filter(s => s.mustCarry).length} SKUs` },
    { constraint: "Min Facings", description: "At least 1 facing if SKU is selected", count: "1 min" },
    { constraint: "Max Facings", description: "No more than 6 facings per SKU", count: "6 max" },
    { constraint: "Brand Limits", description: "Each brand gets proportional space by market share", count: "8 brands" },
    { constraint: "Price Tier Coverage", description: "At least 1 SKU per price tier (value/mainstream/premium)", count: "3 tiers" },
    { constraint: "Sub-commodity Space", description: "Total facings in sub-commodity cannot exceed allocated shelf feet", count: "4 sub-cats" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Data & Setup" subtitle="SKU candidate pool, space budget constraints, and MNL utility inputs from upstream models" />

      {/* SKU Candidate Pool Table */}
      <AnalysisCard title="SKU Candidate Pool" badge="44 SKUs" insight="All 44 CSD SKUs from CSD dataset with MNL-estimated choice shares and utility scores.">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Sub-Commodity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Wkly Units</TableHead>
                <TableHead className="text-right">Choice Share</TableHead>
                <TableHead className="text-right">Utility</TableHead>
                <TableHead className="text-center">Must-Carry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKU_DATA.map((s) => (
                <TableRow key={s.id}>
                  <TCell className="text-xs text-slate-400">{s.id}</TCell>
                  <TCell className="text-xs font-medium">{s.sku}</TCell>
                  <TCell><span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND_COLORS[s.brand] + "18", color: BRAND_COLORS[s.brand] }}>{s.brand}</span></TCell>
                  <TCell className="text-xs">{s.subCommodity}</TCell>
                  <TCell className="text-right text-xs">${s.price.toFixed(2)}</TCell>
                  <TCell className="text-right text-xs">${s.margin.toFixed(2)}</TCell>
                  <TCell className="text-right text-xs">{s.weeklyUnits.toLocaleString()}</TCell>
                  <TCell className="text-right text-xs">{(s.choiceShare * 100).toFixed(1)}%</TCell>
                  <TCell className="text-right text-xs font-mono">{s.utility.toFixed(2)}</TCell>
                  <TCell className="text-center">{s.mustCarry ? <span className="text-green-600 font-bold text-xs">Yes</span> : <span className="text-slate-300 text-xs">-</span>}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Space Budget Constraints */}
      <AnalysisCard title="Space Budget Constraints" badge="From Space Allocation Optimizer" insight="Space budgets flow from Layer 1 (Space Allocation Optimizer). Each facing occupies 0.5 ft of shelf space.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cluster</TableHead>
              <TableHead className="text-center">Stores</TableHead>
              <TableHead className="text-right">Cola (ft)</TableHead>
              <TableHead className="text-right">Lemon-Lime (ft)</TableHead>
              <TableHead className="text-right">Orange (ft)</TableHead>
              <TableHead className="text-right">Specialty (ft)</TableHead>
              <TableHead className="text-right font-bold">Total (ft)</TableHead>
              <TableHead className="text-right">Max Facings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CLUSTERS.map((c) => (
              <TableRow key={c.id}>
                <TCell className="font-medium">{c.id} {c.name}</TCell>
                <TCell className="text-center">{c.stores}</TCell>
                <TCell className="text-right">{c.cola}</TCell>
                <TCell className="text-right">{c.lemonLime}</TCell>
                <TCell className="text-right">{c.orange}</TCell>
                <TCell className="text-right">{c.specialty}</TCell>
                <TCell className="text-right font-bold">{c.total}</TCell>
                <TCell className="text-right text-slate-500">{c.total / FACING_WIDTH}</TCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalysisCard>

      {/* Constraint Summary */}
      <AnalysisCard title="Optimization Constraints" badge="6 Constraint Types">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Constraint</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {constraintSummary.map((c) => (
              <TableRow key={c.constraint}>
                <TCell className="font-medium text-slate-700">{c.constraint}</TCell>
                <TCell className="text-xs text-slate-600">{c.description}</TCell>
                <TCell className="text-right text-xs font-mono">{c.count}</TCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-6">
        {/* MNL Utility Scores - Top 20 */}
        <AnalysisCard title="MNL Utility Scores — Top 20 SKUs" badge="MNL Model" insight="Utility scores from multinomial logit model capture price sensitivity, brand preference, and promotional response.">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top20Utility} layout="vertical" margin={{ left: 140, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} domain={[0, 2.5]} />
              <YAxis type="category" dataKey="sku" tick={axisTick_sm} width={135} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="utility" name="MNL Utility" radius={[0, 4, 4, 0]}>
                {top20Utility.map((entry) => (
                  <Cell key={entry.id} fill={BRAND_COLORS[entry.brand] || CHART_COLORS.teal} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Margin vs Volume Scatter */}
        <AnalysisCard title="Margin vs. Weekly Volume" badge="All 44 SKUs" insight="Bubble size represents choice share. Top-right quadrant SKUs are high-margin, high-volume candidates.">
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" dataKey="weeklyUnits" name="Weekly Units" tick={axisTick} label={{ value: "Weekly Units", position: "bottom", offset: 5, fill: "#475569", fontSize: 12 }} />
              <YAxis type="number" dataKey="margin" name="Margin ($)" tick={axisTick} label={{ value: "Margin ($)", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 12 }} domain={[0.25, 0.58]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [name === "Margin ($)" ? `$${value.toFixed(2)}` : value, name]} />
              <ReferenceLine x={350} stroke={CHART_COLORS.orange} strokeDasharray="5 5" />
              <ReferenceLine y={0.40} stroke={CHART_COLORS.orange} strokeDasharray="5 5" />
              {Object.keys(BRAND_COLORS).map((brand) => (
                <Scatter
                  key={brand}
                  name={brand}
                  data={SKU_DATA.filter(s => s.brand === brand)}
                  fill={BRAND_COLORS[brand]}
                  opacity={0.75}
                />
              ))}
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: PHASE 2 — Column Generation
// ═══════════════════════════════════════════════════════════════

function Phase2Section() {
  const convergenceData = COLGEN_ITERATIONS.map(iter => ({
    ...iter,
    lpBound: Math.round(iter.cumulativeRevenue / (1 - iter.gapToLPBound / 100)),
  }));

  const selectedSKUs = useMemo(() => {
    const mustCarryIds = SKU_DATA.filter(s => s.mustCarry).map(s => s.id);
    const addedIds = COLGEN_ITERATIONS.map(iter => {
      const found = SKU_DATA.find(s => s.sku === iter.skuAdded);
      return found ? found.id : -1;
    }).filter(id => id !== -1);
    return [...new Set([...mustCarryIds, ...addedIds])];
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Column Generation" subtitle="Iteratively expand the assortment by adding the SKU with highest marginal contribution" />

      {/* Methodology Card */}
      <AnalysisCard title="Column Generation Methodology" badge="Iterative" insight="Instead of enumerating all 2^44 = 17.6 trillion possible assortments, Column Generation starts with a small feasible set and iteratively adds the most promising SKU.">
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Master Problem (Restricted)</h4>
            <p className="text-xs text-slate-600">Maximize total MNL expected revenue using current assortment, subject to space, must-carry, and brand constraints.</p>
            <div className="mt-2 font-mono text-xs text-teal-700 bg-teal-50 rounded p-2">
              max sum(r_i * x_i * P_i(S))
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Pricing Subproblem</h4>
            <p className="text-xs text-slate-600">For each candidate SKU NOT in current assortment, compute reduced cost = marginal revenue gain minus shadow price of space consumed.</p>
            <div className="mt-2 font-mono text-xs text-blue-700 bg-blue-50 rounded p-2">
              rc_j = r_j * dP_j/dS - pi * w_j
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Termination</h4>
            <p className="text-xs text-slate-600">Stop when all reduced costs are non-positive (no candidate improves objective) or gap to LP bound falls below threshold.</p>
            <div className="mt-2 font-mono text-xs text-green-700 bg-green-50 rounded p-2">
              rc_j &lt;= 0 for all j not in S
            </div>
          </div>
        </div>
      </AnalysisCard>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="28" label="Must-Carry Baseline SKUs" color={CHART_COLORS.teal} /></CardContent></Card>
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="38" label="Final Selected SKUs" color={CHART_COLORS.blue} /></CardContent></Card>
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="15" label="Iterations to Converge" color={CHART_COLORS.purple} /></CardContent></Card>
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="$20,521" label="Optimal Weekly Revenue" color={CHART_COLORS.green} /></CardContent></Card>
      </div>

      {/* Iteration Trace */}
      <AnalysisCard title="Column Generation Iteration Trace" badge="15 Iterations" insight="Starting from 28 must-carry SKUs, each iteration adds the SKU with the highest reduced cost (marginal revenue improvement).">
        <div className="max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Iter</TableHead>
                <TableHead>SKU Added</TableHead>
                <TableHead className="text-right">Reduced Cost</TableHead>
                <TableHead className="text-right">Obj. Improvement</TableHead>
                <TableHead className="text-right">Cumulative Revenue</TableHead>
                <TableHead className="text-right">Gap to LP Bound</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COLGEN_ITERATIONS.map((iter) => (
                <TableRow key={iter.iter}>
                  <TCell className="font-mono text-sm">{iter.iter}</TCell>
                  <TCell className="text-sm font-medium">{iter.skuAdded}</TCell>
                  <TCell className="text-right font-mono text-sm text-green-600">+{iter.reducedCost.toFixed(2)}</TCell>
                  <TCell className="text-right text-sm">+{iter.objImprovement.toFixed(2)}</TCell>
                  <TCell className="text-right font-mono text-sm">${iter.cumulativeRevenue.toLocaleString()}</TCell>
                  <TCell className="text-right text-sm">
                    <span className={iter.gapToLPBound <= 1 ? "text-green-600" : iter.gapToLPBound <= 3 ? "text-amber-600" : "text-red-600"}>
                      {iter.gapToLPBound.toFixed(1)}%
                    </span>
                  </TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-6">
        {/* Convergence Chart */}
        <AnalysisCard title="Objective Convergence" badge="Diminishing Returns" insight="Revenue improvements diminish with each iteration, showing classic column generation convergence behavior.">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={convergenceData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="iter" tick={axisTick} label={{ value: "Iteration", position: "bottom", offset: -2, fill: "#475569", fontSize: 12 }} />
              <YAxis tick={axisTick} domain={[17500, 21500]} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="cumulativeRevenue" name="Objective (Revenue)" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.teal }} />
              <Line type="monotone" dataKey="lpBound" name="LP Bound" stroke={CHART_COLORS.orange} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Reduced Costs of Non-Selected */}
        <AnalysisCard title="Reduced Costs — Non-Selected SKUs" badge="Optimality Check" insight="All remaining SKUs have negative reduced costs, confirming the current solution is optimal (no SKU addition would improve the objective).">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={REMAINING_REDUCED_COSTS} layout="vertical" margin={{ left: 160, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} domain={[-1.6, 0]} />
              <YAxis type="category" dataKey="sku" tick={axisTick_sm} width={155} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine x={0} stroke={CHART_COLORS.red} strokeWidth={2} />
              <Bar dataKey="reducedCost" name="Reduced Cost" fill={CHART_COLORS.red} radius={[0, 4, 4, 0]} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* Selected Assortment Summary */}
      <AnalysisCard title="Final Column Generation Assortment" badge="38 SKUs Selected" insight="38 of 44 candidate SKUs are selected. 6 SKUs are excluded with negative reduced costs.">
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(BRAND_COLORS).map((brand) => {
            const brandSkus = SKU_DATA.filter(s => s.brand === brand);
            const selectedCount = brandSkus.filter(s => selectedSKUs.includes(s.id)).length;
            return (
              <div key={brand} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS[brand] }} />
                  <span className="text-sm font-semibold text-slate-700">{brand}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {selectedCount} / {brandSkus.length} SKUs selected
                </div>
                <div className="mt-1">
                  {brandSkus.map(s => (
                    <div key={s.id} className={`text-xs py-0.5 ${selectedSKUs.includes(s.id) ? "text-green-700" : "text-red-400 line-through"}`}>
                      {selectedSKUs.includes(s.id) ? "+" : "-"} {s.sku.replace(brand + " ", "")}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: PHASE 3 — Benders Decomposition
// ═══════════════════════════════════════════════════════════════

function Phase3Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Benders Decomposition" subtitle="Master-subproblem decomposition with optimality and feasibility cuts for MNL-based assortment optimization" />

      {/* Methodology */}
      <AnalysisCard title="Benders Decomposition Methodology" badge="Master-Sub" insight="The problem is split: the Master selects SKUs (binary), while the Subproblem evaluates nonlinear MNL demand for the selected set and returns linear cuts.">
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Master Problem</h4>
            <p className="text-xs text-slate-600">Binary decision variables x_i in (0,1) for each of 44 SKUs. Minimizes surrogate objective subject to accumulated Benders cuts + space constraints.</p>
            <div className="mt-2 font-mono text-xs text-teal-700 bg-teal-50 rounded p-2">
              min eta s.t. cuts + space
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Subproblem (MNL Eval)</h4>
            <p className="text-xs text-slate-600">Given selected SKU set S, compute MNL choice probabilities P_i(S), expected revenue, margin, and generate Benders cut (linear approximation).</p>
            <div className="mt-2 font-mono text-xs text-blue-700 bg-blue-50 rounded p-2">
              {"P_i(S) = e^{V_i} / sum(e^{V_j})"}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Cut Generation</h4>
            <p className="text-xs text-slate-600">Optimality cuts tighten the upper bound. Feasibility cuts eliminate infeasible SKU combinations. Converges when UB-LB gap is below threshold.</p>
            <div className="mt-2 font-mono text-xs text-green-700 bg-green-50 rounded p-2">
              {"eta >= f(x*) + grad * (x - x*)"}
            </div>
          </div>
        </div>
      </AnalysisCard>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="12" label="Iterations" color={CHART_COLORS.teal} /></CardContent></Card>
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="$20,524" label="Optimal Revenue" color={CHART_COLORS.green} /></CardContent></Card>
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="0.3%" label="Final Gap" color={CHART_COLORS.blue} /></CardContent></Card>
        <Card className="shadow-sm border-slate-200"><CardContent className="pt-4 pb-4"><Metric value="10" label="Active Cuts at Optimum" color={CHART_COLORS.purple} /></CardContent></Card>
      </div>

      {/* Benders Cuts Table */}
      <AnalysisCard title="Benders Cut Iteration Log" badge="12 Iterations" insight="Each iteration adds either an optimality cut (tightens UB) or a feasibility cut (eliminates infeasible region). Gap closes from 18.4% to 0.3%.">
        <div className="max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Iter</TableHead>
                <TableHead className="w-24">Cut Type</TableHead>
                <TableHead>Constraint Added</TableHead>
                <TableHead className="text-right">Upper Bound</TableHead>
                <TableHead className="text-right">Lower Bound</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead className="text-right">Active Cuts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BENDERS_ITERATIONS.map((iter) => (
                <TableRow key={iter.iter}>
                  <TCell className="font-mono text-sm">{iter.iter}</TCell>
                  <TCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${iter.cutType === "Optimality" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {iter.cutType}
                    </span>
                  </TCell>
                  <TCell className="text-xs text-slate-600">{iter.constraintAdded}</TCell>
                  <TCell className="text-right font-mono text-sm">${iter.upperBound.toLocaleString()}</TCell>
                  <TCell className="text-right font-mono text-sm">${iter.lowerBound.toLocaleString()}</TCell>
                  <TCell className="text-right text-sm">
                    <span className={iter.gap <= 1 ? "text-green-600 font-semibold" : iter.gap <= 5 ? "text-amber-600" : "text-red-600"}>
                      {iter.gap.toFixed(1)}%
                    </span>
                  </TCell>
                  <TCell className="text-right text-sm">{iter.activeCuts}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-6">
        {/* UB/LB Convergence Chart */}
        <AnalysisCard title="Upper Bound vs. Lower Bound Convergence" badge="Gap Closure" insight="The upper bound (master LP relaxation) decreases while the lower bound (best integer solution) increases, converging to a 0.3% gap.">
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={BENDERS_ITERATIONS} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="iter" tick={axisTick} label={{ value: "Iteration", position: "bottom", offset: -2, fill: "#475569", fontSize: 12 }} />
              <YAxis tick={axisTick} domain={[19000, 25000]} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="upperBound" name="Upper Bound" fill={CHART_COLORS.red} fillOpacity={0.08} stroke={CHART_COLORS.red} strokeWidth={2} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="lowerBound" name="Lower Bound" fill={CHART_COLORS.green} fillOpacity={0.08} stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Gap Closure Chart */}
        <AnalysisCard title="Optimality Gap Closure" badge="18.4% to 0.3%" insight="Rapid gap reduction in early iterations (feasibility + first optimality cuts), with refinement in later iterations.">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={BENDERS_ITERATIONS} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="iter" tick={axisTick} label={{ value: "Iteration", position: "bottom", offset: -2, fill: "#475569", fontSize: 12 }} />
              <YAxis tick={axisTick} domain={[0, 20]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toFixed(1)}%`, "Gap"]} />
              <Area type="monotone" dataKey="gap" name="Optimality Gap" fill={CHART_COLORS.purple} fillOpacity={0.15} stroke={CHART_COLORS.purple} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.purple }} />
              <ReferenceLine y={1} stroke={CHART_COLORS.green} strokeDasharray="5 5" label={{ value: "1% threshold", fill: CHART_COLORS.green, fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* Cut Pool Analysis */}
      <AnalysisCard title="Cut Pool Analysis" badge="10 Active Cuts" insight="Of 12 total cuts generated, 10 remain active (binding) at the optimal solution. 2 cuts became redundant as the solution refined.">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <Metric value={12} label="Total Cuts Generated" color={CHART_COLORS.teal} />
          </div>
          <div className="text-center">
            <Metric value={10} label="Active (Binding) at Optimum" color={CHART_COLORS.green} />
          </div>
          <div className="text-center">
            <Metric value={2} label="Redundant (Non-Binding)" color={CHART_COLORS.orange} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-700 mb-1">Optimality Cuts: 10</h4>
            <p className="text-xs text-blue-600">Linear approximations of the nonlinear MNL revenue function. Each tightens the master problem upper bound.</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-amber-700 mb-1">Feasibility Cuts: 2</h4>
            <p className="text-xs text-amber-600">Eliminate SKU sets that violate space or brand constraints when evaluated in the subproblem.</p>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: PHASE 4 — Hierarchical Multi-Level
// ═══════════════════════════════════════════════════════════════

function Phase4Section() {
  // Build the solution tree data for C2
  const c2SolutionTree = [
    { level: "Cola (18ft)", brand: "Coca-Cola", space: "9ft", skus: "Classic 12oz (3f), Classic 2L (3f), Zero 12oz (2f), Diet 12oz (2f), Cherry 12oz (1f), Zero 2L (2f), Diet 2L (2f), Vanilla 12oz (1f)" },
    { level: "Cola (18ft)", brand: "Pepsi", space: "6.5ft", skus: "Original 12oz (3f), Original 2L (2f), Zero Sugar 12oz (2f), Diet 12oz (2f), Wild Cherry 12oz (1f), Diet 2L (1f), Zero Sugar 2L (2f)" },
    { level: "Cola (18ft)", brand: "RC Cola", space: "2.5ft", skus: "Original 12oz (2f), Original 2L (2f), Diet 12oz (1f)" },
    { level: "Lemon-Lime (8ft)", brand: "Sprite", space: "4.5ft", skus: "Original 12oz (2f), Original 2L (2f), Zero 12oz (2f), Lymonade 12oz (1f), Zero 2L (2f)" },
    { level: "Lemon-Lime (8ft)", brand: "7UP", space: "3.5ft", skus: "Original 12oz (2f), Original 2L (2f), Zero Sugar 12oz (1f), Cherry 12oz (2f)" },
    { level: "Orange (6ft)", brand: "Fanta", space: "6ft", skus: "Orange 12oz (3f), Orange 2L (2f), Grape 12oz (2f), Strawberry 12oz (2f), Pineapple 12oz (3f)" },
    { level: "Specialty (7ft)", brand: "Dr Pepper", space: "3.5ft", skus: "Original 12oz (2f), Original 2L (1f), Zero 12oz (2f), Cherry 12oz (1f), Cream Soda 12oz (1f)" },
    { level: "Specialty (7ft)", brand: "Mountain Dew", space: "3.5ft", skus: "Original 12oz (2f), Original 2L (1f), Zero 12oz (1f), Code Red 12oz (1f), Baja Blast 12oz (1f), Voltage 12oz (1f)" },
  ];

  const solveTimeComparison = [
    { method: "Flat MILP", time: 847, speedup: "1x" },
    { method: "Column Generation", time: 142, speedup: "6x" },
    { method: "Benders Decomposition", time: 238, speedup: "3.6x" },
    { method: "Hierarchical Multi-Level", time: 23, speedup: "37x" },
  ];

  const revenueComparison = [
    { cluster: "C1 Urban", flat: 4830, hierarchical: 4768, delta: -62, pctDiff: -1.3 },
    { cluster: "C2 Suburban", flat: 6458, hierarchical: 6392, delta: -66, pctDiff: -1.0 },
    { cluster: "C3 Premium", flat: 3648, hierarchical: 3612, delta: -36, pctDiff: -1.0 },
    { cluster: "C4 Rural", flat: 5635, hierarchical: 5617, delta: -18, pctDiff: -0.3 },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Hierarchical Multi-Level Decomposition" subtitle="Solve by CDT hierarchy: Category > Sub-category > Brand > SKU for 37x speed improvement" />

      {/* Methodology */}
      <AnalysisCard title="Hierarchical Decomposition Methodology" badge="3 Levels" insight="Decompose the assortment problem into layers matching the CDT hierarchy, solving each level independently with budget constraints propagated downward.">
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-teal-400">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Level 1: Category &rarr; Sub-category</h4>
            <p className="text-xs text-slate-600">Already solved by Space Allocation Optimizer. Allocates total shelf space to Cola, Lemon-Lime, Orange, Specialty.</p>
            <div className="mt-2 text-xs font-mono text-slate-500">Input: 29-39 ft total per cluster</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-400">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Level 2: Sub-category &rarr; Brand</h4>
            <p className="text-xs text-slate-600">Split each sub-category space among brands proportional to market share and MNL choice shares.</p>
            <div className="mt-2 text-xs font-mono text-slate-500">E.g., Cola 14ft &rarr; Coke 7ft, Pepsi 5ft, RC 2ft</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-purple-400">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Level 3: Brand &rarr; SKU + Facings</h4>
            <p className="text-xs text-slate-600">Within each brand allocation, select which SKUs to carry and how many facings, using MNL utility as the objective.</p>
            <div className="mt-2 text-xs font-mono text-slate-500">E.g., Coca-Cola 7ft &rarr; 6 SKUs, 14 facings</div>
          </div>
        </div>
      </AnalysisCard>

      {/* Level 2 Brand Allocation */}
      <AnalysisCard title="Level 2: Brand Space Allocation by Sub-Commodity" badge="All Clusters" insight="Space is allocated to brands within each sub-commodity based on market share, revenue contribution, and MNL-predicted demand.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cluster</TableHead>
              <TableHead>Sub-Commodity</TableHead>
              <TableHead className="text-right">Brand 1 (ft)</TableHead>
              <TableHead className="text-right">Brand 2 (ft)</TableHead>
              <TableHead className="text-right">Brand 3 (ft)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HIERARCHICAL_BRAND_ALLOC.map((a, i) => (
              <TableRow key={i}>
                <TCell className="font-medium text-sm">{a.cluster}</TCell>
                <TCell className="text-sm">{a.subCommodity}</TCell>
                <TCell className="text-right text-sm">
                  <span style={{ color: BRAND_COLORS[a.brand] || "#475569" }}>{a.brand}</span> {a.spaceFt}
                </TCell>
                <TCell className="text-right text-sm">
                  {a.brand2 ? <><span style={{ color: BRAND_COLORS[a.brand2] || "#475569" }}>{a.brand2}</span> {a.spaceFt2}</> : <span className="text-slate-300">-</span>}
                </TCell>
                <TCell className="text-right text-sm">
                  {a.brand3 ? <><span style={{ color: BRAND_COLORS[a.brand3] || "#475569" }}>{a.brand3}</span> {a.spaceFt3}</> : <span className="text-slate-300">-</span>}
                </TCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalysisCard>

      {/* Level 3 Solution Tree for C2 */}
      <AnalysisCard title="Level 3: SKU Selection & Facings — Cluster C2 (Suburban)" badge="243 Stores" insight="Full solution tree for C2 showing how each brand's space allocation is filled with specific SKUs and facing counts.">
        <div className="max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Sub-Commodity</TableHead>
                <TableHead className="w-[120px]">Brand</TableHead>
                <TableHead className="w-[60px] text-right">Space</TableHead>
                <TableHead>SKUs (facings)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c2SolutionTree.map((row, i) => (
                <TableRow key={i}>
                  <TCell className="text-sm font-medium">{row.level}</TCell>
                  <TCell>
                    <span className="text-sm" style={{ color: BRAND_COLORS[row.brand] }}>{row.brand}</span>
                  </TCell>
                  <TCell className="text-right text-sm font-mono">{row.space}</TCell>
                  <TCell className="text-xs text-slate-600">{row.skus}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-6">
        {/* Solve Time Comparison */}
        <AnalysisCard title="Solve Time Comparison" badge="37x Faster" insight="Hierarchical decomposition solves in 23 seconds vs. 847 seconds for flat MILP — a 37x speedup by exploiting problem structure.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={solveTimeComparison} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="method" tick={axisTick_sm} />
              <YAxis tick={axisTick} label={{ value: "Seconds", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}s`, "Solve Time"]} />
              <Bar dataKey="time" name="Solve Time (s)" radius={[4, 4, 0, 0]}>
                {solveTimeComparison.map((_, idx) => (
                  <Cell key={idx} fill={[CHART_COLORS.red, CHART_COLORS.teal, CHART_COLORS.blue, CHART_COLORS.purple][idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Revenue Comparison */}
        <AnalysisCard title="Revenue: Flat MILP vs. Hierarchical" badge="Per Cluster" insight="Hierarchical solution is within 0.3-1.3% of the flat MILP optimum across all clusters — a small price for 37x speed.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueComparison} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="cluster" tick={axisTick_sm} />
              <YAxis tick={axisTick} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} domain={[0, 7000]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
              <Bar dataKey="flat" name="Flat MILP" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
              <Bar dataKey="hierarchical" name="Hierarchical" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION: PHASE 5 — Comparison & Synthesis
// ═══════════════════════════════════════════════════════════════

function Phase5Section() {
  const vennData = [
    { name: "All 3 Methods", value: SKU_AGREEMENT.allThree, fill: CHART_COLORS.teal },
    { name: "ColGen + Benders Only", value: SKU_AGREEMENT.colGenAndBenders, fill: CHART_COLORS.blue },
    { name: "ColGen + Hier. Only", value: SKU_AGREEMENT.colGenAndHierarchical, fill: CHART_COLORS.purple },
    { name: "Benders Only", value: SKU_AGREEMENT.bendersOnly, fill: CHART_COLORS.orange },
  ].filter(d => d.value > 0);

  const recommendationData = [
    { scenario: "Medium pool (50-200 SKUs)", recommended: "Column Generation", reason: "Transparent iterations, warm-startable, good LP bounds", rating: 5 },
    { scenario: "Complex MNL / nonlinear demand", recommended: "Benders Decomposition", reason: "Handles nonlinearity naturally, proven optimality gap", rating: 5 },
    { scenario: "Large-scale (200+ SKUs, 50+ stores)", recommended: "Hierarchical Multi-Level", reason: "37x faster, scalable, aligns with org structure", rating: 5 },
    { scenario: "Real-time / interactive planning", recommended: "Hierarchical Multi-Level", reason: "23s solve time enables iterative what-if analysis", rating: 4 },
    { scenario: "Regulatory / audit requirement", recommended: "Benders Decomposition", reason: "Mathematically proven gap certificate", rating: 5 },
    { scenario: "Planogram generation", recommended: "Column Generation", reason: "Natural facing allocation from LP relaxation", rating: 4 },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Comparison & Synthesis" subtitle="Side-by-side evaluation of all three solver approaches with consensus assortment recommendation" />

      {/* Side-by-side comparison */}
      <AnalysisCard title="Solver Performance Comparison" badge="Head-to-Head" insight="All three methods converge to nearly identical objective values, but differ significantly in solve time and scalability.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-center">Column Generation</TableHead>
              <TableHead className="text-center">Benders Decomposition</TableHead>
              <TableHead className="text-center">Hierarchical Multi-Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TCell className="font-medium">Objective Value ($/wk)</TCell>
              <TCell className="text-center font-mono">${SOLVER_COMPARISON[0].objective.toLocaleString()}</TCell>
              <TCell className="text-center font-mono font-semibold text-green-700">${SOLVER_COMPARISON[1].objective.toLocaleString()}</TCell>
              <TCell className="text-center font-mono">${SOLVER_COMPARISON[2].objective.toLocaleString()}</TCell>
            </TableRow>
            <TableRow>
              <TCell className="font-medium">Solve Time (s)</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[0].solveTime}</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[1].solveTime}</TCell>
              <TCell className="text-center font-mono font-semibold text-green-700">{SOLVER_COMPARISON[2].solveTime}</TCell>
            </TableRow>
            <TableRow>
              <TCell className="font-medium">Optimality Gap</TCell>
              <TCell className="text-center">{SOLVER_COMPARISON[0].gap}%</TCell>
              <TCell className="text-center">{SOLVER_COMPARISON[1].gap}%</TCell>
              <TCell className="text-center">{SOLVER_COMPARISON[2].gap}%</TCell>
            </TableRow>
            <TableRow>
              <TCell className="font-medium"># Variables</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[0].variables}</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[1].variables}</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[2].variables}</TCell>
            </TableRow>
            <TableRow>
              <TCell className="font-medium"># Constraints</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[0].constraints}</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[1].constraints}</TCell>
              <TCell className="text-center font-mono">{SOLVER_COMPARISON[2].constraints}</TCell>
            </TableRow>
            <TableRow>
              <TCell className="font-medium">Scalability</TCell>
              <TCell className="text-center"><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium</Badge></TCell>
              <TCell className="text-center"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High</Badge></TCell>
              <TCell className="text-center"><Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Very High</Badge></TCell>
            </TableRow>
            <TableRow>
              <TCell className="font-medium">SKUs Selected</TCell>
              <TCell className="text-center font-mono">{SKU_AGREEMENT.totalColGen}</TCell>
              <TCell className="text-center font-mono">{SKU_AGREEMENT.totalBenders}</TCell>
              <TCell className="text-center font-mono">{SKU_AGREEMENT.totalHierarchical}</TCell>
            </TableRow>
          </TableBody>
        </Table>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue by Method & Cluster */}
        <AnalysisCard title="Revenue by Method & Cluster" badge="Grouped" insight="Revenue differences across methods are minimal (<1.5%), confirming that all three approaches find near-optimal solutions.">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={REVENUE_BY_METHOD_CLUSTER} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="cluster" tick={axisTick_sm} />
              <YAxis tick={axisTick} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
              <Bar dataKey="colGen" name="Column Generation" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} />
              <Bar dataKey="benders" name="Benders" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="hierarchical" name="Hierarchical" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* SKU Selection Agreement */}
        <AnalysisCard title="SKU Selection Agreement" badge="Venn Analysis" insight="35 of 44 SKUs are selected by all three methods. Only 3 SKUs differ, showing strong consensus.">
          <div className="flex flex-col items-center gap-4 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={vennData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                >
                  {vennData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 w-full text-xs">
              <div className="bg-teal-50 rounded p-2 text-center">
                <span className="font-bold text-teal-700 text-lg">{SKU_AGREEMENT.allThree}</span>
                <div className="text-teal-600">Common to all 3</div>
              </div>
              <div className="bg-blue-50 rounded p-2 text-center">
                <span className="font-bold text-blue-700 text-lg">{SKU_AGREEMENT.colGenAndBenders}</span>
                <div className="text-blue-600">ColGen + Benders only</div>
              </div>
              <div className="bg-purple-50 rounded p-2 text-center">
                <span className="font-bold text-purple-700 text-lg">{SKU_AGREEMENT.colGenAndHierarchical}</span>
                <div className="text-purple-600">ColGen + Hierarchical only</div>
              </div>
              <div className="bg-orange-50 rounded p-2 text-center">
                <span className="font-bold text-orange-700 text-lg">{SKU_AGREEMENT.bendersOnly}</span>
                <div className="text-orange-600">Benders only</div>
              </div>
            </div>
          </div>
        </AnalysisCard>
      </div>

      {/* Recommendation Table */}
      <AnalysisCard title="When to Use Each Solver" badge="Decision Guide" insight="Choose the solver based on problem size, required guarantees, and computational budget.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scenario</TableHead>
              <TableHead>Recommended Solver</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendationData.map((r, i) => (
              <TableRow key={i}>
                <TCell className="font-medium text-sm text-slate-700">{r.scenario}</TCell>
                <TCell>
                  <span className={`text-sm font-semibold ${r.recommended === "Column Generation" ? "text-teal-700" : r.recommended === "Benders Decomposition" ? "text-blue-700" : "text-purple-700"}`}>
                    {r.recommended}
                  </span>
                </TCell>
                <TCell className="text-xs text-slate-600">{r.reason}</TCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalysisCard>

      {/* Final Consensus Assortment */}
      <AnalysisCard title="Final Consensus Assortment Recommendation" badge="38 SKUs" insight="Consensus across all three solvers: 38 SKUs recommended for the assortment with cluster-specific facing allocations.">
        <div className="max-h-[420px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-center">Action</TableHead>
                <TableHead className="text-center">C1</TableHead>
                <TableHead className="text-center">C2</TableHead>
                <TableHead className="text-center">C3</TableHead>
                <TableHead className="text-center">C4</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FINAL_ASSORTMENT.map((row) => (
                <TableRow key={row.sku}>
                  <TCell className="text-xs font-medium">{row.sku}</TCell>
                  <TCell>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND_COLORS[row.brand] + "18", color: BRAND_COLORS[row.brand] }}>
                      {row.brand}
                    </span>
                  </TCell>
                  <TCell className="text-center"><StatusBadge status={row.action} /></TCell>
                  <TCell className="text-center text-sm font-mono">{row.facingsC1 || "-"}</TCell>
                  <TCell className="text-center text-sm font-mono">{row.facingsC2 || "-"}</TCell>
                  <TCell className="text-center text-sm font-mono">{row.facingsC3 || "-"}</TCell>
                  <TCell className="text-center text-sm font-mono">{row.facingsC4 || "-"}</TCell>
                  <TCell className="text-xs text-slate-600 max-w-[200px]">{row.reason}</TCell>
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SolverApproachesApp() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Solver Approaches — Assortment Optimization</h1>
            <p className="text-sm text-slate-500 mt-1">Column Generation · Benders Decomposition · Hierarchical Multi-Level</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Layer 2: Assortment</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Optimal = $20,524/wk</Badge>
            <Badge variant="outline" className="text-slate-500">44 SKUs · 4 Clusters · 760 Stores</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exploration">Data & Setup</TabsTrigger>
          <TabsTrigger value="colgen">Column Gen</TabsTrigger>
          <TabsTrigger value="benders">Benders</TabsTrigger>
          <TabsTrigger value="hierarchical">Hierarchical</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewSection /></TabsContent>
        <TabsContent value="exploration"><Phase1Section /></TabsContent>
        <TabsContent value="colgen"><Phase2Section /></TabsContent>
        <TabsContent value="benders"><Phase3Section /></TabsContent>
        <TabsContent value="hierarchical"><Phase4Section /></TabsContent>
        <TabsContent value="comparison"><Phase5Section /></TabsContent>
      </Tabs>
    </div>
  );
}
