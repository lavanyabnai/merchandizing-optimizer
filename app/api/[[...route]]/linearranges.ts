import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { linearRanges, insertlinearrangeSchema } from '@/db/schema';

const patchlinearrangeSchema = z.object({
  name: z.string().optional(),
  lowerBound: z.number().optional(),
  expression: z.string().optional(),
  upperBound: z.number().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    try {
      const data = await db
        .select({
          id: linearRanges.id,
          name: linearRanges.name,
          lowerBound: linearRanges.lowerBound,
          expression: linearRanges.expression,
          upperBound: linearRanges.upperBound
        })
        .from(linearRanges);

      // console.log('Fetched data:', data);
      return c.json({ data });
    } catch (error) {
      console.error('Error fetching data:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
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

      try {
        const [data] = await db
          .select()
          .from(linearRanges)
          .where(eq(linearRanges.id, parseInt(id)));

        if (!data) {
          return c.json({ error: 'Not found' }, 404);
        }

        console.log('Fetched data by ID:', data);
        return c.json({ data });
      } catch (error) {
        console.error('Error fetching data by ID:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .post(
    '/',
    zValidator('json', insertlinearrangeSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Received values:', JSON.stringify(values, null, 2));

        const [data] = await db.insert(linearRanges).values(values).returning();

        if (!data) {
          console.error('Insertion failed - no data returned');
          return c.json({ error: 'Insertion failed - no data returned' }, 500);
        }

        return c.json({ data });
      } catch (error: any) {
        console.error('POST Error:', error);
        if (error instanceof z.ZodError) {
          console.error('Validation error:', error.errors);
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        return c.json({ error: error.message }, 500);
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
          .delete(linearRanges)
          .where(inArray(linearRanges.id, ids))
          .returning({ id: linearRanges.id });

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

      try {
        const [data] = await db
          .delete(linearRanges)
          .where(eq(linearRanges.id, parseInt(id)))
          .returning();

        if (!data) {
          return c.json({ error: 'Not found' }, 404);
        }

        return c.json({ data });
      } catch (error) {
        console.error('Delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertlinearrangeSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');
      console.log('Received bulk create values:', values); // Log the incoming values
      try {
        await db.delete(linearRanges);
        const data = await db.insert(linearRanges).values(values).returning();

        return c.json({ data });
      } catch (error) {
        console.error('Bulk create error:', error);
        if (error instanceof z.ZodError) {
          console.error('Validation error details:', error.errors); // Log validation errors
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
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
    zValidator('json', patchlinearrangeSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        console.log('PATCH request values:', values); // Log the incoming values

        const [data] = await db
          .update(linearRanges)
          .set({
            ...values,
            lowerBound:
              values.lowerBound !== undefined
                ? String(values.lowerBound)
                : undefined,
            upperBound:
              values.upperBound !== undefined
                ? String(values.upperBound)
                : undefined
          })
          .where(eq(linearRanges.id, Number(id)))
          .returning();

        if (!data) {
          throw new Error('Not found');
        }

        return c.json({ data });
      } catch (error) {
        console.error('❌ PATCH ERROR:', error);
        if (error instanceof z.ZodError) {
          console.error('Validation error details:', error.errors); // Log validation errors
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
