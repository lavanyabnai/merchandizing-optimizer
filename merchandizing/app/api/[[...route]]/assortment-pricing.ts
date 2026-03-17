import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentPricing, insertAssortmentPricingSchema } from '@/db/schema';

const patchSchema = z.object({
  productId: z.number().optional(),
  storeId: z.number().optional(),
  regularPrice: z.number().optional(),
  currentPrice: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  competitorPrice: z.number().optional(),
  priceZone: z.string().optional(),
  effectiveDate: z.string().optional(),
  endDate: z.string().optional(),
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(assortmentPricing);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentPricing).where(eq(assortmentPricing.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentPricingSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentPricing).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentPricingSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentPricing);
    const data = await db.insert(assortmentPricing).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentPricing).where(inArray(assortmentPricing.id, ids)).returning({ id: assortmentPricing.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentPricing).where(eq(assortmentPricing.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentPricing).set(values).where(eq(assortmentPricing.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
