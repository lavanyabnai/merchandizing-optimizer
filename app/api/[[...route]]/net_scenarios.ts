import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { netScenario, insertNetScenarioSchema } from '@/db/schema';

const patchNetScenarioSchema = z.object({
  netId: z.string().optional(),
  description: z.string().optional(),
  scenarioType: z.string().optional(),
  status: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  ignoreRoutes: z.boolean().optional(),
  demandType: z.string().optional(),
  searchType: z.string().optional(),
  bestSolutions: z.number().min(1).optional(),
  timeLimitSec: z.number().min(1).optional(),
  mipGap: z.string().optional(),
  threads: z.number().min(1).optional(),
  problemType: z.string().optional(),
  unitType: z.string().optional(),
  distanceType: z.string().optional(),
  currency: z.string().optional(),
  solutionPool: z.string().optional(),
  objectiveValue: z.string().optional(),
  solveTimeSec: z.string().optional(),
  iterations: z.number().optional(),
  gap: z.string().optional(),
  metadata: z.string().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db.select().from(netScenario);

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
        .from(netScenario)
        .where(eq(netScenario.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertNetScenarioSchema),
    async (c) => {
      const values = c.req.valid('json');

      // Fix the metadata type handling
      if (typeof values.metadata === 'string') {
        try {
          values.metadata = values.metadata ? JSON.parse(values.metadata) : null;
        } catch (e) {
          return c.json({ error: 'Invalid metadata JSON' }, 400);
        }
      }

      const [data] = await db.insert(netScenario).values(values as any).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertNetScenarioSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      // Fix: Ensure 'metadata' is an object for each item, not a string, to match the DB schema
      for (const v of values) {
        if (typeof v.metadata === 'string') {
          try {
            v.metadata = v.metadata ? JSON.parse(v.metadata) : undefined;
          } catch (e) {
            return c.json({ error: 'Invalid metadata JSON in one or more items' }, 400);
          }
        }
      }

      await db.delete(netScenario);
      const data = await db.insert(netScenario).values(values as any).returning();

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
          .delete(netScenario)
          .where(inArray(netScenario.id, ids))
          .returning({ id: netScenario.id });

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
        .delete(netScenario)
        .where(eq(netScenario.id, parseInt(id)))
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
    zValidator('json', patchNetScenarioSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(netScenario)
        .set(values as any)
        .where(eq(netScenario.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
