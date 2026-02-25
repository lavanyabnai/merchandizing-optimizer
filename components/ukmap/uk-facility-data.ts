// import type { Facility } from "@/components/map/facility"

// This will be populated with actual CSV data
export const ukFacilityData: any[] = [
  {
    id: "Customer 100",
    name: "Stockton-on-Tees",
    type: "Customer",
    status: "Operational",
    lat: 54.56848,
    lng: -1.3187,
    country: "UK",
    address: "Stockton-on-Tees location",
    capacity: "N/A",
    efficiency: 92,
  },
  // Additional sample data will be loaded dynamically
]

// Function to load CSV data and convert to facility format
export async function loadUKFacilities(): Promise<any[]> {
  try {
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ColdChainCustomers-lo47I1ToN9Ys563byOWpR1mjeYWgeS.csv"

    console.log("Fetching CSV data from:", csvUrl)
    const response = await fetch(csvUrl)
    const csvText = await response.text()
    console.log("CSV text length:", csvText.length)

    // Parse CSV more carefully
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    console.log("CSV Headers:", headers)

    const facilities: any[] = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Handle CSV parsing more carefully for quoted fields
      const values: any[] = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Don't forget the last value

      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })

      // Convert to Facility format with better error handling
      const lat = Number.parseFloat(row.Latitude || "0")
      const lng = Number.parseFloat(row.Longitude || "0")

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        console.warn(`Skipping facility with invalid coordinates: ${row.Name}`)
        continue
      }

      const facility: any = {
        id: row.ID || `location-${i}`,
        name: row.Name || "Unknown Location",
        type: row.Type || "Customer",
        status: ["Operational", "Warning", "Critical"][Math.floor(Math.random() * 3)],
        lat: lat,
        lng: lng,
        country: "UK",
        address: row.Location || row.Name || "",
        capacity: "N/A",
        efficiency: 75 + Math.floor(Math.random() * 25),
      }

      facilities.push(facility)
    }

    console.log(`Loaded ${facilities.length} facilities`)
    console.log("Sample facility:", facilities[0])
    return facilities
  } catch (error) {
    console.error("Error loading UK facilities:", error)
    return ukFacilityData // Return sample data as fallback
  }
}
