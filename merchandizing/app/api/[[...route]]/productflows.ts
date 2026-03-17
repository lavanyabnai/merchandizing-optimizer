import { zValidator } from '@hono/zod-validator';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import {
  productFlows,
  facilities,
  vehicleTypes,
  products,
  periods,
  insertProductFlowSchema
} from '@/db/schema';

const patchProductFlowSchema = z.object({
  label: z.string().optional(),
  sourceId: z.string().optional(),
  destinationId: z.string().optional(),
  vehicleTypeId: z.string().optional(),
  productId: z.string().optional(),
  expandSources: z.boolean().optional(),
  expandDestinations: z.boolean().optional(),
  expandProducts: z.boolean().optional(),
  minThroughput: z.string().optional(),
  maxThroughput: z.string().optional(),
  fixed: z.boolean().optional(),
  fixedValue: z.string().optional(),
  productUnit: z.string().optional(),
  downPenalty: z.string().optional(),
  upPenalty: z.string().optional(),
  currency: z.string().optional(),
  distanceLimit: z.string().optional(),
  distanceUnit: z.string().optional(),
  timeLimit: z.string().optional(),
  timeUnit: z.string().optional(),
  timePeriodId: z.string().optional(),
  expandPeriods: z.boolean().optional(),
  inclusionType: z.string().optional()
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
        sourceId: z.number().optional(),
        productId: z.number().optional(),
        timePeriodId: z.number().optional()
      })
    ),
    async (c) => {
      const { sourceId, productId, timePeriodId } = c.req.valid('query');

      try {
        const data = await db
          .select({
            id: productFlows.id,
            label: productFlows.label,
            sourceId: productFlows.sourceId,
            sourceName: facilities.name,
            productId: productFlows.productId,
            productName: products.name,
            destinationId: productFlows.destinationId,
            destinationName: facilities.name,
            vehicleTypeId: productFlows.vehicleTypeId,
            vehicleTypeName: vehicleTypes.name,
            minThroughput: productFlows.minThroughput,
            maxThroughput: productFlows.maxThroughput,
            fixed: productFlows.fixed,
            fixedValue: productFlows.fixedValue,
            productUnit: productFlows.productUnit,
            downPenalty: productFlows.downPenalty,
            upPenalty: productFlows.upPenalty,
            currency: productFlows.currency,
            distanceLimit: productFlows.distanceLimit,
            distanceUnit: productFlows.distanceUnit,
            timeLimit: productFlows.timeLimit,
            timeUnit: productFlows.timeUnit,
            timePeriodId: productFlows.timePeriodId,
            timePeriodName: periods.name
          })
          .from(productFlows)
          .leftJoin(facilities, eq(productFlows.sourceId, facilities.id))
          .leftJoin(products, eq(productFlows.productId, products.id))
          .leftJoin(periods, eq(productFlows.timePeriodId, periods.id))
          .leftJoin(
            vehicleTypes,
            eq(productFlows.vehicleTypeId, vehicleTypes.id)
          )
          .where(
            and(
              sourceId !== undefined
                ? eq(productFlows.sourceId, sourceId)
                : undefined,
              productId !== undefined
                ? eq(productFlows.productId, productId)
                : undefined,
              timePeriodId !== undefined
                ? eq(productFlows.timePeriodId, timePeriodId)
                : undefined
            )
          )
          .orderBy(desc(productFlows.id));

        return c.json({ data });
      } catch (error) {
        console.error('Error fetching data:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }
  )
  .get(
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
        .select()
        .from(productFlows)
        .where(eq(productFlows.id, Number(id))); // Convert id to a number

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
      insertProductFlowSchema.omit({
        id: true
      })
    ),
    async (c) => {
      const values = c.req.valid('json');

      const [data] = await db.insert(productFlows).values(values).returning();

      return c.json({ data });
    }
  )
  .post(
    '/bulk-create',
    zValidator('json', z.array(insertProductFlowSchema.omit({ id: true }))),
    async (c) => {
      const values = c.req.valid('json');

      console.log('Received values:', values);

      try {
        await db.delete(productFlows);
        const data = await db.insert(productFlows).values(values).returning();
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
        ids: z.array(z.number()) // Change from z.string() to z.number()
      })
    ),
    async (c) => {
      const { ids } = c.req.valid('json'); // Destructure ids directly

      try {
        const data = await db
          .delete(productFlows)
          .where(inArray(productFlows.id, ids)) // Use ids directly
          .returning({ id: productFlows.id });

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
    zValidator('json', patchProductFlowSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .update(productFlows)
        .set({
          ...values,
          sourceId: values.sourceId ? Number(values.sourceId) : undefined,
          destinationId: values.destinationId ? Number(values.destinationId) : undefined,
          vehicleTypeId: values.vehicleTypeId ? Number(values.vehicleTypeId) : undefined,
          productId: values.productId ? Number(values.productId) : undefined,
          minThroughput: values.minThroughput?.toString(),
          maxThroughput: values.maxThroughput?.toString(),
          fixedValue: values.fixedValue?.toString(),
          downPenalty: values.downPenalty?.toString(),
          upPenalty: values.upPenalty?.toString(),
          distanceLimit: values.distanceLimit?.toString(),
          timeLimit: values.timeLimit?.toString(),
          timePeriodId: values.timePeriodId ? Number(values.timePeriodId) : undefined
        })
        .where(eq(productFlows.id, Number(id)))
        .returning({
          id: productFlows.id
        });

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
        id: z.string().optional()
      })
    ),
    async (c) => {
      const { id } = c.req.valid('param');

      if (!id) {
        return c.json({ error: 'Missing id' }, 400);
      }

      const [data] = await db
        .delete(productFlows)
        .where(eq(productFlows.id, Number(id)))
        .returning({
          id: productFlows.id
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    }
  );

export default app;