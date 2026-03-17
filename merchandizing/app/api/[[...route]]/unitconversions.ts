import { zValidator } from '@hono/zod-validator';
import { eq, inArray} from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  unitConversions,
  products,
  insertunitConversionSchema
} from '@/db/schema';

const patchunitConversionSchema = z.object({
  productId: z.number().optional(),
  amountFrom: z.number().optional(),
  unitFrom: z.string().optional(),
  amountTo: z.number().optional(),
  unitTo: z.string(),
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: unitConversions.id,
        productId: unitConversions.productId,
        amountFrom: unitConversions.amountFrom,
        unitFrom: unitConversions.unitFrom,
        amountTo: unitConversions.amountTo,
        unitTo: unitConversions.unitTo,
        createdAt: unitConversions.createdAt,
        updatedAt: unitConversions.updatedAt,
        productName: products.name
      })
      .from(unitConversions)
      .innerJoin(products, eq(unitConversions.productId, products.id));

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
        .from(unitConversions)
        .where(eq(unitConversions.id, parseInt(id)));

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
      insertunitConversionSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');
  
      if (!auth?.userId) {
        console.error('❌ Unauthorized');
        return c.json({ error: 'Unauthorized' }, 401);
      }
  
      try {
        console.log('✅ Values received:', values); // Log received values for debugging
  
        const [data] = await db
          .insert(unitConversions)
          .values({
            ...values
          })
          .returning();
  
        console.log('✅ Data inserted:', data); // Log the data returned from insertion
        return c.json({ data });
      } catch (error) {
        console.error('❌ Insertion Error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertunitConversionSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      const data = await db
        .insert(unitConversions)
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
          .delete(unitConversions)
          .where(inArray(unitConversions.id, ids))
          .returning({ id: unitConversions.id });

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
        .delete(unitConversions)
        .where(eq(unitConversions.id, parseInt(id)))
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
    zValidator('json', patchunitConversionSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(unitConversions)
          .set({
            ...values,
            amountFrom: values.amountFrom?.toString(),
            amountTo: values.amountTo?.toString()
          })
          .where(eq(unitConversions.id, parseInt(id)))
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
