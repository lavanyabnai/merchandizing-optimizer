export interface ProductFlow {
  id: string
  from: string
  to: string
  product: string
  periods: string
  flow: number
  distance: number
  cost: number
  sourceLat: number
  sourceLng: number
  destLat: number
  destLng: number
}

// Sample fallback data
export const sampleProductFlows: ProductFlow[] = [
  {
    id: "flow-1",
    from: "GFA DC 8",
    to: "Weston-super-Mare",
    product: "Vitamins",
    periods: "Basic period",
    flow: 312,
    distance: 51.65,
    cost: 16116.21,
    sourceLat: 51.33685063,
    sourceLng: -2.233976748,
    destLat: 51.34603,
    destLng: -2.97665,
  },
]

export async function loadProductFlowData(): Promise<ProductFlow[]> {
  try {
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ColdChainProduct-OXuK6YuCnYCeDHgGDXJoDOdsrSTkes.csv"

    console.log("Fetching product flow data...")
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

    const flows: ProductFlow[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""))

      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })

      // Convert to ProductFlow format
      const sourceLat = Number.parseFloat(row.Source_lat) || 0
      const sourceLng = Number.parseFloat(row.Source_long) || 0
      const destLat = Number.parseFloat(row.Dest_lat) || 0
      const destLng = Number.parseFloat(row.Dest_long) || 0

      if (sourceLat === 0 || sourceLng === 0 || destLat === 0 || destLng === 0) {
        console.warn(`Skipping flow with invalid coordinates: ${row.From} -> ${row.To}`)
        continue
      }

      const flow: ProductFlow = {
        id: `flow-${i}`,
        from: row.From || "",
        to: row.To || "",
        product: row.Product || "",
        periods: row.Periods || "",
        flow: Number.parseFloat(row.Flow) || 0,
        distance: Number.parseFloat(row.Distance) || 0,
        cost: Number.parseFloat(row.Cost) || 0,
        sourceLat,
        sourceLng,
        destLat,
        destLng,
      }

      flows.push(flow)
    }

    console.log(`Loaded ${flows.length} product flows`)
    return flows
  } catch (error) {
    console.error("Error loading product flow data:", error)
    return sampleProductFlows
  }
}

export function analyzeFlowData(flows: ProductFlow[]) {
  const products = [...new Set(flows.map((f) => f.product))].filter(Boolean)
  const sources = [...new Set(flows.map((f) => f.from))].filter(Boolean)
  const destinations = [...new Set(flows.map((f) => f.to))].filter(Boolean)

  const totalFlow = flows.reduce((sum, f) => sum + f.flow, 0)
  const totalCost = flows.reduce((sum, f) => sum + f.cost, 0)
  const totalDistance = flows.reduce((sum, f) => sum + f.distance, 0)

  const productFlows = products.map((product) => ({
    product,
    totalFlow: flows.filter((f) => f.product === product).reduce((sum, f) => sum + f.flow, 0),
    totalCost: flows.filter((f) => f.product === product).reduce((sum, f) => sum + f.cost, 0),
    routes: flows.filter((f) => f.product === product).length,
  }))

  return {
    products,
    sources,
    destinations,
    totalFlow,
    totalCost,
    totalDistance,
    productFlows,
    routeCount: flows.length,
  }
}
