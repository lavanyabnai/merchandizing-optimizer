import { CoreMessage } from 'ai'

export interface ModelState {
  // Parameters
  leadTime: number
  setupCostPerRun: number
  holdingCostPerItemMonth: number
  capacity: number

  // Period data
  periods: number[]
  demand: number[]
  beginningInventory: number[]

  // Decision variables
  quantityToMake: number[]
  orderSetup: number[]

  // Calculated values
  endingInventory: number[]
  setupCost: number[]
  holdingCost: number[]
  totalCost: number[]
}
export type Message = CoreMessage & {
  id: string
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}
