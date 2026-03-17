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
  { id: "cluster-overview", title: "Overview" },
  { id: "cluster-input-data", title: "Input Data Requirements" },
  { id: "cluster-methodology", title: "Methodology" },
  { id: "cluster-output", title: "Output Explanation" },
  { id: "cluster-best-practices", title: "Industry Best Practices" },
];

export function ClusteringDocs() {
  return (
    <DocPage
      title="Store Clustering"
      subtitle="A comprehensive guide to store clustering for localized assortment strategies. Learn how K-Means, Gaussian Mixture Models, and PCA work together to segment your store network into actionable clusters with distinct merchandising profiles."
      sections={sections}
    >
      {/* ================================================================== */}
      {/* SECTION 1: Overview */}
      {/* ================================================================== */}
      <DocSection id="cluster-overview" title="1. Overview">
        <DocSubSection title="What Is Store Clustering in Retail?">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Store clustering is the process of grouping retail stores into
            segments based on their shared characteristics -- sales patterns,
            shopper demographics, physical attributes, and product affinities.
            The fundamental insight is that a single national assortment is
            suboptimal: a high-income urban store and a rural value-focused
            store serve different shoppers with different needs, and their
            assortments should reflect those differences.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Clustering bridges the gap between two extremes: a single
            one-size-fits-all assortment (easy to manage but leaves profit on
            the table) and store-by-store customization (theoretically optimal
            but operationally impossible for large chains). By grouping stores
            into 3-8 clusters, retailers can create differentiated assortments
            that are both analytically grounded and operationally manageable.
          </p>
        </DocSubSection>

        <DocSubSection title="Business Value">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The business case for store clustering is well-established in retail
            industry literature:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>2-5% sales lift</strong> from localized assortments vs.
              national planograms, driven by better matching of product
              selection to local demand.
            </li>
            <li>
              <strong>Reduced out-of-stocks</strong> in high-velocity stores by
              allocating more facings to fast-moving products, while reducing
              excess inventory in lower-volume stores.
            </li>
            <li>
              <strong>Improved private label penetration</strong> by
              identifying which store clusters over-index on premium brands
              (opportunity to introduce value alternatives) and which
              over-index on store brands (opportunity to upgrade to national
              brands).
            </li>
            <li>
              <strong>Better new product targeting</strong> by launching new SKUs
              first in clusters where the target consumer profile is strongest,
              then rolling out based on performance.
            </li>
            <li>
              <strong>Streamlined supply chain</strong> by aligning distribution
              center assortments and replenishment parameters to cluster-level
              demand patterns.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Industry Context">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Store clustering is a core capability of every major retail
            analytics platform:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Relex Solutions</strong> uses store clustering as the
              foundation of its assortment optimization module. Their approach
              combines sales-based features with demographic overlays to create
              clusters that reflect both demand patterns and shopper profiles.
            </li>
            <li>
              <strong>BlueYonder</strong> integrates store clustering into its
              space and floor planning suite. Clusters determine not only which
              products to carry but also how much shelf space each category
              receives at the store level.
            </li>
            <li>
              <strong>Symphony RetailAI</strong> offers AI-driven micro-clustering
              that can create fine-grained segments (50-100 clusters) for large
              chains, using neural network-based feature extraction to discover
              non-obvious store similarities.
            </li>
            <li>
              <strong>Tesco</strong> pioneered loyalty-data-driven
              store segmentation, using household-level purchase data to cluster
              stores by the composition of their shopper base rather than just
              aggregate sales.
            </li>
          </ul>
          <InfoCallout>
            <strong>Key Principle:</strong> The most effective store clusters
            combine multiple signal types: structural attributes (format, size,
            location), performance data (sales velocity, margin mix), and
            shopper characteristics (income, basket composition). A cluster
            based solely on geography or store format will miss important demand
            pattern variations within those groups.
          </InfoCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 2: Input Data Requirements */}
      {/* ================================================================== */}
      <DocSection id="cluster-input-data" title="2. Input Data Requirements">
        <DocSubSection title="Store Features">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[140px]">Example Values</TableHead>
                <TableHead>Clustering Relevance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Store Format</TableCell>
                <TableCell>
                  Physical store type: Express (small-format, convenience),
                  Standard (typical grocery), Superstore (large-format
                  hypermarket)
                </TableCell>
                <TableCell>Express, Standard, Superstore</TableCell>
                <TableCell>
                  Strongly influences assortment breadth and depth; often the
                  primary clustering dimension
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Location Type</TableCell>
                <TableCell>
                  Geographic classification of the store&apos;s trade area
                </TableCell>
                <TableCell>Urban, Suburban, Rural</TableCell>
                <TableCell>
                  Correlates with shopper demographics, competitive density, and
                  trip mission
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Income Index</TableCell>
                <TableCell>
                  Relative household income level in the store&apos;s trade area,
                  indexed to the chain average
                </TableCell>
                <TableCell>Low, Medium, High</TableCell>
                <TableCell>
                  Strong predictor of brand tier preferences and price
                  sensitivity
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Weekly Traffic</TableCell>
                <TableCell>
                  Average weekly customer visits (foot traffic or transaction
                  count)
                </TableCell>
                <TableCell>5,000 - 25,000</TableCell>
                <TableCell>
                  Drives total demand volume; high-traffic stores need deeper
                  inventory and more facings
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Facings</TableCell>
                <TableCell>
                  Available shelf capacity in the category being analyzed
                </TableCell>
                <TableCell>80 - 200</TableCell>
                <TableCell>
                  Determines feasible assortment size; small-format stores have
                  fewer facings, requiring more aggressive SKU rationalization
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Sales-Derived Features">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[140px]">Example Values</TableHead>
                <TableHead>Clustering Relevance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Total Revenue</TableCell>
                <TableCell>
                  Total weekly category revenue at the store level
                </TableCell>
                <TableCell>$2,500 - $15,000</TableCell>
                <TableCell>
                  Primary indicator of store importance; drives cluster-level
                  investment decisions
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand Tier Mix</TableCell>
                <TableCell>
                  Percentage of sales from each brand tier: Premium, National A,
                  National B, Store Brand
                </TableCell>
                <TableCell>
                  Premium: 35%, National: 40%, Store Brand: 25%
                </TableCell>
                <TableCell>
                  Reveals shopper preference profile; the single best predictor
                  of which assortment will perform in a store
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category Mix</TableCell>
                <TableCell>
                  Revenue share by subcategory (e.g., Cola 40%, Energy 20%,
                  Water 15%)
                </TableCell>
                <TableCell>Cola: 40%, Energy: 20%</TableCell>
                <TableCell>
                  Identifies which subcategories over/under-index relative to
                  chain average, guiding assortment emphasis
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Avg Basket Size</TableCell>
                <TableCell>
                  Average transaction value in the category at the store
                </TableCell>
                <TableCell>$4.50 - $12.00</TableCell>
                <TableCell>
                  Proxy for shopper engagement; higher baskets suggest stock-up
                  behavior (favor multi-packs and larger sizes)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="Feature Selection Guidelines">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Not all available features should be included in the clustering
            model. Feature selection principles:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Include features that are actionable.</strong> Only cluster
              on dimensions where you would actually change the assortment. If
              you will not differentiate assortments by location type, do not
              include location type as a clustering feature.
            </li>
            <li>
              <strong>Avoid highly correlated features.</strong> If weekly traffic
              and total revenue are 95% correlated, include only one to prevent
              double-counting that dimension. Check pairwise correlations before
              clustering.
            </li>
            <li>
              <strong>Balance structural and behavioral features.</strong>{" "}
              Include at least one structural feature (format, location) and at
              least one behavioral feature (brand tier mix, category mix) for
              robust clusters that reflect both store identity and shopper
              behavior.
            </li>
            <li>
              <strong>Use 4-8 features.</strong> Too few features (1-2) produce
              trivial clusters; too many features (10+) dilute signal with noise
              and lead to unstable clusters. The sweet spot for retail store
              clustering is 4-8 well-chosen features.
            </li>
          </ul>
          <WarningCallout>
            <strong>Common Mistake:</strong> Including raw revenue as a
            clustering feature without normalization will cause the algorithm
            to cluster stores primarily by size (high-revenue vs. low-revenue).
            This is rarely the most useful segmentation. Instead, use revenue
            shares or per-capita metrics that capture demand composition rather
            than scale.
          </WarningCallout>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 3: Methodology */}
      {/* ================================================================== */}
      <DocSection id="cluster-methodology" title="3. Methodology">
        <DocSubSection title="K-Means Clustering">
          <p className="text-sm leading-relaxed text-muted-foreground">
            K-Means is the most widely used clustering algorithm in retail
            analytics. It partitions N stores into K clusters such that each
            store belongs to the cluster with the nearest centroid (mean
            feature vector).
          </p>

          <div className="space-y-3 mt-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Algorithm Steps</p>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
                <li>
                  <strong>Initialize:</strong> Select K initial centroids using
                  K-Means++ initialization (picks well-spread starting points to
                  avoid poor local optima).
                </li>
                <li>
                  <strong>Assign:</strong> Compute the Euclidean distance from
                  each store to every centroid. Assign each store to the nearest
                  centroid.
                </li>
                <li>
                  <strong>Update:</strong> Recalculate each centroid as the mean
                  of all stores currently assigned to that cluster.
                </li>
                <li>
                  <strong>Repeat:</strong> Iterate steps 2-3 until assignments
                  stabilize (no store changes cluster) or a maximum iteration
                  count is reached.
                </li>
              </ol>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Feature Standardization</p>
              <p className="text-sm text-muted-foreground">
                Before clustering, all features are standardized using z-score
                normalization:
              </p>
              <Formula>
                z<sub>i</sub> = (x<sub>i</sub> - &mu;) / &sigma;
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                This is critical because K-Means uses Euclidean distance, which
                is sensitive to feature scale. Without standardization, a
                feature measured in thousands (e.g., weekly traffic = 12,000)
                would dominate a feature measured in decimals (e.g., premium
                share = 0.35), regardless of their relative importance.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Choosing K: Elbow Method and Silhouette Score</p>
              <p className="text-sm text-muted-foreground mb-2">
                The optimal number of clusters K is not known in advance. Two
                complementary methods are used:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
                <li>
                  <strong>Elbow Method:</strong> Run K-Means for K = 2, 3, ...,
                  max_K. Plot total within-cluster sum of squares (inertia)
                  against K. The &quot;elbow&quot; -- the point where adding another
                  cluster yields diminishing improvement -- is the optimal K.
                  Mathematically, look for the K where the second derivative of
                  the inertia curve is maximized.
                </li>
                <li>
                  <strong>Silhouette Score:</strong> For each store, compute
                  how similar it is to its own cluster vs. the nearest other
                  cluster. Average across all stores to get the silhouette
                  score. Choose the K that maximizes this score. See the
                  dedicated section below for details.
                </li>
              </ul>
            </div>
          </div>

          <InfoCallout>
            <strong>K-Means++ Initialization:</strong> Standard K-Means
            randomly selects initial centroids, which can lead to poor solutions
            if the initial picks happen to be close together. K-Means++ solves
            this by selecting each subsequent centroid with probability
            proportional to the squared distance from the nearest existing
            centroid, ensuring well-spread starting points. This is the default
            in all modern implementations (scikit-learn, scipy).
          </InfoCallout>
        </DocSubSection>

        <DocSubSection title="Gaussian Mixture Models (GMM)">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Gaussian Mixture Models provide a probabilistic alternative to
            K-Means. Instead of assigning each store to exactly one cluster,
            GMM estimates the probability that each store belongs to each
            cluster. This is called &quot;soft clustering&quot; or &quot;soft assignment.&quot;
          </p>

          <div className="space-y-3 mt-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Model Formulation</p>
              <p className="text-sm text-muted-foreground">
                GMM assumes the data is generated by a mixture of K Gaussian
                (normal) distributions, each defined by a mean vector and
                covariance matrix:
              </p>
              <Formula>
                <div className="space-y-1">
                  <div>
                    P(x) = &Sigma;<sub>k=1</sub><sup>K</sup> &pi;
                    <sub>k</sub> &times; N(x | &mu;<sub>k</sub>, &Sigma;
                    <sub>k</sub>)
                  </div>
                  <div className="text-xs text-muted-foreground pt-2">
                    Where:
                    <br />
                    &nbsp;&nbsp;&pi;<sub>k</sub> = mixing proportion (prior
                    probability of cluster k)
                    <br />
                    &nbsp;&nbsp;&mu;<sub>k</sub> = mean vector of cluster k
                    <br />
                    &nbsp;&nbsp;&Sigma;<sub>k</sub> = covariance matrix of
                    cluster k
                  </div>
                </div>
              </Formula>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">
                Expectation-Maximization (EM) Algorithm
              </p>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
                <li>
                  <strong>E-Step (Expectation):</strong> For each store, compute
                  the posterior probability of belonging to each cluster given
                  the current parameter estimates. These are the &quot;responsibilities&quot;
                  -- the soft cluster assignments.
                </li>
                <li>
                  <strong>M-Step (Maximization):</strong> Update the mean,
                  covariance, and mixing proportions of each cluster to
                  maximize the expected log-likelihood, weighted by the
                  responsibilities from the E-step.
                </li>
                <li>
                  <strong>Repeat:</strong> Iterate E and M steps until the
                  log-likelihood converges (changes by less than a threshold).
                </li>
              </ol>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">
                Advantages Over K-Means
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
                <li>
                  <strong>Soft assignments:</strong> A store near the boundary
                  between two clusters gets a 60/40 probability split rather
                  than being forced into one. This is more realistic -- many
                  stores truly straddle two profiles.
                </li>
                <li>
                  <strong>Elliptical clusters:</strong> K-Means assumes
                  spherical clusters (equal variance in all directions). GMM
                  allows elliptical clusters with different variances and
                  correlations, better capturing real-world feature
                  relationships.
                </li>
                <li>
                  <strong>Uncertainty quantification:</strong> The assignment
                  probabilities directly quantify clustering uncertainty. A
                  store with 95/5 probabilities is confidently in one cluster;
                  a store with 55/45 probabilities is ambiguous and might
                  benefit from manual review.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">
                Model Selection: BIC and AIC
              </p>
              <p className="text-sm text-muted-foreground">
                To choose the optimal K for GMM, use information criteria:
              </p>
              <Formula>
                <div className="space-y-1">
                  <div>BIC = -2 &times; ln(L) + p &times; ln(n)</div>
                  <div>AIC = -2 &times; ln(L) + 2p</div>
                  <div className="text-xs text-muted-foreground pt-2">
                    Where L = maximized likelihood, p = number of parameters, n
                    = number of stores
                  </div>
                </div>
              </Formula>
              <p className="text-sm text-muted-foreground mt-2">
                Choose the K that minimizes BIC (preferred; penalizes complexity
                more heavily) or AIC. BIC tends to select simpler models
                (fewer clusters), which is typically desirable for
                operational feasibility.
              </p>
            </div>
          </div>
        </DocSubSection>

        <DocSubSection title="Dimensionality Reduction (PCA)">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Principal Component Analysis (PCA) is used for visualization, not
            for clustering itself. When the feature space has more than 2
            dimensions (which it always does in practice), PCA projects the
            data onto 2 principal components for scatter plot visualization.
          </p>

          <div className="rounded-lg border p-4 mt-3">
            <p className="text-sm font-medium mb-2">How PCA Works</p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
              <li>
                Center the standardized feature matrix (subtract the mean).
              </li>
              <li>
                Compute the covariance matrix of the centered features.
              </li>
              <li>
                Find the eigenvectors (principal components) and eigenvalues.
              </li>
              <li>
                Project the data onto the top 2 eigenvectors (PC1 and PC2).
              </li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Interpreting the PCA plot:</strong> PC1 (x-axis) captures
              the direction of maximum variance in the data; PC2 (y-axis) captures
              the second most variable direction, orthogonal to PC1. Stores that
              are close together on the PCA plot are similar across all features;
              stores that are far apart are dissimilar. Well-separated clusters on
              the PCA plot indicate strong clustering structure.
            </p>
          </div>

          <div className="rounded-lg border p-4 mt-3">
            <p className="text-sm font-medium mb-2">Explained Variance</p>
            <p className="text-sm text-muted-foreground">
              The explained variance ratio tells you how much of the total
              information is captured in the 2D projection. For example, if PC1
              explains 45% and PC2 explains 25%, the scatter plot captures 70%
              of the total variance. This is usually sufficient for visual
              interpretation. If the total explained variance is below 50%, the
              2D projection may be misleading and clusters may appear to overlap
              even when they are well-separated in higher dimensions.
            </p>
          </div>
        </DocSubSection>

        <DocSubSection title="Silhouette Score">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The silhouette score is the primary metric for evaluating cluster
            quality. For each store i, it measures how similar i is to its own
            cluster compared to the nearest other cluster:
          </p>
          <Formula>
            <div className="space-y-1">
              <div>s(i) = (b(i) - a(i)) / max(a(i), b(i))</div>
              <div className="text-xs text-muted-foreground pt-2">
                Where:
                <br />
                &nbsp;&nbsp;a(i) = average distance from i to all other stores
                in the same cluster
                <br />
                &nbsp;&nbsp;b(i) = average distance from i to all stores in the
                nearest other cluster
              </div>
            </div>
          </Formula>
          <p className="text-sm leading-relaxed text-muted-foreground mt-3">
            The overall silhouette score is the average s(i) across all stores:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Score Range</TableHead>
                <TableHead>Interpretation</TableHead>
                <TableHead className="w-[200px]">Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">0.71 - 1.00</TableCell>
                <TableCell>
                  Excellent structure. Clusters are well-separated and
                  internally cohesive.
                </TableCell>
                <TableCell>Confident in cluster assignments</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">0.51 - 0.70</TableCell>
                <TableCell>
                  Strong structure. Clear clustering pattern with some overlap at
                  boundaries.
                </TableCell>
                <TableCell>
                  Good for production use; review boundary stores
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">0.26 - 0.50</TableCell>
                <TableCell>
                  Reasonable structure. Clusters exist but with significant
                  overlap.
                </TableCell>
                <TableCell>
                  Acceptable; consider feature refinement or different K
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">0.00 - 0.25</TableCell>
                <TableCell>
                  Weak structure. Clusters are not meaningfully different from
                  random grouping.
                </TableCell>
                <TableCell>
                  Rethink features or clustering approach
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">&lt; 0.00</TableCell>
                <TableCell>
                  No structure. Stores are closer to other clusters than their
                  own -- assignments are wrong.
                </TableCell>
                <TableCell>Do not use; investigate data quality</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 4: Output Explanation */}
      {/* ================================================================== */}
      <DocSection id="cluster-output" title="4. Output Explanation">
        <DocSubSection title="Cluster Assignments">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The primary output is a mapping from each store to its assigned
            cluster. Each store receives:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Cluster ID:</strong> A numeric identifier (0, 1, 2, ...)
              for the assigned cluster.
            </li>
            <li>
              <strong>Cluster Name:</strong> A descriptive, human-readable
              label derived from the cluster&apos;s dominant characteristics (e.g.,
              &quot;High-Traffic Urban Premium&quot;, &quot;Rural Value-Focused&quot;, &quot;Suburban
              Balanced&quot;).
            </li>
            <li>
              <strong>Assignment Confidence (GMM only):</strong> The
              probability of the store belonging to the assigned cluster. High
              values (0.85+) indicate clear assignment; low values (0.5-0.6)
              indicate the store is on the boundary between two clusters and
              might warrant manual review.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Cluster Profiles">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Each cluster is characterized by a profile summarizing its key
            features:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Profile Element</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[220px]">Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Store Count</TableCell>
                <TableCell>
                  Number of stores in the cluster
                </TableCell>
                <TableCell>45 stores (18% of chain)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Avg Revenue</TableCell>
                <TableCell>
                  Average weekly category revenue per store in the cluster
                </TableCell>
                <TableCell>$8,500/week</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Revenue Share</TableCell>
                <TableCell>
                  Cluster&apos;s contribution to total chain category revenue
                </TableCell>
                <TableCell>32% of total revenue</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand Tier Mix</TableCell>
                <TableCell>
                  Percentage breakdown of sales by brand tier within the cluster
                </TableCell>
                <TableCell>
                  Premium 40%, National 35%, Store Brand 25%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dominant Format</TableCell>
                <TableCell>
                  The most common store format in the cluster
                </TableCell>
                <TableCell>Standard (72% of cluster stores)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Dominant Location
                </TableCell>
                <TableCell>
                  The most common location type in the cluster
                </TableCell>
                <TableCell>Urban (65% of cluster stores)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Avg Basket Size</TableCell>
                <TableCell>
                  Average category transaction value in the cluster
                </TableCell>
                <TableCell>$7.80</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Recommendations
                </TableCell>
                <TableCell>
                  Data-driven merchandising strategies based on the cluster
                  profile
                </TableCell>
                <TableCell>
                  &quot;Expand premium range; introduce premium craft options&quot;
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DocSubSection>

        <DocSubSection title="PCA Scatter Plot Interpretation">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The PCA scatter plot visualizes all stores in a 2D space, colored by
            cluster assignment. Key interpretation guidelines:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Well-separated clusters:</strong> Distinct, non-overlapping
              groups indicate strong clustering structure. The algorithm found
              genuinely different store profiles.
            </li>
            <li>
              <strong>Overlapping clusters:</strong> If two clusters blend
              together on the plot, their store profiles are similar. Consider
              merging them or using GMM for soft assignments at the boundary.
            </li>
            <li>
              <strong>Outlier stores:</strong> Stores far from any cluster
              center may have unusual characteristics. These warrant manual
              review -- they might be flagship stores, test locations, or
              data quality issues.
            </li>
            <li>
              <strong>Cluster size balance:</strong> Very unequal cluster sizes
              (e.g., one cluster with 90% of stores) suggest K may be too low or
              the features do not differentiate stores well. Aim for clusters
              that contain at least 10% of stores each.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Recommendations Per Cluster">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Based on each cluster&apos;s profile, the system generates actionable
            merchandising recommendations. Examples of cluster-specific
            strategies:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  Premium Urban
                </Badge>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Expand premium and craft brand assortment</li>
                <li>
                  Increase facings for specialty and artisanal products
                </li>
                <li>
                  Reduce store brand facings (shoppers in this cluster prefer
                  branded products)
                </li>
                <li>
                  Test higher price points -- shoppers are less price-sensitive
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Value-Focused
                </Badge>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Strengthen store brand representation with prominent
                  shelf placement
                </li>
                <li>Add large-format / family-size variants</li>
                <li>
                  Reduce premium SKUs that do not meet minimum velocity
                  thresholds
                </li>
                <li>
                  Emphasize everyday low price (EDLP) messaging in shelf tags
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  High-Traffic Suburban
                </Badge>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>
                  Maximize assortment breadth -- these stores have space and
                  traffic to support more SKUs
                </li>
                <li>
                  Ensure multi-pack and variety-pack options are available
                </li>
                <li>
                  Balanced tier mix reflecting the diverse shopper base
                </li>
                <li>
                  Prioritize replenishment -- high traffic drives high
                  velocity and out-of-stock risk
                </li>
              </ul>
            </div>
          </div>
        </DocSubSection>
      </DocSection>

      <Separator className="my-6" />

      {/* ================================================================== */}
      {/* SECTION 5: Industry Best Practices */}
      {/* ================================================================== */}
      <DocSection id="cluster-best-practices" title="5. Industry Best Practices">
        <DocSubSection title="Optimal Cluster Count">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The right number of clusters balances analytical granularity with
            operational feasibility:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Chain Size</TableHead>
                <TableHead>Recommended K</TableHead>
                <TableHead className="w-[240px]">Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Small (&lt;100 stores)
                </TableCell>
                <TableCell>3-4 clusters</TableCell>
                <TableCell>
                  Too many clusters with a small chain results in clusters with
                  too few stores to be statistically reliable
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Medium (100-500)
                </TableCell>
                <TableCell>4-6 clusters</TableCell>
                <TableCell>
                  Enough stores per cluster for robust profiles while capturing
                  meaningful differentiation
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Large (500-2000)
                </TableCell>
                <TableCell>5-8 clusters</TableCell>
                <TableCell>
                  Large chains have more heterogeneity; 5-8 clusters capture
                  the key segments without overwhelming operations teams
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Mega (&gt;2000)
                </TableCell>
                <TableCell>6-12 clusters</TableCell>
                <TableCell>
                  Largest chains (Walmart, Kroger) may use 8-12 clusters per
                  category, sometimes with hierarchical sub-clusters
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <InfoCallout>
            <strong>Operational Reality Check:</strong> Each cluster requires a
            distinct planogram, buying plan, and replenishment profile. If your
            operations team can only support 4 different assortments, do not
            create 8 clusters. The analytics must serve the operational capacity
            of the organization.
          </InfoCallout>
        </DocSubSection>

        <DocSubSection title="Feature Selection Best Practices">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Remove highly correlated pairs (r &gt; 0.85):</strong>{" "}
              When two features are nearly identical, they double-weight that
              dimension in the distance calculation. Check pairwise correlations
              and keep the feature that is more interpretable.
            </li>
            <li>
              <strong>Encode categorical variables:</strong> Store format
              (Express/Standard/Superstore) and location type
              (Urban/Suburban/Rural) must be numerically encoded. One-hot
              encoding works well for K-Means; ordinal encoding (1/2/3) works
              if the categories have a natural order.
            </li>
            <li>
              <strong>Normalize to the same scale:</strong> Always standardize
              features (z-score or min-max) before clustering. This ensures
              every feature contributes equally to the distance calculation.
            </li>
            <li>
              <strong>Test feature importance post-clustering:</strong> After
              clustering, examine which features differ most across clusters. If
              a feature has the same mean value in all clusters, it is not
              contributing to the segmentation and can be removed.
            </li>
          </ul>
        </DocSubSection>

        <DocSubSection title="Cluster Naming Convention">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Good cluster names are essential for organizational adoption.
            Clusters named &quot;Cluster 0, Cluster 1, Cluster 2&quot; mean nothing to a
            merchandising team. Use descriptive names that capture the dominant
            characteristics:
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Bad Name</TableHead>
                <TableHead>Good Name</TableHead>
                <TableHead className="w-[280px]">Naming Logic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Cluster 0</TableCell>
                <TableCell>High-Traffic Urban Premium</TableCell>
                <TableCell>
                  Dominant traffic (high), location (urban), tier preference
                  (premium)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cluster 1</TableCell>
                <TableCell>Suburban Family Value</TableCell>
                <TableCell>
                  Location (suburban), basket type (family/large), tier (value)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cluster 2</TableCell>
                <TableCell>Rural Essentials</TableCell>
                <TableCell>
                  Location (rural), assortment profile (limited, essential SKUs)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cluster 3</TableCell>
                <TableCell>Express Convenience</TableCell>
                <TableCell>
                  Format (express), mission type (convenience/immediate
                  consumption)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm leading-relaxed text-muted-foreground mt-2">
            The naming convention should follow a pattern:{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              [Traffic/Size] [Location] [Tier/Mission]
            </code>
            . Consistent naming helps merchandisers quickly understand what each
            cluster represents and makes cross-functional communication more
            effective.
          </p>
        </DocSubSection>

        <DocSubSection title="Cluster Refresh Cadence">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Store clusters are not static -- they should be refreshed
            periodically to reflect changing market conditions:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
            <li>
              <strong>Quarterly refresh:</strong> Recommended for fast-moving
              categories (CSD, snacks, personal care) where demand patterns
              shift with seasons and promotions. Each quarter, re-run the
              clustering on the most recent 13 weeks of data and compare to the
              previous clustering. If more than 15% of stores change clusters,
              the new clustering is meaningfully different and should be adopted.
            </li>
            <li>
              <strong>Semi-annual refresh:</strong> Appropriate for stable
              categories (cleaning supplies, canned goods) where demand patterns
              are less volatile. Align with major planning cycles (spring/fall
              resets).
            </li>
            <li>
              <strong>Triggered refresh:</strong> Re-cluster immediately after
              major events: store remodel, new store opening, market entry of a
              major competitor, significant demographic shift in the trade area,
              or acquisition of a new chain.
            </li>
          </ul>
          <WarningCallout>
            <strong>Stability vs. Responsiveness:</strong> Frequent re-clustering
            can cause &quot;cluster churn&quot; where stores bounce between clusters every
            quarter, creating confusion for field teams. To manage this, consider
            a stability threshold: only reassign a store if its probability of
            belonging to the new cluster is at least 20 percentage points higher
            than its current cluster (using GMM probabilities). This prevents
            noisy reassignments at the margins while allowing genuine shifts to
            propagate.
          </WarningCallout>
        </DocSubSection>

        <DocSubSection title="Actionable Strategies Per Cluster Type">
          <p className="text-sm leading-relaxed text-muted-foreground mb-3">
            The value of clustering is realized only when each cluster receives
            a differentiated strategy. Below is a framework for translating
            cluster profiles into merchandising actions:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Premium-Focused Clusters
              </p>
              <p className="text-sm text-muted-foreground">
                These clusters over-index on premium and specialty brands.
                Strategy: expand the premium assortment, introduce new craft
                and artisanal brands, allocate more facings to premium SKUs,
                test premium price points, position store brand as
                &quot;premium private label&quot; (not value). Space allocation: give
                premium tier 35-45% of total facings vs. the chain average of
                25%.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Value-Focused Clusters
              </p>
              <p className="text-sm text-muted-foreground">
                These clusters over-index on store brands and value products.
                Strategy: strengthen store brand breadth and depth, ensure
                competitive pricing on key value indicators (KVIs), emphasize
                larger pack sizes and multi-buy promotions, carefully curate
                premium offerings to only the highest-velocity items. Space
                allocation: store brand should occupy 30-40% of facings.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Balanced / Mainstream Clusters
              </p>
              <p className="text-sm text-muted-foreground">
                These clusters mirror the chain average across most dimensions.
                Strategy: use the national planogram as a starting point, with
                minor adjustments. Focus operational investment on the
                differentiated clusters (premium and value) and use mainstream
                clusters as the control group for assortment experiments.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-1">
                Small-Format / Convenience Clusters
              </p>
              <p className="text-sm text-muted-foreground">
                These clusters are defined by limited space (express format).
                Strategy: aggressive SKU rationalization (carry only the top
                15-20 SKUs), focus on immediate consumption formats (single
                serve, grab-and-go), maximize margin per facing rather than
                total category revenue, ensure 100% on-shelf availability for
                carried items (zero tolerance for out-of-stocks on a curated
                assortment).
              </p>
            </div>
          </div>

          <InfoCallout>
            <strong>Measuring Success:</strong> Track cluster-level KPIs
            (sales per linear foot, GMROI, out-of-stock rate) before and after
            implementing cluster-specific assortments. Expect 2-5% same-store
            sales lift in the first year, with the largest gains in the most
            differentiated clusters (premium and value). The mainstream cluster
            serves as a natural control group for measuring impact.
          </InfoCallout>
        </DocSubSection>
      </DocSection>
    </DocPage>
  );
}
