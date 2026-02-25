"""
Synthetic data generator for Beverages category.
Generates 80 SKUs across 4 subcategories, 25 stores, and 52 weeks of sales data.
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict
from functools import lru_cache


def _set_seed(seed: int = 42):
    """Set random seed for reproducibility."""
    np.random.seed(seed)


def generate_products(seed: int = 42) -> pd.DataFrame:
    """
    Generate 80 beverage SKUs across 4 subcategories.

    Returns:
        DataFrame with columns: sku_id, name, subcategory, brand, brand_tier,
        size, size_oz, price, price_tier, flavor, pack_type, pack_count,
        cost, margin, width_inches, min_facings, max_facings, space_elasticity
    """
    _set_seed(seed)

    # Define subcategories and their brands
    subcategories = {
        'Soft Drinks': {
            'brands': ['Coca-Cola', 'Pepsi', 'Dr Pepper', 'Store Brand'],
            'brand_tiers': ['National A', 'National A', 'National B', 'Store Brand'],
            'flavors': ['Original', 'Diet', 'Zero Sugar', 'Cherry', 'Vanilla'],
            'space_elasticity': 0.15
        },
        'Juices': {
            'brands': ['Tropicana', 'Minute Maid', 'Simply', 'Store Brand'],
            'brand_tiers': ['National A', 'National A', 'National B', 'Store Brand'],
            'flavors': ['Orange', 'Apple', 'Grape', 'Fruit Punch', 'Cranberry'],
            'space_elasticity': 0.18
        },
        'Water': {
            'brands': ['Aquafina', 'Dasani', 'Evian', 'Store Brand'],
            'brand_tiers': ['National A', 'National A', 'Premium', 'Store Brand'],
            'flavors': ['Plain', 'Lemon', 'Lime', 'Berry'],
            'space_elasticity': 0.10
        },
        'Energy Drinks': {
            'brands': ['Red Bull', 'Monster', 'Rockstar', 'Store Brand'],
            'brand_tiers': ['Premium', 'National A', 'National B', 'Store Brand'],
            'flavors': ['Original', 'Sugar Free', 'Tropical', 'Berry Blast'],
            'space_elasticity': 0.25
        }
    }

    # Define sizes and pack types
    sizes = {
        '12oz': {'oz': 12, 'width': 2.5},
        '20oz': {'oz': 20, 'width': 3.0},
        '1L': {'oz': 33.8, 'width': 3.5},
        '2L': {'oz': 67.6, 'width': 4.5},
    }

    pack_types = {
        'Single': {'count': 1, 'width_mult': 1.0},
        '6-pack': {'count': 6, 'width_mult': 2.5},
        '12-pack': {'count': 12, 'width_mult': 4.0},
        '24-pack': {'count': 24, 'width_mult': 6.0},
    }

    products = []
    sku_id = 1

    for subcat, config in subcategories.items():
        for brand_idx, brand in enumerate(config['brands']):
            brand_tier = config['brand_tiers'][brand_idx]

            # Determine base price multiplier by brand tier
            tier_price_mult = {
                'Premium': 1.4,
                'National A': 1.2,
                'National B': 1.0,
                'Store Brand': 0.7
            }[brand_tier]

            # Generate 5 SKUs per brand (20 per subcategory = 80 total)
            num_skus = 5
            for i in range(num_skus):
                # Randomly select attributes
                size_name = np.random.choice(list(sizes.keys()))
                size_info = sizes[size_name]

                # Pack type distribution: more singles and 6-packs
                pack_probs = [0.4, 0.3, 0.2, 0.1]
                pack_name = np.random.choice(list(pack_types.keys()), p=pack_probs)
                pack_info = pack_types[pack_name]

                flavor = np.random.choice(config['flavors'])

                # Calculate price based on size, pack, and brand tier
                base_price_per_oz = 0.08  # Base price per oz
                price = (base_price_per_oz * size_info['oz'] * pack_info['count'] *
                        tier_price_mult * (1 + np.random.uniform(-0.1, 0.1)))
                price = round(price, 2)

                # Determine price tier
                if price < 3:
                    price_tier = 'Value'
                elif price < 8:
                    price_tier = 'Mid'
                else:
                    price_tier = 'Premium'

                # Cost and margin
                margin_pct = np.random.uniform(0.25, 0.40) if brand_tier != 'Store Brand' else np.random.uniform(0.35, 0.50)
                cost = round(price * (1 - margin_pct), 2)

                # Physical dimensions
                width = round(size_info['width'] * pack_info['width_mult'], 1)

                # Generate product name
                name = f"{brand} {flavor} {size_name}"
                if pack_info['count'] > 1:
                    name += f" {pack_name}"

                products.append({
                    'sku_id': sku_id,
                    'name': name,
                    'subcategory': subcat,
                    'brand': brand,
                    'brand_tier': brand_tier,
                    'size': size_name,
                    'size_oz': size_info['oz'],
                    'price': price,
                    'price_tier': price_tier,
                    'flavor': flavor,
                    'pack_type': pack_name,
                    'pack_count': pack_info['count'],
                    'cost': cost,
                    'margin': round(price - cost, 2),
                    'margin_pct': round(margin_pct, 3),
                    'width_inches': width,
                    'min_facings': 1,
                    'max_facings': 6,
                    'space_elasticity': config['space_elasticity']
                })
                sku_id += 1

    return pd.DataFrame(products)


def generate_stores(seed: int = 42) -> pd.DataFrame:
    """
    Generate 25 stores with various attributes.

    Returns:
        DataFrame with columns: store_id, name, format, location, income_index,
        weekly_traffic, shelf_sections, total_facings
    """
    _set_seed(seed)

    formats = ['Express', 'Standard', 'Superstore']
    format_weights = [0.2, 0.5, 0.3]

    locations = ['Urban', 'Suburban', 'Rural']
    location_weights = [0.3, 0.5, 0.2]

    income_levels = ['Low', 'Medium', 'High']

    stores = []
    for i in range(1, 26):
        store_format = np.random.choice(formats, p=format_weights)
        location = np.random.choice(locations, p=location_weights)

        # Income index correlated with location
        if location == 'Urban':
            income_probs = [0.2, 0.4, 0.4]
        elif location == 'Suburban':
            income_probs = [0.2, 0.5, 0.3]
        else:
            income_probs = [0.4, 0.4, 0.2]
        income = np.random.choice(income_levels, p=income_probs)

        # Traffic based on format and location
        base_traffic = {'Express': 3000, 'Standard': 8000, 'Superstore': 15000}[store_format]
        location_mult = {'Urban': 1.2, 'Suburban': 1.0, 'Rural': 0.7}[location]
        traffic = int(base_traffic * location_mult * np.random.uniform(0.8, 1.2))

        # Shelf space based on format
        sections = {'Express': 2, 'Standard': 4, 'Superstore': 6}[store_format]
        facings_per_section = 30  # 48" sections with ~1.5" average product width

        stores.append({
            'store_id': i,
            'name': f"Store #{i:03d}",
            'format': store_format,
            'location': location,
            'income_index': income,
            'weekly_traffic': traffic,
            'shelf_sections': sections,
            'total_facings': sections * facings_per_section
        })

    return pd.DataFrame(stores)


def generate_sales_data(products: pd.DataFrame, stores: pd.DataFrame,
                        weeks: int = 52, seed: int = 42) -> pd.DataFrame:
    """
    Generate 52 weeks of simulated weekly sales data with seasonality.

    Args:
        products: Products DataFrame from generate_products()
        stores: Stores DataFrame from generate_stores()
        weeks: Number of weeks to simulate

    Returns:
        DataFrame with columns: store_id, sku_id, week, units_sold, revenue, profit
    """
    _set_seed(seed)

    sales_records = []

    # Seasonality pattern (summer peak for beverages)
    seasonality = np.array([
        0.8, 0.8, 0.85, 0.9, 0.95, 1.0,  # Jan-Jun (winter to spring)
        1.15, 1.2, 1.15, 1.0, 0.9, 0.85  # Jul-Dec (summer peak, fall decline)
    ])
    # Repeat for 52 weeks
    week_seasonality = np.tile(seasonality, 5)[:weeks]

    for _, store in stores.iterrows():
        store_id = store['store_id']
        traffic_factor = store['weekly_traffic'] / 8000  # Normalize to standard store

        # Income affects premium product sales
        income_premium_mult = {'Low': 0.7, 'Medium': 1.0, 'High': 1.4}[store['income_index']]
        income_value_mult = {'Low': 1.3, 'Medium': 1.0, 'High': 0.8}[store['income_index']]

        for _, product in products.iterrows():
            sku_id = product['sku_id']

            # Base weekly units based on brand tier and pack type
            tier_base = {
                'Premium': 15, 'National A': 25, 'National B': 20, 'Store Brand': 18
            }[product['brand_tier']]

            pack_mult = {
                'Single': 1.5, '6-pack': 1.0, '12-pack': 0.7, '24-pack': 0.4
            }[product['pack_type']]

            # Price tier adjustment
            if product['price_tier'] == 'Premium':
                price_mult = income_premium_mult
            elif product['price_tier'] == 'Value':
                price_mult = income_value_mult
            else:
                price_mult = 1.0

            base_units = tier_base * pack_mult * traffic_factor * price_mult

            for week in range(1, weeks + 1):
                # Apply seasonality
                seasonal_units = base_units * week_seasonality[week - 1]

                # Add random variation (CV = 0.15)
                units = max(0, int(np.random.normal(seasonal_units, seasonal_units * 0.15)))

                revenue = round(units * product['price'], 2)
                profit = round(units * product['margin'], 2)

                sales_records.append({
                    'store_id': store_id,
                    'sku_id': sku_id,
                    'week': week,
                    'units_sold': units,
                    'revenue': revenue,
                    'profit': profit
                })

    return pd.DataFrame(sales_records)


def generate_current_assortment(products: pd.DataFrame, stores: pd.DataFrame,
                                seed: int = 42) -> pd.DataFrame:
    """
    Generate current assortment with facings for each store.

    Returns:
        DataFrame with columns: store_id, sku_id, current_facings, is_listed
    """
    _set_seed(seed)

    assortment_records = []

    for _, store in stores.iterrows():
        store_id = store['store_id']
        total_facings = store['total_facings']

        # Determine how many SKUs to list (60-80% of catalog)
        num_skus = int(len(products) * np.random.uniform(0.6, 0.8))
        listed_skus = products.sample(n=num_skus)['sku_id'].tolist()

        # Allocate facings
        remaining_facings = total_facings
        facings_per_sku = {}

        for sku_id in listed_skus:
            product = products[products['sku_id'] == sku_id].iloc[0]
            # Higher-tier brands get more facings
            tier_facings = {
                'Premium': 3, 'National A': 3, 'National B': 2, 'Store Brand': 2
            }[product['brand_tier']]

            facings = min(tier_facings + np.random.randint(-1, 2),
                         product['max_facings'],
                         remaining_facings)
            facings = max(facings, product['min_facings'])

            if remaining_facings >= facings:
                facings_per_sku[sku_id] = facings
                remaining_facings -= facings

        # Record all SKUs (listed and not listed)
        for _, product in products.iterrows():
            sku_id = product['sku_id']
            is_listed = sku_id in facings_per_sku
            current_facings = facings_per_sku.get(sku_id, 0)

            assortment_records.append({
                'store_id': store_id,
                'sku_id': sku_id,
                'current_facings': current_facings,
                'is_listed': is_listed
            })

    return pd.DataFrame(assortment_records)


def generate_switching_matrix(seed: int = 42) -> pd.DataFrame:
    """
    Generate consumer switching behavior matrix.
    Based on research: 27% switch variety, 23% switch size, 20% switch brand, 8-10% walk away.

    Returns:
        DataFrame with switching probabilities between attributes
    """
    _set_seed(seed)

    # Switching behaviors when preferred item unavailable
    switching_data = {
        'switch_type': ['Same Brand, Different Flavor', 'Same Brand, Different Size',
                       'Different Brand, Same Subcategory', 'Different Subcategory',
                       'Walk Away (Leave Category)'],
        'probability': [0.27, 0.23, 0.20, 0.21, 0.09],
        'description': [
            'Customer stays with preferred brand but chooses different flavor',
            'Customer stays with preferred brand but chooses different size',
            'Customer switches to competitor brand within same subcategory',
            'Customer switches to different beverage type entirely',
            'Customer leaves without purchasing from category'
        ]
    }

    return pd.DataFrame(switching_data)


def generate_attribute_importance(seed: int = 42) -> pd.DataFrame:
    """
    Generate attribute importance for Consumer Decision Tree.

    Returns:
        DataFrame with attribute importance scores
    """
    return pd.DataFrame({
        'attribute': ['Subcategory', 'Brand', 'Size', 'Price'],
        'importance': [0.36, 0.28, 0.21, 0.15],
        'description': [
            'Shoppers first decide beverage type (soft drink, juice, etc.)',
            'Brand preference drives selection within subcategory',
            'Size/pack configuration based on occasion',
            'Price sensitivity as final decision factor'
        ]
    })


@lru_cache(maxsize=1)
def load_all_data(seed: int = 42) -> Dict[str, pd.DataFrame]:
    """
    Load all synthetic data. Results are cached for performance.

    Returns:
        Dictionary with keys: products, stores, sales, assortment,
        switching_matrix, attribute_importance
    """
    products = generate_products(seed)
    stores = generate_stores(seed)
    sales = generate_sales_data(products, stores, seed=seed)
    assortment = generate_current_assortment(products, stores, seed)
    switching = generate_switching_matrix(seed)
    importance = generate_attribute_importance(seed)

    return {
        'products': products,
        'stores': stores,
        'sales': sales,
        'assortment': assortment,
        'switching_matrix': switching,
        'attribute_importance': importance
    }


if __name__ == "__main__":
    # Test data generation
    data = load_all_data()
    print("Products:", len(data['products']), "SKUs")
    print("Stores:", len(data['stores']), "stores")
    print("Sales records:", len(data['sales']))
    print("Assortment records:", len(data['assortment']))
    print("\nSample products:")
    print(data['products'].head(10))
