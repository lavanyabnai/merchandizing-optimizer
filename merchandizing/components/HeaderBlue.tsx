"use client";

import Image from "next/image";
import Link from "next/link";

import { MobileSidebar } from "@/components/mobile-sidebar";
// import { GlobalSearch } from "@/components/global-search";


import {
  // TreePine,
  Store,
  TrendingUp,
  LayoutGrid,
  BrainCircuit,
  Box,
  Dices,
  Columns3,
  PanelTop,
  Activity,
  RefreshCcw,
} from "lucide-react"

import { MegaDropdownCategories } from "@/components/mega-dropdown-categories";


export const HeaderBlue = () => {
 
  const categories = [
    {
      category: "Category Intelligence",
      items: [
        {
          name: "Consumer Decision Tree",
          description: "Consumer Decision Tree analysis",
          shortDescription: "CDT Dashboard",
          to: "/merchandizing-optimizer",
          icon: Activity,
          highlight: true,
          iconBackground: "bg-teal-100",
          iconForeground: "text-teal-700",
        },
        {
          name: "Store Clustering",
          description: "Group stores by similarity",
          shortDescription: "Store Grouping",
          to: "/merchandizing-optimizer/store-clustering-engine",
          icon: Store,
          highlight: true,
          iconBackground: "bg-violet-100",
          iconForeground: "text-violet-700",
        },
        {
          name: "Space Elasticity Estimation",
          description: "Estimate space-to-sales relationships",
          shortDescription: "Elasticity Analysis",
          to: "/merchandizing-optimizer/space-elasticity",
          icon: TrendingUp,
          highlight: true,
          iconBackground: "bg-cyan-100",
          iconForeground: "text-cyan-700",
        },
        {
          name: "Space Allocation Optimizer",
          description: "MILP + ADMM optimizer — per-store & fleet-wide space allocation with shadow prices",
          shortDescription: "Space Optimization",
          to: "/merchandizing-optimizer/space-allocation-optimizer",
          icon: LayoutGrid,
          highlight: true,
          iconBackground: "bg-amber-100",
          iconForeground: "text-amber-700",
        },
      ],
    },
    {
      category: "Assortment Optimization",
      items: [
        {
          name: "MNL Demand Model",
          description: "Choice probabilities at SKU level. Substitution matrix captures what happens when a SKU is delisted.",
          shortDescription: "Utility Scores, Choice Shares",
          to: "/merchandizing-optimizer/mnl-demand-model",
          icon: BrainCircuit,
          highlight: true,
          iconBackground: "bg-blue-100",
          iconForeground: "text-blue-700",
        },
        {
          name: "SKU Optimizer",
          description: "Greedy or MILP selects SKUs + facings subject to constraints (must-carry, brand limits, price tiers).",
          shortDescription: "Assortment + Facing Plan",
          to: "/merchandizing-optimizer/sku-optimizer",
          icon: Box,
          highlight: true,
          iconBackground: "bg-orange-100",
          iconForeground: "text-orange-700",
        },
        {
          name: "Monte Carlo Simulation",
          description: "5,000 trials. Stress-test against demand/elasticity/walk-rate uncertainty. Builds stakeholder confidence.",
          shortDescription: "Confidence Intervals, P5|P95",
          to: "/merchandizing-optimizer/monte-carlo-simulation",
          icon: Dices,
          highlight: true,
          iconBackground: "bg-indigo-100",
          iconForeground: "text-indigo-700",
        },
        {
          name: "Solver Approaches",
          description: "Column generation, Benders decomposition, and hierarchical multi-level optimization for large-scale assortments.",
          shortDescription: "Advanced Solvers",
          to: "/merchandizing-optimizer/solver-approaches",
          icon: Columns3,
          highlight: true,
          iconBackground: "bg-pink-100",
          iconForeground: "text-pink-700",
        },
      ],
    },
    {
      category: "Execution",
      items: [
        {
          name: "Planogram Generation",
          description: "Physical shelf layout. Eye-level placement, brand blocking, fixture constraints. Packing heuristics.",
          shortDescription: "Shelf Layout",
          // to: "/merchandizing-optimizer/planogram",
          external: true,
          href: "https://retailos-app.vercel.app/",
          icon: PanelTop,
          highlight: true,
          iconBackground: "bg-rose-100",
          iconForeground: "text-rose-700",
        },
        {
          name: "Performance Dashboard",
          description: "Predicted vs actual lift tracking. Weekly trends. Alerts when reality deviates from plan.",
          shortDescription: "Tracking & Alerts",
          to: "/merchandizing-optimizer/dashboard",
          icon: Activity,
          highlight: true,
          iconBackground: "bg-sky-100",
          iconForeground: "text-sky-700",
        },
        {
          name: "Feedback Loop",
          description: "Actuals feed back to re-estimate elasticities and recalibrate MNL. Closes the learning cycle.",
          shortDescription: "Continuous Learning",
          to: "/merchandizing-optimizer/dashboard",
          icon: RefreshCcw,
          highlight: true,
          iconBackground: "bg-lime-100",
          iconForeground: "text-lime-700",
        },
      ],
    },
  ]
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
    <nav className="py-2 px-6 flex items-center justify-between bg-blue-900">
      <div className="flex items-center gap-x-2">
        <MobileSidebar />
       <Link href="/" className="flex items-center gap-2">
       <Image className="block lg:hidden" src="/assets/logo.png" alt="logo" width={60} height={60} />
        <Image className="hidden lg:block" src="/assets/logo.png" alt="logo" width={40} height={40} />
        <Image className="hidden lg:block" src="/assets/white-logo.png" alt="logo" width={180} height={60} />
      </Link>
      
      </div>
      <div className="flex items-center gap-x-4">
     <div className="ml-6 hidden lg:block">
        <h1 className="text-lg font-semibold text-white">Assortment Optimizer</h1>
      </div>
      <MegaDropdownCategories categories={categories} />
      </div>
    </nav>
    </header>
  );
};
