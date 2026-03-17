"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ReferenceLine, Label,
  Treemap, ComposedChart, Area,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell as TCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ═══════════════════════════════════════════════════════════════
// SYNTHETIC DATA LAYER — Cola CSD synthetic data
// ═══════════════════════════════════════════════════════════════

const BRAND_COLORS: Record<string, string> = {
  "Coca-Cola": "#e53e3e",
  Pepsi: "#3182ce",
  "Dr Pepper": "#805ad5",
  "Mountain Dew": "#38a169",
  Sprite: "#48bb78",
  Fanta: "#ed8936",
  "7UP": "#4fd1c5",
  "RC Cola": "#d69e2e",
};

const SUB_COMMODITY_COLORS: Record<string, string> = {
  Cola: "#e53e3e",
  "Lemon-Lime": "#48bb78",
  Orange: "#ed8936",
  "Specialty/Other": "#9f7aea",
};

const CHART_COLORS = {
  teal: "#0d9488", tealLight: "#14b8a6", tealDark: "#0f766e",
  gold: "#b45309", orange: "#c2410c", pink: "#be185d",
  purple: "#7c3aed", red: "#dc2626", green: "#16a34a", blue: "#2563eb",
};

// ── Dataset schema (same as CDT/MNL apps) ──
const DATA_FILES = [
  { name: "transaction_data.csv", rows: 2595732, cols: 7, desc: "Purchase transactions", pk: "basket_id + product_id", fk: "household_key, product_id" },
  { name: "product.csv", rows: 92339, cols: 6, desc: "Product master", pk: "product_id", fk: "—" },
  { name: "hh_demographic.csv", rows: 2500, cols: 8, desc: "Household demographics", pk: "household_key", fk: "—" },
  { name: "causal_data.csv", rows: 3439210, cols: 5, desc: "Promotion/display flags", pk: "product_id + store_id + week_no", fk: "product_id" },
];

const BRAND_DATA = [
  { brand: "Coca-Cola", subCommodity: "Cola", revenue: 4850000, units: 3820000, households: 1875, penetration: 75.0, avgPrice: 1.27, repeatRate: 82.3, loyalty: 0.71, skuCount: 8, promoFreq: 0.28 },
  { brand: "Pepsi", subCommodity: "Cola", revenue: 3620000, units: 2940000, households: 1520, penetration: 60.8, avgPrice: 1.23, repeatRate: 76.1, loyalty: 0.64, skuCount: 7, promoFreq: 0.32 },
  { brand: "Dr Pepper", subCommodity: "Specialty/Other", revenue: 1980000, units: 1480000, households: 1180, penetration: 47.2, avgPrice: 1.34, repeatRate: 68.4, loyalty: 0.58, skuCount: 6, promoFreq: 0.22 },
  { brand: "Mountain Dew", subCommodity: "Specialty/Other", revenue: 1750000, units: 1350000, households: 1050, penetration: 42.0, avgPrice: 1.30, repeatRate: 64.2, loyalty: 0.52, skuCount: 6, promoFreq: 0.25 },
  { brand: "Sprite", subCommodity: "Lemon-Lime", revenue: 1420000, units: 1180000, households: 980, penetration: 39.2, avgPrice: 1.20, repeatRate: 61.5, loyalty: 0.48, skuCount: 5, promoFreq: 0.24 },
  { brand: "Fanta", subCommodity: "Orange", revenue: 920000, units: 720000, households: 680, penetration: 27.2, avgPrice: 1.28, repeatRate: 52.8, loyalty: 0.41, skuCount: 5, promoFreq: 0.18 },
  { brand: "7UP", subCommodity: "Lemon-Lime", revenue: 780000, units: 640000, households: 580, penetration: 23.2, avgPrice: 1.22, repeatRate: 48.3, loyalty: 0.38, skuCount: 4, promoFreq: 0.20 },
  { brand: "RC Cola", subCommodity: "Cola", revenue: 380000, units: 320000, households: 340, penetration: 13.6, avgPrice: 1.19, repeatRate: 38.7, loyalty: 0.29, skuCount: 3, promoFreq: 0.15 },
];

// ── Full SKU catalog with optimization attributes ──
const SKU_CATALOG = [
  // Cola - Coca-Cola
  { id: 1, sku: "Coca-Cola Classic 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Regular", price: 1.29, cost: 0.82, margin: 0.47, marginPct: 36.4, promoPrice: 0.99, promoPct: 0.28, facings: 4, weeklyUnits: 892, weeklyRevenue: 1150.68, choiceProb: 0.142, utility: 2.18, mnlRank: 1, spaceElast: 0.18, mustCarry: true, priceTier: "Mid" },
  { id: 2, sku: "Coca-Cola Classic 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", variant: "Regular", price: 2.49, cost: 1.62, margin: 0.87, marginPct: 34.9, promoPrice: 1.99, promoPct: 0.22, facings: 3, weeklyUnits: 534, weeklyRevenue: 1329.66, choiceProb: 0.085, utility: 1.72, mnlRank: 4, spaceElast: 0.15, mustCarry: true, priceTier: "Premium" },
  { id: 3, sku: "Coca-Cola Zero 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.29, cost: 0.84, margin: 0.45, marginPct: 34.9, promoPrice: 0.99, promoPct: 0.25, facings: 3, weeklyUnits: 612, weeklyRevenue: 789.48, choiceProb: 0.097, utility: 1.89, mnlRank: 3, spaceElast: 0.20, mustCarry: true, priceTier: "Mid" },
  { id: 4, sku: "Coca-Cola Zero 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.49, cost: 1.65, margin: 0.84, marginPct: 33.7, promoPrice: 1.99, promoPct: 0.18, facings: 2, weeklyUnits: 298, weeklyRevenue: 742.02, choiceProb: 0.047, utility: 1.31, mnlRank: 10, spaceElast: 0.12, mustCarry: false, priceTier: "Premium" },
  { id: 5, sku: "Coca-Cola Diet 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.29, cost: 0.83, margin: 0.46, marginPct: 35.7, promoPrice: 0.99, promoPct: 0.24, facings: 3, weeklyUnits: 578, weeklyRevenue: 745.62, choiceProb: 0.092, utility: 1.84, mnlRank: 5, spaceElast: 0.19, mustCarry: false, priceTier: "Mid" },
  { id: 6, sku: "Coca-Cola Diet 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.49, cost: 1.64, margin: 0.85, marginPct: 34.1, promoPrice: 1.99, promoPct: 0.16, facings: 2, weeklyUnits: 245, weeklyRevenue: 610.05, choiceProb: 0.039, utility: 1.18, mnlRank: 14, spaceElast: 0.11, mustCarry: false, priceTier: "Premium" },
  { id: 7, sku: "Coca-Cola Cherry 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Flavored", price: 1.39, cost: 0.89, margin: 0.50, marginPct: 36.0, promoPrice: 1.09, promoPct: 0.15, facings: 2, weeklyUnits: 189, weeklyRevenue: 262.71, choiceProb: 0.030, utility: 0.92, mnlRank: 22, spaceElast: 0.14, mustCarry: false, priceTier: "Mid" },
  { id: 8, sku: "Coca-Cola Vanilla 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Flavored", price: 1.39, cost: 0.91, margin: 0.48, marginPct: 34.5, promoPrice: 1.09, promoPct: 0.12, facings: 1, weeklyUnits: 142, weeklyRevenue: 197.38, choiceProb: 0.023, utility: 0.71, mnlRank: 28, spaceElast: 0.08, mustCarry: false, priceTier: "Mid" },
  // Cola - Pepsi
  { id: 9, sku: "Pepsi Original 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Regular", price: 1.25, cost: 0.78, margin: 0.47, marginPct: 37.6, promoPrice: 0.89, promoPct: 0.32, facings: 4, weeklyUnits: 756, weeklyRevenue: 945.00, choiceProb: 0.120, utility: 2.04, mnlRank: 2, spaceElast: 0.19, mustCarry: true, priceTier: "Mid" },
  { id: 10, sku: "Pepsi Original 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", variant: "Regular", price: 2.39, cost: 1.55, margin: 0.84, marginPct: 35.1, promoPrice: 1.89, promoPct: 0.28, facings: 3, weeklyUnits: 489, weeklyRevenue: 1168.71, choiceProb: 0.078, utility: 1.65, mnlRank: 6, spaceElast: 0.16, mustCarry: true, priceTier: "Premium" },
  { id: 11, sku: "Pepsi Zero Sugar 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.25, cost: 0.80, margin: 0.45, marginPct: 36.0, promoPrice: 0.89, promoPct: 0.30, facings: 3, weeklyUnits: 423, weeklyRevenue: 528.75, choiceProb: 0.067, utility: 1.52, mnlRank: 7, spaceElast: 0.17, mustCarry: false, priceTier: "Mid" },
  { id: 12, sku: "Pepsi Zero Sugar 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.39, cost: 1.56, margin: 0.83, marginPct: 34.7, promoPrice: 1.89, promoPct: 0.20, facings: 2, weeklyUnits: 234, weeklyRevenue: 559.26, choiceProb: 0.037, utility: 1.12, mnlRank: 15, spaceElast: 0.13, mustCarry: false, priceTier: "Premium" },
  { id: 13, sku: "Pepsi Diet 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.25, cost: 0.79, margin: 0.46, marginPct: 36.8, promoPrice: 0.89, promoPct: 0.26, facings: 2, weeklyUnits: 389, weeklyRevenue: 486.25, choiceProb: 0.062, utility: 1.44, mnlRank: 8, spaceElast: 0.16, mustCarry: false, priceTier: "Mid" },
  { id: 14, sku: "Pepsi Diet 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.39, cost: 1.58, margin: 0.81, marginPct: 33.9, promoPrice: 1.89, promoPct: 0.18, facings: 1, weeklyUnits: 178, weeklyRevenue: 425.42, choiceProb: 0.028, utility: 0.98, mnlRank: 20, spaceElast: 0.10, mustCarry: false, priceTier: "Premium" },
  { id: 15, sku: "Pepsi Wild Cherry 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Flavored", price: 1.35, cost: 0.86, margin: 0.49, marginPct: 36.3, promoPrice: 0.99, promoPct: 0.18, facings: 2, weeklyUnits: 201, weeklyRevenue: 271.35, choiceProb: 0.032, utility: 0.96, mnlRank: 21, spaceElast: 0.13, mustCarry: false, priceTier: "Mid" },
  // Cola - RC Cola
  { id: 16, sku: "RC Cola Original 12oz", brand: "RC Cola", subCommodity: "Cola", size: "12oz", variant: "Regular", price: 1.09, cost: 0.65, margin: 0.44, marginPct: 40.4, promoPrice: 0.79, promoPct: 0.15, facings: 2, weeklyUnits: 156, weeklyRevenue: 170.04, choiceProb: 0.025, utility: 0.68, mnlRank: 29, spaceElast: 0.09, mustCarry: false, priceTier: "Value" },
  { id: 17, sku: "RC Cola Original 2L", brand: "RC Cola", subCommodity: "Cola", size: "2L", variant: "Regular", price: 1.99, cost: 1.22, margin: 0.77, marginPct: 38.7, promoPrice: 1.49, promoPct: 0.12, facings: 1, weeklyUnits: 98, weeklyRevenue: 195.02, choiceProb: 0.016, utility: 0.42, mnlRank: 36, spaceElast: 0.07, mustCarry: false, priceTier: "Value" },
  { id: 18, sku: "RC Cola Diet 12oz", brand: "RC Cola", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.09, cost: 0.67, margin: 0.42, marginPct: 38.5, promoPrice: 0.79, promoPct: 0.10, facings: 1, weeklyUnits: 67, weeklyRevenue: 73.03, choiceProb: 0.011, utility: 0.18, mnlRank: 43, spaceElast: 0.05, mustCarry: false, priceTier: "Value" },
  // Lemon-Lime - Sprite
  { id: 19, sku: "Sprite Original 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", variant: "Regular", price: 1.19, cost: 0.74, margin: 0.45, marginPct: 37.8, promoPrice: 0.89, promoPct: 0.24, facings: 3, weeklyUnits: 412, weeklyRevenue: 490.28, choiceProb: 0.066, utility: 1.48, mnlRank: 9, spaceElast: 0.18, mustCarry: true, priceTier: "Mid" },
  { id: 20, sku: "Sprite Original 2L", brand: "Sprite", subCommodity: "Lemon-Lime", size: "2L", variant: "Regular", price: 2.29, cost: 1.48, margin: 0.81, marginPct: 35.4, promoPrice: 1.79, promoPct: 0.20, facings: 2, weeklyUnits: 267, weeklyRevenue: 611.43, choiceProb: 0.042, utility: 1.22, mnlRank: 12, spaceElast: 0.14, mustCarry: false, priceTier: "Premium" },
  { id: 21, sku: "Sprite Zero 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", variant: "Zero/Diet", price: 1.19, cost: 0.76, margin: 0.43, marginPct: 36.1, promoPrice: 0.89, promoPct: 0.18, facings: 2, weeklyUnits: 198, weeklyRevenue: 235.62, choiceProb: 0.031, utility: 0.94, mnlRank: 23, spaceElast: 0.13, mustCarry: false, priceTier: "Mid" },
  { id: 22, sku: "Sprite Zero 2L", brand: "Sprite", subCommodity: "Lemon-Lime", size: "2L", variant: "Zero/Diet", price: 2.29, cost: 1.50, margin: 0.79, marginPct: 34.5, promoPrice: 1.79, promoPct: 0.14, facings: 1, weeklyUnits: 134, weeklyRevenue: 306.86, choiceProb: 0.021, utility: 0.72, mnlRank: 27, spaceElast: 0.09, mustCarry: false, priceTier: "Premium" },
  { id: 23, sku: "Sprite Lymonade 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", variant: "Flavored", price: 1.39, cost: 0.92, margin: 0.47, marginPct: 33.8, promoPrice: 1.09, promoPct: 0.16, facings: 1, weeklyUnits: 112, weeklyRevenue: 155.68, choiceProb: 0.018, utility: 0.58, mnlRank: 32, spaceElast: 0.08, mustCarry: false, priceTier: "Mid" },
  // Lemon-Lime - 7UP
  { id: 24, sku: "7UP Original 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", variant: "Regular", price: 1.15, cost: 0.71, margin: 0.44, marginPct: 38.3, promoPrice: 0.85, promoPct: 0.20, facings: 2, weeklyUnits: 234, weeklyRevenue: 269.10, choiceProb: 0.037, utility: 1.12, mnlRank: 16, spaceElast: 0.15, mustCarry: false, priceTier: "Value" },
  { id: 25, sku: "7UP Original 2L", brand: "7UP", subCommodity: "Lemon-Lime", size: "2L", variant: "Regular", price: 2.19, cost: 1.42, margin: 0.77, marginPct: 35.2, promoPrice: 1.69, promoPct: 0.18, facings: 2, weeklyUnits: 178, weeklyRevenue: 389.82, choiceProb: 0.028, utility: 0.92, mnlRank: 24, spaceElast: 0.11, mustCarry: false, priceTier: "Premium" },
  { id: 26, sku: "7UP Zero Sugar 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", variant: "Zero/Diet", price: 1.15, cost: 0.73, margin: 0.42, marginPct: 36.5, promoPrice: 0.85, promoPct: 0.14, facings: 1, weeklyUnits: 112, weeklyRevenue: 128.80, choiceProb: 0.018, utility: 0.58, mnlRank: 33, spaceElast: 0.09, mustCarry: false, priceTier: "Value" },
  { id: 27, sku: "7UP Cherry 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", variant: "Flavored", price: 1.29, cost: 0.84, margin: 0.45, marginPct: 34.9, promoPrice: 0.99, promoPct: 0.12, facings: 1, weeklyUnits: 89, weeklyRevenue: 114.81, choiceProb: 0.014, utility: 0.44, mnlRank: 35, spaceElast: 0.07, mustCarry: false, priceTier: "Mid" },
  // Orange - Fanta
  { id: 28, sku: "Fanta Orange 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Regular", price: 1.25, cost: 0.78, margin: 0.47, marginPct: 37.6, promoPrice: 0.95, promoPct: 0.18, facings: 2, weeklyUnits: 245, weeklyRevenue: 306.25, choiceProb: 0.039, utility: 1.18, mnlRank: 13, spaceElast: 0.16, mustCarry: true, priceTier: "Mid" },
  { id: 29, sku: "Fanta Orange 2L", brand: "Fanta", subCommodity: "Orange", size: "2L", variant: "Regular", price: 2.29, cost: 1.49, margin: 0.80, marginPct: 34.9, promoPrice: 1.79, promoPct: 0.15, facings: 2, weeklyUnits: 167, weeklyRevenue: 382.43, choiceProb: 0.027, utility: 0.88, mnlRank: 25, spaceElast: 0.12, mustCarry: false, priceTier: "Premium" },
  { id: 30, sku: "Fanta Grape 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Flavored", price: 1.29, cost: 0.82, margin: 0.47, marginPct: 36.4, promoPrice: 0.99, promoPct: 0.14, facings: 1, weeklyUnits: 134, weeklyRevenue: 172.86, choiceProb: 0.021, utility: 0.72, mnlRank: 26, spaceElast: 0.10, mustCarry: false, priceTier: "Mid" },
  { id: 31, sku: "Fanta Strawberry 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Flavored", price: 1.29, cost: 0.83, margin: 0.46, marginPct: 35.7, promoPrice: 0.99, promoPct: 0.12, facings: 1, weeklyUnits: 98, weeklyRevenue: 126.42, choiceProb: 0.016, utility: 0.52, mnlRank: 34, spaceElast: 0.08, mustCarry: false, priceTier: "Mid" },
  { id: 32, sku: "Fanta Pineapple 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Flavored", price: 1.29, cost: 0.84, margin: 0.45, marginPct: 34.9, promoPrice: 0.99, promoPct: 0.10, facings: 1, weeklyUnits: 78, weeklyRevenue: 100.62, choiceProb: 0.012, utility: 0.38, mnlRank: 37, spaceElast: 0.06, mustCarry: false, priceTier: "Mid" },
  // Specialty - Dr Pepper
  { id: 33, sku: "Dr Pepper Original 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Regular", price: 1.35, cost: 0.85, margin: 0.50, marginPct: 37.0, promoPrice: 0.99, promoPct: 0.22, facings: 3, weeklyUnits: 412, weeklyRevenue: 556.20, choiceProb: 0.066, utility: 1.48, mnlRank: 9, spaceElast: 0.17, mustCarry: true, priceTier: "Mid" },
  { id: 34, sku: "Dr Pepper Original 2L", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "2L", variant: "Regular", price: 2.59, cost: 1.68, margin: 0.91, marginPct: 35.1, promoPrice: 1.99, promoPct: 0.18, facings: 2, weeklyUnits: 278, weeklyRevenue: 720.02, choiceProb: 0.044, utility: 1.28, mnlRank: 11, spaceElast: 0.14, mustCarry: false, priceTier: "Premium" },
  { id: 35, sku: "Dr Pepper Zero 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Zero/Diet", price: 1.35, cost: 0.87, margin: 0.48, marginPct: 35.6, promoPrice: 0.99, promoPct: 0.20, facings: 2, weeklyUnits: 298, weeklyRevenue: 402.30, choiceProb: 0.047, utility: 1.31, mnlRank: 10, spaceElast: 0.16, mustCarry: false, priceTier: "Mid" },
  { id: 36, sku: "Dr Pepper Zero 2L", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "2L", variant: "Zero/Diet", price: 2.59, cost: 1.70, margin: 0.89, marginPct: 34.4, promoPrice: 1.99, promoPct: 0.14, facings: 1, weeklyUnits: 156, weeklyRevenue: 404.04, choiceProb: 0.025, utility: 0.88, mnlRank: 25, spaceElast: 0.10, mustCarry: false, priceTier: "Premium" },
  { id: 37, sku: "Dr Pepper Cherry 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.39, cost: 0.90, margin: 0.49, marginPct: 35.3, promoPrice: 1.09, promoPct: 0.14, facings: 1, weeklyUnits: 167, weeklyRevenue: 232.13, choiceProb: 0.027, utility: 0.82, mnlRank: 26, spaceElast: 0.11, mustCarry: false, priceTier: "Mid" },
  { id: 38, sku: "Dr Pepper Cream Soda 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.39, cost: 0.91, margin: 0.48, marginPct: 34.5, promoPrice: 1.09, promoPct: 0.12, facings: 1, weeklyUnits: 134, weeklyRevenue: 186.26, choiceProb: 0.021, utility: 0.68, mnlRank: 30, spaceElast: 0.09, mustCarry: false, priceTier: "Mid" },
  // Specialty - Mountain Dew
  { id: 39, sku: "Mountain Dew Original 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Regular", price: 1.29, cost: 0.81, margin: 0.48, marginPct: 37.2, promoPrice: 0.95, promoPct: 0.25, facings: 3, weeklyUnits: 378, weeklyRevenue: 487.62, choiceProb: 0.060, utility: 1.44, mnlRank: 8, spaceElast: 0.17, mustCarry: true, priceTier: "Mid" },
  { id: 40, sku: "Mountain Dew Original 2L", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "2L", variant: "Regular", price: 2.49, cost: 1.60, margin: 0.89, marginPct: 35.7, promoPrice: 1.89, promoPct: 0.20, facings: 2, weeklyUnits: 245, weeklyRevenue: 610.05, choiceProb: 0.039, utility: 1.18, mnlRank: 14, spaceElast: 0.13, mustCarry: false, priceTier: "Premium" },
  { id: 41, sku: "Mountain Dew Zero 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Zero/Diet", price: 1.29, cost: 0.83, margin: 0.46, marginPct: 35.7, promoPrice: 0.95, promoPct: 0.18, facings: 2, weeklyUnits: 189, weeklyRevenue: 243.81, choiceProb: 0.030, utility: 0.92, mnlRank: 22, spaceElast: 0.12, mustCarry: false, priceTier: "Mid" },
  { id: 42, sku: "Mountain Dew Code Red 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.35, cost: 0.87, margin: 0.48, marginPct: 35.6, promoPrice: 1.05, promoPct: 0.16, facings: 1, weeklyUnits: 156, weeklyRevenue: 210.60, choiceProb: 0.025, utility: 0.78, mnlRank: 27, spaceElast: 0.10, mustCarry: false, priceTier: "Mid" },
  { id: 43, sku: "Mountain Dew Baja Blast 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.39, cost: 0.90, margin: 0.49, marginPct: 35.3, promoPrice: 1.09, promoPct: 0.14, facings: 1, weeklyUnits: 134, weeklyRevenue: 186.26, choiceProb: 0.021, utility: 0.68, mnlRank: 30, spaceElast: 0.09, mustCarry: false, priceTier: "Mid" },
  { id: 44, sku: "Mountain Dew Voltage 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.35, cost: 0.88, margin: 0.47, marginPct: 34.8, promoPrice: 1.05, promoPct: 0.12, facings: 1, weeklyUnits: 98, weeklyRevenue: 132.30, choiceProb: 0.016, utility: 0.52, mnlRank: 34, spaceElast: 0.07, mustCarry: false, priceTier: "Mid" },
];

// ── Optimization constraints ──
const CONSTRAINTS = {
  totalFacings: 72,       // total shelf facings available
  minBrands: 6,           // at least 6 of 8 brands
  maxSkusPerBrand: 6,     // no brand gets >6 SKUs
  minSkusPerBrand: 1,     // every included brand has ≥1 SKU
  mustCarryCount: 8,      // fixed must-carry items
  minValueTier: 3,        // at least 3 Value-tier SKUs
  minPremiumTier: 6,      // at least 6 Premium-tier SKUs
  minDietVariant: 6,      // at least 6 Zero/Diet variant SKUs
  maxFacingsPerSku: 5,    // no single SKU >5 facings
  minFacingsPerSku: 1,    // selected SKU gets ≥1 facing
};

// ── Greedy algorithm: step-by-step trace ──
const GREEDY_STEPS = [
  { step: 1, sku: "Coca-Cola Classic 12oz", metric: "Revenue/Facing", value: 287.67, cumRevenue: 1150.68, cumFacings: 4, cumSKUs: 1, reason: "Must-carry: highest choice probability (14.2%)" },
  { step: 2, sku: "Pepsi Original 12oz", metric: "Revenue/Facing", value: 236.25, cumRevenue: 2095.68, cumFacings: 8, cumSKUs: 2, reason: "Must-carry: #2 brand, strong promo lift" },
  { step: 3, sku: "Coca-Cola Classic 2L", metric: "Revenue/Facing", value: 443.22, cumRevenue: 3425.34, cumFacings: 11, cumSKUs: 3, reason: "Must-carry: highest margin per unit ($0.87)" },
  { step: 4, sku: "Pepsi Original 2L", metric: "Revenue/Facing", value: 389.57, cumRevenue: 4594.05, cumFacings: 14, cumSKUs: 4, reason: "Must-carry: 2L size coverage for Pepsi" },
  { step: 5, sku: "Coca-Cola Zero 12oz", metric: "Revenue/Facing", value: 263.16, cumRevenue: 5383.53, cumFacings: 17, cumSKUs: 5, reason: "Must-carry: rising Zero/Diet trend" },
  { step: 6, sku: "Dr Pepper Original 12oz", metric: "Revenue/Facing", value: 185.40, cumRevenue: 5939.73, cumFacings: 20, cumSKUs: 6, reason: "Must-carry: unique flavor niche, low substitution" },
  { step: 7, sku: "Mountain Dew Original 12oz", metric: "Revenue/Facing", value: 162.54, cumRevenue: 6427.35, cumFacings: 23, cumSKUs: 7, reason: "Must-carry: 4th largest brand, youth segment" },
  { step: 8, sku: "Sprite Original 12oz", metric: "Revenue/Facing", value: 163.43, cumRevenue: 6917.63, cumFacings: 26, cumSKUs: 8, reason: "Must-carry: Lemon-Lime anchor" },
  { step: 9, sku: "Fanta Orange 12oz", metric: "Revenue/Facing", value: 153.13, cumRevenue: 7223.88, cumFacings: 28, cumSKUs: 9, reason: "Orange sub-commodity anchor, 16% space elasticity" },
  { step: 10, sku: "Dr Pepper Original 2L", metric: "Revenue/Facing", value: 360.01, cumRevenue: 7943.90, cumFacings: 30, cumSKUs: 10, reason: "Highest rev/facing among remaining (2L margin)" },
  { step: 11, sku: "Pepsi Zero Sugar 12oz", metric: "Revenue/Facing", value: 176.25, cumRevenue: 8472.65, cumFacings: 33, cumSKUs: 11, reason: "Diet constraint: need ≥6 Zero/Diet SKUs" },
  { step: 12, sku: "Dr Pepper Zero 12oz", metric: "Revenue/Facing", value: 201.15, cumRevenue: 8874.95, cumFacings: 35, cumSKUs: 12, reason: "Diet constraint + high utility (1.31)" },
  { step: 13, sku: "Mountain Dew Original 2L", metric: "Revenue/Facing", value: 305.03, cumRevenue: 9484.99, cumFacings: 37, cumSKUs: 13, reason: "2L coverage for Mountain Dew, strong margin" },
  { step: 14, sku: "Coca-Cola Diet 12oz", metric: "Revenue/Facing", value: 248.54, cumRevenue: 10230.61, cumFacings: 40, cumSKUs: 14, reason: "Diet constraint: 5th diet/zero SKU" },
  { step: 15, sku: "Sprite Original 2L", metric: "Revenue/Facing", value: 305.72, cumRevenue: 10842.04, cumFacings: 42, cumSKUs: 15, reason: "2L coverage + high margin ($0.81)" },
  { step: 16, sku: "Fanta Orange 2L", metric: "Revenue/Facing", value: 191.22, cumRevenue: 11224.47, cumFacings: 44, cumSKUs: 16, reason: "Orange 2L coverage, fills price tier" },
  { step: 17, sku: "Pepsi Diet 12oz", metric: "Revenue/Facing", value: 243.13, cumRevenue: 11710.72, cumFacings: 46, cumSKUs: 17, reason: "Diet constraint: 6th diet/zero (constraint met)" },
  { step: 18, sku: "7UP Original 12oz", metric: "Revenue/Facing", value: 134.55, cumRevenue: 11979.82, cumFacings: 48, cumSKUs: 18, reason: "Brand diversity: 7UP is brand #7 (need ≥6)" },
  { step: 19, sku: "RC Cola Original 12oz", metric: "Revenue/Facing", value: 85.02, cumRevenue: 12149.86, cumFacings: 50, cumSKUs: 19, reason: "Value tier: RC is only Value-priced brand" },
  { step: 20, sku: "Mountain Dew Zero 12oz", metric: "Revenue/Facing", value: 121.91, cumRevenue: 12393.67, cumFacings: 52, cumSKUs: 20, reason: "Incremental diet coverage, youth segment" },
  { step: 21, sku: "Coca-Cola Zero 2L", metric: "Revenue/Facing", value: 371.01, cumRevenue: 13135.69, cumFacings: 54, cumSKUs: 21, reason: "Strong margin ($0.84), fills Zero 2L slot" },
  { step: 22, sku: "Sprite Zero 12oz", metric: "Revenue/Facing", value: 117.81, cumRevenue: 13371.31, cumFacings: 56, cumSKUs: 22, reason: "Lemon-Lime diet coverage" },
  { step: 23, sku: "Pepsi Wild Cherry 12oz", metric: "Revenue/Facing", value: 135.68, cumRevenue: 13642.66, cumFacings: 58, cumSKUs: 23, reason: "Flavored variety, moderate demand" },
  { step: 24, sku: "Dr Pepper Cherry 12oz", metric: "Revenue/Facing", value: 232.13, cumRevenue: 13874.79, cumFacings: 59, cumSKUs: 24, reason: "Flavored niche demand, low cannibalization" },
  { step: 25, sku: "Fanta Grape 12oz", metric: "Revenue/Facing", value: 172.86, cumRevenue: 14047.65, cumFacings: 60, cumSKUs: 25, reason: "Orange sub-commodity depth" },
  { step: 26, sku: "Coca-Cola Cherry 12oz", metric: "Revenue/Facing", value: 131.36, cumRevenue: 14310.36, cumFacings: 62, cumSKUs: 26, reason: "Flavored top-up for Coca-Cola portfolio" },
  { step: 27, sku: "7UP Original 2L", metric: "Revenue/Facing", value: 194.91, cumRevenue: 14700.18, cumFacings: 64, cumSKUs: 27, reason: "7UP 2L coverage, margin capture" },
  { step: 28, sku: "Mountain Dew Code Red 12oz", metric: "Revenue/Facing", value: 210.60, cumRevenue: 14910.78, cumFacings: 65, cumSKUs: 28, reason: "Flavored variety for Mountain Dew" },
  { step: 29, sku: "Coca-Cola Diet 2L", metric: "Revenue/Facing", value: 305.03, cumRevenue: 15520.83, cumFacings: 67, cumSKUs: 29, reason: "2L diet coverage, margin" },
  { step: 30, sku: "Dr Pepper Cream Soda 12oz", metric: "Revenue/Facing", value: 186.26, cumRevenue: 15707.09, cumFacings: 68, cumSKUs: 30, reason: "Fills last Dr Pepper slot (6 max)" },
];

// ── MILP solution (optimal vs greedy) ──
const MILP_SOLUTION = {
  selectedSKUs: 28,
  totalFacings: 72,
  weeklyRevenue: 15242.86,
  weeklyMargin: 5612.40,
  greedyRevenue: 15707.09,
  greedyMargin: 5480.12,
  milpRevenue: 15842.36,
  milpMargin: 5812.40,
  milpImprovement: 0.86,
  marginImprovement: 6.06,
  solveTime: "0.34s",
  gap: "0.00%",
  status: "Optimal",
  iterations: 847,
};

// ── MILP vs Greedy comparison by SKU ──
const SOLUTION_COMPARISON = [
  { sku: "Coca-Cola Classic 12oz", greedy: 4, milp: 4, diff: 0, note: "Same — must-carry anchor" },
  { sku: "Coca-Cola Classic 2L", greedy: 3, milp: 3, diff: 0, note: "Same" },
  { sku: "Coca-Cola Zero 12oz", greedy: 3, milp: 4, diff: 1, note: "MILP adds facing — high space elasticity (0.20)" },
  { sku: "Coca-Cola Diet 12oz", greedy: 3, milp: 2, diff: -1, note: "MILP reallocates to Zero" },
  { sku: "Coca-Cola Zero 2L", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Coca-Cola Cherry 12oz", greedy: 2, milp: 1, diff: -1, note: "MILP reduces — low space elasticity" },
  { sku: "Coca-Cola Vanilla 12oz", greedy: 0, milp: 0, diff: 0, note: "Both exclude — lowest utility" },
  { sku: "Pepsi Original 12oz", greedy: 4, milp: 4, diff: 0, note: "Same — must-carry" },
  { sku: "Pepsi Original 2L", greedy: 3, milp: 3, diff: 0, note: "Same" },
  { sku: "Pepsi Zero Sugar 12oz", greedy: 3, milp: 3, diff: 0, note: "Same" },
  { sku: "Pepsi Diet 12oz", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Pepsi Wild Cherry 12oz", greedy: 2, milp: 1, diff: -1, note: "MILP reduces — low incremental value" },
  { sku: "Pepsi Diet 2L", greedy: 0, milp: 1, diff: 1, note: "MILP adds — fills Premium tier gap" },
  { sku: "Dr Pepper Original 12oz", greedy: 3, milp: 3, diff: 0, note: "Same — must-carry" },
  { sku: "Dr Pepper Original 2L", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Dr Pepper Zero 12oz", greedy: 2, milp: 3, diff: 1, note: "MILP adds facing — underserved diet niche" },
  { sku: "Dr Pepper Cherry 12oz", greedy: 1, milp: 1, diff: 0, note: "Same" },
  { sku: "Dr Pepper Cream Soda 12oz", greedy: 1, milp: 0, diff: -1, note: "MILP drops — reallocates to Dr Pepper Zero" },
  { sku: "Mountain Dew Original 12oz", greedy: 3, milp: 3, diff: 0, note: "Same — must-carry" },
  { sku: "Mountain Dew Original 2L", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Mountain Dew Zero 12oz", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Mountain Dew Code Red 12oz", greedy: 1, milp: 1, diff: 0, note: "Same" },
  { sku: "Sprite Original 12oz", greedy: 3, milp: 3, diff: 0, note: "Same — must-carry" },
  { sku: "Sprite Original 2L", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Sprite Zero 12oz", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Fanta Orange 12oz", greedy: 2, milp: 3, diff: 1, note: "MILP adds — high space elasticity (0.16)" },
  { sku: "Fanta Orange 2L", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "Fanta Grape 12oz", greedy: 1, milp: 1, diff: 0, note: "Same" },
  { sku: "7UP Original 12oz", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "7UP Original 2L", greedy: 2, milp: 2, diff: 0, note: "Same" },
  { sku: "RC Cola Original 12oz", greedy: 2, milp: 2, diff: 0, note: "Same — Value tier" },
];

// ── Sensitivity analysis ──
const SENSITIVITY_DATA = [
  { param: "Shelf Space +8 facings (72→80)", milpRevenue: 16428.50, milpMargin: 6142.80, revChange: 3.7, marginChange: 5.7, skusAdded: "Coca-Cola Vanilla 12oz, Fanta Strawberry 12oz" },
  { param: "Shelf Space −8 facings (72→64)", milpRevenue: 14892.10, milpMargin: 5384.20, revChange: -6.0, marginChange: -7.4, skusDropped: "7UP Original 2L, Fanta Grape 12oz" },
  { param: "Must-Carry relaxed (8→5)", milpRevenue: 16012.40, milpMargin: 5924.60, revChange: 1.1, marginChange: 1.9, note: "Drops RC Cola, adds Pepsi Diet 2L" },
  { param: "Max 4 SKUs per brand", milpRevenue: 14628.80, milpMargin: 5286.40, revChange: -7.7, marginChange: -9.1, note: "Drops 6 tail SKUs across Coca-Cola, Dr Pepper" },
  { param: "Min 8 Diet/Zero SKUs", milpRevenue: 15624.20, milpMargin: 5718.80, revChange: -1.4, marginChange: -1.6, note: "Adds 7UP Zero, drops Mountain Dew Code Red" },
  { param: "Revenue objective → Margin", milpRevenue: 15128.40, milpMargin: 5982.60, revChange: -4.5, marginChange: 2.9, note: "Shifts facings to 2L sizes (higher unit margin)" },
];

// ── What-if scenarios ──
const WHATIF_SCENARIOS = [
  { scenario: "Coca-Cola +10% price increase", revenueImpact: -842, marginImpact: +312, skuChanges: "Pepsi Original gains +1 facing, Coca-Cola Classic loses −1", substitutionTo: "Pepsi Original 12oz (+3.2%), RC Cola (+1.8%)" },
  { scenario: "Pepsi launches new Mango flavor", revenueImpact: +186, marginImpact: +72, skuChanges: "New SKU at 1 facing, Mountain Dew Voltage dropped", substitutionTo: "Cannibals Pepsi Original (−1.2%), grows category (+0.4%)" },
  { scenario: "RC Cola exits market", revenueImpact: -98, marginImpact: -28, skuChanges: "2 facings freed → Coca-Cola Zero +1, 7UP Original +1", substitutionTo: "42% → Coca-Cola, 33% → Pepsi, 25% → other" },
  { scenario: "Shelf space cut 72→56 facings", revenueImpact: -2840, marginImpact: -1120, skuChanges: "Drops 8 tail SKUs, reduces facings on 6 core SKUs", substitutionTo: "16% demand walks category, 84% retained" },
];

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13 };
const axisTick = { fill: "#475569", fontSize: 12 };
const axisTick_sm = { fill: "#475569", fontSize: 11 };
const gridStroke = "#e2e8f0";

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
          {badge && <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">{badge}</Badge>}
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
      <div className="text-2xl font-bold" style={{ color: color || CHART_COLORS.orange }}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Selected: "bg-green-100 text-green-800 border-green-300",
    Excluded: "bg-red-100 text-red-800 border-red-300",
    "Must-Carry": "bg-blue-100 text-blue-800 border-blue-300",
    Optimal: "bg-green-100 text-green-800 border-green-300",
    Feasible: "bg-amber-100 text-amber-800 border-amber-300",
    Binding: "bg-red-100 text-red-800 border-red-300",
    Slack: "bg-green-100 text-green-800 border-green-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}

// ═══════════════════════════════════════════════════════════════
// TAB SECTIONS
// ═══════════════════════════════════════════════════════════════

function OverviewSection() {
  const totalRevenue = SKU_CATALOG.reduce((s, sk) => s + sk.weeklyRevenue, 0);
  const totalMargin = SKU_CATALOG.reduce((s, sk) => s + sk.weeklyUnits * sk.margin, 0);
  const mustCarrySkus = SKU_CATALOG.filter(s => s.mustCarry).length;

  const brandRevShare = BRAND_DATA.map(b => ({
    name: b.brand,
    value: b.revenue,
    share: +((b.revenue / BRAND_DATA.reduce((s, x) => s + x.revenue, 0)) * 100).toFixed(1),
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <SectionHeader title="Executive Summary" subtitle="SKU Optimizer — Greedy & MILP assortment selection for CSD category" />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={SKU_CATALOG.length} label="Candidate SKUs" />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={CONSTRAINTS.totalFacings} label="Shelf Facings" color={CHART_COLORS.blue} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={mustCarrySkus} label="Must-Carry SKUs" color={CHART_COLORS.green} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`$${MILP_SOLUTION.milpRevenue.toLocaleString()}`} label="Optimal Weekly Rev" color={CHART_COLORS.teal} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`+${MILP_SOLUTION.milpImprovement}%`} label="MILP vs Greedy" color={CHART_COLORS.purple} />
        </CardContent></Card>
      </div>

      {/* Optimization problem statement */}
      <AnalysisCard title="SKU Optimizer — Problem Statement" badge="MILP" insight="Given 44 candidate SKUs and 72 shelf facings, select the revenue-maximizing assortment and facing plan subject to must-carry, brand diversity, price tier, and variant constraints.">
        <div className="grid grid-cols-3 gap-6 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Objective</h4>
            <div className="bg-slate-50 rounded p-3 font-mono text-xs mb-2">
              max Σ<sub>j</sub> (Revenue<sub>j</sub> × x<sub>j</sub>) + Σ<sub>j</sub> (SpaceElast<sub>j</sub> × f<sub>j</sub>)
            </div>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>x<sub>j</sub> ∈ {"{"} 0, 1 {"}"} — SKU selection binary</li>
              <li>f<sub>j</sub> ∈ [1, 5] — facing count integer</li>
              <li>Revenue from MNL choice probabilities</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Constraints</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Σ f<sub>j</sub> ≤ {CONSTRAINTS.totalFacings} (shelf capacity)</li>
              <li>{CONSTRAINTS.mustCarryCount} must-carry SKUs always in</li>
              <li>≥{CONSTRAINTS.minBrands} brands represented</li>
              <li>≤{CONSTRAINTS.maxSkusPerBrand} SKUs per brand</li>
              <li>≥{CONSTRAINTS.minDietVariant} Zero/Diet variants</li>
              <li>≥{CONSTRAINTS.minValueTier} Value + ≥{CONSTRAINTS.minPremiumTier} Premium tier</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Solution Approach</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li><strong>Phase 1:</strong> Greedy heuristic (fast, feasible)</li>
              <li><strong>Phase 2:</strong> MILP exact solve (optimal)</li>
              <li>Compare solutions & analyze gaps</li>
              <li>Sensitivity on constraint changes</li>
              <li>What-if scenario simulations</li>
            </ul>
          </div>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Brand share treemap */}
        <AnalysisCard title="Brand Revenue Share — Current Catalog" badge="44 SKUs">
          <ResponsiveContainer width="100%" height={260}>
            <Treemap data={brandRevShare} dataKey="value" nameKey="name" aspectRatio={3 / 2}
              content={({ x, y, width, height, name, share }: any) => {
                if (width < 40 || height < 30) return null;
                return (
                  <g>
                    <rect x={x} y={y} width={width} height={height} fill={BRAND_COLORS[name] || "#94a3b8"} stroke="#fff" strokeWidth={2} rx={4} />
                    {width > 60 && <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">{name}</text>}
                    {width > 50 && <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={11}>{share}%</text>}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Constraint summary */}
        <AnalysisCard title="Optimization Constraints Summary" badge="Feasibility">
          <Table>
            <TableBody>
              {[
                { constraint: "Total shelf facings", limit: CONSTRAINTS.totalFacings, type: "≤", status: "Binding" },
                { constraint: "Must-carry SKUs", limit: CONSTRAINTS.mustCarryCount, type: "=", status: "Binding" },
                { constraint: "Min brands", limit: CONSTRAINTS.minBrands, type: "≥", status: "Slack" },
                { constraint: "Max SKUs per brand", limit: CONSTRAINTS.maxSkusPerBrand, type: "≤", status: "Binding" },
                { constraint: "Min Diet/Zero SKUs", limit: CONSTRAINTS.minDietVariant, type: "≥", status: "Slack" },
                { constraint: "Min Value tier", limit: CONSTRAINTS.minValueTier, type: "≥", status: "Binding" },
                { constraint: "Min Premium tier", limit: CONSTRAINTS.minPremiumTier, type: "≥", status: "Slack" },
              ].map(c => (
                <TableRow key={c.constraint}>
                  <TCell className="text-sm">{c.constraint}</TCell>
                  <TCell className="text-sm font-mono text-center">{c.type} {c.limit}</TCell>
                  <TCell className="text-sm text-right"><StatusBadge status={c.status} /></TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalysisCard>
      </div>
    </div>
  );
}

function Phase1Section() {
  const skusByBrand = BRAND_DATA.map(b => ({
    brand: b.brand,
    skus: b.skuCount,
    revPerSku: Math.round(b.revenue / b.skuCount / 1000),
  })).sort((a, b) => b.revPerSku - a.revPerSku);

  const marginByVariant = ["Regular", "Zero/Diet", "Flavored"].map(v => {
    const items = SKU_CATALOG.filter(s => s.variant === v);
    return {
      variant: v,
      avgMarginPct: +(items.reduce((a, s) => a + s.marginPct, 0) / items.length).toFixed(1),
      avgPrice: +(items.reduce((a, s) => a + s.price, 0) / items.length).toFixed(2),
      skuCount: items.length,
      totalUnits: items.reduce((a, s) => a + s.weeklyUnits, 0),
    };
  });

  const revenuePerFacing = SKU_CATALOG.map(s => ({
    sku: s.sku.replace(/^(Coca-Cola|Mountain Dew|Dr Pepper|Pepsi|Sprite|Fanta|7UP|RC Cola)\s/, ""),
    brand: s.brand,
    revPerFacing: +(s.weeklyRevenue / s.facings).toFixed(0),
    facings: s.facings,
    weeklyRevenue: s.weeklyRevenue,
  })).sort((a, b) => b.revPerFacing - a.revPerFacing).slice(0, 15);

  const spaceElasticity = SKU_CATALOG.map(s => ({
    sku: s.sku,
    brand: s.brand,
    spaceElast: s.spaceElast,
    weeklyUnits: s.weeklyUnits,
    choiceProb: s.choiceProb,
  })).sort((a, b) => b.spaceElast - a.spaceElast).slice(0, 12);

  return (
    <div className="space-y-6">
      <SectionHeader title="Data Exploration" subtitle="Understanding SKU-level economics, shelf productivity, and promotional dynamics before optimization" />

      {/* Data inventory */}
      <AnalysisCard title="Data Sources — MNL Outputs" badge="Input Pipeline" insight="This optimizer consumes MNL demand model outputs (choice probabilities, substitution matrix) combined with transaction economics (margin, promo lift) and planogram data (facings, space elasticity).">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs text-right">Records</TableHead>
                <TableHead className="text-xs">Key Fields</TableHead>
                <TableHead className="text-xs">Used For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { source: "transaction_data.csv", records: "2.6M", fields: "basket_id, product_id, sales_value, quantity", use: "Revenue, units, basket composition" },
                { source: "product.csv", records: "92K", fields: "product_id, brand, commodity, sub_commodity", use: "SKU hierarchy, brand mapping" },
                { source: "causal_data.csv", records: "3.4M", fields: "product_id, store_id, display, mailer", use: "Promo frequency, display impact" },
                { source: "MNL Model Output", records: "44 SKUs", fields: "utility, choiceProb, substitution_matrix", use: "Choice probability, diversion ratios" },
                { source: "Planogram Data", records: "44 SKUs", fields: "facings, shelf_position, space_elasticity", use: "Current allocation, space response" },
              ].map(d => (
                <TableRow key={d.source}>
                  <TCell className="text-xs font-mono">{d.source}</TCell>
                  <TCell className="text-xs text-right">{d.records}</TCell>
                  <TCell className="text-xs text-slate-500">{d.fields}</TCell>
                  <TCell className="text-xs">{d.use}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Revenue per SKU by brand */}
        <AnalysisCard title="Revenue per SKU by Brand" badge="Efficiency" insight="Coca-Cola generates $606K/SKU vs RC Cola at $127K/SKU. Long-tail brands have diminishing returns per additional SKU.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={skusByBrand}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="brand" tick={axisTick_sm} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={axisTick_sm} label={{ value: "Rev/SKU ($K)", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v}K`, "Revenue/SKU"]} />
              <Bar dataKey="revPerSku" radius={[4, 4, 0, 0]} name="Rev per SKU ($K)">
                {skusByBrand.map((s, i) => <Cell key={i} fill={BRAND_COLORS[s.brand]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Margin by variant */}
        <AnalysisCard title="Margin Profile by Variant Type" badge="Economics" insight="Regular variants have highest volume (8,160 units/week) but Value-tier RC Cola drives the highest margin % (40.4%). Diet/Zero shows moderate margin with growing demand.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={marginByVariant}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="variant" tick={axisTick} />
              <YAxis yAxisId="left" tick={axisTick_sm} label={{ value: "Avg Margin %", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={axisTick_sm} label={{ value: "Weekly Units", angle: 90, position: "insideRight", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left" dataKey="avgMarginPct" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} name="Avg Margin %" />
              <Bar yAxisId="right" dataKey="totalUnits" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Weekly Units" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Revenue per facing */}
        <AnalysisCard title="Revenue per Facing — Top 15 SKUs" badge="Shelf Productivity" insight="2L sizes dominate rev/facing due to higher unit price. Coca-Cola Classic 2L: $443/facing vs Coca-Cola Classic 12oz: $288/facing.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenuePerFacing} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick_sm} label={{ value: "$/Facing/Week", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis type="category" dataKey="sku" tick={axisTick_sm} width={140} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v}`, "Rev/Facing"]} />
              <Bar dataKey="revPerFacing" name="Rev/Facing" radius={[0, 4, 4, 0]}>
                {revenuePerFacing.map((s, i) => <Cell key={i} fill={BRAND_COLORS[s.brand]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Space elasticity scatter */}
        <AnalysisCard title="Space Elasticity vs Weekly Units" badge="Responsiveness" insight="High-volume SKUs also have higher space elasticity — allocating an extra facing to Coca-Cola Zero 12oz (ε=0.20) yields more incremental sales than to RC Cola Diet (ε=0.05).">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="weeklyUnits" name="Weekly Units" tick={axisTick_sm} label={{ value: "Weekly Units", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis dataKey="spaceElast" name="Space Elasticity" tick={axisTick_sm} domain={[0, 0.25]} label={{ value: "Space Elasticity", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} content={({ active, payload }: any) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return <div style={tooltipStyle} className="p-2 text-xs"><strong>{d.sku}</strong><br />Units: {d.weeklyUnits}<br />ε: {d.spaceElast}<br />P(choice): {(d.choiceProb * 100).toFixed(1)}%</div>;
              }} />
              <Scatter data={spaceElasticity} fill={CHART_COLORS.orange}>
                {spaceElasticity.map((s, i) => <Cell key={i} fill={BRAND_COLORS[s.brand] || "#94a3b8"} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>
    </div>
  );
}

function Phase2Section() {
  const mustCarryItems = SKU_CATALOG.filter(s => s.mustCarry);
  const priceTierDist = ["Value", "Mid", "Premium"].map(t => ({
    tier: t,
    count: SKU_CATALOG.filter(s => s.priceTier === t).length,
    minReq: t === "Value" ? CONSTRAINTS.minValueTier : t === "Premium" ? CONSTRAINTS.minPremiumTier : 0,
    avgPrice: +(SKU_CATALOG.filter(s => s.priceTier === t).reduce((a, s) => a + s.price, 0) / Math.max(SKU_CATALOG.filter(s => s.priceTier === t).length, 1)).toFixed(2),
  }));

  const variantDist = ["Regular", "Zero/Diet", "Flavored"].map(v => ({
    variant: v,
    count: SKU_CATALOG.filter(s => s.variant === v).length,
    minReq: v === "Zero/Diet" ? CONSTRAINTS.minDietVariant : 0,
  }));

  const brandSkuCount = BRAND_DATA.map(b => ({
    brand: b.brand,
    current: b.skuCount,
    max: CONSTRAINTS.maxSkusPerBrand,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Constraint Definition" subtitle="Business rules that shape the feasible region — must-carry items, brand limits, price tiers, and variant requirements" />

      {/* Must-carry items */}
      <AnalysisCard title="Must-Carry SKUs — Non-Negotiable Assortment" badge={`${mustCarryItems.length} Items`} insight="These 8 SKUs are locked into any feasible solution. They represent category anchors, top brands, and sub-commodity leaders that cannot be delisted without unacceptable shopper loss.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs">Brand</TableHead>
                <TableHead className="text-xs">Sub-Commodity</TableHead>
                <TableHead className="text-xs text-right">Choice Prob</TableHead>
                <TableHead className="text-xs text-right">Weekly Rev</TableHead>
                <TableHead className="text-xs text-center">Min Facings</TableHead>
                <TableHead className="text-xs">Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mustCarryItems.map(s => (
                <TableRow key={s.id}>
                  <TCell className="text-xs font-medium">{s.sku}</TCell>
                  <TCell className="text-xs"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[s.brand] }} />{s.brand}</span></TCell>
                  <TCell className="text-xs">{s.subCommodity}</TCell>
                  <TCell className="text-xs text-right font-mono">{(s.choiceProb * 100).toFixed(1)}%</TCell>
                  <TCell className="text-xs text-right font-mono">${s.weeklyRevenue.toFixed(0)}</TCell>
                  <TCell className="text-xs text-center">3</TCell>
                  <TCell className="text-xs text-slate-500">{s.brand} anchor, {s.subCommodity} leader</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-3 gap-4">
        {/* Price tier distribution */}
        <AnalysisCard title="Price Tier Requirements" badge="Good-Better-Best">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priceTierDist}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="tier" tick={axisTick} />
              <YAxis tick={axisTick_sm} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} name="Available SKUs" />
              <Bar dataKey="minReq" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} name="Min Required" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-slate-500 space-y-1">
            {priceTierDist.map(t => <div key={t.tier}><strong>{t.tier}:</strong> Avg ${t.avgPrice} · {t.count} available · min {t.minReq}</div>)}
          </div>
        </AnalysisCard>

        {/* Variant requirements */}
        <AnalysisCard title="Variant Mix Requirements" badge="Diet/Zero">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={variantDist}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="variant" tick={axisTick} />
              <YAxis tick={axisTick_sm} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="Available" />
              <Bar dataKey="minReq" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} name="Min Required" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-slate-500">Health-conscious consumers require ≥{CONSTRAINTS.minDietVariant} Zero/Diet options. Currently {variantDist[1].count} available.</p>
        </AnalysisCard>

        {/* Brand SKU limits */}
        <AnalysisCard title="Brand SKU Limits" badge="Max {CONSTRAINTS.maxSkusPerBrand}">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={brandSkuCount} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick_sm} domain={[0, 9]} />
              <YAxis type="category" dataKey="brand" tick={axisTick_sm} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="current" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} name="Current SKUs" />
              <ReferenceLine x={CONSTRAINTS.maxSkusPerBrand} stroke={CHART_COLORS.red} strokeDasharray="3 3">
                <Label value={`Max ${CONSTRAINTS.maxSkusPerBrand}`} position="top" fontSize={10} fill={CHART_COLORS.red} />
              </ReferenceLine>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* MILP formulation */}
      <AnalysisCard title="Mathematical Formulation (MILP)" badge="Integer Program" insight="The MILP has 88 decision variables (44 binary selection + 44 integer facings), 7 constraint families, and a linear objective. Solvable to optimality in <1 second.">
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-700 space-y-2">
          <p><strong>Objective:</strong> max Σ<sub>j=1..44</sub> [ P(j) × AvgBasket × 52 × x<sub>j</sub> + α × SpaceElast<sub>j</sub> × f<sub>j</sub> ]</p>
          <p><strong>s.t.</strong></p>
          <p className="ml-4">Σ f<sub>j</sub> ≤ 72 &nbsp;&nbsp;&nbsp;&nbsp; (shelf capacity)</p>
          <p className="ml-4">x<sub>j</sub> = 1 ∀ j ∈ MustCarry &nbsp;&nbsp; (must-carry)</p>
          <p className="ml-4">f<sub>j</sub> ≥ x<sub>j</sub>, &nbsp; f<sub>j</sub> ≤ 5·x<sub>j</sub> &nbsp;&nbsp; (linking)</p>
          <p className="ml-4">Σ x<sub>j</sub> : brand=b ≤ 6 ∀ b &nbsp;&nbsp; (brand cap)</p>
          <p className="ml-4">Σ z<sub>b</sub> ≥ 6 &nbsp;&nbsp; (brand diversity, z<sub>b</sub> = max x<sub>j</sub> for brand b)</p>
          <p className="ml-4">Σ x<sub>j</sub> : variant=Diet ≥ 6 &nbsp;&nbsp; (diet min)</p>
          <p className="ml-4">Σ x<sub>j</sub> : tier=Value ≥ 3, Σ x<sub>j</sub> : tier=Premium ≥ 6 &nbsp;&nbsp; (price tier)</p>
          <p className="ml-4">x<sub>j</sub> ∈ {"{"} 0,1 {"}"}, &nbsp; f<sub>j</sub> ∈ Z<sup>+</sup></p>
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase3Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Greedy Heuristic" subtitle="Step-by-step greedy selection: add the highest-value feasible SKU at each step until shelf is full" />

      {/* Algorithm explanation */}
      <AnalysisCard title="Greedy Algorithm — How It Works" badge="Heuristic" insight="The greedy heuristic selects SKUs one at a time by highest marginal value (revenue/facing), checking constraint feasibility at each step. Fast (O(n²)) but may miss globally optimal facing allocations.">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="font-semibold text-orange-700">Step 1</div>
            <div className="text-xs text-slate-600 mt-1">Lock must-carry SKUs with minimum facings (3 each)</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="font-semibold text-orange-700">Step 2</div>
            <div className="text-xs text-slate-600 mt-1">Rank remaining SKUs by revenue/facing ratio</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="font-semibold text-orange-700">Step 3</div>
            <div className="text-xs text-slate-600 mt-1">Add top-ranked feasible SKU, check all constraints</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="font-semibold text-orange-700">Step 4</div>
            <div className="text-xs text-slate-600 mt-1">Repeat until shelf capacity exhausted</div>
          </div>
        </div>
      </AnalysisCard>

      {/* Greedy cumulative revenue chart */}
      <AnalysisCard title="Greedy Selection — Cumulative Revenue Build-Up" badge="30 Steps" insight="80% of revenue is captured by step 14 (top 14 SKUs). Diminishing returns are clear: the first 8 must-carry SKUs generate $6,918/week, while the remaining 22 add only $8,789.">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={GREEDY_STEPS}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="step" tick={axisTick_sm} label={{ value: "Greedy Step", position: "insideBottom", offset: -5, fontSize: 11 }} />
            <YAxis yAxisId="left" tick={axisTick_sm} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} label={{ value: "Cum Revenue", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={axisTick_sm} label={{ value: "Facings Used", angle: 90, position: "insideRight", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return <div style={tooltipStyle} className="p-2 text-xs"><strong>Step {d.step}: {d.sku}</strong><br />Revenue: ${d.cumRevenue.toFixed(0)}<br />Facings: {d.cumFacings}/{CONSTRAINTS.totalFacings}<br />{d.reason}</div>;
            }} />
            <Area yAxisId="left" type="monotone" dataKey="cumRevenue" fill="rgba(234,88,12,0.1)" stroke={CHART_COLORS.orange} strokeWidth={2} name="Cum Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="cumFacings" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} name="Facings Used" />
            <ReferenceLine yAxisId="right" y={CONSTRAINTS.totalFacings} stroke={CHART_COLORS.red} strokeDasharray="3 3">
              <Label value="Shelf Capacity" position="right" fontSize={10} fill={CHART_COLORS.red} />
            </ReferenceLine>
          </ComposedChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {/* Greedy trace table */}
      <AnalysisCard title="Greedy Selection Trace — Step by Step" badge="Decision Log">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sticky top-0 bg-white">Step</TableHead>
                <TableHead className="text-xs sticky top-0 bg-white">SKU Added</TableHead>
                <TableHead className="text-xs text-right sticky top-0 bg-white">Rev/Facing</TableHead>
                <TableHead className="text-xs text-right sticky top-0 bg-white">Cum Revenue</TableHead>
                <TableHead className="text-xs text-right sticky top-0 bg-white">Facings</TableHead>
                <TableHead className="text-xs sticky top-0 bg-white">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GREEDY_STEPS.map(s => {
                const brand = SKU_CATALOG.find(sk => sk.sku === s.sku)?.brand || "";
                return (
                  <TableRow key={s.step}>
                    <TCell className="text-xs font-mono text-slate-400">{s.step}</TCell>
                    <TCell className="text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[brand] }} />
                        {s.sku}
                      </span>
                    </TCell>
                    <TCell className="text-xs text-right font-mono">${s.value.toFixed(0)}</TCell>
                    <TCell className="text-xs text-right font-mono">${s.cumRevenue.toFixed(0)}</TCell>
                    <TCell className="text-xs text-right font-mono">{s.cumFacings}/{CONSTRAINTS.totalFacings}</TCell>
                    <TCell className="text-xs text-slate-500">{s.reason}</TCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase4Section() {
  const diffItems = SOLUTION_COMPARISON.filter(s => s.diff !== 0);

  return (
    <div className="space-y-6">
      <SectionHeader title="MILP Exact Solution" subtitle="Branch-and-bound optimal solution vs greedy heuristic — comparing decisions, revenue, and margin" />

      {/* MILP solve stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-sm bg-green-50 border-green-200"><CardContent className="pt-4">
          <Metric value={MILP_SOLUTION.status} label="Solution Status" color={CHART_COLORS.green} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={MILP_SOLUTION.solveTime} label="Solve Time" color={CHART_COLORS.blue} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={MILP_SOLUTION.gap} label="Optimality Gap" color={CHART_COLORS.green} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={MILP_SOLUTION.iterations} label="B&B Iterations" color={CHART_COLORS.purple} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`${MILP_SOLUTION.selectedSKUs} SKUs`} label="Selected / 44" color={CHART_COLORS.orange} />
        </CardContent></Card>
      </div>

      {/* MILP vs Greedy comparison */}
      <AnalysisCard title="MILP vs Greedy — Performance Comparison" badge="Head-to-Head" insight={`MILP improves revenue by +${MILP_SOLUTION.milpImprovement}% and margin by +${MILP_SOLUTION.marginImprovement}% vs greedy. The key difference: MILP reallocates facings from low-elasticity to high-elasticity SKUs.`}>
        <div className="grid grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { metric: "Weekly Revenue", greedy: MILP_SOLUTION.greedyRevenue, milp: MILP_SOLUTION.milpRevenue },
              { metric: "Weekly Margin", greedy: MILP_SOLUTION.greedyMargin, milp: MILP_SOLUTION.milpMargin },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="metric" tick={axisTick} />
              <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="greedy" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Greedy" />
              <Bar dataKey="milp" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} name="MILP Optimal" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm font-semibold text-green-700">Revenue Improvement</div>
              <div className="text-3xl font-bold text-green-600">+${(MILP_SOLUTION.milpRevenue - MILP_SOLUTION.greedyRevenue).toFixed(0)}/wk</div>
              <div className="text-xs text-slate-500">+{MILP_SOLUTION.milpImprovement}% over greedy solution</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm font-semibold text-blue-700">Margin Improvement</div>
              <div className="text-3xl font-bold text-blue-600">+${(MILP_SOLUTION.milpMargin - MILP_SOLUTION.greedyMargin).toFixed(0)}/wk</div>
              <div className="text-xs text-slate-500">+{MILP_SOLUTION.marginImprovement}% over greedy solution</div>
            </div>
          </div>
        </div>
      </AnalysisCard>

      {/* Facing differences */}
      <AnalysisCard title="Where MILP Differs from Greedy" badge={`${diffItems.length} Changes`} insight="MILP makes 8 facing reallocations — adding facings where space elasticity is high and removing where incremental value is low. The greedy misses these cross-SKU trade-offs.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs text-center">Greedy Facings</TableHead>
                <TableHead className="text-xs text-center">MILP Facings</TableHead>
                <TableHead className="text-xs text-center">Δ</TableHead>
                <TableHead className="text-xs">MILP Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diffItems.map(s => {
                const brand = s.sku.split(" ")[0] === "Dr" ? "Dr Pepper"
                  : s.sku.split(" ")[0] === "Mountain" ? "Mountain Dew"
                  : s.sku.split(" ")[0] === "RC" ? "RC Cola"
                  : s.sku.split(" ")[0] === "Coca-Cola" ? "Coca-Cola" : s.sku.split(" ")[0];
                return (
                  <TableRow key={s.sku}>
                    <TCell className="text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[brand] || "#94a3b8" }} />
                        {s.sku}
                      </span>
                    </TCell>
                    <TCell className="text-xs text-center font-mono">{s.greedy}</TCell>
                    <TCell className="text-xs text-center font-mono font-semibold">{s.milp}</TCell>
                    <TCell className="text-xs text-center font-mono font-bold" style={{ color: s.diff > 0 ? CHART_COLORS.green : CHART_COLORS.red }}>{s.diff > 0 ? "+" : ""}{s.diff}</TCell>
                    <TCell className="text-xs text-slate-500">{s.note}</TCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Full solution facing allocation */}
      <AnalysisCard title="MILP Optimal Facing Allocation — All Selected SKUs" badge="28 SKUs">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={SOLUTION_COMPARISON.filter(s => s.milp > 0).sort((a, b) => b.milp - a.milp)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={axisTick_sm} domain={[0, 5]} label={{ value: "Facings", position: "insideBottom", offset: -5, fontSize: 11 }} />
            <YAxis type="category" dataKey="sku" tick={axisTick_sm} width={200} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="milp" name="MILP Facings" radius={[0, 4, 4, 0]}>
              {SOLUTION_COMPARISON.filter(s => s.milp > 0).sort((a, b) => b.milp - a.milp).map((s, i) => {
                const brand = s.sku.split(" ")[0] === "Dr" ? "Dr Pepper"
                  : s.sku.split(" ")[0] === "Mountain" ? "Mountain Dew"
                  : s.sku.split(" ")[0] === "RC" ? "RC Cola"
                  : s.sku.split(" ")[0] === "Coca-Cola" ? "Coca-Cola" : s.sku.split(" ")[0];
                return <Cell key={i} fill={BRAND_COLORS[brand] || "#94a3b8"} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>
    </div>
  );
}

function Phase5Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Solution Analysis & What-If Scenarios" subtitle="Sensitivity analysis on constraints, scenario planning, and actionable recommendations" />

      {/* Sensitivity analysis */}
      <AnalysisCard title="Sensitivity Analysis — Constraint Perturbation" badge="6 Scenarios" insight="Shelf space is the most impactful constraint: adding 8 facings yields +3.7% revenue, while cutting 8 loses −6.0%. The asymmetry shows current allocation is near optimal.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Constraint Change</TableHead>
                <TableHead className="text-xs text-right">Revenue</TableHead>
                <TableHead className="text-xs text-right">Margin</TableHead>
                <TableHead className="text-xs text-right">Δ Revenue</TableHead>
                <TableHead className="text-xs text-right">Δ Margin</TableHead>
                <TableHead className="text-xs">Impact Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SENSITIVITY_DATA.map(s => (
                <TableRow key={s.param}>
                  <TCell className="text-xs font-medium">{s.param}</TCell>
                  <TCell className="text-xs text-right font-mono">${s.milpRevenue.toLocaleString()}</TCell>
                  <TCell className="text-xs text-right font-mono">${s.milpMargin.toLocaleString()}</TCell>
                  <TCell className="text-xs text-right font-mono font-semibold" style={{ color: s.revChange >= 0 ? CHART_COLORS.green : CHART_COLORS.red }}>{s.revChange >= 0 ? "+" : ""}{s.revChange}%</TCell>
                  <TCell className="text-xs text-right font-mono font-semibold" style={{ color: s.marginChange >= 0 ? CHART_COLORS.green : CHART_COLORS.red }}>{s.marginChange >= 0 ? "+" : ""}{s.marginChange}%</TCell>
                  <TCell className="text-xs text-slate-500">{s.note || s.skusAdded || s.skusDropped}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Sensitivity bar chart */}
      <AnalysisCard title="Revenue Impact — Tornado Chart" badge="Sensitivity">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={SENSITIVITY_DATA.sort((a, b) => Math.abs(b.revChange) - Math.abs(a.revChange))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={axisTick_sm} domain={[-10, 5]} tickFormatter={(v: number) => `${v}%`} />
            <YAxis type="category" dataKey="param" tick={axisTick_sm} width={200} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v >= 0 ? "+" : ""}${v}%`, "Revenue Δ"]} />
            <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
            <Bar dataKey="revChange" name="Revenue Change %" radius={[0, 4, 4, 0]}>
              {SENSITIVITY_DATA.sort((a, b) => Math.abs(b.revChange) - Math.abs(a.revChange)).map((s, i) => (
                <Cell key={i} fill={s.revChange >= 0 ? CHART_COLORS.green : CHART_COLORS.red} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {/* What-if scenarios */}
      <AnalysisCard title="What-If Scenario Simulations" badge="4 Scenarios" insight="Each scenario re-solves the MILP with modified inputs. The optimizer automatically adjusts facings and SKU selection to maximize revenue under new conditions.">
        <div className="grid grid-cols-2 gap-4">
          {WHATIF_SCENARIOS.map(w => (
            <div key={w.scenario} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="font-semibold text-sm text-slate-700 mb-2">{w.scenario}</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <span className="text-xs text-slate-500">Revenue Impact</span>
                  <div className="text-lg font-bold" style={{ color: w.revenueImpact >= 0 ? CHART_COLORS.green : CHART_COLORS.red }}>
                    {w.revenueImpact >= 0 ? "+" : ""}${w.revenueImpact.toLocaleString()}/wk
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Margin Impact</span>
                  <div className="text-lg font-bold" style={{ color: w.marginImpact >= 0 ? CHART_COLORS.green : CHART_COLORS.red }}>
                    {w.marginImpact >= 0 ? "+" : ""}${w.marginImpact.toLocaleString()}/wk
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500"><strong>SKU Changes:</strong> {w.skuChanges}</div>
              <div className="text-xs text-slate-500 mt-1"><strong>Substitution:</strong> {w.substitutionTo}</div>
            </div>
          ))}
        </div>
      </AnalysisCard>

      {/* Final recommendations */}
      <AnalysisCard title="Recommended Actions — Implementation Plan" badge="Action Items">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="font-semibold text-green-700 text-sm mb-2">Immediate (Week 1)</div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Increase Coca-Cola Zero 12oz to 4 facings</li>
              <li>Increase Fanta Orange 12oz to 3 facings</li>
              <li>Add Dr Pepper Zero 12oz 3rd facing</li>
              <li>Reduce Coca-Cola Cherry to 1 facing</li>
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="font-semibold text-blue-700 text-sm mb-2">Short-Term (Month 1)</div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Delist Coca-Cola Vanilla 12oz (72% retained)</li>
              <li>Delist Dr Pepper Cream Soda 12oz</li>
              <li>Add Pepsi Diet 2L (1 facing)</li>
              <li>Monitor walk rates for delisted items</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-purple-700 text-sm mb-2">Pipeline Integration</div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Feed facing plan to Monte Carlo simulation</li>
              <li>Run cluster-specific MILP per store type</li>
              <li>Generate planogram from optimal facings</li>
              <li>Set up A/B test: MILP vs current plan</li>
            </ul>
          </div>
        </div>
      </AnalysisCard>

      {/* Pipeline connection */}
      <AnalysisCard title="Pipeline — SKU Optimizer in Context" badge="Layer 2">
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-xs font-semibold text-teal-700 bg-teal-100 rounded px-2 py-1">MNL Demand Model</div>
            <div className="text-[10px] text-slate-500 mt-1">Choice probs, substitution</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-orange-700 bg-orange-100 rounded px-2 py-1 ring-2 ring-orange-300">SKU Optimizer</div>
            <div className="text-[10px] text-slate-500 mt-1">Assortment + facings</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-indigo-700 bg-indigo-100 rounded px-2 py-1">Monte Carlo Sim</div>
            <div className="text-[10px] text-slate-500 mt-1">Confidence intervals</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-pink-700 bg-pink-100 rounded px-2 py-1">Planogram</div>
            <div className="text-[10px] text-slate-500 mt-1">Physical shelf layout</div>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SKUOptimizerApp() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">SKU Optimizer</h1>
            <p className="text-sm text-slate-500 mt-1">Greedy & MILP assortment optimization for CSD category — 44 SKUs × 72 facings</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">Layer 2: Assortment</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">{MILP_SOLUTION.status}</Badge>
            <Badge variant="outline" className="text-slate-500">{MILP_SOLUTION.selectedSKUs} SKUs · {CONSTRAINTS.totalFacings} Facings</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exploration">Exploration</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="greedy">Greedy</TabsTrigger>
          <TabsTrigger value="milp">MILP Solution</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewSection /></TabsContent>
        <TabsContent value="exploration"><Phase1Section /></TabsContent>
        <TabsContent value="constraints"><Phase2Section /></TabsContent>
        <TabsContent value="greedy"><Phase3Section /></TabsContent>
        <TabsContent value="milp"><Phase4Section /></TabsContent>
        <TabsContent value="analysis"><Phase5Section /></TabsContent>
      </Tabs>
    </div>
  );
}
