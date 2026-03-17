"use client";

import {
  DocPage,
  DocSection,
  DocSubSection,
  InfoCallout,
  WarningCallout,
  Formula,
} from "./DocPage";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Info,
  AlertTriangle,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "input-data", title: "Input Data Requirements" },
  { id: "model-formulation", title: "Model Formulation" },
  { id: "output-explanation", title: "Output Explanation" },
  { id: "industry-best-practices", title: "Industry Best Practices" },
  { id: "references", title: "References" },
];

export function OptimizationDocs() {
  return (
    <DocPage
      title="Assortment Optimization"
      subtitle="A comprehensive guide to the Mixed-Integer Linear Programming model that powers shelf-space allocation and product assortment decisions. Learn how the optimizer maximizes profit per linear foot while respecting real-world business constraints."
      sections={sections}
    >
      {/* ================================================================== */}
      {/* SECTION 1: Overview */}
      {/* ================================================================== */}
      <DocSection id="overview" title="1. Overview">
        <DocSubSection title="What Is Assortment Optimization?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Assortment optimization is the analytical process of determining
            which products to stock on a retail shelf and how much space to
            allocate to each product in order to maximize a defined objective --
            typically gross profit or revenue per linear foot of shelf space.
            Unlike manual planogram construction, which relies heavily on buyer
            intuition and supplier negotiations, mathematical optimization
            evaluates thousands of possible product-space combinations
            simultaneously, surfacing the single allocation that yields the
            highest return within the retailer&apos;s constraints.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            At its core, the problem is one of <strong>constrained resource allocation</strong>:
            given a fixed amount of shelf space (measured in facings or linear
            inches), a universe of candidate SKUs, and a set of business rules
            (must-carry items, brand diversity requirements, minimum/maximum
            space thresholds), determine the combination of products and facing
            counts that maximizes the objective function.
          </p>
        </DocSubSection>

        <DocSubSection title="Business Value">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Shelf space is the single most expensive and scarce resource in
            physical retail. A typical grocery store carries 30,000-50,000 SKUs,
            yet shelf space grows at less than 1% per year. Every facing
            allocated to an underperforming product represents forgone profit
            from a higher-performing alternative. Industry research consistently
            shows that data-driven assortment optimization delivers:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>3-8% gross profit lift</strong> per category through
              better product selection and space rebalancing
            </li>
            <li>
              <strong>5-15% improvement in sales per linear foot</strong> by
              aligning space allocation with consumer demand signals
            </li>
            <li>
              <strong>10-20% reduction in out-of-stocks</strong> because
              high-velocity SKUs receive proportionally more shelf space
            </li>
            <li>
              <strong>Faster new product onboarding</strong> by quantifying the
              opportunity cost of adding or removing a SKU from the assortment
            </li>
            <li>
              <strong>Stronger supplier negotiations</strong> when space
              allocation decisions are backed by transparent, reproducible
              analytics rather than subjective judgment
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Industry Context">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Assortment optimization is a mature discipline within retail
            analytics, deployed at scale by leading retailers worldwide:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Walmart</strong> uses proprietary optimization models in
              combination with supplier data (via Retail Link) to drive
              category-specific planograms across 4,700+ US stores.
            </li>
            <li>
              <strong>Kroger</strong> leverages 84.51 (its in-house data
              science arm) to build localized assortments informed by loyalty
              card data and household-level demand models.
            </li>
            <li>
              <strong>Tesco</strong> pioneered &quot;range review&quot; processes that
              combine shopper analytics with mathematical optimization
              to rationalize assortments while protecting shopper choice.
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground mt-3">
            Enterprise solutions from <Badge variant="outline">BlueYonder</Badge>{" "}
            <Badge variant="outline">Relex Solutions</Badge>{" "}
            <Badge variant="outline">Oracle Retail</Badge>{" "}
            <Badge variant="outline">Symphony RetailAI</Badge> and{" "}
            <Badge variant="outline">RELEX</Badge> power much of this work at
            scale. This optimizer implements the same foundational MILP approach
            used by these vendors, adapted for interactive, browser-based
            decision support.
          </p>
        </DocSubSection>

        <InfoCallout>
          <strong>Key Insight:</strong> The optimization model in this tool is a
          simplified but mathematically rigorous version of what enterprise
          vendors deploy. The same core formulation (maximize profit subject to
          space and business constraints) underlies all commercial solutions.
          What differs at enterprise scale is data integration, multi-store
          rollout, and planogram-level execution.
        </InfoCallout>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 2: Input Data Requirements */}
      {/* ================================================================== */}
      <DocSection id="input-data" title="2. Input Data Requirements">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The quality of optimization results depends directly on the quality and
          completeness of input data. Below is a comprehensive inventory of each
          data element the model requires, along with example values and a
          rationale for why it matters.
        </p>

        <DocSubSection title="Product Master Data">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Field</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[160px]">Example</TableHead>
                <TableHead>Why It Matters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">SKU</TableCell>
                <TableCell>
                  Unique stock-keeping unit identifier for each product
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">SKU-0012</code>
                </TableCell>
                <TableCell>
                  Primary key linking products to sales, pricing, and space data
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand</TableCell>
                <TableCell>
                  Manufacturer or brand name of the product
                </TableCell>
                <TableCell>Coca-Cola, Pepsi</TableCell>
                <TableCell>
                  Enables brand diversity constraints and brand-level portfolio analysis
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand Tier</TableCell>
                <TableCell>
                  Classification of brand into tier: Premium, National A,
                  National B, or Store Brand
                </TableCell>
                <TableCell>Premium, Store Brand</TableCell>
                <TableCell>
                  Drives brand tier balance constraints (e.g., minimum 20% premium share)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Subcategory</TableCell>
                <TableCell>
                  Product segment within the broader category
                </TableCell>
                <TableCell>Cola, Lemon-Lime, Energy</TableCell>
                <TableCell>
                  Ensures assortment coverage across consumer need states
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cost</TableCell>
                <TableCell>
                  Wholesale cost per unit paid to supplier
                </TableCell>
                <TableCell>$0.85</TableCell>
                <TableCell>
                  Required for profit calculation (profit = revenue - cost x units)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell>Retail shelf price per unit</TableCell>
                <TableCell>$1.99</TableCell>
                <TableCell>
                  Revenue driver; also used in price elasticity calculations
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Store Attributes">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Field</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[160px]">Example</TableHead>
                <TableHead>Why It Matters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Store Format</TableCell>
                <TableCell>
                  Physical store type affecting available space and traffic
                </TableCell>
                <TableCell>Express, Standard, Superstore</TableCell>
                <TableCell>
                  Determines total facing capacity and customer behavior profile
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Facings</TableCell>
                <TableCell>
                  Maximum number of product facings available on the shelf
                </TableCell>
                <TableCell>120</TableCell>
                <TableCell>
                  Hard constraint -- the sum of all SKU facings cannot exceed this value
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Linear Feet</TableCell>
                <TableCell>
                  Total shelf length allocated to the category in the store
                </TableCell>
                <TableCell>24 ft</TableCell>
                <TableCell>
                  Alternative space measurement; can be converted to facings using product widths
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Weekly Traffic</TableCell>
                <TableCell>
                  Average weekly customer visits to the store
                </TableCell>
                <TableCell>12,500</TableCell>
                <TableCell>
                  Scales demand estimates; higher traffic stores have higher base demand
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Sales History">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Field</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[160px]">Example</TableHead>
                <TableHead>Why It Matters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Weekly Units</TableCell>
                <TableCell>
                  Units sold per product per store per week
                </TableCell>
                <TableCell>45 units/week</TableCell>
                <TableCell>
                  Base demand signal; drives the revenue estimate for each SKU
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Revenue</TableCell>
                <TableCell>
                  Dollar revenue per product per store per week
                </TableCell>
                <TableCell>$89.55</TableCell>
                <TableCell>
                  Direct input to the objective function; combined with facings and elasticity
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Current Facings</TableCell>
                <TableCell>
                  Number of product facings during the sales period
                </TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  Baseline for space elasticity calculation; &quot;what was the space when these sales occurred?&quot;
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Elasticity Coefficients">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Coefficient</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Typical Range</TableHead>
                <TableHead>Why It Matters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Space Elasticity</TableCell>
                <TableCell>
                  The percentage change in demand for a 1% change in shelf space
                  (facings). A value of 0.2 means doubling facings increases
                  demand by roughly 15% (2^0.2 = 1.149).
                </TableCell>
                <TableCell>0.1 - 0.3</TableCell>
                <TableCell>
                  Core driver of space allocation -- products with higher space elasticity
                  benefit more from additional facings
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Price Elasticity</TableCell>
                <TableCell>
                  The percentage change in demand for a 1% change in price.
                  Typically negative (price increase reduces demand). A value of
                  -1.5 means a 10% price increase reduces demand by 15%.
                </TableCell>
                <TableCell>-0.5 to -3.0</TableCell>
                <TableCell>
                  Used in simulation scenarios involving price changes; helps quantify
                  revenue impact of pricing decisions
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <WarningCallout>
            <strong>Data Quality Note:</strong> Space and price elasticity
            coefficients are often the hardest data elements to obtain
            accurately. If your organization does not have econometric estimates,
            use industry benchmarks: 0.2 for space elasticity (grocery) and -1.5
            for price elasticity (carbonated beverages). The model is more
            sensitive to the relative ranking of elasticities across products
            than to the absolute values.
          </WarningCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 3: Model Formulation */}
      {/* ================================================================== */}
      <DocSection id="model-formulation" title="3. Model Formulation">
        <p className="text-sm leading-relaxed text-muted-foreground">
          The optimizer uses a <strong>Mixed-Integer Linear Programming (MILP)</strong>{" "}
          formulation. MILP is the gold standard for assortment optimization
          because it guarantees finding the globally optimal solution (unlike
          heuristics or greedy algorithms) while supporting integer-valued
          decision variables (you cannot have 2.7 facings of a product).
        </p>

        <DocSubSection title="Objective Function">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            The objective is to <strong>maximize total weekly profit</strong>{" "}
            across all products in the assortment:
          </p>
          <Formula>
            <div className="space-y-2">
              <div>
                <strong>Maximize:</strong> Z = &Sigma;
                <sub>i&isin;S</sub> [ revenue<sub>i</sub> &times; (f
                <sub>i</sub> / f<sub>i,base</sub>)<sup>&alpha;<sub>i</sub></sup>{" "}
                - cost<sub>i</sub> &times; demand<sub>i</sub> &times; (f
                <sub>i</sub> / f<sub>i,base</sub>)<sup>&alpha;<sub>i</sub></sup>{" "}
                ]
              </div>
              <div className="text-xs text-muted-foreground pt-2">
                Where:
                <br />
                &nbsp;&nbsp;S = set of selected SKUs
                <br />
                &nbsp;&nbsp;f<sub>i</sub> = optimized facings for product i
                (decision variable)
                <br />
                &nbsp;&nbsp;f<sub>i,base</sub> = current/baseline facings for
                product i
                <br />
                &nbsp;&nbsp;&alpha;<sub>i</sub> = space elasticity coefficient
                for product i
                <br />
                &nbsp;&nbsp;revenue<sub>i</sub> = baseline weekly revenue for
                product i
                <br />
                &nbsp;&nbsp;cost<sub>i</sub> = unit cost for product i
                <br />
                &nbsp;&nbsp;demand<sub>i</sub> = baseline weekly demand (units)
                for product i
              </div>
            </div>
          </Formula>
          <p className="text-sm leading-relaxed text-muted-foreground mt-3">
            The space elasticity exponent captures the empirically observed
            relationship between shelf space and sales: giving a product more
            facings increases its visibility and reduces out-of-stock events,
            leading to higher sales -- but with diminishing returns. The
            power-law form (facings ratio raised to &alpha;) is the standard
            functional form in retail science, first established by Curhan
            (1972) and refined by Dreze, Hoch, and Purk (1994).
          </p>
        </DocSubSection>

        <DocSubSection title="Decision Variables">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>f<sub>i</sub></strong> (integer): Number of facings
              allocated to product i. This is the primary decision variable. The
              solver determines the optimal integer value for each product.
            </li>
            <li>
              <strong>y<sub>i</sub></strong> (binary, 0/1): Whether product i is
              included in the assortment. A product with y<sub>i</sub> = 0 gets
              zero facings and is removed from the shelf.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Constraints">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            Each constraint represents a real-world business requirement. Below
            is a detailed explanation of every constraint in the model:
          </p>

          <div className="space-y-4">
            {/* Constraint 1 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>C1</Badge>
                <h4 className="text-sm font-semibold">
                  Total Space Constraint
                </h4>
              </div>
              <Formula>
                &Sigma;<sub>i</sub> f<sub>i</sub> = Total Facings Available
                (e.g., 120)
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Business Rationale:</strong> The shelf has a fixed
                physical capacity. In a standard 4-foot gondola section with 5
                shelves, each shelf holds approximately 24 facings, giving 120
                total facings. This is a hard constraint -- you cannot put more
                products on the shelf than physically fit.
              </p>
            </div>

            {/* Constraint 2 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>C2</Badge>
                <h4 className="text-sm font-semibold">
                  Min/Max Facings per SKU
                </h4>
              </div>
              <Formula>
                min_facings &times; y<sub>i</sub> &le; f<sub>i</sub> &le;
                max_facings &times; y<sub>i</sub>
                <br />
                <span className="text-xs text-muted-foreground">
                  Default: 1 &le; f<sub>i</sub> &le; 6 (when product is
                  selected)
                </span>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Business Rationale:</strong> Every product that is on the
                shelf must have at least 1 facing (otherwise it is invisible to
                shoppers). The maximum of 6 prevents any single SKU from
                dominating the shelf, ensuring variety. The upper bound also
                prevents the optimizer from &quot;over-investing&quot; in a single
                high-margin SKU at the expense of category breadth.
              </p>
            </div>

            {/* Constraint 3 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>C3</Badge>
                <h4 className="text-sm font-semibold">Total SKU Count</h4>
              </div>
              <Formula>
                min_skus &le; &Sigma;<sub>i</sub> y<sub>i</sub> &le; max_skus
                <br />
                <span className="text-xs text-muted-foreground">
                  Default: 10 &le; n &le; 50
                </span>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Business Rationale:</strong> Retailers need a minimum
                number of SKUs to provide shopper choice (too few products
                signal a &quot;bare shelf&quot; perception). The maximum cap prevents
                assortment proliferation, which increases complexity, raises
                out-of-stock risk, and reduces inventory turns. Research by
                Boatwright and Nunes (2001) showed that reducing assortment by
                up to 25% can actually increase sales by reducing choice
                overload.
              </p>
            </div>

            {/* Constraint 4 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>C4</Badge>
                <h4 className="text-sm font-semibold">Must-Carry SKUs</h4>
              </div>
              <Formula>
                y<sub>i</sub> = 1 &nbsp;&nbsp;&nbsp; &forall; i &isin;
                MustCarry set
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Business Rationale:</strong> Certain products must
                remain on the shelf regardless of their profitability. Reasons
                include: (a) contractual obligations with suppliers (e.g.,
                guaranteed placement as part of a trade promotion deal), (b)
                category destination items that drive store traffic (e.g.,
                Coca-Cola Classic in the CSD category), (c) corporate mandate
                items such as private label flagships.
              </p>
            </div>

            {/* Constraint 5 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>C5</Badge>
                <h4 className="text-sm font-semibold">Brand Diversity</h4>
              </div>
              <Formula>
                &Sigma;<sub>i&isin;brand_b</sub> y<sub>i</sub> &le;
                max_skus_per_brand &nbsp;&nbsp;&nbsp; &forall; brand b
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Business Rationale:</strong> Without this constraint,
                the optimizer might fill the shelf with products from a single
                high-margin brand. Brand diversity ensures competitive variety,
                which is critical for shopper satisfaction and prevents supplier
                over-dependence. Most retailers cap any single brand at 25-35%
                of the assortment within a subcategory.
              </p>
            </div>

            {/* Constraint 6 */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>C6</Badge>
                <h4 className="text-sm font-semibold">Brand Tier Balance</h4>
              </div>
              <Formula>
                <div className="space-y-1">
                  <div>
                    &Sigma;<sub>i&isin;Premium</sub> f<sub>i</sub> &ge;
                    min_premium_share &times; &Sigma;<sub>i</sub> f<sub>i</sub>
                  </div>
                  <div>
                    &Sigma;<sub>i&isin;StoreBrand</sub> f<sub>i</sub> &le;
                    max_private_label_share &times; &Sigma;<sub>i</sub> f
                    <sub>i</sub>
                  </div>
                </div>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Business Rationale:</strong> Good-Better-Best tiering is
                a foundational principle in category management. Premium brands
                drive margin and basket value; store brands drive loyalty and
                margin. Without tier balance constraints, the optimizer might
                over-index on store brands (highest unit margin) at the expense
                of the premium tier that drives category perception and shopper
                traffic. Typical targets: 20-30% premium, 15-25% private label,
                with national brands filling the remainder.
              </p>
            </div>
          </div>
        </DocSubSection>

        <DocSubSection title="Solver">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The MILP is solved using a linear programming solver. In production
            environments, solvers such as{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">scipy.optimize.linprog</code>,{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">PuLP</code> (with CBC
            backend), or commercial solvers like{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">Gurobi</code> and{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">CPLEX</code> are used.
            For problems of the size typical in single-store assortment optimization
            (50-200 candidate SKUs, 100-200 facings), CBC solves to optimality in
            under 2 seconds. Larger multi-store problems may require Gurobi or
            CPLEX for acceptable performance.
          </p>
          <InfoCallout>
            <strong>Solver Performance:</strong> The computational complexity of
            MILP is NP-hard in the general case, but modern branch-and-bound
            solvers exploit the problem structure (tight LP relaxations,
            balanced branching) to solve retail assortment problems very
            efficiently. Expect sub-second solve times for single-store
            problems.
          </InfoCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 4: Output Explanation */}
      {/* ================================================================== */}
      <DocSection id="output-explanation" title="4. Output Explanation">
        <DocSubSection title="Product Allocations">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            The primary output is a table showing the optimized facing
            allocation for each product, compared to the current state. Each row
            contains the following fields:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Output Field</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[200px]">How to Interpret</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Current Facings</TableCell>
                <TableCell>
                  The number of facings the product currently has on the shelf
                </TableCell>
                <TableCell>Baseline for comparison</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Optimized Facings</TableCell>
                <TableCell>
                  The recommended number of facings from the optimizer
                </TableCell>
                <TableCell>
                  Action to take -- adjust shelf to this count
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Change</TableCell>
                <TableCell>
                  Difference between optimized and current facings
                </TableCell>
                <TableCell>
                  Positive = add facings; Negative = remove facings; Zero = no change
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Current Profit</TableCell>
                <TableCell>
                  Estimated weekly profit under the current allocation
                </TableCell>
                <TableCell>Baseline profit contribution</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Projected Profit</TableCell>
                <TableCell>
                  Estimated weekly profit under the optimized allocation
                </TableCell>
                <TableCell>
                  Expected profit after implementing the recommendation
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Profit Change</TableCell>
                <TableCell>
                  Dollar difference between projected and current profit
                </TableCell>
                <TableCell>
                  Incremental profit attributable to the reallocation
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Space Allocations by Category">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A summary view showing how total space is redistributed across
            subcategories. This helps category managers understand the
            portfolio-level shifts -- for example, the optimizer might recommend
            growing the Energy subcategory from 15% to 22% of total space while
            reducing Cola from 35% to 28%. Each row shows the subcategory name,
            current facing count and share, optimized facing count and share, and
            the change in both absolute facings and share percentage.
          </p>
        </DocSubSection>

        <DocSubSection title="Profit Lift Calculation">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            The headline metric is <strong>Profit Lift %</strong>, calculated as:
          </p>
          <Formula>
            Profit Lift % = (Optimized Profit - Current Profit) / Current Profit
            &times; 100
          </Formula>
          <p className="text-sm leading-relaxed text-muted-foreground mt-3">
            The absolute profit lift is also shown in dollars per week. To
            estimate annual impact, multiply by 52. For example, a $150/week
            profit lift translates to approximately $7,800 per year per store.
            Across a chain of 500 stores, that is $3.9M in annual incremental
            profit.
          </p>
        </DocSubSection>

        <DocSubSection title="Interpreting Comparison Tables">
          <p className="text-sm leading-relaxed text-muted-foreground">
            When reviewing the current vs. optimized comparison table, focus on
            these patterns:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Products gaining facings:</strong> These are
              underrepresented SKUs with strong sales velocity or high margins.
              The optimizer found that giving them more space yields a
              disproportionate profit increase.
            </li>
            <li>
              <strong>Products losing facings:</strong> These are
              over-represented SKUs whose marginal profit per additional facing
              is lower than alternatives. Reducing their space frees capacity
              for higher-return products.
            </li>
            <li>
              <strong>Products removed (0 facings):</strong> These SKUs did
              not make the optimized assortment. They are typically low-velocity,
              low-margin items that can be delisted or replaced with better
              performers.
            </li>
            <li>
              <strong>Products unchanged:</strong> Already optimally allocated
              or constrained (e.g., at minimum facings for a must-carry item).
            </li>
          </ul>
          <WarningCallout>
            <strong>Before Implementing:</strong> Always review removed products
            for qualitative factors the model cannot capture: seasonal
            relevance, upcoming promotions, strategic supplier relationships, or
            new product introductions. The optimizer maximizes profit based on
            historical data -- it does not anticipate future market changes.
          </WarningCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 5: Industry Best Practices */}
      {/* ================================================================== */}
      <DocSection id="industry-best-practices" title="5. Industry Best Practices">
        <DocSubSection title="BlueYonder Space Planning">
          <p className="text-sm leading-relaxed text-muted-foreground">
            BlueYonder (formerly JDA) pioneered <strong>category-role based
            space allocation</strong>, where each category is assigned a role
            (Destination, Routine, Seasonal, Convenience) that determines its
            fair share of total store space. Space allocation follows a top-down
            approach: total store space is first divided among departments, then
            categories, then subcategories, and finally individual SKUs. The
            assortment optimization we implement here operates at the bottom
            level (SKU allocation within a fixed category space), but the
            category-role framework provides the upstream constraint.
          </p>
        </DocSubSection>

        <DocSubSection title="Relex Assortment">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Relex Solutions emphasizes <strong>store-cluster specific
            assortments</strong>. Rather than a single national planogram, Relex
            builds cluster-level assortments that reflect local demand patterns.
            A high-income urban store might carry more premium SKUs and craft
            brands, while a rural value-focused store emphasizes store brands
            and family sizes. The clustering module in this tool provides the
            same capability -- segment stores into clusters, then run
            optimization separately for each cluster.
          </p>
        </DocSubSection>

        <DocSubSection title="Oracle Retail Category Management">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Oracle Retail integrates <strong>Consumer Decision Trees
            (CDTs)</strong> into the assortment process. A CDT maps the
            hierarchy of attributes shoppers use when choosing a product (e.g.,
            for carbonated beverages: Category &rarr; Flavor &rarr; Brand &rarr;
            Size &rarr; Pack Type). The CDT ensures that the assortment covers
            all key decision points. Oracle&apos;s recommendation: always validate
            optimization results against the CDT to ensure no critical shopper
            need states are left unserved.
          </p>
        </DocSubSection>

        <DocSubSection title="Key Performance Metrics">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead className="w-[160px]">Target Benchmark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">GMROI</TableCell>
                <TableCell>
                  Gross Margin Return on Inventory Investment = Gross Margin / Average Inventory Cost.
                  Measures how efficiently inventory investment generates gross profit.
                </TableCell>
                <TableCell>&gt; 3.0 for grocery</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Sales per Linear Foot
                </TableCell>
                <TableCell>
                  Total sales divided by linear feet of shelf space. The primary
                  space productivity metric in retail.
                </TableCell>
                <TableCell>
                  Varies by category; track trend over time
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Inventory Turns</TableCell>
                <TableCell>
                  Cost of Goods Sold / Average Inventory. Higher turns indicate
                  faster-selling assortments with lower carrying costs.
                </TableCell>
                <TableCell>12-20x for grocery</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Out-of-Stock Rate
                </TableCell>
                <TableCell>
                  Percentage of time a product is unavailable on shelf. Proper
                  space allocation reduces OSA by matching supply to demand.
                </TableCell>
                <TableCell>&lt; 3% for core items</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Common Pitfalls and How to Avoid Them">
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Pitfall 1: Optimizing on Stale Data
              </p>
              <p className="text-sm text-muted-foreground">
                Sales data from 12+ months ago may not reflect current demand
                patterns. Use the most recent 13-26 weeks of sales data for
                optimization, excluding anomalous periods (major promotions,
                supply disruptions, holiday spikes). Always validate results
                against the most recent 4-week trend.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Pitfall 2: Ignoring Substitution Effects
              </p>
              <p className="text-sm text-muted-foreground">
                When a product is removed, its demand does not vanish -- a
                portion transfers to substitute products. The base optimizer
                does not model substitution. Use the Monte Carlo simulation
                module (with walk rate parameter) to estimate how much demand is
                lost vs. recaptured by remaining products.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Pitfall 3: Over-Constraining the Model
              </p>
              <p className="text-sm text-muted-foreground">
                Adding too many must-carry items or overly tight brand/tier
                constraints reduces the optimizer&apos;s degrees of freedom and limits
                the achievable profit lift. Start with minimal constraints, review
                results, then incrementally add constraints based on business
                reality. If profit lift drops below 2%, the model may be
                over-constrained.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Pitfall 4: Treating Optimization as a One-Time Exercise
              </p>
              <p className="text-sm text-muted-foreground">
                Consumer preferences, competitive dynamics, and supplier terms
                change continuously. Best practice is to re-run optimization
                quarterly (at minimum) and after any significant event: new
                product launch, competitor entry, major price change, or
                seasonal transition. Build optimization into your regular
                category review cadence.
              </p>
            </div>
          </div>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 6: References */}
      {/* ================================================================== */}
      <DocSection id="references" title="6. References">
        <DocSubSection title="Academic References">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
            <li>
              Kok, A.G., Fisher, M.L., & Vaidyanathan, R. (2009).{" "}
              <em>Assortment Planning: Review of Literature and Industry Practice.</em>{" "}
              In: Retail Supply Chain Management. Springer. -- The definitive
              academic survey of assortment planning models, covering MNL-based
              demand models, locational choice models, and optimization
              formulations.
            </li>
            <li>
              Dreze, X., Hoch, S.J., & Purk, M.E. (1994).{" "}
              <em>Shelf Management and Space Elasticity.</em> Journal of
              Retailing, 70(4), 301-326. -- Foundational empirical study
              establishing the space-to-sales relationship and space elasticity
              coefficients used in optimization models.
            </li>
            <li>
              Curhan, R.C. (1972).{" "}
              <em>The Relationship Between Shelf Space and Unit Sales in Supermarkets.</em>{" "}
              Journal of Marketing Research, 9(4), 406-412. -- Early empirical
              work demonstrating the diminishing-returns relationship between
              shelf space and sales.
            </li>
            <li>
              Boatwright, P. & Nunes, J.C. (2001).{" "}
              <em>Reducing Assortment: An Attribute-Based Approach.</em> Journal
              of Marketing, 65(3), 50-63. -- Demonstrates that strategic
              assortment reduction can increase category sales by reducing
              choice overload.
            </li>
            <li>
              Honhon, D., Gaur, V., & Seshadri, S. (2010).{" "}
              <em>Assortment Planning and Inventory Decisions Under Stockout-Based Substitution.</em>{" "}
              Operations Research, 58(5), 1364-1379. -- Integrates substitution
              behavior into the assortment optimization framework.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Industry Frameworks">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
            <li>
              <strong>ECR Category Management:</strong> The 8-step category
              management process developed by the Efficient Consumer Response
              (ECR) initiative. Steps include category definition, category
              role assignment, category assessment, category scorecard, category
              strategy, category tactics (including assortment optimization),
              plan implementation, and category review. This optimizer addresses
              step 6 (tactics) within the broader ECR framework.
            </li>
            <li>
              <strong>Nielsen Category Management Best Practices:</strong>{" "}
              Nielsen/NielsenIQ recommends a &quot;Consumer-Centric Shelf&quot; approach
              that combines shopper insights (what do shoppers want?) with space
              optimization (how do we allocate shelf to serve those needs
              profitably?). Key principle: start with the Consumer Decision Tree,
              then optimize space within each decision node.
            </li>
            <li>
              <strong>Category Captain Model:</strong> Many retailers designate a
              leading supplier as &quot;category captain&quot; responsible for recommending
              assortments. The optimization tool provides an independent,
              data-driven check on captain recommendations, ensuring they serve
              the retailer&apos;s interests (not just the captain&apos;s brand share).
            </li>
          </ul>
        </DocSubSection>

        <InfoCallout>
          <strong>Further Reading:</strong> For a practical guide to implementing
          assortment optimization in a retail organization, see &quot;Category
          Management in Purchasing&quot; by Jonathan O&apos;Brien (Kogan Page, 4th
          edition) and &quot;The New Science of Retailing&quot; by Marshall Fisher and
          Ananth Raman (Harvard Business Press).
        </InfoCallout>
      </DocSection>
    </DocPage>
  );
}
