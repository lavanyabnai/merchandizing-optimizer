"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  ScatterChart, Scatter, ComposedChart, Area, ReferenceLine, Label,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell as TCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ═══════════════════════════════════════════════════════════════
// SYNTHETIC DATA LAYER — Cola CSD · harmonized CSD data
// ═══════════════════════════════════════════════════════════════

const BRAND_COLORS: Record<string, string> = {
  "Coca-Cola": "#e53e3e", Pepsi: "#3182ce", "Dr Pepper": "#805ad5",
  "Mountain Dew": "#38a169", Sprite: "#48bb78", Fanta: "#ed8936",
  "7UP": "#4fd1c5", "RC Cola": "#d69e2e",
};

const CHART_COLORS = {
  teal: "#0d9488", tealLight: "#14b8a6", tealDark: "#0f766e",
  gold: "#b45309", orange: "#c2410c", pink: "#be185d",
  purple: "#7c3aed", red: "#dc2626", green: "#16a34a", blue: "#2563eb",
  indigo: "#4f46e5", indigoLight: "#818cf8",
};

// ── Simulation configuration ──
const SIM_CONFIG = {
  trials: 5000,
  weeks: 52,
  skus: 28,        // selected from MILP optimizer
  facings: 72,
  seed: 42,
  convergenceAt: 3200,
  runtime: "2.4s",
};

// ── Input uncertainty distributions (from MNL + SKU optimizer) ──
const UNCERTAINTY_PARAMS = [
  { param: "Price Elasticity (β_price)", distribution: "Normal", mean: -2.34, std: 0.18, ci95: "[-2.69, -1.99]", source: "MNL Model SE", impact: "High" },
  { param: "Promo Lift (β_promo)", distribution: "Normal", mean: 0.82, std: 0.12, ci95: "[0.59, 1.05]", source: "MNL Model SE", impact: "High" },
  { param: "Space Elasticity", distribution: "Triangular", mean: 0.14, std: 0.04, ci95: "[0.07, 0.22]", source: "Planogram data", impact: "Medium" },
  { param: "Walk Rate", distribution: "Beta(2,8)", mean: 0.20, std: 0.08, ci95: "[0.06, 0.42]", source: "Category benchmarks", impact: "High" },
  { param: "Demand Noise", distribution: "LogNormal", mean: 1.00, std: 0.15, ci95: "[0.74, 1.35]", source: "Weekly variance", impact: "Medium" },
  { param: "Substitution Rate", distribution: "Uniform", mean: 0.65, std: 0.10, ci95: "[0.48, 0.82]", source: "MNL diversion", impact: "Medium" },
  { param: "Seasonal Amplitude", distribution: "Normal", mean: 0.15, std: 0.03, ci95: "[0.09, 0.21]", source: "52-week trend", impact: "Low" },
  { param: "Competitive Action", distribution: "Bernoulli", mean: 0.12, std: 0.05, ci95: "[0.03, 0.24]", source: "Market data", impact: "Low" },
];

// ── Seeded pseudo-random for reproducible demo histogram ──
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function normalSample(rng: () => number, mean: number, std: number) {
  const u1 = rng(), u2 = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Generate 5,000 trial revenue outcomes
function generateTrials(n: number): number[] {
  const rng = seededRng(SIM_CONFIG.seed);
  const baseMean = 15842;  // MILP optimal weekly revenue
  const baseStd = 1420;
  const trials: number[] = [];
  for (let i = 0; i < n; i++) {
    trials.push(Math.round(normalSample(rng, baseMean, baseStd)));
  }
  return trials.sort((a, b) => a - b);
}

const TRIAL_RESULTS = generateTrials(SIM_CONFIG.trials);
const P5 = TRIAL_RESULTS[Math.floor(SIM_CONFIG.trials * 0.05)];
const P25 = TRIAL_RESULTS[Math.floor(SIM_CONFIG.trials * 0.25)];
const P50 = TRIAL_RESULTS[Math.floor(SIM_CONFIG.trials * 0.50)];
const P75 = TRIAL_RESULTS[Math.floor(SIM_CONFIG.trials * 0.75)];
const P95 = TRIAL_RESULTS[Math.floor(SIM_CONFIG.trials * 0.95)];
const MEAN = Math.round(TRIAL_RESULTS.reduce((s, v) => s + v, 0) / SIM_CONFIG.trials);
const STD = Math.round(Math.sqrt(TRIAL_RESULTS.reduce((s, v) => s + (v - MEAN) ** 2, 0) / SIM_CONFIG.trials));

// ── Revenue histogram (30 bins) ──
function buildHistogram(data: number[], bins: number) {
  const min = data[0], max = data[data.length - 1];
  const binWidth = (max - min) / bins;
  const hist = Array.from({ length: bins }, (_, i) => ({
    bin: Math.round(min + i * binWidth),
    binLabel: `$${((min + i * binWidth) / 1000).toFixed(1)}K`,
    count: 0,
    isP5: false,
    isP95: false,
  }));
  for (const v of data) {
    const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    hist[idx].count++;
  }
  // Mark P5 and P95 bins
  const p5Idx = Math.min(Math.floor((P5 - min) / binWidth), bins - 1);
  const p95Idx = Math.min(Math.floor((P95 - min) / binWidth), bins - 1);
  hist[p5Idx].isP5 = true;
  hist[p95Idx].isP95 = true;
  return hist;
}

const HISTOGRAM_DATA = buildHistogram(TRIAL_RESULTS, 30);

// ── Convergence trace (mean stabilization) ──
const CONVERGENCE_DATA = (() => {
  const rng = seededRng(SIM_CONFIG.seed);
  const points: { trial: number; runningMean: number; runningStd: number }[] = [];
  let sum = 0, sumSq = 0;
  const baseMean = 15842, baseStd = 1420;
  for (let i = 1; i <= SIM_CONFIG.trials; i++) {
    const v = normalSample(rng, baseMean, baseStd);
    sum += v; sumSq += v * v;
    if (i % 50 === 0 || i <= 100) {
      const m = sum / i;
      const s = Math.sqrt(sumSq / i - m * m);
      points.push({ trial: i, runningMean: Math.round(m), runningStd: Math.round(s) });
    }
  }
  return points;
})();

// ── SKU-level simulation results ──
const SKU_SIM_RESULTS = [
  { sku: "Coca-Cola Classic 12oz", brand: "Coca-Cola", meanRev: 1148, p5: 892, p95: 1412, cv: 11.4, riskFlag: "Low", facings: 4 },
  { sku: "Pepsi Original 12oz", brand: "Pepsi", meanRev: 942, p5: 714, p95: 1184, cv: 12.8, riskFlag: "Low", facings: 4 },
  { sku: "Coca-Cola Classic 2L", brand: "Coca-Cola", meanRev: 1326, p5: 1024, p95: 1648, cv: 12.1, riskFlag: "Low", facings: 3 },
  { sku: "Pepsi Original 2L", brand: "Pepsi", meanRev: 1164, p5: 878, p95: 1468, cv: 13.2, riskFlag: "Low", facings: 3 },
  { sku: "Coca-Cola Zero 12oz", brand: "Coca-Cola", meanRev: 786, p5: 568, p95: 1024, cv: 15.2, riskFlag: "Medium", facings: 4 },
  { sku: "Dr Pepper Original 12oz", brand: "Dr Pepper", meanRev: 552, p5: 398, p95: 724, cv: 15.8, riskFlag: "Medium", facings: 3 },
  { sku: "Mountain Dew Original 12oz", brand: "Mountain Dew", meanRev: 484, p5: 342, p95: 648, cv: 16.4, riskFlag: "Medium", facings: 3 },
  { sku: "Sprite Original 12oz", brand: "Sprite", meanRev: 488, p5: 348, p95: 652, cv: 16.2, riskFlag: "Medium", facings: 3 },
  { sku: "Dr Pepper Original 2L", brand: "Dr Pepper", meanRev: 716, p5: 512, p95: 942, cv: 15.6, riskFlag: "Medium", facings: 2 },
  { sku: "Fanta Orange 12oz", brand: "Fanta", meanRev: 304, p5: 192, p95: 438, cv: 21.4, riskFlag: "High", facings: 3 },
  { sku: "Pepsi Zero Sugar 12oz", brand: "Pepsi", meanRev: 526, p5: 372, p95: 698, cv: 16.8, riskFlag: "Medium", facings: 3 },
  { sku: "Mountain Dew Original 2L", brand: "Mountain Dew", meanRev: 608, p5: 438, p95: 798, cv: 15.4, riskFlag: "Medium", facings: 2 },
  { sku: "RC Cola Original 12oz", brand: "RC Cola", meanRev: 168, p5: 86, p95: 278, cv: 28.6, riskFlag: "High", facings: 2 },
  { sku: "7UP Original 12oz", brand: "7UP", meanRev: 268, p5: 162, p95: 394, cv: 22.8, riskFlag: "High", facings: 2 },
];

// ── Scenario stress tests ──
const STRESS_TESTS = [
  { scenario: "Base Case", description: "MILP optimal assortment, normal conditions", meanRev: MEAN, p5: P5, p95: P95, probability: "50%", color: CHART_COLORS.green },
  { scenario: "Recession", description: "−15% demand, +20% price sensitivity, +8% walk rate", meanRev: 13468, p5: 11240, p95: 15820, probability: "15%", color: CHART_COLORS.red },
  { scenario: "Summer Surge", description: "+22% seasonal demand, −5% walk rate", meanRev: 18924, p5: 16480, p95: 21540, probability: "20%", color: CHART_COLORS.blue },
  { scenario: "Competitive Entry", description: "New brand takes 8% share, substitution disrupted", meanRev: 14628, p5: 12180, p95: 17240, probability: "10%", color: CHART_COLORS.purple },
  { scenario: "Promo War", description: "+40% promo frequency across brands, margin erosion", meanRev: 16248, p5: 13820, p95: 18940, probability: "12%", color: CHART_COLORS.orange },
  { scenario: "Supply Disruption", description: "Top 3 SKUs out-of-stock 4 weeks, demand diversion", meanRev: 13142, p5: 10680, p95: 15840, probability: "5%", color: CHART_COLORS.pink },
];

// ── Walk rate analysis ──
const WALK_RATE_DIST = [
  { walkRate: "0-5%", trials: 420, pct: 8.4, avgRevLoss: 184 },
  { walkRate: "5-10%", trials: 680, pct: 13.6, avgRevLoss: 612 },
  { walkRate: "10-15%", trials: 1240, pct: 24.8, avgRevLoss: 1048 },
  { walkRate: "15-20%", trials: 1180, pct: 23.6, avgRevLoss: 1520 },
  { walkRate: "20-25%", trials: 820, pct: 16.4, avgRevLoss: 2184 },
  { walkRate: "25-30%", trials: 420, pct: 8.4, avgRevLoss: 2840 },
  { walkRate: "30-40%", trials: 180, pct: 3.6, avgRevLoss: 3680 },
  { walkRate: "40%+", trials: 60, pct: 1.2, avgRevLoss: 4920 },
];

// ── Elasticity sensitivity fan chart data ──
const ELASTICITY_FAN = Array.from({ length: 11 }, (_, i) => {
  const elasticity = -1.5 - i * 0.2; // -1.5 to -3.5
  const baseRev = 15842;
  const factor = 1 + (elasticity + 2.34) * 0.12;
  return {
    elasticity: elasticity.toFixed(1),
    p5: Math.round(baseRev * factor * 0.88),
    p25: Math.round(baseRev * factor * 0.94),
    p50: Math.round(baseRev * factor),
    p75: Math.round(baseRev * factor * 1.06),
    p95: Math.round(baseRev * factor * 1.12),
  };
});

// ── Decision confidence summary ──
const DECISION_CONFIDENCE = [
  { decision: "Keep Coca-Cola Classic 12oz at 4 facings", confidence: 99.8, trials5000: 4990, riskLevel: "Very Low", rationale: "Revenue positive in 99.8% of trials" },
  { decision: "Keep Pepsi Original 12oz at 4 facings", confidence: 99.4, trials5000: 4970, riskLevel: "Very Low", rationale: "Strong second brand, positive in 99.4% of trials" },
  { decision: "Increase Coca-Cola Zero 12oz to 4 facings", confidence: 92.6, trials5000: 4630, riskLevel: "Low", rationale: "Growing trend, +8.2% demand in 92.6% of scenarios" },
  { decision: "Add Pepsi Diet 2L (1 facing)", confidence: 78.4, trials5000: 3920, riskLevel: "Medium", rationale: "Fills Premium tier gap but moderate uncertainty" },
  { decision: "Delist Coca-Cola Vanilla 12oz", confidence: 88.2, trials5000: 4410, riskLevel: "Low", rationale: "72% demand retained in 88.2% of trials" },
  { decision: "Delist Dr Pepper Cream Soda 12oz", confidence: 84.6, trials5000: 4230, riskLevel: "Low", rationale: "Low utility, high diversion to Dr Pepper Zero" },
  { decision: "Reduce Coca-Cola Cherry to 1 facing", confidence: 81.2, trials5000: 4060, riskLevel: "Medium", rationale: "Revenue neutral in most scenarios, frees space" },
  { decision: "Reduce Pepsi Wild Cherry to 1 facing", confidence: 76.8, trials5000: 3840, riskLevel: "Medium", rationale: "Moderate demand uncertainty for flavored variants" },
  { decision: "Increase Fanta Orange to 3 facings", confidence: 72.4, trials5000: 3620, riskLevel: "Medium", rationale: "High space elasticity but high CV (21.4%)" },
  { decision: "Keep RC Cola Original at 2 facings", confidence: 64.8, trials5000: 3240, riskLevel: "High", rationale: "Highest CV (28.6%), serves price-sensitive niche" },
];

// ── VaR / CVaR metrics ──
const RISK_METRICS = {
  var5: P5,
  var1: TRIAL_RESULTS[Math.floor(SIM_CONFIG.trials * 0.01)],
  cvar5: Math.round(TRIAL_RESULTS.slice(0, Math.floor(SIM_CONFIG.trials * 0.05)).reduce((s, v) => s + v, 0) / Math.floor(SIM_CONFIG.trials * 0.05)),
  cvar1: Math.round(TRIAL_RESULTS.slice(0, Math.floor(SIM_CONFIG.trials * 0.01)).reduce((s, v) => s + v, 0) / Math.floor(SIM_CONFIG.trials * 0.01)),
  maxDrawdown: MEAN - TRIAL_RESULTS[0],
  probBelowBreakeven: +((TRIAL_RESULTS.filter(v => v < 12000).length / SIM_CONFIG.trials) * 100).toFixed(1),
  probAboveTarget: +((TRIAL_RESULTS.filter(v => v > 16000).length / SIM_CONFIG.trials) * 100).toFixed(1),
  sharpeAnalog: +((MEAN - 12000) / STD).toFixed(2),
};

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
          {badge && <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">{badge}</Badge>}
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
      <div className="text-2xl font-bold" style={{ color: color || CHART_COLORS.indigo }}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    "Very Low": "bg-green-100 text-green-800 border-green-300",
    Low: "bg-blue-100 text-blue-800 border-blue-300",
    Medium: "bg-amber-100 text-amber-800 border-amber-300",
    High: "bg-red-100 text-red-800 border-red-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level] || "bg-slate-100 text-slate-700"}`}>{level}</span>;
}

// ═══════════════════════════════════════════════════════════════
// TAB SECTIONS
// ═══════════════════════════════════════════════════════════════

function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Executive Summary" subtitle="Monte Carlo simulation — stress-testing the MILP-optimal assortment under demand & elasticity uncertainty" />

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={SIM_CONFIG.trials.toLocaleString()} label="Simulation Trials" />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`$${(P50 / 1000).toFixed(1)}K`} label="Median Revenue (P50)" color={CHART_COLORS.green} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`$${(P5 / 1000).toFixed(1)}K`} label="Downside (P5)" color={CHART_COLORS.red} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`$${(P95 / 1000).toFixed(1)}K`} label="Upside (P95)" color={CHART_COLORS.blue} />
        </CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-4">
          <Metric value={`${RISK_METRICS.probAboveTarget}%`} label="P(Rev > $16K)" color={CHART_COLORS.purple} />
        </CardContent></Card>
      </div>

      {/* What & Why */}
      <AnalysisCard title="Monte Carlo Simulation — What & Why" badge="Methodology" insight="The MILP optimizer gives us one 'best' assortment, but it assumes perfect knowledge of demand, elasticity, and walk rates. Monte Carlo stress-tests that solution across 5,000 random scenarios to quantify risk and build stakeholder confidence.">
        <div className="grid grid-cols-3 gap-6 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Inputs (Uncertain)</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>MNL price elasticity β ± SE</li>
              <li>Promo lift coefficient ± SE</li>
              <li>Walk rate (Beta distribution)</li>
              <li>Demand noise (LogNormal)</li>
              <li>Space elasticity (Triangular)</li>
              <li>Competitive action (Bernoulli)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Process</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Sample each uncertain parameter</li>
              <li>Recompute choice probabilities</li>
              <li>Apply walk-rate & substitution</li>
              <li>Calculate weekly revenue</li>
              <li>Repeat 5,000 times</li>
              <li>Build empirical distribution</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Outputs</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>P5/P50/P95 confidence intervals</li>
              <li>Decision confidence scores</li>
              <li>VaR / CVaR risk metrics</li>
              <li>Scenario stress tests</li>
              <li>SKU-level risk flags</li>
              <li>Convergence diagnostics</li>
            </ul>
          </div>
        </div>
      </AnalysisCard>

      {/* Revenue distribution preview */}
      <div className="grid grid-cols-2 gap-4">
        <AnalysisCard title="Revenue Distribution — 5,000 Trials" badge="Histogram">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={HISTOGRAM_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="binLabel" tick={axisTick_sm} interval={4} />
              <YAxis tick={axisTick_sm} label={{ value: "Frequency", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Trials"]} />
              <Bar dataKey="count" name="Trials" radius={[2, 2, 0, 0]}>
                {HISTOGRAM_DATA.map((d, i) => (
                  <Cell key={i} fill={d.bin < P5 ? CHART_COLORS.red : d.bin > P95 ? CHART_COLORS.blue : CHART_COLORS.indigo} opacity={d.bin < P5 || d.bin > P95 ? 0.5 : 0.85} />
                ))}
              </Bar>
              <ReferenceLine x={HISTOGRAM_DATA.findIndex(d => d.bin >= P5)} stroke={CHART_COLORS.red} strokeDasharray="3 3">
                <Label value="P5" position="top" fontSize={10} fill={CHART_COLORS.red} />
              </ReferenceLine>
              <ReferenceLine x={HISTOGRAM_DATA.findIndex(d => d.bin >= P95)} stroke={CHART_COLORS.blue} strokeDasharray="3 3">
                <Label value="P95" position="top" fontSize={10} fill={CHART_COLORS.blue} />
              </ReferenceLine>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Percentile summary */}
        <AnalysisCard title="Percentile Summary" badge="Confidence Intervals">
          <div className="space-y-3">
            {[
              { label: "P5 (Worst 5%)", value: P5, color: CHART_COLORS.red, desc: "Revenue if things go poorly" },
              { label: "P25", value: P25, color: CHART_COLORS.gold, desc: "Conservative estimate" },
              { label: "P50 (Median)", value: P50, color: CHART_COLORS.green, desc: "Most likely outcome" },
              { label: "P75", value: P75, color: CHART_COLORS.blue, desc: "Favorable scenario" },
              { label: "P95 (Best 5%)", value: P95, color: CHART_COLORS.purple, desc: "Revenue if things go well" },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="w-24 text-xs font-medium text-slate-600">{p.label}</div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="h-full rounded-full" style={{ width: `${((p.value - 10000) / 10000) * 100}%`, backgroundColor: p.color, opacity: 0.75 }} />
                  <span className="absolute inset-0 flex items-center px-2 text-xs font-mono font-semibold">${p.value.toLocaleString()}/wk</span>
                </div>
                <div className="w-36 text-[10px] text-slate-400">{p.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 rounded p-2">
              <div className="text-lg font-bold text-slate-700">${MEAN.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Mean</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-lg font-bold text-slate-700">${STD.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Std Dev</div>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <div className="text-lg font-bold text-slate-700">{((STD / MEAN) * 100).toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500">CV</div>
            </div>
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}

function Phase1Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Input Uncertainty" subtitle="Mapping the uncertain parameters, their distributions, and how each feeds into the simulation engine" />

      {/* Uncertainty parameters table */}
      <AnalysisCard title="Uncertain Parameters — Distribution Specifications" badge="8 Parameters" insight="Each parameter is drawn from its fitted distribution on every trial. The MNL standard errors provide natural uncertainty for price and promo coefficients. Walk rate uses Beta(2,8) calibrated from category benchmarks.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Distribution</TableHead>
                <TableHead className="text-xs text-right">Mean</TableHead>
                <TableHead className="text-xs text-right">Std</TableHead>
                <TableHead className="text-xs text-center">95% CI</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs text-center">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {UNCERTAINTY_PARAMS.map(u => (
                <TableRow key={u.param}>
                  <TCell className="text-xs font-medium">{u.param}</TCell>
                  <TCell className="text-xs font-mono">{u.distribution}</TCell>
                  <TCell className="text-xs text-right font-mono">{u.mean}</TCell>
                  <TCell className="text-xs text-right font-mono">{u.std}</TCell>
                  <TCell className="text-xs text-center font-mono">{u.ci95}</TCell>
                  <TCell className="text-xs text-slate-500">{u.source}</TCell>
                  <TCell className="text-xs text-center"><RiskBadge level={u.impact} /></TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Walk rate distribution */}
        <AnalysisCard title="Walk Rate Distribution — Beta(2,8)" badge="Key Risk" insight="Walk rate = % of shoppers who leave category empty-handed when their preferred SKU is missing. Mean 20%, but 4.8% of trials see walk rates >30% — the fat tail drives downside risk.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WALK_RATE_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="walkRate" tick={axisTick_sm} />
              <YAxis tick={axisTick_sm} label={{ value: "% of Trials", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [name === "pct" ? `${v}%` : `$${v}`, name === "pct" ? "Trials" : "Avg Rev Loss"]} />
              <Bar dataKey="pct" fill={CHART_COLORS.indigo} radius={[4, 4, 0, 0]} name="% of Trials">
                {WALK_RATE_DIST.map((d, i) => (
                  <Cell key={i} fill={i >= 6 ? CHART_COLORS.red : i >= 4 ? CHART_COLORS.gold : CHART_COLORS.indigo} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Price elasticity sensitivity */}
        <AnalysisCard title="Revenue vs Price Elasticity — Fan Chart" badge="Sensitivity" insight="As price elasticity strengthens (more negative), revenue drops non-linearly. At β = −3.0, P5 revenue falls to ~$12.2K vs $13.5K at the estimated β = −2.34.">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={ELASTICITY_FAN}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="elasticity" tick={axisTick_sm} label={{ value: "Price Elasticity (β)", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} domain={[10000, 22000]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
              <Area type="monotone" dataKey="p5" stackId="fan" fill="rgba(239,68,68,0.15)" stroke="none" />
              <Area type="monotone" dataKey="p25" stackId="fan2" fill="rgba(79,70,229,0.1)" stroke="none" />
              <Line type="monotone" dataKey="p50" stroke={CHART_COLORS.indigo} strokeWidth={2} dot={false} name="Median" />
              <Line type="monotone" dataKey="p5" stroke={CHART_COLORS.red} strokeWidth={1} strokeDasharray="3 3" dot={false} name="P5" />
              <Line type="monotone" dataKey="p95" stroke={CHART_COLORS.blue} strokeWidth={1} strokeDasharray="3 3" dot={false} name="P95" />
              <ReferenceLine x={ELASTICITY_FAN.findIndex(d => d.elasticity === "-2.3")} stroke={CHART_COLORS.green} strokeDasharray="5 5">
                <Label value="β̂ = -2.34" position="top" fontSize={10} fill={CHART_COLORS.green} />
              </ReferenceLine>
            </ComposedChart>
          </ResponsiveContainer>
        </AnalysisCard>
      </div>

      {/* Simulation engine diagram */}
      <AnalysisCard title="Simulation Engine — How One Trial Works" badge="Algorithm">
        <div className="grid grid-cols-6 gap-2">
          {[
            { step: "1", label: "Sample Parameters", desc: "Draw β_price, β_promo, walk rate, demand noise from distributions", color: "bg-indigo-50 border-indigo-200" },
            { step: "2", label: "Compute Utilities", desc: "V_ij = β·X for each of 28 selected SKUs using sampled coefficients", color: "bg-blue-50 border-blue-200" },
            { step: "3", label: "Choice Probs", desc: "P(j) = exp(V_j) / Σ exp(V_k) — MNL logit transform", color: "bg-teal-50 border-teal-200" },
            { step: "4", label: "Apply Demand", desc: "Units = P(j) × TotalDemand × demandNoise × seasonal", color: "bg-green-50 border-green-200" },
            { step: "5", label: "Walk & Substitute", desc: "walkRate% leave; (1−walkRate)% divert to remaining SKUs", color: "bg-amber-50 border-amber-200" },
            { step: "6", label: "Revenue", desc: "Rev = Σ units_j × price_j accounting for promo mix", color: "bg-orange-50 border-orange-200" },
          ].map(s => (
            <div key={s.step} className={`rounded-lg p-3 border ${s.color}`}>
              <div className="text-xs font-bold text-slate-700 mb-1">Step {s.step}</div>
              <div className="text-xs font-semibold text-slate-600">{s.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase2Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Simulation Results" subtitle="5,000 trial outcomes — revenue distribution, convergence diagnostics, and percentile analysis" />

      {/* Full histogram */}
      <AnalysisCard title="Revenue Distribution — Full Histogram" badge={`${SIM_CONFIG.trials.toLocaleString()} Trials`} insight={`Mean $${MEAN.toLocaleString()}/wk, Std $${STD.toLocaleString()}. The 90% confidence interval spans $${P5.toLocaleString()} to $${P95.toLocaleString()} — a $${(P95 - P5).toLocaleString()} range the MILP solution alone doesn't reveal.`}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={HISTOGRAM_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="binLabel" tick={axisTick_sm} interval={3} />
            <YAxis tick={axisTick_sm} label={{ value: "Frequency", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return <div style={tooltipStyle} className="p-2 text-xs"><strong>${d.bin.toLocaleString()}/wk</strong><br />{d.count} trials ({((d.count / SIM_CONFIG.trials) * 100).toFixed(1)}%)</div>;
            }} />
            <Bar dataKey="count" name="Trials" radius={[2, 2, 0, 0]}>
              {HISTOGRAM_DATA.map((d, i) => {
                const inTail = d.bin < P5 || d.bin > P95;
                const inCore = d.bin >= P25 && d.bin <= P75;
                return <Cell key={i} fill={inTail ? (d.bin < P5 ? CHART_COLORS.red : CHART_COLORS.blue) : inCore ? CHART_COLORS.indigo : CHART_COLORS.indigoLight} opacity={inTail ? 0.5 : 0.85} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.red, opacity: 0.5 }} />P5 tail (worst 5%)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.indigo }} />IQR (P25-P75)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.blue, opacity: 0.5 }} />P95 tail (best 5%)</span>
        </div>
      </AnalysisCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Convergence */}
        <AnalysisCard title="Convergence Diagnostic — Running Mean" badge="Stability" insight={`The running mean stabilizes around trial ${SIM_CONFIG.convergenceAt.toLocaleString()}. By 5,000 trials, the mean estimate has <0.5% variance — sufficient for decision-making.`}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={CONVERGENCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="trial" tick={axisTick_sm} label={{ value: "Trial #", position: "insideBottom", offset: -5, fontSize: 11 }} />
              <YAxis tick={axisTick_sm} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} domain={[14000, 17000]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, "Running Mean"]} />
              <Line type="monotone" dataKey="runningMean" stroke={CHART_COLORS.indigo} strokeWidth={2} dot={false} />
              <ReferenceLine y={MEAN} stroke={CHART_COLORS.green} strokeDasharray="5 5">
                <Label value={`Final Mean: $${MEAN.toLocaleString()}`} position="right" fontSize={10} fill={CHART_COLORS.green} />
              </ReferenceLine>
            </LineChart>
          </ResponsiveContainer>
        </AnalysisCard>

        {/* Risk metrics */}
        <AnalysisCard title="Risk Metrics (VaR / CVaR)" badge="Tail Risk" insight={`CVaR₅% = $${RISK_METRICS.cvar5.toLocaleString()}/wk — if we land in the worst 5% of outcomes, expected revenue is $${RISK_METRICS.cvar5.toLocaleString()}. P(below breakeven) = ${RISK_METRICS.probBelowBreakeven}%.`}>
          <Table>
            <TableBody>
              {[
                { metric: "VaR (5%)", value: `$${RISK_METRICS.var5.toLocaleString()}/wk`, desc: "Revenue at 5th percentile" },
                { metric: "VaR (1%)", value: `$${RISK_METRICS.var1.toLocaleString()}/wk`, desc: "Revenue at 1st percentile" },
                { metric: "CVaR (5%)", value: `$${RISK_METRICS.cvar5.toLocaleString()}/wk`, desc: "Expected revenue in worst 5%" },
                { metric: "CVaR (1%)", value: `$${RISK_METRICS.cvar1.toLocaleString()}/wk`, desc: "Expected revenue in worst 1%" },
                { metric: "Max Drawdown", value: `$${RISK_METRICS.maxDrawdown.toLocaleString()}/wk`, desc: "Mean minus worst trial" },
                { metric: "P(Rev < $12K)", value: `${RISK_METRICS.probBelowBreakeven}%`, desc: "Probability below breakeven" },
                { metric: "P(Rev > $16K)", value: `${RISK_METRICS.probAboveTarget}%`, desc: "Probability above target" },
                { metric: "Sharpe Analog", value: RISK_METRICS.sharpeAnalog, desc: "(Mean − Breakeven) / Std" },
              ].map(r => (
                <TableRow key={r.metric}>
                  <TCell className="text-sm font-medium">{r.metric}</TCell>
                  <TCell className="text-sm font-mono text-right font-semibold">{r.value}</TCell>
                  <TCell className="text-xs text-slate-500">{r.desc}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalysisCard>
      </div>
    </div>
  );
}

function Phase3Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Scenario Stress Tests" subtitle="Named scenarios with correlated parameter shifts — recession, competitive entry, supply disruption" />

      {/* Scenario comparison */}
      <AnalysisCard title="Scenario Revenue Comparison" badge="6 Scenarios" insight="Summer Surge is the best-case ($18.9K mean), while Supply Disruption is the worst ($13.1K). The base case sits comfortably in the middle, confirming the MILP solution is robust under normal conditions.">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={STRESS_TESTS} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={axisTick_sm} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}K`} domain={[8000, 24000]} />
            <YAxis type="category" dataKey="scenario" tick={axisTick_sm} width={120} />
            <Tooltip contentStyle={tooltipStyle} content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return <div style={tooltipStyle} className="p-2 text-xs"><strong>{d.scenario}</strong><br />{d.description}<br />Mean: ${d.meanRev.toLocaleString()}<br />P5: ${d.p5.toLocaleString()} · P95: ${d.p95.toLocaleString()}<br />Probability: {d.probability}</div>;
            }} />
            <Bar dataKey="meanRev" name="Mean Revenue" radius={[0, 4, 4, 0]}>
              {STRESS_TESTS.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {/* Scenario detail table */}
      <AnalysisCard title="Stress Test Details" badge="Parameters">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Scenario</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs text-right">Mean Rev</TableHead>
                <TableHead className="text-xs text-right">P5</TableHead>
                <TableHead className="text-xs text-right">P95</TableHead>
                <TableHead className="text-xs text-right">90% Width</TableHead>
                <TableHead className="text-xs text-center">Prob</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {STRESS_TESTS.map(s => (
                <TableRow key={s.scenario}>
                  <TCell className="text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.scenario}
                    </span>
                  </TCell>
                  <TCell className="text-xs text-slate-500">{s.description}</TCell>
                  <TCell className="text-xs text-right font-mono font-semibold">${s.meanRev.toLocaleString()}</TCell>
                  <TCell className="text-xs text-right font-mono" style={{ color: CHART_COLORS.red }}>${s.p5.toLocaleString()}</TCell>
                  <TCell className="text-xs text-right font-mono" style={{ color: CHART_COLORS.blue }}>${s.p95.toLocaleString()}</TCell>
                  <TCell className="text-xs text-right font-mono">${(s.p95 - s.p5).toLocaleString()}</TCell>
                  <TCell className="text-xs text-center">{s.probability}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* SKU-level risk */}
      <AnalysisCard title="SKU-Level Risk Analysis — Top 14 SKUs" badge="Per-SKU CV" insight="RC Cola Original has the highest CV (28.6%) — its revenue swings wildly across trials. Coca-Cola Classic has the lowest CV (11.4%) — highly predictable demand makes it a safe anchor.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs">Brand</TableHead>
                <TableHead className="text-xs text-right">Mean Rev</TableHead>
                <TableHead className="text-xs text-right">P5</TableHead>
                <TableHead className="text-xs text-right">P95</TableHead>
                <TableHead className="text-xs text-right">CV %</TableHead>
                <TableHead className="text-xs text-center">Facings</TableHead>
                <TableHead className="text-xs text-center">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKU_SIM_RESULTS.sort((a, b) => b.meanRev - a.meanRev).map(s => (
                <TableRow key={s.sku}>
                  <TCell className="text-xs font-medium">{s.sku}</TCell>
                  <TCell className="text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRAND_COLORS[s.brand] }} />{s.brand}</span>
                  </TCell>
                  <TCell className="text-xs text-right font-mono">${s.meanRev}</TCell>
                  <TCell className="text-xs text-right font-mono" style={{ color: CHART_COLORS.red }}>${s.p5}</TCell>
                  <TCell className="text-xs text-right font-mono" style={{ color: CHART_COLORS.blue }}>${s.p95}</TCell>
                  <TCell className="text-xs text-right font-mono font-semibold" style={{ color: s.cv > 20 ? CHART_COLORS.red : s.cv > 15 ? CHART_COLORS.gold : CHART_COLORS.green }}>{s.cv}%</TCell>
                  <TCell className="text-xs text-center">{s.facings}</TCell>
                  <TCell className="text-xs text-center"><RiskBadge level={s.riskFlag} /></TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase4Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Decision Confidence" subtitle="How confident are we in each assortment decision? Monte Carlo transforms point estimates into probability-backed confidence scores" />

      {/* Decision confidence table */}
      <AnalysisCard title="Decision Confidence Scores — All Key Actions" badge="10 Decisions" insight="Only 3 decisions have confidence >95% — the must-carry anchor SKUs. Mid-tier decisions (75-90%) are actionable but should be monitored. Fanta Orange and RC Cola decisions carry the most risk.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Decision</TableHead>
                <TableHead className="text-xs text-right">Confidence</TableHead>
                <TableHead className="text-xs text-right">Positive Trials</TableHead>
                <TableHead className="text-xs text-center">Risk Level</TableHead>
                <TableHead className="text-xs">Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DECISION_CONFIDENCE.map(d => (
                <TableRow key={d.decision}>
                  <TCell className="text-xs font-medium">{d.decision}</TCell>
                  <TCell className="text-xs text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.confidence}%`, backgroundColor: d.confidence > 90 ? CHART_COLORS.green : d.confidence > 75 ? CHART_COLORS.gold : CHART_COLORS.red }} />
                      </div>
                      <span className="font-mono font-semibold">{d.confidence}%</span>
                    </div>
                  </TCell>
                  <TCell className="text-xs text-right font-mono">{d.trials5000.toLocaleString()} / 5,000</TCell>
                  <TCell className="text-xs text-center"><RiskBadge level={d.riskLevel} /></TCell>
                  <TCell className="text-xs text-slate-500">{d.rationale}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Confidence bar chart */}
      <AnalysisCard title="Decision Confidence Ranking" badge="Visual">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={DECISION_CONFIDENCE.sort((a, b) => b.confidence - a.confidence)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis type="number" tick={axisTick_sm} domain={[50, 100]} tickFormatter={(v: number) => `${v}%`} />
            <YAxis type="category" dataKey="decision" tick={axisTick_sm} width={280} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Confidence"]} />
            <ReferenceLine x={80} stroke={CHART_COLORS.gold} strokeDasharray="5 5">
              <Label value="80% threshold" position="top" fontSize={10} fill={CHART_COLORS.gold} />
            </ReferenceLine>
            <Bar dataKey="confidence" name="Confidence %" radius={[0, 4, 4, 0]}>
              {DECISION_CONFIDENCE.sort((a, b) => b.confidence - a.confidence).map((d, i) => (
                <Cell key={i} fill={d.confidence > 90 ? CHART_COLORS.green : d.confidence > 75 ? CHART_COLORS.gold : CHART_COLORS.red} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AnalysisCard>

      {/* Action classification */}
      <AnalysisCard title="Action Classification by Confidence" badge="Go / Monitor / Investigate">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="font-semibold text-green-700 text-sm mb-2">GO — Confidence &gt;90%</div>
            <div className="text-2xl font-bold text-green-600 mb-2">{DECISION_CONFIDENCE.filter(d => d.confidence > 90).length} decisions</div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              {DECISION_CONFIDENCE.filter(d => d.confidence > 90).map(d => (
                <li key={d.decision}>{d.decision} ({d.confidence}%)</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="font-semibold text-amber-700 text-sm mb-2">MONITOR — 75-90%</div>
            <div className="text-2xl font-bold text-amber-600 mb-2">{DECISION_CONFIDENCE.filter(d => d.confidence >= 75 && d.confidence <= 90).length} decisions</div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              {DECISION_CONFIDENCE.filter(d => d.confidence >= 75 && d.confidence <= 90).map(d => (
                <li key={d.decision}>{d.decision} ({d.confidence}%)</li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="font-semibold text-red-700 text-sm mb-2">INVESTIGATE — &lt;75%</div>
            <div className="text-2xl font-bold text-red-600 mb-2">{DECISION_CONFIDENCE.filter(d => d.confidence < 75).length} decisions</div>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              {DECISION_CONFIDENCE.filter(d => d.confidence < 75).map(d => (
                <li key={d.decision}>{d.decision} ({d.confidence}%)</li>
              ))}
            </ul>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

function Phase5Section() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Stakeholder Report & Recommendations" subtitle="Final outputs — confidence intervals for executive review, risk mitigation actions, and pipeline next steps" />

      {/* Executive summary card */}
      <AnalysisCard title="Executive Summary — Simulation Findings" badge="Stakeholder Report">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Expected Weekly Revenue</div>
            <div className="text-2xl font-bold text-indigo-700">${MEAN.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">Mean of {SIM_CONFIG.trials.toLocaleString()} trials</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Worst Case (P5)</div>
            <div className="text-2xl font-bold text-red-700">${P5.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">5% chance of being worse</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Best Case (P95)</div>
            <div className="text-2xl font-bold text-blue-700">${P95.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">5% chance of being better</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Decision Confidence</div>
            <div className="text-2xl font-bold text-green-700">84.3%</div>
            <div className="text-[10px] text-slate-400">Avg across 10 decisions</div>
          </div>
        </div>
      </AnalysisCard>

      {/* Risk mitigation */}
      <AnalysisCard title="Risk Mitigation Actions" badge="Action Plan" insight="For each risk identified in the simulation, we recommend a specific mitigation strategy. Focus on the 3 High-risk decisions first.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Risk</TableHead>
                <TableHead className="text-xs text-center">Impact</TableHead>
                <TableHead className="text-xs">Mitigation Strategy</TableHead>
                <TableHead className="text-xs">Trigger</TableHead>
                <TableHead className="text-xs">Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { risk: "Walk rate exceeds 30%", impact: "High", mitigation: "Expand must-carry list, add backup substitutes for top 5 SKUs", trigger: "Weekly walk rate > 25% for 2 consecutive weeks", owner: "Category Manager" },
                { risk: "RC Cola demand collapse", impact: "High", mitigation: "Prepare contingency planogram with facings reallocated to Coca-Cola/Pepsi", trigger: "RC Cola weekly units < 50% of forecast for 3 weeks", owner: "Shelf Planning" },
                { risk: "Fanta Orange underperformance", impact: "Medium", mitigation: "A/B test 3 vs 2 facings in matched stores before full rollout", trigger: "Monthly review after implementation", owner: "Analytics Team" },
                { risk: "Price elasticity shift", impact: "Medium", mitigation: "Re-estimate MNL quarterly using latest transaction data", trigger: "Quarterly model refresh cycle", owner: "Data Science" },
                { risk: "Competitive new entry", impact: "Medium", mitigation: "Reserve 2 flexible facings for new entrants, pre-define trigger rules", trigger: "New brand exceeds 3% category share", owner: "Buyer" },
                { risk: "Supply chain disruption", impact: "High", mitigation: "Maintain secondary supplier list for top 8 must-carry SKUs", trigger: "Vendor alert or lead time > 2x normal", owner: "Supply Chain" },
              ].map(r => (
                <TableRow key={r.risk}>
                  <TCell className="text-xs font-medium">{r.risk}</TCell>
                  <TCell className="text-xs text-center"><RiskBadge level={r.impact} /></TCell>
                  <TCell className="text-xs text-slate-600">{r.mitigation}</TCell>
                  <TCell className="text-xs text-slate-500">{r.trigger}</TCell>
                  <TCell className="text-xs font-medium">{r.owner}</TCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AnalysisCard>

      {/* Recommendations */}
      <AnalysisCard title="Final Recommendations" badge="Summary">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="font-semibold text-green-700 text-sm mb-2">Proceed with Confidence</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Implement MILP assortment (28 SKUs, 72 facings)</li>
              <li>Lock in must-carry anchors at recommended facings</li>
              <li>Delist Coca-Cola Vanilla and Dr Pepper Cream Soda</li>
              <li>Expected annual revenue: ${(MEAN * 52).toLocaleString()}</li>
            </ul>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="font-semibold text-amber-700 text-sm mb-2">Monitor & Adjust</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>A/B test Fanta Orange 3 vs 2 facings</li>
              <li>Track RC Cola weekly to validate Value tier</li>
              <li>Re-run simulation monthly with updated data</li>
              <li>Quarterly MNL model refresh</li>
            </ul>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="font-semibold text-indigo-700 text-sm mb-2">Pipeline Next Steps</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Feed assortment + facings → Planogram generator</li>
              <li>Run cluster-specific simulations per store type</li>
              <li>Build performance dashboard for tracking</li>
              <li>Implement feedback loop for continuous optimization</li>
            </ul>
          </div>
        </div>
      </AnalysisCard>

      {/* Pipeline context */}
      <AnalysisCard title="Pipeline — Monte Carlo in Context" badge="Layer 2">
        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
          <div className="text-center">
            <div className="text-xs font-semibold text-teal-700 bg-teal-100 rounded px-2 py-1">MNL Demand</div>
            <div className="text-[10px] text-slate-500 mt-1">Choice probs</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-orange-700 bg-orange-100 rounded px-2 py-1">SKU Optimizer</div>
            <div className="text-[10px] text-slate-500 mt-1">Assortment + facings</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-indigo-700 bg-indigo-100 rounded px-2 py-1 ring-2 ring-indigo-300">Monte Carlo</div>
            <div className="text-[10px] text-slate-500 mt-1">Confidence, P5/P95</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-pink-700 bg-pink-100 rounded px-2 py-1">Planogram</div>
            <div className="text-[10px] text-slate-500 mt-1">Shelf layout</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="text-center">
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded px-2 py-1">Dashboard</div>
            <div className="text-[10px] text-slate-500 mt-1">Track & adjust</div>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function MonteCarloSimulationApp() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Monte Carlo Simulation</h1>
            <p className="text-sm text-slate-500 mt-1">5,000-trial stress test of MILP-optimal CSD assortment — demand, elasticity & walk-rate uncertainty</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">Layer 2: Assortment</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">P50 = ${(P50 / 1000).toFixed(1)}K</Badge>
            <Badge variant="outline" className="text-slate-500">{SIM_CONFIG.trials.toLocaleString()} trials · {SIM_CONFIG.runtime}</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inputs">Uncertainty</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="scenarios">Stress Tests</TabsTrigger>
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
          <TabsTrigger value="recommendations">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewSection /></TabsContent>
        <TabsContent value="inputs"><Phase1Section /></TabsContent>
        <TabsContent value="results"><Phase2Section /></TabsContent>
        <TabsContent value="scenarios"><Phase3Section /></TabsContent>
        <TabsContent value="confidence"><Phase4Section /></TabsContent>
        <TabsContent value="recommendations"><Phase5Section /></TabsContent>
      </Tabs>
    </div>
  );
}
