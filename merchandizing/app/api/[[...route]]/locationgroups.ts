import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { locationGroups, insertLocationGroupSchema } from '@/db/schema';

const patchGroupSchema = z.object({
  name: z.string().optional(),
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db.select().from(locationGroups);

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
        .from(locationGroups)
        .where(eq(locationGroups.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertLocationGroupSchema),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(locationGroups).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertLocationGroupSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      await db.delete(locationGroups);
      const data = await db.insert(locationGroups).values(values).returning();

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
          .delete(locationGroups)
          .where(inArray(locationGroups.id, ids))
          .returning({ id: locationGroups.id });

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
        .delete(locationGroups)
        .where(eq(locationGroups.id, parseInt(id)))
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
    zValidator('json', patchGroupSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(locationGroups)
        .set(values)
        .where(eq(locationGroups.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
