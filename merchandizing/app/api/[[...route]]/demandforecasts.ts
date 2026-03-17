import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  demandForecast,
  facilities,
  products,
  periods,
  insertDemandForecastSchema
} from '@/db/schema';

const patchDemandForecastSchema = z.object({
  facilityId: z.number().optional(),
  productId: z.number().optional(),
  type: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  timePeriodId: z.number().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: demandForecast.id,
        facilityId: demandForecast.facilityId,
        facilityName: facilities.name,
        productId: demandForecast.productId,
        productName: products.name,
        type: demandForecast.type,
        parameters: demandForecast.parameters,
        timePeriodId: demandForecast.timePeriodId,
        timePeriodName: periods.name
      })
      .from(demandForecast)
      .innerJoin(facilities, eq(demandForecast.facilityId, facilities.id))
      .innerJoin(products, eq(demandForecast.productId, products.id))
      .innerJoin(periods, eq(demandForecast.timePeriodId, periods.id));

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
        .from(demandForecast)
        .where(eq(demandForecast.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertDemandForecastSchema),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db
        .insert(demandForecast)
        .values(values)
        .returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertDemandForecastSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      try {
        const values = c.req.valid('json');

        const data = await db
          .insert(demandForecast)
          .values(values) // No need to map since values are already validated
          .returning();

        return c.json({ data });
      } catch (error) {
        console.error('❌ BULK CREATE ERROR:', error);
        if (error instanceof z.ZodError) {
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return c.json(
          { error: errorMessage },
          errorMessage === 'Unauthorized' ? 401 : 500
        );
      }
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
          .delete(demandForecast)
          .where(inArray(demandForecast.id, ids))
          .returning({ id: demandForecast.id });

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
        .delete(demandForecast)
        .where(eq(demandForecast.id, parseInt(id)))
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
    zValidator('json', patchDemandForecastSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(demandForecast)
          .set({
            ...values,
            parameters: values.parameters ? parseInt(JSON.stringify(values.parameters)) : undefined
          })
          .where(eq(demandForecast.id, parseInt(id)))
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
