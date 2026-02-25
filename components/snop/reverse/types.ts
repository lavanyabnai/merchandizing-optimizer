export interface CostBreakdown {
  totalCost: number
  recyclingFixedCost: number
  recyclingVariableCost: number
  storageSortingFixedCost: number
  storageSortingVariableCost: number
  cpRecyclingTransportCost: number
}

export interface Facility {
  id: string
  name: string
  type: "recycling" | "sorting"
  varCost: number
  fixedCost: number
  isOpen: boolean
  capacity: number
  collected: number
}

export interface Flow {
  from: string
  to: string
  quantity: number
}

export interface TransportCost {
  from: string
  to: string
  cost: number
}

export interface NetworkConstraint {
  name: string
  value: number
  operator: string
  limit: number
}

export interface ReverseLogisticsModel {
  costBreakdown: CostBreakdown
  facilities: Facility[]
  flows: Flow[]
  totalSupply: number
  recyclingFacilitiesToOpen: {
    number: number
    min: number
    max: number
  }
  transportCosts: TransportCost[]
  constraints: NetworkConstraint[]
}

export interface OptimizationScenario {
  id: string
  name: string
  description: string
  createdAt: Date
  totalCost: number
  model: ReverseLogisticsModel
}
