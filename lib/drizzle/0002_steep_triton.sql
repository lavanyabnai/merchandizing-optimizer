CREATE TABLE "assortment_customer_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"segment_name" varchar(100) NOT NULL,
	"description" text,
	"avg_basket_size" double precision,
	"avg_transaction_value" double precision,
	"visit_frequency" double precision,
	"price_elasticity" double precision,
	"promotion_sensitivity" double precision,
	"preferred_brand_tier" varchar(50),
	"preferred_categories" jsonb,
	"demographics" jsonb,
	"store_count" integer,
	"total_revenue" double precision,
	"revenue_share" double precision,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assortment_customer_segments_segment_name_unique" UNIQUE("segment_name")
);
--> statement-breakpoint
CREATE TABLE "assortment_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"on_hand_qty" double precision NOT NULL,
	"on_order_qty" double precision DEFAULT 0,
	"in_transit_qty" double precision DEFAULT 0,
	"avg_weekly_sales" double precision,
	"weeks_of_supply" double precision,
	"reorder_point" double precision,
	"safety_stock" double precision,
	"last_replenish_date" date,
	"snapshot_date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assortment_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"store_id" integer,
	"regular_price" double precision NOT NULL,
	"current_price" double precision NOT NULL,
	"min_price" double precision,
	"max_price" double precision,
	"competitor_price" double precision,
	"price_zone" varchar(50),
	"effective_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assortment_product_hierarchy" (
	"id" serial PRIMARY KEY NOT NULL,
	"department" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"subcategory" varchar(100) NOT NULL,
	"segment" varchar(100),
	"level" integer NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assortment_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"brand" varchar(100) NOT NULL,
	"brand_tier" varchar(50) NOT NULL,
	"hierarchy_id" integer,
	"department" varchar(100),
	"category" varchar(100),
	"subcategory" varchar(100) NOT NULL,
	"segment" varchar(100),
	"size" varchar(50),
	"pack_type" varchar(50),
	"flavor" varchar(100),
	"upc" varchar(20),
	"width_inches" double precision,
	"height_inches" double precision,
	"depth_inches" double precision,
	"weight_oz" double precision,
	"cost" double precision NOT NULL,
	"msrp" double precision,
	"space_elasticity" double precision DEFAULT 0.2,
	"price_elasticity" double precision DEFAULT -1.5,
	"shelf_life_days" integer,
	"min_order_qty" integer DEFAULT 1,
	"case_pack_size" integer,
	"is_active" boolean DEFAULT true,
	"price_tier" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assortment_products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "assortment_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"week_start_date" date,
	"units_sold" double precision NOT NULL,
	"revenue" double precision NOT NULL,
	"cost_total" double precision,
	"profit" double precision,
	"facings" integer,
	"on_promotion" boolean DEFAULT false,
	"promotion_type" varchar(50),
	"promotion_discount" double precision,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assortment_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"name" varchar(255),
	"type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"store_id" integer,
	"inputs" jsonb NOT NULL,
	"results" jsonb,
	"summary" jsonb,
	"execution_time_ms" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assortment_space_allocation" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"shelf_number" integer,
	"position_on_shelf" integer,
	"facings" integer NOT NULL,
	"depth" integer DEFAULT 1,
	"orientation" varchar(20) DEFAULT 'front',
	"linear_inches" double precision,
	"is_active" boolean DEFAULT true,
	"effective_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assortment_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"format" varchar(50) NOT NULL,
	"location_type" varchar(50) NOT NULL,
	"region" varchar(100),
	"district" varchar(100),
	"state" varchar(50),
	"city" varchar(100),
	"zip_code" varchar(20),
	"latitude" double precision,
	"longitude" double precision,
	"income_index" varchar(20),
	"total_square_feet" double precision,
	"selling_square_feet" double precision,
	"total_linear_feet" double precision,
	"total_facings" integer,
	"num_shelves" integer,
	"shelf_width_inches" double precision,
	"weekly_traffic" integer,
	"open_date" date,
	"cluster_id" integer,
	"cluster_name" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assortment_stores_store_code_unique" UNIQUE("store_code")
);
--> statement-breakpoint
ALTER TABLE "assortment_inventory" ADD CONSTRAINT "assortment_inventory_product_id_assortment_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."assortment_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_inventory" ADD CONSTRAINT "assortment_inventory_store_id_assortment_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."assortment_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_pricing" ADD CONSTRAINT "assortment_pricing_product_id_assortment_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."assortment_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_pricing" ADD CONSTRAINT "assortment_pricing_store_id_assortment_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."assortment_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_products" ADD CONSTRAINT "assortment_products_hierarchy_id_assortment_product_hierarchy_id_fk" FOREIGN KEY ("hierarchy_id") REFERENCES "public"."assortment_product_hierarchy"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_sales" ADD CONSTRAINT "assortment_sales_product_id_assortment_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."assortment_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_sales" ADD CONSTRAINT "assortment_sales_store_id_assortment_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."assortment_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_scenarios" ADD CONSTRAINT "assortment_scenarios_store_id_assortment_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."assortment_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_space_allocation" ADD CONSTRAINT "assortment_space_allocation_product_id_assortment_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."assortment_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assortment_space_allocation" ADD CONSTRAINT "assortment_space_allocation_store_id_assortment_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."assortment_stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_acs_name" ON "assortment_customer_segments" USING btree ("segment_name");--> statement-breakpoint
CREATE INDEX "idx_ainv_prod_store" ON "assortment_inventory" USING btree ("product_id","store_id");--> statement-breakpoint
CREATE INDEX "idx_ainv_snapshot" ON "assortment_inventory" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "idx_apr_prod_store" ON "assortment_pricing" USING btree ("product_id","store_id");--> statement-breakpoint
CREATE INDEX "idx_apr_zone" ON "assortment_pricing" USING btree ("price_zone");--> statement-breakpoint
CREATE INDEX "idx_aph_category" ON "assortment_product_hierarchy" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_aph_subcategory" ON "assortment_product_hierarchy" USING btree ("subcategory");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_aph_dept_cat_sub" ON "assortment_product_hierarchy" USING btree ("department","category","subcategory");--> statement-breakpoint
CREATE INDEX "idx_ap_sku" ON "assortment_products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_ap_brand" ON "assortment_products" USING btree ("brand");--> statement-breakpoint
CREATE INDEX "idx_ap_subcategory" ON "assortment_products" USING btree ("subcategory");--> statement-breakpoint
CREATE INDEX "idx_ap_brand_tier" ON "assortment_products" USING btree ("brand_tier");--> statement-breakpoint
CREATE INDEX "idx_ap_active" ON "assortment_products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_asl_prod_store_week" ON "assortment_sales" USING btree ("product_id","store_id","week_number","year");--> statement-breakpoint
CREATE INDEX "idx_asl_product" ON "assortment_sales" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_asl_store" ON "assortment_sales" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "idx_asl_week_year" ON "assortment_sales" USING btree ("year","week_number");--> statement-breakpoint
CREATE INDEX "idx_ascn_user" ON "assortment_scenarios" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ascn_type" ON "assortment_scenarios" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_ascn_status" ON "assortment_scenarios" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ascn_created" ON "assortment_scenarios" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_asa_prod_store" ON "assortment_space_allocation" USING btree ("product_id","store_id");--> statement-breakpoint
CREATE INDEX "idx_asa_store_shelf" ON "assortment_space_allocation" USING btree ("store_id","shelf_number");--> statement-breakpoint
CREATE INDEX "idx_as_store_code" ON "assortment_stores" USING btree ("store_code");--> statement-breakpoint
CREATE INDEX "idx_as_format" ON "assortment_stores" USING btree ("format");--> statement-breakpoint
CREATE INDEX "idx_as_region" ON "assortment_stores" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_as_cluster" ON "assortment_stores" USING btree ("cluster_id");