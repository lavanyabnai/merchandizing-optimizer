import { zValidator } from '@hono/zod-validator';
import {  desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  production_no,
  insertProductionNoSchema,
  products, 
  facilities,
  periods,
  bom
} from '@/db/schema';

const patchproduction_noSchema = z.object({
  label: z.string(),
  siteId: z.number().int().positive(),
  productId: z.number().int().positive(),
  bomId: z.number().int().positive(),
  currency: z.string().optional(),
  inclusionType: z.string().optional(),
  periodId: z.number().int().positive(),
  productionCost: z.number().int().positive(),
  minThroughput: z.number().int().positive(),
  maxThroughput: z.number().int().positive(),
});


const app = new Hono()
.get('/', async (c) => {

  try {
    const data = await db
      .select({
        id: production_no.id,
        siteId: production_no.siteId,

        label: production_no.label,
        productId: production_no.productId,
        bomId: production_no.bomId,
        facilityName: facilities.name,
        productName: products.name,
        periodId: production_no.timePeriodId,
        periodName: production_no.timePeriodName,
        productionCost: production_no.productionCost,
        minThroughput: production_no.minThroughput,
        maxThroughput: production_no.maxThroughput,
        currency: production_no.currency,
        inclusionType: production_no.inclusionType
      })
      .from(production_no)
      .leftJoin(
        facilities,
        eq(production_no.siteId, facilities.id)
      )
      .leftJoin(
        products,
        eq(production_no.productId, products.id)
      )
      .leftJoin(
        periods,
        eq(production_no.timePeriodId, periods.id)
      )
      .leftJoin(
        bom,
        eq(production_no.bomId, bom.id)
      )
      .orderBy(desc(production_no.id));

    return c.json({ data });
  } catch (error) {
    console.error('GET Error:', error);
    return c.json({ 
      error: 'Failed to fetch data', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
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
        .from(production_no)
        .where(eq(production_no.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertProductionNoSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(production_no)
            .values(values)
            .returning();
        } catch (dbError: any) {
          console.error('Database insertion error:', dbError);
          console.error('Error stack:', dbError.stack);
          return c.json(
            {
              error: 'Database insertion failed',
              details: dbError.message,
              stack: dbError.stack
            },
            500
          );
        }

        if (!data) {
          console.error('No data returned after insertion');
          return c.json({ error: 'Insertion failed - no data returned' }, 500);
        }

        console.log('Inserted data:', JSON.stringify(data, null, 2));

        return c.json({ data });
      } catch (error: any) {
        console.error('POST Error:', error);
        console.error('Error stack:', error.stack);
        if (error instanceof z.ZodError) {
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        return c.json({ error: error.message, stack: error.stack }, 500);
      }
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertProductionNoSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(production_no);
      const data = await db.insert(production_no).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number()) // Change from z.string() to z.number()
      })
    ),
    async (c) => {
      const { ids } = c.req.valid('json'); // Destructure ids directly

      try {
        const data = await db
          .delete(production_no)
          .where(inArray(production_no.id, ids)) // Use ids directly
          .returning({ id: production_no.id });

        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
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
    zValidator('json', patchproduction_noSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        if (!id) {
          return c.json({ error: 'Missing id' }, 400);
        }

        // Remove undefined values from the update and convert numeric decimal fields to strings
        const updateValues = Object.fromEntries(
          Object.entries(values).filter(([_, v]) => v !== undefined && v !== null)
            .map(([key, value]) => {
              // Convert numeric decimal fields to strings
              if (key === 'productionCost' || key === 'minThroughput' || key === 'maxThroughput') {
                return [key, value.toString()];
              }
              return [key, value];
            })
        );

        const [data] = await db
          .update(production_no)
          .set(updateValues)
          .where(eq(production_no.id, Number(id)))
          .returning();

        if (!data) {
          return c.json({ error: 'Not found' }, 404);
        }

        return c.json({ data });
      } catch (error: any) {
        console.error('PATCH Error:', error);
        return c.json({ 
          error: 'Update failed', 
          details: error.message,
          stack: error.stack 
        }, 500);
      }
    }
  )
  .delete(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string().optional()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .delete(production_no)
        .where(eq(production_no.id, Number(id)))
        .returning({
          id: production_no.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
