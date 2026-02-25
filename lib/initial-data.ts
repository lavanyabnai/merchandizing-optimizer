import type { ModelState } from "./types"

export const initialModelState: ModelState = {
  // Parameters
  leadTime: 0,
  setupCostPerRun: 500,
  holdingCostPerItemMonth: 1.0,
  capacity: 99999,

  // Period data
  periods: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  demand: [200, 150, 100, 50, 50, 100, 150, 200, 200, 250, 300, 250],
  beginningInventory: [0, 350, 200, 100, 50, 0, 350, 200, 0, 250, 0, 250],

  // Decision variables (will be calculated by optimization)
  quantityToMake: [550, 0, 0, 0, 0, 450, 0, 0, 450, 0, 550, 0],
  orderSetup: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0],

  // Calculated values (will be calculated based on decisions)
  endingInventory: [350, 200, 100, 50, 0, 350, 200, 0, 250, 0, 250, 0],
  setupCost: [500, 0, 0, 0, 0, 500, 0, 0, 500, 0, 500, 0],
  holdingCost: [350, 200, 100, 50, 0, 350, 200, 0, 250, 0, 250, 0],
  totalCost: [850, 200, 100, 50, 0, 850, 200, 0, 750, 0, 750, 0],
}
