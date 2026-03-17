import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  loadingUnloadingGates,
  insertLoadingUnloadingGatesSchema,
  facilities
} from '@/db/schema';

const patchloadingunloadinggatessSchema = z.object({
  name:z.string().optional(),
  facilityId: z.number().int().positive().optional(),
  type: z.string().optional(),
  vehicleTypes: z.record(z.unknown()).optional(),
  numberOfGates: z.number().int().positive().optional(),
  units: z.string().optional(),
  processingTime: z.number().optional(),
  timeUnit: z.string().optional(),
  
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        facilityId: z.number().optional(),
        vehicleTypes: z.record(z.unknown()).optional()
        
      })
    ),
    async (c) => {
      const { facilityId, vehicleTypes } = c.req.valid('query');

      const data = await db
        .select({
          id: loadingUnloadingGates.id,
          name: loadingUnloadingGates.name,
          facilityId: loadingUnloadingGates.facilityId,
          type: loadingUnloadingGates.type,
          facilityName: facilities.name,
          vehicleTypes: loadingUnloadingGates.vehicleTypes,
          numberOfGates: loadingUnloadingGates.numberOfGates,
          units: loadingUnloadingGates.units,
          processingTime: loadingUnloadingGates.processingTime,
          timeUnit: loadingUnloadingGates.timeUnit
        })
        .from(loadingUnloadingGates)
        .leftJoin(facilities, eq(loadingUnloadingGates.facilityId, facilities.id))
        .where(
          and(
            facilityId ? eq(loadingUnloadingGates.facilityId, facilityId) : undefined,
            vehicleTypes ? sql`${loadingUnloadingGates.vehicleTypes} = ${JSON.stringify(vehicleTypes)}` : undefined
          )
        )
        .orderBy(desc(loadingUnloadingGates.id));

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
        .from(loadingUnloadingGates)
        .where(eq(loadingUnloadingGates.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertLoadingUnloadingGatesSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(loadingUnloadingGates)
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
    zValidator('json', z.array(insertLoadingUnloadingGatesSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(loadingUnloadingGates);
      const data = await db.insert(loadingUnloadingGates).values(values).returning();

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
          .delete(loadingUnloadingGates)
          .where(inArray(loadingUnloadingGates.id, ids)) // Use ids directly
          .returning({ id: loadingUnloadingGates.id });

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
    zValidator('json', patchloadingunloadinggatessSchema),
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
          .update(loadingUnloadingGates)
          .set(updateValues)
          .where(eq(loadingUnloadingGates.id, Number(id)))
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
        .delete(loadingUnloadingGates)
        .where(eq(loadingUnloadingGates.id, Number(id)))
        .returning({
          id: loadingUnloadingGates.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
