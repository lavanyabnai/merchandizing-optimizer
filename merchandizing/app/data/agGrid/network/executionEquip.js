function generateData() {
  const equipmentNames = [
    'Forklift',
    'Conveyor',
    'Pallet Jack',
    'Shelving Unit',
    'Sorting Machine',
  ]
  const equipmentTypes = ['Lifting', 'Transport', 'Storage', 'Sorting']
  const dcNames = ['DC-East', 'DC-West', 'DC-North', 'DC-South']
  const operationTypes = ['Loading', 'Unloading', 'Sorting', 'Storing']
  const orderIds = Array.from({ length: 100 }, (_, i) => `ORD${1000 + i}`)

  let data = []

  equipmentNames.forEach((equipmentName, index) => {
    const equipmentType =
      equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]
    const dcName = dcNames[Math.floor(Math.random() * dcNames.length)]
    const orderId = orderIds[Math.floor(Math.random() * orderIds.length)]
    const operationType =
      operationTypes[Math.floor(Math.random() * operationTypes.length)]
    const timeRun = Math.floor(Math.random() * 8) + 1 // Time run in hours
    const maintenanceDate = new Date(
      2024,
      0,
      Math.floor(Math.random() * 30) + 1
    )
      .toISOString()
      .slice(0, 10)
    const maintenanceRequired = Math.random() > 0.8 ? 'Yes' : 'No' // 20% chance of needing maintenance

    const dataPoint = {
      equipmentName,
      equipmentType,
      dcName,
      orderId,
      operationType,
      timeRun,
      maintenanceDate,
      maintenanceRequired,
    }

    data.push(dataPoint)
  })

  return data
}

export const generatedEquipmentData = generateData()
// console.log(JSON.stringify(generatedEquipmentData, null, 2))
