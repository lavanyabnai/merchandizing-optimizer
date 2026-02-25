import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  distanceCoverageByDemands,
  facilities,
  insertDistanceCoverageByDemandSchema
} from '@/db/schema';

const patchDistanceSchema = z.object({
  siteId: z.number(),
  siteName: z.string().optional(),
  demandPercentage: z.number().optional(),
  demandM3: z.number().optional(),
  distanceToSiteKm: z.number().optional()
});

const app = new Hono()
  .get('/', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const data = await db
      .select({
        id: distanceCoverageByDemands.id,
        siteId: distanceCoverageByDemands.siteId,
        siteName: distanceCoverageByDemands.siteName,
        demandPercentage: distanceCoverageByDemands.demandPercentage,
        demandM3: distanceCoverageByDemands.demandM3,
        distanceToSiteKm: distanceCoverageByDemands.distanceToSiteKm,
        updatedAt: distanceCoverageByDemands.updatedAt,
        facilityName: facilities.name
      })
      .from(distanceCoverageByDemands)
      .innerJoin(
        facilities,
        eq(distanceCoverageByDemands.siteId, facilities.id)
      );

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
        .from(distanceCoverageByDemands)
        .where(eq(distanceCoverageByDemands.id, parseInt(id)));
      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    '/',
    clerkMiddleware(),
    zValidator(
      'json',
      insertDistanceCoverageByDemandSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const [data] = await db
        .insert(distanceCoverageByDemands)
        .values({
          ...values
        })
        .returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    clerkMiddleware(),
    zValidator(
      'json',
      z.array(
        insertDistanceCoverageByDemandSchema.omit({
          id: true
        })
      )
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const data = await db
        .insert(distanceCoverageByDemands)
        .values(
          values.map((value) => ({
            ...value
          }))
        )
        .returning();

      return c.json({ data });
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
          .delete(distanceCoverageByDemands)
          .where(inArray(distanceCoverageByDemands.id, ids))
          .returning({ id: distanceCoverageByDemands.id });
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
        .delete(distanceCoverageByDemands)
        .where(eq(distanceCoverageByDemands.id, parseInt(id)))
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
    zValidator('json', patchDistanceSchema),
    async (c) => {
      try {
        const auth = getAuth(c);
        const { id } = c.req.valid('param');
        const values = c.req.valid('json');

        if (!auth?.userId) {
          throw new Error('Unauthorized');
        }

        const [data] = await db
          .update(distanceCoverageByDemands)
          .set({
            siteId: values.siteId,
            siteName: values.siteName,
            demandPercentage: values.demandPercentage?.toString(),
            demandM3: values.demandM3?.toString(),
            distanceToSiteKm: values.distanceToSiteKm?.toString()
          })
          .where(eq(distanceCoverageByDemands.id, parseInt(id)))
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
