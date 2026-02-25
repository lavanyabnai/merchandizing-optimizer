function generateData() {
  const items = ['SKU-1234', 'SKU-5678', 'SKU-9012', 'SKU-3456', 'SKU-7890']
  const customers = ['Customer A', 'Customer B']
  const sites = [
    'New York',
    'California',
    'Atlanta',
    'Chicago',
    'Dallas',
    'Miami',
    'Seattle',
    'Los Angeles',
    'San Francisco',
    'Boston',
  ]
  const measures = ['Consensus Forecast (Units)', 'Total Sales (Units)'] // Relevant forecast metrics
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

  let data = []

  items.forEach((item) => {
    customers.forEach((customer) => {
      sites.forEach((site) => {
        let baseValues = {}
        measures.forEach((measure) => {
          let monthlyValues = {}
          months.forEach((month) => {
            monthlyValues[`2024-${month}`] =
              Math.floor(Math.random() * 10000) + 5000 // Base value for each month
          })
          baseValues[measure] = monthlyValues

          const dataPoint = {
            customer,
            site,
            item,
            measure,
            ...monthlyValues,
          }

          if (measure === 'Total Sales (Units)') {
            months.forEach((month) => {
              dataPoint[`2024-${month}`] *= 1 + Math.random() * 0.05
              dataPoint[`2024-${month}`] = Math.round(
                dataPoint[`2024-${month}`]
              )
            })
          }

          data.push(dataPoint)
        })

        // Calculate MAPE for each month
        const MAPEDataPoint = {
          customer,
          site,
          item,
          measure: 'MAPE',
        }

        months.forEach((month) => {
          const forecast =
            baseValues['Consensus Forecast (Units)'][`2024-${month}`]
          const actual = baseValues['Total Sales (Units)'][`2024-${month}`]
          const error = Math.abs(forecast - actual)
          MAPEDataPoint[`2024-${month}`] = ((error / actual) * 100).toFixed(2)
        })

        data.push(MAPEDataPoint)

        // Calculate Absolute Error for each month
        const AbsoluteErrorDataPoint = {
          customer,
          site,
          item,
          measure: 'Absolute Error',
        }

        months.forEach((month) => {
          const forecast =
            baseValues['Consensus Forecast (Units)'][`2024-${month}`]
          const actual = baseValues['Total Sales (Units)'][`2024-${month}`]
          AbsoluteErrorDataPoint[`2024-${month}`] = Math.abs(forecast - actual)
        })

        data.push(AbsoluteErrorDataPoint)
      })
    })
  })

  return data
}

export const generatedAccuracyData = generateData()
console.log(JSON.stringify(generatedAccuracyData, null, 2))
