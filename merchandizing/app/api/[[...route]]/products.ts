import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { products, insertProductSchema } from '@/db/schema';

const app = new Hono()
  .get('/', async (c) => {

    const data = await db.select().from(products);

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
        .from(products)
        .where(eq(products.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', z.object({
      name: z.string(),
      unit: z.string(),
      sellingPrice: z.number(),
      cost: z.number(),
      currency: z.string()
    })),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(products).values({
        ...values,
        sellingPrice: values.sellingPrice?.toString(),
        cost: values.cost?.toString()
      }).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertProductSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');

      // delete all products before inserting new ones and suggest the imports required
      await db.delete(products);
      const data = await db.insert(products).values(values).returning();

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
          .delete(products)
          .where(inArray(products.id, ids))
          .returning({ id: products.id });

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
        .delete(products)
        .where(eq(products.id, parseInt(id)))
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
    zValidator('json', z.object({
      name: z.string().optional(),
      unit: z.string().optional(),
      sellingPrice: z.number().optional(),
      cost: z.number().optional(),
      currency: z.string().optional()
    })),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(products)
        .set({
          ...values,
          sellingPrice: values.sellingPrice?.toString(),
          cost: values.cost?.toString()
        })
        .where(eq(products.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
