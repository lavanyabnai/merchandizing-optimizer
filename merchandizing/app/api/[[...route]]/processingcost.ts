import { zValidator } from '@hono/zod-validator';

import { and, desc, eq, inArray} from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  processingCosts,
  insertProcessingCostsSchema,
  products, 
  facilities,
  periods,
} from '@/db/schema';

const patchprocessingCostsSchema = z.object({
  facilityId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  type: z.string().optional(),
  units: z.string().optional(),
  cost: z.number().optional(),
  currency: z.string().optional(),
  timePeriodId: z.number().int().positive().optional(),
  
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        facilityId: z.number().optional(),
        productId: z.number().optional(),
        timePeriodId: z.number().optional()
      })
    ),
    async (c) => {
      const { facilityId, productId, timePeriodId } = c.req.valid('query');

      const data = await db
        .select({
          id: processingCosts.id,
          facilityId: processingCosts.facilityId,
          facilityName: facilities.name,
          productId: processingCosts.productId,
          productName: products.name,
          type: processingCosts.type,
          units: processingCosts.units,
          cost: processingCosts.cost,
          currency: processingCosts.currency,
          timePeriodId: processingCosts.timePeriodId,
          timePeriodName: periods.name
        })
        .from(processingCosts)
        .leftJoin(facilities, eq(processingCosts.facilityId, facilities.id))
        .leftJoin(products, eq(processingCosts.productId, products.id))
        .leftJoin(periods, eq(processingCosts.timePeriodId, periods.id))
        .where(
          and(
            facilityId ? eq(processingCosts.facilityId, facilityId) : undefined,
            productId ? eq(processingCosts.productId, productId) : undefined,
            timePeriodId ? eq(processingCosts.timePeriodId, timePeriodId) : undefined
          )
        )
        .orderBy(desc(processingCosts.id));

      return c.json({ data });
    }
  )
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
        .from(processingCosts)
        .where(eq(processingCosts.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertProcessingCostsSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(processingCosts)
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
    zValidator('json', z.array(insertProcessingCostsSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(processingCosts);
      const data = await db.insert(processingCosts).values(values).returning();

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
          .delete(processingCosts)
          .where(inArray(processingCosts.id, ids)) // Use ids directly
          .returning({ id: processingCosts.id });

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
    zValidator('json', patchprocessingCostsSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        if (!id) {
          return c.json({ error: 'Missing id' }, 400);
        }

        // Remove undefined values from the update
        const updateValues = Object.fromEntries(
          Object.entries(values).filter(([_, v]) => v !== undefined)
        );

        const [data] = await db
          .update(processingCosts)
          .set(updateValues)
          .where(eq(processingCosts.id, Number(id)))
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
        .delete(processingCosts)
        .where(eq(processingCosts.id, Number(id)))
        .returning({
          id: processingCosts.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
