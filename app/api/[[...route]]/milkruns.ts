import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  milkRuns,
  insertMilkRunSchema,
  facilities,
  vehicleTypes
} from '@/db/schema';

const patchmilkrunsSchema = z.object({

  sourceId: z.number().int().positive().optional(),
  vehicleTypeId: z.number().int().positive().optional(),
  destinations: z.string().optional(),
  
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        sourceId: z.number().optional(),
        vehicleTypeId: z.number().optional(),

      })
    ),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { sourceId, vehicleTypeId } = c.req.valid('query');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const data = await db
        .select({
          id: milkRuns.id,
          sourceId: milkRuns.sourceId,
          sourceName: facilities.name,
          vehicleTypeId: milkRuns.vehicleTypeId,
          vehicleTypeName: vehicleTypes.name,
          destinations: milkRuns.destinations,
        })
        .from(milkRuns)
        .leftJoin(facilities, eq(milkRuns.sourceId, facilities.id))
        .leftJoin(vehicleTypes, eq(milkRuns.vehicleTypeId, vehicleTypes.id))
        .where(
          and(
            sourceId ? eq(milkRuns.sourceId, sourceId) : undefined,
            vehicleTypeId ? eq(milkRuns.vehicleTypeId, vehicleTypeId) : undefined
          )
        )
        .orderBy(desc(milkRuns.id));

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
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid('param');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db
        .select()
        .from(milkRuns)
        .where(eq(milkRuns.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    clerkMiddleware(),
    zValidator('json', insertMilkRunSchema),
    async (c) => {
      try {
        const auth = getAuth(c);
        const values = c.req.valid('json');

        if (!auth?.userId) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(milkRuns)
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
    clerkMiddleware(),
    zValidator('json', z.array(insertMilkRunSchema.omit({ id: true }))),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
        await db.delete(milkRuns);
      const data = await db.insert(milkRuns).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    clerkMiddleware(),
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number()) // Change from z.string() to z.number()
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { ids } = c.req.valid('json'); // Destructure ids directly

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      try {
        const data = await db
          .delete(milkRuns)
          .where(inArray(milkRuns.id, ids)) // Use ids directly
          .returning({ id: milkRuns.id });

        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .patch(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    zValidator('json', patchmilkrunsSchema),
    async (c) => {
      try {
        const auth = getAuth(c);
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        if (!id) {
          return c.json({ error: 'Missing id' }, 400);
        }

        if (!auth?.userId) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        // Remove undefined values from the update
        const updateValues = Object.fromEntries(
          Object.entries(values).filter(([_, v]) => v !== undefined)
        );

        const [data] = await db
          .update(milkRuns)
          .set(updateValues)
          .where(eq(milkRuns.id, Number(id)))
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
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string().optional()
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db
        .delete(milkRuns)
        .where(eq(milkRuns.id, Number(id)))
        .returning({
          id: milkRuns.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
