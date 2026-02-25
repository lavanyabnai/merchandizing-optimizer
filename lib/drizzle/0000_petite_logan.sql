CREATE TABLE "assets_constraints" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"min_dcs" integer,
	"max_dcs" integer,
	"time_period" varchar(255),
	"inclusion_type" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bom" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"end_product_id" integer NOT NULL,
	"end_product_name" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bom_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bom_byproducts" (
	"id" serial PRIMARY KEY NOT NULL,
	"bom_id" integer NOT NULL,
	"bom_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom_components" (
	"id" serial PRIMARY KEY NOT NULL,
	"bom_id" integer NOT NULL,
	"bom_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"initial_cash" numeric(15, 2) DEFAULT '0',
	"currency" varchar(10) NOT NULL,
	"interest" numeric(4, 3) DEFAULT '0',
	CONSTRAINT "cash_accounts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "co2_emissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"co2_emission_source" varchar(50) NOT NULL,
	"co2_produced" numeric(15, 2) NOT NULL,
	"time_unit" varchar(50),
	"product_unit" varchar(50),
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "co2_processing" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"processing_type" varchar(50) NOT NULL,
	"units" varchar(50) NOT NULL,
	"co2_produced" numeric(15, 2) NOT NULL,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"co2_calculation_formula" text
);
--> statement-breakpoint
CREATE TABLE "cog_new_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20),
	"name" varchar(255) NOT NULL,
	"city" varchar(255),
	"region" varchar(255),
	"country" varchar(255),
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cog_new_locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "custom_constraints" (
	"id" serial PRIMARY KEY NOT NULL,
	"left_hand_side" text NOT NULL,
	"comparison_type" varchar(2) NOT NULL,
	"right_hand_side" text NOT NULL,
	"constraint_type" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "uc_left_right" UNIQUE("left_hand_side","right_hand_side"),
	CONSTRAINT "comparison_type_check" CHECK ("custom_constraints"."comparison_type" IN ('=', '<>', '>', '<', '>=', '<=')),
	CONSTRAINT "constraint_type_check" CHECK ("custom_constraints"."constraint_type" IN ('hard', 'soft', 'variable'))
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) DEFAULT 'Customer',
	"location_id" integer NOT NULL,
	"location_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(50) NOT NULL,
	"additional_params" integer,
	"icon" varchar(255) DEFAULT 'default_icon',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "demand" (
	"customer_id" integer NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"demand_type" varchar(100) NOT NULL,
	"parameters" integer,
	"revenue" numeric(10, 2),
	"down_penalty" numeric(10, 2) DEFAULT '0',
	"up_penalty" numeric(10, 2) DEFAULT '0',
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"expected_lead_time" numeric(5, 2),
	"time_unit" varchar(50),
	"min_split_ratio" numeric(3, 2) DEFAULT '1.0',
	"backorder_policy" varchar(20) DEFAULT 'Not Allowed',
	"inclusion_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "demand_customer_id_product_id_time_period_id_pk" PRIMARY KEY("customer_id","product_id","time_period_id"),
	CONSTRAINT "demand_type_check" CHECK ("demand"."demand_type" IN ('Periodic demand', 'Periodic demand with first occurrence', 'Historic demand')),
	CONSTRAINT "min_split_ratio_check" CHECK ("demand"."min_split_ratio" > 0 AND "demand"."min_split_ratio" < 1),
	CONSTRAINT "backorder_policy_check" CHECK ("demand"."backorder_policy" IN ('Not Allowed', 'Allowed Total')),
	CONSTRAINT "inclusion_type_check" CHECK ("demand"."inclusion_type" IN ('Include', 'Exclude'))
);
--> statement-breakpoint
CREATE TABLE "demand_coverage_by_distances" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"distance_to_site_km" numeric(10, 2),
	"demand_percentage" numeric(8, 2),
	"demand_m3" numeric(15, 2),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "demand_coverage_by_distances_site_name_unique" UNIQUE("site_name")
);
--> statement-breakpoint
CREATE TABLE "demand_forecast" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parameters" integer NOT NULL,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demand_fulfillment" (
	"id" serial PRIMARY KEY NOT NULL,
	"iteration" integer NOT NULL,
	"period" integer NOT NULL,
	"customer_id" integer,
	"customer_name" varchar(255) NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"demand_min" numeric(15, 2),
	"demand_max" numeric(15, 2),
	"satisfied" numeric(15, 2),
	"percentage" numeric(5, 2),
	"revenue_per_item" numeric(15, 2),
	"revenue_total" numeric(15, 2),
	"under_cost" numeric(15, 2),
	"over_cost" numeric(15, 2),
	"penalty" numeric(15, 2)
);
--> statement-breakpoint
CREATE TABLE "distance_coverage_by_demands" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"demand_percentage" numeric(8, 2),
	"demand_m3" numeric(15, 2),
	"distance_to_site_km" numeric(10, 2),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "distance_coverage_by_demands_site_name_unique" UNIQUE("site_name")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial NOT NULL,
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"parameters" integer,
	"occurrence_type" varchar(50) NOT NULL,
	"occurrence_time" varchar(50) NOT NULL,
	"trigger_event_name" varchar(100),
	"probability" numeric(3, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) DEFAULT 'DC',
	"location_id" integer NOT NULL,
	"location_name" varchar(255) NOT NULL,
	"initially_open" boolean DEFAULT true,
	"inclusion_type" varchar(50) NOT NULL,
	"capacity" integer,
	"capacity_unit" varchar(50),
	"aggregate_orders_by_location" boolean DEFAULT false,
	"additional_params" integer,
	"icon" varchar(255) DEFAULT 'default_icon',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "facilities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "facility_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"expense_type" varchar(50) NOT NULL,
	"value" numeric(15, 2),
	"currency" varchar(10) NOT NULL,
	"time_unit" varchar(50),
	"product_unit" varchar(50),
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) DEFAULT 'Factory' NOT NULL,
	"location_id" integer NOT NULL,
	"location_name" varchar(255) NOT NULL,
	"initially_open" boolean DEFAULT true NOT NULL,
	"inclusion_type" varchar(50) NOT NULL,
	"capacity" numeric(15, 2),
	"capacity_unit" varchar(50),
	"priority" varchar DEFAULT 'Equal' NOT NULL,
	"aggregate_orders_by_location" boolean DEFAULT false NOT NULL,
	"additional_parameters" integer,
	"icon" varchar(255) DEFAULT 'FACTORY',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "factories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fleets" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"vehicle_type_id" integer NOT NULL,
	"vehicle_type_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"cost" numeric(15, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"time_unit" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "group_customers" (
	"group_id" integer NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"customer_id" integer NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	CONSTRAINT "group_customers_group_id_customer_id_pk" PRIMARY KEY("group_id","customer_id")
);
--> statement-breakpoint
CREATE TABLE "group_groups" (
	"parent_group_id" integer NOT NULL,
	"parent_group_name" varchar(255) NOT NULL,
	"child_group_id" integer NOT NULL,
	"child_group_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_sites" (
	"group_id" integer NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"site_id" integer NOT NULL,
	"site_name" varchar(255) NOT NULL,
	CONSTRAINT "group_sites_group_id_site_id_pk" PRIMARY KEY("group_id","site_id")
);
--> statement-breakpoint
CREATE TABLE "group_suppliers" (
	"group_id" integer NOT NULL,
	"group_name" varchar(255) NOT NULL,
	"supplier_id" integer NOT NULL,
	"supplier_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "icons" (
	"id" serial NOT NULL,
	"facility_type" varchar(50) NOT NULL,
	"red" integer NOT NULL,
	"green" integer NOT NULL,
	"blue" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "icons_facility_type_unique" UNIQUE("facility_type")
);
--> statement-breakpoint
CREATE TABLE "indicator_constraints" (
	"id" serial PRIMARY KEY NOT NULL,
	"if_condition_id" integer NOT NULL,
	"if_condition_name" varchar(255) NOT NULL,
	"then_condition_id" integer NOT NULL,
	"then_condition_name" varchar(255) NOT NULL,
	"inclusion_type" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"policy_type" varchar(50) NOT NULL,
	"policy_parameters" integer,
	"initial_stock" numeric(15, 2) NOT NULL,
	"periodic_check" boolean DEFAULT false NOT NULL,
	"period" integer,
	"first_periodic_check" varchar(50),
	"policy_basis" varchar(50),
	"stock_calculation_window" integer,
	"time_unit" varchar(50) NOT NULL,
	"min_split_ratio" numeric(3, 2),
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linear_ranges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"lower_bound" numeric(15, 2) NOT NULL,
	"expression" text NOT NULL,
	"upper_bound" numeric(15, 2) NOT NULL,
	CONSTRAINT "linear_ranges_name_unique" UNIQUE("name"),
	CONSTRAINT "check_bounds" CHECK ("linear_ranges"."lower_bound" <= "linear_ranges"."upper_bound")
);
--> statement-breakpoint
CREATE TABLE "loading_unloading_gates" (
	"id" serial NOT NULL,
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"vehicle_types" integer NOT NULL,
	"number_of_gates" integer NOT NULL,
	"units" varchar(50) NOT NULL,
	"processing_time" numeric(15, 2) NOT NULL,
	"time_unit" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location_group_locations" (
	"location_group_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	CONSTRAINT "location_group_locations_location_group_id_location_id_pk" PRIMARY KEY("location_group_id","location_id")
);
--> statement-breakpoint
CREATE TABLE "location_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "location_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20),
	"name" varchar(255) NOT NULL,
	"city" varchar(255),
	"region" varchar(255),
	"country" varchar(255) NOT NULL,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"autofill_coordinates" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "locations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "milk_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"destinations" varchar NOT NULL,
	"vehicle_type_id" integer NOT NULL,
	"vehicle_type_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "net_scenario" (
	"id" serial PRIMARY KEY NOT NULL,
	"net_id" varchar(50) NOT NULL,
	"description" text,
	"scenario_type" varchar(50) NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'Not Started' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"ignore_routes" boolean DEFAULT false NOT NULL,
	"demand_type" varchar(50) DEFAULT 'Exact demand' NOT NULL,
	"search_type" varchar(50) DEFAULT 'Find N best' NOT NULL,
	"best_solutions" integer DEFAULT 1 NOT NULL,
	"time_limit_sec" integer DEFAULT 600 NOT NULL,
	"mip_gap" numeric(10, 6) DEFAULT '0.000001' NOT NULL,
	"threads" integer DEFAULT 7 NOT NULL,
	"problem_type" varchar(50) DEFAULT 'Use Big M' NOT NULL,
	"unit_type" varchar(50) DEFAULT 'm³' NOT NULL,
	"distance_type" varchar(50) DEFAULT 'km' NOT NULL,
	"currency" varchar(50) DEFAULT 'USD' NOT NULL,
	"solution_pool" text,
	"objective_value" numeric(20, 6),
	"solve_time_sec" numeric(10, 3),
	"iterations" integer,
	"gap" numeric(10, 6),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" text,
	CONSTRAINT "net_scenario_net_id_unique" UNIQUE("net_id")
);
--> statement-breakpoint
CREATE TABLE "objective_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"expression" text NOT NULL,
	"coefficient" numeric(15, 2) DEFAULT '1.00',
	"add_to_objective" boolean DEFAULT true,
	"inclusion_type" varchar(10),
	"custom_constraint_id" integer,
	CONSTRAINT "objective_members_name_unique" UNIQUE("name"),
	CONSTRAINT "inclusion_type_check" CHECK ("objective_members"."inclusion_type" IN ('Include', 'Exclude'))
);
--> statement-breakpoint
CREATE TABLE "ordering_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_id" integer NOT NULL,
	"destination_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"rule" varchar(50) NOT NULL,
	"limit_units" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"from_location" varchar(255) NOT NULL,
	"to_location" varchar(255) NOT NULL,
	"cost_calculation_policy" varchar(50) NOT NULL,
	"cost_pu_pk" numeric(10, 2) DEFAULT '0',
	"cost_calculation_params" integer DEFAULT 0,
	"co2_calculation_params" integer DEFAULT 0,
	"currency" varchar(10),
	"distance" numeric(10, 2) DEFAULT '0',
	"distance_unit" varchar(20),
	"transportation_time" numeric(10, 2) DEFAULT '0',
	"time_unit" varchar(20),
	"straight" boolean DEFAULT false,
	"vehicle_type_id" integer,
	"vehicle_type_name" varchar(255) NOT NULL,
	"transportation_policy" varchar(10),
	"min_load_ratio" numeric(5, 2),
	"time_period" varchar(50),
	"inclusion_type" varchar(10) DEFAULT 'Include',
	CONSTRAINT "paths_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payment_terms" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" integer NOT NULL,
	"seller_name" varchar(255) NOT NULL,
	"buyer_id" integer NOT NULL,
	"buyer_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"deferment_period" numeric(10, 2) NOT NULL,
	"time_unit" varchar(50) NOT NULL,
	"down_payment_ratio" numeric(5, 2) NOT NULL,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "period_group_periods" (
	"period_group_id" integer NOT NULL,
	"period_group_name" varchar(255) NOT NULL,
	"period_id" integer NOT NULL,
	"period_name" varchar(255) NOT NULL,
	CONSTRAINT "period_group_periods_period_group_id_period_id_pk" PRIMARY KEY("period_group_id","period_id")
);
--> statement-breakpoint
CREATE TABLE "period_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "period_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start" date NOT NULL,
	"end" date NOT NULL,
	"demand_coefficient" numeric NOT NULL,
	CONSTRAINT "periods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "processing_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"units" varchar(10) NOT NULL,
	"cost" numeric(15, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL,
	CONSTRAINT "type_check" CHECK ("processing_costs"."type" IN ('Inbound shipment processing', 'Outbound shipment processing'))
);
--> statement-breakpoint
CREATE TABLE "processing_time" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"units" varchar(50) NOT NULL,
	"time" numeric(10, 2) NOT NULL,
	"time_unit" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255),
	"source_id" integer,
	"source_name" varchar(255) NOT NULL,
	"destination_id" integer,
	"destination_name" varchar(255) NOT NULL,
	"vehicle_type_id" integer,
	"vehicle_type_name" varchar(255) NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"expand_sources" boolean DEFAULT true,
	"expand_destinations" boolean DEFAULT true,
	"expand_products" boolean DEFAULT true,
	"min_throughput" numeric(15, 2) DEFAULT '0',
	"max_throughput" numeric(15, 2) DEFAULT '0',
	"fixed" boolean DEFAULT false,
	"fixed_value" numeric(15, 2),
	"product_unit" varchar(50),
	"down_penalty" numeric(15, 2) DEFAULT '0',
	"up_penalty" numeric(15, 2) DEFAULT '0',
	"currency" varchar(10),
	"distance_limit" numeric(10, 2),
	"distance_unit" varchar(50),
	"time_limit" numeric(10, 2),
	"time_unit" varchar(50),
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL,
	"expand_periods" boolean DEFAULT true,
	"inclusion_type" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "product_group_products" (
	"product_group_id" integer NOT NULL,
	"product_group_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	CONSTRAINT "product_group_products_product_group_id_product_id_pk" PRIMARY KEY("product_group_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "product_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_storages" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"expand_facilities" boolean DEFAULT false,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"expand_products" boolean DEFAULT false,
	"initial_stock" numeric(15, 2) DEFAULT '0',
	"min_stock" numeric(15, 2),
	"safety_stock" numeric(15, 2),
	"max_stock" numeric(15, 2),
	"fixed" boolean DEFAULT false,
	"fixed_value" numeric(15, 2),
	"understock_penalty" numeric(15, 2),
	"safety_stock_penalty" numeric(15, 2),
	"overstock_penalty" numeric(15, 2),
	"currency" varchar(10),
	"product_unit" varchar(50),
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL,
	"expand_periods" boolean DEFAULT false,
	"inclusion_type" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "production" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"site_id" integer NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"production_cost" numeric(15, 2),
	"currency" varchar(10),
	"min_throughput" numeric(15, 2) DEFAULT '0',
	"max_throughput" numeric(15, 2) DEFAULT '0',
	"fixed" boolean DEFAULT false,
	"fixed_value" numeric(15, 2),
	"down_penalty" numeric(15, 2) DEFAULT '0',
	"up_penalty" numeric(15, 2) DEFAULT '0',
	"co2_per_product" numeric(15, 2),
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "production_no" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"site_id" integer NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"bom_id" integer,
	"production_cost" numeric(15, 2),
	"currency" varchar(10),
	"min_throughput" numeric(15, 2) DEFAULT '0',
	"max_throughput" numeric(15, 2) DEFAULT '0',
	"fixed" boolean DEFAULT false,
	"fixed_value" numeric(15, 2),
	"down_penalty" numeric(15, 2) DEFAULT '0',
	"up_penalty" numeric(15, 2) DEFAULT '0',
	"co2_per_product" numeric(15, 2),
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"selling_price" numeric NOT NULL,
	"cost" numeric NOT NULL,
	"currency" varchar(3) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sale_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"batch_size" numeric(15, 2) NOT NULL,
	"step_size" numeric(15, 2),
	"price_per_unit" numeric(15, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"destination_id" integer NOT NULL,
	"destination_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"vehicle_type_id" integer NOT NULL,
	"vehicle_type_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parameters" integer,
	"priority" varchar(50) NOT NULL,
	"days_of_week" integer,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp DEFAULT now(),
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_destination" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipping_id" varchar(50) NOT NULL,
	"contents" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "shipping_destination_shipping_id_unique" UNIQUE("shipping_id")
);
--> statement-breakpoint
CREATE TABLE "site_state_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"site_name" varchar(255) NOT NULL,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"new_site_state" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snops" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"batch_size" integer NOT NULL,
	"step_size" integer NOT NULL,
	"price_per_unit" integer NOT NULL,
	"currency" varchar(50) NOT NULL,
	"time_period_id" integer NOT NULL,
	"inclusion_type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sourcing" (
	"id" serial PRIMARY KEY NOT NULL,
	"delivery_destination" varchar(255) NOT NULL,
	"sources" text[],
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"type" varchar(50),
	"parameters" integer,
	"time_period_id" integer,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sourcing_delivery_destination_unique" UNIQUE("delivery_destination")
);
--> statement-breakpoint
CREATE TABLE "sourcing_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination_id" integer NOT NULL,
	"destination_name" varchar(255) NOT NULL,
	"sources" integer,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parameters" integer,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sourcing_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"sourcing_id" varchar(50) NOT NULL,
	"contents" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "sourcing_sources_sourcing_id_unique" UNIQUE("sourcing_id")
);
--> statement-breakpoint
CREATE TABLE "supplier_products" (
	"supplier_id" integer NOT NULL,
	"supplier_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	CONSTRAINT "supplier_products_supplier_id_product_id_pk" PRIMARY KEY("supplier_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(255) DEFAULT 'Supplier',
	"location_id" integer,
	"location_name" varchar(255) NOT NULL,
	"products" integer,
	"inclusion_type" varchar(50),
	"additional_parameters" integer,
	"icon" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "suppliers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tariffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_id" integer NOT NULL,
	"from_name" varchar(255) NOT NULL,
	"to_id" integer NOT NULL,
	"to_name" varchar(255) NOT NULL,
	"product_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"tariff_type" varchar(50) NOT NULL,
	"ad_valorem" numeric(5, 4) NOT NULL,
	"fixed" numeric(15, 2) NOT NULL,
	"product_unit" varchar(50) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL,
	"inclusion_type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_windows" (
	"id" serial PRIMARY KEY NOT NULL,
	"facility_id" integer NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"operation" varchar(50) NOT NULL,
	"days_of_week" integer NOT NULL,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp DEFAULT now(),
	"time_period_id" integer NOT NULL,
	"time_period_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unit_conversions" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"amount_from" numeric NOT NULL,
	"unit_from" varchar(255) NOT NULL,
	"amount_to" numeric NOT NULL,
	"unit_to" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "units_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "vehicle_selection_mode" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_id" integer NOT NULL,
	"from_name" varchar(255) NOT NULL,
	"to_id" integer NOT NULL,
	"to_name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parameters" integer
);
--> statement-breakpoint
CREATE TABLE "vehicle_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"capacity" numeric(15, 2) DEFAULT '0',
	"capacity_unit" varchar(10),
	"speed" numeric(10, 2),
	"speed_unit" varchar(10),
	CONSTRAINT "vehicle_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "assets_constraints" ADD CONSTRAINT "assets_constraints_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets_constraints" ADD CONSTRAINT "assets_constraints_group_name_groups_name_fk" FOREIGN KEY ("group_name") REFERENCES "public"."groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom" ADD CONSTRAINT "bom_end_product_id_products_id_fk" FOREIGN KEY ("end_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom" ADD CONSTRAINT "bom_end_product_name_products_name_fk" FOREIGN KEY ("end_product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_byproducts" ADD CONSTRAINT "bom_byproducts_bom_id_bom_id_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."bom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_byproducts" ADD CONSTRAINT "bom_byproducts_bom_name_bom_name_fk" FOREIGN KEY ("bom_name") REFERENCES "public"."bom"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_byproducts" ADD CONSTRAINT "bom_byproducts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_byproducts" ADD CONSTRAINT "bom_byproducts_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_bom_id_bom_id_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."bom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_bom_name_bom_name_fk" FOREIGN KEY ("bom_name") REFERENCES "public"."bom"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_emissions" ADD CONSTRAINT "co2_emissions_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_emissions" ADD CONSTRAINT "co2_emissions_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_emissions" ADD CONSTRAINT "co2_emissions_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_emissions" ADD CONSTRAINT "co2_emissions_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_processing" ADD CONSTRAINT "co2_processing_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_processing" ADD CONSTRAINT "co2_processing_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_processing" ADD CONSTRAINT "co2_processing_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_processing" ADD CONSTRAINT "co2_processing_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_processing" ADD CONSTRAINT "co2_processing_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co2_processing" ADD CONSTRAINT "co2_processing_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_location_name_locations_name_fk" FOREIGN KEY ("location_name") REFERENCES "public"."locations"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_icon_icons_facility_type_fk" FOREIGN KEY ("icon") REFERENCES "public"."icons"("facility_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand" ADD CONSTRAINT "demand_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand" ADD CONSTRAINT "demand_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand" ADD CONSTRAINT "demand_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_coverage_by_distances" ADD CONSTRAINT "demand_coverage_by_distances_site_id_facilities_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecast" ADD CONSTRAINT "demand_forecast_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_fulfillment" ADD CONSTRAINT "demand_fulfillment_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_fulfillment" ADD CONSTRAINT "demand_fulfillment_customer_name_customers_name_fk" FOREIGN KEY ("customer_name") REFERENCES "public"."customers"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_fulfillment" ADD CONSTRAINT "demand_fulfillment_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_fulfillment" ADD CONSTRAINT "demand_fulfillment_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distance_coverage_by_demands" ADD CONSTRAINT "distance_coverage_by_demands_site_id_facilities_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_location_name_locations_name_fk" FOREIGN KEY ("location_name") REFERENCES "public"."locations"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_icon_icons_facility_type_fk" FOREIGN KEY ("icon") REFERENCES "public"."icons"("facility_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_expenses" ADD CONSTRAINT "facility_expenses_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_expenses" ADD CONSTRAINT "facility_expenses_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_expenses" ADD CONSTRAINT "facility_expenses_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facility_expenses" ADD CONSTRAINT "facility_expenses_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factories" ADD CONSTRAINT "factories_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factories" ADD CONSTRAINT "factories_location_name_locations_name_fk" FOREIGN KEY ("location_name") REFERENCES "public"."locations"("name") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factories" ADD CONSTRAINT "factories_icon_icons_facility_type_fk" FOREIGN KEY ("icon") REFERENCES "public"."icons"("facility_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleets" ADD CONSTRAINT "fleets_vehicle_type_name_vehicle_types_name_fk" FOREIGN KEY ("vehicle_type_name") REFERENCES "public"."vehicle_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_customers" ADD CONSTRAINT "group_customers_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_customers" ADD CONSTRAINT "group_customers_group_name_groups_name_fk" FOREIGN KEY ("group_name") REFERENCES "public"."groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_customers" ADD CONSTRAINT "group_customers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_customers" ADD CONSTRAINT "group_customers_customer_name_customers_name_fk" FOREIGN KEY ("customer_name") REFERENCES "public"."customers"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_groups" ADD CONSTRAINT "group_groups_parent_group_id_groups_id_fk" FOREIGN KEY ("parent_group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_groups" ADD CONSTRAINT "group_groups_parent_group_name_groups_name_fk" FOREIGN KEY ("parent_group_name") REFERENCES "public"."groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_groups" ADD CONSTRAINT "group_groups_child_group_id_groups_id_fk" FOREIGN KEY ("child_group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_groups" ADD CONSTRAINT "group_groups_child_group_name_groups_name_fk" FOREIGN KEY ("child_group_name") REFERENCES "public"."groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_sites" ADD CONSTRAINT "group_sites_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_sites" ADD CONSTRAINT "group_sites_group_name_groups_name_fk" FOREIGN KEY ("group_name") REFERENCES "public"."groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_sites" ADD CONSTRAINT "group_sites_site_id_facilities_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_sites" ADD CONSTRAINT "group_sites_site_name_facilities_name_fk" FOREIGN KEY ("site_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_suppliers" ADD CONSTRAINT "group_suppliers_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_suppliers" ADD CONSTRAINT "group_suppliers_group_name_groups_name_fk" FOREIGN KEY ("group_name") REFERENCES "public"."groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_suppliers" ADD CONSTRAINT "group_suppliers_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_suppliers" ADD CONSTRAINT "group_suppliers_supplier_name_suppliers_name_fk" FOREIGN KEY ("supplier_name") REFERENCES "public"."suppliers"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_constraints" ADD CONSTRAINT "indicator_constraints_if_condition_id_linear_ranges_id_fk" FOREIGN KEY ("if_condition_id") REFERENCES "public"."linear_ranges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_constraints" ADD CONSTRAINT "indicator_constraints_if_condition_name_linear_ranges_name_fk" FOREIGN KEY ("if_condition_name") REFERENCES "public"."linear_ranges"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_constraints" ADD CONSTRAINT "indicator_constraints_then_condition_id_linear_ranges_id_fk" FOREIGN KEY ("then_condition_id") REFERENCES "public"."linear_ranges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicator_constraints" ADD CONSTRAINT "indicator_constraints_then_condition_name_linear_ranges_name_fk" FOREIGN KEY ("then_condition_name") REFERENCES "public"."linear_ranges"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loading_unloading_gates" ADD CONSTRAINT "loading_unloading_gates_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loading_unloading_gates" ADD CONSTRAINT "loading_unloading_gates_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_group_locations" ADD CONSTRAINT "loc_grp_locs_grp_id_fk" FOREIGN KEY ("location_group_id") REFERENCES "public"."location_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_group_locations" ADD CONSTRAINT "loc_grp_locs_loc_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk_runs" ADD CONSTRAINT "milk_runs_source_id_facilities_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk_runs" ADD CONSTRAINT "milk_runs_source_name_facilities_name_fk" FOREIGN KEY ("source_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk_runs" ADD CONSTRAINT "milk_runs_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milk_runs" ADD CONSTRAINT "milk_runs_vehicle_type_name_vehicle_types_name_fk" FOREIGN KEY ("vehicle_type_name") REFERENCES "public"."vehicle_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_destination_id_facilities_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_destination_name_facilities_name_fk" FOREIGN KEY ("destination_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordering_rules" ADD CONSTRAINT "ordering_rules_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paths" ADD CONSTRAINT "paths_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paths" ADD CONSTRAINT "paths_vehicle_type_name_vehicle_types_name_fk" FOREIGN KEY ("vehicle_type_name") REFERENCES "public"."vehicle_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_seller_id_facilities_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_seller_name_facilities_name_fk" FOREIGN KEY ("seller_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_buyer_id_facilities_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_buyer_name_facilities_name_fk" FOREIGN KEY ("buyer_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_terms" ADD CONSTRAINT "payment_terms_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_group_periods" ADD CONSTRAINT "period_group_periods_period_group_id_period_groups_id_fk" FOREIGN KEY ("period_group_id") REFERENCES "public"."period_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_group_periods" ADD CONSTRAINT "period_group_periods_period_group_name_period_groups_name_fk" FOREIGN KEY ("period_group_name") REFERENCES "public"."period_groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_group_periods" ADD CONSTRAINT "period_group_periods_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_group_periods" ADD CONSTRAINT "period_group_periods_period_name_periods_name_fk" FOREIGN KEY ("period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_costs" ADD CONSTRAINT "processing_costs_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_time" ADD CONSTRAINT "processing_time_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_time" ADD CONSTRAINT "processing_time_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_time" ADD CONSTRAINT "processing_time_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_time" ADD CONSTRAINT "processing_time_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_source_id_facilities_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_source_name_facilities_name_fk" FOREIGN KEY ("source_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_destination_id_facilities_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_destination_name_facilities_name_fk" FOREIGN KEY ("destination_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_vehicle_type_name_vehicle_types_name_fk" FOREIGN KEY ("vehicle_type_name") REFERENCES "public"."vehicle_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_flows" ADD CONSTRAINT "product_flows_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_group_products" ADD CONSTRAINT "product_group_products_product_group_id_product_groups_id_fk" FOREIGN KEY ("product_group_id") REFERENCES "public"."product_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_group_products" ADD CONSTRAINT "product_group_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_group_products" ADD CONSTRAINT "pgp_group_name_fk" FOREIGN KEY ("product_group_name") REFERENCES "public"."product_groups"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_group_products" ADD CONSTRAINT "pgp_product_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_storages" ADD CONSTRAINT "product_storages_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_storages" ADD CONSTRAINT "product_storages_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_storages" ADD CONSTRAINT "product_storages_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_storages" ADD CONSTRAINT "product_storages_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_storages" ADD CONSTRAINT "product_storages_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_storages" ADD CONSTRAINT "product_storages_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_site_id_facilities_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_site_name_facilities_name_fk" FOREIGN KEY ("site_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production" ADD CONSTRAINT "production_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_site_id_facilities_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_site_name_facilities_name_fk" FOREIGN KEY ("site_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_bom_id_bom_id_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."bom"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_no" ADD CONSTRAINT "production_no_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_batches" ADD CONSTRAINT "sale_batches_source_id_facilities_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_batches" ADD CONSTRAINT "sale_batches_source_name_facilities_name_fk" FOREIGN KEY ("source_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_batches" ADD CONSTRAINT "sale_batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_batches" ADD CONSTRAINT "sale_batches_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_batches" ADD CONSTRAINT "sale_batches_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_batches" ADD CONSTRAINT "sale_batches_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_source_id_facilities_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_source_name_facilities_name_fk" FOREIGN KEY ("source_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_destination_id_facilities_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_destination_name_facilities_name_fk" FOREIGN KEY ("destination_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_vehicle_type_id_vehicle_types_id_fk" FOREIGN KEY ("vehicle_type_id") REFERENCES "public"."vehicle_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_vehicle_type_name_vehicle_types_name_fk" FOREIGN KEY ("vehicle_type_name") REFERENCES "public"."vehicle_types"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_policies" ADD CONSTRAINT "shipping_policies_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_state_changes" ADD CONSTRAINT "site_state_changes_site_id_facilities_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_state_changes" ADD CONSTRAINT "site_state_changes_site_name_facilities_name_fk" FOREIGN KEY ("site_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_state_changes" ADD CONSTRAINT "site_state_changes_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_state_changes" ADD CONSTRAINT "site_state_changes_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing" ADD CONSTRAINT "sourcing_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing" ADD CONSTRAINT "sourcing_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing" ADD CONSTRAINT "sourcing_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing" ADD CONSTRAINT "sourcing_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_policies" ADD CONSTRAINT "sourcing_policies_destination_id_facilities_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_policies" ADD CONSTRAINT "sourcing_policies_destination_name_facilities_name_fk" FOREIGN KEY ("destination_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_policies" ADD CONSTRAINT "sourcing_policies_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_policies" ADD CONSTRAINT "sourcing_policies_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_policies" ADD CONSTRAINT "sourcing_policies_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sourcing_policies" ADD CONSTRAINT "sourcing_policies_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplier_name_suppliers_name_fk" FOREIGN KEY ("supplier_name") REFERENCES "public"."suppliers"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_location_name_locations_name_fk" FOREIGN KEY ("location_name") REFERENCES "public"."locations"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_icon_icons_facility_type_fk" FOREIGN KEY ("icon") REFERENCES "public"."icons"("facility_type") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_from_id_facilities_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_from_name_facilities_name_fk" FOREIGN KEY ("from_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_to_id_facilities_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_to_name_facilities_name_fk" FOREIGN KEY ("to_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_windows" ADD CONSTRAINT "time_windows_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_windows" ADD CONSTRAINT "time_windows_facility_name_facilities_name_fk" FOREIGN KEY ("facility_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_windows" ADD CONSTRAINT "time_windows_time_period_id_periods_id_fk" FOREIGN KEY ("time_period_id") REFERENCES "public"."periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_windows" ADD CONSTRAINT "time_windows_time_period_name_periods_name_fk" FOREIGN KEY ("time_period_name") REFERENCES "public"."periods"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_conversions" ADD CONSTRAINT "unit_conversions_product_name_products_name_fk" FOREIGN KEY ("product_name") REFERENCES "public"."products"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_selection_mode" ADD CONSTRAINT "vehicle_selection_mode_from_id_facilities_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_selection_mode" ADD CONSTRAINT "vehicle_selection_mode_from_name_facilities_name_fk" FOREIGN KEY ("from_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_selection_mode" ADD CONSTRAINT "vehicle_selection_mode_to_id_facilities_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_selection_mode" ADD CONSTRAINT "vehicle_selection_mode_to_name_facilities_name_fk" FOREIGN KEY ("to_name") REFERENCES "public"."facilities"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_capacity_unit_units_name_fk" FOREIGN KEY ("capacity_unit") REFERENCES "public"."units"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_types" ADD CONSTRAINT "vehicle_types_speed_unit_units_name_fk" FOREIGN KEY ("speed_unit") REFERENCES "public"."units"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assets_constraints_group_time" ON "assets_constraints" USING btree ("group_id","time_period");--> statement-breakpoint
CREATE INDEX "idx_bom_name" ON "bom" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_bom_end_product" ON "bom" USING btree ("end_product_id");--> statement-breakpoint
CREATE INDEX "idx_bom_byproducts_bom_id" ON "bom_byproducts" USING btree ("bom_id");--> statement-breakpoint
CREATE INDEX "idx_bom_byproducts_product_id" ON "bom_byproducts" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_bom_components_bom_id" ON "bom_components" USING btree ("bom_id");--> statement-breakpoint
CREATE INDEX "idx_bom_components_product_id" ON "bom_components" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_cash_accounts_facility_currency" ON "cash_accounts" USING btree ("facility_id","currency");--> statement-breakpoint
CREATE INDEX "idx_co2_emissions_facility_source" ON "co2_emissions" USING btree ("facility_id","co2_emission_source");--> statement-breakpoint
CREATE INDEX "idx_co2_processing_facility_product" ON "co2_processing" USING btree ("facility_id","product_id","processing_type");--> statement-breakpoint
CREATE INDEX "idx_cog_location_name" ON "cog_new_locations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_cog_location_city" ON "cog_new_locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_cog_location_country" ON "cog_new_locations" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_cog_location_lat_long" ON "cog_new_locations" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "idx_custom_constraints_left_hand_side" ON "custom_constraints" USING btree ("left_hand_side");--> statement-breakpoint
CREATE INDEX "idx_custom_constraints_right_hand_side" ON "custom_constraints" USING btree ("right_hand_side");--> statement-breakpoint
CREATE INDEX "idx_custom_constraints_comparison_type" ON "custom_constraints" USING btree ("comparison_type");--> statement-breakpoint
CREATE INDEX "idx_custom_constraints_constraint_type" ON "custom_constraints" USING btree ("constraint_type");--> statement-breakpoint
CREATE INDEX "idx_demand_customer_product_inclusion" ON "demand" USING btree ("customer_id","product_id","inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_demand_coverage_by_distance_site" ON "demand_coverage_by_distances" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_demand_forecast_facility_product" ON "demand_forecast" USING btree ("facility_id","product_id","type");--> statement-breakpoint
CREATE INDEX "idx_demand_fulfillment_customer" ON "demand_fulfillment" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_demand_fulfillment_product" ON "demand_fulfillment" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_demand_fulfillment_iteration" ON "demand_fulfillment" USING btree ("iteration");--> statement-breakpoint
CREATE INDEX "idx_demand_fulfillment_period" ON "demand_fulfillment" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_distance_coverage_by_demand_site" ON "distance_coverage_by_demands" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_events_name_type" ON "events" USING btree ("name","event_type");--> statement-breakpoint
CREATE INDEX "idx_events_trigger" ON "events" USING btree ("trigger_event_name");--> statement-breakpoint
CREATE INDEX "idx_facilities_name_inclusion_type" ON "facilities" USING btree ("name","inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_facility_expenses_facility_type" ON "facility_expenses" USING btree ("facility_id","expense_type");--> statement-breakpoint
CREATE INDEX "idx_factory_name" ON "factories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_factory_location" ON "factories" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_factory_inclusion_type" ON "factories" USING btree ("inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_factory_priority" ON "factories" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_factory_type" ON "factories" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_factory_name_inclusion" ON "factories" USING btree ("name","inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_factory_location_open" ON "factories" USING btree ("location_id","initially_open");--> statement-breakpoint
CREATE INDEX "idx_fleets_facility_vehicle" ON "fleets" USING btree ("facility_id","vehicle_type_id");--> statement-breakpoint
CREATE INDEX "idx_group_customers_group_id" ON "group_customers" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_group_sites_group_id" ON "group_sites" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "idx_if_condition_id" ON "indicator_constraints" USING btree ("if_condition_id");--> statement-breakpoint
CREATE INDEX "idx_then_condition_id" ON "indicator_constraints" USING btree ("then_condition_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_facility_product" ON "inventory" USING btree ("facility_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_policy_type" ON "inventory" USING btree ("policy_type");--> statement-breakpoint
CREATE INDEX "idx_linear_ranges_name" ON "linear_ranges" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_gates_facility_type" ON "loading_unloading_gates" USING btree ("facility_id","type");--> statement-breakpoint
CREATE INDEX "idx_location_group_id" ON "location_group_locations" USING btree ("location_group_id");--> statement-breakpoint
CREATE INDEX "idx_location_id" ON "location_group_locations" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_location_group_name" ON "location_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_location_name" ON "locations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_location_city" ON "locations" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_location_country" ON "locations" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_location_lat_long" ON "locations" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_location_name_country" ON "locations" USING btree ("name","country") WHERE "locations"."autofill_coordinates" IS TRUE;--> statement-breakpoint
CREATE INDEX "idx_milk_runs_source_vehicle" ON "milk_runs" USING btree ("source_id","vehicle_type_id");--> statement-breakpoint
CREATE INDEX "idx_net_scenario_net_id" ON "net_scenario" USING btree ("net_id");--> statement-breakpoint
CREATE INDEX "idx_net_scenario_status" ON "net_scenario" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_net_scenario_created" ON "net_scenario" USING btree ("created");--> statement-breakpoint
CREATE INDEX "idx_net_scenario_type" ON "net_scenario" USING btree ("scenario_type");--> statement-breakpoint
CREATE INDEX "idx_net_scenario_status_progress" ON "net_scenario" USING btree ("status","progress");--> statement-breakpoint
CREATE INDEX "idx_objective_members_name_inclusion" ON "objective_members" USING btree ("name","inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_ordering_rules_destination_product" ON "ordering_rules" USING btree ("destination_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_paths_from_location" ON "paths" USING btree ("from_location");--> statement-breakpoint
CREATE INDEX "idx_paths_to_location" ON "paths" USING btree ("to_location");--> statement-breakpoint
CREATE INDEX "idx_paths_cost_calculation_policy" ON "paths" USING btree ("cost_calculation_policy");--> statement-breakpoint
CREATE INDEX "idx_paths_vehicle_type_id" ON "paths" USING btree ("vehicle_type_id");--> statement-breakpoint
CREATE INDEX "idx_payment_terms_seller_buyer" ON "payment_terms" USING btree ("seller_id","buyer_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_period_groups_name" ON "period_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "periods_name_idx" ON "periods" USING btree ("name");--> statement-breakpoint
CREATE INDEX "periods_start_end_idx" ON "periods" USING btree ("start","end");--> statement-breakpoint
CREATE INDEX "idx_processing_costs_facility_product" ON "processing_costs" USING btree ("facility_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_processing_costs_type" ON "processing_costs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_processing_costs_currency" ON "processing_costs" USING btree ("currency");--> statement-breakpoint
CREATE INDEX "idx_processing_costs_units" ON "processing_costs" USING btree ("units");--> statement-breakpoint
CREATE INDEX "idx_processing_costs_time_period" ON "processing_costs" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_processing_time_facility_product" ON "processing_time" USING btree ("facility_id","product_id","type");--> statement-breakpoint
CREATE INDEX "idx_product_flows_source_dest" ON "product_flows" USING btree ("source_id","destination_id");--> statement-breakpoint
CREATE INDEX "idx_product_flows_vehicle_type" ON "product_flows" USING btree ("vehicle_type_id");--> statement-breakpoint
CREATE INDEX "idx_product_flows_product" ON "product_flows" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_flows_time_period" ON "product_flows" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_product_flows_inclusion_type" ON "product_flows" USING btree ("inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_product_group_id" ON "product_group_products" USING btree ("product_group_id");--> statement-breakpoint
CREATE INDEX "idx_product_id" ON "product_group_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_group_name" ON "product_groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_product_storages_label" ON "product_storages" USING btree ("label");--> statement-breakpoint
CREATE INDEX "idx_product_storages_facility" ON "product_storages" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "idx_product_storages_product" ON "product_storages" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_storages_time_period" ON "product_storages" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_product_storages_inclusion_type" ON "product_storages" USING btree ("inclusion_type");--> statement-breakpoint
CREATE INDEX "idx_production_label" ON "production" USING btree ("label");--> statement-breakpoint
CREATE INDEX "idx_production_site" ON "production" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_production_product" ON "production" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_production_time_period" ON "production" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_production_label_no" ON "production_no" USING btree ("label");--> statement-breakpoint
CREATE INDEX "idx_production_site_no" ON "production_no" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_production_product_no" ON "production_no" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_production_bom_no" ON "production_no" USING btree ("bom_id");--> statement-breakpoint
CREATE INDEX "idx_production_time_period_no" ON "production_no" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_sale_batches_source" ON "sale_batches" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_sale_batches_product" ON "sale_batches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_sale_batches_time_period" ON "sale_batches" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_shipping_policies_source_destination" ON "shipping_policies" USING btree ("source_id","destination_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_site_state_changes_site" ON "site_state_changes" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "idx_site_state_changes_time_period" ON "site_state_changes" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_sourcing_product_id" ON "sourcing" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_sourcing_time_period_id" ON "sourcing" USING btree ("time_period_id");--> statement-breakpoint
CREATE INDEX "idx_sourcing_delivery_destination" ON "sourcing" USING btree ("delivery_destination");--> statement-breakpoint
CREATE INDEX "idx_sourcing_policies_destination_product" ON "sourcing_policies" USING btree ("destination_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_products_supplier_id" ON "supplier_products" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_supplier_products_product_id" ON "supplier_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_tariffs_from_to_product" ON "tariffs" USING btree ("from_id","to_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_time_windows_facility_operation" ON "time_windows" USING btree ("facility_id","operation");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_conversion" ON "unit_conversions" USING btree ("product_id","unit_from","unit_to");--> statement-breakpoint
CREATE INDEX "idx_unit_conversions_product_id" ON "unit_conversions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_unit_conversions_unit_from" ON "unit_conversions" USING btree ("unit_from");--> statement-breakpoint
CREATE INDEX "idx_unit_conversions_unit_to" ON "unit_conversions" USING btree ("unit_to");--> statement-breakpoint
CREATE INDEX "idx_units_name" ON "units" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_vehicle_selection_mode_from_to" ON "vehicle_selection_mode" USING btree ("from_id","to_id");--> statement-breakpoint
CREATE INDEX "idx_vehicle_types_name" ON "vehicle_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_vehicle_types_capacity_unit" ON "vehicle_types" USING btree ("capacity_unit");--> statement-breakpoint
CREATE INDEX "idx_vehicle_types_speed_unit" ON "vehicle_types" USING btree ("speed_unit");