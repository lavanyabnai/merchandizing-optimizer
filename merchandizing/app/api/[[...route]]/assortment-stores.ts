import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentStores, insertAssortmentStoreSchema } from '@/db/schema';

const patchSchema = z.object({
  storeCode: z.string().optional(),
  name: z.string().optional(),
  format: z.string().optional(),
  locationType: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  incomeIndex: z.string().optional(),
  totalSquareFeet: z.number().optional(),
  sellingSquareFeet: z.number().optional(),
  totalLinearFeet: z.number().optional(),
  totalFacings: z.number().optional(),
  numShelves: z.number().optional(),
  shelfWidthInches: z.number().optional(),
  weeklyTraffic: z.number().optional(),
  openDate: z.string().optional(),
  clusterId: z.number().optional(),
  clusterName: z.string().optional(),
  isActive: z.boolean().optional(),
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(assortmentStores);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentStores).where(eq(assortmentStores.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentStoreSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentStores).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentStoreSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentStores);
    const data = await db.insert(assortmentStores).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentStores).where(inArray(assortmentStores.id, ids)).returning({ id: assortmentStores.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentStores).where(eq(assortmentStores.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentStores).set(values).where(eq(assortmentStores.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
