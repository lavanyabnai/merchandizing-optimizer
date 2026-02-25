export type EntityType = "customer" | "distribution" | "factory" | "supplier"

export interface MapEntity {
  id: number
  name: string
  type: EntityType
  locationId: number
  inclusionType?: "Include" | "Exclude" | "Consider"
  additionalParams?: Record<string, unknown>
  icon?: string
  createdAt?: string
  updatedAt?: string
  // Location data
  locationName: string
  lat: number
  lng: number
  country: string
  city: string
  address: string
  phone?: string
  email?: string
  website?: string
  // Facility-specific fields (optional for non-facility entities)
  capacity?: number
  capacityUnit?: string
  facilityType?: string
  // Connection data
  connectedTo?: number[]
  parentId?: number
}

export interface CreateEntityData {
  name: string
  type: EntityType
  locationId: number
  inclusionType: "Include" | "Exclude" | "Consider"
  additionalParams?: Record<string, unknown>
  icon?: string
}

export interface MapClickEvent {
  lat: number
  lng: number
}

export interface ConnectionLine {
  from: MapEntity
  to: MapEntity
  type: "supply" | "distribution" | "customer"
  color: string
  weight: number
}

// Region mapping based on countries
const REGION_MAPPING: Record<string, string> = {
  // Asia
  China: "Asia",
  Japan: "Asia",
  "South Korea": "Asia",
  India: "Asia",
  Singapore: "Asia",
  Thailand: "Asia",
  Malaysia: "Asia",
  Indonesia: "Asia",
  Philippines: "Asia",
  Vietnam: "Asia",
  Taiwan: "Asia",
  "Hong Kong": "Asia",

  // Europe
  Germany: "Europe",
  France: "Europe",
  "United Kingdom": "Europe",
  Italy: "Europe",
  Spain: "Europe",
  Netherlands: "Europe",
  Belgium: "Europe",
  Switzerland: "Europe",
  Austria: "Europe",
  Sweden: "Europe",
  Norway: "Europe",
  Denmark: "Europe",
  Finland: "Europe",
  Poland: "Europe",
  "Czech Republic": "Europe",
  Hungary: "Europe",
  Portugal: "Europe",
  Ireland: "Europe",
  Greece: "Europe",
  Romania: "Europe",
  Bulgaria: "Europe",
  Croatia: "Europe",
  Slovakia: "Europe",
  Slovenia: "Europe",
  Estonia: "Europe",
  Latvia: "Europe",
  Lithuania: "Europe",
  Luxembourg: "Europe",
  Malta: "Europe",
  Cyprus: "Europe",

  // North America
  "United States": "North America",
  Canada: "North America",
  Mexico: "North America",

  // South America
  Brazil: "South America",
  Argentina: "South America",
  Chile: "South America",
  Colombia: "South America",
  Peru: "South America",
  Venezuela: "South America",
  Ecuador: "South America",
  Bolivia: "South America",
  Paraguay: "South America",
  Uruguay: "South America",
  Guyana: "South America",
  Suriname: "South America",

  // Oceania
  Australia: "Oceania",
  "New Zealand": "Oceania",
  Fiji: "Oceania",
  "Papua New Guinea": "Oceania",

  // Africa
  "South Africa": "Africa",
  Nigeria: "Africa",
  Egypt: "Africa",
  Kenya: "Africa",
  Morocco: "Africa",
  Ghana: "Africa",
  Ethiopia: "Africa",
  Tanzania: "Africa",
  Uganda: "Africa",
  Algeria: "Africa",
  Tunisia: "Africa",
  Libya: "Africa",
  Sudan: "Africa",
  Cameroon: "Africa",
  "Ivory Coast": "Africa",
  Madagascar: "Africa",
  Zambia: "Africa",
  Zimbabwe: "Africa",
  Botswana: "Africa",
  Namibia: "Africa",
  Mozambique: "Africa",
  Malawi: "Africa",
  Rwanda: "Africa",
  Burundi: "Africa",

  // Middle East
  "Saudi Arabia": "Middle East",
  "United Arab Emirates": "Middle East",
  Israel: "Middle East",
  Turkey: "Middle East",
  Iran: "Middle East",
  Iraq: "Middle East",
  Jordan: "Middle East",
  Lebanon: "Middle East",
  Kuwait: "Middle East",
  Qatar: "Middle East",
  Bahrain: "Middle East",
  Oman: "Middle East",
  Yemen: "Middle East",
  Syria: "Middle East",
}

// Region colors for connection lines
export const REGION_COLORS: Record<string, string> = {
  Asia: "#ef4444", // red
  Europe: "#3b82f6", // blue
  "North America": "#f59e0b", // amber
  "South America": "#10b981", // emerald
  Oceania: "#8b5cf6", // violet
  Africa: "#f97316", // orange
  "Middle East": "#ec4899", // pink
  Other: "#6b7280", // gray
}

export const getEntityRegion = (entity: MapEntity): string => {
  return REGION_MAPPING[entity.country] || "Other"
}
