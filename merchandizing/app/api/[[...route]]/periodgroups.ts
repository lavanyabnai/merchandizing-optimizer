import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { periodGroups, insertPeriodGroupSchema } from '@/db/schema';

const patchPeriodGroupSchema = z.object({
  name: z.string().optional(),
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db.select().from(periodGroups);

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
        .from(periodGroups)
        .where(eq(periodGroups.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertPeriodGroupSchema),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(periodGroups).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertPeriodGroupSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      await db.delete(periodGroups);
      const data = await db.insert(periodGroups).values(values).returning();

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
          .delete(periodGroups)
          .where(inArray(periodGroups.id, ids))
          .returning({ id: periodGroups.id });

        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
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
    zValidator('json', patchPeriodGroupSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(periodGroups)
        .set(values)
        .where(eq(periodGroups.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
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
        .delete(periodGroups)
        .where(eq(periodGroups.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
