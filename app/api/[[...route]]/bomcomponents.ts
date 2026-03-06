import { zValidator } from '@hono/zod-validator';
import { eq, inArray} from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  bomComponents,
  bom,
  products,
  insertBomComponentsSchema
} from '@/db/schema';

const patchBomSchema = z.object({
  bomId: z.number(),
  productId: z.number(),
  quantity: z.string()
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db
      .select({
        id: bomComponents.id,
        bomId: bomComponents.bomId,
        bomName: bom.name,
        productId: bomComponents.productId,
        productName: products.name,
        quantity: bomComponents.quantity
      })
      .from(bomComponents)
      .innerJoin(products, eq(bomComponents.productId, products.id))
      .innerJoin(bom, eq(bomComponents.bomId, bom.id));

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
        .from(bomComponents)
        .where(eq(bomComponents.id, parseInt(id)));
      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertBomComponentsSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Received POST data:', values);

        const [data] = await db
          .insert(bomComponents)
          .values(values)
          .returning();
        return c.json({ data });
      } catch (error) {
        console.error('POST Error:', error);

        if (error instanceof z.ZodError) {
          return c.json(
            {
              error: 'Validation error',
              details: error.errors
            },
            400
          );
        }

        return c.json(
          {
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertBomComponentsSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      try {
        const values = c.req.valid('json');

        // Delete existing BOMs and insert new ones
        await db.delete(bomComponents);
        const data = await db
          .insert(bomComponents)
          .values(values)
          .returning();

        return c.json({ data });
      } catch (error) {
        console.error('Bulk create error:', error);
        if (error instanceof z.ZodError) {
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        return c.json(
          { 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    }
  )
  .post(
    '/bulk-delete',
    zValidator('json', z.object({ ids: z.array(z.number()) })),
    async (c) => {
      const { ids } = c.req.valid('json');
      try {
        const data = await db
          .delete(bomComponents)
          .where(inArray(bomComponents.id, ids))
          .returning({ id: bomComponents.id });
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
        .delete(bomComponents)
        .where(eq(bomComponents.id, parseInt(id)))
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
    zValidator('json', patchBomSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(bomComponents)
          .set({
            ...values,
            quantity: values.quantity.toString()
          })
          .where(eq(bomComponents.id, parseInt(id)))
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
