import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { demandCoverageByDistances } from '@/db/schema';


const app = new Hono()
  
  .get('/', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const data = await db
      .select({
        id: demandCoverageByDistances.id,
        siteId: demandCoverageByDistances.siteId,
        siteName: demandCoverageByDistances.siteName,
        distanceToSiteKm: demandCoverageByDistances.distanceToSiteKm,
        demandPercentage: demandCoverageByDistances.demandPercentage,
        demandM3: demandCoverageByDistances.demandM3,
        updatedAt: demandCoverageByDistances.updatedAt
      })
      .from(demandCoverageByDistances);

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
        .from(demandCoverageByDistances)
          .where(eq(demandCoverageByDistances.id, parseInt(id)));

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  )
  // .post(
  //   '/',
  //   clerkMiddleware(),
  //   zValidator(
  //     'json',
  //     z.object({
  //       name: z.string(),
  //       country: z.string(),
  //       code: z.string().optional(),
  //       address: z.string().optional(),
  //       city: z.string().optional(),
  //       region: z.string().optional(),
  //       postalCode: z.string().optional(),
  //       latitude: z.number().optional(),
  //       longitude: z.number().optional(),
  //       autofillCoordinates: z.boolean().optional()
  //     })
  //   ),
  //   async (c) => {
  //     const auth = getAuth(c);
  //     const values = c.req.valid('json');
      

  //     if (!auth?.userId) {
  //       return c.json({ error: 'Unauthorized' }, 401);
  //     }

  //     const [data] = await db.insert(locations).values(values).returning();

  //     return c.json({ data });
  //   }
  // )
  // .post(
  //   '/bulk-delete',
  //   clerkMiddleware(),
  //   zValidator(
  //     'json',
  //     z.object({
  //       ids: z.array(z.number())
  //     })
  //   ),
  //   async (c) => {
  //     const auth = getAuth(c);
  //     const { ids } = c.req.valid('json');

  //     if (!auth?.userId) {
  //       return c.json({ error: 'Unauthorized' }, 401);
  //     }

  //     try {
  //       const data = await db
  //         .delete(locations)
  //         .where(inArray(locations.id, ids))
  //         .returning({ id: locations.id });

  //       return c.json({ data });
  //     } catch (error) {
  //       console.error('Bulk delete error:', error);
  //       return c.json({ error: 'Internal Server Error' }, 500);
  //     }
  //   }
  // )
  // .delete(
  //   '/:id',
  //   clerkMiddleware(),
  //   zValidator(
  //     'param',
  //     z.object({
  //       id: z.string()
  //     })
  //   ),
  //   async (c) => {
  //     const auth = getAuth(c);
  //     const { id } = c.req.valid('param');

  //     if (!auth?.userId) {
  //       return c.json({ error: 'Unauthorized' }, 401);
  //     }

  //     const [data] = await db
  //       .delete(locations)
  //       .where(eq(locations.id, parseInt(id)))
  //       .returning();

  //     if (!data) {
  //       return c.json({ error: 'Not found' }, 404);
  //     }

  //     return c.json({ data });
  //   }
  // )
  // .post(
  //   '/bulk-create',
  //   clerkMiddleware(),
  //   zValidator(
  //     'json',
  //     z.array(
  //       insertLocationSchema.omit({
  //           id: true
  //         })
  //     )
  //   ),
  //   async (c) => {
  //     const auth = getAuth(c);
  //     const values = c.req.valid('json');
      
  //     if (!auth?.userId) {
  //       return c.json({ error: 'Unauthorized' }, 401);
  //     }
  //     await db.delete(locations);
  //     const data = await db.insert(locations).values(values).returning();

  //     return c.json({ data });
  //   }
  // )

  // .patch(
  //   '/:id',
  //   clerkMiddleware(),
  //   zValidator(
  //     'param',
  //     z.object({
  //       id: z.string()
  //     })
  //   ),
  //   zValidator('json', patchLocationSchema),
  //   async (c) => {
  //     const auth = getAuth(c);
  //     const { id } = c.req.valid('param');
  //     const values = c.req.valid('json');

  //     if (!auth?.userId) {
  //       return c.json({ error: 'Unauthorized' }, 401);
  //     }

  //     const [data] = await db
  //       .update(locations)
  //       .set(values)
  //       .where(eq(locations.id, parseInt(id)))
  //       .returning();

  //     if (!data) {
  //       return c.json({ error: 'Not found' }, 404);
  //     }

  //     return c.json({ data });
  //   }
  // );
  

export default app;
