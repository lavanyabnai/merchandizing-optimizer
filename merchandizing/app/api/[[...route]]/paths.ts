import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  paths,
  insertPathSchema,
  vehicleTypes,
} from '@/db/schema';

const patchpathsSchema = z.object({
  name: z.string().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  costCalculationPolicy: z.string().optional(),
   vehicleTypeId: z.number().optional(),
   vehicleTypeName: z.string().optional(),
  // costPuPk: z.number().optional(),
  // costCalculationParams: z.number().optional(),
  // co2CalculationParams: z.number().optional(),
  // currency: z.string().optional(),
  // distance: z.number().optional(),
  // distanceUnit: z.string().optional(),
  // transportationTime: z.number().optional(),
  // timeUnit: z.string().optional(),
  // straight: z.boolean().optional(),
  // transportationPolicy: z.string().optional(),
  // minLoadRatio: z.number().optional(),
  // timePeriod: z.string().optional(),
  // inclusionType: z.string().optional()
  
 
  
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        vehicleTypeId: z.number().optional(),
      })
    ),
    async (c) => {
      const { vehicleTypeId } = c.req.valid('query');

      const data = await db
        .select({
          id: paths.id,
          name: paths.name,
          fromLocation: paths.fromLocation,
          toLocation: paths.toLocation,
          costCalculationPolicy: paths.costCalculationPolicy,
          vehicleTypeId: paths.vehicleTypeId,
          vehicleTypeName: vehicleTypes.name,
          // costPuPk: paths.costPuPk,
          // costCalculationParams: paths.costCalculationParams,
          // co2CalculationParams: paths.co2CalculationParams,
          // currency: paths.currency,
          // distance: paths.distance,
          // distanceUnit: paths.distanceUnit,
          // transportationTime: paths.transportationTime,
          // timeUnit: paths.timeUnit,
          // straight: paths.straight,
          // transportationPolicy: paths.transportationPolicy,
          // minLoadRatio: paths.minLoadRatio,
          // timePeriod: paths.timePeriod,
          // inclusionType: paths.inclusionType
        })
        .from(paths)
        .leftJoin(vehicleTypes, eq(paths.vehicleTypeId, vehicleTypes.id))
        .where(
          and(
            vehicleTypeId ? eq(paths.vehicleTypeId, vehicleTypeId) : undefined
        
          )
        )
        .orderBy(desc(paths.id));

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
        .from(paths)
        .where(eq(paths.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertPathSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(paths)
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
    zValidator('json', z.array(insertPathSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(paths);
      const data = await db.insert(paths).values(values).returning();

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
          .delete(paths)
          .where(inArray(paths.id, ids)) // Use ids directly
          .returning({ id: paths.id });

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
    zValidator('json', patchpathsSchema),
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
          .update(paths)
          .set(updateValues)
          .where(eq(paths.id, Number(id)))
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
        .delete(paths)
        .where(eq(paths.id, Number(id)))
        .returning({
          id: paths.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
