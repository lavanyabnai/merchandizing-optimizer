import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { cashAccounts, facilities, insertCashAccountSchema } from '@/db/schema';

const patchCashAccountSchema = z.object({
  name: z.string().optional(),
  facilityId: z.number().optional(),
  initialCash: z.number().optional(),
  currency: z.string().optional(),
  interest: z.number().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: cashAccounts.id,
        name: cashAccounts.name,
        facilityId: cashAccounts.facilityId,
        facilityName: facilities.name,
        initialCash: cashAccounts.initialCash,
        currency: cashAccounts.currency,
        interest: cashAccounts.interest
      })
      .from(cashAccounts)
      .innerJoin(facilities, eq(cashAccounts.facilityId, facilities.id));

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
        .from(cashAccounts)
        .where(eq(cashAccounts.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertCashAccountSchema),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(cashAccounts).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertCashAccountSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      try {
        const values = c.req.valid('json');

        const data = await db
          .insert(cashAccounts)
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
          .delete(cashAccounts)
          .where(inArray(cashAccounts.id, ids))
          .returning({ id: cashAccounts.id });

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
        .delete(cashAccounts)
        .where(eq(cashAccounts.id, parseInt(id)))
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
    zValidator('json', patchCashAccountSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(cashAccounts)
          .set({
            ...values,
            initialCash: values.initialCash?.toString(),
            interest: values.interest?.toString()
          })
          .where(eq(cashAccounts.id, parseInt(id)))
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
