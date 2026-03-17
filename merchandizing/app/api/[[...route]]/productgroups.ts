import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { productGroups, insertProductGroupSchema } from '@/db/schema';

const app = new Hono()
  .get('/', async (c) => {

    const data = await db.select().from(productGroups);

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
        .from(productGroups)
        .where(eq(productGroups.id, parseInt(id)));

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
    
    })),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(productGroups).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertProductGroupSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');

      // delete all productgroupgroupgroups before inserting new ones and suggest the imports required
      await db.delete(productGroups);
      const data = await db.insert(productGroups).values(values).returning();

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
          .delete(productGroups)
          .where(inArray(productGroups.id, ids))
          .returning({ id: productGroups.id });

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
        .delete(productGroups)
        .where(eq(productGroups.id, parseInt(id)))
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
      name: z.string().optional()
    })),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(productGroups)
        .set(values)
        .where(eq(productGroups.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
