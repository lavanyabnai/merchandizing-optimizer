import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  vehicleSelectionMode,
  facilities,
  insertVehicleSelectionModeSchema
} from '@/db/schema';

const patchunitConversionSchema = z.object({
  fromId: z.number(),
  toId: z.number(),
  type: z.string(),
  parameters: z.number().nullable()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: vehicleSelectionMode.id,
        fromId: vehicleSelectionMode.fromId,
        fromName: facilities.name,
        toId: vehicleSelectionMode.toId,
        toName: facilities.name,
        type: vehicleSelectionMode.type,
        parameters: vehicleSelectionMode.parameters
      })
      .from(vehicleSelectionMode)
      .innerJoin(facilities, eq(vehicleSelectionMode.fromId, facilities.id))
      .innerJoin(facilities, eq(vehicleSelectionMode.toId, facilities.id));

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
        .from(vehicleSelectionMode)
        .where(eq(vehicleSelectionMode.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator(
      'json',
      insertVehicleSelectionModeSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      if (!auth?.userId) {
        console.error('❌ Unauthorized');
        return c.json({ error: 'Unauthorized' }, 401);
      }

      try {
        console.log('✅ Values received:', values);

        const [data] = await db
          .insert(vehicleSelectionMode)
          .values({
            ...values
          })
          .returning();

        console.log('✅ Data inserted:', data);
        return c.json({ data });
      } catch (error) {
        console.error('❌ Insertion Error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertVehicleSelectionModeSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      const data = await db
        .insert(vehicleSelectionMode)
        .values(
          values.map((value) => ({
            ...value
          }))
        )
        .returning();
      return c.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    zValidator(
      'json',
      z.object({
        ids: z.array(z.number())
      })
    ),
    async (c) => {
      const { ids } = c.req.valid('json');

      try {
        const data = await db
          .delete(vehicleSelectionMode)
          .where(inArray(vehicleSelectionMode.id, ids))
          .returning({ id: vehicleSelectionMode.id });

        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .delete(
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
        .delete(vehicleSelectionMode)
        .where(eq(vehicleSelectionMode.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
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
    zValidator('json', patchunitConversionSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(vehicleSelectionMode)
          .set({
            fromId: values.fromId,
            toId: values.toId,
            type: values.type,
            parameters: values.parameters as any // Type assertion needed due to schema mismatch
          })
          .where(eq(vehicleSelectionMode.id, parseInt(id)))
          .returning();

        if (!data) {
          throw new Error('Not found');
        }

        return c.json({ data });
      } catch (error) {
        console.error('❌ PATCH ERROR:', error);
        if (error instanceof z.ZodError) {
          console.error('Validation error:', error.errors);
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return c.json(
          { error: errorMessage },
          errorMessage === 'Unauthorized' ? 401 : 404
        );
      }
    }
  );

export default app;
