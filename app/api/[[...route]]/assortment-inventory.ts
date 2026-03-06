import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentInventory, insertAssortmentInventorySchema } from '@/db/schema';

const patchSchema = z.object({
  productId: z.number().optional(),
  storeId: z.number().optional(),
  onHandQty: z.number().optional(),
  onOrderQty: z.number().optional(),
  inTransitQty: z.number().optional(),
  avgWeeklySales: z.number().optional(),
  weeksOfSupply: z.number().optional(),
  reorderPoint: z.number().optional(),
  safetyStock: z.number().optional(),
  lastReplenishDate: z.string().optional(),
  snapshotDate: z.string().optional(),
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(assortmentInventory);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentInventory).where(eq(assortmentInventory.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentInventorySchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentInventory).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentInventorySchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    await db.delete(assortmentInventory);
    const data = await db.insert(assortmentInventory).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentInventory).where(inArray(assortmentInventory.id, ids)).returning({ id: assortmentInventory.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentInventory).where(eq(assortmentInventory.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentInventory).set(values).where(eq(assortmentInventory.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
