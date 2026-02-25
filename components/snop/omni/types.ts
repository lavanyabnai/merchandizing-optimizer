export interface CostBreakdown {
  totalCost: number
  idFixedCost: number
  idTransport: number
  idHandling: number
  podTransport: number
  podDeliveryProcessing: number
}

export interface IntermediateDepot {
  id: string
  varCost: number
  fixedCost: number
  isOpen: boolean
  flowFromCDC: number
  transportCost: number
}

export interface ChannelFlow {
  channelName: string
  fromCDC: number
  fromID1: number
  fromID2: number
  delivered: number
  demanded: number
  varCost: number
}

export interface TransportCost {
  from: string
  convStore: number
  retailStore: number
  aps: number
  home: number
}

export interface NetworkConstraint {
  name: string
  value: number
  operator: string
  limit: number
}

export interface NetworkModel {
  costBreakdown: CostBreakdown
  intermediateDepots: IntermediateDepot[]
  channelFlows: ChannelFlow[]
  totalDemand: number
  idsToOpen: {
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
  model: NetworkModel
}
