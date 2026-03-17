"use client";

import React from "react";
import { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell, Legend,
} from "recharts";
import {
  ArrowRight, AlertTriangle, Check, Zap, Target, Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell as TCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Types
interface StoreCluster {
  id: string;
  name: string;
  storeCount: number;
  avgWeeklyBaskets: number;
  avgSalesArea: number;
  dominantMission: string;
  avgHHIncome: string;
  color: string;
}

interface DataRow {
  week: number;
  storeCluster: string;
  storeId: number;
  spaceColdCereal: number;
  spaceHotCereal: number;
  spacePancake: number;
  spaceSyrup: number;
  spaceBreakfastBar: number;
  totalSpace: number;
  salesColdCereal: number;
  salesHotCereal: number;
  salesPancake: number;
  salesSyrup: number;
  salesBreakfastBar: number;
  totalSales: number;
  weeklyBaskets: number;
  salesAreaSqFt: number;
  [key: string]: number | string;
}

interface StatRow {
  field: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
}

interface Coefficient {
  name: string;
  beta: number;
  stderr: number;
  tstat: number;
  pvalue: number;
}

interface RegressionResult {
  dependent: string;
  intercept: number;
  coefficients: Coefficient[];
  rSquared: number;
  adjRSquared: number;
  fStatistic: number;
  n: number;
  baseSales: number;
}

interface CorrCell {
  row: string;
  col: string;
  value: number;
}

interface AllocationRow {
  subcategory: string;
  currentSpace: number;
  optimalSpace: number;
  delta: number;
  currentSales: number;
  projectedSales: number;
  salesLift: number;
  salesLiftPct: number;
  shadowPrice: number;
}

interface PipelineStep {
  id: string;
  n: number;
  title: string;
  sub: string;
  icon: string;
  desc: string;
  insight: string;
}

// Data constants
const storeClusters: StoreCluster[] = [
  { id:"C1", name:"Urban High-Traffic", storeCount:187, avgWeeklyBaskets:14200, avgSalesArea:32000, dominantMission:"Top-Up / Convenience", avgHHIncome:"$85K–$120K", color:"#0891b2" },
  { id:"C2", name:"Suburban Family", storeCount:243, avgWeeklyBaskets:18500, avgSalesArea:48000, dominantMission:"Stock-Up / Weekly Shop", avgHHIncome:"$65K–$95K", color:"#059669" },
  { id:"C3", name:"Premium Metro", storeCount:98, avgWeeklyBaskets:11800, avgSalesArea:28000, dominantMission:"Fresh / Specialty", avgHHIncome:"$110K–$160K", color:"#7c3aed" },
  { id:"C4", name:"Value Rural", storeCount:232, avgWeeklyBaskets:9200, avgSalesArea:52000, dominantMission:"Bulk / Value", avgHHIncome:"$40K–$65K", color:"#d97706" },
];

const subcategories = [
  { id:"SC1", name:"Cold Cereals", color:"#0891b2" },
  { id:"SC2", name:"Hot Cereals", color:"#059669" },
  { id:"SC3", name:"Pancake/Waffle Mix", color:"#7c3aed" },
  { id:"SC4", name:"Syrup/Toppings", color:"#d97706" },
  { id:"SC5", name:"Breakfast Bars", color:"#e11d48" },
];

const TRUE_ELASTICITY = {
  labels: ["Cold Cereal","Hot Cereal","Pancake","Syrup","Breakfast Bar"],
  values: [
    [0.38,-0.08,0.03,-0.02,0.05],
    [-0.06,0.42,-0.04,0.06,-0.03],
    [0.02,-0.05,0.35,0.08,-0.02],
    [-0.03,0.04,0.07,0.31,-0.01],
    [0.04,-0.03,-0.02,-0.01,0.33],
  ],
  baseSales: { C1:[3200,1400,980,1100,2100], C2:[4100,1900,1350,1500,2600], C3:[3800,1200,1100,1400,2800], C4:[3500,1700,1200,1250,1800] } as Record<string, number[]>,
};

const CLUSTER_MULT: Record<string, number[]> = { C1:[.9,1.05,.95,.88,1.1], C2:[1,1,1,1,1], C3:[.85,.8,.9,1.15,1.2], C4:[1.1,1.15,1.05,.95,.85] };
const CLUST_COLORS: Record<string, string> = { C1:"#0891b2", C2:"#059669", C3:"#7c3aed", C4:"#d97706" };

function seededRng(seed: number): () => number { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function gauss(rng: () => number, m: number, sd: number): number { const u1 = rng(), u2 = rng(); return m + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }

function generateData(): DataRow[] {
  const rng = seededRng(42), data: DataRow[] = [];
  const baseSpace: Record<string, number[]> = { C1:[14,6,4,5,8], C2:[18,8,6,7,10], C3:[12,5,5,6,9], C4:[16,8,6,6,8] };
  const storesPerCluster = [8,10,5,10];
  const clusterIds = ["C1","C2","C3","C4"];
  for (let week = 1; week <= 52; week++) {
    for (let ci = 0; ci < 4; ci++) {
      const cid = clusterIds[ci], cl = storeClusters[ci];
      for (let si = 0; si < storesPerCluster[ci]; si++) {
        const storeId = ci * 100 + si + 1;
        const variation = week <= 26 ? 0.35 : 0.15;
        const spaces = baseSpace[cid].map(b => Math.max(2, Math.round(b * (1 + gauss(rng, 0, variation)) * 10) / 10));
        const totalSpace = spaces.reduce((a, b) => a + b, 0);
        const bs = TRUE_ELASTICITY.baseSales[cid], mult = CLUSTER_MULT[cid];
        const sales = bs.map((alpha, i) => {
          let ls = Math.log(alpha);
          for (let j = 0; j < 5; j++) ls += TRUE_ELASTICITY.values[i][j] * mult[i] * Math.log(spaces[j]);
          ls += gauss(rng, 0, 0.08);
          return Math.round(Math.exp(ls));
        });
        data.push({ week, storeCluster: cid, storeId,
          spaceColdCereal: spaces[0], spaceHotCereal: spaces[1], spacePancake: spaces[2], spaceSyrup: spaces[3], spaceBreakfastBar: spaces[4], totalSpace,
          salesColdCereal: sales[0], salesHotCereal: sales[1], salesPancake: sales[2], salesSyrup: sales[3], salesBreakfastBar: sales[4],
          totalSales: sales.reduce((a, b) => a + b, 0),
          weeklyBaskets: Math.round(cl.avgWeeklyBaskets * (1 + gauss(rng, 0, 0.1))),
          salesAreaSqFt: Math.round(cl.avgSalesArea * (1 + gauss(rng, 0, 0.05))),
        });
      }
    }
  }
  return data;
}

function quantile(arr: number[], q: number): number { const s = [...arr].sort((a, b) => a - b), p = (s.length - 1) * q, b = Math.floor(p), r = p - b; return s[b + 1] !== undefined ? s[b] + r * (s[b + 1] - s[b]) : s[b]; }

function computeStats(data: DataRow[]): StatRow[] {
  const fields = [
    { key:"spaceColdCereal", label:"Space: Cold Cereal (ft)" },
    { key:"spaceHotCereal", label:"Space: Hot Cereal (ft)" },
    { key:"spacePancake", label:"Space: Pancake Mix (ft)" },
    { key:"spaceSyrup", label:"Space: Syrup (ft)" },
    { key:"spaceBreakfastBar", label:"Space: Breakfast Bar (ft)" },
    { key:"salesColdCereal", label:"Sales: Cold Cereal ($)" },
    { key:"salesHotCereal", label:"Sales: Hot Cereal ($)" },
    { key:"salesPancake", label:"Sales: Pancake Mix ($)" },
    { key:"salesSyrup", label:"Sales: Syrup ($)" },
    { key:"salesBreakfastBar", label:"Sales: Breakfast Bar ($)" },
  ];
  return fields.map(({ key, label }) => {
    const v = data.map(d => d[key] as number), n = v.length, mean = v.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
    return { field: label, count: n, mean: +mean.toFixed(2), std: +std.toFixed(2), min: +Math.min(...v).toFixed(2), q25: +quantile(v, .25).toFixed(2), median: +quantile(v, .5).toFixed(2), q75: +quantile(v, .75).toFixed(2), max: +Math.max(...v).toFixed(2) };
  });
}

function olsRegression(y: number[], X: number[][]): { betas: number[]; rSq: number; adjRSq: number; fSt: number; stderrs: number[] } {
  const n = y.length, k = X[0].length;
  const XtX: number[][] = Array(k).fill(0).map(() => Array(k).fill(0));
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { let s = 0; for (let r = 0; r < n; r++) s += X[r][i] * X[r][j]; XtX[i][j] = s; }
  const Xty: number[] = Array(k).fill(0);
  for (let i = 0; i < k; i++) { let s = 0; for (let r = 0; r < n; r++) s += X[r][i] * y[r]; Xty[i] = s; }
  const aug: number[][] = XtX.map((row, i) => [...row, Xty[i]]);
  for (let i = 0; i < k; i++) {
    let mx = i; for (let r = i + 1; r < k; r++) if (Math.abs(aug[r][i]) > Math.abs(aug[mx][i])) mx = r;
    [aug[i], aug[mx]] = [aug[mx], aug[i]];
    const pv = aug[i][i]; if (Math.abs(pv) < 1e-12) continue;
    for (let j = i; j <= k; j++) aug[i][j] /= pv;
    for (let r = 0; r < k; r++) { if (r === i) continue; const f = aug[r][i]; for (let j = i; j <= k; j++) aug[r][j] -= f * aug[i][j]; }
  }
  const betas = aug.map(r => r[k]);
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let ssRes = 0, ssTot = 0;
  for (let r = 0; r < n; r++) { let yH = 0; for (let j = 0; j < k; j++) yH += X[r][j] * betas[j]; ssRes += (y[r] - yH) ** 2; ssTot += (y[r] - yMean) ** 2; }
  const rSq = 1 - ssRes / ssTot, adjRSq = 1 - (1 - rSq) * (n - 1) / (n - k), fSt = ((ssTot - ssRes) / (k - 1)) / (ssRes / (n - k));
  const mse = ssRes / (n - k);
  const inv: number[][] = Array(k).fill(0).map((_: number, i: number) => { const r = Array(k).fill(0); r[i] = 1; return r; });
  const mat: number[][] = XtX.map((r: number[]) => [...r]);
  for (let i = 0; i < k; i++) {
    let mx = i; for (let r = i + 1; r < k; r++) if (Math.abs(mat[r][i]) > Math.abs(mat[mx][i])) mx = r;
    [mat[i], mat[mx]] = [mat[mx], mat[i]]; [inv[i], inv[mx]] = [inv[mx], inv[i]];
    const pv = mat[i][i]; if (Math.abs(pv) < 1e-12) continue;
    for (let j = 0; j < k; j++) { mat[i][j] /= pv; inv[i][j] /= pv; }
    for (let r = 0; r < k; r++) { if (r === i) continue; const f = mat[r][i]; for (let j = 0; j < k; j++) { mat[r][j] -= f * mat[i][j]; inv[r][j] -= f * inv[i][j]; } }
  }
  const stderrs = inv.map((r: number[], i: number) => Math.sqrt(Math.max(0, mse * r[i])));
  return { betas, rSq, adjRSq, fSt, stderrs };
}

function runRegression(data: DataRow[], cluster?: string): RegressionResult[] {
  const filtered = cluster ? data.filter(d => d.storeCluster === cluster) : data;
  const spaceKeys = ["spaceColdCereal","spaceHotCereal","spacePancake","spaceSyrup","spaceBreakfastBar"];
  const salesKeys = ["salesColdCereal","salesHotCereal","salesPancake","salesSyrup","salesBreakfastBar"];
  const names = ["Cold Cereal","Hot Cereal","Pancake Mix","Syrup","Breakfast Bar"];
  const spaceNames = names.map(n => `ln(Space_${n.replace(/\s/g, "")})`);
  return salesKeys.map((sk, dep) => {
    const y = filtered.map(d => Math.log(d[sk] as number));
    const X = filtered.map(d => [1, ...spaceKeys.map(s => Math.log(d[s] as number))]);
    const ols = olsRegression(y, X);
    const coefficients: Coefficient[] = spaceNames.map((nm, i) => {
      const beta = ols.betas[i + 1], se = ols.stderrs[i + 1], t = se > 0 ? beta / se : 0;
      const pv = Math.max(.0001, 2 * Math.exp(-.717 * Math.abs(t) - .416 * t * t));
      return { name: nm, beta: +beta.toFixed(3), stderr: +se.toFixed(3), tstat: +(t).toFixed(2), pvalue: +pv.toFixed(4) };
    });
    return { dependent: `ln(Sales_${names[dep].replace(/\s/g, "")})`, intercept: +ols.betas[0].toFixed(3), coefficients, rSquared: +ols.rSq.toFixed(4), adjRSquared: +ols.adjRSq.toFixed(4), fStatistic: +ols.fSt.toFixed(2), n: filtered.length, baseSales: Math.round(Math.exp(ols.betas[0])) };
  });
}

function getDimCurve(baseSales: number, elasticity: number, min: number, max: number): { space: number; salesPower: number; salesLinear: number; marginalReturn: number }[] {
  const pts: { space: number; salesPower: number; salesLinear: number; marginalReturn: number }[] = [];
  for (let s = min; s <= max; s += 0.5) {
    pts.push({ space: +(s).toFixed(1), salesPower: Math.round(baseSales * Math.pow(s, elasticity)), salesLinear: Math.round(baseSales + (baseSales * Math.pow(10, elasticity) / 10) * (s - 1)), marginalReturn: Math.round(baseSales * elasticity * Math.pow(s, elasticity - 1)) });
  }
  return pts;
}

function computeAllocation(regs: RegressionResult[], currentSpaces: number[], budget: number): AllocationRow[] {
  const names = ["Cold Cereal","Hot Cereal","Pancake Mix","Syrup","Breakfast Bar"];
  const ownE = regs.map((r, i) => r.coefficients[i]?.beta || .35);
  const bs = regs.map(r => r.baseSales);
  const weights = ownE.map((b, i) => Math.pow(bs[i] * Math.abs(b), 1 / (1 - b)));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const optSpaces = weights.map(w => +(budget * (w / wSum)).toFixed(1));
  const shadowPrices = ownE.map((b, i) => +(bs[i] * b * Math.pow(optSpaces[i], b - 1)).toFixed(2));
  return names.map((nm, i) => {
    const curS = bs[i] * Math.pow(currentSpaces[i], ownE[i]);
    const projS = bs[i] * Math.pow(optSpaces[i], ownE[i]);
    return { subcategory: nm, currentSpace: currentSpaces[i], optimalSpace: optSpaces[i], delta: +(optSpaces[i] - currentSpaces[i]).toFixed(1), currentSales: Math.round(curS), projectedSales: Math.round(projS), salesLift: Math.round(projS - curS), salesLiftPct: +((projS - curS) / curS * 100).toFixed(1), shadowPrice: shadowPrices[i] };
  });
}

function computeCorrelation(data: DataRow[]): CorrCell[] {
  const keys = [
    { key:"spaceColdCereal", label:"Sp:ColdCer" }, { key:"spaceHotCereal", label:"Sp:HotCer" }, { key:"spacePancake", label:"Sp:Pancake" }, { key:"spaceSyrup", label:"Sp:Syrup" }, { key:"spaceBreakfastBar", label:"Sp:BrkBar" },
    { key:"salesColdCereal", label:"Sa:ColdCer" }, { key:"salesHotCereal", label:"Sa:HotCer" }, { key:"salesPancake", label:"Sa:Pancake" }, { key:"salesSyrup", label:"Sa:Syrup" }, { key:"salesBreakfastBar", label:"Sa:BrkBar" },
  ];
  const cells: CorrCell[] = [];
  for (const row of keys) {
    const xv = data.map(d => d[row.key] as number), xm = xv.reduce((a, b) => a + b, 0) / xv.length;
    for (const col of keys) {
      const yv = data.map(d => d[col.key] as number), ym = yv.reduce((a, b) => a + b, 0) / yv.length;
      let num = 0, dx2 = 0, dy2 = 0;
      for (let i = 0; i < xv.length; i++) { const dx = xv[i] - xm, dy = yv[i] - ym; num += dx * dy; dx2 += dx * dx; dy2 += dy * dy; }
      cells.push({ row: row.label, col: col.label, value: +(num / Math.sqrt(dx2 * dy2)).toFixed(2) });
    }
  }
  return cells;
}

// Pipeline steps with rich narrative content
const pipelineSteps: PipelineStep[] = [
  { id:"data-source", n:1, title:"Data Pipeline", sub:"Where does the data come from?", icon:"Database",
    desc:"Space elasticity doesn't start from scratch. It sits in the middle of a pipeline, consuming outputs from two analyses you've already done (CDT and Store Clustering) plus raw transaction data. Think of it like this: CDT tells you what products to group together (Cold Cereal, Hot Cereal, etc.). Store Clustering tells you which stores behave similarly (Urban vs Rural). Space elasticity asks: \"if I give Cold Cereal 2 more feet of shelf space in Urban stores, how much more will it sell?\" The raw data is simple — imagine a spreadsheet where each row is one store in one week, and you have columns for how many feet of shelf you gave each subcategory, and how much each subcategory sold.",
    insight:"In production, space data comes from planogram systems (JDA/BY Space Planning, Nexgen). For this demo, we use experimentally varied shelf allocations across 52 weeks." },
  { id:"profiling", n:2, title:"Data Profiling", sub:"What does the raw data look like?", icon:"FileSearch",
    desc:"Before building any model, you check the basics. The key insight from profiling is that when space changes, sales change too — but they move at very different magnitudes. For example, a store going from 18.2 ft → 12.1 ft of Cold Cereal space (−33%) sees sales drop from $4,280 → $3,510 (−18%). Sales didn't drop proportionally. That's your first hint of diminishing returns.",
    insight:"Space typically ranges 2–25 ft per subcategory. Sales range $500–$8,000/week. The ratio of variation matters: if space barely varies but sales vary a lot, your elasticity estimates will be noisy." },
  { id:"eda", n:3, title:"Exploratory Analysis", sub:"What does the space-sales relationship look like?", icon:"Scatter",
    desc:"Now you plot space on the x-axis and sales on the y-axis for each subcategory. This is the most important diagnostic step — it tells you whether a simple linear model will work, or if you need something more sophisticated. The scatter plot reveals two critical things. First, more space does lead to more sales — the relationship is positive. Second, the relationship curves. The first few feet of space produce a big jump in sales, but after about 15 feet, adding more space barely moves the needle. This is diminishing returns, and it's the entire reason we use a log-log model instead of a simple linear one.",
    insight:"The EDA step also includes a correlation matrix — a grid that shows how strongly each space variable is linked to each sales variable. The key pattern: each subcategory's space is most strongly correlated with its own sales (the diagonal), and only weakly correlated with other subcategories' sales." },
  { id:"loglog", n:4, title:"Log-Log Transform", sub:"The core trick — why power functions capture diminishing returns", icon:"TrendingUp",
    desc:"This is the conceptual heart of space elasticity. Our data lives on a curve, but the simplest regression tool (OLS) can only fit straight lines. The log-log transform is the bridge. The model is: Sales = α × Space₁^β₁ × Space₂^β₂ × ... Taking log of both sides: ln(Sales) = ln(α) + β₁·ln(Space₁) + β₂·ln(Space₂) + ... This converts a multiplicative power function into a linear equation that OLS can solve.",
    insight:"The elasticity number (e.g. 0.33) has a beautiful plain-English meaning — a 1% increase in space leads to a 0.33% increase in sales. It works in percentages, not dollars or feet, which is why it captures diminishing returns. Doubling from 5→10 feet (+100%) has the same percentage effect as 20→40 feet (+100%)." },
  { id:"regression", n:5, title:"Regression Analysis", sub:"Finding the elasticities with OLS", icon:"BarChart3",
    desc:"Now that we've transformed the data into log-world where everything is linear, we run OLS (ordinary least squares) regression. We run five separate regressions — one for each subcategory's sales. Each regression produces a set of coefficients (β values). The crucial distinction: Own-elasticity (β₁ in the Cold Cereal model) = what happens to Cold Cereal sales when you change Cold Cereal space — always positive. Cross-elasticity (β₂) = what happens to Cold Cereal sales when you change Hot Cereal space — can be negative (substitutes) or positive (complements).",
    insight:"The regression also gives you R² (how much of the sales variation is explained by space) and p-values (whether each coefficient is statistically significant or just noise). Typical own-elasticities in grocery range 0.15–0.45." },
  { id:"matrix", n:6, title:"Elasticity Matrix", sub:"The big picture in one grid", icon:"Grid3X3",
    desc:"When you stack all five regressions together, you get a 5×5 matrix. This is the single most important output of the entire pipeline. How to read it: pick any cell. The row tells you whose sales you're measuring. The column tells you whose space changed. So the cell at (Sales: Pancake, Space: Syrup) = +0.08 means \"a 1% increase in Syrup's shelf space lifts Pancake sales by 0.08%.\" That's a complement relationship — they're breakfast buddies.",
    insight:"The diagonal (highlighted) is always the most important — those are own-elasticities. Hot Cereal at 0.42 is the most space-responsive subcategory; Syrup at 0.31 is the least. This tells you where an extra foot of space has the most bang for the buck." },
  { id:"clusters", n:7, title:"Per-Cluster Estimation", sub:"One size doesn't fit all", icon:"Boxes",
    desc:"Here's the twist: running the regression on all stores together gives you average elasticities. But a premium metro store responds to space differently than a rural value store. So we run the regression separately for each cluster. This is where store clustering pays off. If you treated all stores the same, you'd give them all the same space plan. But the data shows that Rural stores need more cereal space (high elasticity → high return per foot), while Premium stores need more bar space.",
    insight:"The biggest ROI comes from clusters where elasticities are highest AND current allocation is furthest from optimal. The space allocation optimizer downstream must be cluster-aware." },
  { id:"allocation", n:8, title:"Space Allocation", sub:"Making it actionable with shadow prices", icon:"Calculator",
    desc:"Finally, we use the elasticities to answer the business question: given a fixed total shelf budget (say 41 feet), how should we split it across subcategories to maximize total sales? The method is Lagrangian optimization — keep moving space from where it has low marginal return to where it has high marginal return, until the marginal return per foot is equal everywhere.",
    insight:"The shadow price concept is the most actionable insight. Right now, the last foot of Syrup space is generating only $42/week. But if you moved that foot to Cold Cereal, it would generate $85/week — a net gain of $43 just from rearranging one foot of shelf. Across 760 stores, that's $1.7M annually." },
];

const fmt = (n: number, d = 0): string => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// Shared style helpers (inline only for recharts)
const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13 };
const axisTick = { fill: "#475569", fontSize: 12 };
const gridStroke = "#e2e8f0";

// Component helpers
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
        {insight && <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-1">{"↳"} {insight}</p>}
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

// Section components
function PipelineSection({ data, pipelineSteps: steps }: { data: DataRow[]; pipelineSteps: PipelineStep[] }) {
  const step = steps[0];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <AnalysisCard title="Data Flow" badge="Pipeline">
        <div className="flex items-center gap-3 flex-wrap">
          {[{ l:"POS Transactions", s:"Breakfast at the Frat" }, { l:"Store Clustering", s:"4 clusters (KMeans/GMM)" }, { l:"CDT Structure", s:"5 subcategories" }, { l:"Space Data", s:"Weekly ft allocations" }].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ArrowRight size={14} className="text-slate-400"/>}
              <div className="border border-slate-300 bg-slate-50 rounded-lg px-4 py-2.5">
                <p className="text-sm font-medium text-slate-900">{item.l}</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{item.s}</p>
              </div>
            </React.Fragment>
          ))}
          <ArrowRight size={14} className="text-teal-600"/>
          <div className="border-2 border-teal-400/40 bg-teal-50 rounded-lg px-4 py-2.5 shadow-sm">
            <p className="text-sm font-bold text-teal-700">Space Elasticity</p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Log-log regression</p>
          </div>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-4 gap-4">
        {[{ l:"Observations", v:fmt(data.length), s:"rows in dataset" }, { l:"Stores Sampled", v:fmt(new Set(data.map(d => d.storeId)).size), s:"across 4 clusters" },
          { l:"Weeks", v:"52", s:"26 experimental + 26 BAU" }, { l:"Subcategories", v:"5", s:"from CDT analysis" }].map((m, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-4">
              <Metric value={m.v} label={m.l} />
              <p className="text-xs text-slate-400 text-center mt-1">{m.s}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnalysisCard title="Store Clusters" badge="From upstream pipeline">
        <div className="grid grid-cols-2 gap-3">
          {storeClusters.map(cl => (
            <div key={cl.id} className="border border-slate-200 rounded-lg p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold shrink-0" style={{ background: cl.color + "20", color: cl.color }}>{cl.id}</div>
              <div>
                <p className="text-sm font-medium text-slate-900">{cl.name}</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 mt-1.5 text-[10px] font-mono">
                  <span className="text-slate-500">Stores:</span><span className="text-slate-800">{cl.storeCount}</span>
                  <span className="text-slate-500">Avg baskets/wk:</span><span className="text-slate-800">{fmt(cl.avgWeeklyBaskets)}</span>
                  <span className="text-slate-500">Mission:</span><span className="text-slate-800">{cl.dominantMission}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnalysisCard>
    </div>
  );
}

function ProfilingSection({ data, stats, pipelineSteps: steps }: { data: DataRow[]; stats: StatRow[]; pipelineSteps: PipelineStep[] }) {
  const step = steps[1];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <AnalysisCard title="Descriptive Statistics" badge={`${fmt(data.length)} rows`}>
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["Variable","Count","Mean","Std","Min","Q25","Median","Q75","Max"].map(h => (
                  <TableHead key={h} className={`text-xs font-medium text-slate-400 uppercase tracking-wider ${h !== "Variable" ? "text-right" : ""}`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s, i) => {
                const isSpace = s.field.startsWith("Space");
                return (
                  <TableRow key={i}>
                    <TCell className={`font-mono text-xs ${isSpace ? "text-cyan-600" : "text-emerald-600"}`}>{s.field}</TCell>
                    <TCell className="text-right text-slate-500 font-mono text-xs">{fmt(s.count)}</TCell>
                    <TCell className="text-right text-slate-900 font-medium font-mono text-xs">{s.mean.toFixed(isSpace ? 1 : 0)}</TCell>
                    <TCell className="text-right text-slate-500 font-mono text-xs">{s.std.toFixed(isSpace ? 1 : 0)}</TCell>
                    <TCell className="text-right text-slate-500 font-mono text-xs">{s.min}</TCell>
                    <TCell className="text-right text-slate-600 font-mono text-xs">{s.q25}</TCell>
                    <TCell className="text-right text-slate-900 font-mono text-xs">{s.median}</TCell>
                    <TCell className="text-right text-slate-600 font-mono text-xs">{s.q75}</TCell>
                    <TCell className="text-right text-slate-500 font-mono text-xs">{s.max}</TCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-3 gap-4">
        {[{ icon:<Check size={14} className="text-teal-600"/>, title:"No Missing Values", desc:`All ${fmt(data.length)} rows complete.`, cls:"bg-teal-50 border-l-teal-500" },
          { icon:<AlertTriangle size={14} className="text-amber-600"/>, title:"High Variance in Space", desc:"Weeks 1-26 show higher variation (experimental phase).", cls:"bg-amber-50 border-l-amber-500" },
          { icon:<Zap size={14} className="text-teal-600"/>, title:"Scale Difference", desc:"Space: 2-25 ft; Sales: $500-$8K. Log-transform normalizes this.", cls:"bg-teal-50 border-l-teal-500" },
        ].map((c, i) => (
          <div key={i} className={`border-l-[3px] p-4 rounded-r-lg ${c.cls}`}>
            <div className="flex items-center gap-2 mb-1.5">{c.icon}<p className="text-sm font-medium text-slate-900">{c.title}</p></div>
            <p className="text-xs text-slate-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EdaSection({ selectedSubcat, setSelectedSubcat, scatterData, corrMatrix, scatterKeys, pipelineSteps: steps }: {
  selectedSubcat: number; setSelectedSubcat: (i: number) => void;
  scatterData: { space: number; sales: number; logSpace: number; logSales: number; cluster: string }[];
  corrMatrix: CorrCell[]; scatterKeys: { space: string; sales: string; label: string }[];
  pipelineSteps: PipelineStep[];
}) {
  const step = steps[2];
  const names5 = ["Cold Cereal","Hot Cereal","Pancake Mix","Syrup","Breakfast Bar"];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <div className="flex gap-2 mb-4">
        {names5.map((name, i) => (
          <button key={i} onClick={() => setSelectedSubcat(i)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${selectedSubcat === i ? "bg-teal-100 text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {name}
          </button>
        ))}
      </div>

      <AnalysisCard title={`Own-Space vs. Sales — ${scatterKeys[selectedSubcat].label}`} insight="Each dot = one store-week. Colors = store clusters.">
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top:10, right:20, bottom:30, left:50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
            <XAxis type="number" dataKey="space" tick={axisTick} label={{ value:"Space (ft)", position:"bottom", offset:10, fill:"#64748b", fontSize:11 }}/>
            <YAxis type="number" dataKey="sales" tick={axisTick} label={{ value:"Weekly Sales ($)", angle:-90, position:"insideLeft", offset:-35, fill:"#64748b", fontSize:11 }}/>
            <Tooltip content={({ payload }: any) => {
              if (!payload?.length) return null; const p = payload[0].payload;
              return <div style={tooltipStyle} className="px-2.5 py-1.5 font-mono text-xs">
                <p className="text-slate-900">Space: {p.space.toFixed(1)} ft &middot; Sales: ${fmt(p.sales)}</p>
                <p className="text-slate-500">Cluster: {p.cluster}</p>
              </div>;
            }}/>
            {["C1","C2","C3","C4"].map(cl => (
              <Scatter key={cl} data={scatterData.filter(d => d.cluster === cl)} fill={CLUST_COLORS[cl]} fillOpacity={0.5} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2">
          {storeClusters.map(cl => (
            <div key={cl.id} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: cl.color }}/>
              {cl.id}: {cl.name}
            </div>
          ))}
        </div>
      </AnalysisCard>

      <AnalysisCard title="Correlation Matrix — Space x Sales" badge="10x10">
        {(() => {
          const labels = ["Sp:ColdCer","Sp:HotCer","Sp:Pancake","Sp:Syrup","Sp:BrkBar","Sa:ColdCer","Sa:HotCer","Sa:Pancake","Sa:Syrup","Sa:BrkBar"];
          return (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><th className="p-0.5"></th>{labels.map(l => <th key={l} className="p-0.5 text-[9px] font-mono text-slate-500 text-center min-w-[52px]">{l}</th>)}</tr></thead>
                <tbody>{labels.map((rl, ri) => (
                  <tr key={rl}><td className="p-0.5 text-[9px] font-mono text-slate-500 text-right pr-1.5">{rl}</td>
                    {labels.map((cl, ci) => {
                      const cell = corrMatrix.find(c => c.row === rl && c.col === cl);
                      const val = cell?.value || 0, abs = Math.abs(val), isOwn = (ri < 5 && ci === ri + 5) || (ci < 5 && ri === ci + 5);
                      const bg = val > 0 ? `rgba(34,211,238,${abs * 0.5})` : `rgba(251,113,133,${abs * 0.5})`;
                      return <td key={cl} className="p-0.5 text-center">
                        <div className="text-[9px] font-mono rounded px-1 py-0.5"
                          style={{
                            background: ri === ci ? "rgba(255,255,255,0.08)" : bg,
                            outline: isOwn ? "1px solid rgba(34,211,238,0.5)" : "none",
                            color: abs > 0.3 ? "#fff" : "#64748b"
                          }}>{val.toFixed(2)}</div>
                      </td>;
                    })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          );
        })()}
      </AnalysisCard>
    </div>
  );
}

function LogLogSection({ selectedSubcat, setSelectedSubcat, scatterData, scatterKeys, regAll, dimCurve, pipelineSteps: steps }: {
  selectedSubcat: number; setSelectedSubcat: (i: number) => void;
  scatterData: { space: number; sales: number; logSpace: number; logSales: number; cluster: string }[];
  scatterKeys: { space: string; sales: string; label: string }[];
  regAll: RegressionResult[];
  dimCurve: { space: number; salesPower: number; salesLinear: number; marginalReturn: number }[];
  pipelineSteps: PipelineStep[];
}) {
  const step = steps[3];
  const names5 = ["Cold Cereal","Hot Cereal","Pancake Mix","Syrup","Breakfast Bar"];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <div className="flex gap-2 mb-4">
        {names5.map((name, i) => (
          <button key={i} onClick={() => setSelectedSubcat(i)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${selectedSubcat === i ? "bg-teal-100 text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[{ title:"Raw Scale (curved)", sub:"Space (ft) vs Sales ($)", xKey:"space", yKey:"sales", xLabel:"Space (ft)", yLabel:"Sales ($)", fill:"#0891b2" },
          { title:"Log-Log Scale (linearized)", sub:"ln(Space) vs ln(Sales)", xKey:"logSpace", yKey:"logSales", xLabel:"ln(Space)", yLabel:"ln(Sales)", fill:"#059669" }
        ].map((chart, ci) => (
          <AnalysisCard key={ci} title={chart.title} insight={chart.sub}>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top:5, right:10, bottom:25, left:40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                <XAxis type="number" dataKey={chart.xKey} tick={axisTick} label={{ value:chart.xLabel, position:"bottom", offset:8, fill:"#64748b", fontSize:10 }}/>
                <YAxis type="number" dataKey={chart.yKey} tick={axisTick} label={{ value:chart.yLabel, angle:-90, position:"insideLeft", offset:-28, fill:"#64748b", fontSize:10 }}/>
                <Scatter data={scatterData} fill={chart.fill} fillOpacity={0.35} />
              </ScatterChart>
            </ResponsiveContainer>
          </AnalysisCard>
        ))}
      </div>

      {(() => {
        const reg = regAll[selectedSubcat], ownBeta = reg.coefficients[selectedSubcat]?.beta || .35;
        return (
          <AnalysisCard title="The Mathematical Bridge" badge="Core Transformation">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-5 items-center">
              <div className="text-center">
                <p className="text-[9px] font-mono text-slate-500 mb-1.5">REAL WORLD (power curve)</p>
                <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm">
                  <span className="text-slate-900">Sales</span><span className="text-slate-500"> = </span><span className="text-amber-600">{fmt(reg.baseSales)}</span><span className="text-slate-500"> x </span><span className="text-cyan-600">Space</span><sup className="text-emerald-600">{ownBeta}</sup>
                </div>
              </div>
              <div className="text-center">
                <ArrowRight size={20} className="text-slate-500"/>
                <p className="text-[9px] font-mono text-slate-500 mt-1">take log</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono text-slate-500 mb-1.5">LOG WORLD (straight line)</p>
                <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm">
                  <span className="text-slate-900">ln(Sales)</span><span className="text-slate-500"> = </span><span className="text-amber-600">{reg.intercept.toFixed(2)}</span><span className="text-slate-500"> + </span><span className="text-emerald-600">{ownBeta}</span><span className="text-slate-500"> &middot; </span><span className="text-cyan-600">ln(Space)</span>
                </div>
              </div>
            </div>
          </AnalysisCard>
        );
      })()}

      <AnalysisCard title={`Diminishing Returns — ${scatterKeys[selectedSubcat].label}`} badge="Power vs Linear">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dimCurve} margin={{ top:5, right:20, bottom:25, left:50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
            <XAxis dataKey="space" tick={axisTick} label={{ value:"Space (ft)", position:"bottom", offset:8, fill:"#64748b", fontSize:11 }}/>
            <YAxis tick={axisTick} label={{ value:"Predicted Sales ($)", angle:-90, position:"insideLeft", offset:-35, fill:"#64748b", fontSize:11 }}/>
            <Tooltip content={({ payload }: any) => {
              if (!payload?.length) return null; const p = payload[0].payload;
              return <div style={tooltipStyle} className="px-2.5 py-1.5 font-mono text-xs">
                <p className="text-slate-900">Space: {p.space} ft</p>
                <p className="text-cyan-600">Power: ${fmt(p.salesPower)}</p>
                <p className="text-slate-500">Linear: ${fmt(p.salesLinear)}</p>
              </div>;
            }}/>
            <Line type="monotone" dataKey="salesPower" stroke="#0891b2" strokeWidth={2.5} dot={false} name="Power (actual)"/>
            <Line type="monotone" dataKey="salesLinear" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="Linear (naive)"/>
            <Legend/>
          </LineChart>
        </ResponsiveContainer>
      </AnalysisCard>
    </div>
  );
}

function RegressionSection({ selectedSubcat, setSelectedSubcat, selectedCluster, curRegs, pipelineSteps: steps }: {
  selectedSubcat: number; setSelectedSubcat: (i: number) => void;
  selectedCluster: string | undefined; curRegs: RegressionResult[];
  pipelineSteps: PipelineStep[];
}) {
  const step = steps[4];
  const names5 = ["Cold Cereal","Hot Cereal","Pancake","Syrup","Brkfst Bar"];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      {selectedCluster && (
        <div className="bg-amber-50 border-l-[3px] border-l-amber-500 px-4 py-2.5 rounded-r-lg flex items-center gap-2">
          <Info size={14} className="text-amber-600"/>
          <p className="text-sm text-slate-800">Showing regression for <strong className="text-slate-900">Cluster {selectedCluster}</strong></p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {names5.map((name, i) => (
          <button key={i} onClick={() => setSelectedSubcat(i)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${selectedSubcat === i ? "bg-teal-100 text-slate-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {curRegs.map((r, i) => (
          <Card key={i} className={`shadow-sm cursor-pointer transition-all ${selectedSubcat === i ? "border-teal-400 ring-1 ring-teal-200" : "border-slate-200 hover:border-slate-300"}`}
            onClick={() => setSelectedSubcat(i)}>
            <CardContent className="pt-4">
              <p className="text-[9px] font-mono text-slate-500 uppercase">{names5[i]}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">R&sup2; = {r.rSquared.toFixed(3)}</p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">Own &beta; = <span className="text-cyan-600">{r.coefficients[i]?.beta.toFixed(3)}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(() => {
        const reg = curRegs[selectedSubcat];
        return (
          <AnalysisCard title={`OLS Regression — ${reg.dependent}`}
            badge={`R²=${reg.rSquared.toFixed(4)} · F=${reg.fStatistic} · n=${fmt(reg.n)}`}>
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Variable","\u03B2 (elasticity)","Std Err","t-stat","p-value","Sig","Interpretation"].map(h => (
                      <TableHead key={h} className={`text-xs font-medium text-slate-400 uppercase tracking-wider ${h !== "Variable" && h !== "Interpretation" ? "text-right" : ""}`}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-slate-50/80">
                    <TCell className="font-mono text-xs text-amber-600">Intercept (ln &alpha;)</TCell>
                    <TCell className="text-right font-mono text-xs font-medium text-slate-900">{reg.intercept.toFixed(3)}</TCell>
                    <TCell colSpan={4} className="text-right font-mono text-xs text-slate-500">&mdash;</TCell>
                    <TCell className="text-xs text-slate-600">Base sales &alpha; = ${fmt(reg.baseSales)}</TCell>
                  </TableRow>
                  {reg.coefficients.map((c, ci) => {
                    const isOwn = ci === selectedSubcat;
                    const sig = c.pvalue < .001 ? "***" : c.pvalue < .01 ? "**" : c.pvalue < .05 ? "*" : "ns";
                    const sigClr = sig === "***" ? "text-emerald-600" : sig === "**" ? "text-cyan-600" : sig === "*" ? "text-amber-600" : "text-slate-500";
                    return (
                      <TableRow key={ci} className={isOwn ? "bg-teal-50/50" : ""}>
                        <TCell className={`font-mono text-xs ${isOwn ? "text-cyan-600 font-medium" : "text-slate-600"}`}>
                          {c.name} {isOwn && <span className="text-cyan-400 text-[9px]">(own)</span>}
                        </TCell>
                        <TCell className={`text-right font-mono text-xs font-medium ${c.beta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {c.beta >= 0 ? "+" : ""}{c.beta.toFixed(3)}
                        </TCell>
                        <TCell className="text-right font-mono text-xs text-slate-500">{c.stderr.toFixed(3)}</TCell>
                        <TCell className="text-right font-mono text-xs text-slate-600">{c.tstat.toFixed(2)}</TCell>
                        <TCell className="text-right font-mono text-xs text-slate-500">{c.pvalue < .0001 ? "<0.0001" : c.pvalue.toFixed(4)}</TCell>
                        <TCell className={`text-right font-mono text-xs ${sigClr}`}>{sig}</TCell>
                        <TCell className="text-xs text-slate-600">{isOwn ? `+1% space → +${c.beta.toFixed(2)}% sales` : c.beta >= 0 ? `Complement (+${c.beta.toFixed(2)}%)` : `Substitute (${c.beta.toFixed(2)}%)`}</TCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 bg-slate-50 rounded-lg p-3 font-mono text-sm">
              <span className="text-slate-500">Decoded: </span><span className="text-slate-900">Sales</span><span className="text-slate-500"> = </span><span className="text-amber-600">{fmt(reg.baseSales)}</span>
              {reg.coefficients.map((c, i) => <span key={i}><span className="text-slate-500"> x </span><span className="text-cyan-600">s{i + 1}</span><sup className={c.beta >= 0 ? "text-emerald-600" : "text-rose-600"}>{c.beta.toFixed(3)}</sup></span>)}
            </div>
          </AnalysisCard>
        );
      })()}
    </div>
  );
}

function MatrixSection({ selectedCluster, curRegs, pipelineSteps: steps }: {
  selectedCluster: string | undefined; curRegs: RegressionResult[];
  pipelineSteps: PipelineStep[];
}) {
  const step = steps[5];
  const names5 = ["Cold Cereal","Hot Cereal","Pancake","Syrup","Brkfst Bar"];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <AnalysisCard title={`Estimated Elasticity Matrix ${selectedCluster ? `(Cluster ${selectedCluster})` : "(All Clusters)"}`}
        insight="Rows = sales response, Columns = space driver. Diagonal = own-elasticity.">
        <table className="w-full">
          <thead><tr><th className="p-2"></th>{names5.map(n => <th key={n} className="p-2 text-[10px] font-mono text-slate-500 text-center">{n}</th>)}</tr></thead>
          <tbody>
            {curRegs.map((r, ri) => (
              <tr key={ri}>
                <td className="p-2 text-[10px] font-mono text-slate-500 font-semibold">{names5[ri]}</td>
                {r.coefficients.map((c, ci) => {
                  const isOwn = ri === ci, abs = Math.abs(c.beta);
                  return <td key={ci} className="p-1 text-center">
                    <div className="rounded-md py-2 px-1.5 font-mono text-sm"
                      style={{
                        fontWeight: isOwn ? 700 : 500,
                        background: isOwn ? `rgba(6,182,212,${0.15 + abs * 0.5})` : c.beta > 0 ? `rgba(52,211,153,${abs * 2})` : `rgba(251,113,133,${abs * 2})`,
                        color: isOwn ? "#fff" : abs > 0.05 ? "#fff" : "#64748b",
                        border: isOwn ? "2px solid rgba(14,116,144,0.4)" : "1px solid transparent"
                      }}>
                      {c.beta >= 0 ? "+" : ""}{c.beta.toFixed(3)}
                    </div>
                  </td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="True Elasticity Matrix (ground truth)" badge="Reference">
          <table className="w-full">
            <thead><tr><th className="p-1.5"></th>{names5.map(n => <th key={n} className="p-1.5 text-[9px] font-mono text-slate-500 text-center">{n}</th>)}</tr></thead>
            <tbody>
              {TRUE_ELASTICITY.values.map((row, ri) => (
                <tr key={ri}>
                  <td className="p-1.5 text-[9px] font-mono text-slate-500">{names5[ri]}</td>
                  {row.map((val, ci) => (
                    <td key={ci} className="p-0.5 text-center">
                      <div className={`text-xs font-mono p-1 rounded ${ri === ci ? "bg-teal-50" : ""}`}
                        style={{ color: ri === ci ? "#0891b2" : val >= 0 ? "#059669" : "#e11d48" }}>
                        {val >= 0 ? "+" : ""}{val.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </AnalysisCard>

        <AnalysisCard title="Key Relationships" badge="Cross-elasticity">
          <div className="space-y-2">
            {[
              { pair:"Pancake ↔ Syrup", type:"Complement", desc:"More Pancake space lifts Syrup sales. Co-locate for cross-selling.", color:"#059669" },
              { pair:"Cold ↔ Hot Cereal", type:"Substitute", desc:"Compete for same breakfast occasion. Space gains come at each other's expense.", color:"#e11d48" },
              { pair:"Breakfast Bar", type:"Independent", desc:"Largely unaffected by other subcategories. Different consumption occasion.", color:"#d97706" },
            ].map((r, i) => (
              <div key={i} className="rounded-r-md bg-slate-50/80 px-3 py-2.5" style={{ borderLeft: `3px solid ${r.color}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-900">{r.pair}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: r.color + "20", color: r.color }}>{r.type}</span>
                </div>
                <p className="text-xs text-slate-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}

function ClustersSection({ selectedCluster, setSelectedCluster, regByCluster, pipelineSteps: steps }: {
  selectedCluster: string | undefined; setSelectedCluster: (c: string | undefined) => void;
  regByCluster: Record<string, RegressionResult[]>;
  pipelineSteps: PipelineStep[];
}) {
  const step = steps[6];
  const names5 = ["Cold Cereal","Hot Cereal","Pancake","Syrup","Brkfst Bar"];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <div className="grid grid-cols-4 gap-3">
        {["C1","C2","C3","C4"].map(cid => {
          const cl = storeClusters.find(c => c.id === cid)!;
          const regs = regByCluster[cid];
          return (
            <Card key={cid} className={`shadow-sm cursor-pointer transition-all ${selectedCluster === cid ? "ring-2" : "hover:border-slate-300"}`}
              style={{ borderColor: selectedCluster === cid ? cl.color : undefined, ringColor: selectedCluster === cid ? cl.color : undefined }}
              onClick={() => setSelectedCluster(cid)}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: cl.color }}/>
                  <span className="text-sm font-semibold text-slate-900">{cl.name}</span>
                </div>
                <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                  <Table>
                    <TableBody>
                      {names5.map((nm, i) => (
                        <TableRow key={i}>
                          <TCell className="text-[10px] font-mono text-slate-500 py-1">{nm}</TCell>
                          <TCell className="text-right text-[10px] font-mono text-cyan-600 font-medium py-1">{regs[i].coefficients[i]?.beta.toFixed(3)}</TCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[9px] text-slate-500 mt-2">Avg R&sup2; = {(regs.reduce((s, r) => s + r.rSquared, 0) / 5).toFixed(3)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AnalysisCard title="Own-Elasticity Comparison Across Clusters" badge="4 clusters x 5 subcats">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={names5.map((nm, i) => ({
            subcategory: nm,
            C1: regByCluster["C1"][i].coefficients[i]?.beta || 0,
            C2: regByCluster["C2"][i].coefficients[i]?.beta || 0,
            C3: regByCluster["C3"][i].coefficients[i]?.beta || 0,
            C4: regByCluster["C4"][i].coefficients[i]?.beta || 0,
          }))} margin={{ top:10, right:20, bottom:20, left:40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
            <XAxis dataKey="subcategory" tick={axisTick}/>
            <YAxis tick={axisTick} label={{ value:"Own-Elasticity (\u03B2)", angle:-90, position:"insideLeft", offset:-25, fill:"#64748b", fontSize:11 }}/>
            <Tooltip contentStyle={tooltipStyle}/>
            <Legend/>
            <Bar dataKey="C1" fill="#0891b2" name="C1: Urban" radius={[4,4,0,0]}/>
            <Bar dataKey="C2" fill="#059669" name="C2: Suburban" radius={[4,4,0,0]}/>
            <Bar dataKey="C3" fill="#7c3aed" name="C3: Premium" radius={[4,4,0,0]}/>
            <Bar dataKey="C4" fill="#d97706" name="C4: Value" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>
    </div>
  );
}

function AllocationSection({ selectedCluster, allocResults, curRegs, pipelineSteps: steps }: {
  selectedCluster: string | undefined; allocResults: AllocationRow[]; curRegs: RegressionResult[];
  pipelineSteps: PipelineStep[];
}) {
  const step = steps[7];
  return (
    <div className="space-y-6">
      <SectionHeader title={step.title} subtitle={step.sub} />
      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.desc}</p>
      <div className="bg-blue-50 rounded px-3 py-2 text-xs text-blue-700 max-w-3xl">{"↳"} {step.insight}</div>

      <AnalysisCard title={`Optimal Space Allocation ${selectedCluster ? `(Cluster ${selectedCluster})` : "(All Clusters)"} — Budget: 41 ft`} badge="Lagrangian">
        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {["Subcategory","Current (ft)","Optimal (ft)","\u0394","Current Sales","Projected","Lift ($)","Lift %","Shadow Price"].map(h => (
                  <TableHead key={h} className={`text-xs font-medium text-slate-400 uppercase tracking-wider ${h !== "Subcategory" ? "text-right" : ""}`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocResults.map((r, i) => (
                <TableRow key={i}>
                  <TCell className="font-mono text-xs font-medium text-slate-900">{r.subcategory}</TCell>
                  <TCell className="text-right font-mono text-xs text-slate-500">{r.currentSpace}</TCell>
                  <TCell className="text-right font-mono text-xs text-cyan-600 font-semibold">{r.optimalSpace}</TCell>
                  <TCell className={`text-right font-mono text-xs font-medium ${r.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{r.delta >= 0 ? "+" : ""}{r.delta}</TCell>
                  <TCell className="text-right font-mono text-xs text-slate-500">${fmt(r.currentSales)}</TCell>
                  <TCell className="text-right font-mono text-xs text-slate-900">${fmt(r.projectedSales)}</TCell>
                  <TCell className={`text-right font-mono text-xs font-semibold ${r.salesLift >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{r.salesLift >= 0 ? "+" : ""}${fmt(r.salesLift)}</TCell>
                  <TCell className={`text-right font-mono text-xs ${r.salesLiftPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{r.salesLiftPct >= 0 ? "+" : ""}{r.salesLiftPct}%</TCell>
                  <TCell className="text-right font-mono text-xs text-amber-600">${r.shadowPrice}/ft</TCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-slate-300 font-bold">
                <TCell className="font-mono text-xs text-slate-900 font-bold">TOTAL</TCell>
                <TCell className="text-right font-mono text-xs text-slate-500">{allocResults.reduce((s, r) => s + r.currentSpace, 0)}</TCell>
                <TCell className="text-right font-mono text-xs text-cyan-600">{allocResults.reduce((s, r) => s + r.optimalSpace, 0).toFixed(1)}</TCell>
                <TCell className="text-right font-mono text-xs">&mdash;</TCell>
                <TCell className="text-right font-mono text-xs text-slate-500">${fmt(allocResults.reduce((s, r) => s + r.currentSales, 0))}</TCell>
                <TCell className="text-right font-mono text-xs text-slate-900">${fmt(allocResults.reduce((s, r) => s + r.projectedSales, 0))}</TCell>
                <TCell className="text-right font-mono text-xs text-emerald-600">+${fmt(allocResults.reduce((s, r) => s + r.salesLift, 0))}</TCell>
                <TCell className="text-right font-mono text-xs text-emerald-600">+{(allocResults.reduce((s, r) => s + r.salesLift, 0) / allocResults.reduce((s, r) => s + r.currentSales, 0) * 100).toFixed(1)}%</TCell>
                <TCell className="text-right font-mono text-xs">&mdash;</TCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Current vs Optimal Allocation" badge="Space (ft)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={allocResults} margin={{ top:10, right:20, bottom:20, left:40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
              <XAxis dataKey="subcategory" tick={{ ...axisTick, fontSize: 10 }}/>
              <YAxis tick={axisTick} label={{ value:"Space (ft)", angle:-90, position:"insideLeft", offset:-25, fill:"#64748b", fontSize:11 }}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Legend/>
              <Bar dataKey="currentSpace" fill="#94a3b8" name="Current" radius={[4,4,0,0]}/>
              <Bar dataKey="optimalSpace" fill="#0891b2" name="Optimal" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        <AnalysisCard title="Shadow Prices ($/ft)" badge="Marginal Value">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={allocResults} margin={{ top:10, right:20, bottom:20, left:40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
              <XAxis dataKey="subcategory" tick={{ ...axisTick, fontSize: 10 }}/>
              <YAxis tick={axisTick} label={{ value:"$/ft", angle:-90, position:"insideLeft", offset:-25, fill:"#64748b", fontSize:11 }}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Bar dataKey="shadowPrice" name="Shadow Price" radius={[4,4,0,0]}>
                {allocResults.map((_, i) => <Cell key={i} fill={subcategories[i].color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      <Card className="shadow-sm border-teal-200 bg-teal-50/30">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-teal-600"/>
            <p className="text-base font-bold text-slate-900">Output → Space Allocation Optimizer (MILP)</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            This elasticity matrix and these shadow prices feed directly into the Layer 2 Space Allocation Optimizer.
            The MILP solver uses these elasticities as objective function coefficients, with constraints on total space,
            minimum facings, and planogram feasibility. Estimated weekly lift: <strong className="text-emerald-600">+${fmt(allocResults.reduce((s, r) => s + r.salesLift, 0))}</strong> per store.
            Across {storeClusters.reduce((s, c) => s + c.storeCount, 0)} stores: <strong className="text-emerald-600">+${fmt(Math.round(allocResults.reduce((s, r) => s + r.salesLift, 0) * storeClusters.reduce((s, c) => s + c.storeCount, 0) * 52 / 1000))}K annually</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main App
export default function SpaceElasticityApp() {
  const [selectedCluster, setSelectedCluster] = useState<string | undefined>(undefined);
  const [selectedSubcat, setSelectedSubcat] = useState(0);

  const data = useMemo(() => generateData(), []);
  const stats = useMemo(() => computeStats(data), [data]);
  const regAll = useMemo(() => runRegression(data), [data]);
  const regByCluster = useMemo(() => {
    const m: Record<string, RegressionResult[]> = {}; ["C1","C2","C3","C4"].forEach(c => m[c] = runRegression(data, c)); return m;
  }, [data]);
  const corrMatrix = useMemo(() => computeCorrelation(data), [data]);
  const curRegs = selectedCluster ? regByCluster[selectedCluster] : regAll;

  const scatterKeys = [
    { space:"spaceColdCereal", sales:"salesColdCereal", label:"Cold Cereal" },
    { space:"spaceHotCereal", sales:"salesHotCereal", label:"Hot Cereal" },
    { space:"spacePancake", sales:"salesPancake", label:"Pancake Mix" },
    { space:"spaceSyrup", sales:"salesSyrup", label:"Syrup" },
    { space:"spaceBreakfastBar", sales:"salesBreakfastBar", label:"Breakfast Bar" },
  ];

  const scatterData = useMemo(() =>
    data.filter((_, i) => i % 3 === 0).map(d => ({
      space: d[scatterKeys[selectedSubcat].space] as number,
      sales: d[scatterKeys[selectedSubcat].sales] as number,
      logSpace: +Math.log(d[scatterKeys[selectedSubcat].space] as number).toFixed(3),
      logSales: +Math.log(d[scatterKeys[selectedSubcat].sales] as number).toFixed(3),
      cluster: d.storeCluster as string,
    }))
  , [data, selectedSubcat]);

  const dimCurve = useMemo(() => {
    const r = regAll[selectedSubcat], ownE = r.coefficients[selectedSubcat]?.beta || .35;
    return getDimCurve(r.baseSales, ownE, 1, 30);
  }, [regAll, selectedSubcat]);

  const allocResults = useMemo(() => computeAllocation(curRegs, [14,7,5,6,9], 41), [curRegs]);

  const names5 = ["Cold Cereal","Hot Cereal","Pancake","Syrup","Brkfst Bar"];

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Space Elasticity Estimation</h1>
            <p className="text-sm text-slate-500 mt-1">Log-log regression for space-to-sales relationships</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300">Layer 1: Intelligence</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">R&sup2; &gt; 0.85</Badge>
            <Badge variant="outline" className="text-slate-500">{data.length} obs &middot; 4 clusters &middot; 5 subcats</Badge>
          </div>
        </div>
      </div>

      {/* Store Cluster Filter */}
      <div className="mb-6">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Store Cluster Filter</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedCluster(undefined)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${!selectedCluster ? "bg-teal-100 text-slate-900 border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            All Clusters
          </button>
          {storeClusters.map(cl => (
            <button key={cl.id} onClick={() => setSelectedCluster(cl.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${selectedCluster === cl.id ? "bg-teal-100 text-slate-900 border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              <span className="w-2 h-2 rounded-full" style={{ background: cl.color }} />
              {cl.id}: {cl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="inline-flex w-full">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="profiling">Profiling</TabsTrigger>
          <TabsTrigger value="eda">EDA</TabsTrigger>
          <TabsTrigger value="loglog">Log-Log</TabsTrigger>
          <TabsTrigger value="regression">Regression</TabsTrigger>
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
          <TabsTrigger value="clusters">By Cluster</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <PipelineSection data={data} pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="profiling">
          <ProfilingSection data={data} stats={stats} pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="eda">
          <EdaSection selectedSubcat={selectedSubcat} setSelectedSubcat={setSelectedSubcat}
            scatterData={scatterData} corrMatrix={corrMatrix} scatterKeys={scatterKeys}
            pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="loglog">
          <LogLogSection selectedSubcat={selectedSubcat} setSelectedSubcat={setSelectedSubcat}
            scatterData={scatterData} scatterKeys={scatterKeys} regAll={regAll} dimCurve={dimCurve}
            pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="regression">
          <RegressionSection selectedSubcat={selectedSubcat} setSelectedSubcat={setSelectedSubcat}
            selectedCluster={selectedCluster} curRegs={curRegs}
            pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="matrix">
          <MatrixSection selectedCluster={selectedCluster} curRegs={curRegs}
            pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="clusters">
          <ClustersSection selectedCluster={selectedCluster} setSelectedCluster={setSelectedCluster}
            regByCluster={regByCluster}
            pipelineSteps={pipelineSteps} />
        </TabsContent>

        <TabsContent value="allocation">
          <AllocationSection selectedCluster={selectedCluster} allocResults={allocResults} curRegs={curRegs}
            pipelineSteps={pipelineSteps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
