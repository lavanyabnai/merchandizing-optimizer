import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { vehicleTypes, insertVehicleSchema } from '@/db/schema';

const app = new Hono()
  .get('/', async (c) => {
    const data = await db.select().from(vehicleTypes);
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
        .from(vehicleTypes)
        .where(eq(vehicleTypes.id, parseInt(id)));

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
      z.object({
        name: z.string(),
        capacity: z.number(),
        capacityUnit: z.string(),
        speed: z.number(),
        speedUnit: z.string()
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert (vehicleTypes).values({
        ...values,
        capacity: values.capacity?.toString(),
        speed: values.speed?.toString()
      }).returning();

      return c.json({ data });
    }
)

  .post(
  
    '/bulk-create',
    zValidator('json', z.array(insertVehicleSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');

      // delete all products before inserting new ones and suggest the imports required
      await db.delete(vehicleTypes);
      const data = await db.insert(vehicleTypes).values(values).returning();

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
          .delete(vehicleTypes)
          .where(inArray(vehicleTypes.id, ids))
          .returning({ id: vehicleTypes.id });

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
        .delete(vehicleTypes)
        .where(eq(vehicleTypes.id, parseInt(id)))
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
    zValidator(
      'json',
      z.object({
        name: z.string().optional(),
        capacity: z.number().optional(),
        capacityUnit: z.string().optional(),
        speed: z.number().optional(),
        speedUnit: z.string().optional()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(vehicleTypes)
        .set({
          ...values,
          capacity: values.capacity?.toString(),
          speed: values.speed?.toString()
        })
        .where(eq(vehicleTypes.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
