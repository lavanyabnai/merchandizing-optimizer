import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { bom, products, insertBomSchema } from '@/db/schema';

const patchBomSchema = z.object({
  name: z.string().optional(),
  endProductId: z.number().optional(),
  quantity: z.number().optional()
});

const app = new Hono()
  .get('/', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const data = await db
      .select({
        id: bom.id,
        name: bom.name,
        endProductId: bom.endProductId,
        endProductName: products.name,
        quantity: bom.quantity,
        createdAt: bom.createdAt,
        updatedAt: bom.updatedAt
      })
      .from(bom)
      .innerJoin(products, eq(bom.endProductId, products.id));

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
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid('param');
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const [data] = await db
        .select()
        .from(bom)
        .where(eq(bom.id, parseInt(id)));
      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    '/',
    clerkMiddleware(),
    zValidator('json', insertBomSchema),
    async (c) => {
      try {
        const auth = getAuth(c);
        const values = c.req.valid('json');

        console.log('Received POST data:', values);

        if (!auth?.userId) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        const [data] = await db.insert(bom).values(values).returning();
        return c.json({ data });
      } catch (error) {
        console.error('POST Error:', error);

        if (error instanceof z.ZodError) {
          return c.json(
            {
              error: 'Validation error',
              details: error.errors
            },
            400
          );
        }

        return c.json(
          {
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    }
  )
  .post(
    '/bulk-create',
    clerkMiddleware(),
    zValidator(
      'json',
      z.array(
        insertBomSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      try {
        const auth = getAuth(c);
        const values = c.req.valid('json');

        if (!auth?.userId) {
          return c.json({ error: 'Unauthorized' }, 401);
        }

        // Delete existing BOMs and insert new ones
        await db.delete(bom);
        const data = await db.insert(bom).values(values).returning();

        return c.json({ data });
      } catch (error) {
        console.error('Bulk create error:', error);
        if (error instanceof z.ZodError) {
          return c.json(
            { error: 'Validation error', details: error.errors },
            400
          );
        }
        return c.json(
          { 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          },
          500
        );
      }
    }
  )
  .post(
    '/bulk-delete',
    clerkMiddleware(),
    zValidator('json', z.object({ ids: z.array(z.number()) })),
    async (c) => {
      const auth = getAuth(c);
      const { ids } = c.req.valid('json');
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      try {
        const data = await db
          .delete(bom)
          .where(inArray(bom.id, ids))
          .returning({ id: bom.id });
        return c.json({ data });
      } catch (error) {
        console.error('Bulk delete error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .delete(
    '/:id',
    clerkMiddleware(),
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid('param');
      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const [data] = await db
        .delete(bom)
        .where(eq(bom.id, parseInt(id)))
        .returning();
      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data });
    }
  )
  .patch(
    '/:id',
    clerkMiddleware(),
    zValidator(
      'param',
      z.object({
        id: z.string()
      })
    ),
    zValidator('json', patchBomSchema),
    async (c) => {
      try {
        const auth = getAuth(c);
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        if (!auth?.userId) {
          throw new Error('Unauthorized');
        }

        const [data] = await db
          .update(bom)
          .set({
            ...values,
            quantity: values.quantity?.toString()
          })
          .where(eq(bom.id, parseInt(id)))
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
