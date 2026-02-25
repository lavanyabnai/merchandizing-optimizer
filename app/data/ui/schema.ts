import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  scenario_id: z.string(),
  description: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  module: z.string(),
  Status: z.string(),
});

export type Task = z.infer<typeof taskSchema>
