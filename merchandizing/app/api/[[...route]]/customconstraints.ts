import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { customConstraints, insertcustomConstraintSchema } from '@/db/schema';

const patchcustomConstraintSchema = z.object({
  leftHandSide: z.string().optional(),
  comparisonType: z.string().optional(),
  rightHandSide: z.string().optional(),
  constraintType: z.string().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db
      .select({
        id: customConstraints.id,
        leftHandSide: customConstraints.leftHandSide,
        comparisonType: customConstraints.comparisonType,
        rightHandSide: customConstraints.rightHandSide,
        constraintType: customConstraints.constraintType,
        createdAt: customConstraints.createdAt,
        updatedAt: customConstraints.updatedAt
      })
      .from(customConstraints);

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
        .from(customConstraints)
        .where(eq(customConstraints.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    '/',
    zValidator('json', insertcustomConstraintSchema),
    async (c) => {
      try {
        const values = c.req.valid('json');

        console.log('Inserting values:', JSON.stringify(values, null, 2));

        let data;
        try {
          [data] = await db
            .insert(customConstraints)
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
          .delete(customConstraints)
          .where(inArray(customConstraints.id, ids))
          .returning({ id: customConstraints.id });

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
        .delete(customConstraints)
        .where(eq(customConstraints.id, parseInt(id)))
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
      z.array(insertcustomConstraintSchema.omit({ id: true }))
    ),
    async (c) => {
      const values = c.req.valid('json');
      await db.delete(customConstraints);
      const data = await db
        .insert(customConstraints)
        .values(values)
        .returning();

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
    zValidator('json', patchcustomConstraintSchema),
    async (c) => {
      try {
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        const [data] = await db
          .update(customConstraints)
          .set(values)
          .where(eq(customConstraints.id, parseInt(id)))
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
