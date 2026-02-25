// Fetch and parse the CSV data
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ColdChainCustomers-lo47I1ToN9Ys563byOWpR1mjeYWgeS.csv"

async function fetchAndParseCsv() {
  try {
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    // Parse CSV manually
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("Headers:", headers)

    const data = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    console.log("Sample data:", data.slice(0, 3))
    console.log("Total records:", data.length)

    // Convert to facility format
    const facilities = data.map((row, index) => ({
      id: row.ID || `location-${index}`,
      name: row.Name || "Unknown Location",
      type: row.Type || "Customer",
      status: "Operational", // Default status since not in CSV
      lat: Number.parseFloat(row.Latitude) || 0,
      lng: Number.parseFloat(row.Longitude) || 0,
      country: "UK",
      address: row.Location || "",
      capacity: "N/A",
      efficiency: 85 + Math.floor(Math.random() * 15), // Random efficiency between 85-100
    }))

    console.log("Converted facilities:", facilities.slice(0, 3))
    return facilities
  } catch (error) {
    console.error("Error fetching CSV:", error)
    return []
  }
}

// Execute the function
fetchAndParseCsv()
