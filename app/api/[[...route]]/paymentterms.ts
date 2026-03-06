import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  paymentTerms,
  facilities,
  products,
  periods,
  insertPaymentTermsSchema
} from '@/db/schema';

const patchPaymentTermsSchema = z.object({
  sellerId: z.number().optional(),
  buyerId: z.number().optional(),
  productId: z.number().optional(),
  defermentPeriod: z.string().optional(),
  timeUnit: z.string().optional(),
  downPaymentRatio: z.string().optional(),
  timePeriodId: z.number().optional()
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db
      .select({
        id: paymentTerms.id,
        sellerId: paymentTerms.sellerId,
        sellerName: facilities.name,
        buyerId: paymentTerms.buyerId,
        buyerName: facilities.name,
        productId: paymentTerms.productId,
        productName: products.name,
        defermentPeriod: paymentTerms.defermentPeriod,
        timeUnit: paymentTerms.timeUnit,
        downPaymentRatio: paymentTerms.downPaymentRatio,
        timePeriodId: paymentTerms.timePeriodId,
        timePeriodName: periods.name
      })
      .from(paymentTerms)
      .innerJoin(facilities, eq(paymentTerms.sellerId, facilities.id))
      .innerJoin(facilities, eq(paymentTerms.buyerId, facilities.id))
      .innerJoin(products, eq(paymentTerms.productId, products.id))
      .innerJoin(periods, eq(paymentTerms.timePeriodId, periods.id));

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
        .from(paymentTerms)
        .where(eq(paymentTerms.id, parseInt(id)));
      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertPaymentTermsSchema),
    async (c) => {
      const values = c.req.valid('json');
      const [data] = await db.insert(paymentTerms).values(values).returning();
      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertPaymentTermsSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      const data = await db
        .insert(paymentTerms)
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
    zValidator('json', z.object({ ids: z.array(z.number()) })),
    async (c) => {
      const { ids } = c.req.valid('json');
      try {
        const data = await db
          .delete(facilities)
          .where(inArray(facilities.id, ids))
          .returning({ id: facilities.id });
        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const [data] = await db
        .delete(facilities)
        .where(eq(facilities.id, parseInt(id)))
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
    zValidator('json', patchPaymentTermsSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(paymentTerms)
          .set({
            ...values,
            defermentPeriod: values.defermentPeriod?.toString(),
            downPaymentRatio: values.downPaymentRatio?.toString()
          })
          .where(eq(paymentTerms.id, parseInt(id)))
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
