export interface WarehouseParams {
  orderQuantity: number // Q
  safetyStock: number // SS
  leadTime: number // LT
}

export interface PeriodData {
  periodUsage: number
  grossRequirements: number
  beginningInventory: number
  scheduledReceipts: number
  netRequirements: number | null
  plannedReceipts: number | null
  endingInventory: number
  plannedOrder: number | null
}

export interface WarehouseData extends WarehouseParams {
  name: string
  periods: PeriodData[]
  retailers?: string[]
}

export interface NetworkData {
  plant: {
    name: string
  }
  centralWarehouse: WarehouseData
  regionalWarehouses: WarehouseData[]
}

export interface KpiData {
  serviceLevel: number
  inventoryTurnover: number
  averageInventory: number
  stockoutPeriods: number
  orderFrequency: number
}

export interface WarehouseKpis {
  [warehouseName: string]: KpiData
}
