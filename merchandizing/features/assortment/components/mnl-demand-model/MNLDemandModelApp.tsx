"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ReferenceLine, Label,
  Treemap,
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

// ── Dataset schema (same as CDT) ──
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
      Pepsi: ["Original 12oz", "Original 2L", "Zero Sugar 12oz", "Zero Sugar 2L", "Diet 12oz", "Diet 2L", "Wild Cherry 12oz"],
      "RC Cola": ["Original 12oz", "Original 2L", "Diet 12oz"],
    },
    "Lemon-Lime": {
      Sprite: ["Original 12oz", "Original 2L", "Zero 12oz", "Zero 2L", "Lymonade 12oz"],
      "7UP": ["Original 12oz", "Original 2L", "Zero Sugar 12oz", "Cherry 12oz"],
    },
    Orange: {
      Fanta: ["Orange 12oz", "Orange 2L", "Grape 12oz", "Strawberry 12oz", "Pineapple 12oz"],
    },
    "Specialty/Other": {
      "Dr Pepper": ["Original 12oz", "Original 2L", "Zero 12oz", "Zero 2L", "Cherry 12oz", "Cream Soda 12oz"],
      "Mountain Dew": ["Original 12oz", "Original 2L", "Zero 12oz", "Code Red 12oz", "Baja Blast 12oz", "Voltage 12oz"],
    },
  },
};

// Brand-level metrics
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

// ── SKU-level data for MNL choice modeling ──
const SKU_DATA = [
  // Cola - Coca-Cola
  { sku: "Coca-Cola Classic 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Regular", price: 1.29, promoPrice: 0.99, promoPct: 0.28, facings: 4, weeklyUnits: 892, choiceShare: 0.142, utility: 2.18 },
  { sku: "Coca-Cola Classic 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", variant: "Regular", price: 2.49, promoPrice: 1.99, promoPct: 0.22, facings: 3, weeklyUnits: 534, choiceShare: 0.085, utility: 1.72 },
  { sku: "Coca-Cola Zero 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.29, promoPrice: 0.99, promoPct: 0.25, facings: 3, weeklyUnits: 612, choiceShare: 0.097, utility: 1.89 },
  { sku: "Coca-Cola Zero 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.49, promoPrice: 1.99, promoPct: 0.18, facings: 2, weeklyUnits: 298, choiceShare: 0.047, utility: 1.31 },
  { sku: "Coca-Cola Diet 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.29, promoPrice: 0.99, promoPct: 0.24, facings: 3, weeklyUnits: 578, choiceShare: 0.092, utility: 1.84 },
  { sku: "Coca-Cola Diet 2L", brand: "Coca-Cola", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.49, promoPrice: 1.99, promoPct: 0.16, facings: 2, weeklyUnits: 245, choiceShare: 0.039, utility: 1.18 },
  { sku: "Coca-Cola Cherry 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Flavored", price: 1.39, promoPrice: 1.09, promoPct: 0.15, facings: 2, weeklyUnits: 189, choiceShare: 0.030, utility: 0.92 },
  { sku: "Coca-Cola Vanilla 12oz", brand: "Coca-Cola", subCommodity: "Cola", size: "12oz", variant: "Flavored", price: 1.39, promoPrice: 1.09, promoPct: 0.12, facings: 1, weeklyUnits: 142, choiceShare: 0.023, utility: 0.71 },
  // Cola - Pepsi
  { sku: "Pepsi Original 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Regular", price: 1.25, promoPrice: 0.89, promoPct: 0.32, facings: 4, weeklyUnits: 756, choiceShare: 0.120, utility: 2.04 },
  { sku: "Pepsi Original 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", variant: "Regular", price: 2.39, promoPrice: 1.89, promoPct: 0.28, facings: 3, weeklyUnits: 489, choiceShare: 0.078, utility: 1.65 },
  { sku: "Pepsi Zero Sugar 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.25, promoPrice: 0.89, promoPct: 0.30, facings: 3, weeklyUnits: 423, choiceShare: 0.067, utility: 1.52 },
  { sku: "Pepsi Zero Sugar 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.39, promoPrice: 1.89, promoPct: 0.20, facings: 2, weeklyUnits: 234, choiceShare: 0.037, utility: 1.12 },
  { sku: "Pepsi Diet 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.25, promoPrice: 0.89, promoPct: 0.26, facings: 2, weeklyUnits: 389, choiceShare: 0.062, utility: 1.44 },
  { sku: "Pepsi Diet 2L", brand: "Pepsi", subCommodity: "Cola", size: "2L", variant: "Zero/Diet", price: 2.39, promoPrice: 1.89, promoPct: 0.18, facings: 1, weeklyUnits: 178, choiceShare: 0.028, utility: 0.98 },
  { sku: "Pepsi Wild Cherry 12oz", brand: "Pepsi", subCommodity: "Cola", size: "12oz", variant: "Flavored", price: 1.35, promoPrice: 0.99, promoPct: 0.18, facings: 2, weeklyUnits: 201, choiceShare: 0.032, utility: 0.96 },
  // Cola - RC Cola
  { sku: "RC Cola Original 12oz", brand: "RC Cola", subCommodity: "Cola", size: "12oz", variant: "Regular", price: 1.09, promoPrice: 0.79, promoPct: 0.15, facings: 2, weeklyUnits: 156, choiceShare: 0.025, utility: 0.68 },
  { sku: "RC Cola Original 2L", brand: "RC Cola", subCommodity: "Cola", size: "2L", variant: "Regular", price: 1.99, promoPrice: 1.49, promoPct: 0.12, facings: 1, weeklyUnits: 98, choiceShare: 0.016, utility: 0.42 },
  { sku: "RC Cola Diet 12oz", brand: "RC Cola", subCommodity: "Cola", size: "12oz", variant: "Zero/Diet", price: 1.09, promoPrice: 0.79, promoPct: 0.10, facings: 1, weeklyUnits: 67, choiceShare: 0.011, utility: 0.18 },
  // Lemon-Lime - Sprite
  { sku: "Sprite Original 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", variant: "Regular", price: 1.19, promoPrice: 0.89, promoPct: 0.24, facings: 3, weeklyUnits: 412, choiceShare: 0.066, utility: 1.48 },
  { sku: "Sprite Original 2L", brand: "Sprite", subCommodity: "Lemon-Lime", size: "2L", variant: "Regular", price: 2.29, promoPrice: 1.79, promoPct: 0.20, facings: 2, weeklyUnits: 267, choiceShare: 0.042, utility: 1.22 },
  { sku: "Sprite Zero 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", variant: "Zero/Diet", price: 1.19, promoPrice: 0.89, promoPct: 0.18, facings: 2, weeklyUnits: 198, choiceShare: 0.031, utility: 0.94 },
  { sku: "Sprite Zero 2L", brand: "Sprite", subCommodity: "Lemon-Lime", size: "2L", variant: "Zero/Diet", price: 2.29, promoPrice: 1.79, promoPct: 0.14, facings: 1, weeklyUnits: 134, choiceShare: 0.021, utility: 0.72 },
  { sku: "Sprite Lymonade 12oz", brand: "Sprite", subCommodity: "Lemon-Lime", size: "12oz", variant: "Flavored", price: 1.39, promoPrice: 1.09, promoPct: 0.16, facings: 1, weeklyUnits: 112, choiceShare: 0.018, utility: 0.58 },
  // Lemon-Lime - 7UP
  { sku: "7UP Original 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", variant: "Regular", price: 1.15, promoPrice: 0.85, promoPct: 0.20, facings: 2, weeklyUnits: 234, choiceShare: 0.037, utility: 1.12 },
  { sku: "7UP Original 2L", brand: "7UP", subCommodity: "Lemon-Lime", size: "2L", variant: "Regular", price: 2.19, promoPrice: 1.69, promoPct: 0.18, facings: 2, weeklyUnits: 178, choiceShare: 0.028, utility: 0.92 },
  { sku: "7UP Zero Sugar 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", variant: "Zero/Diet", price: 1.15, promoPrice: 0.85, promoPct: 0.14, facings: 1, weeklyUnits: 112, choiceShare: 0.018, utility: 0.58 },
  { sku: "7UP Cherry 12oz", brand: "7UP", subCommodity: "Lemon-Lime", size: "12oz", variant: "Flavored", price: 1.29, promoPrice: 0.99, promoPct: 0.12, facings: 1, weeklyUnits: 89, choiceShare: 0.014, utility: 0.44 },
  // Orange - Fanta
  { sku: "Fanta Orange 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Regular", price: 1.25, promoPrice: 0.95, promoPct: 0.18, facings: 2, weeklyUnits: 245, choiceShare: 0.039, utility: 1.18 },
  { sku: "Fanta Orange 2L", brand: "Fanta", subCommodity: "Orange", size: "2L", variant: "Regular", price: 2.29, promoPrice: 1.79, promoPct: 0.15, facings: 2, weeklyUnits: 167, choiceShare: 0.027, utility: 0.88 },
  { sku: "Fanta Grape 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Flavored", price: 1.29, promoPrice: 0.99, promoPct: 0.14, facings: 1, weeklyUnits: 134, choiceShare: 0.021, utility: 0.72 },
  { sku: "Fanta Strawberry 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Flavored", price: 1.29, promoPrice: 0.99, promoPct: 0.12, facings: 1, weeklyUnits: 98, choiceShare: 0.016, utility: 0.52 },
  { sku: "Fanta Pineapple 12oz", brand: "Fanta", subCommodity: "Orange", size: "12oz", variant: "Flavored", price: 1.29, promoPrice: 0.99, promoPct: 0.10, facings: 1, weeklyUnits: 78, choiceShare: 0.012, utility: 0.38 },
  // Specialty - Dr Pepper
  { sku: "Dr Pepper Original 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Regular", price: 1.35, promoPrice: 0.99, promoPct: 0.22, facings: 3, weeklyUnits: 412, choiceShare: 0.066, utility: 1.48 },
  { sku: "Dr Pepper Original 2L", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "2L", variant: "Regular", price: 2.59, promoPrice: 1.99, promoPct: 0.18, facings: 2, weeklyUnits: 278, choiceShare: 0.044, utility: 1.28 },
  { sku: "Dr Pepper Zero 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Zero/Diet", price: 1.35, promoPrice: 0.99, promoPct: 0.20, facings: 2, weeklyUnits: 298, choiceShare: 0.047, utility: 1.31 },
  { sku: "Dr Pepper Zero 2L", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "2L", variant: "Zero/Diet", price: 2.59, promoPrice: 1.99, promoPct: 0.14, facings: 1, weeklyUnits: 156, choiceShare: 0.025, utility: 0.88 },
  { sku: "Dr Pepper Cherry 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.39, promoPrice: 1.09, promoPct: 0.14, facings: 1, weeklyUnits: 167, choiceShare: 0.027, utility: 0.82 },
  { sku: "Dr Pepper Cream Soda 12oz", brand: "Dr Pepper", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.39, promoPrice: 1.09, promoPct: 0.12, facings: 1, weeklyUnits: 134, choiceShare: 0.021, utility: 0.68 },
  // Specialty - Mountain Dew
  { sku: "Mountain Dew Original 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Regular", price: 1.29, promoPrice: 0.95, promoPct: 0.25, facings: 3, weeklyUnits: 378, choiceShare: 0.060, utility: 1.44 },
  { sku: "Mountain Dew Original 2L", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "2L", variant: "Regular", price: 2.49, promoPrice: 1.89, promoPct: 0.20, facings: 2, weeklyUnits: 245, choiceShare: 0.039, utility: 1.18 },
  { sku: "Mountain Dew Zero 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Zero/Diet", price: 1.29, promoPrice: 0.95, promoPct: 0.18, facings: 2, weeklyUnits: 189, choiceShare: 0.030, utility: 0.92 },
  { sku: "Mountain Dew Code Red 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.35, promoPrice: 1.05, promoPct: 0.16, facings: 1, weeklyUnits: 156, choiceShare: 0.025, utility: 0.78 },
  { sku: "Mountain Dew Baja Blast 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.39, promoPrice: 1.09, promoPct: 0.14, facings: 1, weeklyUnits: 134, choiceShare: 0.021, utility: 0.68 },
  { sku: "Mountain Dew Voltage 12oz", brand: "Mountain Dew", subCommodity: "Specialty/Other", size: "12oz", variant: "Flavored", price: 1.35, promoPrice: 1.05, promoPct: 0.12, facings: 1, weeklyUnits: 98, choiceShare: 0.016, utility: 0.52 },
];

// ── MNL Model Coefficients (estimated from synthetic data) ──
const MNL_COEFFICIENTS = {
  price: -2.34,
  promo: 0.82,
  facings: 0.45,
  brandLoyalty: 1.56,
  sizePref_12oz: 0.38,
  sizePref_2L: -0.12,
  variantRegular: 0.65,
  variantDiet: 0.28,
  variantFlavored: -0.18,
  logLikelihood: -4823.7,
  logLikelihoodNull: -6891.2,
  mcFaddenR2: 0.30,
  aic: 9665.4,
  bic: 9712.8,
  hitRate: 0.734,
  observations: 48200,
};

// ── Weekly trends (52 weeks) ──
const WEEKLY_TRENDS = Array.from({ length: 52 }, (_, i) => {
  const week = i + 1;
  const seasonal = 1 + 0.15 * Math.sin((2 * Math.PI * (week - 13)) / 52);
  const baseRevenue = 285000;
  const noise = [1.02, 0.97, 1.04, 0.98, 1.01, 0.96, 1.03, 0.99, 1.05, 0.95,
    1.02, 0.98, 1.06, 0.94, 1.03, 0.97, 1.01, 0.99, 1.04, 0.96,
    1.02, 0.98, 1.03, 0.97, 1.05, 0.94, 1.01, 0.99, 1.04, 0.96,
    1.03, 0.98, 1.02, 0.97, 1.05, 0.95, 1.01, 0.99, 1.04, 0.96,
    1.02, 0.98, 1.03, 0.97, 1.01, 0.99, 1.04, 0.96, 1.02, 0.98, 1.03, 0.97][i];
  return {
    week,
    revenue: Math.round(baseRevenue * seasonal * noise),
    units: Math.round((baseRevenue * seasonal * noise) / 1.27),
    promoDepth: +(0.22 + 0.08 * Math.sin((2 * Math.PI * week) / 26)).toFixed(3),
  };
});

// ── Price elasticity matrix (own + cross) ──
const BRANDS = BRAND_DATA.map(b => b.brand);
const PRICE_ELASTICITY_MATRIX = [
  // Coca-Cola, Pepsi, Dr Pepper, Mtn Dew, Sprite, Fanta, 7UP, RC Cola
  [-2.18, 0.42, 0.15, 0.12, 0.08, 0.04, 0.06, 0.18],  // Coca-Cola
  [0.38, -2.34, 0.14, 0.11, 0.07, 0.03, 0.05, 0.22],   // Pepsi
  [0.12, 0.10, -1.92, 0.28, 0.04, 0.06, 0.03, 0.05],   // Dr Pepper
  [0.10, 0.09, 0.24, -2.05, 0.05, 0.04, 0.04, 0.04],   // Mountain Dew
  [0.06, 0.05, 0.03, 0.04, -2.42, 0.08, 0.32, 0.02],   // Sprite
  [0.04, 0.03, 0.05, 0.04, 0.07, -1.78, 0.05, 0.02],   // Fanta
  [0.05, 0.04, 0.03, 0.04, 0.28, 0.06, -2.28, 0.02],   // 7UP
  [0.34, 0.42, 0.06, 0.05, 0.03, 0.02, 0.02, -2.85],   // RC Cola
];

// ── Substitution patterns (from MNL diversion ratios) ──
const SUBSTITUTION_MATRIX = [
  [0.00, 0.35, 0.12, 0.10, 0.08, 0.04, 0.06, 0.25],
  [0.32, 0.00, 0.11, 0.09, 0.07, 0.03, 0.05, 0.33],
  [0.14, 0.12, 0.00, 0.38, 0.05, 0.08, 0.04, 0.19],
  [0.12, 0.10, 0.34, 0.00, 0.06, 0.05, 0.05, 0.28],
  [0.08, 0.07, 0.04, 0.06, 0.00, 0.12, 0.48, 0.15],
  [0.06, 0.05, 0.08, 0.06, 0.14, 0.00, 0.08, 0.53],
  [0.07, 0.06, 0.04, 0.05, 0.45, 0.10, 0.00, 0.23],
  [0.38, 0.42, 0.04, 0.03, 0.02, 0.02, 0.02, 0.00],
];

// ── Basket & frequency distributions ──
const BASKET_DIST = [
  { size: "1 item", pct: 38.2, count: 18424 },
  { size: "2 items", pct: 28.4, count: 13697 },
  { size: "3 items", pct: 16.8, count: 8102 },
  { size: "4 items", pct: 9.2, count: 4434 },
  { size: "5+ items", pct: 7.4, count: 3568 },
];

const FREQ_DIST = [
  { band: "1x", pct: 22.4, households: 560 },
  { band: "2-3x", pct: 28.8, households: 720 },
  { band: "4-6x", pct: 21.6, households: 540 },
  { band: "7-12x", pct: 14.8, households: 370 },
  { band: "13-26x", pct: 8.4, households: 210 },
  { band: "27-52x", pct: 4.0, households: 100 },
];

// ── Demographic segments for MNL heterogeneity ──
const DEMO_SEGMENTS = [
  { segment: "Young Singles", pct: 18.2, avgBasket: 3.42, priceSens: -2.82, brandLoyalty: 0.38, prefVariant: "Flavored", topBrand: "Mountain Dew" },
  { segment: "Young Families", pct: 22.4, avgBasket: 5.18, priceSens: -2.56, brandLoyalty: 0.52, prefVariant: "Regular", topBrand: "Coca-Cola" },
  { segment: "Mature Families", pct: 24.8, avgBasket: 4.87, priceSens: -2.12, brandLoyalty: 0.68, prefVariant: "Regular", topBrand: "Coca-Cola" },
  { segment: "Older Singles", pct: 16.4, avgBasket: 2.94, priceSens: -1.78, brandLoyalty: 0.74, prefVariant: "Zero/Diet", topBrand: "Diet Coke" },
  { segment: "Health Conscious", pct: 11.6, avgBasket: 2.56, priceSens: -1.92, brandLoyalty: 0.62, prefVariant: "Zero/Diet", topBrand: "Coca-Cola Zero" },
  { segment: "Budget Shoppers", pct: 6.6, avgBasket: 6.24, priceSens: -3.24, brandLoyalty: 0.28, prefVariant: "Regular", topBrand: "RC Cola" },
];

// ── Delisting simulation results ──
const DELISTING_SCENARIOS = [
  { sku: "Coca-Cola Vanilla 12oz", currentShare: 2.3, lostDemand: 100, retained: 72.4, primaryDiversion: "Coca-Cola Cherry 12oz", diversionPct: 34.2, revenueImpact: -38200, netCategoryImpact: -10540 },
  { sku: "RC Cola Diet 12oz", currentShare: 1.1, lostDemand: 100, retained: 58.6, primaryDiversion: "RC Cola Original 12oz", diversionPct: 28.4, revenueImpact: -15800, netCategoryImpact: -6540 },
  { sku: "Fanta Pineapple 12oz", currentShare: 1.2, lostDemand: 100, retained: 52.3, primaryDiversion: "Fanta Orange 12oz", diversionPct: 38.6, revenueImpact: -18400, netCategoryImpact: -8780 },
  { sku: "7UP Cherry 12oz", currentShare: 1.4, lostDemand: 100, retained: 61.8, primaryDiversion: "7UP Original 12oz", diversionPct: 42.1, revenueImpact: -21200, netCategoryImpact: -8100 },
  { sku: "Mountain Dew Voltage 12oz", currentShare: 1.6, lostDemand: 100, retained: 64.2, primaryDiversion: "Mountain Dew Code Red 12oz", diversionPct: 32.8, revenueImpact: -24800, netCategoryImpact: -8880 },
  { sku: "Sprite Lymonade 12oz", currentShare: 1.8, lostDemand: 100, retained: 56.4, primaryDiversion: "Sprite Original 12oz", diversionPct: 45.2, revenueImpact: -28400, netCategoryImpact: -12380 },
];

// ── Assortment recommendations (MNL-driven) ──
const ASSORTMENT_RECS = [
  { sku: "Coca-Cola Classic 12oz", action: "Must-Carry", reason: "Highest choice probability (14.2%), category anchor", facingRec: 4, currentFacing: 4, demandImpact: "—" },
  { sku: "Pepsi Original 12oz", action: "Must-Carry", reason: "Strong #2 brand, high promo responsiveness", facingRec: 4, currentFacing: 4, demandImpact: "—" },
  { sku: "Coca-Cola Zero 12oz", action: "Grow", reason: "Rising Zero/Diet trend, high utility score", facingRec: 4, currentFacing: 3, demandImpact: "+8.2%" },
  { sku: "Dr Pepper Original 12oz", action: "Must-Carry", reason: "Unique flavor profile, low substitution risk", facingRec: 3, currentFacing: 3, demandImpact: "—" },
  { sku: "Coca-Cola Vanilla 12oz", action: "Rationalize", reason: "Low utility (0.71), high diversion to Cherry", facingRec: 0, currentFacing: 1, demandImpact: "-2.3% (72% retained)" },
  { sku: "RC Cola Diet 12oz", action: "Rationalize", reason: "Lowest utility (0.18), small loyal base", facingRec: 0, currentFacing: 1, demandImpact: "-1.1% (59% retained)" },
  { sku: "Fanta Pineapple 12oz", action: "Review", reason: "Low utility but niche appeal, test removal", facingRec: 1, currentFacing: 1, demandImpact: "-1.2% at risk" },
  { sku: "Mountain Dew Baja Blast 12oz", action: "Review", reason: "Seasonal demand spikes, consider seasonal carry", facingRec: 1, currentFacing: 1, demandImpact: "Seasonal variance" },
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
      <div className="text-2xl font-bold" style={{ color: color || CHART_COLORS.teal }}>{value}</div>
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
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}

// ═══════════════════════════════════════════════════════════════
// TAB SECTIONS
// ═══════════════════════════════════════════════════════════════

function OverviewSection() {
  const totalRevenue = BRAND_DATA.reduce((s, b) => s + b.revenue, 0);
  const totalUnits = BRAND_DATA.reduce((s, b) => s + b.units, 0);
  const totalSKUs = SKU_DATA.length;
  const avgPrice = SKU_DATA.reduce((s, sk) => s + sk.price, 0) / totalSKUs;

  const brandShareData = BRAND_DATA.map(b => ({
    name: b.brand,
    value: b.revenue,
    share: +((b.revenue / totalRevenue) * 100).toFixed(1),
  })).sort((a, b) => b.value - a.value);

  const variantMix = ["Regular", "Zero/Diet", "Flavored"].map(v => ({
    name: v,
    skus: SKU_DATA.filter(s => s.variant === v).length,
    units: SKU_DATA.filter(s => s.variant === v).reduce((acc, s) => acc + s.weeklyUnits, 0),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Executive Summary" subtitle="MNL demand model overview for CSD category — Cola focus" />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`$${(totalRevenue / 1e6).toFixed(1)}M`} label="Annual Revenue" />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`${(totalUnits / 1e6).toFixed(1)}M`} label="Annual Units" color={CHART_COLORS.blue} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={totalSKUs} label="Active SKUs" color={CHART_COLORS.purple} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`$${avgPrice.toFixed(2)}`} label="Avg Price" color={CHART_COLORS.gold} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`${(MNL_COEFFICIENTS.mcFaddenR2 * 100).toFixed(0)}%`} label="McFadden R²" color={CHART_COLORS.green} />
        </CardContent></Card>
      </div>

      {/* Model summary card */}
      <AnalysisCard title="MNL Demand Model — What & Why" badge="Methodology" insight="The MNL model predicts which SKU a shopper will choose from the available set, based on price, promotion, shelf presence, and brand preference. It produces choice probabilities that power substitution analysis and assortment optimization.">
        <div className="grid grid-cols-3 gap-6 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Inputs</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Transaction-level choices (48,200 obs)</li>
              <li>SKU attributes: price, size, variant</li>
              <li>Store conditions: facings, promo flags</li>
              <li>Household demographics (2,500 HHs)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Model Outputs</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Choice probabilities per SKU</li>
              <li>Price & cross-price elasticities</li>
              <li>Substitution / diversion ratios</li>
              <li>Utility scores & WTP estimates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Business Application</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Optimal assortment selection</li>
              <li>Delisting impact simulation</li>
              <li>Promo ROI by SKU</li>
              <li>Shelf space allocation</li>
            </ul>
          </div>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Brand revenue share */}
        <AnalysisCard title="Brand Revenue Share" badge="Treemap">
          <ResponsiveContainer width="100%" height={260}>
            <Treemap data={brandShareData} dataKey="value" nameKey="name" aspectRatio={3 / 2}
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

        {/* Variant mix */}
        <AnalysisCard title="Variant Mix" badge="Units">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={variantMix} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="name" tick={axisTick} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="units" fill={CHART_COLORS.teal} radius={[0, 4, 4, 0]} name="Weekly Units" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>
    </div>
  );
}

function Phase1Section() {
  const sizeMix = [
    { size: "12oz", skus: SKU_DATA.filter(s => s.size === "12oz").length, units: SKU_DATA.filter(s => s.size === "12oz").reduce((a, s) => a + s.weeklyUnits, 0) },
    { size: "2L", skus: SKU_DATA.filter(s => s.size === "2L").length, units: SKU_DATA.filter(s => s.size === "2L").reduce((a, s) => a + s.weeklyUnits, 0) },
  ];

  const priceByBrand = BRAND_DATA.map(b => ({
    brand: b.brand,
    avgPrice: b.avgPrice,
    promoFreq: +(b.promoFreq * 100).toFixed(0),
  })).sort((a, b) => b.avgPrice - a.avgPrice);

  return (
    <div className="space-y-6">
      <SectionHeader title="Data Exploration" subtitle="Understanding the CSD transaction data — distributions, trends, and early patterns" />

      {/* Data inventory */}
      <AnalysisCard title="Data Inventory — Complete Journey" badge="8 Tables" insight="The dataset spans 2,500 households over 52 weeks with 2.6M transactions. Cola sub-commodity is our MNL modeling focus with 44 SKUs across 8 brands.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">File</TableHead>
                <TableHead className="text-xs text-right">Rows</TableHead>
                <TableHead className="text-xs text-right">Cols</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Primary Key</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DATA_FILES.map(f => (
                <TableRow key={f.name}>
                  <TCell className="text-xs font-mono">{f.name}</TCell>
                  <TCell className="text-xs text-right">{f.rows.toLocaleString()}</TCell>
                  <TCell className="text-xs text-right">{f.cols}</TCell>
                  <TCell className="text-xs">{f.desc}</TCell>
                  <TCell className="text-xs font-mono text-slate-500">{f.pk}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Weekly revenue trend */}
        <AnalysisCard title="Weekly Revenue Trend" badge="52 Weeks" insight="Clear summer peak (weeks 20-32) with ~15% seasonal uplift. Promo cadence correlates with revenue spikes.">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={WEEKLY_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="week" tick={axisTick_sm} label={{ value: "Week", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Basket size distribution */}
        <AnalysisCard title="CSD Basket Size Distribution" badge="Choice Occasions" insight="38% single-item baskets indicate strong brand-level decisions. Multi-item baskets suggest variety-seeking behavior.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={BASKET_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="size" tick={axisTick_sm} />
              <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Share"]} />
              <Bar dataKey="pct" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="% of Baskets" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Purchase frequency */}
        <AnalysisCard title="Purchase Frequency Distribution" badge="Households" insight="~51% buy CSD 1-3 times in the period — light buyers. The 4% heavy buyers (27-52x) drive disproportionate volume.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={FREQ_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="band" tick={axisTick_sm} />
              <YAxis tick={axisTick_sm} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="households" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} name="Households" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Price vs promo by brand */}
        <AnalysisCard title="Average Price & Promo Frequency by Brand" badge="Pricing" insight="RC Cola has the lowest price ($1.19) but also lowest promo frequency (15%). Pepsi promotes most aggressively (32%).">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priceByBrand}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="brand" tick={axisTick_sm} angle={-30} textAnchor="end" height={50} />
              <YAxis yAxisId="left" tick={axisTick_sm} domain={[0.9, 1.5]} label={{ value: "Avg Price ($)", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={axisTick_sm} domain={[0, 40]} label={{ value: "Promo %", angle: 90, position: "insideRight", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left" dataKey="avgPrice" fill={CHART_COLORS.teal} radius={[4, 4, 0, 0]} name="Avg Price" />
              <Bar yAxisId="right" dataKey="promoFreq" fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} name="Promo %" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* Size mix */}
      <AnalysisCard title="Pack Size Analysis" badge="12oz vs 2L" insight="12oz accounts for 76% of SKUs and 72% of units. Convenience format dominates choice occasions — key for MNL specification.">
        <div className="grid grid-cols-2 gap-8">
          {sizeMix.map(s => (
            <div key={s.size} className="text-center">
              <div className="text-3xl font-bold text-teal-600">{s.size}</div>
              <div className="text-sm text-slate-500 mt-1">{s.skus} SKUs · {s.units.toLocaleString()} weekly units</div>
              <div className="mt-2 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(s.units / SKU_DATA.reduce((a, sk) => a + sk.weeklyUnits, 0)) * 100}%`, backgroundColor: s.size === "12oz" ? CHART_COLORS.teal : CHART_COLORS.gold }} />
              </div>
            </div>
          ))}
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase2Section() {
  const choiceSetByBrand = BRAND_DATA.map(b => ({
    brand: b.brand,
    skuCount: b.skuCount,
    penetration: b.penetration,
    loyalty: +(b.loyalty * 100).toFixed(0),
  }));

  const attributeSummary = [
    { attribute: "Price (shelf)", type: "Continuous", range: "$1.09–$2.59", coeffSign: "−", interpretation: "Higher price → lower choice probability" },
    { attribute: "Promotion flag", type: "Binary (0/1)", range: "0 or 1", coeffSign: "+", interpretation: "On promotion → higher utility" },
    { attribute: "Shelf facings", type: "Count", range: "1–4", coeffSign: "+", interpretation: "More visibility → higher choice" },
    { attribute: "Brand (ASC)", type: "Categorical", range: "8 brands", coeffSign: "±", interpretation: "Brand-specific constants capture intrinsic preference" },
    { attribute: "Size (12oz/2L)", type: "Binary", range: "12oz or 2L", coeffSign: "+/−", interpretation: "12oz preferred for impulse, 2L for stock-up" },
    { attribute: "Variant", type: "Categorical", range: "Regular/Diet/Flavored", coeffSign: "±", interpretation: "Regular preferred, Diet has niche, Flavored lowest" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Choice Set Construction" subtitle="Defining the alternatives, attributes, and decision structure for MNL estimation" />

      <AnalysisCard title="MNL Utility Specification" badge="Random Utility Theory" insight="V_ij = β_price·Price + β_promo·Promo + β_facing·Facings + β_size·Size + ASC_brand + ε_ij, where ε follows Type I Extreme Value (Gumbel) distribution.">
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 mb-4">
          <p className="mb-2">U<sub>ij</sub> = V<sub>ij</sub> + ε<sub>ij</sub></p>
          <p className="mb-2">V<sub>ij</sub> = β<sub>price</sub>·Price<sub>j</sub> + β<sub>promo</sub>·Promo<sub>j</sub> + β<sub>facings</sub>·ln(Facings<sub>j</sub>) + β<sub>size</sub>·Size<sub>j</sub> + ASC<sub>brand(j)</sub></p>
          <p className="text-xs text-slate-500 mt-2">P(choice = j | C<sub>i</sub>) = exp(V<sub>ij</sub>) / Σ<sub>k∈C</sub> exp(V<sub>ik</sub>)</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Attribute</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Range</TableHead>
                <TableHead className="text-xs text-center">Coeff Sign</TableHead>
                <TableHead className="text-xs">Interpretation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributeSummary.map(a => (
                <TableRow key={a.attribute}>
                  <TCell className="text-xs font-medium">{a.attribute}</TCell>
                  <TCell className="text-xs">{a.type}</TCell>
                  <TCell className="text-xs font-mono">{a.range}</TCell>
                  <TCell className="text-xs text-center font-bold" style={{ color: a.coeffSign === "−" ? CHART_COLORS.red : a.coeffSign === "+" ? CHART_COLORS.green : CHART_COLORS.gold }}>{a.coeffSign}</TCell>
                  <TCell className="text-xs text-slate-500">{a.interpretation}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Choice set composition */}
        <AnalysisCard title="Choice Set — SKU Count & Penetration" badge="8 Brands" insight="Coca-Cola dominates with 8 SKUs and 75% penetration. RC Cola has only 3 SKUs but serves price-sensitive segment.">
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="skuCount" name="SKU Count" tick={axisTick} label={{ value: "SKU Count", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis dataKey="penetration" name="Penetration %" tick={axisTick} label={{ value: "Penetration %", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [name === "SKU Count" ? v : `${v}%`, name]} />
              <Scatter data={choiceSetByBrand} fill={CHART_COLORS.teal}>
                {choiceSetByBrand.map((entry, i) => (
                  <Cell key={i} fill={BRAND_COLORS[entry.brand] || "#94a3b8"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {choiceSetByBrand.map(b => (
              <span key={b.brand} className="flex items-center gap-1 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRAND_COLORS[b.brand] }} />
                {b.brand}
              </span>
            ))}
          </div>
        </AnalysisCard>

        {/* Demographic segments */}
        <AnalysisCard title="Demographic Segments — Preference Heterogeneity" badge="6 Segments" insight="Budget Shoppers show 3.24x price sensitivity vs Older Singles (1.78x). This heterogeneity motivates mixed logit extensions.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={DEMO_SEGMENTS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick_sm} domain={[0, 4]} label={{ value: "Price Sensitivity (|β|)", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis type="category" dataKey="segment" tick={axisTick_sm} width={110} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [Math.abs(v).toFixed(2), "|Price Coeff|"]} />
              <Bar dataKey="priceSens" fill={CHART_COLORS.red} radius={[0, 4, 4, 0]} name="Price Sensitivity">
                {DEMO_SEGMENTS.map((_, i) => (
                  <Cell key={i} fill={i === DEMO_SEGMENTS.length - 1 ? CHART_COLORS.red : CHART_COLORS.teal} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* Brand loyalty vs price sensitivity scatter */}
      <AnalysisCard title="Segment Profile: Loyalty vs Price Sensitivity" badge="Behavioral" insight="Clear inverse relationship — high loyalty segments are less price sensitive. This shapes how MNL coefficients vary across consumer types.">
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="brandLoyalty" name="Brand Loyalty" tick={axisTick} domain={[0.2, 0.8]} label={{ value: "Brand Loyalty Index", position: "insideBottom", offset: -5, fontSize: 11 }} />
            <YAxis dataKey="priceSens" name="Price Sensitivity" tick={axisTick} label={{ value: "Price Sensitivity (β)", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return <div style={tooltipStyle} className="p-2"><strong>{d.segment}</strong><br />Loyalty: {d.brandLoyalty}<br />Price β: {d.priceSens}<br />Top: {d.topBrand}</div>;
            }} />
            <Scatter data={DEMO_SEGMENTS} fill={CHART_COLORS.purple}>
              {DEMO_SEGMENTS.map((_, i) => (
                <Cell key={i} fill={[CHART_COLORS.teal, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.gold, CHART_COLORS.pink, CHART_COLORS.red][i]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </AnalysisCard>
    </div>
  );
}

function Phase3Section() {
  const coeffData = [
    { name: "Price", value: MNL_COEFFICIENTS.price, color: CHART_COLORS.red },
    { name: "Promo", value: MNL_COEFFICIENTS.promo, color: CHART_COLORS.green },
    { name: "Facings (log)", value: MNL_COEFFICIENTS.facings, color: CHART_COLORS.blue },
    { name: "Brand Loyalty", value: MNL_COEFFICIENTS.brandLoyalty, color: CHART_COLORS.purple },
    { name: "Size: 12oz", value: MNL_COEFFICIENTS.sizePref_12oz, color: CHART_COLORS.teal },
    { name: "Size: 2L", value: MNL_COEFFICIENTS.sizePref_2L, color: CHART_COLORS.gold },
    { name: "Variant: Regular", value: MNL_COEFFICIENTS.variantRegular, color: CHART_COLORS.green },
    { name: "Variant: Diet", value: MNL_COEFFICIENTS.variantDiet, color: CHART_COLORS.tealLight },
    { name: "Variant: Flavored", value: MNL_COEFFICIENTS.variantFlavored, color: CHART_COLORS.orange },
  ];

  const goodnessOfFit = [
    { metric: "Log-Likelihood", value: MNL_COEFFICIENTS.logLikelihood.toFixed(1) },
    { metric: "Null Log-Likelihood", value: MNL_COEFFICIENTS.logLikelihoodNull.toFixed(1) },
    { metric: "McFadden R²", value: MNL_COEFFICIENTS.mcFaddenR2.toFixed(3) },
    { metric: "AIC", value: MNL_COEFFICIENTS.aic.toFixed(1) },
    { metric: "BIC", value: MNL_COEFFICIENTS.bic.toFixed(1) },
    { metric: "Hit Rate", value: `${(MNL_COEFFICIENTS.hitRate * 100).toFixed(1)}%` },
    { metric: "Observations", value: MNL_COEFFICIENTS.observations.toLocaleString() },
  ];

  // Brand ASCs (alternative-specific constants)
  const brandASCs = [
    { brand: "Coca-Cola", asc: 1.82, se: 0.12, zStat: 15.17, pValue: "<0.001" },
    { brand: "Pepsi", asc: 1.54, se: 0.13, zStat: 11.85, pValue: "<0.001" },
    { brand: "Dr Pepper", asc: 1.12, se: 0.14, zStat: 8.00, pValue: "<0.001" },
    { brand: "Mountain Dew", asc: 0.98, se: 0.15, zStat: 6.53, pValue: "<0.001" },
    { brand: "Sprite", asc: 0.82, se: 0.15, zStat: 5.47, pValue: "<0.001" },
    { brand: "Fanta", asc: 0.45, se: 0.18, zStat: 2.50, pValue: "0.012" },
    { brand: "7UP", asc: 0.38, se: 0.18, zStat: 2.11, pValue: "0.035" },
    { brand: "RC Cola", asc: 0.00, se: "—", zStat: "—", pValue: "ref" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="MNL Model Estimation" subtitle="Maximum likelihood estimation of multinomial logit coefficients and model diagnostics" />

      {/* Coefficients bar chart */}
      <AnalysisCard title="Estimated Coefficients (β)" badge="MLE" insight="Price coefficient (β = −2.34) is the strongest driver — a $0.10 price increase reduces choice probability by ~21%. Brand loyalty (β = 1.56) is the strongest positive driver.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={coeffData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={axisTick} domain={[-3, 2]} />
            <YAxis type="category" dataKey="name" tick={axisTick} width={110} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(2), "β"]} />
            <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
            <Bar dataKey="value" name="Coefficient" radius={[0, 4, 4, 0]}>
              {coeffData.map((c, i) => <Cell key={i} fill={c.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Goodness of fit */}
        <AnalysisCard title="Model Fit Statistics" badge="Diagnostics" insight="McFadden R² of 0.30 indicates excellent fit for discrete choice models (>0.20 is considered good). Hit rate of 73.4% confirms strong predictive accuracy.">
          <Table>
            <TableBody>
              {goodnessOfFit.map(g => (
                <TableRow key={g.metric}>
                  <TCell className="text-sm font-medium text-slate-700">{g.metric}</TCell>
                  <TCell className="text-sm font-mono text-right">{g.value}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalysisCard>

        {/* Brand ASCs */}
        <AnalysisCard title="Brand Alternative-Specific Constants" badge="ASC" insight="Coca-Cola's ASC (1.82) means it would be chosen 6.2x more than RC Cola (reference) even at identical price/promo/facings — pure brand equity.">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Brand</TableHead>
                  <TableHead className="text-xs text-right">ASC</TableHead>
                  <TableHead className="text-xs text-right">SE</TableHead>
                  <TableHead className="text-xs text-right">z-stat</TableHead>
                  <TableHead className="text-xs text-right">p-value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandASCs.map(b => (
                  <TableRow key={b.brand}>
                    <TCell className="text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRAND_COLORS[b.brand] }} />
                        {b.brand}
                      </span>
                    </TCell>
                    <TCell className="text-xs text-right font-mono">{b.asc.toFixed(2)}</TCell>
                    <TCell className="text-xs text-right font-mono">{b.se}</TCell>
                    <TCell className="text-xs text-right font-mono">{typeof b.zStat === "number" ? b.zStat.toFixed(2) : b.zStat}</TCell>
                    <TCell className="text-xs text-right font-mono">{b.pValue}</TCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AnalysisCard>
      </div>

      {/* Coefficient interpretation */}
      <AnalysisCard title="Coefficient Interpretation — Marginal Effects" badge="WTP">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-red-50 rounded-lg p-3">
            <div className="font-semibold text-red-700">Price Effect</div>
            <div className="text-2xl font-bold text-red-600 mt-1">−21%</div>
            <div className="text-xs text-slate-500 mt-1">Choice prob change per $0.10 price increase</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-semibold text-green-700">Promo Lift</div>
            <div className="text-2xl font-bold text-green-600 mt-1">+127%</div>
            <div className="text-xs text-slate-500 mt-1">Relative utility increase when on promotion</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-semibold text-blue-700">Facing Elasticity</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">+0.45</div>
            <div className="text-xs text-slate-500 mt-1">Doubling facings increases utility by 0.45</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="font-semibold text-purple-700">WTP Premium</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">$0.67</div>
            <div className="text-xs text-slate-500 mt-1">Willingness-to-pay for brand loyalty unit</div>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase4Section() {
  // Top 15 SKUs by choice share
  const topSKUs = [...SKU_DATA].sort((a, b) => b.choiceShare - a.choiceShare).slice(0, 15);

  return (
    <div className="space-y-6">
      <SectionHeader title="Model Outputs — Probabilities & Elasticities" subtitle="Choice probabilities, substitution patterns, and price elasticities derived from the MNL model" />

      {/* Choice probabilities */}
      <AnalysisCard title="SKU Choice Probabilities (Top 15)" badge="MNL Output" insight="Coca-Cola Classic 12oz leads with 14.2% choice share. Top 5 SKUs capture 50.2% of total choice — strong concentration in core items.">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topSKUs}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="sku" tick={axisTick_sm} angle={-40} textAnchor="end" height={100} interval={0} />
            <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} label={{ value: "Choice Probability", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "P(choice)"]} />
            <Bar dataKey="choiceShare" name="Choice Share" radius={[4, 4, 0, 0]}>
              {topSKUs.map((s, i) => <Cell key={i} fill={BRAND_COLORS[s.brand] || "#94a3b8"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {/* Own-price elasticity */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Own-Price Elasticity by Brand" badge="Elastic" insight="All brands are price-elastic (|ε| > 1). RC Cola is most elastic (−2.85) — price-sensitive shoppers leave the brand entirely. Fanta is least elastic (−1.78).">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={BRANDS.map((b, i) => ({ brand: b, elasticity: PRICE_ELASTICITY_MATRIX[i][i] }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick} domain={[-3.5, 0]} />
              <YAxis type="category" dataKey="brand" tick={axisTick_sm} width={100} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toFixed(2), "Own ε"]} />
              <ReferenceLine x={-1} stroke={CHART_COLORS.red} strokeDasharray="3 3">
                <Label value="Unit elastic" position="top" fontSize={10} fill={CHART_COLORS.red} />
              </ReferenceLine>
              <Bar dataKey="elasticity" name="Own-Price Elasticity" radius={[4, 0, 0, 4]}>
                {BRANDS.map((b, i) => <Cell key={i} fill={BRAND_COLORS[b]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Cross-price heatmap */}
        <AnalysisCard title="Cross-Price Elasticity Matrix" badge="Substitution" insight="Highest cross-elasticity: RC Cola → Pepsi (0.42) and RC Cola → Coca-Cola (0.34). These are the primary diversion paths if RC Cola raises prices.">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left text-slate-500">↓ Price of →</th>
                  {BRANDS.map(b => <th key={b} className="p-1 text-center" style={{ color: BRAND_COLORS[b] }}>{b.split(" ")[0]}</th>)}
                </tr>
              </thead>
              <tbody>
                {BRANDS.map((row, i) => (
                  <tr key={row}>
                    <td className="p-1 font-medium" style={{ color: BRAND_COLORS[row] }}>{row}</td>
                    {PRICE_ELASTICITY_MATRIX[i].map((val, j) => {
                      const isOwn = i === j;
                      const absVal = Math.abs(val);
                      const bg = isOwn
                        ? `rgba(220,38,38,${Math.min(absVal / 3, 0.3)})`
                        : `rgba(22,163,106,${Math.min(absVal / 0.5, 0.3)})`;
                      return (
                        <td key={j} className="p-1 text-center font-mono" style={{ backgroundColor: bg, fontWeight: isOwn ? 700 : 400 }}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalysisCard>
      </div>

      {/* Substitution matrix */}
      <AnalysisCard title="Diversion Ratios — Where Do Lost Sales Go?" badge="MNL Substitution" insight="If Coca-Cola is delisted, 35% of its volume diverts to Pepsi, 25% to RC Cola. Within sub-commodity diversion is strongest (IIA property correction applied).">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-slate-500">If delisted ↓</th>
                {BRANDS.map(b => <th key={b} className="p-1.5 text-center" style={{ color: BRAND_COLORS[b] }}>{b.split(" ")[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {BRANDS.map((row, i) => (
                <tr key={row} className="border-t border-slate-100">
                  <td className="p-1.5 font-medium" style={{ color: BRAND_COLORS[row] }}>{row}</td>
                  {SUBSTITUTION_MATRIX[i].map((val, j) => {
                    const isMax = val === Math.max(...SUBSTITUTION_MATRIX[i].filter((_, k) => k !== i));
                    return (
                      <td key={j} className="p-1.5 text-center font-mono" style={{
                        backgroundColor: val === 0 ? "#f8fafc" : `rgba(13,148,136,${Math.min(val / 0.5, 0.4)})`,
                        fontWeight: isMax ? 700 : 400,
                      }}>
                        {val === 0 ? "—" : `${(val * 100).toFixed(0)}%`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnalysisCard>

      {/* Utility score ranking */}
      <AnalysisCard title="Utility Score Ranking — All 44 SKUs" badge="V_ij" insight="Utility scores drive choice probability via the logit transform. Scores range from 0.18 (RC Cola Diet 12oz) to 2.18 (Coca-Cola Classic 12oz) — a 12x probability difference.">
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sticky top-0 bg-white">Rank</TableHead>
                <TableHead className="text-xs sticky top-0 bg-white">SKU</TableHead>
                <TableHead className="text-xs sticky top-0 bg-white">Brand</TableHead>
                <TableHead className="text-xs text-right sticky top-0 bg-white">Utility</TableHead>
                <TableHead className="text-xs text-right sticky top-0 bg-white">P(choice)</TableHead>
                <TableHead className="text-xs text-right sticky top-0 bg-white">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...SKU_DATA].sort((a, b) => b.utility - a.utility).map((s, i) => (
                <TableRow key={s.sku}>
                  <TCell className="text-xs font-mono text-slate-400">{i + 1}</TCell>
                  <TCell className="text-xs">{s.sku}</TCell>
                  <TCell className="text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[s.brand] }} />
                      {s.brand}
                    </span>
                  </TCell>
                  <TCell className="text-xs text-right font-mono font-semibold">{s.utility.toFixed(2)}</TCell>
                  <TCell className="text-xs text-right font-mono">{(s.choiceShare * 100).toFixed(1)}%</TCell>
                  <TCell className="text-xs text-right font-mono">${s.price.toFixed(2)}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase5Section() {
  const totalCurrentRevenue = SKU_DATA.reduce((s, sk) => s + sk.weeklyUnits * sk.price, 0);
  const recSummary = {
    mustCarry: ASSORTMENT_RECS.filter(r => r.action === "Must-Carry").length,
    grow: ASSORTMENT_RECS.filter(r => r.action === "Grow").length,
    rationalize: ASSORTMENT_RECS.filter(r => r.action === "Rationalize").length,
    review: ASSORTMENT_RECS.filter(r => r.action === "Review").length,
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Assortment Optimization & Recommendations" subtitle="Using MNL outputs to optimize SKU selection, simulate delistings, and generate actionable recommendations" />

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="shadow-sm bg-green-50 border-green-200"><CardContent className="pt-4">
          <Metric value={recSummary.mustCarry} label="Must-Carry SKUs" color={CHART_COLORS.green} />
        </CardContent></Card>
        <Card className="shadow-sm bg-blue-50 border-blue-200"><CardContent className="pt-4">
          <Metric value={recSummary.grow} label="Grow SKUs" color={CHART_COLORS.blue} />
        </CardContent></Card>
        <Card className="shadow-sm bg-red-50 border-red-200"><CardContent className="pt-4">
          <Metric value={recSummary.rationalize} label="Rationalize SKUs" color={CHART_COLORS.red} />
        </CardContent></Card>
        <Card className="shadow-sm bg-amber-50 border-amber-200"><CardContent className="pt-4">
          <Metric value={recSummary.review} label="Review SKUs" color={CHART_COLORS.gold} />
        </CardContent></Card>
      </div>

      {/* Delisting simulation */}
      <AnalysisCard title="Delisting Impact Simulation" badge="MNL Diversion" insight="MNL diversion ratios predict where demand flows when a SKU is removed. Retained % shows category-level demand retention — higher = safer to delist.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">SKU to Delist</TableHead>
                <TableHead className="text-xs text-right">Current Share</TableHead>
                <TableHead className="text-xs text-right">Retained %</TableHead>
                <TableHead className="text-xs">Primary Diversion</TableHead>
                <TableHead className="text-xs text-right">Diversion %</TableHead>
                <TableHead className="text-xs text-right">Revenue Impact</TableHead>
                <TableHead className="text-xs text-right">Net Category Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DELISTING_SCENARIOS.map(d => (
                <TableRow key={d.sku}>
                  <TCell className="text-xs font-medium">{d.sku}</TCell>
                  <TCell className="text-xs text-right">{d.currentShare}%</TCell>
                  <TCell className="text-xs text-right font-semibold" style={{ color: d.retained > 65 ? CHART_COLORS.green : d.retained > 55 ? CHART_COLORS.gold : CHART_COLORS.red }}>{d.retained}%</TCell>
                  <TCell className="text-xs">{d.primaryDiversion}</TCell>
                  <TCell className="text-xs text-right">{d.diversionPct}%</TCell>
                  <TCell className="text-xs text-right font-mono text-red-600">${Math.abs(d.revenueImpact).toLocaleString()}</TCell>
                  <TCell className="text-xs text-right font-mono text-red-600">−${Math.abs(d.netCategoryImpact).toLocaleString()}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Diversion waterfall for Coca-Cola Vanilla */}
      <AnalysisCard title="Demand Diversion Waterfall — Coca-Cola Vanilla 12oz Delisting" badge="Simulation" insight="If delisted, 34.2% diverts to Cherry, 22.1% to Classic, 16.1% stays within Coca-Cola variants. Only 27.6% of demand is truly lost to the category.">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={[
            { target: "Coke Cherry", pct: 34.2 },
            { target: "Coke Classic", pct: 22.1 },
            { target: "Coke Zero", pct: 16.1 },
            { target: "Pepsi Original", pct: 8.4 },
            { target: "Dr Pepper", pct: 5.2 },
            { target: "Other CSD", pct: 6.4 },
            { target: "Lost to Category", pct: 7.6 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="target" tick={axisTick_sm} />
            <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Diversion"]} />
            <Bar dataKey="pct" name="Diversion %" radius={[4, 4, 0, 0]}>
              {[CHART_COLORS.red, CHART_COLORS.red, CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.teal, "#94a3b8"].map((c, i) => (
                <Cell key={i} fill={c} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {/* Final recommendations table */}
      <AnalysisCard title="MNL-Driven Assortment Recommendations" badge="Action Plan" insight="Net impact of recommended changes: +$12,400 weekly revenue with 2 fewer SKUs. Freed shelf space reallocated to Grow candidates.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs text-center">Action</TableHead>
                <TableHead className="text-xs">Rationale</TableHead>
                <TableHead className="text-xs text-center">Current Facings</TableHead>
                <TableHead className="text-xs text-center">Rec Facings</TableHead>
                <TableHead className="text-xs text-right">Demand Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ASSORTMENT_RECS.map(r => (
                <TableRow key={r.sku}>
                  <TCell className="text-xs font-medium">{r.sku}</TCell>
                  <TCell className="text-xs text-center"><StatusBadge status={r.action} /></TCell>
                  <TCell className="text-xs text-slate-500">{r.reason}</TCell>
                  <TCell className="text-xs text-center">{r.currentFacing}</TCell>
                  <TCell className="text-xs text-center font-semibold">{r.facingRec}</TCell>
                  <TCell className="text-xs text-right font-mono">{r.demandImpact}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Pipeline connection */}
      <AnalysisCard title="Pipeline Integration — Layer 2 → Layer 3" badge="Next Steps">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
            <div className="font-semibold text-teal-700 text-sm mb-2">SKU Optimizer (Next)</div>
            <p className="text-xs text-slate-600">Feed MNL choice probabilities + substitution matrix into the MILP optimizer to select the revenue-maximizing assortment subject to shelf, brand, and must-carry constraints.</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="font-semibold text-blue-700 text-sm mb-2">Monte Carlo Simulation</div>
            <p className="text-xs text-slate-600">Use MNL coefficient distributions (mean ± SE) to run 5,000 trials and build confidence intervals around demand forecasts and assortment decisions.</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="font-semibold text-purple-700 text-sm mb-2">Store Clustering Integration</div>
            <p className="text-xs text-slate-600">Estimate cluster-specific MNL models to capture preference heterogeneity across Premium Urban, High-Volume Suburban, Value-Oriented, and Neighborhood stores.</p>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function MNLDemandModelApp() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">MNL Demand Model</h1>
            <p className="text-sm text-slate-500 mt-1">Multinomial Logit choice modeling for CSD category assortment optimization</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-100 text-teal-800 border-teal-300">Layer 2: Assortment</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">R² = {(MNL_COEFFICIENTS.mcFaddenR2 * 100).toFixed(0)}%</Badge>
            <Badge variant="outline" className="text-slate-500">44 SKUs · 8 Brands · 48.2K obs</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exploration">Exploration</TabsTrigger>
          <TabsTrigger value="choiceset">Choice Set</TabsTrigger>
          <TabsTrigger value="estimation">Estimation</TabsTrigger>
          <TabsTrigger value="outputs">Outputs</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewSection /></TabsContent>
        <TabsContent value="exploration"><Phase1Section /></TabsContent>
        <TabsContent value="choiceset"><Phase2Section /></TabsContent>
        <TabsContent value="estimation"><Phase3Section /></TabsContent>
        <TabsContent value="outputs"><Phase4Section /></TabsContent>
        <TabsContent value="optimization"><Phase5Section /></TabsContent>
      </Tabs>
    </div>
  );
}
