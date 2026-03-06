import { zValidator } from '@hono/zod-validator';
import { eq, inArray, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { facilities, locations, insertFacilitySchema } from '@/db/schema';

const patchFacilitySchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  locationId: z.coerce.number().optional(),
  initiallyOpen: z.boolean().optional(),
  inclusionType: z.enum(['Include', 'Exclude', 'Consider']).optional(),
  capacity: z.number().optional(),
  capacityUnit: z.string().optional(),
  aggregateOrdersByLocation: z.boolean().optional(),
  additionalParams: z.record(z.unknown()).optional(),
  icon: z.string().optional()
});

const app = new Hono()
  .get('/', async (c) => {
    const data = await db
      .select({
        id: facilities.id,
        name: facilities.name,
        type: facilities.type,
        locationId: facilities.locationId,
        initiallyOpen: facilities.initiallyOpen,
        inclusionType: facilities.inclusionType,
        capacity: facilities.capacity,
        capacityUnit: facilities.capacityUnit,
        aggregateOrdersByLocation: facilities.aggregateOrdersByLocation,
        additionalParams: facilities.additionalParams,
        icon: facilities.icon,
        createdAt: facilities.createdAt,
        updatedAt: facilities.updatedAt,
        locationName: locations.name
      })
      .from(facilities)
      .innerJoin(locations, eq(facilities.locationId, locations.id));

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
        .from(facilities)
        .where(eq(facilities.id, parseInt(id)));
      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertFacilitySchema),
    async (c) => {
      const values = c.req.valid('json');
      const [data] = await db.insert(facilities).values(values).returning();
      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertFacilitySchema
          .omit({
            id: true,
            locationId: true,
          })
          .extend({
            location_name: z.string()
          })
      )
    ),

    async (c) => {
      const values = c.req.valid('json');

      console.log(`bulk create values`, values);

      // Get all unique location names
      const locationNames = Array.from(
        new Set(values.map((v) => v.location_name))
      );

      const locationMap = new Map();
      const existingLocations = await db
        .select({ id: locations.id, name: locations.name })
        .from(locations)
        .where(sql`${locations.name} IN ${locationNames}`);

      existingLocations.forEach((loc) => locationMap.set(loc.name, loc.id));

      const facilityData = values.map((value) => {
        const locationId = locationMap.get(value.location_name);
        if (!locationId) {
          throw new Error(`Location not found: ${value.location_name}`);
        }
        const { location_name, ...facilityFields } = value;
        return {
          ...facilityFields,
          locationId,
          userId: auth.userId
        };
      });

      await db.delete(facilities);
      const data = await db.insert(facilities).values(facilityData).returning();
      return c.json({ data });
    }
  )
  .post(
    '/bulk-delete',
    zValidator('json', z.object({ ids: z.array(z.number()) })),
    async (c) => {
      const { ids } = c.req.valid('json');
      try {
        const data = await db
          .delete(facilities)
          .where(inArray(facilities.id, ids))
          .returning({ id: facilities.id });
        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid('param');
      const [data] = await db
        .delete(facilities)
        .where(eq(facilities.id, parseInt(id)))
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
    zValidator('json', patchFacilitySchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(facilities)
          .set({
            ...values,
            additionalParams: values.additionalParams ? parseInt(JSON.stringify(values.additionalParams)) : undefined
          })
          .where(eq(facilities.id, parseInt(id)))
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
