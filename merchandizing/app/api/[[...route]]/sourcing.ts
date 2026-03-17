import { zValidator } from '@hono/zod-validator';
import { desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  sourcing,
  insertSourcingSchema,
  products, 
  periods,
} from '@/db/schema';

const patchsourcingsSchema = z.object({
  deliveryDestination: z.string().max(255).optional(),
  sources: z.array(z.string().max(255)).optional(),
  productId: z.number().optional(),
  type: z.enum([
    'First',
    'Cheapest',
    'Closest',
    'Fastest',
    'Most Inventory',
    'Uniform Split',
    'Split by Ratio'
  ]).optional(),
  parameters: z.number().int().optional(),
  timePeriodId: z.number().optional(),
  inclusionType: z.enum(['Include', 'Exclude']).optional(),
});

const app = new Hono()
  .get(
    '/',
    async (c) => {

      const data = await db
        .select({
          id: sourcing.id,
          deliveryDestination: sourcing.deliveryDestination,
          sources: sourcing.sources,
          productId: sourcing.productId,
          productName: products.name,
          type: sourcing.type,
          parameters: sourcing.parameters,
          timePeriodId: sourcing.timePeriodId,
          timePeriodName: periods.name,
          inclusionType: sourcing.inclusionType,
          createdAt: sourcing.createdAt,
          updatedAt: sourcing.updatedAt,
        })
        .from(sourcing)
        .leftJoin(products, eq(sourcing.productId, products.id))
        .leftJoin(periods, eq(sourcing.timePeriodId, periods.id))

        .orderBy(desc(sourcing.id));

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
        .from(sourcing)
        .where(eq(sourcing.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertSourcingSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(sourcing)
            .values({
              ...values,
              sources: Array.isArray(values.sources) ? values.sources : values.sources ? [values.sources] : null
            })
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
    zValidator('json', z.array(insertSourcingSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      try {
        await db.delete(sourcing);
        const data = await db.insert(sourcing).values(
          values.map(value => ({
            ...value,
            sources: Array.isArray(value.sources) ? value.sources : value.sources ? [value.sources] : null
          }))
        ).returning();

        return c.json({ data });
      } catch (error) {
        console.error('Bulk operation error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
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
          .delete(sourcing)
          .where(inArray(sourcing.id, ids)) // Use ids directly
          .returning({ id: sourcing.id });

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
    zValidator('json', patchsourcingsSchema),
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
          .update(sourcing)
          .set(updateValues)
          .where(eq(sourcing.id, Number(id)))
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
        .delete(sourcing)
        .where(eq(sourcing.id, Number(id)))
        .returning({
          id: sourcing.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
