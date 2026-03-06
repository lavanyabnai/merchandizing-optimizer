export interface ColumnConfig {
  key: string;
  label: string;
  required: boolean;
  type?: "string" | "number" | "boolean";
}

export interface UploadConfig {
  entityName: string;
  queryKey: string;
  columns: ColumnConfig[];
}

export const PRODUCT_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Products",
  queryKey: "assortment-db-products",
  columns: [
    { key: "sku", label: "SKU", required: true },
    { key: "name", label: "Name", required: true },
    { key: "brand", label: "Brand", required: true },
    { key: "brandTier", label: "Brand Tier", required: true },
    { key: "subcategory", label: "Subcategory", required: true },
    { key: "cost", label: "Cost", required: true, type: "number" },
    { key: "department", label: "Department", required: false },
    { key: "category", label: "Category", required: false },
    { key: "segment", label: "Segment", required: false },
    { key: "size", label: "Size", required: false },
    { key: "packType", label: "Pack Type", required: false },
    { key: "flavor", label: "Flavor", required: false },
    { key: "upc", label: "UPC", required: false },
    { key: "widthInches", label: "Width (inches)", required: false, type: "number" },
    { key: "heightInches", label: "Height (inches)", required: false, type: "number" },
    { key: "depthInches", label: "Depth (inches)", required: false, type: "number" },
    { key: "weightOz", label: "Weight (oz)", required: false, type: "number" },
    { key: "msrp", label: "MSRP", required: false, type: "number" },
    { key: "spaceElasticity", label: "Space Elasticity", required: false, type: "number" },
    { key: "priceElasticity", label: "Price Elasticity", required: false, type: "number" },
    { key: "shelfLife", label: "Shelf Life", required: false, type: "number" },
    { key: "minOrderQty", label: "Min Order Qty", required: false, type: "number" },
    { key: "casePackSize", label: "Case Pack Size", required: false, type: "number" },
    { key: "priceTier", label: "Price Tier", required: false },
    { key: "isActive", label: "Is Active", required: false, type: "boolean" },
  ],
};

export const STORE_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Stores",
  queryKey: "assortment-db-stores",
  columns: [
    { key: "storeCode", label: "Store Code", required: true },
    { key: "name", label: "Name", required: true },
    { key: "format", label: "Format", required: true },
    { key: "locationType", label: "Location Type", required: true },
    { key: "region", label: "Region", required: false },
    { key: "district", label: "District", required: false },
    { key: "state", label: "State", required: false },
    { key: "city", label: "City", required: false },
    { key: "zipCode", label: "Zip Code", required: false },
    { key: "latitude", label: "Latitude", required: false, type: "number" },
    { key: "longitude", label: "Longitude", required: false, type: "number" },
    { key: "incomeIndex", label: "Income Index", required: false },
    { key: "totalSquareFeet", label: "Total Square Feet", required: false, type: "number" },
    { key: "sellingSquareFeet", label: "Selling Square Feet", required: false, type: "number" },
    { key: "totalLinearFeet", label: "Total Linear Feet", required: false, type: "number" },
    { key: "totalFacings", label: "Total Facings", required: false, type: "number" },
    { key: "numShelves", label: "Number of Shelves", required: false, type: "number" },
    { key: "shelfWidthInches", label: "Shelf Width (inches)", required: false, type: "number" },
    { key: "weeklyTraffic", label: "Weekly Traffic", required: false, type: "number" },
    { key: "isActive", label: "Is Active", required: false, type: "boolean" },
  ],
};

export const SALES_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Sales",
  queryKey: "assortment-db-sales",
  columns: [
    { key: "productId", label: "Product ID", required: true, type: "number" },
    { key: "storeId", label: "Store ID", required: true, type: "number" },
    { key: "weekNumber", label: "Week Number", required: true, type: "number" },
    { key: "year", label: "Year", required: true, type: "number" },
    { key: "unitsSold", label: "Units Sold", required: true, type: "number" },
    { key: "revenue", label: "Revenue", required: true, type: "number" },
    { key: "costTotal", label: "Cost Total", required: false, type: "number" },
    { key: "profit", label: "Profit", required: false, type: "number" },
    { key: "facings", label: "Facings", required: false, type: "number" },
    { key: "onPromotion", label: "On Promotion", required: false, type: "boolean" },
    { key: "promotionType", label: "Promotion Type", required: false },
    { key: "promotionDiscount", label: "Promotion Discount", required: false, type: "number" },
  ],
};

export const HIERARCHY_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Hierarchy",
  queryKey: "assortment-db-hierarchy",
  columns: [
    { key: "department", label: "Department", required: true },
    { key: "category", label: "Category", required: true },
    { key: "subcategory", label: "Subcategory", required: true },
    { key: "segment", label: "Segment", required: false },
    { key: "level", label: "Level", required: true, type: "number" },
  ],
};

export const PRICING_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Pricing",
  queryKey: "assortment-db-pricing",
  columns: [
    { key: "productId", label: "Product ID", required: true, type: "number" },
    { key: "storeId", label: "Store ID", required: false, type: "number" },
    { key: "regularPrice", label: "Regular Price", required: true, type: "number" },
    { key: "currentPrice", label: "Current Price", required: true, type: "number" },
    { key: "minPrice", label: "Min Price", required: false, type: "number" },
    { key: "maxPrice", label: "Max Price", required: false, type: "number" },
    { key: "competitorPrice", label: "Competitor Price", required: false, type: "number" },
    { key: "priceZone", label: "Price Zone", required: false },
    { key: "effectiveDate", label: "Effective Date", required: false },
    { key: "endDate", label: "End Date", required: false },
  ],
};

export const INVENTORY_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Inventory",
  queryKey: "assortment-db-inventory",
  columns: [
    { key: "productId", label: "Product ID", required: true, type: "number" },
    { key: "storeId", label: "Store ID", required: true, type: "number" },
    { key: "onHandQty", label: "On Hand Qty", required: true, type: "number" },
    { key: "onOrderQty", label: "On Order Qty", required: false, type: "number" },
    { key: "inTransitQty", label: "In Transit Qty", required: false, type: "number" },
    { key: "avgWeeklySales", label: "Avg Weekly Sales", required: false, type: "number" },
    { key: "weeksOfSupply", label: "Weeks of Supply", required: false, type: "number" },
    { key: "reorderPoint", label: "Reorder Point", required: false, type: "number" },
    { key: "safetyStock", label: "Safety Stock", required: false, type: "number" },
    { key: "snapshotDate", label: "Snapshot Date", required: true },
  ],
};

export const CUSTOMER_SEGMENT_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Customer Segments",
  queryKey: "assortment-db-customers",
  columns: [
    { key: "segmentName", label: "Segment Name", required: true },
    { key: "description", label: "Description", required: false },
    { key: "avgBasketSize", label: "Avg Basket Size", required: false, type: "number" },
    { key: "avgTransactionValue", label: "Avg Transaction Value", required: false, type: "number" },
    { key: "visitFrequency", label: "Visit Frequency", required: false, type: "number" },
    { key: "priceElasticity", label: "Price Elasticity", required: false, type: "number" },
    { key: "promotionSensitivity", label: "Promotion Sensitivity", required: false, type: "number" },
    { key: "preferredBrandTier", label: "Preferred Brand Tier", required: false },
    { key: "storeCount", label: "Store Count", required: false, type: "number" },
    { key: "totalRevenue", label: "Total Revenue", required: false, type: "number" },
    { key: "revenueShare", label: "Revenue Share", required: false, type: "number" },
  ],
};

export const SPACE_UPLOAD_CONFIG: UploadConfig = {
  entityName: "Space Allocation",
  queryKey: "assortment-db-space",
  columns: [
    { key: "productId", label: "Product ID", required: true, type: "number" },
    { key: "storeId", label: "Store ID", required: true, type: "number" },
    { key: "facings", label: "Facings", required: true, type: "number" },
    { key: "shelfNumber", label: "Shelf Number", required: false, type: "number" },
    { key: "positionOnShelf", label: "Position on Shelf", required: false, type: "number" },
    { key: "depth", label: "Depth", required: false, type: "number" },
    { key: "orientation", label: "Orientation", required: false },
    { key: "linearInches", label: "Linear Inches", required: false, type: "number" },
    { key: "isActive", label: "Is Active", required: false, type: "boolean" },
  ],
};
