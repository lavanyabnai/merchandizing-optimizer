"""
What-If Simulation UI component for Streamlit app.
Provides Monte Carlo simulation interface for scenario analysis.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.simulation import (
    MonteCarloSimulator,
    SimulationConfig,
    SimulationResult,
    ScenarioType
)


def render_scenario_selector(
    products_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    store_id: Optional[int] = None
) -> dict:
    """
    Render scenario selection interface.

    Returns:
        Dictionary with scenario configuration
    """
    st.markdown("### Scenario Configuration")

    with st.expander("Understanding Scenarios", expanded=False):
        st.markdown("""
        **Available Scenario Types:**

        - **Remove SKU(s)**: Simulate delisting one or more products. The model calculates how much demand
          transfers to substitutes vs. is lost (walk-away).

        - **Add New SKU**: Simulate introducing a new product. You specify how much demand is truly
          incremental vs. cannibalized from existing products.

        - **Change Facings**: Simulate increasing or decreasing shelf space for a product.
          Uses space elasticity to estimate sales impact.

        - **Change Price**: Simulate price increases or decreases. Uses price elasticity to
          estimate volume and revenue impact.

        **Tip:** Start with "Remove SKU" to identify low-risk delisting candidates.
        """)

    scenario_type = st.selectbox(
        "Scenario Type",
        options=[
            ScenarioType.REMOVE_SKU.value,
            ScenarioType.ADD_SKU.value,
            ScenarioType.CHANGE_FACINGS.value,
            ScenarioType.CHANGE_PRICE.value
        ],
        format_func=lambda x: {
            'remove_sku': 'Remove SKU(s)',
            'add_sku': 'Add New SKU',
            'change_facings': 'Change Facings',
            'change_price': 'Change Price'
        }[x],
        help="Select the type of assortment change to simulate"
    )

    scenario_config = {'type': scenario_type}

    # Product selector (for all scenarios except add)
    if scenario_type != ScenarioType.ADD_SKU.value:
        product_options = products_df[['sku_id', 'name', 'brand', 'price']].copy()
        product_options['display'] = product_options.apply(
            lambda x: f"{x['name']} (${x['price']:.2f})", axis=1
        )

        if scenario_type == ScenarioType.REMOVE_SKU.value:
            selected_skus = st.multiselect(
                "Select SKUs to Remove",
                options=product_options['sku_id'].tolist(),
                format_func=lambda x: product_options[product_options['sku_id'] == x]['display'].iloc[0],
                help="Select one or more SKUs to simulate removal. Demand will transfer to similar products or be lost."
            )
            scenario_config['sku_ids'] = selected_skus

            if selected_skus:
                st.caption(f"Selected {len(selected_skus)} SKU(s) for removal analysis")

        elif scenario_type == ScenarioType.CHANGE_FACINGS.value:
            selected_sku = st.selectbox(
                "Select SKU",
                options=product_options['sku_id'].tolist(),
                format_func=lambda x: product_options[product_options['sku_id'] == x]['display'].iloc[0]
            )
            scenario_config['sku_id'] = selected_sku

            # Get current facings
            if store_id is not None:
                filtered_assort = assortment_df[assortment_df['store_id'] == store_id]
            else:
                filtered_assort = assortment_df

            current = filtered_assort[filtered_assort['sku_id'] == selected_sku]['current_facings'].mean()
            current = int(current) if not np.isnan(current) else 2

            st.markdown(f"**Current facings:** {current}")

            new_facings = st.slider(
                "New Facings",
                min_value=0,
                max_value=10,
                value=current,
                help="Set the new number of facings. More facings = more visibility = more sales, but with diminishing returns."
            )
            scenario_config['new_facings'] = new_facings
            scenario_config['current_facings'] = current

            if new_facings != current:
                change_pct = (new_facings - current) / max(current, 1) * 100
                st.caption(f"{'Increasing' if new_facings > current else 'Decreasing'} facings by {abs(change_pct):.0f}%")

        elif scenario_type == ScenarioType.CHANGE_PRICE.value:
            selected_sku = st.selectbox(
                "Select SKU",
                options=product_options['sku_id'].tolist(),
                format_func=lambda x: product_options[product_options['sku_id'] == x]['display'].iloc[0]
            )
            scenario_config['sku_id'] = selected_sku

            # Get current price
            current_price = products_df[products_df['sku_id'] == selected_sku]['price'].iloc[0]
            st.markdown(f"**Current price:** ${current_price:.2f}")

            new_price = st.slider(
                "New Price ($)",
                min_value=float(current_price * 0.5),
                max_value=float(current_price * 1.5),
                value=float(current_price),
                step=0.10,
                format="$%.2f",
                help="Simulate a price change. Price elasticity typically ranges from -1.5 to -2.5 for beverages."
            )
            scenario_config['new_price'] = new_price
            scenario_config['current_price'] = current_price

            if new_price != current_price:
                price_change_pct = (new_price - current_price) / current_price * 100
                st.caption(f"{'Price increase' if new_price > current_price else 'Price decrease'} of {abs(price_change_pct):.1f}%")

    else:  # Add SKU
        st.markdown("**New Product Attributes**")
        st.caption("Define the characteristics of the new product to simulate")

        col1, col2 = st.columns(2)

        with col1:
            new_name = st.text_input("Product Name", value="New Beverage Product")
            new_subcat = st.selectbox(
                "Subcategory",
                options=products_df['subcategory'].unique().tolist()
            )
            new_brand = st.selectbox(
                "Brand",
                options=products_df['brand'].unique().tolist()
            )
            new_brand_tier = products_df[products_df['brand'] == new_brand]['brand_tier'].iloc[0]

        with col2:
            new_price = st.number_input("Price ($)", min_value=0.50, max_value=50.0, value=5.99, step=0.50)
            new_margin = st.number_input("Margin ($)", min_value=0.10, max_value=20.0, value=1.50, step=0.25)
            new_size = st.selectbox("Size", options=products_df['size'].unique().tolist())

        incremental_pct = st.slider(
            "Incremental Demand %",
            min_value=10,
            max_value=60,
            value=30,
            help="Percentage of new product demand that is truly incremental (vs cannibalization). Lower values = more cannibalization of existing products."
        )

        st.info(f"""
        **Demand Split:** {incremental_pct}% incremental (new to category) + {100-incremental_pct}% cannibalized from similar products
        """)

        scenario_config['new_product'] = pd.Series({
            'name': new_name,
            'subcategory': new_subcat,
            'brand': new_brand,
            'brand_tier': new_brand_tier,
            'price': new_price,
            'margin': new_margin,
            'size': new_size,
            'price_tier': 'Value' if new_price < 3 else ('Mid' if new_price < 8 else 'Premium')
        })
        scenario_config['incremental_pct'] = incremental_pct / 100

    return scenario_config


def render_simulation_settings() -> SimulationConfig:
    """Render simulation parameter settings."""
    with st.expander("Simulation Settings", expanded=False):
        st.markdown("""
        **Monte Carlo Simulation Parameters**

        These settings control how the simulation generates random demand scenarios:
        """)

        col1, col2 = st.columns(2)

        with col1:
            n_trials = st.slider(
                "Number of Trials",
                min_value=1000,
                max_value=10000,
                value=5000,
                step=1000,
                help="Number of random demand scenarios to generate. More trials = more accurate confidence intervals but slower. 5,000 is usually sufficient."
            )

            demand_cv = st.slider(
                "Demand Uncertainty (CV)",
                min_value=0.05,
                max_value=0.30,
                value=0.15,
                step=0.05,
                help="Coefficient of variation (standard deviation / mean). Higher values = more uncertain demand. 0.15 is typical for beverages."
            )

        with col2:
            walk_rate = st.slider(
                "Walk-Away Rate",
                min_value=0.05,
                max_value=0.20,
                value=0.09,
                step=0.01,
                help="Probability that a customer leaves without buying if their preferred item is unavailable. Industry average is 8-12%."
            )

            seed = st.number_input(
                "Random Seed",
                min_value=1,
                max_value=9999,
                value=42,
                help="For reproducible results. Same seed = same random scenarios."
            )

        st.caption(f"Simulation will generate {n_trials:,} demand scenarios with {demand_cv:.0%} uncertainty")

    return SimulationConfig(
        n_trials=n_trials,
        demand_cv=demand_cv,
        walk_rate_mean=walk_rate,
        random_seed=seed
    )


def render_simulation_results(result: SimulationResult):
    """Render simulation results with visualizations."""
    st.markdown("### Simulation Results")
    st.caption("Results based on Monte Carlo simulation with demand uncertainty")

    st.info(f"**Scenario:** {result.scenario_description}")

    # Key metrics
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        delta_color = "normal" if result.revenue_change >= 0 else "inverse"
        st.metric(
            "Expected Revenue",
            f"${result.revenue_mean:,.0f}",
            delta=f"${result.revenue_change:+,.0f} ({result.revenue_change_pct:+.1f}%)",
            delta_color=delta_color,
            help="Average weekly revenue across all simulation trials"
        )

    with col2:
        delta_color = "normal" if result.profit_change >= 0 else "inverse"
        st.metric(
            "Expected Profit",
            f"${result.profit_mean:,.0f}",
            delta=f"${result.profit_change:+,.0f} ({result.profit_change_pct:+.1f}%)",
            delta_color=delta_color,
            help="Average weekly profit across all simulation trials"
        )

    with col3:
        st.metric(
            "P(Profit Increase)",
            f"{result.prob_positive_change:.1%}",
            delta=None,
            help="Probability that this scenario improves profit vs baseline. Higher is better - aim for >70%."
        )

    with col4:
        st.metric(
            "Revenue Std Dev",
            f"${result.revenue_std:,.0f}",
            help="Standard deviation of revenue outcomes. Higher = more uncertainty in the result."
        )

    st.divider()

    # Revenue histogram
    col1, col2 = st.columns(2)

    with col1:
        fig = go.Figure()

        fig.add_trace(go.Histogram(
            x=result.revenue_trials,
            nbinsx=50,
            name='Revenue Distribution',
            marker_color='#2E86AB',
            opacity=0.7
        ))

        # Add percentile lines
        fig.add_vline(x=result.revenue_p5, line_dash="dash", line_color="red",
                     annotation_text="5th %ile")
        fig.add_vline(x=result.revenue_p50, line_dash="solid", line_color="green",
                     annotation_text="Median")
        fig.add_vline(x=result.revenue_p95, line_dash="dash", line_color="red",
                     annotation_text="95th %ile")

        fig.update_layout(
            title='Revenue Distribution',
            xaxis_title='Weekly Revenue ($)',
            yaxis_title='Frequency',
            height=350,
            showlegend=False
        )

        st.plotly_chart(fig, use_container_width=True)

    with col2:
        fig = go.Figure()

        fig.add_trace(go.Histogram(
            x=result.profit_trials,
            nbinsx=50,
            name='Profit Distribution',
            marker_color='#28A745',
            opacity=0.7
        ))

        # Add percentile lines
        fig.add_vline(x=result.profit_p5, line_dash="dash", line_color="red",
                     annotation_text="5th %ile")
        fig.add_vline(x=result.profit_p50, line_dash="solid", line_color="green",
                     annotation_text="Median")
        fig.add_vline(x=result.profit_p95, line_dash="dash", line_color="red",
                     annotation_text="95th %ile")

        fig.update_layout(
            title='Profit Distribution',
            xaxis_title='Weekly Profit ($)',
            yaxis_title='Frequency',
            height=350,
            showlegend=False
        )

        st.plotly_chart(fig, use_container_width=True)

    # Confidence interval table
    st.markdown("### Confidence Intervals")
    st.caption("90% of outcomes fall between the 5th and 95th percentiles")

    ci_data = pd.DataFrame({
        'Metric': ['Revenue', 'Profit'],
        '5th Percentile': [f"${result.revenue_p5:,.0f}", f"${result.profit_p5:,.0f}"],
        'Median (50th)': [f"${result.revenue_p50:,.0f}", f"${result.profit_p50:,.0f}"],
        '95th Percentile': [f"${result.revenue_p95:,.0f}", f"${result.profit_p95:,.0f}"],
        '90% CI Width': [
            f"${result.revenue_p95 - result.revenue_p5:,.0f}",
            f"${result.profit_p95 - result.profit_p5:,.0f}"
        ]
    })

    st.dataframe(ci_data, hide_index=True, use_container_width=True)

    with st.expander("Understanding Confidence Intervals", expanded=False):
        st.markdown("""
        **How to interpret these numbers:**

        - **5th Percentile**: Worst-case scenario (only 5% of outcomes are worse than this)
        - **Median (50th)**: Most likely outcome (half of outcomes are above, half below)
        - **95th Percentile**: Best-case scenario (only 5% of outcomes are better than this)
        - **90% CI Width**: Range of uncertainty - narrower is more predictable

        **Decision guidance:**
        - If the 5th percentile is still positive, the scenario is low-risk
        - If median is positive but 5th percentile is negative, consider the risk tolerance
        - Wide CI width suggests high uncertainty - gather more data before deciding
        """)

    # Interpretation
    st.markdown("### Interpretation")

    if result.profit_change > 0:
        st.success(f"""
        This scenario is expected to **increase** weekly profit by ${result.profit_change:,.0f}
        ({result.profit_change_pct:+.1f}%). There is a {result.prob_positive_change:.0%} probability
        that profit will be higher than the current baseline.
        """)
    else:
        st.warning(f"""
        This scenario is expected to **decrease** weekly profit by ${abs(result.profit_change):,.0f}
        ({result.profit_change_pct:.1f}%). There is only a {result.prob_positive_change:.0%} probability
        of profit improvement.
        """)


def render_simulation_page(
    products_df: pd.DataFrame,
    sales_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """
    Render complete what-if simulation page.
    """
    st.subheader("What-If Simulation")

    with st.expander("About What-If Simulation", expanded=False):
        st.markdown("""
        **What is Monte Carlo Simulation?**

        Monte Carlo simulation is a technique that runs thousands of "what-if" scenarios
        with random demand variations to understand the range of possible outcomes.

        **Why use simulation instead of point estimates?**

        - **Accounts for uncertainty**: Demand is never perfectly predictable
        - **Shows risk**: See best-case, worst-case, and most-likely outcomes
        - **Informed decisions**: Know the probability of achieving your targets

        **How it works:**
        1. Define a scenario (e.g., remove a SKU)
        2. Simulation generates thousands of random demand scenarios
        3. For each scenario, calculate revenue/profit impact
        4. Aggregate results to show distribution of outcomes

        **Key outputs:**
        - **Expected value**: Average outcome across all trials
        - **Confidence intervals**: Range where 90% of outcomes fall
        - **Probability of success**: Likelihood of profit improvement
        """)

    st.markdown("""
    Use Monte Carlo simulation to evaluate the impact of assortment changes
    under demand uncertainty. Analyze scenarios like adding/removing SKUs,
    changing facings, or adjusting prices.
    """)

    # Scenario configuration
    scenario_config = render_scenario_selector(products_df, assortment_df, store_id)

    # Simulation settings
    sim_config = render_simulation_settings()

    st.divider()

    # Run simulation button
    run_button = st.button("Run Simulation", type="primary")

    if run_button:
        simulator = MonteCarloSimulator(sim_config)

        with st.spinner(f"Running {sim_config.n_trials:,} simulation trials..."):
            try:
                if scenario_config['type'] == ScenarioType.REMOVE_SKU.value:
                    if not scenario_config.get('sku_ids'):
                        st.error("Please select at least one SKU to remove")
                        return

                    result = simulator.simulate_remove_sku(
                        products=products_df,
                        sales_data=sales_df,
                        sku_ids_to_remove=scenario_config['sku_ids'],
                        store_id=store_id
                    )

                elif scenario_config['type'] == ScenarioType.ADD_SKU.value:
                    result = simulator.simulate_add_sku(
                        products=products_df,
                        sales_data=sales_df,
                        new_product=scenario_config['new_product'],
                        incremental_pct=scenario_config['incremental_pct'],
                        store_id=store_id
                    )

                elif scenario_config['type'] == ScenarioType.CHANGE_FACINGS.value:
                    result = simulator.simulate_change_facings(
                        products=products_df,
                        sales_data=sales_df,
                        assortment=assortment_df,
                        sku_id=scenario_config['sku_id'],
                        new_facings=scenario_config['new_facings'],
                        store_id=store_id
                    )

                elif scenario_config['type'] == ScenarioType.CHANGE_PRICE.value:
                    result = simulator.simulate_change_price(
                        products=products_df,
                        sales_data=sales_df,
                        sku_id=scenario_config['sku_id'],
                        new_price=scenario_config['new_price'],
                        store_id=store_id
                    )

                # Store and display results
                st.session_state['simulation_result'] = result
                st.divider()
                render_simulation_results(result)

            except Exception as e:
                st.error(f"Simulation error: {str(e)}")

    # Display previous results if available
    elif 'simulation_result' in st.session_state:
        st.divider()
        render_simulation_results(st.session_state['simulation_result'])
