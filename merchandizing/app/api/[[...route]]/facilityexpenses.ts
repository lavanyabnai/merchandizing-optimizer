import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  facilityExpenses,
  facilities,
  periods,
  insertFacilityExpenseSchema
} from '@/db/schema';

const patchFacilityExpenseSchema = z.object({
  facilityId: z.number(),
  expenseType: z.string(),
  value: z.number(),
  currency: z.string(),
  timeUnit: z.string(),
  productUnit: z.string(),
  timePeriodId: z.number()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: facilityExpenses.id,
        facilityId: facilityExpenses.facilityId,
        facilityName: facilities.name,
        expenseType: facilityExpenses.expenseType,
        value: facilityExpenses.value,
        currency: facilityExpenses.currency,
        timeUnit: facilityExpenses.timeUnit,
        productUnit: facilityExpenses.productUnit,
        timePeriodId: facilityExpenses.timePeriodId,
        timePeriod: periods.name
      })
      .from(facilityExpenses)
      .innerJoin(facilities, eq(facilityExpenses.facilityId, facilities.id))
      .innerJoin(periods, eq(facilityExpenses.timePeriodId, periods.id));

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
        .from(facilityExpenses)
        .where(eq(facilityExpenses.id, parseInt(id)));

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
      insertFacilityExpenseSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db
        .insert(facilityExpenses)
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
        insertFacilityExpenseSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      const data = await db
        .insert(facilityExpenses)
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
          .delete(facilityExpenses)
          .where(inArray(facilityExpenses.id, ids))
          .returning({ id: facilityExpenses.id });

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
        .delete(facilityExpenses)
        .where(eq(facilityExpenses.id, parseInt(id)))
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
    zValidator('json', patchFacilityExpenseSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(facilityExpenses)
          .set({
            ...values,
            value: values.value.toString()
          })
          .where(eq(facilityExpenses.id, parseInt(id)))
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
