function generateData() {
  const storeNames = [
    'Store-Alpha',
    'Store-Beta',
    'Store-Gamma',
    'Store-Delta',
    'Store-Epsilon',
  ]
  const storeTypes = ['Flagship', 'Standard']
  const locations = ['New York', 'California', 'Texas', 'Florida', 'Washington']
  const measures = [
    'Daily Sales (Units)',
    'Daily Sales (Revenue)',
    'Inventory Level',
    'Customer Foot Traffic',
    'Staff Working Hours',
    'Promotional Activity Effectiveness',
  ]
  const days = Array.from({ length: 7 }, (_, i) => `Day_${i + 1}`) // Generate days Day 1 to Day 7

  let data = []

  storeNames.forEach((storeName) => {
    storeTypes.forEach((storeType) => {
      locations.forEach((location) => {
        measures.forEach((measure) => {
          let dailyValues = {}
          days.forEach((day) => {
            // Generating random values for each measure
            if (measure === 'Daily Sales (Revenue)') {
              dailyValues[day] = (Math.random() * 10000 + 500).toFixed(2) // Revenue in USD
            } else if (measure === 'Customer Foot Traffic') {
              dailyValues[day] = Math.floor(Math.random() * 500 + 50) // Number of customers
            } else if (measure === 'Staff Working Hours') {
              dailyValues[day] = Math.floor(Math.random() * 80 + 160) // Total hours
            } else if (measure === 'Promotional Activity Effectiveness') {
              dailyValues[day] = (Math.random() * 100).toFixed(2) // Effectiveness in percentage
            } else {
              dailyValues[day] = Math.floor(Math.random() * 300 + 50) // General units or levels
            }
          })

          const dataPoint = {
            storeName,
            storeType,
            location,
            measure,
            ...dailyValues,
          }

          data.push(dataPoint)
        })
      })
    })
  })

  return data
}

export const generatedData = generateData()
// console.log(JSON.stringify(generatedData, null, 2))
