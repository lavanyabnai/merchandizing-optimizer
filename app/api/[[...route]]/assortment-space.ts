import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentSpaceAllocation, insertAssortmentSpaceAllocationSchema } from '@/db/schema';

const patchSchema = z.object({
  productId: z.number().optional(),
  storeId: z.number().optional(),
  shelfNumber: z.number().optional(),
  positionOnShelf: z.number().optional(),
  facings: z.number().optional(),
  depth: z.number().optional(),
  orientation: z.string().optional(),
  linearInches: z.number().optional(),
  isActive: z.boolean().optional(),
  effectiveDate: z.string().optional(),
  endDate: z.string().optional(),
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(assortmentSpaceAllocation);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentSpaceAllocation).where(eq(assortmentSpaceAllocation.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentSpaceAllocationSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentSpaceAllocation).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentSpaceAllocationSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentSpaceAllocation);
    const data = await db.insert(assortmentSpaceAllocation).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentSpaceAllocation).where(inArray(assortmentSpaceAllocation.id, ids)).returning({ id: assortmentSpaceAllocation.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentSpaceAllocation).where(eq(assortmentSpaceAllocation.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentSpaceAllocation).set(values).where(eq(assortmentSpaceAllocation.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
