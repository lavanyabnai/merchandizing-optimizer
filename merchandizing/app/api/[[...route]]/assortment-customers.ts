import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentCustomerSegments, insertAssortmentCustomerSegmentSchema } from '@/db/schema';

const patchSchema = z.object({
  segmentName: z.string().optional(),
  description: z.string().optional(),
  avgBasketSize: z.number().optional(),
  avgTransactionValue: z.number().optional(),
  visitFrequency: z.number().optional(),
  priceElasticity: z.number().optional(),
  promotionSensitivity: z.number().optional(),
  preferredBrandTier: z.string().optional(),
  preferredCategories: z.any().optional(),
  demographics: z.any().optional(),
  storeCount: z.number().optional(),
  totalRevenue: z.number().optional(),
  revenueShare: z.number().optional(),
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(assortmentCustomerSegments);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentCustomerSegments).where(eq(assortmentCustomerSegments.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentCustomerSegmentSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentCustomerSegments).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentCustomerSegmentSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentCustomerSegments);
    const data = await db.insert(assortmentCustomerSegments).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentCustomerSegments).where(inArray(assortmentCustomerSegments.id, ids)).returning({ id: assortmentCustomerSegments.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentCustomerSegments).where(eq(assortmentCustomerSegments.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentCustomerSegments).set(values).where(eq(assortmentCustomerSegments.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
