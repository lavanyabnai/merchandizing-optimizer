function generateData() {
  const carrierIds = Array.from({ length: 50 }, (_, i) => `Carrier-${i + 1}`)
  const shipmentIds = Array.from(
    { length: 50 },
    (_, i) => `Shipment-${1000 + i}`
  )
  const transportTypes = ['Truck', 'Rail', 'Air']
  const origins = [
    'Supplier-A',
    'Supplier-B',
    'Supplier-C',
    'DC-East',
    'DC-West',
  ]
  const destinations = [
    'DC-East',
    'DC-West',
    'Store-New York',
    'Store-California',
    'Store-Texas',
  ]
  const productTypes = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Tools',
    'Housewares',
  ]

  let data = []

  shipmentIds.forEach((shipmentId, index) => {
    const carrierId = carrierIds[Math.floor(Math.random() * carrierIds.length)]
    const transportType =
      transportTypes[Math.floor(Math.random() * transportTypes.length)]
    const origin = origins[Math.floor(Math.random() * origins.length)]
    const destination =
      destinations[Math.floor(Math.random() * destinations.length)]
    const loadDate = new Date(2024, 0, Math.floor(Math.random() * 7) + 1)
    const estimatedArrivalDate = new Date(
      loadDate.getTime() + Math.random() * 86400000 * 2
    ) // 1-2 days later
    const actualArrivalDate = new Date(
      estimatedArrivalDate.getTime() + Math.random() * 86400000
    ) // within 1 day of estimate
    const loadTime = Math.floor(Math.random() * 4) + 1 // Load time in hours
    const unloadTime = Math.floor(Math.random() * 4) + 1 // Unload time in hours
    const productType =
      productTypes[Math.floor(Math.random() * productTypes.length)]
    const quantity = Math.floor(Math.random() * 500) + 50

    const dataPoint = {
      shipmentId,
      carrierId,
      transportType,
      origin,
      destination,
      loadDate,
      estimatedArrivalDate,
      actualArrivalDate,
      loadTime,
      unloadTime,
      productType,
      quantity,
    }

    data.push(dataPoint)
  })

  return data
}

export const generatedCarrierData = generateData()
// console.log(JSON.stringify(generatedCarrierData, null, 2))
