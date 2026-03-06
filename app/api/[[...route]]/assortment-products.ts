import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentProducts, insertAssortmentProductSchema } from '@/db/schema';

const patchSchema = z.object({
  sku: z.string().optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  brandTier: z.string().optional(),
  hierarchyId: z.number().optional(),
  department: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  segment: z.string().optional(),
  size: z.string().optional(),
  packType: z.string().optional(),
  flavor: z.string().optional(),
  upc: z.string().optional(),
  widthInches: z.number().optional(),
  heightInches: z.number().optional(),
  depthInches: z.number().optional(),
  weightOz: z.number().optional(),
  cost: z.number().optional(),
  msrp: z.number().optional(),
  spaceElasticity: z.number().optional(),
  priceElasticity: z.number().optional(),
  shelfLife: z.number().optional(),
  minOrderQty: z.number().optional(),
  casePackSize: z.number().optional(),
  isActive: z.boolean().optional(),
  priceTier: z.string().optional(),
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(assortmentProducts);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentProducts).where(eq(assortmentProducts.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentProductSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentProducts).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentProductSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentProducts);
    const data = await db.insert(assortmentProducts).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentProducts).where(inArray(assortmentProducts.id, ids)).returning({ id: assortmentProducts.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentProducts).where(eq(assortmentProducts.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentProducts).set(values).where(eq(assortmentProducts.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
