function generateSampleData() {
  const skus = ['SKU-1234', 'SKU-5678', 'SKU-9012', 'SKU-3456', 'SKU-7890']
  const locations = [
    'New York',
    'California',
    'Atlanta',
    'Chicago',
    'Dallas',
    'Miami',
  ]
  const num_rows = 30
  let data = []

  for (let i = 0; i < num_rows; i++) {
    let sku = skus[Math.floor(Math.random() * skus.length)]
    let location = locations[Math.floor(Math.random() * locations.length)]
    let fillRateImpact = parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)) // Random fill rate impact between 50% to 100%
    let revenueImpact = parseFloat((Math.random() * 9000 + 1000).toFixed(2)) // Random revenue impact between $1000 and $10000
    let inventoryData = {
      SKU: sku,
      Location: location,
      FillRateImpact: fillRateImpact,
      RevenueImpact: revenueImpact,
    }
    let currentPercentage = Math.random() * 100 // Initial random percentage for week 1

    for (let week = 1; week <= 12; week++) {
      let weekKey = `Week ${week}`
      inventoryData[weekKey] = parseFloat(currentPercentage.toFixed(2))
      if (Math.random() > 0.5) {
        // Random chance to increase or decrease
        currentPercentage += Math.random() * 5 // Increase percentage by up to 5%
      } else {
        currentPercentage -= Math.random() * 5 // Decrease percentage by up to 5%
      }
      if (currentPercentage < 0) currentPercentage = 0 // Ensure percentage does not go below 0
    }

    data.push(inventoryData)
  }

  return data
}

export const generatedSampleData = generateSampleData()
// console.log(JSON.stringify(generatedSampleData, null, 2))
