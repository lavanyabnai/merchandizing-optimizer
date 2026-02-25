export interface MrpState {
  // Periods
  periods: number[]

  // Total system cost
  totalSystemCost: number

  // End Item Manufacturer
  endItem: {
    leadTime: number
    setupCost: number
    holdingCost: number
    capacity: number
    grossRequirements: number[]
    beginningInventory: number[]
    dueIn: number[]
    endingInventory: number[]
    plannedOrderRelease: number[]
    totalCost: number
  }

  // Component Manufacturer
  component: {
    leadTime: number
    qtyPerEndItem: number
    setupCost: number
    holdingCost: number
    capacity: number
    grossRequirements: number[]
    beginningInventory: number[]
    dueIn: number[]
    endingInventory: number[]
    plannedOrderRelease: number[]
    totalCost: number
  }
}
