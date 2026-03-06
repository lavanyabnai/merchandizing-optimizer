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
  { id: "sim-overview", title: "Overview" },
  { id: "sim-input-data", title: "Input Data Requirements" },
  { id: "sim-methodology", title: "Methodology" },
  { id: "sim-output", title: "Output Explanation" },
  { id: "sim-best-practices", title: "Industry Best Practices" },
];

export function SimulationDocs() {
  return (
    <DocPage
      title="Monte Carlo Simulation"
      subtitle="A comprehensive guide to Monte Carlo simulation for retail scenario analysis. Understand how stochastic modeling quantifies the uncertainty in assortment decisions and provides probabilistic confidence in projected outcomes."
      sections={sections}
    >
      {/* ================================================================== */}
      {/* SECTION 1: Overview */}
      {/* ================================================================== */}
      <DocSection id="sim-overview" title="1. Overview">
        <DocSubSection title="What Is Monte Carlo Simulation in Retail?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Monte Carlo simulation is a computational technique that uses
            repeated random sampling to model the probability distribution of
            possible outcomes for a process that is inherently uncertain. In the
            retail context, it is used to answer questions like: &quot;If I remove
            this SKU from the shelf, what is the range of possible profit
            outcomes, and how likely is it that profit will increase?&quot;
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Unlike the deterministic optimization model (which produces a single
            &quot;best&quot; answer), Monte Carlo simulation acknowledges that key inputs
            -- demand, price sensitivity, space responsiveness, and shopper
            behavior -- are not known with certainty. By sampling thousands of
            plausible scenarios from statistical distributions calibrated to
            historical data, the simulation produces a distribution of outcomes
            that captures the full range of what might happen.
          </p>
        </DocSubSection>

        <DocSubSection title="Why Simulate?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Decision-makers in retail face three fundamental challenges that
            Monte Carlo simulation directly addresses:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
            <li>
              <strong>Uncertainty Quantification:</strong> Point estimates
              (&quot;this change will increase profit by $500/week&quot;) are misleading
              because they ignore variability. Simulation provides a range
              (&quot;profit change will be between -$200 and +$1,200 with 90%
              confidence&quot;) that supports better risk-aware decision-making.
            </li>
            <li>
              <strong>Risk Assessment:</strong> What is the probability that a
              proposed change will actually decrease profit? If there is a 30%
              chance of a negative outcome, the decision-maker may choose not to
              proceed -- even if the expected value is positive. Simulation
              quantifies this downside risk explicitly.
            </li>
            <li>
              <strong>Scenario Comparison:</strong> When comparing multiple
              alternative actions (remove SKU A vs. remove SKU B vs. add SKU C),
              simulation provides apples-to-apples comparison on both expected
              value and risk profile, enabling rational choice among
              alternatives.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Industry Usage">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Monte Carlo methods are widely used in retail analytics for:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Demand Uncertainty Modeling:</strong> Forecasting demand
              for seasonal items, new product launches, and promotional periods
              where historical data is sparse or non-existent.
            </li>
            <li>
              <strong>Promotion Impact Analysis:</strong> Estimating the range
              of uplift from a planned promotion, accounting for uncertainty in
              baseline sales, cannibalization, and halo effects.
            </li>
            <li>
              <strong>New Product Launch Risk:</strong> Quantifying the
              probability that a new SKU will meet minimum velocity thresholds
              within the first 13 weeks. Retailers like Target and Kroger use
              simulation-based approaches to set go/no-go gates for new item
              authorizations.
            </li>
            <li>
              <strong>Supply Chain Stress Testing:</strong> Modeling the impact
              of supply disruptions on on-shelf availability and sales, helping
              buyers set appropriate safety stock levels.
            </li>
          </ul>
          <InfoCallout>
            <strong>Industry Context:</strong> Enterprise solutions from
            BlueYonder, Relex, and Oracle Retail all incorporate stochastic
            simulation capabilities. The simulation module in this tool
            implements the same core methodology -- parametric random sampling
            with scenario-specific adjustments -- in an accessible, interactive
            format.
          </InfoCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 2: Input Data Requirements */}
      {/* ================================================================== */}
      <DocSection id="sim-input-data" title="2. Input Data Requirements">
        <DocSubSection title="Scenario Definition">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            Each simulation run evaluates one specific scenario. The four
            supported scenario types are:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Scenario Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[200px]">Key Parameters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge variant="outline">remove_sku</Badge>
                </TableCell>
                <TableCell>
                  Remove an existing product from the shelf. Models the demand
                  loss from shoppers who walk away and the demand transfer to
                  substitute products.
                </TableCell>
                <TableCell>SKU to remove, walk rate, substitution pattern</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge variant="outline">add_sku</Badge>
                </TableCell>
                <TableCell>
                  Introduce a new product to the shelf. Models demand
                  cannibalization from existing products and incremental category
                  growth.
                </TableCell>
                <TableCell>
                  New SKU attributes, estimated demand, facings to allocate
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge variant="outline">change_facings</Badge>
                </TableCell>
                <TableCell>
                  Increase or decrease the number of facings for a product.
                  Models the space elasticity effect on demand.
                </TableCell>
                <TableCell>SKU, new facing count, space elasticity</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <Badge variant="outline">change_price</Badge>
                </TableCell>
                <TableCell>
                  Adjust the retail price of a product. Models the price
                  elasticity effect on demand and the net impact on revenue and
                  profit.
                </TableCell>
                <TableCell>SKU, new price, price elasticity</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Simulation Configuration">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Parameter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Default</TableHead>
                <TableHead className="w-[120px]">Typical Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Number of Trials</TableCell>
                <TableCell>
                  How many random scenarios to simulate. More trials produce
                  smoother distributions and more stable percentile estimates.
                </TableCell>
                <TableCell>5,000</TableCell>
                <TableCell>1,000 - 10,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Demand CV</TableCell>
                <TableCell>
                  Coefficient of variation for demand (standard deviation /
                  mean). Controls how much demand varies across trials. A CV of
                  0.3 means demand varies by +/- 30% around the mean.
                </TableCell>
                <TableCell>0.25</TableCell>
                <TableCell>0.10 - 0.50</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Price Elasticity Mean
                </TableCell>
                <TableCell>
                  Mean of the normal distribution from which price elasticity is
                  sampled in each trial.
                </TableCell>
                <TableCell>-1.5</TableCell>
                <TableCell>-0.5 to -3.0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Price Elasticity Std
                </TableCell>
                <TableCell>
                  Standard deviation of the price elasticity distribution.
                  Captures uncertainty about the true elasticity value.
                </TableCell>
                <TableCell>0.3</TableCell>
                <TableCell>0.1 - 0.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Space Elasticity Std
                </TableCell>
                <TableCell>
                  Standard deviation of the space elasticity distribution.
                  Space elasticity mean comes from the product master data.
                </TableCell>
                <TableCell>0.05</TableCell>
                <TableCell>0.02 - 0.10</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Walk Rate Mean</TableCell>
                <TableCell>
                  Mean probability that a shopper leaves without purchasing
                  anything in the category if their preferred product is
                  unavailable (relevant for remove_sku scenarios).
                </TableCell>
                <TableCell>0.3</TableCell>
                <TableCell>0.1 - 0.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Walk Rate Std</TableCell>
                <TableCell>
                  Standard deviation of the walk rate distribution.
                </TableCell>
                <TableCell>0.1</TableCell>
                <TableCell>0.05 - 0.15</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Random Seed</TableCell>
                <TableCell>
                  Optional seed for reproducibility. If set, running the same
                  simulation twice produces identical results.
                </TableCell>
                <TableCell>None</TableCell>
                <TableCell>Any integer</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Historical Baseline Data">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The simulation requires baseline data for calibration:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Baseline Revenue:</strong> Current weekly revenue for the
              category/store combination. This anchors the distribution -- all
              simulated outcomes are expressed as changes relative to this
              baseline.
            </li>
            <li>
              <strong>Baseline Profit:</strong> Current weekly gross profit,
              used for profit-based metrics and probability calculations.
            </li>
            <li>
              <strong>Per-Product Metrics:</strong> Current demand (units), price,
              cost, and facings for each SKU in the assortment. These provide the
              starting point for scenario modifications.
            </li>
          </ul>
          <WarningCallout>
            <strong>Calibration Matters:</strong> The accuracy of simulation
            results depends heavily on how well the configuration parameters
            match your actual business. The demand CV should be estimated from
            your sales data (calculate the CV of weekly sales for representative
            SKUs). Price and space elasticities should come from econometric
            analysis or industry benchmarks for your specific category.
          </WarningCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 3: Methodology */}
      {/* ================================================================== */}
      <DocSection id="sim-methodology" title="3. Methodology">
        <DocSubSection title="The Monte Carlo Method">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Named after the famous casino in Monaco, the Monte Carlo method
            works by replacing uncertain inputs with random variables drawn from
            probability distributions, then running the model thousands of times
            to build up a statistical picture of possible outcomes. In our retail
            context, the &quot;model&quot; is the profit calculation, and the uncertain
            inputs are demand, elasticities, and shopper behavior.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Law of Large Numbers guarantees that as the number of trials
            increases, the simulated distribution converges to the true
            distribution. With 5,000+ trials, percentile estimates are stable
            to within approximately 1-2% of their true values.
          </p>
        </DocSubSection>

        <DocSubSection title="Random Variable Generation">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            Each uncertain input is modeled as a random variable drawn from a
            specific distribution chosen to match the empirical properties of
            that variable:
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Demand</Badge>
                <span className="text-sm font-medium">
                  Log-Normal Distribution
                </span>
              </div>
              <Formula>
                demand<sub>i</sub> ~ LogNormal(&mu;, &sigma;)
                <br />
                <span className="text-xs text-muted-foreground">
                  Where &mu; = ln(base_demand) - &sigma;&sup2;/2,&nbsp;
                  &sigma; = sqrt(ln(1 + CV&sup2;))
                </span>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Why Log-Normal?</strong> Retail demand is strictly
                positive (you cannot sell negative units) and right-skewed (most
                weeks have moderate sales, but occasional high-demand weeks
                occur). The log-normal distribution naturally captures both
                properties. The coefficient of variation (CV) parameter controls
                the spread: a CV of 0.25 produces moderate variability typical
                of established grocery SKUs; a CV of 0.50 is appropriate for
                highly volatile categories like seasonal or promotional items.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Price Elasticity</Badge>
                <span className="text-sm font-medium">
                  Normal Distribution
                </span>
              </div>
              <Formula>
                &epsilon;<sub>price</sub> ~ Normal(&mu;<sub>price</sub>, &sigma;
                <sub>price</sub>)
                <br />
                <span className="text-xs text-muted-foreground">
                  Default: &mu; = -1.5, &sigma; = 0.3
                </span>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Why Normal?</strong> Price elasticity estimates from
                econometric models are typically reported with standard errors
                that imply a normal (Gaussian) distribution. The mean reflects
                the best estimate of the true elasticity; the standard deviation
                captures measurement uncertainty. For example, with mean = -1.5
                and std = 0.3, approximately 95% of trials use elasticities
                between -2.1 and -0.9, spanning the range of plausible values
                for most grocery categories.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Space Elasticity</Badge>
                <span className="text-sm font-medium">
                  Normal Distribution
                </span>
              </div>
              <Formula>
                &alpha;<sub>i</sub> ~ Normal(&alpha;<sub>i,base</sub>, &sigma;
                <sub>space</sub>)
                <br />
                <span className="text-xs text-muted-foreground">
                  Mean from product data, default &sigma; = 0.05
                </span>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Rationale:</strong> Space elasticity is a product-level
                parameter estimated from controlled experiments or regression.
                The simulation samples around the point estimate to capture
                measurement uncertainty. The narrow default standard deviation
                (0.05) reflects the relatively stable empirical finding that
                space elasticities typically fall between 0.1 and 0.3 for
                grocery.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Walk Rate</Badge>
                <span className="text-sm font-medium">Beta Distribution</span>
              </div>
              <Formula>
                walk_rate ~ Beta(a, b)
                <br />
                <span className="text-xs text-muted-foreground">
                  Parameters derived from mean and std: a = mean &times; ((mean
                  &times; (1 - mean)) / std&sup2; - 1), b = (1 - mean) &times;
                  ((mean &times; (1 - mean)) / std&sup2; - 1)
                </span>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Why Beta?</strong> The walk rate is a probability
                (bounded between 0 and 1). The Beta distribution is the natural
                choice for modeling uncertain probabilities. With mean = 0.3 and
                std = 0.1, the distribution is centered at a 30% walk rate
                (meaning 70% of demand transfers to substitutes, 30% is lost to
                the category). Walk rates vary significantly by category: staple
                categories (milk, bread) have low walk rates (5-15%); niche or
                brand-loyal categories (craft beer, premium cosmetics) have high
                walk rates (30-50%).
              </p>
            </div>
          </div>
        </DocSubSection>

        <DocSubSection title="Trial Execution">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            For each of the N trials (e.g., 5,000), the simulation executes the
            following steps:
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                1
              </div>
              <div>
                <p className="text-sm font-medium">Sample Demand Realization</p>
                <p className="text-sm text-muted-foreground">
                  For each product in the assortment, draw a demand realization
                  from its log-normal distribution. This represents one possible
                  &quot;state of the world&quot; -- what demand would have been in this
                  particular week.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                2
              </div>
              <div>
                <p className="text-sm font-medium">Apply Scenario Change</p>
                <p className="text-sm text-muted-foreground">
                  Modify the assortment according to the scenario definition. For
                  a &quot;remove SKU&quot; scenario, set the removed product&apos;s demand to
                  zero and redistribute a portion (1 - walk_rate) to remaining
                  products based on their revenue share. For &quot;change facings,&quot;
                  adjust the facing count and apply the sampled space elasticity.
                  For &quot;change price,&quot; apply the sampled price elasticity to
                  compute the new demand level.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                3
              </div>
              <div>
                <p className="text-sm font-medium">Calculate Revenue</p>
                <p className="text-sm text-muted-foreground">
                  For each product, compute revenue under the scenario:
                </p>
                <Formula>
                  revenue<sub>i</sub> = price<sub>i</sub> &times; demand
                  <sub>i</sub> &times; (facings<sub>i</sub> / base_facings
                  <sub>i</sub>)<sup>&alpha;<sub>i</sub></sup>
                </Formula>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                4
              </div>
              <div>
                <p className="text-sm font-medium">Calculate Profit</p>
                <p className="text-sm text-muted-foreground">
                  Compute profit for each product and sum across the assortment:
                </p>
                <Formula>
                  profit<sub>i</sub> = revenue<sub>i</sub> - cost<sub>i</sub>{" "}
                  &times; demand<sub>i</sub> &times; (facings<sub>i</sub> /
                  base_facings<sub>i</sub>)<sup>&alpha;<sub>i</sub></sup>
                </Formula>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                5
              </div>
              <div>
                <p className="text-sm font-medium">
                  Account for Walk Rate and Substitution
                </p>
                <p className="text-sm text-muted-foreground">
                  For scenarios involving product removal, the demand that would
                  have gone to the removed product is split: a fraction equal to
                  the walk rate is lost entirely (the shopper leaves the
                  category), and the remainder is redistributed to substitute
                  products proportional to their revenue share. This captures the
                  critical substitution dynamic that determines whether removing
                  a product is net positive or negative.
                </p>
              </div>
            </div>
          </div>
        </DocSubSection>

        <DocSubSection title="Aggregation and Confidence Intervals">
          <p className="text-sm leading-relaxed text-muted-foreground">
            After all N trials complete, the simulation aggregates the results:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Mean, Standard Deviation, Min, Max, Median:</strong>{" "}
              Computed directly from the N profit/revenue values. The mean
              represents the expected outcome; the standard deviation measures
              risk.
            </li>
            <li>
              <strong>Percentiles (5th through 95th):</strong> Computed using
              the percentile method (sort values, find value at the k-th
              position). The 5th percentile represents the &quot;bad case&quot; outcome;
              the 95th percentile represents the &quot;good case.&quot;
            </li>
            <li>
              <strong>Confidence Intervals:</strong> The 90% CI spans from the
              5th to the 95th percentile; the 95% CI spans from the 2.5th to
              the 97.5th percentile. These provide the range within which the
              actual outcome will fall with the stated confidence.
            </li>
            <li>
              <strong>Probability Metrics:</strong> P(positive) is the fraction
              of trials where profit change &gt; 0; P(negative) is the fraction
              where profit change &lt; 0; P(breakeven) captures trials within
              +/- 1% of baseline.
            </li>
          </ul>
          <Formula>
            <div className="space-y-1">
              <div>
                P(positive) = count(profit_change &gt; 0) / N
              </div>
              <div>
                P(negative) = count(profit_change &lt; 0) / N
              </div>
              <div>
                CI<sub>95%</sub> = [percentile(2.5), percentile(97.5)]
              </div>
            </div>
          </Formula>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 4: Output Explanation */}
      {/* ================================================================== */}
      <DocSection id="sim-output" title="4. Output Explanation">
        <DocSubSection title="Distribution Statistics">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Statistic</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[240px]">How to Interpret</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Mean</TableCell>
                <TableCell>
                  Average profit/revenue across all simulated trials
                </TableCell>
                <TableCell>
                  The &quot;expected value&quot; -- what you would expect on average if you
                  could repeat the scenario many times
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Std Dev</TableCell>
                <TableCell>
                  Standard deviation of the profit/revenue distribution
                </TableCell>
                <TableCell>
                  Measures risk/volatility. A larger std dev means more
                  uncertainty in the outcome
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Min / Max</TableCell>
                <TableCell>
                  Worst-case and best-case outcomes observed across all trials
                </TableCell>
                <TableCell>
                  Extreme scenarios -- useful for stress testing, but these are
                  tail events (not likely outcomes)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Median (P50)</TableCell>
                <TableCell>
                  The middle value -- 50% of trials are above this, 50% below
                </TableCell>
                <TableCell>
                  Often a better &quot;typical outcome&quot; than the mean for skewed
                  distributions
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Percentile Breakdown">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Percentile</TableHead>
                <TableHead>Interpretation</TableHead>
                <TableHead className="w-[240px]">Decision Use</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">P5</TableCell>
                <TableCell>
                  Only 5% of outcomes are worse than this value
                </TableCell>
                <TableCell>
                  Conservative &quot;floor&quot; for planning -- use for downside risk
                  assessment
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P10</TableCell>
                <TableCell>
                  10% of outcomes are worse; 90% are better
                </TableCell>
                <TableCell>
                  Used for &quot;pessimistic but plausible&quot; budgeting
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P25</TableCell>
                <TableCell>Lower quartile</TableCell>
                <TableCell>
                  Represents a below-average but not unusual outcome
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P50</TableCell>
                <TableCell>Median -- the most typical outcome</TableCell>
                <TableCell>
                  Best single estimate of the likely outcome
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P75</TableCell>
                <TableCell>Upper quartile</TableCell>
                <TableCell>
                  Represents an above-average but achievable outcome
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P90</TableCell>
                <TableCell>
                  90% of outcomes are worse; only 10% are better
                </TableCell>
                <TableCell>
                  Optimistic but plausible -- use for stretch targets
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">P95</TableCell>
                <TableCell>
                  95% of outcomes are worse -- the &quot;upside ceiling&quot;
                </TableCell>
                <TableCell>
                  Best-case planning; rarely achieved in practice
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Revenue and Profit Change Metrics">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The simulation reports both absolute and percentage changes for
            revenue and profit:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Absolute Change:</strong> Dollar amount of profit/revenue
              increase or decrease relative to baseline. For example, a profit
              change of +$250/week means the scenario is expected to add $250
              in weekly gross profit.
            </li>
            <li>
              <strong>Percentage Change:</strong> Change expressed as a
              percentage of baseline. A revenue change of -2.5% means the
              scenario is expected to reduce weekly revenue by 2.5% of the
              current level.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Probability Metrics">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            The three key probability metrics provide a direct answer to the
            fundamental business question: &quot;Should we do this?&quot;
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                P(Positive): Probability of Profit Increase
              </p>
              <p className="text-sm text-muted-foreground">
                The fraction of simulated trials where the scenario produces
                higher profit than the baseline. This is the single most
                important metric for go/no-go decisions.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                P(Negative): Probability of Profit Decrease
              </p>
              <p className="text-sm text-muted-foreground">
                The fraction of trials where the scenario reduces profit. This
                quantifies the downside risk. A high P(negative) should trigger
                caution even if the mean profit change is positive.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">
                P(Breakeven): Probability of No Material Change
              </p>
              <p className="text-sm text-muted-foreground">
                The fraction of trials where the profit change is within +/- 1%
                of baseline. A high breakeven probability suggests the scenario
                has minimal financial impact and the decision should be made on
                non-financial factors (e.g., supplier relationship, brand
                strategy).
              </p>
            </div>
          </div>
        </DocSubSection>

        <DocSubSection title="Decision Framework">
          <InfoCallout>
            <strong>How to Interpret Results:</strong> Use the following
            decision framework based on P(Positive):
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>P(positive) &gt; 80%:</strong> High confidence the
                change is beneficial. Proceed with implementation.
              </li>
              <li>
                <strong>P(positive) 60-80%:</strong> Moderate confidence.
                Consider running with additional constraints or a smaller-scale
                pilot before full rollout.
              </li>
              <li>
                <strong>P(positive) 40-60%:</strong> Essentially a coin flip.
                The data does not provide a clear signal. Gather more data or
                consider alternative scenarios.
              </li>
              <li>
                <strong>P(positive) &lt; 40%:</strong> High probability of
                negative outcome. Do not proceed unless there are strong
                non-financial reasons (e.g., regulatory requirement, supplier
                contractual obligation).
              </li>
            </ul>
          </InfoCallout>
        </DocSubSection>

        <DocSubSection title="Confidence Intervals">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Two confidence intervals are reported:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>90% CI:</strong> [P5, P95]. The true outcome will fall
              within this range 90% of the time. Wider intervals indicate more
              uncertainty. Use the lower bound for conservative planning and
              the upper bound for optimistic scenario analysis.
            </li>
            <li>
              <strong>95% CI:</strong> [P2.5, P97.5]. The standard confidence
              interval used in statistical analysis. Even wider than the 90%
              CI, capturing almost all plausible outcomes. If the lower bound
              of the 95% CI is positive, you can be very confident the change
              is beneficial.
            </li>
          </ul>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 5: Industry Best Practices */}
      {/* ================================================================== */}
      <DocSection id="sim-best-practices" title="5. Industry Best Practices">
        <DocSubSection title="Recommended Number of Trials">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The number of simulation trials directly impacts the precision of
            your estimates. Industry recommendations:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Trials</TableHead>
                <TableHead>Precision Level</TableHead>
                <TableHead className="w-[200px]">Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">1,000</TableCell>
                <TableCell>
                  Rough directional estimate. Mean and median are stable, but
                  tail percentiles (P5, P95) may fluctuate by 5-10%.
                </TableCell>
                <TableCell>Quick screening of many scenarios</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">5,000</TableCell>
                <TableCell>
                  Good precision. All percentiles stable to within 2-3%.
                  Confidence intervals are reliable.
                </TableCell>
                <TableCell>Standard analysis; recommended default</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">10,000</TableCell>
                <TableCell>
                  High precision. Percentiles stable to within 1%. Suitable
                  for formal reporting and executive presentations.
                </TableCell>
                <TableCell>
                  Final analysis before major decisions
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Calibrating Demand CV from Historical Data">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The demand coefficient of variation (CV) should be estimated from
            your own sales data when possible:
          </p>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              Pull weekly sales data for each SKU in the category over the most
              recent 26-52 weeks.
            </li>
            <li>
              Exclude weeks with promotions, stockouts, or other anomalies.
            </li>
            <li>
              For each SKU, compute CV = standard deviation / mean.
            </li>
            <li>
              Take the median CV across all SKUs as the category-level
              parameter.
            </li>
          </ol>
          <p className="text-sm leading-relaxed text-muted-foreground mt-2">
            If historical data is unavailable, use these category benchmarks:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Category Type</TableHead>
                <TableHead>Typical CV Range</TableHead>
                <TableHead className="w-[200px]">Examples</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Staple / Pantry</TableCell>
                <TableCell>0.10 - 0.20</TableCell>
                <TableCell>Milk, bread, paper towels</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Mainstream Grocery
                </TableCell>
                <TableCell>0.20 - 0.30</TableCell>
                <TableCell>CSD, snacks, cereal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Discretionary</TableCell>
                <TableCell>0.30 - 0.45</TableCell>
                <TableCell>Craft beer, premium cosmetics</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Seasonal / Trend</TableCell>
                <TableCell>0.40 - 0.60</TableCell>
                <TableCell>
                  Sunscreen, holiday candy, trending items
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Sensitivity Analysis">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Because the simulation relies on distributional assumptions, it is
            critical to test how sensitive the results are to those assumptions.
            Best practice:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              Run the same scenario with 3 different demand CV values (e.g.,
              0.15, 0.25, 0.40). If the decision flips (P(positive) goes from
              &gt;80% to &lt;50%), the result is sensitive to demand variability
              and you need better demand estimates before proceeding.
            </li>
            <li>
              Test different walk rate assumptions for remove-SKU scenarios.
              Walk rates are notoriously hard to estimate, and they have a large
              impact on the net profit of SKU removal.
            </li>
            <li>
              Vary the price elasticity mean by +/- 0.5 from your base estimate
              and check whether the recommendation changes.
            </li>
          </ul>
          <InfoCallout>
            <strong>Rule of Thumb:</strong> If the same decision (proceed / do
            not proceed) holds across all sensitivity scenarios, you can be
            confident in the recommendation. If the decision is sensitive to
            parameter assumptions, invest in better parameter estimation before
            committing to a course of action.
          </InfoCallout>
        </DocSubSection>

        <DocSubSection title="Comparing Scenarios Side-by-Side">
          <p className="text-sm leading-relaxed text-muted-foreground">
            When evaluating multiple alternative actions, run separate
            simulations for each and compare:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Mean profit change:</strong> Which scenario has the
              highest expected profit impact?
            </li>
            <li>
              <strong>P(positive):</strong> Which scenario has the highest
              probability of a positive outcome?
            </li>
            <li>
              <strong>Downside risk (P5):</strong> Which scenario has the least
              bad &quot;worst case&quot;? A risk-averse decision-maker may prefer a
              scenario with a lower mean but a better floor.
            </li>
            <li>
              <strong>Coefficient of Variation of profit change:</strong>{" "}
              Lower CV means more predictable outcomes, which is valuable in
              itself.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title='When Simulation Says "Don&apos;t Proceed"'>
          <WarningCallout>
            <strong>Heeding the Warning Signs:</strong> If the simulation
            consistently shows P(positive) &lt; 50% across multiple parameter
            assumptions, the proposed change is likely value-destructive. Common
            situations where this occurs:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Removing a high-velocity SKU with a brand-loyal customer base
                (high walk rate)
              </li>
              <li>
                Reducing facings on a product with high space elasticity
              </li>
              <li>
                Raising price on a highly price-elastic product in a
                competitive category
              </li>
              <li>
                Adding a low-margin SKU that cannibalizes a high-margin
                incumbent
              </li>
            </ul>
            In these cases, explore alternative scenarios rather than forcing
            the original plan.
          </WarningCallout>
        </DocSubSection>
      </DocSection>
    </DocPage>
  );
}
