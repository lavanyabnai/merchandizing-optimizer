import { zValidator } from '@hono/zod-validator';

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  demand,
  insertDemandSchema,
  customers,
  products,
  periods
} from '@/db/schema';

const patchDemandSchema = z.object({
  customerId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  demandType: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  timePeriodId: z.number().int().positive().optional(),
  revenue: z.number().optional(),
  downPenalty: z.number().optional(),
  upPenalty: z.number().optional(),
  currency: z.string().optional(),
  expectedLeadTime: z.number().optional(),
  timeUnit: z.string().optional(),
  minSplitRatio: z.number().optional(),
  backorderPolicy: z.string().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']).optional()
});


async function fetchEntityMap(table: any, names: string[]) {
  const entities = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(sql`${table.name} IN ${names}`);

  return new Map(entities.map((entity) => [entity.name, entity.id]));
}

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        customerId: z.number().optional(),
        productId: z.number().optional(),
        timePeriodId: z.number().optional()
      })
    ),
    async (c) => {
      const { customerId, productId, timePeriodId } = c.req.valid('query');

      const data = await db
        .select({
          customerId: demand.customerId,
          customerName: customers.name,
          productId: demand.productId,
          productName: products.name,
          demandType: demand.demandType,
          parameters: demand.parameters,
          timePeriodId: demand.timePeriodId,
          timePeriodName: periods.name,
          revenue: demand.revenue,
          downPenalty: demand.downPenalty,
          upPenalty: demand.upPenalty,
          currency: demand.currency,
          expectedLeadTime: demand.expectedLeadTime,
          timeUnit: demand.timeUnit,
          minSplitRatio: demand.minSplitRatio,
          backorderPolicy: demand.backorderPolicy,
          inclusionType: demand.inclusionType,
          createdAt: demand.createdAt,
          updatedAt: demand.updatedAt
        })
        // .select()
        .from(demand)
        .leftJoin(customers, eq(demand.customerId, customers.id))
        .leftJoin(products, eq(demand.productId, products.id))
        .leftJoin(periods, eq(demand.timePeriodId, periods.id))
        .where(
          and(
            customerId ? eq(demand.customerId, customerId) : undefined,
            productId ? eq(demand.productId, productId) : undefined,
            timePeriodId ? eq(demand.timePeriodId, timePeriodId) : undefined
          )
        )
        .orderBy(desc(demand.createdAt));

      return c.json({ data });
    }
  )
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .select()
        .from(demand)
        .where(eq(demand.id, Number(id)))

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator(
      'json',
      insertDemandSchema.omit({
        id: true,
        customerId: true,
        productId: true,
        timePeriodId: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(demand).values(values as any).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertDemandSchema
          .omit({
            id: true,
            customerId: true,
            productId: true,
            timePeriodId: true
          })
          .extend({
            customer_name: z.string(),
            product_name: z.string(),
            time_period_name: z.string()
          })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      // Get all unique names
      const customerNames = Array.from(
        new Set(values.map((v) => v.customer_name))
      );
      const productNames = Array.from(
        new Set(values.map((v) => v.product_name))
      );
      const timePeriodNames = Array.from(
        new Set(values.map((v) => v.time_period_name))
      );

      // Fetch related entities
      const [customerMap, productMap, timePeriodMap] = await Promise.all([
        fetchEntityMap(customers, customerNames),
        fetchEntityMap(products, productNames),
        fetchEntityMap(periods, timePeriodNames)
      ]);

      // Prepare demand data
      const demandData = values.map((value) => {
        const customerId = customerMap.get(value.customer_name);
        const productId = productMap.get(value.product_name);
        const timePeriodId = timePeriodMap.get(value.time_period_name);

        if (!customerId || !productId || !timePeriodId) {
          throw new Error(
            `Missing reference: ${value.customer_name}, ${value.product_name}, ${value.time_period_name}`
          );
        }

        const {
          customer_name,
          product_name,
          time_period_name,
          ...demandFields
        } = value;
        return {
          ...demandFields,
          customerId,
          productId,
          timePeriodId,
          userId: auth.userId
        };
      });

      // Insert demands
      const data = await db.insert(demand).values(demandData as any).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number()) // Change from z.string() to z.number()
      })
    ),
    async (c) => {
      const { ids } = c.req.valid('json'); // Destructure ids directly

      try {
        const data = await db
          .delete(demand)
          .where(inArray(demand.id, ids)) // Use ids directly
          .returning({ id: demand.id });

        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .patch(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    zValidator('json', patchDemandSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const updateValues: Record<string, any> = { ...values };

      if (updateValues.parameters !== undefined) {
        updateValues.parameters = updateValues.parameters === null
          ? null
          : JSON.stringify(updateValues.parameters);
      }

      const [data] = await db
        .update(demand)
        .set(updateValues)
        .where(eq(demand.id, Number(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .delete(demand)
        .where(eq(demand.id, Number(id)))
        .returning({
          id: demand.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
