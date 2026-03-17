import { zValidator } from '@hono/zod-validator';
import { eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { siteStateChanges, insertSiteStateChangesSchema, periods, facilities } from '@/db/schema';

const patchSitestatechangeSchema = z.object({
  siteId: z.number().optional(),
  timePeriodId: z.number().optional(),
  newSiteState: z.string().optional()
});

const app = new Hono()
  .get('/', async (c) => {

    const data = await db.select().from(siteStateChanges);

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
        .from(siteStateChanges)
        .where(eq(siteStateChanges.id, parseInt(id)));

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
      insertSiteStateChangesSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(siteStateChanges).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator(
      'json',
      z.array(
        insertSiteStateChangesSchema
          .omit({
            id: true,
            siteId: true,
            timePeriodId: true
          })
          .extend({
            site_name: z.string(),
            time_period_name: z.string()
          })
      )
    ),
    async (c) => {
      const values = c.req.valid('json');

      // Get all unique names
      const siteNames = Array.from(
        new Set(values.map((v) => v.site_name))
      );
      const timePeriodNames = Array.from(
        new Set(values.map((v) => v.time_period_name))
      );

      // Fetch related entities
      const [siteMap, timePeriodMap] = await Promise.all([
        db.select().from(facilities).where(inArray(facilities.name, siteNames))
          .then(results => new Map(results.map(r => [r.name, r.id]))),
        db.select().from(periods).where(inArray(periods.name, timePeriodNames))
          .then(results => new Map(results.map(r => [r.name, r.id])))
      ]);

      // Prepare demand data
      const demandData = values.map((value) => {
        const siteId = siteMap.get(value.site_name);
        const timePeriodId = timePeriodMap.get(value.time_period_name);

        if (!siteId || !timePeriodId) {
          throw new Error(
            `Missing reference: ${value.site_name}, ${value.time_period_name}`
          );
        }

        const {
          site_name,
          time_period_name,
          ...demandFields
        } = value;
        return {
          ...demandFields,
          siteId,
          timePeriodId,
          userId: auth.userId
        };
      });

      // Insert demands
      const data = await db.insert(siteStateChanges).values(demandData).returning();

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
          .delete(siteStateChanges)
          .where(inArray(siteStateChanges.id, ids))
          .returning({ id: siteStateChanges.id });

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
    zValidator('json', patchSitestatechangeSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(siteStateChanges)
        .set({
          ...values,
          siteId: values.siteId ? Number(values.siteId) : undefined,
          timePeriodId: values.timePeriodId ? Number(values.timePeriodId) : undefined
        })
        .where(eq(siteStateChanges.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
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
        .delete(siteStateChanges)
        .where(eq(siteStateChanges.id, parseInt(id)))
        .returning();

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
