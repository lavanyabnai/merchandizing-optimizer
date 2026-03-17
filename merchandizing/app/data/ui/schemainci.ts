import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskInciSchema = z.object({
  id: z.string(),
  incident_id: z.string(),
  status: z.string(),
  priority: z.string(),
  ticket_type: z.string(),
  description: z.string(),
});

export type Task = z.infer<typeof taskInciSchema>
