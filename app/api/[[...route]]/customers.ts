import { zValidator } from '@hono/zod-validator';
import { eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { customers, locations, insertCustomerSchema } from '@/db/schema';

const patchCustomerSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  locationId: z.coerce.number().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']).optional(),
  additionalParams: z.record(z.unknown()).optional(),
  icon: z.string().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
        type: customers.type,
        locationId: customers.locationId,
        inclusionType: customers.inclusionType,
        additionalParams: customers.additionalParams,
        icon: customers.icon,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        locationName: locations.name
      })
      .from(customers)
      .innerJoin(locations, eq(customers.locationId, locations.id));
    

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
        .from(customers)
        .where(eq(customers.id, parseInt(id)));

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
        type: z.string().optional(),
        locationId: z.number(),
        inclusionType: z.enum(['Include', 'Exclude', 'Consider']),
        additionalParams: z.record(z.unknown()).optional(),
        icon: z.string().optional()
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(customers).values({
        name: values.name,
        locationId: values.locationId,
        locationName: values.name,
        type: values.type ?? null,
        inclusionType: values.inclusionType,
        icon: values.icon ?? null,
        additionalParams: values.additionalParams ? parseInt(JSON.stringify(values.additionalParams)) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

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
          .delete(customers)
          .where(inArray(customers.id, ids))
          .returning({ id: customers.id });

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
        .delete(customers)
        .where(eq(customers.id, parseInt(id)))
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
        insertCustomerSchema
          .omit({
            id: true,
            locationId: true
          })
          .extend({
            location_name: z.string()
          })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      // Get all unique location names
      const locationNames = Array.from(
        new Set(values.map((v) => v.location_name))
      );

      // Fetch locations
      const locationMap = new Map();
      const existingLocations = await db
        .select({ id: locations.id, name: locations.name })
        .from(locations)
        .where(sql`${locations.name} IN ${locationNames}`);

      existingLocations.forEach((loc) => locationMap.set(loc.name, loc.id));

      // Prepare customer data
      const customerData = values.map((value) => {
        const locationId = locationMap.get(value.location_name);
        if (!locationId) {
          throw new Error(`Location not found: ${value.location_name}`);
        }
        const { location_name, ...customerFields } = value;
        return {
          ...customerFields,
          locationId,
          userId: auth.userId
        };
      });

      // Insert customers
      await db.delete(customers);
      const data = await db.insert(customers).values(customerData).returning();

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
    zValidator('json', patchCustomerSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(customers)
          .set({
            ...values,
            additionalParams: values.additionalParams ? parseInt(JSON.stringify(values.additionalParams)) : null
          })
          .where(eq(customers.id, parseInt(id)))
          .returning();

        if (!data) {
          throw new Error('Not found');
        }

        return c.json({ data });
      } catch (error) {
        console.error('❌ PATCH ERROR:', error);
        if (error instanceof z.ZodError) {
          console.error('Validation error:', error.errors);
          return c.json({ error: 'Validation error', details: error.errors }, 400);
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
