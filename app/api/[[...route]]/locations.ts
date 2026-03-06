import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { locations, insertLocationSchema } from '@/db/schema';

const patchLocationSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  autofillCoordinates: z.boolean().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: locations.id,
        name: locations.name,
        code: locations.code,
        city: locations.city,
        region: locations.region,
        country: locations.country,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
        autofillCoordinates: locations.autofillCoordinates,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt
      })
      .from(locations);

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
        .from(locations)
        .where(eq(locations.id, parseInt(id)));

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
        country: z.string(),
        code: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        postalCode: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        autofillCoordinates: z.boolean().optional()
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(locations).values(values).returning();

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
          .delete(locations)
          .where(inArray(locations.id, ids))
          .returning({ id: locations.id });

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
        .delete(locations)
        .where(eq(locations.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertLocationSchema.omit({
            id: true
          })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');
      await db.delete(locations);
      const data = await db.insert(locations).values(values).returning();

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
    zValidator('json', patchLocationSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(locations)
        .set(values)
        .where(eq(locations.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );
  

export default app;
