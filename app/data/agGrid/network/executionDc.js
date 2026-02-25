function generateData() {
  const dcNames = ['DC-Alpha', 'DC-Beta', 'DC-Gamma', 'DC-Delta', 'DC-Epsilon']
  const dcTypes = ['Type 1', 'Type 2']
  const locations = ['New York', 'California', 'Texas', 'Florida', 'Washington']
  const measures = [
    'Shipment Volume',
    'On time delivery',
    'Lead time',
    'D+X',
    'Open items',
    'Cost per shipment',
  ]
  const days = Array.from({ length: 7 }, (_, i) => `Day_${i + 1}`) // Generate days Day 1 to Day 7

  let data = []

  dcNames.forEach((dcName) => {
    dcTypes.forEach((dcType) => {
      locations.forEach((location) => {
        measures.forEach((measure) => {
          let dailyValues = {}
          days.forEach((day) => {
            // Generating random values for each measure, adapting logic to the daily context
            if (measure === 'On time delivery' || measure === 'Lead time') {
              dailyValues[day] = (Math.random() * 10).toFixed(2) // Units are in days or percentage
            } else if (measure === 'Cost per shipment') {
              dailyValues[day] = (Math.random() * 200 + 100).toFixed(2) // Cost in USD
            } else {
              dailyValues[day] = Math.floor(Math.random() * 1000) + 100 // Volumes, counts
            }
          })

          const dataPoint = {
            dcName,
            dcType,
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
