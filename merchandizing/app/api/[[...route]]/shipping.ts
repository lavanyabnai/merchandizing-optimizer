import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  shipping,
  insertShippingSchema,
  products, 
  facilities,
  periods,
  vehicleTypes,
} from '@/db/schema';

const patchshippingsSchema = z.object({
  sourceId: z.number().int().positive().optional(),
  sourceName: z.string().optional(),
  destinationId: z.number().int().positive().optional(),
  destinationName: z.string().optional(),
  productId: z.number().int().positive().optional(),
  productName: z.string().optional(),
  vehicleTypeId: z.number().int().positive().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  timePeriodId: z.number().int().positive().optional(),
  inclusionType: z.string().optional(),
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        facilitiesId: z.number().optional(),
        productId: z.number().optional(),
        timePeriodId: z.number().optional(),
        vehicleTypeId: z.number().optional()
      })
    ),
    async (c) => {
      const { facilitiesId, productId, timePeriodId, vehicleTypeId } = c.req.valid('query');

      const data = await db
        .select({
          id: shipping.id,
          sourceId: shipping.sourceId,
          destinationId: shipping.destinationId,
          productId: shipping.productId,
          vehicleTypeId: shipping.vehicleTypeId,
          productName: products.name,
          type: shipping.type,
          priority: shipping.priority,
          startTime: shipping.startTime,
          endTime: shipping.endTime,
          timePeriodId: shipping.timePeriodId,
          inclusionType: shipping.inclusionType,
          sourceName: facilities.name,
          destinationName: facilities.name,
          vehicleTypeName: vehicleTypes.name,
          timePeriodName: periods.name
        })
        .from(shipping)
        .leftJoin(facilities, eq(shipping.sourceId, facilities.id))
        .leftJoin(products, eq(shipping.productId, products.id))
        .leftJoin(periods, eq(shipping.timePeriodId, periods.id))
        .leftJoin(vehicleTypes, eq(shipping.vehicleTypeId, vehicleTypes.id)) 
        .where(
          and(
            facilitiesId ? eq(shipping.sourceId, facilitiesId) : undefined,
            facilitiesId ? eq(shipping.destinationId, facilitiesId) : undefined,
            productId ? eq(shipping.productId, productId) : undefined,
            timePeriodId ? eq(shipping.timePeriodId, timePeriodId) : undefined,
            vehicleTypeId ? eq(shipping.vehicleTypeId, vehicleTypeId) : undefined
          )
        )
        .orderBy(desc(shipping.id));

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
        .from(shipping)
        .where(eq(shipping.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertShippingSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(shipping)
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
    zValidator('json', z.array(insertShippingSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(shipping);
      const data = await db.insert(shipping).values(values).returning();

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
          .delete(shipping)
          .where(inArray(shipping.id, ids)) // Use ids directly
          .returning({ id: shipping.id });

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
    zValidator('json', patchshippingsSchema),
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
          .update(shipping)
          .set(updateValues)
          .where(eq(shipping.id, Number(id)))
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
        .delete(shipping)
        .where(eq(shipping.id, Number(id)))
        .returning({
          id: shipping.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
