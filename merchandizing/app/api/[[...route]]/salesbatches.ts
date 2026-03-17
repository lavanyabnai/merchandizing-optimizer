import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  saleBatches,
  insertSaleBatchSchema,
  facilities,
  products,
  periods
} from '@/db/schema';

const patchSaleBatchSchema = z.object({
  sourceId: z.number(),
  productId: z.number(),
  type: z.string(),
  batchSize: z.number(),
  stepSize: z.number().optional(),
  pricePerUnit: z.number(),
  currency: z.string(),
  timePeriodId: z.number().optional()
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        sourceId: z.number().optional(),
        productId: z.number().optional(),
        timePeriodId: z.number().optional()
      })
    ),
    async (c) => {
      const { sourceId, productId, timePeriodId } = c.req.valid('query');

      try {
        const data = await db
          .select({
            id: saleBatches.id,
            sourceId: saleBatches.sourceId,
            sourceName: facilities.name,
            productId: saleBatches.productId,
            productName: products.name,
            type: saleBatches.type,
            batchSize: saleBatches.batchSize,
            stepSize: saleBatches.stepSize,
            pricePerUnit: saleBatches.pricePerUnit,
            currency: saleBatches.currency,
            timePeriodId: saleBatches.timePeriodId,
            timePeriodName: periods.name
          })
          .from(saleBatches)
          .leftJoin(facilities, eq(saleBatches.sourceId, facilities.id))
          .leftJoin(products, eq(saleBatches.productId, products.id))
          .leftJoin(periods, eq(saleBatches.timePeriodId, periods.id))
          .where(
            and(
              sourceId !== undefined
                ? eq(saleBatches.sourceId, sourceId)
                : undefined,
              productId !== undefined
                ? eq(saleBatches.productId, productId)
                : undefined,
              timePeriodId !== undefined
                ? eq(saleBatches.timePeriodId, timePeriodId)
                : undefined
            )
          )
          .orderBy(desc(saleBatches.id));

        return c.json({ data });
      } catch (error) {
        console.error('Error fetching data:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
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
        .from(saleBatches)
        .where(eq(saleBatches.id, Number(id))); // Convert id to a number

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
      insertSaleBatchSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(saleBatches).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertSaleBatchSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      await db.delete(saleBatches);
      const data = await db.insert(saleBatches).values(values).returning();

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
          .delete(saleBatches)
          .where(inArray(saleBatches.id, ids)) // Use ids directly
          .returning({ id: saleBatches.id });

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
    zValidator('json', patchSaleBatchSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .update(saleBatches)
        .set({
          sourceId: values.sourceId,
          productId: values.productId,
          type: values.type,
          batchSize: values.batchSize.toString(),
          pricePerUnit: values.pricePerUnit.toString(),
          currency: values.currency,
          stepSize: values.stepSize ? values.stepSize.toString() : undefined,
          timePeriodId: values.timePeriodId ? Number(values.timePeriodId) : undefined,
        })
        .where(eq(saleBatches.id, Number(id)))
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
        .delete(saleBatches)
        .where(eq(saleBatches.id, Number(id)))
        .returning({
          id: saleBatches.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;