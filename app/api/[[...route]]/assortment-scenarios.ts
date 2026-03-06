import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentScenarios, insertAssortmentScenarioSchema } from '@/db/schema';

const patchSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  storeId: z.number().optional(),
  inputs: z.any().optional(),
  results: z.any().optional(),
  summary: z.any().optional(),
  executionTimeMs: z.number().optional(),
  errorMessage: z.string().optional(),
});

const app = new Hono()
  .get(
    '/',
    zValidator('query', z.object({ type: z.enum(['optimization', 'simulation', 'clustering']).optional() })),
    async (c) => {
      const { type } = c.req.valid('query');
      if (type) {
        const data = await db.select().from(assortmentScenarios).where(eq(assortmentScenarios.type, type));
        return c.json({ data });
      }
      const data = await db.select().from(assortmentScenarios);
      return c.json({ data });
    },
  )
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentScenarios).where(eq(assortmentScenarios.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentScenarioSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentScenarios).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentScenarioSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentScenarios);
    const data = await db.insert(assortmentScenarios).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentScenarios).where(inArray(assortmentScenarios.id, ids)).returning({ id: assortmentScenarios.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentScenarios).where(eq(assortmentScenarios.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentScenarios).set(values).where(eq(assortmentScenarios.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
