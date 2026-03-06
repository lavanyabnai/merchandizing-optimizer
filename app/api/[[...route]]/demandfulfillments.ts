import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { demandFulfillment } from '@/db/schema';


const app = new Hono()
  
  .get('/', async (c) => {

    const data = await db
      .select({
        id: demandFulfillment.id,
        iteration: demandFulfillment.iteration,
        period: demandFulfillment.period,
        customerId: demandFulfillment.customerId,
        productId: demandFulfillment.productId,
        unit: demandFulfillment.unit,
        demandMin: demandFulfillment.demandMin,
        demandMax: demandFulfillment.demandMax,
        satisfied: demandFulfillment.satisfied,
        percentage: demandFulfillment.percentage,
        revenuePerItem: demandFulfillment.revenuePerItem,
        // Updated fields to match the demandFulfillment schema
        revenueTotal: demandFulfillment.revenueTotal,
        underCost: demandFulfillment.underCost,
        overCost: demandFulfillment.overCost,
        penalty: demandFulfillment.penalty,
  
      })
      .from(demandFulfillment);

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
        .from(demandFulfillment)
          .where(eq(demandFulfillment.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  

export default app;