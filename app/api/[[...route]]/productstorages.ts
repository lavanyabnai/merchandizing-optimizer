import { zValidator } from '@hono/zod-validator';

import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  productStorages,
  insertProductStorageSchema,
  products, 
  facilities,
  periods,
} from '@/db/schema';

const patchproductstoragesSchema = z.object({
  label: z.string().optional(),
  facilityId: z.number().int().positive().optional(),
  facilityName: z.string().optional(),
  expandFacilities: z.boolean().optional(),
  productId: z.number().int().positive().optional(),
  productName: z.string().optional(),
  expandProducts: z.boolean().optional(),
  // initialStock: z.number().optional(),
  // minStock: z.number().optional(),
  // safetyStock: z.number().optional(),
  // maxStock: z.number().optional(),
  // fixed: z.boolean().optional(),
  // fixedValue: z.number().optional(),
  // understockPenalty: z.number().optional(),
  // safetyStockPenalty: z.number().optional(),
  // overstockPenalty: z.number().optional(),
  // productUnit: z.string().optional(),
  timePeriodId: z.number().int().positive().optional(),
  // expandPeriods: z.boolean().optional(),
  inclusionType: z.string().optional(),
  currency: z.string().optional(),
 
});
// async function fetchEntityMap(table: any, names: string[]) {
//   const entities = await db
//     .select({ id: table.id, name: table.name })
//     .from(table)
//     .where(sql`${table.name} IN ${names}`);

//   return new Map(entities.map((entity) => [entity.name, entity.id]));
// }

const app = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
         label: z.string().optional(),
        facilityId: z.number().optional(),
        productId: z.number().optional(),
        productName: z.string().optional(),
        timePeriodId: z.number().optional(),
      })
    ),
    async (c) => {
      const { facilityId, productId, timePeriodId } = c.req.valid('query');

      const data = await db
        .select({
          id: productStorages.id,
          label: productStorages.label,
          facilityId: productStorages.facilityId,
          expandFacilities: productStorages.expandFacilities,
          productId: productStorages.productId,
          productName: products.name,
          expandProducts: productStorages.expandProducts,
          initialStock: productStorages.initialStock,
          minStock: productStorages.minStock,
          safetyStock: productStorages.safetyStock,
          maxStock: productStorages.maxStock,
          fixed: productStorages.fixed,
          fixedValue: productStorages.fixedValue,
          understockPenalty: productStorages.understockPenalty,
          safetyStockPenalty: productStorages.safetyStockPenalty,
          overstockPenalty: productStorages.overstockPenalty,
          currency: productStorages.currency,
          productUnit: productStorages.productUnit,
          timePeriodId: productStorages.timePeriodId,
          expandPeriods: productStorages.expandPeriods,
          inclusionType: productStorages.inclusionType,
          facilityName: facilities.name,
        })
        .from(productStorages)
          .leftJoin(facilities, eq(productStorages.facilityId, facilities.id))
        .leftJoin(products, eq(productStorages.productId, products.id))
        .leftJoin(periods, eq(productStorages.timePeriodId, periods.id))
        .where(
          and(
            facilityId ? eq(productStorages.facilityId, facilityId) : undefined,
            productId ? eq(productStorages.productId, productId) : undefined,
            timePeriodId ? eq(productStorages.timePeriodId, timePeriodId) : undefined
          )
        )
        .orderBy(desc(productStorages.id));

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
        .from(productStorages)
        .where(eq(productStorages.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertProductStorageSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(productStorages)
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
    zValidator('json', z.array(insertProductStorageSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
        await db.delete(productStorages);
      const data = await db.insert(productStorages).values(values).returning();

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
          .delete(productStorages)
          .where(inArray(productStorages.id, ids)) // Use ids directly
          .returning({ id: productStorages.id });

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
    zValidator('json', patchproductstoragesSchema),
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

        // Handle cost separately to avoid type issues
        if (updateValues.cost !== undefined) {
          updateValues.cost = updateValues.cost.toString();
        }

        const [data] = await db
          .update(productStorages)
          .set(updateValues)
          .where(eq(productStorages.id, Number(id)))
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
        .delete(productStorages)
        .where(eq(productStorages.id, Number(id)))
        .returning({
          id: productStorages.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
