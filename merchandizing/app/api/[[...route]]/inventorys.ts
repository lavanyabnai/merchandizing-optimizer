import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  inventory,
  facilities,
  products,
  periods,
  insertInventorySchema
} from '@/db/schema';

const patchInventorySchema = z.object({
  facilityId: z.number().optional(),
  productId: z.number().optional(),
  policyType: z.string().optional(),
  policyParameters: z.object({}).optional(),
  initialStock: z.number().optional(),
  periodicCheck: z.boolean().optional(),
  period: z.number().optional(),
  firstPeriodicCheck: z.string().optional(),
  policyBasis: z.string().optional(),
  stockCalculationWindow: z.number().optional(),
  timeUnit: z.string().optional(),
  minSplitRatio: z.number().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: inventory.id,
        facilityId: inventory.facilityId,
        productId: inventory.productId,
        policyType: inventory.policyType,
        policyParameters: inventory.policyParameters,
        initialStock: inventory.initialStock,
        periodicCheck: inventory.periodicCheck,
        period: inventory.period,
        firstPeriodicCheck: inventory.firstPeriodicCheck,
        policyBasis: inventory.policyBasis,
        stockCalculationWindow: inventory.stockCalculationWindow,
        timeUnit: inventory.timeUnit,
        minSplitRatio: inventory.minSplitRatio,
        timePeriodId: inventory.timePeriodId,
        inclusionType: inventory.inclusionType,
        facilityName: facilities.name,
        productName: products.name,
        timePeriodName: periods.name,
      })
      .from(inventory)
      .innerJoin(facilities, eq(inventory.facilityId, facilities.id))
      .innerJoin(products, eq(inventory.productId, products.id))
      .innerJoin(periods, eq(inventory.timePeriodId, periods.id));

    return c.json({ data });
  })
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      const [data] = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, parseInt(id)));

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
      insertInventorySchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db
        .insert(inventory)
        .values({
          ...values
        })
        .returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertInventorySchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      const data = await db
        .insert(inventory)
        .values(
          values.map((value) => ({
            ...value
          }))
        )
        .returning();
      return c.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number())
      })
    ),
    async (c) => {
      const { ids } = c.req.valid('json');

      try {
        const data = await db
          .delete(inventory)
          .where(inArray(inventory.id, ids))
          .returning({ id: inventory.id });

        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      const [data] = await db
        .delete(inventory)
        .where(eq(inventory.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
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
    zValidator('json', patchInventorySchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(inventory)
          .set({
            ...values,
            policyParameters: values.policyParameters ? parseInt(JSON.stringify(values.policyParameters)) : undefined,
            initialStock: values.initialStock?.toString(),
            minSplitRatio: values.minSplitRatio?.toString()
          })
          .where(eq(inventory.id, parseInt(id)))
          .returning();

        if (!data) {
          throw new Error('Not found');
        }

        return c.json({ data });
      } catch (error) {
        console.error('❌ PATCH ERROR:', error);
        if (error instanceof z.ZodError) {
          console.error('Validation error:', error.errors);
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return c.json(
          { error: errorMessage },
          errorMessage === 'Unauthorized' ? 401 : 404
        );
      }
    }
  );

export default app;