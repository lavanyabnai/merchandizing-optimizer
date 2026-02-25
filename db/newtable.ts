import { Message } from 'ai';
import { InferSelectModel, relations, sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  integer,
  serial,
  index,
  numeric,
  uniqueIndex,
  doublePrecision,
  boolean,
  decimal,
  date,
  primaryKey,
  unique,
  check
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  messages: json('messages').notNull(),
  userId: varchar('userId', { length: 64 }).notNull()
});

export type Chat = Omit<InferSelectModel<typeof chat>, 'messages'> & {
  messages: Array<Message>;
};

export const customers = pgTable(
  'customers',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(), // pk
    type: varchar('type', { length: 100 }).default('Customer'),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id,{ onDelete: 'cascade' }),
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull(),
    additionalParams: integer('additional_params'),
    icon: varchar('icon', { length: 255 }).default('default_icon'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => {
    return {
      inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude', 'Consider'))))`
    };
  }
);

export const insertCustomerSchema = createInsertSchema(customers);

export const locations = pgTable(
  'locations',
  {
    id: serial('id'),
    code: varchar('code', { length: 20 }),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),// pk
    city: varchar('city', { length: 255 }),
    region: varchar('region', { length: 255 }),
    country: varchar('country', { length: 255 }).notNull(),
    address: text('address'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    autofillCoordinates: boolean('autofill_coordinates').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    nameIdx: index('idx_location_name').on(table.name),
    cityIdx: index('idx_location_city').on(table.city),
    countryIdx: index('idx_location_country').on(table.country),
    latLongIdx: index('idx_location_lat_long').on(
      table.latitude,
      table.longitude
    ),
    uniqueNameCountryIdx: uniqueIndex('idx_location_name_country')
      .on(table.name, table.country)
      .where(sql`${table.autofillCoordinates} IS TRUE`)
  })
);

export const insertLocationSchema = createInsertSchema(locations);

export const cogNewLocations = pgTable(
  'cog_new_locations',
  {
    id: serial('id'),
    code: varchar('code', { length: 20 }),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),// pk
    city: varchar('city', { length: 255 }),
    region: varchar('region', { length: 255 }),
    country: varchar('country', { length: 255 }),
    address: text('address'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    nameIdx: index('idx_cog_location_name').on(table.name),
    cityIdx: index('idx_cog_location_city').on(table.city),
    countryIdx: index('idx_cog_location_country').on(table.country),
    latLongIdx: index('idx_cog_location_lat_long').on(
      table.latitude,
      table.longitude
    )
  })
);

export const insertCogNewLocationSchema = createInsertSchema(cogNewLocations);

export const demandCoverageByDistances = pgTable(
  'demand_coverage_by_distances',
  {
    id: serial('id'),
    siteId: integer('site_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    // Foreign key to Facilities table
    siteName: varchar('site_name', { length: 255 }).primaryKey(), // Site name // pk
    distanceToSiteKm: decimal('distance_to_site_km', {
      precision: 10,
      scale: 2
    }), // Distance to the site in kilometers
    demandPercentage: decimal('demand_percentage', { precision: 8, scale: 2 }), // Demand to satisfy expressed in percentage
    demandM3: decimal('demand_m3', { precision: 15, scale: 2 }), // Demand to satisfy expressed in cubic meters
    updatedAt: timestamp('updated_at').defaultNow() // Timestamp for when the data was last updated
  },
  (table) => ({
    idxDemandCoverageByDistanceSite: index(
      'idx_demand_coverage_by_distance_site'
    ).on(table.siteId) // Index for faster querying by site_id
  })
);

export const insertDemandCoverageByDistanceSchema = createInsertSchema(
  demandCoverageByDistances
);

export const distanceCoverageByDemands = pgTable(
  'distance_coverage_by_demands',
  {
    id: serial('id'),
    siteId: integer('site_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    siteName: varchar('site_name', { length: 255 }).primaryKey(), // Site name // pk
    demandPercentage: decimal('demand_percentage', { precision: 8, scale: 2 }), // Demand to satisfy expressed in percentage
    demandM3: decimal('demand_m3', { precision: 15, scale: 2 }), // Demand to satisfy expressed in cubic meters
    distanceToSiteKm: decimal('distance_to_site_km', {
      precision: 10,
      scale: 2
    }), // Distance to the site in kilometers
    updatedAt: timestamp('updated_at').defaultNow() // Timestamp for when the data was last updated
  },
  (table) => ({
    idxDistanceCoverageByDemandSite: index(
      'idx_distance_coverage_by_demand_site'
    ).on(table.siteId) // Index for faster querying by site_id
  })
);

export const insertDistanceCoverageByDemandSchema = createInsertSchema(
  distanceCoverageByDemands
);

export const facilities = pgTable(
  'facilities',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(), // pk
    type: varchar('type', { length: 100 }).default('DC'),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id ,{ onDelete: 'cascade' }),
    initiallyOpen: boolean('initially_open').default(true),
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull(),
    capacity: integer('capacity'),
    capacityUnit: varchar('capacity_unit', { length: 50 }),
    aggregateOrdersByLocation: boolean('aggregate_orders_by_location').default(
      false
    ),
    additionalParams: integer('additional_params'),
    icon: varchar('icon', { length: 255 }).default('default_icon'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude', 'Consider'))`,
    nameInclusionTypeIdx: index('idx_facilities_name_inclusion_type').on(
      table.name,
      table.inclusionType
    )
  })
);

export const insertFacilitySchema = createInsertSchema(facilities);

export const demandFulfillment = pgTable(
  'demand_fulfillment',
  {
    id: serial('id').primaryKey(), // Unique identifier for each record
    iteration: integer('iteration').notNull(), // Iteration number of the solution
    period: integer('period').notNull(), // Time period for the data collection
    customerId: integer('customer_id').references(() => customers.id , { onDelete: 'cascade' }), // Foreign key to Customers table
    productId: integer('product_id').references(() => products.id , { onDelete: 'cascade' }), // Foreign key to Products table
    unit: varchar('unit', { length: 50 }).notNull(), // Measurement unit for the product
    demandMin: decimal('demand_min', { precision: 15, scale: 2 }), // Minimum demand level
    demandMax: decimal('demand_max', { precision: 15, scale: 2 }), // Maximum demand level
    satisfied: decimal('satisfied', { precision: 15, scale: 2 }), // Amount of satisfied demand
    percentage: decimal('percentage', { precision: 5, scale: 2 }), // Percentage of satisfied demand
    revenuePerItem: decimal('revenue_per_item', { precision: 15, scale: 2 }), // Revenue per product item
    revenueTotal: decimal('revenue_total', { precision: 15, scale: 2 }), // Total revenue for the period
    underCost: decimal('under_cost', { precision: 15, scale: 2 }), // Penalty for violating Demand Min
    overCost: decimal('over_cost', { precision: 15, scale: 2 }), // Penalty for violating Demand Max
    penalty: decimal('penalty', { precision: 15, scale: 2 }) // Total penalties for the period
  },
  (table) => ({
    idxDemandFulfillmentCustomer: index('idx_demand_fulfillment_customer').on(
      table.customerId
    ), // Index for customer
    idxDemandFulfillmentProduct: index('idx_demand_fulfillment_product').on(
      table.productId
    ), // Index for product
    idxDemandFulfillmentIteration: index('idx_demand_fulfillment_iteration').on(
      table.iteration
    ), // Index for iteration
    idxDemandFulfillmentPeriod: index('idx_demand_fulfillment_period').on(
      table.period
    ) // Index for period
  })
);
export const insertDemandFulfillmentSchema =
  createInsertSchema(demandFulfillment);



export const demand = pgTable(
  'demand',
  {
    id: serial('id'),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }),
    demandType: varchar('demand_type', { length: 100 }).notNull(),
    parameters: integer('parameters'),
    revenue: decimal('revenue', { precision: 10, scale: 2 }),
    downPenalty: decimal('down_penalty', { precision: 10, scale: 2 }).default(
      '0'
    ),
    upPenalty: decimal('up_penalty', { precision: 10, scale: 2 }).default('0'),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    expectedLeadTime: decimal('expected_lead_time', { precision: 5, scale: 2 }),
    timeUnit: varchar('time_unit', { length: 50 }),
    minSplitRatio: decimal('min_split_ratio', {
      precision: 3,
      scale: 2
    }).default('1.0'),
    backorderPolicy: varchar('backorder_policy', { length: 20 }).default(
      'Not Allowed'
    ),
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.customerId, table.productId, table.timePeriodId] }),
    demandTypeCheck: sql`CHECK (${table.demandType} IN ('Periodic demand', 'Periodic demand with first occurrence', 'Historic demand'))`,
    minSplitRatioCheck: sql`CHECK (${table.minSplitRatio} > 0 AND ${table.minSplitRatio} < 1)`,
    backorderPolicyCheck: sql`CHECK (${table.backorderPolicy} IN ('Not Allowed', 'Allowed Total'))`,
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`,
    customerProductInclusionIdx: index(
      'idx_demand_customer_product_inclusion'
    ).on(table.customerId, table.productId, table.inclusionType)
  })
);

export const insertDemandSchema = createInsertSchema(demand);

// Groups table
export const groups = pgTable('groups', {
  id: serial('id'),
  name: varchar('name', { length: 255 }).notNull().unique().primaryKey(), //pk
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow()
});
export const insertGroupSchema = createInsertSchema(groups);
// Intermediate table for groups and customers
export const groupCustomers = pgTable(
  'group_customers',
  {
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.groupId}, ${table.customerId})`,
    indexGroup: sql`CREATE INDEX idx_group_customers_group_id ON ${table}(${table.groupId})`
  })
);
export const insertGroupCustomerSchema = createInsertSchema(groupCustomers);

// Intermediate table for groups and sites
export const groupSites = pgTable(
  'group_sites',
  {
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    siteId: integer('site_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.groupId}, ${table.siteId})`,
    indexGroup: sql`CREATE INDEX idx_group_sites_group_id ON ${table}(${table.groupId})`
  })
);
export const insertGroupSiteSchema = createInsertSchema(groupSites);
// Intermediate table for groups and suppliers
export const groupSuppliers = pgTable(
  'group_suppliers',
  {
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    supplierId: integer('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.groupId}, ${table.supplierId})`,
    indexGroup: sql`CREATE INDEX idx_group_suppliers_group_id ON ${table}(${table.groupId})`
  })
);
export const insertGroupSupplierSchema = createInsertSchema(groupSuppliers);
// Intermediate table for groups and other groups
export const groupGroups = pgTable(
  'group_groups',
  {
    parentGroupId: integer('parent_group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    childGroupId: integer('child_group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: sql`PRIMARY KEY (${table.parentGroupId}, ${table.childGroupId})`,
    indexParentGroup: sql`CREATE INDEX idx_group_groups_parent_group_id ON ${table}(${table.parentGroupId})`,
    indexChildGroup: sql`CREATE INDEX idx_group_groups_child_group_id ON ${table}(${table.childGroupId})`
  })
);
export const insertGroupGroupSchema = createInsertSchema(groupGroups);
export const  products = pgTable(
  'products',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(), //pk
    unit: varchar('unit', { length: 50 }).notNull(),
    sellingPrice: numeric('selling_price').notNull(),
    cost: numeric('cost').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => {
    return {
      currencyCheck: sql`CHECK (${table.currency} IN ('USD', 'EUR', 'GBP'))`
    };
  }
);
export const insertProductSchema = createInsertSchema(products);

export const productGroups = pgTable(
  'product_groups',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().unique().primaryKey(),//pk
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    nameIdx: index('idx_product_group_name').on(table.name)
  })
);
export const insertProductGroupSchema = createInsertSchema(productGroups);

export const productGroupProducts = pgTable(
  'product_group_products',
  {
    productGroupId: integer('product_group_id')
      .notNull()
      .references(() => productGroups.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productGroupId, table.productId] }),
    productGroupIdIdx: index('idx_product_group_id').on(table.productGroupId),
    productIdIdx: index('idx_product_id').on(table.productId)
  })
);
export const insertProductGroupProductSchema = createInsertSchema(productGroupProducts);
// Add relations
export const productGroupsRelations = relations(productGroups, ({ many }) => ({
  products: many(productGroupProducts)
}));

export const productGroupProductsRelations = relations(
  productGroupProducts,
  ({ one }) => ({
    productGroup: one(productGroups, {
      fields: [productGroupProducts.productGroupId],
      references: [productGroups.id]
    }),
    product: one(products, {
      fields: [productGroupProducts.productId],
      references: [products.id]
    })
  })
);

export const productFlows = pgTable(
  'product_flows',
  {
    id: serial('id').primaryKey(), // Unique identifier for each product flow
    label: varchar('label', { length: 255 }), // Name of the flow
    sourceId: integer('source_id').references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table (source)
    destinationId: integer('destination_id').references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table (destination)
    vehicleTypeId: integer('vehicle_type_id').references(() => vehicleTypes.id, { onDelete: 'cascade' }), // Foreign key to Vehicle Types table
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    expandSources: boolean('expand_sources').default(true), // Toggle for expanding sources
    expandDestinations: boolean('expand_destinations').default(true), // Toggle for expanding destinations
    expandProducts: boolean('expand_products').default(true), // Toggle for expanding products
    minThroughput: decimal('min_throughput', {
      precision: 15,
      scale: 2
    }).default('0'), // Minimum flow throughput
    maxThroughput: decimal('max_throughput', {
      precision: 15,
      scale: 2
    }).default('0'), // Maximum flow throughput
    fixed: boolean('fixed').default(false), // Toggle for fixed throughput
    fixedValue: decimal('fixed_value', { precision: 15, scale: 2 }), // Explicitly specified fixed throughput
    productUnit: varchar('product_unit', { length: 50 }), // Unit for throughput measurement (e.g., kg, pcs)
    downPenalty: decimal('down_penalty', { precision: 15, scale: 2 }).default(
      '0'
    ), // Penalty for dropping below min throughput
    upPenalty: decimal('up_penalty', { precision: 15, scale: 2 }).default('0'), // Penalty for exceeding max throughput
    currency: varchar('currency', { length: 10 }), // Currency for penalties
    distanceLimit: decimal('distance_limit', { precision: 10, scale: 2 }), // Service distance limit
    distanceUnit: varchar('distance_unit', { length: 50 }), // Unit for distance (e.g., km, miles)
    timeLimit: decimal('time_limit', { precision: 10, scale: 2 }), // Delivery time limit
    timeUnit: varchar('time_unit', { length: 50 }), // Unit for delivery time (e.g., hours, days)
    timePeriodId: integer('time_period_id').references(() => periods.id, { onDelete: 'cascade' }), // Foreign key to Periods table
    expandPeriods: boolean('expand_periods').default(true), // Toggle for expanding periods
    inclusionType: varchar('inclusion_type', { length: 10 }) // Inclusion or exclusion from the supply chain
  },
  (table) => {
    return {
      idxProductFlowsSourceDest: index('idx_product_flows_source_dest').on(
        table.sourceId,
        table.destinationId
      ), // Index for source and destination
      idxProductFlowsVehicleType: index('idx_product_flows_vehicle_type').on(
        table.vehicleTypeId
      ), // Index for vehicle type
      idxProductFlowsProduct: index('idx_product_flows_product').on(
        table.productId
      ), // Index for product
      idxProductFlowsTimePeriod: index('idx_product_flows_time_period').on(
        table.timePeriodId
      ), // Index for time period
      idxProductFlowsInclusionType: index(
        'idx_product_flows_inclusion_type'
      ).on(table.inclusionType) // Index for inclusion type
    };
  }
);
export const insertProductFlowSchema = createInsertSchema(productFlows);
export const productStorages = pgTable(
  'product_storages',
  {
    id: serial('id').primaryKey(),
    label: varchar('label', { length: 255 }).notNull(),
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    expandFacilities: boolean('expand_facilities').default(false),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    expandProducts: boolean('expand_products').default(false),
    initialStock: decimal('initial_stock', { precision: 15, scale: 2 }).default(
      '0'
    ),
    minStock: decimal('min_stock', { precision: 15, scale: 2 }),
    safetyStock: decimal('safety_stock', { precision: 15, scale: 2 }),
    maxStock: decimal('max_stock', { precision: 15, scale: 2 }),
    fixed: boolean('fixed').default(false),
    fixedValue: decimal('fixed_value', { precision: 15, scale: 2 }),
    understockPenalty: decimal('understock_penalty', {
      precision: 15,
      scale: 2
    }),
    safetyStockPenalty: decimal('safety_stock_penalty', {
      precision: 15,
      scale: 2
    }),
    overstockPenalty: decimal('overstock_penalty', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }),
    productUnit: varchar('product_unit', { length: 50 }),
    timePeriodId: integer('time_period_id').references(() => periods.id , { onDelete: 'cascade' }),
    expandPeriods: boolean('expand_periods').default(false),
    inclusionType: varchar('inclusion_type', { length: 10 })
  },
  (table) => ({
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`,
    idxProductStoragesLabel: index('idx_product_storages_label').on(
      table.label
    ),
    idxProductStoragesFacility: index('idx_product_storages_facility').on(
      table.facilityId
    ),
    idxProductStoragesProduct: index('idx_product_storages_product').on(
      table.productId
    ),
    idxProductStoragesTimePeriod: index('idx_product_storages_time_period').on(
      table.timePeriodId
    ),
    idxProductStoragesInclusionType: index(
      'idx_product_storages_inclusion_type'
    ).on(table.inclusionType)
  })
);
export const insertProductStorageSchema = createInsertSchema(productStorages);
export const periods = pgTable(
  'periods',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),//pk
    start: date('start').notNull(),
    end: date('end').notNull(),
    demandCoefficient: numeric('demand_coefficient').notNull()
  },
  (table) => {
    return {
      periodCheck: sql`CHECK (${table.end} > ${table.start})`,
      indexName: index('periods_name_idx').on(table.name),
      indexStartEnd: index('periods_start_end_idx').on(table.start, table.end)
    };
  }
);
export const insertPeriodSchema = createInsertSchema(periods);

export const periodGroups = pgTable(
  'period_groups',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique()
  },
  (table) => ({
    nameIdx: index('idx_period_groups_name').on(table.name)
  })
);
export const insertPeriodGroupSchema = createInsertSchema(periodGroups);

// Junction table for period groups and periods
export const periodGroupPeriods = pgTable(
  'period_group_periods',
  {
    periodGroupId: integer('period_group_id')
      .notNull()
      .references(() => periodGroups.id, { onDelete: 'cascade' }),
    periodId: integer('period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.periodGroupId, table.periodId] })
  })
);
// Relations
export const periodGroupsRelations = relations(periodGroups, ({ many }) => ({
  periods: many(periodGroupPeriods)
}));

export const periodGroupPeriodsRelations = relations(
  periodGroupPeriods,
  ({ one }) => ({
    periodGroup: one(periodGroups, {
      fields: [periodGroupPeriods.periodGroupId],
      references: [periodGroups.id]
    }),
    period: one(periods, {
      fields: [periodGroupPeriods.periodId],
      references: [periods.id]
    })
  })
);
export const insertPeriodGroupPeriodSchema = createInsertSchema(periodGroupPeriods);
export const suppliers = pgTable(
  'suppliers',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),//pk
    type: varchar('type', { length: 255 }).default('Supplier'),
    locationId: integer('location_id').references(() => locations.id, { onDelete: 'cascade' }),
    products: integer('products'),
    inclusionType: varchar('inclusion_type', { length: 50 }),
    additionalParameters: integer('additional_parameters'),
    icon: varchar('icon', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`
  })
);
export const insertsuppliersSchema = createInsertSchema(suppliers);

export const supplierProducts = pgTable(
  'supplier_products',
  {
    supplierId: integer('supplier_id')
      .notNull()
      .references(() => suppliers.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.supplierId, table.productId] }),
    supplierIdIdx: index('idx_supplier_products_supplier_id').on(
      table.supplierId
    ),
    productIdIdx: index('idx_supplier_products_product_id').on(table.productId)
  })
);
export const insertSupplierProductSchema = createInsertSchema(supplierProducts);
// Add relations
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(supplierProducts)
}));

export const productsRelations = relations(products, ({ many }) => ({
  suppliers: many(supplierProducts)
}));

export const supplierProductsRelations = relations(
  supplierProducts,
  ({ one }) => ({
    supplier: one(suppliers, {
      fields: [supplierProducts.supplierId],
      references: [suppliers.id]
    }),
    product: one(products, {
      fields: [supplierProducts.productId],
      references: [products.id]
    })
  })
);


export const locationGroups = pgTable(
  'location_groups',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().unique().primaryKey(),//pk
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    nameIdx: index('idx_location_group_name').on(table.name)
  })
);
export const insertLocationGroupSchema = createInsertSchema(locationGroups);

export const locationGroupLocations = pgTable(
  'location_group_locations',
  {
    locationGroupId: integer('location_group_id')
      .notNull()
      .references(() => locationGroups.id, { onDelete: 'cascade' }),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.locationGroupId, table.locationId] }),
    locationGroupIdIdx: index('idx_location_group_id').on(
      table.locationGroupId
    ),
    locationIdIdx: index('idx_location_id').on(table.locationId)
  })
);

export const locationGroupsRelations = relations(
  locationGroups,
  ({ many }) => ({
    locationGroupLocations: many(locationGroupLocations)
  })
);

export const insertLocationGroupLocationSchema = createInsertSchema(
  locationGroupLocations
);

export const locationGroupLocationsRelations = relations(
  locationGroupLocations,
  ({ one }) => ({
    locationGroup: one(locationGroups, {
      fields: [locationGroupLocations.locationGroupId],
      references: [locationGroups.id]
    }),
    location: one(locations, {
      fields: [locationGroupLocations.locationId],
      references: [locations.id]
    })
  })
);

export const sourcing = pgTable(
  'sourcing',
  {
    id: serial('id'),
    deliveryDestination: varchar('delivery_destination', {
      length: 255
    }).notNull().primaryKey(),
    sources: text('sources').array(),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }),
    parameters: integer('parameters'),
    timePeriodId: integer('time_period_id').references(() => periods.id, { onDelete: 'cascade' }),
    inclusionType: varchar('inclusion_type', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    typeCheck: sql`CHECK (${table.type} IN ('First', 'Cheapest', 'Closest', 'Fastest', 'Most Inventory', 'Uniform Split', 'Split by Ratio'))`,
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`,
    productIdIdx: index('idx_sourcing_product_id').on(table.productId),
    timePeriodIdIdx: index('idx_sourcing_time_period_id').on(
      table.timePeriodId
    ),
    deliveryDestinationIdx: index('idx_sourcing_delivery_destination').on(
      table.deliveryDestination
    )
  })
);
export const insertSourcingSchema = createInsertSchema(sourcing);
export const unitConversions = pgTable(
  'unit_conversions',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    amountFrom: numeric('amount_from').notNull(),
    unitFrom: varchar('unit_from', { length: 255 }).notNull(),
    amountTo: numeric('amount_to').notNull(),
    unitTo: varchar('unit_to', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    uniqueConversion: uniqueIndex('unique_conversion').on(
      table.productId,
      table.unitFrom,
      table.unitTo
    ),
    productIdIdx: index('idx_unit_conversions_product_id').on(table.productId),
    unitFromIdx: index('idx_unit_conversions_unit_from').on(table.unitFrom),
    unitToIdx: index('idx_unit_conversions_unit_to').on(table.unitTo)
  })
);
export const insertunitConversionSchema = createInsertSchema(unitConversions);
export const units = pgTable(
  'units',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().unique().primaryKey(),//pk
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    nameIdx: index('idx_units_name').on(table.name)
  })
);

export const insertUnitSchema = createInsertSchema(units);
////No

export const assetsConstraints = pgTable(
  'assets_constraints',
  {
    id: serial('id').primaryKey(), // Unique identifier for each record
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }), // Foreign key to the Groups table
    minDcs: integer('min_dcs'), // Minimum number of DCs (or super DCs)
    maxDcs: integer('max_dcs'), // Maximum number of DCs (or super DCs)
    timePeriod: varchar('time_period', { length: 255 }), // Time period during which constraints are valid
    inclusionType: varchar('inclusion_type', { length: 10 }), // Inclusion or exclusion of constraint
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    checkMinMax: sql`CHECK (${table.minDcs} <= ${table.maxDcs})`, // Ensure min_dcs <= max_dcs
    idxAssetsConstraintsGroupTime: index(
      'idx_assets_constraints_group_time'
    ).on(table.groupId, table.timePeriod) // Optional index for faster querying by group_id and time_period
  })
);
export const insertAssetsConstraintSchema = createInsertSchema(assetsConstraints);

export const cashAccounts = pgTable(
  'cash_accounts',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),//pk
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    initialCash: decimal('initial_cash', { precision: 15, scale: 2 }).default(
      '0'
    ),
    currency: varchar('currency', { length: 10 }).notNull(),
    interest: decimal('interest', { precision: 4, scale: 3 }).default('0')
  },
  (table) => ({
    idxCashAccountsFacilityCurrency: index(
      'idx_cash_accounts_facility_currency'
    ).on(table.facilityId, table.currency),
    interestCheck: sql`CHECK (${table.interest} >= 0 AND ${table.interest} <= 1)`
  })
);
export const insertCashAccountSchema = createInsertSchema(cashAccounts);
                             
export const customConstraints = pgTable(
  'custom_constraints',
  {
    id: serial('id').primaryKey(),
    leftHandSide: text('left_hand_side').notNull(),
    comparisonType: varchar('comparison_type', { length: 2 }).notNull(),
    rightHandSide: text('right_hand_side').notNull(),
    constraintType: varchar('constraint_type', { length: 20 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    ucLeftRight: unique('uc_left_right').on(
      table.leftHandSide,
      table.rightHandSide
    ),
    idxCustomConstraintsLeftHandSide: index(
      'idx_custom_constraints_left_hand_side'
    ).on(table.leftHandSide),
    idxCustomConstraintsRightHandSide: index(
      'idx_custom_constraints_right_hand_side'
    ).on(table.rightHandSide),
    idxCustomConstraintsComparisonType: index(
      'idx_custom_constraints_comparison_type'
    ).on(table.comparisonType),
    idxCustomConstraintsConstraintType: index(
      'idx_custom_constraints_constraint_type'
    ).on(table.constraintType),
    comparisonTypeCheck: check(
      'comparison_type_check',
      sql`${table.comparisonType} IN ('=', '<>', '>', '<', '>=', '<=')`
    ),
    constraintTypeCheck: check(
      'constraint_type_check',
      sql`${table.constraintType} IN ('hard', 'soft', 'variable')`
    )
  })
);
export const insertcustomConstraintSchema = createInsertSchema(customConstraints);

export const facilityExpenses = pgTable(
  'facility_expenses',
  {
    id: serial('id').primaryKey(), // Unique identifier for each record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    expenseType: varchar('expense_type', { length: 50 }).notNull(), // Type of expense (Initial, Closure, Other, Facility, or Carrying cost)
    value: decimal('value', { precision: 15, scale: 2 }), // The cost related to the facility, can be negative for Closure cost
    currency: varchar('currency', { length: 10 }).notNull(), // Currency type used (e.g., USD, EUR)
    timeUnit: varchar('time_unit', { length: 50 }), // Time unit for the expense (e.g., Day, Month)
    productUnit: varchar('product_unit', { length: 50 }), // Product unit used for Carrying cost or Facility cost (e.g., m3, kg)
    timePeriodId: integer('time_period_id').references(() => periods.id, { onDelete: 'cascade' }) // Foreign key to Periods table
  },
  (table) => {
    return {
      idxFacilityExpensesFacilityType: index(
        'idx_facility_expenses_facility_type'
      ).on(table.facilityId, table.expenseType) // Index for faster querying by facility_id and expense_type
    };
  }
);

export const insertFacilityExpenseSchema = createInsertSchema(facilityExpenses);

export const linearRanges = pgTable(
  'linear_ranges',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),
    lowerBound: decimal('lower_bound', { precision: 15, scale: 2 }).notNull(),
    expression: text('expression').notNull(),
    upperBound: decimal('upper_bound', { precision: 15, scale: 2 }).notNull()
  },
  (table) => ({
    checkBounds: check(
      'check_bounds',
      sql`${table.lowerBound} <= ${table.upperBound}`
    ),
    nameIdx: index('idx_linear_ranges_name').on(table.name)
  })
);
export const insertlinearrangeSchema = createInsertSchema(linearRanges);
export const indicatorConstraints = pgTable(
  'indicator_constraints',
  {
    id: serial('id').primaryKey(),
    ifConditionId: integer('if_condition_id')
      .notNull()
      .references(() => linearRanges.id, { onDelete: 'cascade' }),
    thenConditionId: integer('then_condition_id')
      .notNull()
      .references(() => linearRanges.id, { onDelete: 'cascade' }),
    inclusionType: boolean('inclusion_type').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => ({
    ifConditionIdIdx: index('idx_if_condition_id').on(table.ifConditionId),
    thenConditionIdIdx: index('idx_then_condition_id').on(table.thenConditionId)
  })
);
export const insertIndicatorConstraintSchema = createInsertSchema(indicatorConstraints);

export const objectiveMembers = pgTable(
  'objective_members',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),
    expression: text('expression').notNull(),
    coefficient: decimal('coefficient', { precision: 15, scale: 2 }).default(
      '1.00'
    ),
    addToObjective: boolean('add_to_objective').default(true),
    inclusionType: varchar('inclusion_type', { length: 10 }),
    customConstraintId: integer('custom_constraint_id') // Add this line
  },
  (table) => ({
    inclusionTypeCheck: check(
      'inclusion_type_check',
      sql`${table.inclusionType} IN ('Include', 'Exclude')`
    ),
    nameInclusionIdx: index('idx_objective_members_name_inclusion').on(
      table.name,
      table.inclusionType
    )
  })
);
export const insertObjectiveMemberSchema = createInsertSchema(objectiveMembers);
export const paths = pgTable(
  'paths',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().unique().primaryKey(),
    fromLocation: varchar('from_location', { length: 255 }).notNull(),
    toLocation: varchar('to_location', { length: 255 }).notNull(),
    costCalculationPolicy: varchar('cost_calculation_policy', {
      length: 50
    }).notNull(),
    costPuPk: decimal('cost_pu_pk', { precision: 10, scale: 2 }).default('0'),
    costCalculationParams: integer('cost_calculation_params').default(0),
    co2CalculationParams: integer('co2_calculation_params').default(0),
    currency: varchar('currency', { length: 10 }),
    distance: decimal('distance', { precision: 10, scale: 2 }).default('0'),
    distanceUnit: varchar('distance_unit', { length: 20 }),
    transportationTime: decimal('transportation_time', {
      precision: 10,
      scale: 2
    }).default('0'),
    timeUnit: varchar('time_unit', { length: 20 }),
    straight: boolean('straight').default(false),
    vehicleTypeId: integer('vehicle_type_id').references(() => vehicleTypes.id, { onDelete: 'cascade' }),
    transportationPolicy: varchar('transportation_policy', { length: 10 }),
    minLoadRatio: decimal('min_load_ratio', { precision: 5, scale: 2 }),
    timePeriod: varchar('time_period', { length: 50 }),
    inclusionType: varchar('inclusion_type', { length: 10 }).default('Include')
  },
  (table) => ({
    costCalculationPolicyCheck: sql`CHECK (${table.costCalculationPolicy} IN (
      'Product-based', 'Product&distance-based', 'Fixed delivery',
      'Distance-based with cost per stop', 'Product&distance-based limited distance',
      'Cost per drop', 'Distance-based with fixed cost'
    ))`,
    transportationPolicyCheck: sql`CHECK (${table.transportationPolicy} IN ('LTL', 'FTL'))`,
    minLoadRatioCheck: sql`CHECK (${table.minLoadRatio} BETWEEN 0 AND 1)`,
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`,
    fromLocationIdx: index('idx_paths_from_location').on(table.fromLocation),
    toLocationIdx: index('idx_paths_to_location').on(table.toLocation),
    costCalculationPolicyIdx: index('idx_paths_cost_calculation_policy').on(
      table.costCalculationPolicy
    ),
    vehicleTypeIdIdx: index('idx_paths_vehicle_type_id').on(table.vehicleTypeId)
  })
);
export const insertPathSchema = createInsertSchema(paths);
export const production = pgTable(
  'production',
  {
    id: serial('id').primaryKey(),
    label: varchar('label', { length: 255 }).notNull(),
    siteId: integer('site_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    productionCost: decimal('production_cost', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }),
    minThroughput: decimal('min_throughput', {
      precision: 15,
      scale: 2
    }).default('0'),
    maxThroughput: decimal('max_throughput', {
      precision: 15,
      scale: 2
    }).default('0'),
    fixed: boolean('fixed').default(false),
    fixedValue: decimal('fixed_value', { precision: 15, scale: 2 }),
    downPenalty: decimal('down_penalty', { precision: 15, scale: 2 }).default(
      '0'
    ),
    upPenalty: decimal('up_penalty', { precision: 15, scale: 2 }).default('0'),
    co2PerProduct: decimal('co2_per_product', { precision: 15, scale: 2 }),
    timePeriodId: integer('time_period_id').references(() => periods.id),
    inclusionType: varchar('inclusion_type', { length: 10 }).notNull()
  },
  (table) => ({
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`,
    idxProductionLabel: index('idx_production_label').on(table.label),
    idxProductionSite: index('idx_production_site').on(table.siteId),
    idxProductionProduct: index('idx_production_product').on(table.productId),
    idxProductionTimePeriod: index('idx_production_time_period').on(
      table.timePeriodId
    )
  })
);
export const insertProductionSchema = createInsertSchema(production);
export const vehicleTypes = pgTable(
  'vehicle_types',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),
    capacity: decimal('capacity', { precision: 15, scale: 2 }).default('0'),
    capacityUnit: varchar('capacity_unit', { length: 10 }).references(
      () => units.name
    ),
    speed: decimal('speed', { precision: 10, scale: 2 }),
    speedUnit: varchar('speed_unit', { length: 10 }).references(
      () => units.name
    )
  },
  (table) => ({
    capacityUnitCheck: sql`CHECK (${table.capacityUnit} IN ('ft3', 'kg', 'lb', 'm3', 'pcs'))`,
    speedUnitCheck: sql`CHECK (${table.speedUnit} IN ('km/h', 'mph'))`,
    nameIdx: index('idx_vehicle_types_name').on(table.name),
    capacityUnitIdx: index('idx_vehicle_types_capacity_unit').on(
      table.capacityUnit
    ),
    speedUnitIdx: index('idx_vehicle_types_speed_unit').on(table.speedUnit)
  })
);

export const insertVehicleSchema = createInsertSchema(vehicleTypes);

export const processingCosts = pgTable(
  'processing_costs',
  {
    id: serial('id').primaryKey(),
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    units: varchar('units', { length: 10 }).notNull(),
    cost: decimal('cost', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    timePeriodId: integer('time_period_id').references(() => periods.id, { onDelete: 'cascade' })
  },
  (table) => ({
    typeCheck: check(
      'type_check',
      sql`${table.type} IN ('Inbound shipment processing', 'Outbound shipment processing')`
    ),
    idxProcessingCostsFacilityProduct: index(
      'idx_processing_costs_facility_product'
    ).on(table.facilityId, table.productId),
    idxProcessingCostsType: index('idx_processing_costs_type').on(table.type),
    idxProcessingCostsCurrency: index('idx_processing_costs_currency').on(
      table.currency
    ),
    idxProcessingCostsUnits: index('idx_processing_costs_units').on(
      table.units
    ),
    idxProcessingCostsTimePeriod: index('idx_processing_costs_time_period').on(
      table.timePeriodId
    )
  })
);

export const insertProcessingCostsSchema = createInsertSchema(processingCosts);


export const bom = pgTable(
  'bom',
  {
    id: serial('id'),
    name: varchar('name', { length: 255 }).notNull().primaryKey(),
    endProductId: integer('end_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  },
  (table) => ({
    nameIdx: index('idx_bom_name').on(table.name),
    endProductIdx: index('idx_bom_end_product').on(table.endProductId)
  })
);
export const insertBomSchema = createInsertSchema(bom);


export const bomComponents = pgTable(
  'bom_components',
  {
    id: serial('id').primaryKey(),
    bomId: integer('bom_id')
      .notNull()
      .references(() => bom.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull()
  },
  (table) => ({
    bomIdIdx: index('idx_bom_components_bom_id').on(table.bomId),
    productIdIdx: index('idx_bom_components_product_id').on(table.productId)
  })
);
export const insertBomComponentsSchema = createInsertSchema(bomComponents);
export const bomByproducts = pgTable(
  'bom_byproducts',
  {
    id: serial('id').primaryKey(),
    bomId: integer('bom_id')
      .notNull()
      .references(() => bom.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull()
  },
  (table) => ({
    bomIdIdx: index('idx_bom_byproducts_bom_id').on(table.bomId),
    productIdIdx: index('idx_bom_byproducts_product_id').on(table.productId)
  })
);
export const insertBomByproductsSchema = createInsertSchema(bomByproducts);


export const production_no = pgTable(
  'production_no',
  {
    id: serial('id').primaryKey(),
    label: varchar('label', { length: 255 }).notNull(),
    siteId: integer('site_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    bomId: integer('bom_id').references(() => bom.id),
    productionCost: decimal('production_cost', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }),
    minThroughput: decimal('min_throughput', {
      precision: 15,
      scale: 2
    }).default('0'),
    maxThroughput: decimal('max_throughput', {
      precision: 15,
      scale: 2
    }).default('0'),
    fixed: boolean('fixed').default(false),
    fixedValue: decimal('fixed_value', { precision: 15, scale: 2 }),
    downPenalty: decimal('down_penalty', { precision: 15, scale: 2 }).default(
      '0'
    ),
    upPenalty: decimal('up_penalty', { precision: 15, scale: 2 }).default('0'),
    co2PerProduct: decimal('co2_per_product', { precision: 15, scale: 2 }),
    timePeriodId: integer('time_period_id').references(() => periods.id),
    inclusionType: varchar('inclusion_type', { length: 10 }).notNull()
  },
  (table) => ({
    inclusionTypeCheck: sql`CHECK (${table.inclusionType} IN ('Include', 'Exclude'))`,
    idxProductionLabelNo: index('idx_production_label_no').on(table.label),
    idxProductionSiteNo: index('idx_production_site_no').on(table.siteId),
    idxProductionProductNo: index('idx_production_product_no').on(
      table.productId
    ),
    idxProductionBomNo: index('idx_production_bom_no').on(table.bomId),
    idxProductionTimePeriodNo: index('idx_production_time_period_no').on(
      table.timePeriodId
    )
  })
);
export const insertProductionNoSchema = createInsertSchema(production_no);

export const siteStateChanges = pgTable(
  'site_state_changes',
  {
    id: serial('id').primaryKey(),
    siteId: integer('site_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }),
    newSiteState: varchar('new_site_state', { length: 10 }).notNull()
  },
  (table) => ({
    newSiteStateCheck: sql`CHECK (${table.newSiteState} IN ('open', 'closed'))`,
    idxSiteStateChangesSite: index('idx_site_state_changes_site').on(
      table.siteId
    ),
    idxSiteStateChangesTimePeriod: index(
      'idx_site_state_changes_time_period'
    ).on(table.timePeriodId)
  })
);
export const insertSiteStateChangesSchema = createInsertSchema(siteStateChanges);

export const saleBatches = pgTable(
  'sale_batches',
  {
    id: serial('id').primaryKey(),
    sourceId: integer('source_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(),
    batchSize: decimal('batch_size', { precision: 15, scale: 2 }).notNull(),
    stepSize: decimal('step_size', { precision: 15, scale: 2 }),
    pricePerUnit: decimal('price_per_unit', {
      precision: 15,
      scale: 2
    }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    timePeriodId: integer('time_period_id').references(() => periods.id, { onDelete: 'cascade' })
  },
  (table) => ({
    typeCheck: sql`CHECK (${table.type} IN ('Exact', 'Starts From'))`,
    idxSaleBatchesSource: index('idx_sale_batches_source').on(table.sourceId),
    idxSaleBatchesProduct: index('idx_sale_batches_product').on(
      table.productId
    ),
    idxSaleBatchesTimePeriod: index('idx_sale_batches_time_period').on(
      table.timePeriodId
    )
  })
);
export const insertSaleBatchSchema = createInsertSchema(saleBatches);
////SIM
export const co2Emissions = pgTable(
  'co2_emissions',
  {
    id: serial('id').primaryKey(), // Unique identifier for each record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id), // Foreign key to Facilities table
    co2EmissionSource: varchar('co2_emission_source', { length: 50 }).notNull(), // Source of CO2 emissions
    co2Produced: decimal('co2_produced', { precision: 15, scale: 2 }).notNull(), // Amount of CO2 produced
    timeUnit: varchar('time_unit', { length: 50 }), // Time unit for the CO2 emissions
    productUnit: varchar('product_unit', { length: 50 }), // Product unit used for Facility Size or Carrying
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id) // Foreign key to Periods table
  },
  (table) => {
    return {
      idxCo2EmissionsFacilitySource: index(
        'idx_co2_emissions_facility_source'
      ).on(table.facilityId, table.co2EmissionSource) // Index for faster querying by facility_id and co2_emission_source
    };
  }
);
export const insertCo2EmissionsSchema = createInsertSchema(co2Emissions);
export const co2Processing = pgTable(
  'co2_processing',
  {
    id: serial('id').primaryKey(), // Unique identifier for each record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    processingType: varchar('processing_type', { length: 50 }).notNull(), // Type of processing
    units: varchar('units', { length: 50 }).notNull(), // Unit for calculating CO2 emission
    co2Produced: decimal('co2_produced', { precision: 15, scale: 2 }).notNull(), // Amount of CO2 produced per unit
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }), // Foreign key to Periods table
    co2CalculationFormula: text('co2_calculation_formula') // Formula for CO2 calculation
  },
  (table) => {
    return {
      idxCo2ProcessingFacilityProduct: index(
        'idx_co2_processing_facility_product'
      ).on(table.facilityId, table.productId, table.processingType) // Index for querying by facility_id, product_id, and processing_type
    };
  }
);
export const insertCo2ProcessingSchema = createInsertSchema(co2Processing);
export const demandForecast = pgTable(
  'demand_forecast',
  {
    id: serial('id').primaryKey(), // Unique identifier for each record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    type: varchar('type', { length: 50 }).notNull(), // Type of demand definition
    parameters: integer('parameters').notNull(), // Demand definition parameters
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }) // Foreign key to Periods table
  },
  (table) => {
    return {
      idxDemandForecastFacilityProduct: index(
        'idx_demand_forecast_facility_product'
      ).on(table.facilityId, table.productId, table.type) // Index for querying by facility_id, product_id, and type
    };
  }
);
export const insertDemandForecastSchema = createInsertSchema(demandForecast);
export const events = pgTable(
  'events',
  {
    id: serial('id'), // Unique identifier for each event
    name: varchar('name', { length: 100 }).notNull().primaryKey(), // Name of the event
    eventType: varchar('event_type', { length: 50 }).notNull(), // Type of the event
    parameters: integer('parameters'), // Event-specific parameters
    occurrenceType: varchar('occurrence_type', { length: 50 }).notNull(), // Occurrence type
    occurrenceTime: varchar('occurrence_time', { length: 50 }).notNull(), // Event occurrence time
    triggerEventName: varchar('trigger_event_name', { length: 100 }), // Reference to the name of another event that triggers this event
    probability: decimal('probability', { precision: 3, scale: 2 }).notNull() // Probability of the event occurring
  },
  (table) => {
    return {
      idxEventsNameType: index('idx_events_name_type').on(
        table.name,
        table.eventType
      ), // Index for faster querying by event name and type
      idxEventsTrigger: index('idx_events_trigger').on(table.triggerEventName) // Index for querying by trigger event name
    };
  }
);
export const insertEventsSchema = createInsertSchema(events);
export const fleets = pgTable(
  'fleets',
  {
    id: serial('id').primaryKey(), // Unique identifier for each fleet record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    vehicleTypeId: integer('vehicle_type_id')
      .notNull()
      .references(() => vehicleTypes.id, { onDelete: 'cascade' }), // Foreign key to Vehicle Types table
    quantity: integer('quantity').notNull(), // Number of vehicles in the fleet; 0 means unlimited
    cost: decimal('cost', { precision: 15, scale: 2 }).notNull(), // Cost of owning the fleet per TimeUnit
    currency: varchar('currency', { length: 10 }).notNull(), // Currency type for the cost
    timeUnit: varchar('time_unit', { length: 50 }) // Time unit for the cost calculation
  },
  (table) => {
    return {
      idxFleetsFacilityVehicle: index('idx_fleets_facility_vehicle').on(
        table.facilityId,
        table.vehicleTypeId
      ) // Index for querying by facility and vehicle type
    };
  }
);
export const insertFleetsSchema = createInsertSchema(fleets);

export const inventory = pgTable(
  'inventory',
  {
    id: serial('id').primaryKey(), // Unique identifier for each inventory record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    policyType: varchar('policy_type', { length: 50 }).notNull(), // Type of inventory policy
    policyParameters: integer('policy_parameters'), // integer field for policy-specific parameters
    initialStock: decimal('initial_stock', {
      precision: 15,
      scale: 2
    }).notNull(), // Initial stock in units
    periodicCheck: boolean('periodic_check').notNull().default(false), // Whether periodic inventory check is enabled
    period: integer('period'), // Period for periodic inventory check
    firstPeriodicCheck: varchar('first_periodic_check', { length: 50 }), // Start time for periodic check
    policyBasis: varchar('policy_basis', { length: 50 }), // Policy basis
    stockCalculationWindow: integer('stock_calculation_window'), // Number of days for mean daily demand calculation
    timeUnit: varchar('time_unit', { length: 50 }).notNull(), // Time unit for the period
    minSplitRatio: decimal('min_split_ratio', {
      precision: 3,
      scale: 2
    }), // Minimum split ratio for partial shipments
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id), // Foreign key to Periods table
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull() // Inclusion status
  },
  (table) => {
    return {
      idxInventoryFacilityProduct: index('idx_inventory_facility_product').on(
        table.facilityId,
        table.productId
      ), // Index for querying by facility and product
      idxInventoryPolicyType: index('idx_inventory_policy_type').on(
        table.policyType
      ) // Index for querying by policy type
    };
  }
);
export const insertInventorySchema = createInsertSchema(inventory);
export const loadingUnloadingGates = pgTable(
  'loading_unloading_gates',
  {
    id: serial('id'), // Unique identifier for each gate record
    name: varchar('name', { length: 100 }).notNull().primaryKey(), // Name of the gate
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id), // Foreign key to Facilities table
    type: varchar('type', { length: 50 }).notNull(), // Type of the gate
    vehicleTypes: integer('vehicle_types').notNull(), // integer field specifying vehicle types allowed at the gate
    numberOfGates: integer('number_of_gates').notNull(), // Number of loading/unloading areas
    units: varchar('units', { length: 50 }).notNull(), // Unit of measurement for processing
    processingTime: decimal('processing_time', {
      precision: 15,
      scale: 2
    }).notNull(), // Time required to process the unit
    timeUnit: varchar('time_unit', { length: 50 }).notNull() // Time unit for processing time
  },
  (table) => {
    return {
      idxGatesFacilityType: index('idx_gates_facility_type').on(
        table.facilityId,
        table.type
      ) // Index for querying by facility and gate type
    };
  }
);
export const insertLoadingUnloadingGatesSchema = createInsertSchema(loadingUnloadingGates);

export const milkRuns = pgTable(
  'milk_runs',
  {
    id: serial('id').primaryKey(), // Unique identifier for each milk run record
    sourceId: integer('source_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the source
    destinations: varchar('destinations').notNull(), // integer field specifying destination points and their order
    vehicleTypeId: integer('vehicle_type_id')
      .notNull()
      .references(() => vehicleTypes.id, { onDelete: 'cascade' }) // Foreign key to Vehicle Types table
  },
  (table) => {
    return {
      idxMilkRunsSourceVehicle: index('idx_milk_runs_source_vehicle').on(
        table.sourceId,
        table.vehicleTypeId
      ) // Index for querying by source and vehicle type
    };
  }
);
export const insertMilkRunSchema = createInsertSchema(milkRuns);

export const orderingRules = pgTable(
  'ordering_rules',
  {
    id: serial('id').primaryKey(), // Unique identifier for each ordering rule record
    destinationId: integer('destination_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the destination
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    rule: varchar('rule', { length: 50 }).notNull(), // Ordering rule (Can increase, Can decrease)
    limitUnits: integer('limit_units').notNull() // Limit for increasing or decreasing the ordered amount
  },
  (table) => {
    return {
      idxOrderingRulesDestinationProduct: index(
        'idx_ordering_rules_destination_product'
      ).on(table.destinationId, table.productId) // Index for querying by destination and product
    };
  }
);
export const insertOrderingRulesSchema = createInsertSchema(orderingRules);


export const paymentTerms = pgTable(
  'payment_terms',
  {
    id: serial('id').primaryKey(), // Unique identifier for each payment term record
    sellerId: integer('seller_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the seller
    buyerId: integer('buyer_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the buyer
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    defermentPeriod: decimal('deferment_period', {
      precision: 10,
      scale: 2
    }).notNull(), // Deferment period for payment
    timeUnit: varchar('time_unit', { length: 50 }).notNull(), // Time unit for the deferment period (e.g., days, months)
    downPaymentRatio: decimal('down_payment_ratio', {
      precision: 5,
      scale: 2
    }).notNull(), // Down payment ratio as a percentage
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }) // Foreign key to Periods table
  },
  (table) => {
    return {
      idxPaymentTermsSellerBuyer: index('idx_payment_terms_seller_buyer').on(
        table.sellerId,
        table.buyerId,
        table.productId
      ) // Index for querying by seller, buyer, and product
    };
  }
);
export const insertPaymentTermsSchema = createInsertSchema(paymentTerms);
export const processingTime = pgTable(
  'processing_time',
  {
    id: serial('id').primaryKey(), // Unique identifier for each processing time record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    type: varchar('type', { length: 50 }).notNull(), // Type of processing (e.g., Inbound order, Outbound shipment)
    units: varchar('units', { length: 50 }).notNull(), // Units for processing (e.g., order, shipment, pcs, m3, kg)
    time: decimal('time', { precision: 10, scale: 2 }).notNull(), // Time required for processing
    timeUnit: varchar('time_unit', { length: 50 }).notNull() // Time unit for processing time (e.g., minutes, hours)
  },
  (table) => {
    return {
      idxProcessingTimeFacilityProduct: index(
        'idx_processing_time_facility_product'
      ).on(table.facilityId, table.productId, table.type) // Index for querying by facility, product, and type
    };
  }
);
export const insertProcessingTimeSchema = createInsertSchema(processingTime);

export const shipping = pgTable(
  'shipping_policies',
  {
    id: serial('id').primaryKey(), // Unique identifier for each shipping policy record
    sourceId: integer('source_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the source
    destinationId: integer('destination_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the destination
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    vehicleTypeId: integer('vehicle_type_id')
      .notNull()
      .references(() => vehicleTypes.id, { onDelete: 'cascade' }), // Foreign key to Vehicle Types table
    type: varchar('type', { length: 50 }).notNull(), // Type of shipping policy (e.g., FTL, LTL, Pending orders)
    parameters: integer('parameters'), // integer field for policy-specific parameters
    priority: varchar('priority', { length: 50 }).notNull(), // Priority for shipping (e.g., FIFO, ELT, Big first)
    daysOfWeek: integer('days_of_week'), // integer field specifying days of the week when shipping is allowed
    startTime: timestamp('start_time').defaultNow(), // Start time for shipping within a day
    endTime: timestamp('end_time').defaultNow(), // End time for shipping within a day
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }), // Foreign key to Periods table
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull() // Inclusion status (Include or Exclude)
  },
  (table) => {
    return {
      idxShippingPoliciesSourceDestination: index(
        'idx_shipping_policies_source_destination'
      ).on(table.sourceId, table.destinationId, table.productId) // Index for querying by source, destination, and product
    };
  }
);
export const insertShippingSchema = createInsertSchema(shipping);

export const sourcingPolicies = pgTable(
  'sourcing_policies',
  {
    id: serial('id').primaryKey(), // Unique identifier for each sourcing policy record
    destinationId: integer('destination_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the delivery destination
    sources: integer('sources'), // integer field specifying the list of possible sources
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    type: varchar('type', { length: 50 }).notNull(), // Type of sourcing policy (e.g., First, Cheapest, Closest, Fastest, Most Inventory, Uniform Split, Split by Ratio)
    parameters: integer('parameters'), // integer field for policy-specific parameters
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }), // Foreign key to Periods table
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull() // Inclusion status (Include or Exclude)
  },
  (table) => {
    return {
      idxSourcingPoliciesDestinationProduct: index(
        'idx_sourcing_policies_destination_product'
      ).on(table.destinationId, table.productId) // Index for querying by destination and product
    };
  }
);
export const insertSourcingPoliciesSchema = createInsertSchema(sourcingPolicies);

export const tariffs = pgTable(
  'tariffs',
  {
    id: serial('id').primaryKey(), // Unique identifier for each tariff record
    fromId: integer('from_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the source site
    toId: integer('to_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the destination site
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Foreign key to Products table
    tariffType: varchar('tariff_type', { length: 50 }).notNull(), // Type of tariff (Mixed, Compound, etc.)
    adValorem: decimal('ad_valorem', { precision: 5, scale: 4 }).notNull(), // Ad Valorem tax rate (as a percentage of product value)
    fixed: decimal('fixed', { precision: 15, scale: 2 }).notNull(), // Fixed tax cost per product unit
    productUnit: varchar('product_unit', { length: 50 }).notNull(), // Product unit for fixed tax (e.g., pieces, kg, m3)
    currency: varchar('currency', { length: 10 }).notNull(), // Currency type for the tariff (e.g., USD, EUR)
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }), // Foreign key to Periods table
    inclusionType: varchar('inclusion_type', { length: 50 }).notNull() // Inclusion status (Include or Exclude)
  },
  (table) => {
    return {
      idxTariffsFromToProduct: index('idx_tariffs_from_to_product').on(
        table.fromId,
        table.toId,
        table.productId
      ) // Index for querying by source, destination, and product
    };
  }
);
export const insertTariffsSchema = createInsertSchema(tariffs);
export const timeWindows = pgTable(
  'time_windows',
  {
    id: serial('id').primaryKey(), // Unique identifier for each time window record
    facilityId: integer('facility_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table
    operation: varchar('operation', { length: 50 }).notNull(), // Type of operation (Processing, Generating Orders, Production, Receiving & Unloading)
    daysOfWeek: integer('days_of_week').notNull(), // integer field specifying days of the week for the time window
    startTime: timestamp('start_time').defaultNow(), // Start of the operating hours
    endTime: timestamp('end_time').defaultNow(), // End of the operating hours
    timePeriodId: integer('time_period_id')
      .notNull()
      .references(() => periods.id, { onDelete: 'cascade' }) // Foreign key to Periods table
  },
  (table) => {
    return {
      idxTimeWindowsFacilityOperation: index(
        'idx_time_windows_facility_operation'
      ).on(table.facilityId, table.operation) // Index for querying by facility and operation
    };
  }
);
export const insertTimeWindowsSchema = createInsertSchema(timeWindows);

export const vehicleSelectionMode = pgTable(
  'vehicle_selection_mode',
  {
    id: serial('id').primaryKey(), // Unique identifier for each vehicle selection mode record
    fromId: integer('from_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the source site
    toId: integer('to_id')
      .notNull()
      .references(() => facilities.id, { onDelete: 'cascade' }), // Foreign key to Facilities table for the destination site
    type: varchar('type', { length: 50 }).notNull(), // Vehicle selection mode (Cheapest, Fastest, Closest fit, By priority)
    parameters: integer('parameters') // integer field for selection mode parameters
  },
  (table) => {
    return {
      idxVehicleSelectionModeFromTo: index(
        'idx_vehicle_selection_mode_from_to'
      ).on(table.fromId, table.toId) // Index for querying by source and destination
    };
  }
);
export const insertVehicleSelectionModeSchema = createInsertSchema(vehicleSelectionMode);

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull()
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions)
}));

export const insertAccountSchema = createInsertSchema(accounts);

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  plaidId: text('plaid_id'),
  name: text('name').notNull(),
  userId: text('user_id').notNull()
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions)
}));

export const insertCategorySchema = createInsertSchema(categories);

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  amount: integer('amount').notNull(),
  payee: text('payee').notNull(),
  notes: text('notes'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  accountId: text('account_id')
    .references(() => accounts.id, {
      onDelete: 'cascade'
    })
    .notNull(),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null'
  })
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id]
  }),
  categories: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id]
  })
}));

export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date()
});

export const connectedBanks = pgTable('connected_banks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accessToken: text('access_token').notNull()
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  subscriptionId: text('subscription_id').notNull().unique(),
  status: text('status').notNull()
});