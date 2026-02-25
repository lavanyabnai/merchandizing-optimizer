import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  periods,
  insertPeriodSchema,
} from '@/db/schema';

const app = new Hono()
  .get('/', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const data = await db.select().from(periods);

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
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid('param');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db
        .select()
        .from(periods)
        .where(eq(periods.name, id));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )

  .post(
    '/',
    clerkMiddleware(),
    zValidator(
      'json',
      z.object({
      id: z.number().optional(),
      name: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        demandCoefficient: z.number()
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db.insert(periods).values({
        name: values.name,
        start: values.startDate.toISOString(),
        end: values.endDate.toISOString(), 
        demandCoefficient: values.demandCoefficient?.toString(),
        id: values.id
      }).returning();

      return c.json({ data });
    }
)
  .post(
    '/bulk-create',
    clerkMiddleware(),
    zValidator('json', z.array(insertPeriodSchema.omit({ id: true }))),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // delete all periods before inserting new ones
      await db.delete(periods);
      const data = await db.insert(periods).values(values).returning();

      return c.json({ data });
    }
  )

  .post(
    '/bulk-delete',
    clerkMiddleware(),
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number())
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { ids } = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const data = await db.delete(periods).where(inArray(periods.id, ids)).returning();

      return c.json({ data });
    }
  )
  .delete(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid('param');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db.delete(periods).where(eq(periods.name, id)).returning();

      return c.json({ data });
    }
)
.patch(
  '/:id',
  clerkMiddleware(),
  zValidator(
    'param',
    z.object({
      id: z.string()
    })
  ),
  zValidator(
    'json',
    z.object({
      name: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      demandCoefficient: z.number().optional()
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [data] = await db.update(periods).set({
      ...values,
      demandCoefficient: values.demandCoefficient?.toString()
    }).where(eq(periods.name, id)).returning();

    return c.json({ data });
  }
);

  

export default app;