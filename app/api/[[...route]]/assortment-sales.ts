import { zValidator } from '@hono/zod-validator';
import { eq, inArray, sum, count, avg, desc, sql, countDistinct } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '@/db/drizzle';
import { assortmentSales, insertAssortmentSaleSchema, assortmentProducts } from '@/db/schema';

const patchSchema = z.object({
  productId: z.number().optional(),
  storeId: z.number().optional(),
  weekNumber: z.number().optional(),
  year: z.number().optional(),
  weekStartDate: z.string().optional(),
  unitsSold: z.number().optional(),
  revenue: z.number().optional(),
  costTotal: z.number().optional(),
  profit: z.number().optional(),
  facings: z.number().optional(),
  onPromotion: z.boolean().optional(),
  promotionType: z.string().optional(),
  promotionDiscount: z.number().optional(),
});

const app = new Hono()
  .get('/dashboard-metrics', async (c) => {
    const [data] = await db.select({
      totalRevenue: sum(assortmentSales.revenue),
      totalProfit: sum(assortmentSales.profit),
      avgMargin: avg(sql`CASE WHEN ${assortmentSales.revenue} > 0 THEN ${assortmentSales.profit} / ${assortmentSales.revenue} * 100 ELSE 0 END`),
      skuCount: countDistinct(assortmentSales.productId),
      storeCount: countDistinct(assortmentSales.storeId),
    }).from(assortmentSales);
    return c.json({ data });
  })
  .get('/weekly-trend', async (c) => {
    const data = await db.select({
      weekNumber: assortmentSales.weekNumber,
      year: assortmentSales.year,
      totalRevenue: sum(assortmentSales.revenue),
      totalProfit: sum(assortmentSales.profit),
      totalUnits: sum(assortmentSales.unitsSold),
    })
      .from(assortmentSales)
      .groupBy(assortmentSales.weekNumber, assortmentSales.year)
      .orderBy(assortmentSales.year, assortmentSales.weekNumber);
    return c.json({ data });
  })
  .get('/category-mix', async (c) => {
    const data = await db.select({
      subcategory: assortmentProducts.subcategory,
      totalRevenue: sum(assortmentSales.revenue),
    })
      .from(assortmentSales)
      .innerJoin(assortmentProducts, eq(assortmentSales.productId, assortmentProducts.id))
      .groupBy(assortmentProducts.subcategory)
      .orderBy(desc(sum(assortmentSales.revenue)));
    return c.json({ data });
  })
  .get('/brand-tier-mix', async (c) => {
    const data = await db.select({
      brandTier: assortmentProducts.brandTier,
      totalRevenue: sum(assortmentSales.revenue),
      totalProfit: sum(assortmentSales.profit),
      totalUnits: sum(assortmentSales.unitsSold),
    })
      .from(assortmentSales)
      .innerJoin(assortmentProducts, eq(assortmentSales.productId, assortmentProducts.id))
      .groupBy(assortmentProducts.brandTier)
      .orderBy(desc(sum(assortmentSales.revenue)));
    return c.json({ data });
  })
  .get('/top-performers', async (c) => {
    const data = await db.select({
      productId: assortmentSales.productId,
      productName: assortmentProducts.name,
      sku: assortmentProducts.sku,
      brand: assortmentProducts.brand,
      subcategory: assortmentProducts.subcategory,
      totalRevenue: sum(assortmentSales.revenue),
      totalProfit: sum(assortmentSales.profit),
      totalUnits: sum(assortmentSales.unitsSold),
    })
      .from(assortmentSales)
      .innerJoin(assortmentProducts, eq(assortmentSales.productId, assortmentProducts.id))
      .groupBy(
        assortmentSales.productId,
        assortmentProducts.name,
        assortmentProducts.sku,
        assortmentProducts.brand,
        assortmentProducts.subcategory,
      )
      .orderBy(desc(sum(assortmentSales.revenue)))
      .limit(25);
    return c.json({ data });
  })
  .get('/', async (c) => {
    const data = await db.select().from(assortmentSales);
    return c.json({ data });
  })
  .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.select().from(assortmentSales).where(eq(assortmentSales.id, parseInt(id)));
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .post('/', zValidator('json', insertAssortmentSaleSchema.omit({ id: true })), async (c) => {
    const values = c.req.valid('json');
    const [data] = await db.insert(assortmentSales).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-create', zValidator('json', z.array(insertAssortmentSaleSchema.omit({ id: true }))), async (c) => {
    const values = c.req.valid('json');
    const data = await db.insert(assortmentSales).values(values).returning();
    return c.json({ data });
  })
  .post('/bulk-delete', zValidator('json', z.object({ ids: z.array(z.number()) })), async (c) => {
    const { ids } = c.req.valid('json');
    try {
      const data = await db.delete(assortmentSales).where(inArray(assortmentSales.id, ids)).returning({ id: assortmentSales.id });
      return c.json({ data });
    } catch (error) {
      console.error('Bulk delete error:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  })
  .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('param');
    const [data] = await db.delete(assortmentSales).where(eq(assortmentSales.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  })
  .patch('/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', patchSchema), async (c) => {
    const { id } = c.req.valid('param');
    const values = c.req.valid('json');
    const [data] = await db.update(assortmentSales).set(values).where(eq(assortmentSales.id, parseInt(id))).returning();
    if (!data) return c.json({ error: 'Not found' }, 404);
    return c.json({ data });
  });

export default app;
