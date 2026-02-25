import type { MrpState } from "./types"

export const initialMrpState: MrpState = {
  // Periods
  periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],

  // Total system cost
  totalSystemCost: 8700,

  // End Item Manufacturer
  endItem: {
    leadTime: 2,
    setupCost: 1000,
    holdingCost: 5.0,
    capacity: 1000,
    grossRequirements: [0, 0, 0, 0, 0, 30, 50, 200, 30, 70, 180, 40],
    beginningInventory: [0, 0, 0, 0, 0, 0, 50, 0, 0, 70, 0, 40],
    dueIn: [0, 0, 0, 0, 0, 80, 50, 200, 100, 0, 220, 0],
    endingInventory: [0, 0, 0, 0, 0, 50, 50, 0, 70, 0, 40, 0],
    plannedOrderRelease: [0, 0, 0, 80, 0, 200, 100, 0, 220, 0, 0, 0],
    totalCost: 4800,
  },

  // Component Manufacturer
  component: {
    leadTime: 2,
    qtyPerEndItem: 3,
    setupCost: 500,
    holdingCost: 1.0,
    capacity: 300,
    grossRequirements: [0, 0, 0, 240, 0, 600, 300, 0, 660, 0, 0, 0],
    beginningInventory: [0, 0, 0, 0, 60, 360, 60, 60, 360, 0, 0, 0],
    dueIn: [0, 0, 0, 300, 300, 300, 300, 300, 300, 0, 0, 0],
    endingInventory: [0, 0, 0, 60, 360, 60, 60, 360, 0, 0, 0, 0],
    plannedOrderRelease: [0, 300, 300, 300, 300, 300, 300, 0, 0, 0, 0, 0],
    totalCost: 3900,
  },
}
