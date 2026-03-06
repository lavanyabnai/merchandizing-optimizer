import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  timeWindows,
  insertTimeWindowsSchema,
  facilities, 
  periods,
} from '@/db/schema';

const patchTimeWindowsSchema = z.object({
  facilityId: z.number().int().positive().optional(),
  operation: z.string().optional(),
  daysOfWeek: z.array(z.number()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timePeriodId: z.number().int().positive().optional(),
  
});

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        facilityId: z.number().optional(),
        timePeriodId: z.number().optional()
      })
    ),
    async (c) => {
      const { facilityId, timePeriodId } = c.req.valid('query');

      const data = await db
        .select({
          id: timeWindows.id,
          facilityId: timeWindows.facilityId,
          facilityName: facilities.name,
          operation: timeWindows.operation,
          daysOfWeek: timeWindows.daysOfWeek,
          startTime: timeWindows.startTime,
          endTime: timeWindows.endTime,
          timePeriodId: timeWindows.timePeriodId,
          timePeriodName: periods.name
        })
        .from(timeWindows)
        .leftJoin(facilities, eq(timeWindows.facilityId, facilities.id))
        .leftJoin(periods, eq(timeWindows.timePeriodId, periods.id))
        .where(
          and(
            facilityId ? eq(timeWindows.facilityId, facilityId) : undefined,
            timePeriodId ? eq(timeWindows.timePeriodId, timePeriodId) : undefined
          )
        )
        .orderBy(desc(timeWindows.id));

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
        .from(timeWindows)
        .where(eq(timeWindows.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertTimeWindowsSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(timeWindows)
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
    zValidator('json', z.array(insertTimeWindowsSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(timeWindows);
      const data = await db.insert(timeWindows).values(values).returning();

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
          .delete(timeWindows)
          .where(inArray(timeWindows.id, ids)) // Use ids directly
          .returning({ id: timeWindows.id });

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
    zValidator('json', patchTimeWindowsSchema),
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
          .update(timeWindows)
          .set(updateValues)
          .where(eq(timeWindows.id, Number(id)))
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
        .delete(timeWindows)
        .where(eq(timeWindows.id, Number(id)))
        .returning({
          id: timeWindows.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
