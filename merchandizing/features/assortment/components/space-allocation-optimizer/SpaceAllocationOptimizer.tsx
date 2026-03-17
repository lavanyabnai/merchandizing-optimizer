"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  Legend, ReferenceLine, CartesianGrid, ComposedChart, AreaChart, Area, ScatterChart, Scatter,
} from "recharts";
import {
  ChevronRight, Check, Zap, Target, Layers, GitBranch, Database, TrendingUp,
  ArrowUpRight, ArrowDownRight, Info, AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell as TCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ═══════════════════════════════════════════════════════════════════════════════
// DUNNHUMBY "COMPLETE JOURNEY" + "BREAKFAST AT THE FRAT" — HARMONIZED DATA
// Matches CDT Analysis, Store Clustering, and Space Elasticity apps exactly
// ═══════════════════════════════════════════════════════════════════════════════

const STORE_CLUSTERS = [
  { id: "C1", name: "Urban High-Traffic", storeCount: 187, avgWeeklyBaskets: 14200, avgSalesArea: 32000, dominantMission: "Top-Up / Convenience", avgHHIncome: "$85K–$120K", color: "#22d3ee" },
  { id: "C2", name: "Suburban Family", storeCount: 243, avgWeeklyBaskets: 18500, avgSalesArea: 48000, dominantMission: "Stock-Up / Weekly Shop", avgHHIncome: "$65K–$95K", color: "#34d399" },
  { id: "C3", name: "Premium Metro", storeCount: 98, avgWeeklyBaskets: 11800, avgSalesArea: 28000, dominantMission: "Fresh / Specialty", avgHHIncome: "$110K–$160K", color: "#a78bfa" },
  { id: "C4", name: "Value Rural", storeCount: 232, avgWeeklyBaskets: 9200, avgSalesArea: 52000, dominantMission: "Bulk / Value", avgHHIncome: "$40K–$65K", color: "#fbbf24" },
];

const SUBCATEGORIES = [
  { id: "SC1", key: "coldCereal", name: "Cold Cereals", cdtLevel: "Form → Brand → Size", color: "#22d3ee" },
  { id: "SC2", key: "hotCereal", name: "Hot Cereals", cdtLevel: "Form → Flavor → Brand", color: "#34d399" },
  { id: "SC3", key: "pancake", name: "Pancake/Waffle", cdtLevel: "Form → Usage → Brand", color: "#a78bfa" },
  { id: "SC4", key: "syrup", name: "Syrup/Toppings", cdtLevel: "Type → Brand → Size", color: "#fbbf24" },
  { id: "SC5", key: "breakfastBar", name: "Breakfast Bars", cdtLevel: "Occasion → Brand → Flavor", color: "#fb7185" },
];
const N = 5;

const ELAST = [
  [ 0.38, -0.08,  0.03, -0.02,  0.05],
  [-0.06,  0.42, -0.04,  0.06, -0.03],
  [ 0.02, -0.05,  0.35,  0.08, -0.02],
  [-0.03,  0.04,  0.07,  0.31, -0.01],
  [ 0.04, -0.03, -0.02, -0.01,  0.33],
];

const BASE_SALES: Record<string, number[]> = { C1:[3200,1400,980,1100,2100], C2:[4100,1900,1350,1500,2600], C3:[3800,1200,1100,1400,2800], C4:[3500,1700,1200,1250,1800] };
const CLUST_MULT: Record<string, number[]> = { C1:[.9,1.05,.95,.88,1.1], C2:[1,1,1,1,1], C3:[.85,.8,.9,1.15,1.2], C4:[1.1,1.15,1.05,.95,.85] };
const BASE_SPACE: Record<string, number[]> = { C1:[14,6,4,5,8], C2:[18,8,6,7,10], C3:[12,5,5,6,9], C4:[16,8,6,6,8] };
const MIN_SP = 2;

function calcS(si: number, spaces: number[], cid: string) {
  let ls = Math.log(BASE_SALES[cid][si]);
  const m = CLUST_MULT[cid][si];
  for (let j = 0; j < N; j++) ls += ELAST[si][j] * m * Math.log(Math.max(1, spaces[j]));
  return Math.exp(ls);
}
function totS(spaces: number[], cid: string) { let t=0; for(let i=0;i<N;i++) t+=calcS(i,spaces,cid); return t; }
function totFt(sp: number[]) { return sp.reduce((a,b)=>a+b,0); }
function margS(si: number, spaces: number[], cid: string, d=0.5) {
  const hi=[...spaces],lo=[...spaces]; hi[si]+=d; lo[si]-=d;
  return (totS(hi,cid)-totS(lo,cid))/(2*d);
}

function solveSingle(cid: string) {
  const stot = totFt(BASE_SPACE[cid]);
  let cur = [...BASE_SPACE[cid]], curS = totS(cur, cid), imp = true;
  while (imp) {
    imp = false;
    for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
      if (i===j||cur[i]<=MIN_SP) continue;
      const t=[...cur]; t[i]-=1; t[j]+=1;
      const s=totS(t,cid);
      if(s>curS+0.01){cur=t;curS=s;imp=true;}
    }
  }
  return {alloc:cur,sales:curS,totalFeet:stot};
}

function shadowPrices(cid: string) {
  const opt = solveSingle(cid);
  let bestExtra=0;
  for(let j=0;j<N;j++){const t=[...opt.alloc];t[j]+=1;const s=totS(t,cid);if(s>bestExtra)bestExtra=s;}
  const shadowTot = bestExtra - opt.sales;
  const bindings = SUBCATEGORIES.map((_,j) => ({
    name: SUBCATEGORIES[j].name, allocFeet: opt.alloc[j],
    isBinding: opt.alloc[j] <= MIN_SP+0.5,
    marginal: +margS(j,opt.alloc,cid).toFixed(1),
  }));
  return {optimal:opt, shadowTotal:shadowTot, bindings};
}

function solveADMM(maxIt=40, rho=0.5) {
  const cids=["C1","C2","C3","C4"], hist: any[]=[];
  let loc=cids.map(c=>[...BASE_SPACE[c]]), z=Array(N).fill(0), lam=cids.map(()=>Array(N).fill(0));
  for(let j=0;j<N;j++) z[j]=loc.reduce((s,a)=>s+a[j],0)/4;
  for(let it=0;it<maxIt;it++){
    const nw=cids.map((cid,ci)=>{
      const stot=totFt(BASE_SPACE[cid]);let cur=[...loc[ci]],imp=true,rn=0;
      while(imp&&rn<80){imp=false;rn++;
        for(let i=0;i<N;i++)for(let j=0;j<N;j++){
          if(i===j||cur[i]<=MIN_SP)continue;
          const t=[...cur];t[i]-=1;t[j]+=1;if(totFt(t)!==stot)continue;
          let obj=totS(t,cid)*STORE_CLUSTERS[ci].storeCount,cObj=totS(cur,cid)*STORE_CLUSTERS[ci].storeCount;
          for(let k=0;k<N;k++){obj-=lam[ci][k]*(t[k]-z[k])+(rho/2)*(t[k]-z[k])**2;cObj-=lam[ci][k]*(cur[k]-z[k])+(rho/2)*(cur[k]-z[k])**2;}
          if(obj>cObj+0.01){cur=t;imp=true;}
        }
      }return cur;
    });
    loc=nw;
    const totStores=cids.reduce((s,_,ci)=>s+STORE_CLUSTERS[ci].storeCount,0);
    for(let j=0;j<N;j++) z[j]=loc.reduce((s,a,ci)=>s+STORE_CLUSTERS[ci].storeCount*(a[j]+lam[ci][j]/rho),0)/totStores;
    for(let ci=0;ci<4;ci++)for(let j=0;j<N;j++)lam[ci][j]+=rho*(loc[ci][j]-z[j]);
    const pr=Math.sqrt(cids.reduce((s,_,ci)=>s+loc[ci].reduce((s2,v,j)=>s2+(v-z[j])**2,0),0));
    const ns=cids.reduce((s,cid,ci)=>s+STORE_CLUSTERS[ci].storeCount*totS(loc[ci],cid),0);
    hist.push({iter:it+1,primalResidual:+pr.toFixed(3),networkSales:Math.round(ns),allocations:loc.map(a=>[...a]),consensus:[...z]});
    if(pr<0.5&&it>5)break;
  }
  return {history:hist,finalAllocations:hist[hist.length-1].allocations,consensus:z};
}

function seededRng(s: number){let x=s;return()=>{x=(x*16807)%2147483647;return(x-1)/2147483646;};}
function gauss(r: ()=>number,m: number,sd: number){return m+sd*Math.sqrt(-2*Math.log(r()))*Math.cos(2*Math.PI*r());}
function genWeekly(cid: string){
  const rng=seededRng(42+cid.charCodeAt(1)),base=BASE_SPACE[cid],d: any[]=[];
  for(let w=1;w<=52;w++){
    const v=w<=26?.35:.15;
    const sp=base.map(b=>Math.max(MIN_SP,Math.round(b*(1+gauss(rng,0,v))*10)/10));
    const sl=SUBCATEGORIES.map((_,i)=>Math.round(calcS(i,sp,cid)*(1+gauss(rng,0,.05))));
    d.push({week:w,spaces:[...sp],sales:[...sl],totalSpace:+(sp.reduce((a,b)=>a+b,0)).toFixed(1),totalSales:sl.reduce((a,b)=>a+b,0)});
  }return d;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper components
// ═══════════════════════════════════════════════════════════════════════════════

const tooltipStyle = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 13 };
const axisTick = { fill: "#475569", fontSize: 12 };
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
        {insight && <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 mt-1">&#8627; {insight}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Metric({ value, label, color, delta, unit }: { value: string; label: string; color?: string; delta?: number; unit?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color: color || "#0d9488" }}>{value}{unit && <span className="text-xs text-slate-400 ml-1">{unit}</span>}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
      {delta !== undefined && <div className={`text-xs mt-0.5 font-mono ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>{delta >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(delta).toFixed(1)}%</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function SpaceAllocationOptimizer() {
  const [selCl,setSelCl]=useState(0);
  const [manual,setManual]=useState([...BASE_SPACE.C1]);
  const [admmRho,setAdmmRho]=useState(0.5);
  const [admmIt,setAdmmIt]=useState(30);
  const [admmRes,setAdmmRes]=useState<any>(null);
  const [admmRun,setAdmmRun]=useState(false);

  const cid=STORE_CLUSTERS[selCl].id,cl=STORE_CLUSTERS[selCl],stot=totFt(BASE_SPACE[cid]);
  const singles=useMemo(()=>STORE_CLUSTERS.map((_,i)=>{const c=STORE_CLUSTERS[i].id;return{cid:c,...shadowPrices(c)};}),[]);
  const weekly=useMemo(()=>genWeekly(cid),[selCl]);
  const cr=singles[selCl],bSales=totS(BASE_SPACE[cid],cid),oSales=cr.optimal.sales,mSales=totS(manual,cid),uplift=((oSales-bSales)/bSales*100);

  const switchCl=(i: number)=>{setSelCl(i);setManual([...BASE_SPACE[STORE_CLUSTERS[i].id]]);};
  const handleSlider=(idx: number,val: number)=>{
    const nw=[...manual],diff=val-nw[idx];nw[idx]=val;
    const ri=idx===N-1?N-2:N-1;nw[ri]=Math.max(MIN_SP,nw[ri]-diff);
    const t=nw.reduce((a,b)=>a+b,0);if(t!==stot)nw[ri]+=stot-t;if(nw[ri]<MIN_SP)return;setManual(nw);
  };
  const runADMM=()=>{setAdmmRun(true);setTimeout(()=>{setAdmmRes(solveADMM(admmIt,admmRho));setAdmmRun(false);},50);};

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Space Allocation Optimizer</h1>
            <p className="text-sm text-slate-500 mt-1">MILP + ADMM optimization for per-store &amp; fleet-wide space allocation</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">Layer 1: Allocation</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">MILP + ADMM</Badge>
            <Badge variant="outline" className="text-slate-500">760 stores &middot; 4 clusters &middot; 5 subcats</Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline">
        <TabsList className=" w-full mb-6">
          <TabsTrigger  value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger  value="explore">Explorer</TabsTrigger>
          <TabsTrigger   value="formulation">MILP</TabsTrigger>
          <TabsTrigger  value="optimize">Per-Store</TabsTrigger>
          <TabsTrigger  value="admm">Multi-Store</TabsTrigger>
          <TabsTrigger  value="shadow">Shadow Prices</TabsTrigger>
          <TabsTrigger  value="results">Results</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: Pipeline                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="pipeline">
          <SectionHeader title="Pipeline Integration" subtitle="Layer 1 Category Intelligence — CDT → Clustering → Elasticity → Allocation → Assortment" />

          <AnalysisCard title="Data Flow" badge="5-stage pipeline">
            <div className="grid grid-cols-5 gap-3">
              {[
                {s:"1",l:"CDT Analysis",d:"Consumer Decision Tree → 5 breakfast subcategories (Cold Cereal, Hot Cereal, Pancake, Syrup, Bars)",f:"BatF Dataset",active:false},
                {s:"2",l:"Store Clustering",d:"KMeans/GMM on Complete Journey → 4 clusters (Urban, Suburban, Premium, Rural) — 760 stores",f:"Complete Journey",active:false},
                {s:"3",l:"Space Elasticity",d:"Log-log regression → 5x5 elasticity matrix per cluster with R² > 0.85",f:"Layer 1",active:false},
                {s:"→",l:"Space Allocation",d:"MILP + ADMM → optimal feet per subcategory per cluster under shared fixture budget",f:"THIS APP",active:true},
                {s:"5",l:"Assortment Opt",d:"MNL choice model → SKU selection within space budgets from this optimizer",f:"Layer 2",active:false},
              ].map((s,i)=>(
                <Card key={i} className={`shadow-sm ${s.active ? "border-teal-400 bg-teal-50/30" : "border-slate-200"}`}>
                  <CardContent className="pt-4">
                    <div className={`text-lg font-extrabold font-mono mb-1 ${s.active ? "text-teal-600" : "text-slate-400"}`}>{s.s}</div>
                    <div className={`text-sm font-semibold mb-2 ${s.active ? "text-teal-700" : "text-slate-700"}`}>{s.l}</div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.d}</p>
                    <Badge variant="outline" className={`text-xs ${s.active ? "bg-teal-50 text-teal-700 border-teal-200" : "text-slate-500 border-slate-200"}`}>{s.f}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnalysisCard>

          <div className="mt-6" />

          <AnalysisCard title="Input: 5x5 Elasticity Matrix" badge="from Space Elasticity">
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sales / Space</TableHead>
                    {SUBCATEGORIES.map(sc=><TableHead key={sc.id} className="text-xs font-medium uppercase tracking-wider text-center" style={{color:sc.color}}>{sc.name.split("/")[0]}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SUBCATEGORIES.map((sc,i)=>(
                    <TableRow key={sc.id}>
                      <TCell className="font-semibold text-sm" style={{color:sc.color}}>{sc.name}</TCell>
                      {ELAST[i].map((v,j)=>(
                        <TCell key={j} className={`text-center font-mono font-semibold ${i===j?"":""}${v>0.02?"text-green-600":v<-0.02?"text-red-500":"text-slate-400"}`}
                          style={i===j?{background:`${sc.color}15`,color:"#0891b2"}:undefined}>
                          {v>0?"+":""}{v.toFixed(2)}
                        </TCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-slate-400 mt-3 italic">Diagonal = own-elasticity (0.31-0.42). Complementary: Pancake/Syrup (+0.07/+0.08). Substitutes: Cold/Hot Cereal (-0.08/-0.06).</p>
          </AnalysisCard>

          <div className="mt-6" />

          <AnalysisCard title="Input: Store Clusters" badge="from Store Clustering">
            {STORE_CLUSTERS.map(c=>(
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{background:c.color}} />
                  <span className="font-mono font-semibold text-sm" style={{color:c.color}}>{c.id}</span>
                  <span className="text-sm text-slate-700">{c.name}</span>
                  <Badge variant="outline" className="text-xs" style={{color:c.color,borderColor:`${c.color}60`}}>{c.dominantMission.split("/")[0].trim()}</Badge>
                </div>
                <div className="flex gap-5 font-mono text-xs text-slate-500">
                  <span>{c.storeCount} stores</span>
                  <span>{totFt(BASE_SPACE[c.id])}ft shelf</span>
                  <span>{c.avgWeeklyBaskets.toLocaleString()} bskt/wk</span>
                </div>
              </div>
            ))}
          </AnalysisCard>

          <div className="mt-6" />

          <AnalysisCard title="Optimization Formulation" badge="MILP">
            <div className="bg-slate-900 text-slate-100 rounded-lg p-5 font-mono text-sm leading-relaxed overflow-x-auto">
              <span className="text-purple-400">max</span> &Sigma;<sub>c&isin;C1..C4</sub> n<sub>stores,c</sub> &times; &Sigma;<sub>i=1..5</sub> Sales<sub>i</sub>(s&#8321;,...,s&#8325; | &beta;<sub>c</sub>)<br/><br/>
              <span className="text-purple-400">s.t.</span><br/>
              {"  "}<span className="text-amber-400">C1:</span> &Sigma;&#7522; s&#7522; = TotalSpace<sub>c</sub> <span className="text-slate-500 italic">// per-store</span><br/>
              {"  "}<span className="text-amber-400">C2:</span> s&#7522; &ge; {MIN_SP}ft &forall;i <span className="text-slate-500 italic">// min facing</span><br/>
              {"  "}<span className="text-amber-400">C3:</span> Sales linearized via <span className="text-cyan-400">SOS2 + McCormick</span>
            </div>
          </AnalysisCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: Explorer                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="explore">
          {/* Store Cluster Filter */}
          <div className="mb-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Store Cluster</p>
            <div className="flex gap-2 flex-wrap">
              {STORE_CLUSTERS.map((c, i) => (
                <button key={c.id} onClick={() => switchCl(i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${selCl === i ? "bg-teal-100 text-slate-900 border-teal-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.id}: {c.name} ({c.storeCount} stores)
                </button>
              ))}
            </div>
          </div>

          <SectionHeader title={`${cl.id}: ${cl.name} — 52-Week Space Experiment Data`} subtitle="Explore historical allocation and sales patterns" />

          <div className="grid grid-cols-5 gap-3 mb-6">
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={String(cl.storeCount)} label="Stores" color={cl.color} />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={cl.dominantMission.split("/")[0].trim()} label="Mission" color={cl.color} />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={(cl.avgWeeklyBaskets/1000).toFixed(1)+"K"} label="Wkly Baskets" color={cl.color} />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={cl.avgHHIncome} label="Income" color={cl.color} />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={String(stot)} label="Total Shelf" unit="ft" color={cl.color} />
            </CardContent></Card>
          </div>

          <AnalysisCard title="Current Allocation (pre-optimization)" badge={`${stot}ft total`}>
            <div className="flex gap-0.5 h-7 rounded-lg overflow-hidden">
              {SUBCATEGORIES.map((sc,i)=>{const pct=(BASE_SPACE[cid][i]/stot*100);return(
                <div key={sc.id} className="flex items-center justify-center text-xs font-bold font-mono"
                  style={{ width:`${pct}%`, background:sc.color, color:"#000" }}>
                  {sc.name.split(" ")[0]} {BASE_SPACE[cid][i]}ft
                </div>
              );})}
            </div>
          </AnalysisCard>

          <div className="mt-6" />

          <AnalysisCard title="Weekly Sales (52 weeks, stacked)" badge="time series">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weekly.map((d: any)=>({week:d.week,...Object.fromEntries(SUBCATEGORIES.map((sc,i)=>[sc.key,d.sales[i]]))}))}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                <XAxis dataKey="week" tick={axisTick} axisLine={false}/>
                <YAxis tick={axisTick} axisLine={false} tickFormatter={(v: number)=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={tooltipStyle}/>
                {SUBCATEGORIES.map(sc=>(<Area key={sc.key} type="monotone" dataKey={sc.key} name={sc.name} stroke={sc.color} fill={`${sc.color}30`} stackId="1"/>))}
                <Legend wrapperStyle={{fontSize:11}}/>
              </AreaChart>
            </ResponsiveContainer>
          </AnalysisCard>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {SUBCATEGORIES.slice(0,3).map((sc,i)=>(
              <AnalysisCard key={sc.id} title={`${sc.name}: Space to Sales`}>
                <ResponsiveContainer width="100%" height={150}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                    <XAxis dataKey="x" tick={axisTick} axisLine={false}/>
                    <YAxis dataKey="y" tick={axisTick} axisLine={false}/>
                    <Tooltip contentStyle={tooltipStyle}/>
                    <Scatter data={weekly.map((d: any)=>({x:d.spaces[i],y:d.sales[i]}))} fill={sc.color} fillOpacity={.5} r={2.5}/>
                  </ScatterChart>
                </ResponsiveContainer>
              </AnalysisCard>
            ))}
          </div>

          <div className="mt-6" />

          <AnalysisCard title="Descriptive Statistics" badge="52 weeks">
            <div className="grid grid-cols-5 gap-3">
              {SUBCATEGORIES.map((sc,i)=>{
                const v=weekly.map((d: any)=>d.sales[i]),mu=v.reduce((a: number,b: number)=>a+b,0)/v.length,sd=Math.sqrt(v.reduce((s: number,x: number)=>s+(x-mu)**2,0)/v.length),cv=sd/mu*100;
                return(
                  <Card key={sc.id} className="shadow-sm" style={{borderTop:`3px solid ${sc.color}`}}>
                    <CardContent className="pt-3">
                      <div className="font-mono font-semibold text-sm mb-2" style={{color:sc.color}}>{sc.name.split(" ")[0]}</div>
                      <div className="text-xs text-slate-500">&mu;: <span className="text-slate-700 font-semibold">${Math.round(mu).toLocaleString()}</span></div>
                      <div className="text-xs text-slate-500">&sigma;: <span className="text-slate-700 font-semibold">${Math.round(sd).toLocaleString()}</span></div>
                      <div className="text-xs text-slate-500">CV: <span className={`font-semibold ${cv>20?"text-red-500":"text-green-600"}`}>{cv.toFixed(1)}%</span></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AnalysisCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: MILP Formulation                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="formulation">
          {/* Store Cluster Filter */}
          <div className="mb-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Store Cluster</p>
            <div className="flex gap-2 flex-wrap">
              {STORE_CLUSTERS.map((c, i) => (
                <button key={c.id} onClick={() => switchCl(i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${selCl === i ? "bg-teal-100 text-slate-900 border-teal-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.id}: {c.name} ({c.storeCount} stores)
                </button>
              ))}
            </div>
          </div>

          <SectionHeader title="MILP Formulation" subtitle="Piecewise Linear + McCormick envelopes for mixed-integer linearization" />

          <AnalysisCard title="Formulation" badge="MILP">
            <div className="bg-slate-900 text-slate-100 rounded-lg p-5 font-mono text-sm leading-relaxed overflow-x-auto">
              <span className="text-slate-500 italic">{"// Original NLP (nonlinear)"}</span><br/>
              <span className="text-purple-400">max</span> &Sigma;&#7522; &alpha;&#7522; &times; &prod;&#11388; s&#11388;^(e&#7522;&#11388;&middot;m&#7522;)<br/><br/>
              <span className="text-slate-500 italic">{"// Step 1: Log → separable"}</span><br/>
              log(Sales&#7522;) = log(&alpha;&#7522;) + &Sigma;&#11388; e&#7522;&#11388;&middot;m&#7522;&middot;log(s&#11388;)<br/><br/>
              <span className="text-slate-500 italic">{"// Step 2: Piecewise linear via SOS2"}</span><br/>
              <span className="text-amber-400">SOS2:</span> at most 2 adjacent &lambda;&#11388; nonzero<br/><br/>
              <span className="text-slate-500 italic">{"// Step 3: McCormick envelopes for cross-terms"}</span><br/>
              w &ge; L&#7522;&middot;s&#11388; + s&#7522;&middot;L&#11388; &minus; L&#7522;&middot;L&#11388;<br/>
              w &le; U&#7522;&middot;s&#11388; + s&#7522;&middot;L&#11388; &minus; U&#7522;&middot;L&#11388;
            </div>
          </AnalysisCard>

          <div className="mt-6" />

          <AnalysisCard title="Piecewise Linear Approximation — Cold Cereal" badge="SOS2" insight="Yellow dashed = piecewise approximation closely tracks the blue power function">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={(()=>{
                const d: any[]=[];
                for(let s=MIN_SP;s<=stot-(N-1)*MIN_SP;s+=.5){
                  const sp=[...BASE_SPACE[cid]];sp[0]=s;const act=calcS(0,sp,cid);
                  const bps: number[]=[];for(let b=MIN_SP;b<=stot-(N-1)*MIN_SP;b+=3)bps.push(b);
                  const vals=bps.map(b=>{const t=[...sp];t[0]=b;return calcS(0,t,cid);});
                  let lin=vals[vals.length-1];
                  for(let k=0;k<bps.length-1;k++){if(s>=bps[k]&&s<=bps[k+1]){const t=(s-bps[k])/(bps[k+1]-bps[k]);lin=vals[k]+t*(vals[k+1]-vals[k]);break;}}
                  d.push({space:s,actual:Math.round(act),linear:Math.round(lin)});
                }return d;
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                <XAxis dataKey="space" tick={axisTick} axisLine={false}/>
                <YAxis tick={axisTick} axisLine={false} tickFormatter={(v: number)=>`${(v/1000).toFixed(1)}k`}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Line type="monotone" dataKey="actual" name="Power Function" stroke="#22d3ee" dot={false} strokeWidth={2}/>
                <Line type="linear" dataKey="linear" name="Piecewise (SOS2)" stroke="#facc15" dot={false} strokeWidth={1.5} strokeDasharray="4 4"/>
                <Legend wrapperStyle={{fontSize:11}}/>
              </ComposedChart>
            </ResponsiveContainer>
          </AnalysisCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: Per-Store Optimization                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="optimize">
          {/* Store Cluster Filter */}
          <div className="mb-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Store Cluster</p>
            <div className="flex gap-2 flex-wrap">
              {STORE_CLUSTERS.map((c, i) => (
                <button key={c.id} onClick={() => switchCl(i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${selCl === i ? "bg-teal-100 text-slate-900 border-teal-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.id}: {c.name} ({c.storeCount} stores)
                </button>
              ))}
            </div>
          </div>

          <SectionHeader title={`${cl.id}: ${cl.name} — Per-Store Optimization`} subtitle="Interactive space allocation with real-time sales feedback" />

          <div className="grid grid-cols-4 gap-3 mb-6">
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={`$${Math.round(bSales).toLocaleString()}`} label="Baseline" unit="/wk" color="#64748b" />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={`$${Math.round(oSales).toLocaleString()}`} label="Optimal" unit="/wk" color="#0891b2" delta={uplift} />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={`$${Math.round(mSales).toLocaleString()}`} label="Your Scenario" unit="/wk" color="#f472b6" delta={((mSales-bSales)/bSales*100)} />
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <Metric value={`+$${Math.round(oSales-bSales).toLocaleString()}`} label="Uplift" unit="/wk" color="#34d399" />
            </CardContent></Card>
          </div>

          <AnalysisCard title={`Interactive Allocator (${stot}ft total)`} badge="drag sliders">
            <div className="grid grid-cols-5 gap-3">
              {SUBCATEGORIES.map((sc,i)=>(
                <Card key={sc.id} className="shadow-sm" style={{ borderTop: `3px solid ${sc.color}` }}>
                  <CardContent className="pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 uppercase font-mono">{sc.name.split(" ")[0]}</span>
                      <span className="text-lg font-bold font-mono" style={{ color: sc.color }}>{manual[i]}<span className="text-xs text-slate-400">ft</span></span>
                    </div>
                    {i < N-1 ? (
                      <input type="range" min={MIN_SP} max={stot-(N-1)*MIN_SP} value={manual[i]} onChange={e=>handleSlider(i,+e.target.value)} className="w-full" style={{ accentColor: sc.color }} />
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-1">= residual</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1 font-mono">Optimal: <span style={{ color: sc.color }} className="font-semibold">{cr.optimal.alloc[i]}ft</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnalysisCard>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <AnalysisCard title="Space Allocation (ft)" badge="comparison">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SUBCATEGORIES.map((sc,i)=>({name:sc.name.split(" ")[0],baseline:BASE_SPACE[cid][i],optimal:cr.optimal.alloc[i],manual:manual[i]}))} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                  <XAxis dataKey="name" tick={axisTick} axisLine={false}/>
                  <YAxis tick={axisTick} axisLine={false}/>
                  <Tooltip contentStyle={tooltipStyle}/>
                  <Bar dataKey="baseline" name="Baseline" fill="#475569" radius={[3,3,0,0]}/>
                  <Bar dataKey="optimal" name="Optimal" fill="#0891b2" radius={[3,3,0,0]}/>
                  <Bar dataKey="manual" name="Yours" fill="#f472b6" radius={[3,3,0,0]}/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                </BarChart>
              </ResponsiveContainer>
            </AnalysisCard>
            <AnalysisCard title="Sales by Subcategory ($)" badge="baseline vs optimal">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SUBCATEGORIES.map((sc,i)=>({name:sc.name.split(" ")[0],baseline:Math.round(calcS(i,BASE_SPACE[cid],cid)),optimal:Math.round(calcS(i,cr.optimal.alloc,cid))}))} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                  <XAxis dataKey="name" tick={axisTick} axisLine={false}/>
                  <YAxis tick={axisTick} axisLine={false} tickFormatter={(v: number)=>`${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={tooltipStyle}/>
                  <Bar dataKey="baseline" name="Baseline" fill="#475569" radius={[3,3,0,0]}/>
                  <Bar dataKey="optimal" name="Optimal" fill="#0891b2" radius={[3,3,0,0]}/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                </BarChart>
              </ResponsiveContainer>
            </AnalysisCard>
          </div>

          <div className="mt-6" />

          <AnalysisCard title="Marginal Sales at Optimum ($/ft)" badge="KKT" insight="KKT condition: marginal returns equalize across active subcategories at optimality">
            <div className="grid grid-cols-5 gap-3">
              {SUBCATEGORIES.map((sc,i)=>{
                const mg=+margS(i,cr.optimal.alloc,cid).toFixed(1);
                return(
                  <Card key={sc.id} className="shadow-sm text-center" style={{borderTop:`3px solid ${sc.color}`}}>
                    <CardContent className="pt-3">
                      <div className="text-xs text-slate-500 uppercase font-mono mb-2">{sc.name.split(" ")[0]}</div>
                      <div className="text-2xl font-extrabold font-mono" style={{color:mg>=0?sc.color:"#ef4444"}}>{mg>=0?"+":""}{mg}</div>
                      <div className="text-xs text-slate-400 mt-1">$/ft at optimum</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AnalysisCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: Multi-Store ADMM                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="admm">
          <SectionHeader title="Multi-Store ADMM" subtitle="Fleet-Wide Optimization — decompose into per-cluster subproblems + consensus" />

          <AnalysisCard title="ADMM Pseudocode" badge="distributed optimization">
            <div className="bg-slate-900 text-slate-100 rounded-lg p-5 font-mono text-sm leading-relaxed overflow-x-auto">
              <span className="text-slate-500 italic">{"// Decompose into per-cluster subproblems + consensus"}</span><br/>
              <span className="text-purple-400">repeat</span>:<br/>
              {"  "}<span className="text-cyan-400">x-update:</span> each cluster min(-sales + &rho;/2&middot;||x&minus;z+u||&sup2;)<br/>
              {"  "}<span className="text-cyan-400">z-update:</span> consensus avg<br/>
              {"  "}<span className="text-cyan-400">u-update:</span> dual ascent u &larr; u + (x &minus; z)
            </div>
          </AnalysisCard>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="shadow-sm"><CardContent className="pt-4">
              <label className="text-xs font-mono text-slate-500 uppercase mb-2 block">Penalty &rho;</label>
              <input type="range" min={.1} max={2} step={.1} value={admmRho} onChange={e=>setAdmmRho(+e.target.value)} className="w-full accent-pink-500" />
              <div className="text-lg font-bold text-pink-600 text-center font-mono mt-1">{admmRho.toFixed(1)}</div>
            </CardContent></Card>
            <Card className="shadow-sm"><CardContent className="pt-4">
              <label className="text-xs font-mono text-slate-500 uppercase mb-2 block">Max Iterations</label>
              <input type="range" min={10} max={80} step={5} value={admmIt} onChange={e=>setAdmmIt(+e.target.value)} className="w-full accent-pink-500" />
              <div className="text-lg font-bold text-pink-600 text-center font-mono mt-1">{admmIt}</div>
            </CardContent></Card>
            <Card className="shadow-sm flex items-center justify-center"><CardContent className="pt-4">
              <button onClick={runADMM} disabled={admmRun} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-teal-500 text-white font-bold text-sm disabled:opacity-50">
                {admmRun ? "SOLVING..." : "\u25B6 RUN ADMM"}
              </button>
            </CardContent></Card>
          </div>

          {admmRes && (<>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <AnalysisCard title="Primal Residual" badge="convergence">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={admmRes.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                    <XAxis dataKey="iter" tick={axisTick} axisLine={false}/>
                    <YAxis tick={axisTick} axisLine={false}/>
                    <Tooltip contentStyle={tooltipStyle}/>
                    <Line type="monotone" dataKey="primalResidual" name="||x-z||" stroke="#f472b6" strokeWidth={2} dot={false}/>
                    <ReferenceLine y={.5} stroke="#34d399" strokeDasharray="4 4"/>
                  </LineChart>
                </ResponsiveContainer>
              </AnalysisCard>
              <AnalysisCard title="Network Sales (760 stores)" badge="fleet $/wk">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={admmRes.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke}/>
                    <XAxis dataKey="iter" tick={axisTick} axisLine={false}/>
                    <YAxis tick={axisTick} axisLine={false} domain={["auto","auto"]} tickFormatter={(v: number)=>`${(v/1e6).toFixed(1)}M`}/>
                    <Tooltip contentStyle={tooltipStyle}/>
                    <Line type="monotone" dataKey="networkSales" name="Fleet $/wk" stroke="#0891b2" strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </AnalysisCard>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">ADMM vs Local Optima</h3>
              <div className="grid grid-cols-4 gap-3">
                {STORE_CLUSTERS.map((c,ci)=>{
                  const aa=admmRes.finalAllocations[ci],lo=singles[ci].optimal;
                  return(
                    <Card key={c.id} className="shadow-sm" style={{borderLeft:`4px solid ${c.color}`}}>
                      <CardContent className="pt-4">
                        <div className="text-sm font-bold mb-3" style={{color:c.color}}>{c.id}: {c.name}</div>
                        <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sub</TableHead>
                                <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center">Local</TableHead>
                                <TableHead className="text-xs font-medium text-pink-400 uppercase tracking-wider text-center">ADMM</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {SUBCATEGORIES.map((sc,j)=>(
                                <TableRow key={sc.id}>
                                  <TCell className="text-xs" style={{color:sc.color}}>{sc.name.split(" ")[0]}</TCell>
                                  <TCell className="text-center text-xs font-mono">{lo.alloc[j]}</TCell>
                                  <TCell className="text-center text-xs font-mono font-semibold text-pink-600">{aa[j]}</TCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>)}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: Shadow Prices                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="shadow">
          {/* Store Cluster Filter */}
          <div className="mb-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Store Cluster</p>
            <div className="flex gap-2 flex-wrap">
              {STORE_CLUSTERS.map((c, i) => (
                <button key={c.id} onClick={() => switchCl(i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border flex items-center gap-2 ${selCl === i ? "bg-teal-100 text-slate-900 border-teal-300" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.id}: {c.name} ({c.storeCount} stores)
                </button>
              ))}
            </div>
          </div>

          <SectionHeader title="Shadow Prices" subtitle="Lagrangian multipliers — marginal value of 1 extra foot of shelf space" />

          <AnalysisCard title="Interpretation" badge="Lagrangian">
            <p className="text-sm text-slate-600 leading-relaxed">
              Shadow price <span className="text-amber-600 font-bold">&lambda;</span> = marginal value of 1 extra foot. If &lambda; &times; 52wk &gt; shelf install cost &rarr; invest.
            </p>
          </AnalysisCard>

          <div className="grid grid-cols-4 gap-3 mt-6">
            {singles.map((r,i)=>{
              const c=STORE_CLUSTERS[i];
              return(
                <Card key={c.id} className="shadow-sm" style={{borderTop:`3px solid ${c.color}`}}>
                  <CardContent className="pt-4">
                    <div className="text-sm font-bold mb-3" style={{color:c.color}}>{c.id}: {c.name}</div>
                    <Card className="shadow-none bg-amber-50 border-amber-200 mb-4">
                      <CardContent className="pt-3 text-center">
                        <div className="text-xs text-slate-500 font-mono">&lambda; (Total Space)</div>
                        <div className="text-2xl font-extrabold text-amber-600 font-mono">+${r.shadowTotal.toFixed(0)}</div>
                        <div className="text-xs text-slate-500">per ft/week</div>
                        <div className="text-xs text-green-600">Annual: +${Math.round(r.shadowTotal*52).toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    <div className="text-xs text-slate-500 uppercase font-mono mb-2">Constraints</div>
                    {r.bindings.map(b=>(
                      <div key={b.name} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                        <span style={{color:SUBCATEGORIES.find(s=>s.name===b.name)?.color}}>{b.name.split(" ")[0]}</span>
                        <span className={`font-semibold font-mono ${b.isBinding?"text-red-500":"text-green-600"}`}>
                          {b.isBinding?`BIND @${b.allocFeet}ft`:`+${b.allocFeet-MIN_SP}ft slack`}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6" />

          <AnalysisCard title="Investment Priority" badge="lambda x stores x 52wk">
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cluster</TableHead>
                    <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center">Stores</TableHead>
                    <TableHead className="text-xs font-medium text-amber-500 uppercase tracking-wider text-center">&lambda; $/ft/wk</TableHead>
                    <TableHead className="text-xs font-medium text-amber-500 uppercase tracking-wider text-center">Annual Value</TableHead>
                    <TableHead className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...singles].sort((a,b)=>b.shadowTotal*STORE_CLUSTERS[singles.indexOf(b)].storeCount-a.shadowTotal*STORE_CLUSTERS[singles.indexOf(a)].storeCount).map((r,rank)=>{
                    const ci=singles.indexOf(r),c=STORE_CLUSTERS[ci],av=r.shadowTotal*c.storeCount*52;
                    return(
                      <TableRow key={c.id}>
                        <TCell className="font-semibold" style={{color:c.color}}>{c.id}: {c.name}</TCell>
                        <TCell className="text-center font-mono">{c.storeCount}</TCell>
                        <TCell className="text-center font-mono text-amber-600">+${r.shadowTotal.toFixed(0)}</TCell>
                        <TCell className="text-center font-mono font-bold text-teal-600">+${Math.round(av).toLocaleString()}</TCell>
                        <TCell className="text-center">
                          <Badge variant="outline" className={`text-xs ${rank===0?"bg-green-50 text-green-700 border-green-200":rank===1?"bg-amber-50 text-amber-700 border-amber-200":"text-slate-500 border-slate-200"}`}>
                            {rank===0?"HIGH":rank===1?"MED":"LOW"}
                          </Badge>
                        </TCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </AnalysisCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: Results                                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="results">
          <SectionHeader title="Final Recommendations" subtitle="All Clusters — fleet-wide optimization results" />

          <div className="grid grid-cols-4 gap-3 mb-6">
            {(()=>{
              const tb=STORE_CLUSTERS.reduce((s,c)=>s+c.storeCount*totS(BASE_SPACE[c.id],c.id),0);
              const to=singles.reduce((s,r,i)=>s+STORE_CLUSTERS[i].storeCount*r.optimal.sales,0);
              return [
                {label:"Fleet Baseline",value:`$${(tb/1e6).toFixed(2)}M`,unit:"/wk",color:"#64748b"},
                {label:"Fleet Optimal",value:`$${(to/1e6).toFixed(2)}M`,unit:"/wk",color:"#0891b2",delta:((to-tb)/tb*100)},
                {label:"Weekly Uplift",value:`+$${Math.round(to-tb).toLocaleString()}`,color:"#34d399"},
                {label:"Annual Uplift",value:`+$${((to-tb)*52/1e6).toFixed(1)}M`,color:"#34d399"},
              ];
            })().map((m,i)=>(
              <Card key={i} className="shadow-sm"><CardContent className="pt-4">
                <Metric value={m.value} label={m.label} unit={m.unit} color={m.color} delta={m.delta} />
              </CardContent></Card>
            ))}
          </div>

          {singles.map((r,i)=>{
            const c=STORE_CLUSTERS[i],ci=c.id,bs=totS(BASE_SPACE[ci],ci),os=r.optimal.sales,up=((os-bs)/bs*100);
            return(
              <Card key={ci} className="shadow-sm mb-4" style={{ borderLeft: `4px solid ${c.color}` }}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-base font-bold" style={{ color: c.color }}>{c.id}: {c.name}</span>
                      <span className="text-sm text-slate-500 ml-3">{c.storeCount} stores &times; {totFt(BASE_SPACE[ci])}ft</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">+{up.toFixed(1)}%</Badge>
                      <Badge variant="outline" style={{ color: c.color, borderColor: c.color }}>{c.dominantMission.split("/")[0].trim()}</Badge>
                    </div>
                  </div>

                  {["BASELINE","OPTIMAL"].map((lb,li)=>{
                    const al=li===0?BASE_SPACE[ci]:r.optimal.alloc,tot=totFt(al);
                    return(
                      <div key={lb} className="mb-1.5">
                        <div className={`text-xs font-mono mb-0.5 ${li===0?"text-slate-400":"text-teal-600 font-semibold"}`}>{lb}{li===1?" \u2713":""}</div>
                        <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
                          {SUBCATEGORIES.map((sc,j)=>(
                            <div key={sc.id} className="flex items-center justify-center text-xs font-bold font-mono"
                              style={{ width:`${(al[j]/tot*100)}%`, background:li===0?`${sc.color}60`:sc.color, color:li===0?sc.color:"#000" }}>
                              {al[j]}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono">Baseline</div>
                      <div className="text-slate-700">${Math.round(bs).toLocaleString()}/wk</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono">Optimal</div>
                      <div className="text-teal-600 font-semibold">${Math.round(os).toLocaleString()}/wk</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono">Shadow &lambda;</div>
                      <div className="text-amber-600">+${r.shadowTotal.toFixed(0)}/ft/wk</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono">Fleet Impact</div>
                      <div className="text-green-600">+${Math.round((os-bs)*c.storeCount).toLocaleString()}/wk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="shadow-sm border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50/30 to-purple-50/10">
            <CardContent className="pt-4">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Key Output &rarr; Assortment Optimization (Layer 2)</h3>
              <div className="text-sm leading-relaxed">
                {singles.map((r,i)=>{
                  const c=STORE_CLUSTERS[i];
                  return(
                    <div key={c.id} className="mb-1.5">
                      <span className="font-semibold font-mono" style={{color:c.color}}>{c.id}:</span>{" "}
                      {SUBCATEGORIES.map((sc,j)=>(
                        <span key={sc.id}>
                          <span style={{color:sc.color}}>{sc.name.split(" ")[0]}</span> {r.optimal.alloc[j]}ft{j<N-1?" \u00b7 ":""}
                        </span>
                      ))}
                    </div>
                  );
                })}
                <p className="text-xs text-slate-400 italic mt-3">These per-cluster space budgets become the constraints for MNL-based SKU selection in Layer 2.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
