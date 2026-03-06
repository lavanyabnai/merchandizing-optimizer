import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  factories,
  insertFactorySchema,
  locations,
  icons
} from '@/db/schema';

const patchFactorySchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  locationId: z.number().int().positive().optional(),
  locationName: z.string().optional(),
  initiallyOpen: z.boolean().optional(),
  inclusionType: z.string().optional(),
  capacity: z.string().optional(),
  capacityUnit: z.string().optional(),
  priority: z.string().optional(),
  aggregateOrdersByLocation: z.boolean().optional(),
  additionalParameters: z.number().optional(),
  icon: z.string().optional()
});

async function fetchEntityMap(table: any, names: string[]) {
  if (names.length === 0) return new Map();
  
  const entities = await db
    .select({ id: table.id, name: table.name })
    .from(table)
    .where(inArray(table.name, names));

  return new Map(entities.map((entity) => [entity.name, entity.id]));
}

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        locationId: z.number().optional(),
        type: z.string().optional(),
        inclusionType: z.string().optional()
      })
    ),
    async (c) => {
      const { locationId, type, inclusionType } = c.req.valid('query');

      const data = await db
        .select({
          id: factories.id,
          name: factories.name,
          type: factories.type,
          locationId: factories.locationId,
          locationName: locations.name,
          initiallyOpen: factories.initiallyOpen,
          inclusionType: factories.inclusionType,
          capacity: factories.capacity,
          capacityUnit: factories.capacityUnit,
          priority: factories.priority,
          aggregateOrdersByLocation: factories.aggregateOrdersByLocation,
          additionalParameters: factories.additionalParameters,
          icon: factories.icon,
          createdAt: factories.createdAt,
          updatedAt: factories.updatedAt
        })
        .from(factories)
        .leftJoin(locations, eq(factories.locationId, locations.id))
        .leftJoin(icons, eq(factories.icon, icons.facilityType))
        .where(
          and(
            locationId ? eq(factories.locationId, locationId) : undefined,
            type ? eq(factories.type, type) : undefined,
            inclusionType ? eq(factories.inclusionType, inclusionType) : undefined
          )
        )
        .orderBy(desc(factories.createdAt));

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
        .select({
          id: factories.id,
          name: factories.name,
          type: factories.type,
          locationId: factories.locationId,
          locationName: locations.name,
          initiallyOpen: factories.initiallyOpen,
          inclusionType: factories.inclusionType,
          capacity: factories.capacity,
          capacityUnit: factories.capacityUnit,
          priority: factories.priority,
          aggregateOrdersByLocation: factories.aggregateOrdersByLocation,
          additionalParameters: factories.additionalParameters,
          icon: factories.icon,
          createdAt: factories.createdAt,
          updatedAt: factories.updatedAt
        })
        .from(factories)
        .leftJoin(locations, eq(factories.locationId, locations.id))
        .leftJoin(icons, eq(factories.icon, icons.facilityType))
        .where(eq(factories.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertFactorySchema),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(factories).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertFactorySchema
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

      try {
        // Get all unique location names
        const locationNames = Array.from(
          new Set(values.map((v) => v.location_name))
        );

        // Fetch related entities
        const locationMap = await fetchEntityMap(locations, locationNames);

        // Prepare factory data
        const factoryData = values.map((value) => {
          const locationId = locationMap.get(value.location_name);

          if (!locationId) {
            throw new Error(`Missing location reference: ${value.location_name}`);
          }

          const { location_name, ...factoryFields } = value;
          return {
            ...factoryFields,
            locationId,
            locationName: value.location_name
          };
        });

        // Clear existing data and insert new data
        await db.delete(factories);
        const data = await db.insert(factories).values(factoryData).returning();

        return c.json({ data });
      } catch (error) {
        console.error('Bulk create error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
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
          .delete(factories)
          .where(inArray(factories.id, ids))
          .returning({ id: factories.id });

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
        .delete(factories)
        .where(eq(factories.id, parseInt(id)))
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
    zValidator('json', patchFactorySchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      try {
        const [data] = await db
          .update(factories)
          .set(values)
          .where(eq(factories.id, parseInt(id)))
          .returning();

        if (!data) {
          return c.json({ error: 'Not found' }, 404);
        }

        return c.json({ data });
      } catch (error) {
        console.error('Patch error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  );

export default app;
