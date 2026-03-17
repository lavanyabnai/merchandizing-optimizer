"use client";

import { useState, useMemo } from "react";
import {
  ScatterChart, Scatter, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ReferenceLine, Label,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell as TCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import _ from "lodash";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface StoreData {
  id: string; region: string; format: string;
  trueCluster: number; trueClusterName: string;
  totalSqft: number; weeklySales: number; weeklyTxns: number;
  avgBasket: number; grossMarginPct: number; skuCount: number;
  salesPerSqft: number; cardsPct: number; giftsPct: number;
  noveltiesPct: number; promoSalesShare: number;
  loyaltyPenetration: number; seasonalityIdx: number; shrinkagePct: number;
  [key: string]: string | number;
}

interface ClusteredStore extends StoreData {
  cluster: number; silhouette: number; pc1: number; pc2: number;
}

interface FeatureDef { key: string; label: string; group: string; }

interface ClusterProfile {
  cluster: number; count: number;
  formats: Record<string, number>; regions: Record<string, number>;
  avgWeeklySales: number; avgTotalSqft: number; salesPerSqft: number;
  avgBasket: number; grossMarginPct: number; promoSalesShare: number;
  loyaltyPenetration: number; seasonalityIdx: number;
  cardsPct: number; giftsPct: number; noveltiesPct: number;
  shrinkagePct: number; skuCount: number; weeklyTxns: number;
  [key: string]: number | string | Record<string, number>;
}

interface ElbowDataPoint { k: number; inertia: number; silhouette: number; }
interface ClusterResult {
  assignments: number[]; centroids: number[][]; inertia: number;
  avgSilhouette: number; silhouettes: number[];
}

// ═══════════════════════════════════════════════════════════════
// SYNTHETIC DATA GENERATION
// ═══════════════════════════════════════════════════════════════

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function normalRandom(rng: () => number, mean = 0, std = 1): number {
  const u1 = rng(); const u2 = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function weightedChoice(weights: number[], rng: () => number): number {
  const r = rng(); let cum = 0;
  for (let i = 0; i < weights.length; i++) { cum += weights[i]; if (r < cum) return i; }
  return weights.length - 1;
}

function generateStoreData(): StoreData[] {
  const rng = seededRandom(42);
  const regions = ["North", "South", "East", "West", "Central"];
  const formats = ["Hypermarket", "Supermarket", "Express", "Convenience"];
  const formatSizes: Record<string, [number, number]> = { Hypermarket: [35000, 8000], Supermarket: [15000, 3000], Express: [5000, 1200], Convenience: [2000, 500] };
  const clusterProfiles = [
    { name: "Premium Urban", formatDist: [0.1, 0.4, 0.35, 0.15], regionDist: [0.15, 0.1, 0.2, 0.15, 0.4], salesMult: 1.4, marginMult: 1.3, trafficMult: 0.8, basketMult: 1.6 },
    { name: "High-Volume Suburban", formatDist: [0.5, 0.35, 0.1, 0.05], regionDist: [0.3, 0.25, 0.2, 0.15, 0.1], salesMult: 1.6, marginMult: 1.0, trafficMult: 1.5, basketMult: 1.0 },
    { name: "Value-Oriented", formatDist: [0.15, 0.3, 0.25, 0.3], regionDist: [0.2, 0.35, 0.15, 0.2, 0.1], salesMult: 0.7, marginMult: 0.8, trafficMult: 1.2, basketMult: 0.6 },
    { name: "Neighborhood Compact", formatDist: [0.02, 0.18, 0.4, 0.4], regionDist: [0.2, 0.2, 0.25, 0.2, 0.15], salesMult: 0.5, marginMult: 1.1, trafficMult: 0.9, basketMult: 0.55 },
  ];
  const stores: StoreData[] = [];
  const clusterSizes = [18, 22, 20, 15];
  let storeId = 1;
  clusterSizes.forEach((size, ci) => {
    const profile = clusterProfiles[ci];
    for (let i = 0; i < size; i++) {
      const fIdx = weightedChoice(profile.formatDist, rng);
      const rIdx = weightedChoice(profile.regionDist, rng);
      const fmt = formats[fIdx];
      const [baseSqft, stdSqft] = formatSizes[fmt];
      const totalSqft = Math.max(800, Math.round(normalRandom(rng, baseSqft, stdSqft)));
      const weeklySales = Math.max(5000, Math.round(normalRandom(rng, totalSqft * 2.8 * profile.salesMult, totalSqft * 0.4)));
      const weeklyTxns = Math.max(100, Math.round(normalRandom(rng, weeklySales / (28 * profile.basketMult), weeklySales / (28 * profile.basketMult) * 0.2)));
      const avgBasket = weeklySales / weeklyTxns;
      const grossMarginPct = Math.min(0.45, Math.max(0.15, normalRandom(rng, 0.28 * profile.marginMult, 0.04)));
      const skuCount = Math.max(200, Math.round(normalRandom(rng, totalSqft * 0.4, totalSqft * 0.06)));
      const salesPerSqft = weeklySales / totalSqft;
      const cardsPct = Math.min(0.4, Math.max(0.05, normalRandom(rng, 0.22, 0.06)));
      const giftsPct = Math.min(0.5, Math.max(0.1, normalRandom(rng, 0.38, 0.08)));
      const noveltiesPct = Math.max(0.05, 1 - cardsPct - giftsPct);
      const promoSalesShare = Math.min(0.5, Math.max(0.05, normalRandom(rng, ci === 2 ? 0.35 : 0.2, 0.06)));
      const loyaltyPenetration = Math.min(0.95, Math.max(0.1, normalRandom(rng, ci === 0 ? 0.72 : ci === 1 ? 0.55 : 0.4, 0.1)));
      const seasonalityIdx = Math.max(0.5, normalRandom(rng, ci === 0 ? 1.3 : 1.0, 0.15));
      const shrinkagePct = Math.min(0.06, Math.max(0.005, normalRandom(rng, ci === 2 ? 0.025 : 0.015, 0.005)));
      stores.push({
        id: `S${String(storeId++).padStart(3, "0")}`, region: regions[rIdx], format: formats[fIdx],
        trueCluster: ci, trueClusterName: clusterProfiles[ci].name,
        totalSqft, weeklySales, weeklyTxns, avgBasket,
        grossMarginPct: +grossMarginPct.toFixed(4), skuCount, salesPerSqft: +salesPerSqft.toFixed(2),
        cardsPct: +cardsPct.toFixed(3), giftsPct: +giftsPct.toFixed(3), noveltiesPct: +noveltiesPct.toFixed(3),
        promoSalesShare: +promoSalesShare.toFixed(3), loyaltyPenetration: +loyaltyPenetration.toFixed(3),
        seasonalityIdx: +seasonalityIdx.toFixed(3), shrinkagePct: +shrinkagePct.toFixed(4),
      });
    }
  });
  return stores;
}

// ═══════════════════════════════════════════════════════════════
// ALGORITHMS — KMeans, PCA
// ═══════════════════════════════════════════════════════════════

function standardize(data: StoreData[], features: string[]) {
  const stats: Record<string, { mean: number; std: number }> = {};
  features.forEach(f => {
    const vals = data.map(d => d[f] as number);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) || 1;
    stats[f] = { mean, std };
  });
  return { stats, normalize: (row: StoreData) => features.map(f => ((row[f] as number) - stats[f].mean) / stats[f].std) };
}

function eucDist(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}

function kMeans(data: StoreData[], k: number, features: string[], maxIter = 50): ClusterResult {
  const rng = seededRandom(123 + k);
  const { normalize } = standardize(data, features);
  const points = data.map(d => normalize(d));
  const n = points.length; const dim = features.length;
  const centroids: number[][] = [points[Math.floor(rng() * n)]];
  for (let c = 1; c < k; c++) {
    const dists = points.map(p => Math.min(...centroids.map(cen => eucDist(p, cen))));
    const total = dists.reduce((a, b) => a + b, 0);
    let r = rng() * total; let idx = 0;
    for (let i = 0; i < n; i++) { r -= dists[i]; if (r <= 0) { idx = i; break; } }
    centroids.push([...points[idx]]);
  }
  let assignments = new Array<number>(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    const newAssign = points.map(p => {
      let minD = Infinity, best = 0;
      centroids.forEach((c, ci) => { const d = eucDist(p, c); if (d < minD) { minD = d; best = ci; } });
      return best;
    });
    const changed = newAssign.some((a, i) => a !== assignments[i]);
    assignments = newAssign;
    if (!changed) break;
    for (let ci = 0; ci < k; ci++) {
      const members = points.filter((_, i) => assignments[i] === ci);
      if (members.length === 0) continue;
      for (let d = 0; d < dim; d++) centroids[ci][d] = members.reduce((s, p) => s + p[d], 0) / members.length;
    }
  }
  let inertia = 0;
  points.forEach((p, i) => { inertia += eucDist(p, centroids[assignments[i]]) ** 2; });
  const silhouettes = points.map((p, i) => {
    const ci = assignments[i];
    const sameCluster = points.filter((_, j) => j !== i && assignments[j] === ci);
    if (sameCluster.length === 0) return 0;
    const a = sameCluster.reduce((s, q) => s + eucDist(p, q), 0) / sameCluster.length;
    let minB = Infinity;
    for (let ck = 0; ck < k; ck++) {
      if (ck === ci) continue;
      const otherCluster = points.filter((_, j) => assignments[j] === ck);
      if (otherCluster.length === 0) continue;
      const b = otherCluster.reduce((s, q) => s + eucDist(p, q), 0) / otherCluster.length;
      minB = Math.min(minB, b);
    }
    return (minB - a) / Math.max(a, minB);
  });
  return { assignments, centroids, inertia, avgSilhouette: silhouettes.reduce((a, b) => a + b, 0) / silhouettes.length, silhouettes };
}

function pca2D(data: StoreData[], features: string[]) {
  const { normalize } = standardize(data, features);
  const points = data.map(d => normalize(d));
  const n = points.length; const dim = features.length;
  const cov = Array.from({ length: dim }, () => new Array<number>(dim).fill(0));
  for (let i = 0; i < dim; i++) for (let j = i; j < dim; j++) {
    let s = 0; points.forEach(p => { s += p[i] * p[j]; });
    cov[i][j] = s / n; cov[j][i] = cov[i][j];
  }
  const ev1 = powerIteration(cov, dim, seededRandom(7));
  const deflated = cov.map((row, i) => row.map((v, j) => v - ev1.val * ev1.vec[i] * ev1.vec[j]));
  const ev2 = powerIteration(deflated, dim, seededRandom(13));
  return points.map(p => ({
    pc1: p.reduce((s, v, i) => s + v * ev1.vec[i], 0),
    pc2: p.reduce((s, v, i) => s + v * ev2.vec[i], 0),
  }));
}

function powerIteration(mat: number[][], dim: number, rng: () => number, iter = 100) {
  let vec = Array.from({ length: dim }, () => rng());
  let norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  vec = vec.map(v => v / norm);
  let eigenvalue = 0;
  for (let i = 0; i < iter; i++) {
    const newVec = vec.map((_, r) => mat[r].reduce((s, v, c) => s + v * vec[c], 0));
    eigenvalue = Math.sqrt(newVec.reduce((s, v) => s + v * v, 0));
    vec = newVec.map(v => v / (eigenvalue || 1));
  }
  return { vec, val: eigenvalue };
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════

const CLUSTER_COLORS = ["#0F5499", "#E07B39", "#2D8F6F", "#C44E52", "#8172B2", "#CCB974"];
const CHART_COLORS = { teal: "#0d9488", gold: "#b45309", orange: "#c2410c", purple: "#7c3aed", red: "#dc2626", green: "#16a34a", blue: "#2563eb" };
const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13 };
const axisTick = { fill: "#475569", fontSize: 12 };
const axisTick_sm = { fill: "#475569", fontSize: 11 };
const gridStroke = "#e2e8f0";
const fmtNum = (v: number, d = 0) => v?.toLocaleString(undefined, { maximumFractionDigits: d }) ?? "–";
const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
const fmtCur = (v: number) => `$${v?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "–"}`;

const FEATURES_ALL: FeatureDef[] = [
  { key: "salesPerSqft", label: "Sales / Sq.Ft", group: "Performance" },
  { key: "avgBasket", label: "Avg Basket ($)", group: "Performance" },
  { key: "grossMarginPct", label: "Gross Margin %", group: "Performance" },
  { key: "weeklyTxns", label: "Weekly Txns", group: "Traffic" },
  { key: "promoSalesShare", label: "Promo Sales %", group: "Behavior" },
  { key: "loyaltyPenetration", label: "Loyalty %", group: "Behavior" },
  { key: "cardsPct", label: "Cards Mix %", group: "Category" },
  { key: "giftsPct", label: "Gifts Mix %", group: "Category" },
  { key: "noveltiesPct", label: "Novelties Mix %", group: "Category" },
  { key: "seasonalityIdx", label: "Seasonality Index", group: "Behavior" },
  { key: "shrinkagePct", label: "Shrinkage %", group: "Operations" },
  { key: "skuCount", label: "SKU Count", group: "Operations" },
];

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
          {badge && <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">{badge}</Badge>}
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
      <div className="text-2xl font-bold" style={{ color: color || "#7c3aed" }}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB SECTIONS
// ═══════════════════════════════════════════════════════════════

function OverviewSection({ stores, clusterResult, clusterNames, profiles }: {
  stores: StoreData[]; clusterResult: { avgSilhouette: number; stores: ClusteredStore[] };
  clusterNames: string[]; profiles: ClusterProfile[];
}) {
  const formatDist = _.countBy(stores, "format");
  const regionDist = _.countBy(stores, "region");

  return (
    <div className="space-y-6">
      <SectionHeader title="Executive Summary" subtitle="Store Clustering Engine — KMeans segmentation of 75 stores for cluster-specific assortment planning" />

      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-sm"><CardContent className="pt-4"><Metric value={stores.length} label="Total Stores" /></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4"><Metric value="16" label="Features" color={CHART_COLORS.blue} /></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4"><Metric value={profiles.length} label="Clusters (K)" color={CHART_COLORS.orange} /></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4"><Metric value={clusterResult.avgSilhouette.toFixed(3)} label="Silhouette Score" color={CHART_COLORS.green} /></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4"><Metric value={Object.keys(formatDist).length} label="Store Formats" color={CHART_COLORS.teal} /></CardContent></Card>
      </div>

      <AnalysisCard title="Store Clustering — What & Why" badge="Layer 1" insight="Store clustering groups stores with similar characteristics so each cluster can receive a tailored assortment, space allocation, and promotional strategy. The cluster assignments feed directly into the Space Allocation Optimizer and SKU Selection Optimizer downstream.">
        <div className="grid grid-cols-3 gap-6 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Inputs</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>75 stores × 16 features</li>
              <li>Sales productivity, basket, margin</li>
              <li>Category mix (Cards/Gifts/Novelties)</li>
              <li>Promo dependency, loyalty, shrinkage</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Algorithm</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>KMeans++ initialization</li>
              <li>Z-score standardization</li>
              <li>Elbow + Silhouette for optimal K</li>
              <li>PCA projection for visualization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Outputs</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Cluster assignment per store</li>
              <li>Cluster profiles & radar charts</li>
              <li>Space allocation recommendations</li>
              <li>Assortment strategy per cluster</li>
            </ul>
          </div>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Cluster Distribution" badge={`${profiles.length} Clusters`}>
          <div className="space-y-3">
            {profiles.map(p => (
              <div key={p.cluster} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CLUSTER_COLORS[p.cluster] }} />
                <span className="text-sm font-medium w-40">{clusterNames[p.cluster]}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.count / stores.length) * 100}%`, backgroundColor: CLUSTER_COLORS[p.cluster], opacity: 0.75 }} />
                </div>
                <span className="text-xs font-mono text-slate-500 w-20 text-right">{p.count} stores ({((p.count / stores.length) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </AnalysisCard>

        <AnalysisCard title="Format & Region Mix" badge="Distributions">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Format</div>
              {Object.entries(formatDist).sort(([,a], [,b]) => b - a).map(([f, c]) => (
                <div key={f} className="flex justify-between text-xs py-1 border-b border-slate-50"><span>{f}</span><span className="font-mono">{c}</span></div>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Region</div>
              {Object.entries(regionDist).map(([r, c]) => (
                <div key={r} className="flex justify-between text-xs py-1 border-b border-slate-50"><span>{r}</span><span className="font-mono">{c}</span></div>
              ))}
            </div>
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}

function DataExplorationSection({ stores }: { stores: StoreData[] }) {
  const [xAxis, setXAxis] = useState("salesPerSqft");
  const [yAxis, setYAxis] = useState("grossMarginPct");
  const [colorBy, setColorBy] = useState("format");

  const colorCategories = colorBy === "format"
    ? ["Hypermarket", "Supermarket", "Express", "Convenience"]
    : ["North", "South", "East", "West", "Central"];

  const scatterData = stores.map(s => ({ x: s[xAxis] as number, y: s[yAxis] as number, cat: s[colorBy] as string, id: s.id }));

  const corrFeatures = ["salesPerSqft", "avgBasket", "grossMarginPct", "promoSalesShare", "loyaltyPenetration"];
  const corrLabels = ["Sales/ft", "Basket", "Margin", "Promo%", "Loyalty"];
  const corrMatrix = corrFeatures.map(f1 => corrFeatures.map(f2 => {
    const v1 = stores.map(s => s[f1] as number); const v2 = stores.map(s => s[f2] as number);
    const m1 = _.mean(v1); const m2 = _.mean(v2);
    const num = v1.reduce((s, a, i) => s + (a - m1) * (v2[i] - m2), 0);
    const d1 = Math.sqrt(v1.reduce((s, a) => s + (a - m1) ** 2, 0));
    const d2 = Math.sqrt(v2.reduce((s, a) => s + (a - m2) ** 2, 0));
    return +(num / (d1 * d2)).toFixed(3);
  }));

  const summaryStats = [
    { label: "Weekly Sales", min: fmtCur(_.minBy(stores, "weeklySales")!.weeklySales), avg: fmtCur(Math.round(_.meanBy(stores, "weeklySales"))), max: fmtCur(_.maxBy(stores, "weeklySales")!.weeklySales) },
    { label: "Store Sq.Ft", min: fmtNum(_.minBy(stores, "totalSqft")!.totalSqft), avg: fmtNum(Math.round(_.meanBy(stores, "totalSqft"))), max: fmtNum(_.maxBy(stores, "totalSqft")!.totalSqft) },
    { label: "Avg Basket", min: `$${_.minBy(stores, "avgBasket")!.avgBasket.toFixed(0)}`, avg: `$${_.meanBy(stores, "avgBasket").toFixed(0)}`, max: `$${_.maxBy(stores, "avgBasket")!.avgBasket.toFixed(0)}` },
    { label: "Gross Margin", min: fmtPct(_.minBy(stores, "grossMarginPct")!.grossMarginPct), avg: fmtPct(_.meanBy(stores, "grossMarginPct")), max: fmtPct(_.maxBy(stores, "grossMarginPct")!.grossMarginPct) },
    { label: "Sales/Sq.Ft", min: `$${_.minBy(stores, "salesPerSqft")!.salesPerSqft.toFixed(1)}`, avg: `$${_.meanBy(stores, "salesPerSqft").toFixed(1)}`, max: `$${_.maxBy(stores, "salesPerSqft")!.salesPerSqft.toFixed(1)}` },
    { label: "SKU Count", min: fmtNum(_.minBy(stores, "skuCount")!.skuCount), avg: fmtNum(Math.round(_.meanBy(stores, "skuCount"))), max: fmtNum(_.maxBy(stores, "skuCount")!.skuCount) },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Data Exploration" subtitle="Understand store feature distributions, correlations, and natural groupings before clustering" />

      <AnalysisCard title="Summary Statistics" badge="75 Stores × 16 Features" insight={`Wide range in Sales/Sq.Ft ($${_.minBy(stores, "salesPerSqft")!.salesPerSqft.toFixed(1)} to $${_.maxBy(stores, "salesPerSqft")!.salesPerSqft.toFixed(1)}) suggests meaningful variation in space productivity — a strong signal for clustering.`}>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="text-xs">Metric</TableHead>
            <TableHead className="text-xs text-right">Min</TableHead>
            <TableHead className="text-xs text-right">Avg</TableHead>
            <TableHead className="text-xs text-right">Max</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {summaryStats.map(s => (
              <TableRow key={s.label}>
                <TCell className="text-xs font-medium">{s.label}</TCell>
                <TCell className="text-xs text-right font-mono">{s.min}</TCell>
                <TCell className="text-xs text-right font-mono">{s.avg}</TCell>
                <TCell className="text-xs text-right font-mono">{s.max}</TCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Bivariate Scatter Plot" badge="Interactive" insight="Try plotting Sales/Sq.Ft vs Gross Margin — you'll see a clear separation between high-productivity/high-margin stores and value-oriented ones.">
          <div className="flex gap-3 flex-wrap mb-3">
            <label className="text-xs text-slate-500 flex items-center gap-1">X: <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="border rounded px-2 py-1 text-xs">{FEATURES_ALL.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}</select></label>
            <label className="text-xs text-slate-500 flex items-center gap-1">Y: <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="border rounded px-2 py-1 text-xs">{FEATURES_ALL.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}</select></label>
            <label className="text-xs text-slate-500 flex items-center gap-1">Color: <select value={colorBy} onChange={e => setColorBy(e.target.value)} className="border rounded px-2 py-1 text-xs"><option value="format">Format</option><option value="region">Region</option></select></label>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="x" type="number" name={xAxis} tick={axisTick_sm}><Label value={FEATURES_ALL.find(f => f.key === xAxis)?.label} position="bottom" offset={-5} style={{ fontSize: 11 }} /></XAxis>
              <YAxis dataKey="y" type="number" name={yAxis} tick={axisTick_sm}><Label value={FEATURES_ALL.find(f => f.key === yAxis)?.label} angle={-90} position="insideLeft" style={{ fontSize: 11 }} /></YAxis>
              <Tooltip contentStyle={tooltipStyle} />
              {colorCategories.map((cat, ci) => (
                <Scatter key={cat} name={cat} data={scatterData.filter(d => d.cat === cat)} fill={CLUSTER_COLORS[ci % CLUSTER_COLORS.length]} opacity={0.7} />
              ))}
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </AnalysisCard>

        <AnalysisCard title="Correlation Matrix (Key Features)" badge="5×5" insight="Low inter-correlation means each feature adds independent information. High correlation (|r| > 0.7) means redundancy — pick one from each correlated group.">
          <table className="w-full text-xs">
            <thead><tr><th className="p-1.5 text-left text-slate-500" />{corrLabels.map(l => <th key={l} className="p-1.5 text-center text-slate-500">{l}</th>)}</tr></thead>
            <tbody>
              {corrMatrix.map((row, ri) => (
                <tr key={ri}>
                  <td className="p-1.5 font-semibold text-slate-600">{corrLabels[ri]}</td>
                  {row.map((val, ci) => (
                    <td key={ci} className="p-1.5 text-center font-mono" style={{
                      backgroundColor: val > 0 ? `rgba(15,84,153,${Math.abs(val) * 0.5})` : `rgba(196,78,82,${Math.abs(val) * 0.5})`,
                      color: Math.abs(val) > 0.35 ? "#fff" : "#333", fontWeight: Math.abs(val) > 0.3 ? 600 : 400,
                    }}>{val.toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </AnalysisCard>
      </div>

      <AnalysisCard title="Sample Records (first 8)" badge="Raw Data">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              {["Store", "Format", "Region", "Sq.Ft", "Wkly Sales", "Txns", "Basket", "Margin%", "Sales/ft"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}
            </TableRow></TableHeader>
            <TableBody>
              {stores.slice(0, 8).map(s => (
                <TableRow key={s.id}>
                  <TCell className="text-xs font-mono">{s.id}</TCell>
                  <TCell className="text-xs">{s.format}</TCell>
                  <TCell className="text-xs">{s.region}</TCell>
                  <TCell className="text-xs text-right font-mono">{fmtNum(s.totalSqft)}</TCell>
                  <TCell className="text-xs text-right font-mono">{fmtCur(s.weeklySales)}</TCell>
                  <TCell className="text-xs text-right font-mono">{fmtNum(s.weeklyTxns)}</TCell>
                  <TCell className="text-xs text-right font-mono">${s.avgBasket.toFixed(0)}</TCell>
                  <TCell className="text-xs text-right font-mono">{fmtPct(s.grossMarginPct)}</TCell>
                  <TCell className="text-xs text-right font-mono">${s.salesPerSqft.toFixed(1)}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>
    </div>
  );
}

function FeatureSelectionSection({ selectedFeatures, onChange, elbowData, selectedK, onSelectK }: {
  selectedFeatures: string[]; onChange: (v: string[]) => void;
  elbowData: ElbowDataPoint[]; selectedK: number; onSelectK: (k: number) => void;
}) {
  const grouped = _.groupBy(FEATURES_ALL, "group");
  const toggle = (key: string) => {
    if (selectedFeatures.includes(key)) { if (selectedFeatures.length > 2) onChange(selectedFeatures.filter(k => k !== key)); }
    else onChange([...selectedFeatures, key]);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Feature Selection & Optimal K" subtitle="Choose clustering features and determine the optimal number of clusters using Elbow + Silhouette methods" />

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title={`Feature Selection (${selectedFeatures.length} chosen)`} badge="Interactive" insight="For store clustering in assortment planning, prefer: sales productivity (Sales/Sq.Ft), shopper behavior (basket, loyalty), category mix, and promo dependency. Avoid raw volume metrics — they correlate too strongly with format.">
          {Object.entries(grouped).map(([group, feats]) => (
            <div key={group} className="mb-4">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{group}</div>
              <div className="flex flex-wrap gap-2">
                {feats.map(f => (
                  <button key={f.key} onClick={() => toggle(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${selectedFeatures.includes(f.key) ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-300 hover:border-violet-400"}`}>
                    {selectedFeatures.includes(f.key) ? "✓ " : ""}{f.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </AnalysisCard>

        <AnalysisCard title="Feature Selection Guide" badge="Best Practices">
          <Table>
            <TableHeader><TableRow><TableHead className="text-xs">Principle</TableHead><TableHead className="text-xs">Recommendation</TableHead></TableRow></TableHeader>
            <TableBody>
              {[
                ["Variance", "Exclude features where 80%+ of stores have similar values"],
                ["Correlation", "If two features correlate > 0.7, keep the more interpretable one"],
                ["Business relevance", "Include features that drive space allocation decisions"],
                ["Scale independence", "All features are standardized (z-score) before clustering"],
                ["Category mix", "Include at least one category share feature"],
                ["Avoid identifiers", "Never cluster on store ID, region code, or format label"],
              ].map(([p, r]) => (
                <TableRow key={p}><TCell className="text-xs font-semibold">{p}</TCell><TCell className="text-xs text-slate-500">{r}</TCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalysisCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Elbow Method (WCSS)" badge="Inertia" insight="The elbow at K=4 combined with the silhouette peak at K=4 gives strong evidence. In retail practice, 3–6 clusters is the sweet spot.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={elbowData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="k" tick={axisTick} label={{ value: "Number of Clusters (K)", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis tick={axisTick_sm} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="inertia" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              <ReferenceLine x={selectedK} stroke={CHART_COLORS.orange} strokeDasharray="5 5" strokeWidth={2}>
                <Label value={`K=${selectedK}`} position="top" fill={CHART_COLORS.orange} fontSize={11} />
              </ReferenceLine>
            </LineChart>
          </ResponsiveContainer>
        </AnalysisCard>

        <AnalysisCard title="Silhouette Score by K" badge="Quality">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={elbowData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="k" tick={axisTick} label={{ value: "Number of Clusters (K)", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis domain={[0, "auto"]} tick={axisTick_sm} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="silhouette" radius={[4, 4, 0, 0]}>
                {elbowData.map((d, i) => <Cell key={i} fill={d.k === selectedK ? CHART_COLORS.orange : "#7c3aed"} opacity={d.k === selectedK ? 1 : 0.6} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      <AnalysisCard title="Select K" badge="Choose">
        <div className="flex gap-3 flex-wrap">
          {[2, 3, 4, 5, 6, 7].map(k => (
            <button key={k} onClick={() => onSelectK(k)}
              className={`px-5 py-3 rounded-lg border text-sm transition-colors ${k === selectedK ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-300 hover:border-violet-400"}`}>
              K = {k}
              <span className="block text-[10px] opacity-70">Silhouette: {elbowData.find(d => d.k === k)?.silhouette}</span>
            </button>
          ))}
        </div>
      </AnalysisCard>
    </div>
  );
}

function ClusterMapSection({ stores, k, clusterNames, profiles }: {
  stores: ClusteredStore[]; k: number; clusterNames: string[]; profiles: ClusterProfile[];
}) {
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader title="Cluster Map" subtitle="PCA projects the high-dimensional feature space into 2D. Each dot is a store, colored by its cluster assignment." />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <AnalysisCard title="PCA Projection — Store Cluster Map" badge="2D">
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="pc1" type="number" tick={axisTick_sm}><Label value="Principal Component 1" position="bottom" offset={-5} style={{ fontSize: 11 }} /></XAxis>
                <YAxis dataKey="pc2" type="number" tick={axisTick_sm}><Label value="PC 2" angle={-90} position="insideLeft" style={{ fontSize: 11 }} /></YAxis>
                <Tooltip contentStyle={tooltipStyle} content={({ payload }: any) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload as ClusteredStore;
                  return <div style={tooltipStyle} className="p-2 text-xs"><strong>{d.id}</strong> · {d.format} · {d.region}<br />Cluster: {clusterNames[d.cluster]}<br />Sales/ft: ${d.salesPerSqft} · Basket: ${d.avgBasket.toFixed(0)}<br />Silhouette: {d.silhouette}</div>;
                }} />
                {Array.from({ length: k }, (_, ci) => (
                  <Scatter key={ci} name={clusterNames[ci] || `Cluster ${ci}`} data={stores.filter(s => s.cluster === ci)} fill={CLUSTER_COLORS[ci]}
                    opacity={hoveredCluster !== null && hoveredCluster !== ci ? 0.15 : 0.75} />
                ))}
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </AnalysisCard>
        </div>

        <AnalysisCard title="Cluster Summary" badge={`${k} Groups`}>
          <div className="space-y-3">
            {profiles.map(p => (
              <div key={p.cluster} className="rounded-lg border p-3 transition-colors cursor-pointer"
                style={{ borderLeftWidth: 4, borderLeftColor: CLUSTER_COLORS[p.cluster], backgroundColor: hoveredCluster === p.cluster ? `${CLUSTER_COLORS[p.cluster]}10` : undefined }}
                onMouseEnter={() => setHoveredCluster(p.cluster)} onMouseLeave={() => setHoveredCluster(null)}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: CLUSTER_COLORS[p.cluster] }}>{clusterNames[p.cluster]}</span>
                  <Badge variant="outline" className="text-[10px]">{p.count} stores</Badge>
                </div>
                <div className="flex gap-4 mt-1.5 text-[11px] text-slate-500">
                  <span>Sales/ft: <strong>${(p.salesPerSqft as number).toFixed(1)}</strong></span>
                  <span>Basket: <strong>${(p.avgBasket as number).toFixed(0)}</strong></span>
                  <span>Margin: <strong>{fmtPct(p.grossMarginPct as number)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}

function ClusterProfilesSection({ profiles, clusterNames, stores }: {
  profiles: ClusterProfile[]; clusterNames: string[]; stores: ClusteredStore[];
}) {
  const radarData = FEATURES_ALL.filter(f => ["salesPerSqft", "avgBasket", "grossMarginPct", "promoSalesShare", "loyaltyPenetration", "seasonalityIdx"].includes(f.key)).map(f => {
    const allVals = stores.map(s => s[f.key] as number);
    const minV = Math.min(...allVals); const maxV = Math.max(...allVals);
    const row: Record<string, string | number> = { feature: f.label.replace(" %", "").replace(" ($)", "") };
    profiles.forEach(p => { row[`c${p.cluster}`] = +((((p[f.key] as number) - minV) / (maxV - minV || 1))).toFixed(3); });
    return row;
  });

  const formatComposition = profiles.map(p => ({ cluster: clusterNames[p.cluster], ...p.formats }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Cluster Profiles" subtitle="Characterize each cluster by its defining features — radar charts show normalized profiles, spikes indicate differentiation" />

      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Cluster Radar Profiles (Normalized)" badge="6 Features">
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ddd" />
              <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
              {profiles.map(p => (
                <Radar key={p.cluster} name={clusterNames[p.cluster]} dataKey={`c${p.cluster}`} stroke={CLUSTER_COLORS[p.cluster]} fill={CLUSTER_COLORS[p.cluster]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend /><Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        <AnalysisCard title="Format Composition by Cluster" badge="Stacked">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={formatComposition} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={axisTick_sm} />
              <YAxis dataKey="cluster" type="category" tick={axisTick_sm} width={140} />
              <Tooltip contentStyle={tooltipStyle} /><Legend />
              <Bar dataKey="Hypermarket" stackId="a" fill="#0F5499" />
              <Bar dataKey="Supermarket" stackId="a" fill="#2D8F6F" />
              <Bar dataKey="Express" stackId="a" fill="#E07B39" />
              <Bar dataKey="Convenience" stackId="a" fill="#C44E52" />
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      <AnalysisCard title="Detailed Cluster Comparison" badge="All Metrics">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="text-xs">Metric</TableHead>
              {profiles.map(p => <TableHead key={p.cluster} className="text-xs text-right" style={{ color: CLUSTER_COLORS[p.cluster] }}>{clusterNames[p.cluster]}</TableHead>)}
            </TableRow></TableHeader>
            <TableBody>
              <TableRow><TCell className="text-xs font-semibold">Store Count</TCell>{profiles.map(p => <TCell key={p.cluster} className="text-xs text-right font-mono">{p.count}</TCell>)}</TableRow>
              <TableRow><TCell className="text-xs font-semibold">Avg Sq.Ft</TCell>{profiles.map(p => <TCell key={p.cluster} className="text-xs text-right font-mono">{fmtNum(Math.round(p.avgTotalSqft))}</TCell>)}</TableRow>
              <TableRow><TCell className="text-xs font-semibold">Wkly Sales</TCell>{profiles.map(p => <TCell key={p.cluster} className="text-xs text-right font-mono">{fmtCur(Math.round(p.avgWeeklySales))}</TCell>)}</TableRow>
              {FEATURES_ALL.slice(0, 9).map(f => (
                <TableRow key={f.key}>
                  <TCell className="text-xs font-semibold">{f.label}</TCell>
                  {profiles.map(p => {
                    const val = p[f.key] as number;
                    const isMax = val === Math.max(...profiles.map(pp => pp[f.key] as number));
                    return <TCell key={p.cluster} className="text-xs text-right font-mono" style={{ fontWeight: isMax ? 700 : 400, color: isMax ? CLUSTER_COLORS[p.cluster] : undefined }}>
                      {f.key.includes("Pct") || f.key.includes("pct") || f.key.includes("Share") || f.key.includes("Penetration") ? fmtPct(val) : val.toFixed(2)}
                    </TCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>
    </div>
  );
}

function BusinessInsightsSection({ profiles, clusterNames, stores, silhouette }: {
  profiles: ClusterProfile[]; clusterNames: string[]; stores: ClusteredStore[]; silhouette: number;
}) {
  const insights = profiles.map(p => {
    const ci = p.cluster; const name = clusterNames[ci];
    let strategy = "", spaceRec = "", assortmentRec = "";
    if (name === "Premium Urban") {
      strategy = "Maximize margin through premium assortment depth. These stores have the highest basket values and gross margins.";
      spaceRec = "Allocate disproportionately more space to Cards (high margin) and premium Gifts. Reduce Novelties space.";
      assortmentRec = "Wider SKU selection within premium price tiers. Carry exclusive/limited-edition lines.";
    } else if (name === "High-Volume Suburban") {
      strategy = "Drive volume with broad assortment and efficient space use. These stores have the highest traffic and total sales.";
      spaceRec = "Balanced allocation across categories. Prioritize Gifts (largest share) with efficient facing counts.";
      assortmentRec = "Core range plus top seasonal sellers. Focus on fast-turning SKUs with strong velocity.";
    } else if (name === "Value-Oriented") {
      strategy = "Win on price perception and promotional effectiveness. High promo share means these shoppers are deal-driven.";
      spaceRec = "Flex space for promotional displays. Reduce permanent fixtures for Novelties; use for rotating promo bays.";
      assortmentRec = "Narrow but deep in value tiers. Private label emphasis. Cut tail SKUs aggressively.";
    } else {
      strategy = "Curate a tight, high-turn assortment for limited space. Every facing must earn its place.";
      spaceRec = "Minimize Novelties to 1–2 facings max. Concentrate on top 20% SKUs by velocity.";
      assortmentRec = "Ultra-curated core range. No slow movers. Replenish frequently from hub stores.";
    }
    return { ci, name, count: p.count, strategy, spaceRec, assortmentRec, salesPerSqft: p.salesPerSqft, margin: p.grossMarginPct };
  });

  const spaceAllocation = profiles.map(p => ({
    cluster: clusterNames[p.cluster],
    cards: Math.round((p.cardsPct as number) * 50),
    gifts: Math.round((p.giftsPct as number) * 50),
    novelties: Math.round((p.noveltiesPct as number) * 50),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Business Insights & Recommendations" subtitle="Actionable strategies per cluster — space allocation, assortment depth, and promotional approach" />

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-green-800">KEY OUTPUT: Cluster Assignments</span>
          <Badge className="bg-green-100 text-green-800 border-green-300">Silhouette: {silhouette.toFixed(3)}</Badge>
        </div>
        <p className="text-xs text-slate-600 mt-2">These cluster assignments flow downstream to the <strong>Space Allocation Optimizer</strong> (ADMM/Lagrangian) which allocates total space across categories per cluster, then to the <strong>SKU Selection Optimizer</strong> (MNL + MILP) which selects specific products within each space budget.</p>
      </div>

      <AnalysisCard title="Indicative Space Budget per Cluster (50ft total)" badge="Space Allocation">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={spaceAllocation} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={axisTick_sm} unit=" ft" />
            <YAxis dataKey="cluster" type="category" tick={axisTick_sm} width={140} />
            <Tooltip contentStyle={tooltipStyle} /><Legend />
            <Bar dataKey="cards" stackId="a" fill="#0F5499" name="Cards" />
            <Bar dataKey="gifts" stackId="a" fill="#2D8F6F" name="Gifts" />
            <Bar dataKey="novelties" stackId="a" fill="#E07B39" name="Novelties" />
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {insights.map(ins => (
        <Card key={ins.ci} className="shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: CLUSTER_COLORS[ins.ci] }}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base" style={{ color: CLUSTER_COLORS[ins.ci] }}>{ins.name}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px]">{ins.count} stores</Badge>
                <Badge variant="outline" className="text-[10px]">Sales/ft: ${(ins.salesPerSqft as number).toFixed(1)}</Badge>
                <Badge variant="outline" className="text-[10px]">Margin: {fmtPct(ins.margin as number)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div><div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Strategy</div><p className="text-xs text-slate-600 leading-relaxed">{ins.strategy}</p></div>
              <div><div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Space Recommendation</div><p className="text-xs text-slate-600 leading-relaxed">{ins.spaceRec}</p></div>
              <div><div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Assortment Recommendation</div><p className="text-xs text-slate-600 leading-relaxed">{ins.assortmentRec}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AnalysisCard title="Pipeline — Store Clustering in Context" badge="Layer 1">
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-xs font-semibold text-violet-700 bg-violet-100 rounded px-2 py-1 ring-2 ring-violet-300">Store Clustering</div>
            <div className="text-[10px] text-slate-500 mt-1">Cluster assignments</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-cyan-700 bg-cyan-100 rounded px-2 py-1">Space Elasticity</div>
            <div className="text-[10px] text-slate-500 mt-1">Per cluster</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-amber-700 bg-amber-100 rounded px-2 py-1">Space Allocation</div>
            <div className="text-[10px] text-slate-500 mt-1">ADMM optimizer</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-teal-700 bg-teal-100 rounded px-2 py-1">MNL Demand</div>
            <div className="text-[10px] text-slate-500 mt-1">Per cluster</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-orange-700 bg-orange-100 rounded px-2 py-1">SKU Optimizer</div>
            <div className="text-[10px] text-slate-500 mt-1">Per cluster</div>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function StoreClusteringApp() {
  const [selectedK, setSelectedK] = useState(4);
  const [selectedFeatures, setSelectedFeatures] = useState(["salesPerSqft", "avgBasket", "grossMarginPct", "promoSalesShare", "loyaltyPenetration", "cardsPct", "giftsPct"]);

  const stores = useMemo(() => generateStoreData(), []);

  const elbowData = useMemo((): ElbowDataPoint[] => {
    return [2, 3, 4, 5, 6, 7].map(k => {
      const result = kMeans(stores, k, selectedFeatures);
      return { k, inertia: Math.round(result.inertia), silhouette: +result.avgSilhouette.toFixed(3) };
    });
  }, [stores, selectedFeatures]);

  const clusterResult = useMemo(() => {
    const result = kMeans(stores, selectedK, selectedFeatures);
    const projected = pca2D(stores, selectedFeatures);
    return {
      ...result,
      stores: stores.map((s, i): ClusteredStore => ({
        ...s, cluster: result.assignments[i], silhouette: +result.silhouettes[i].toFixed(3),
        pc1: +projected[i].pc1.toFixed(3), pc2: +projected[i].pc2.toFixed(3),
      })),
    };
  }, [stores, selectedK, selectedFeatures]);

  const clusterProfiles = useMemo((): ClusterProfile[] => {
    const grouped = _.groupBy(clusterResult.stores, "cluster");
    return Object.entries(grouped).map(([cId, members]) => {
      const ci = parseInt(cId);
      const profile: Record<string, unknown> = { cluster: ci, count: members.length };
      FEATURES_ALL.forEach(f => { profile[f.key] = _.meanBy(members, f.key); });
      profile.formats = _.countBy(members, "format");
      profile.regions = _.countBy(members, "region");
      profile.avgWeeklySales = _.meanBy(members, "weeklySales");
      profile.avgTotalSqft = _.meanBy(members, "totalSqft");
      return profile as unknown as ClusterProfile;
    }).sort((a, b) => b.avgWeeklySales - a.avgWeeklySales);
  }, [clusterResult]);

  const clusterNames = useMemo((): string[] => {
    return clusterProfiles.map(p => {
      if (p.avgBasket > 40 && p.grossMarginPct > 0.3) return "Premium Urban";
      if (p.avgWeeklySales > 50000 && p.count > 15) return "High-Volume Suburban";
      if (p.promoSalesShare > 0.28) return "Value-Oriented";
      return "Neighborhood Compact";
    });
  }, [clusterProfiles]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Store Clustering Engine</h1>
            <p className="text-sm text-slate-500 mt-1">KMeans segmentation of {stores.length} stores — {selectedFeatures.length} features, {selectedK} clusters</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-100 text-violet-800 border-violet-300">Layer 1: Intelligence</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Silhouette: {clusterResult.avgSilhouette.toFixed(3)}</Badge>
            <Badge variant="outline" className="text-slate-500">{stores.length} stores · K={selectedK}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exploration">Exploration</TabsTrigger>
          <TabsTrigger value="features">Features & K</TabsTrigger>
          <TabsTrigger value="map">Cluster Map</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewSection stores={stores} clusterResult={clusterResult} clusterNames={clusterNames} profiles={clusterProfiles} /></TabsContent>
        <TabsContent value="exploration"><DataExplorationSection stores={stores} /></TabsContent>
        <TabsContent value="features"><FeatureSelectionSection selectedFeatures={selectedFeatures} onChange={setSelectedFeatures} elbowData={elbowData} selectedK={selectedK} onSelectK={setSelectedK} /></TabsContent>
        <TabsContent value="map"><ClusterMapSection stores={clusterResult.stores} k={selectedK} clusterNames={clusterNames} profiles={clusterProfiles} /></TabsContent>
        <TabsContent value="profiles"><ClusterProfilesSection profiles={clusterProfiles} clusterNames={clusterNames} stores={clusterResult.stores} /></TabsContent>
        <TabsContent value="insights"><BusinessInsightsSection profiles={clusterProfiles} clusterNames={clusterNames} stores={clusterResult.stores} silhouette={clusterResult.avgSilhouette} /></TabsContent>
      </Tabs>
    </div>
  );
}
