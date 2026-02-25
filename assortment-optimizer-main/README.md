# FMCG Assortment Advisor

A Streamlit-based demo application for optimizing retail beverage category assortments. This tool helps category managers make data-driven decisions about product selection, shelf space allocation, and store-specific strategies.

## Features

### 📊 Dashboard
- KPI cards with tooltips (Revenue, Profit, GMROI, SKU count)
- Weekly sales trend analysis
- Top performers by revenue/profit/units
- Category mix and brand tier performance

### 🌳 Consumer Decision Tree (CDT) Analysis
- Interactive sunburst visualization of category hierarchy
- Attribute importance showing shopper decision factors
- Switching behavior analysis (what happens when items are out of stock)
- Brand substitution patterns

### ⚙️ Assortment Optimizer
- Constraint-based optimization (space, coverage, brand limits)
- Must-carry and exclude lists
- Before/after comparison with profit lift calculation
- Category-level space reallocation insights

### 🎲 What-If Simulation
- Monte Carlo simulation with demand uncertainty
- Scenarios: Remove SKU, Add SKU, Change Facings, Change Price
- Confidence intervals and probability of success
- Risk assessment for assortment changes

### 🏪 Store Clustering
- K-Means and GMM clustering methods
- Automatic optimal K selection
- Cluster profiles and characteristics
- Tailored assortment recommendations per cluster

### 📐 Visual Planogram
- Interactive shelf visualization
- Color-coded by subcategory and brand tier
- Space utilization metrics
- Adjustable shelf configuration

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/assortment-optimizer.git
cd assortment-optimizer

# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
```

## Requirements

- Python 3.8+
- Streamlit 1.28+
- Pandas, NumPy, Plotly
- Scikit-learn, SciPy

## Data

The app generates synthetic beverage category data including:
- 80 SKUs across 4 subcategories (Soft Drinks, Juices, Water, Energy Drinks)
- 25 stores with different formats and demographics
- 52 weeks of simulated sales with seasonality

## Usage

1. **Select a store** from the sidebar (or view all stores)
2. **Navigate tabs** to explore different analyses
3. **Run optimizations** to find profit-maximizing assortments
4. **Simulate scenarios** to evaluate potential changes
5. **Cluster stores** to develop segment-specific strategies

## License

MIT License

---

Built with [Streamlit](https://streamlit.io) | Powered by Claude Code
