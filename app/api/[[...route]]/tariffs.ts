import { zValidator } from '@hono/zod-validator';
import { desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  tariffs,
  insertTariffsSchema,
  products, 
  facilities,
  periods,
} from '@/db/schema';

const patchTariffsSchema = z.object({
  fromId: z.number().int().positive().optional(),
  toId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  tariffType: z.string().optional(),
  adValorem: z.number().optional(),
  fixed:z.number().optional(),
  productUnit: z.string().optional(),
  currency: z.string().optional(),
  timePeriodId: z.number().int().positive().optional(),
  inclusionType: z.string().optional()
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        fromId: z.number().optional(),
        toId: z.number().optional(),
        productId: z.number().optional(),
        timePeriodId: z.number().optional()
      })
    ),
    async (c) => {
      c.req.valid('query');

      const data = await db
        .select({
          fromId: tariffs.fromId,
          toId: tariffs.toId,
          facilityName: facilities.name,
          productName: products.name,
          timePeriodName: periods.name,
          productId: tariffs.productId,
          tariffType: tariffs.tariffType,
          adValorem: tariffs.adValorem,
          fixed: tariffs.fixed,
          productUnit: tariffs.productUnit,
          currency: tariffs.currency,
          timePeriodId: tariffs.timePeriodId,
          inclusionType: tariffs.inclusionType
        })
        .from(tariffs)
        .innerJoin(
          facilities,
          eq(tariffs.fromId, facilities.id)
        )
        .innerJoin(
          products,
          eq(tariffs.productId, products.id)
        )
        .innerJoin(
          periods,
          eq(tariffs.timePeriodId, periods.id)
        )
        .orderBy(desc(tariffs.id));

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
        .from(tariffs)
        .where(eq(tariffs.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertTariffsSchema),
    async (c) => {
      try {
        const values = await c.req.json();

        const validatedData = insertTariffsSchema.safeParse(values);
        if (!validatedData.success) {
          return c.json({
            error: 'Validation error',
            details: validatedData.error.errors
          }, 400);
        }

        console.log('Inserting values:', JSON.stringify(validatedData.data, null, 2));

        let data;
        try {
          [data] = await db
            .insert(tariffs)
            .values(validatedData.data)
            .returning();
        } catch (dbError: any) {
          console.error('Database insertion error:', dbError);
          
          if (dbError.code === '23503') {
            return c.json({
              error: 'Foreign key constraint violation',
              details: 'One or more referenced IDs do not exist'
            }, 400);
          }

          return c.json(
            {
              error: 'Database insertion failed',
              details: dbError.message
            },
            500
          );
        }

        if (!data) {
          return c.json({ error: 'Insertion failed - no data returned' }, 500);
        }

        return c.json({ data });
      } catch (error: any) {
        console.error('POST Error:', error);
        return c.json({ 
          error: 'Request processing failed', 
          details: error.message 
        }, 500);
      }
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertTariffsSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(tariffs);
      const data = await db.insert(tariffs).values(values).returning();

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
          .delete(tariffs)
          .where(inArray(tariffs.id, ids)) // Use ids directly
          .returning({ id: tariffs.id });

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
    zValidator('json', patchTariffsSchema),
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
          .update(tariffs)
          .set(updateValues)
          .where(eq(tariffs.id, Number(id)))
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
        .delete(tariffs)
        .where(eq(tariffs.id, Number(id)))
        .returning({
          id: tariffs.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
