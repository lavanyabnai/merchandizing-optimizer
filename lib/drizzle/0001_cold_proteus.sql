ALTER TABLE "demand" DROP CONSTRAINT "demand_customer_id_product_id_time_period_id_pk";--> statement-breakpoint
ALTER TABLE "demand" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "demand" ADD CONSTRAINT "demand_customer_id_product_id_time_period_id_unique" UNIQUE("customer_id","product_id","time_period_id");