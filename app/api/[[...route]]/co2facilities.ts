import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  co2Emissions,
  facilities,
  periods,
  insertCo2EmissionsSchema
} from '@/db/schema';

const patchCo2EmissionsSchema = z.object({
  facilityId: z.number(),
  co2EmissionSource: z.string(),
  co2Produced: z.number(),
  timeUnit: z.string(),
  productUnit: z.string(),
  timePeriodId: z.number()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: co2Emissions.id,
        facilityId: co2Emissions.facilityId,
        facilityName: facilities.name,
        co2EmissionSource: co2Emissions.co2EmissionSource,
        co2Produced: co2Emissions.co2Produced,
        timeUnit: co2Emissions.timeUnit,
        productUnit: co2Emissions.productUnit,
        timePeriodId: co2Emissions.timePeriodId,
        timePeriod: periods.name
      })
      .from(co2Emissions)
      .innerJoin(facilities, eq(co2Emissions.facilityId, facilities.id))
      .innerJoin(periods, eq(co2Emissions.timePeriodId, periods.id));

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
        .from(co2Emissions)
        .where(eq(co2Emissions.id, parseInt(id)));

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
      insertCo2EmissionsSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db
        .insert(co2Emissions)
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
        insertCo2EmissionsSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      const data = await db
        .insert(co2Emissions)
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
          .delete(co2Emissions)
          .where(inArray(co2Emissions.id, ids))
          .returning({ id: co2Emissions.id });

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
        .delete(co2Emissions)
        .where(eq(co2Emissions.id, parseInt(id)))
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
    zValidator('json', patchCo2EmissionsSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(co2Emissions)
          .set({
            ...values,
            co2Produced: values.co2Produced.toString()
          })
          .where(eq(co2Emissions.id, parseInt(id)))
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
