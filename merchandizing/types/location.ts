export type LocationData = {
  id: number
  type: string
  name: string
  country: string
  status: "Operational" | "Warning" | "Critical"
  performance: string
  lat: number
  lng: number
  // Plant-specific properties
  capacity?: string
  lastIncident?: string
  // Distribution-specific properties
  inventory?: string
  outboundOrders?: string
  // Supplier-specific properties
  reliability?: string
  leadTime?: string
}
