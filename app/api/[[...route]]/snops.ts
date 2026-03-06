import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  snops,
  insertSnopSchema,
  facilities,
  products,
  periods,
  saleBatches
} from '@/db/schema';

const patchSnopSchema = z.object({
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
            id: snops.id,
            sourceId: snops.sourceId,
            sourceName: facilities.name,
            productId: snops.productId,
            productName: products.name,
            type: snops.type,
            batchSize: snops.batchSize,
            stepSize: snops.stepSize,
            pricePerUnit: snops.pricePerUnit,
            currency: snops.currency,
            timePeriodId: snops.timePeriodId,
            timePeriodName: periods.name
          })
          .from(snops)
          .leftJoin(facilities, eq(snops.sourceId, facilities.id))
          .leftJoin(products, eq(snops.productId, products.id))
          .leftJoin(periods, eq(snops.timePeriodId, periods.id))
          .where(
            and(
              sourceId !== undefined
                ? eq(snops.sourceId, sourceId)
                : undefined,
              productId !== undefined
                ? eq(snops.productId, productId)
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
      insertSnopSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(snops).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertSnopSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      await db.delete(snops);
      const data = await db.insert(snops).values(values).returning();

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
    zValidator('json', patchSnopSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .update(snops)
        .set({
          sourceId: values.sourceId,
          productId: values.productId,
          type: values.type,
          batchSize: values.batchSize,
          pricePerUnit: values.pricePerUnit,
          currency: values.currency,
          stepSize: values.stepSize,
          timePeriodId: values.timePeriodId,
        })
        .where(eq(snops.id, Number(id)))
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
        .delete(snops)
        .where(eq(snops.id, Number(id)))
        .returning({
          id: snops.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;