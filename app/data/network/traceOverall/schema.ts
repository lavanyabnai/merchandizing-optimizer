
import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  sku: z.string(),
  dc: z.string(),
  store: z.string(),
  status: z.string(),
  title: z.string(),
  severity: z.string(),
  owner: z.string(),
  sop: z.string(),
  label: z.string(),
  priority: z.string(),
  // Corrected key name
})

export type Task = z.infer<typeof taskSchema>
