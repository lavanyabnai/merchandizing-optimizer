import type { ReverseLogisticsModel, OptimizationScenario } from "./types"

export const initialReverseLogisticsModel: ReverseLogisticsModel = {
  costBreakdown: {
    totalCost: 765000,
    recyclingFixedCost: 2800,
    recyclingVariableCost: 470800,
    storageSortingFixedCost: 700,
    storageSortingVariableCost: 24300,
    cpRecyclingTransportCost: 266400,
  },
  facilities: [
    {
      id: "recycling-1",
      name: "Recycling 1",
      type: "recycling",
      varCost: 74.8,
      fixedCost: 1500,
      isOpen: true,
      capacity: 3500,
      collected: 3500,
    },
    {
      id: "recycling-2",
      name: "Recycling 2",
      type: "recycling",
      varCost: 83.6,
      fixedCost: 1300,
      isOpen: true,
      capacity: 3000,
      collected: 2500,
    },
    {
      id: "regional-sorting",
      name: "Regional Sorting",
      type: "sorting",
      varCost: 5.4,
      fixedCost: 700,
      isOpen: true,
      capacity: 6000,
      collected: 4500,
    },
    {
      id: "cp-1",
      name: "Collection Point 1",
      type: "sorting",
      varCost: 0,
      fixedCost: 0,
      isOpen: true,
      capacity: 2000,
      collected: 2000,
    },
    {
      id: "cp-2",
      name: "Collection Point 2",
      type: "sorting",
      varCost: 0,
      fixedCost: 0,
      isOpen: true,
      capacity: 1500,
      collected: 1500,
    },
    {
      id: "cp-3",
      name: "Collection Point 3",
      type: "sorting",
      varCost: 0,
      fixedCost: 0,
      isOpen: true,
      capacity: 2500,
      collected: 2500,
    },
  ],
  flows: [
    // From Regional Sorting to Recycling facilities
    { from: "regional-sorting", to: "recycling-1", quantity: 3500 },
    { from: "regional-sorting", to: "recycling-2", quantity: 1000 },

    // From Collection Points to Regional Sorting
    { from: "cp-1", to: "regional-sorting", quantity: 2000 },
    { from: "cp-3", to: "regional-sorting", quantity: 2500 },

    // Direct from Collection Points to Recycling facilities
    { from: "cp-2", to: "recycling-2", quantity: 1500 },
  ],
  totalSupply: 6000,
  recyclingFacilitiesToOpen: {
    number: 2,
    min: 1,
    max: 2,
  },
  transportCosts: [
    { from: "regional-sorting", to: "recycling-1", cost: 17.6 },
    { from: "regional-sorting", to: "recycling-2", cost: 19.2 },
    { from: "cp-1", to: "regional-sorting", cost: 28.4 },
    { from: "cp-1", to: "recycling-1", cost: 66.4 },
    { from: "cp-1", to: "recycling-2", cost: 56.2 },
    { from: "cp-2", to: "regional-sorting", cost: 26.1 },
    { from: "cp-2", to: "recycling-1", cost: 62.4 },
    { from: "cp-2", to: "recycling-2", cost: 46.2 },
    { from: "cp-3", to: "regional-sorting", cost: 23.8 },
    { from: "cp-3", to: "recycling-1", cost: 73.9 },
    { from: "cp-3", to: "recycling-2", cost: 53.6 },
  ],
  constraints: [
    {
      name: "Recycling 1 Capacity",
      value: 3500,
      operator: "<=",
      limit: 3500,
    },
    {
      name: "Recycling 2 Capacity",
      value: 2500,
      operator: "<=",
      limit: 3000,
    },
    {
      name: "Regional Sorting Capacity",
      value: 4500,
      operator: "<=",
      limit: 6000,
    },
    {
      name: "Regional Sorting Balance",
      value: 0,
      operator: "=",
      limit: 0,
    },
  ],
}

export const initialScenarios: OptimizationScenario[] = [
  {
    id: "scenario-1",
    name: "Base Case",
    description: "Current reverse logistics network configuration",
    createdAt: new Date(2025, 4, 20),
    totalCost: 765000,
    model: initialReverseLogisticsModel,
  },
  {
    id: "scenario-2",
    name: "Direct Transport",
    description: "More direct transport from collection points to recycling",
    createdAt: new Date(2025, 4, 21),
    totalCost: 742500,
    model: {
      ...initialReverseLogisticsModel,
      costBreakdown: {
        ...initialReverseLogisticsModel.costBreakdown,
        totalCost: 742500,
        storageSortingVariableCost: 16200,
        cpRecyclingTransportCost: 252700,
      },
      flows: [
        // From Regional Sorting to Recycling facilities
        { from: "regional-sorting", to: "recycling-1", quantity: 3000 },
        { from: "regional-sorting", to: "recycling-2", quantity: 0 },

        // From Collection Points to Regional Sorting
        { from: "cp-1", to: "regional-sorting", quantity: 1000 },
        { from: "cp-3", to: "regional-sorting", quantity: 2000 },

        // Direct from Collection Points to Recycling facilities
        { from: "cp-1", to: "recycling-2", quantity: 1000 },
        { from: "cp-2", to: "recycling-2", quantity: 1500 },
        { from: "cp-3", to: "recycling-1", quantity: 500 },
      ],
    },
  },
  {
    id: "scenario-3",
    name: "Centralized Sorting",
    description: "All collection points route through regional sorting",
    createdAt: new Date(2025, 4, 22),
    totalCost: 780000,
    model: {
      ...initialReverseLogisticsModel,
      costBreakdown: {
        ...initialReverseLogisticsModel.costBreakdown,
        totalCost: 780000,
        storageSortingVariableCost: 32400,
        cpRecyclingTransportCost: 274000,
      },
      flows: [
        // From Regional Sorting to Recycling facilities
        { from: "regional-sorting", to: "recycling-1", quantity: 3500 },
        { from: "regional-sorting", to: "recycling-2", quantity: 2500 },

        // From Collection Points to Regional Sorting
        { from: "cp-1", to: "regional-sorting", quantity: 2000 },
        { from: "cp-2", to: "regional-sorting", quantity: 1500 },
        { from: "cp-3", to: "regional-sorting", quantity: 2500 },

        // No direct flows from CP to Recycling
      ],
    },
  },
]
