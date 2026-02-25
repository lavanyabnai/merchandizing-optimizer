// eslint-disable-next-line no-unused-vars
function generateInventoryData() {
  const inventoryData = {
    title: 'Inventory Management',
    children: [
      {
        title: 'Inventory Excess (USD)',
        children: [],
      },
      {
        title: 'Deficit Inventory (USD)',
        children: [],
      },
    ],
  }

  // Helper function to generate formatted inventory values and percentages
  function getRandomInventoryValueAndPercent() {
    return {
      value: `${(Math.random() * 2 + 0.1).toFixed(1)}M`, // Random values from 0.1M to 2.0M
      percent: Math.floor(Math.random() * 101), // Random percentage from 0 to 100
    }
  }

  // Generate 15 excess SKUs
  for (let i = 1; i <= 15; i++) {
    const { value, percent } = getRandomInventoryValueAndPercent()
    inventoryData.children[0].children.push({
      title: `SKU-${Math.random().toString().slice(2, 8)}`, // Generates a random SKU number
      location: `Location${String(i).padStart(3, '0')}`, // Pads the location number with leading zeros
      excess: value,
      percent: percent,
    })
  }

  // Generate 15 deficit SKUs
  for (let i = 1; i <= 15; i++) {
    const { value, percent } = getRandomInventoryValueAndPercent()
    inventoryData.children[1].children.push({
      title: `SKU-${Math.random().toString().slice(2, 8)}`, // Generates a random SKU number
      location: `Location${String(i + 15).padStart(3, '0')}`, // Continues location numbering
      deficit: value,
      percent: -percent, // Deficit percentage is negative
    })
  }

  return inventoryData
}
export const generatedInventoryExcess = [
  {
    title: 'Inventory Excess (USD)',
    children: [
      {
        title: 'SKU-840417',
        location: 'Location001',
        excess: '0.7M',
        percent: 50,
      },
      {
        title: 'SKU-575471',
        location: 'Location002',
        excess: '0.2M',
        percent: 51,
      },
      {
        title: 'SKU-980960',
        location: 'Location003',
        excess: '1.2M',
        percent: 81,
      },
      {
        title: 'SKU-859711',
        location: 'Location004',
        excess: '0.3M',
        percent: 25,
      },
      {
        title: 'SKU-983840',
        location: 'Location005',
        excess: '0.8M',
        percent: 29,
      },
      {
        title: 'SKU-802319',
        location: 'Location006',
        excess: '1.7M',
        percent: 8,
      },
      {
        title: 'SKU-642013',
        location: 'Location007',
        excess: '1.3M',
        percent: 98,
      },
      {
        title: 'SKU-844802',
        location: 'Location008',
        excess: '2.0M',
        percent: 2,
      },
      {
        title: 'SKU-668798',
        location: 'Location009',
        excess: '1.7M',
        percent: 80,
      },
      {
        title: 'SKU-215106',
        location: 'Location010',
        excess: '1.9M',
        percent: 47,
      },
      {
        title: 'SKU-658596',
        location: 'Location011',
        excess: '1.1M',
        percent: 12,
      },
      {
        title: 'SKU-973932',
        location: 'Location012',
        excess: '0.3M',
        percent: 80,
      },
      {
        title: 'SKU-774724',
        location: 'Location013',
        excess: '1.3M',
        percent: 9,
      },
      {
        title: 'SKU-005216',
        location: 'Location014',
        excess: '0.9M',
        percent: 45,
      },
      {
        title: 'SKU-224022',
        location: 'Location015',
        excess: '1.9M',
        percent: 23,
      },
    ],
  },
  // {
  //   title: 'Deficit Inventory (USD)',
  //   children: [
  //     {
  //       title: 'SKU-775833',
  //       location: 'Location016',
  //       deficit: '1.9M',
  //       percent: 9,
  //     },
  //     {
  //       title: 'SKU-569018',
  //       location: 'Location017',
  //       deficit: '0.6M',
  //       percent: 20,
  //     },
  //     {
  //       title: 'SKU-166046',
  //       location: 'Location018',
  //       deficit: '1.8M',
  //       percent: 58,
  //     },
  //     {
  //       title: 'SKU-144887',
  //       location: 'Location019',
  //       deficit: '0.4M',
  //       percent: 76,
  //     },
  //     {
  //       title: 'SKU-751012',
  //       location: 'Location020',
  //       deficit: '1.9M',
  //       percent: 80,
  //     },
  //     {
  //       title: 'SKU-072323',
  //       location: 'Location021',
  //       deficit: '1.2M',
  //       percent: 16,
  //     },
  //     {
  //       title: 'SKU-627189',
  //       location: 'Location022',
  //       deficit: '0.8M',
  //       percent: 37,
  //     },
  //     {
  //       title: 'SKU-974831',
  //       location: 'Location023',
  //       deficit: '0.6M',
  //       percent: 83,
  //     },
  //     {
  //       title: 'SKU-076954',
  //       location: 'Location024',
  //       deficit: '0.2M',
  //       percent: 5,
  //     },
  //     {
  //       title: 'SKU-205782',
  //       location: 'Location025',
  //       deficit: '0.6M',
  //       percent: 46,
  //     },
  //     {
  //       title: 'SKU-134279',
  //       location: 'Location026',
  //       deficit: '1.6M',
  //       percent: 73,
  //     },
  //     {
  //       title: 'SKU-714490',
  //       location: 'Location027',
  //       deficit: '1.4M',
  //       percent: 9,
  //     },
  //     {
  //       title: 'SKU-196436',
  //       location: 'Location028',
  //       deficit: '0.6M',
  //       percent: 52,
  //     },
  //     {
  //       title: 'SKU-370001',
  //       location: 'Location029',
  //       deficit: '1.8M',
  //       percent: 9,
  //     },
  //     {
  //       title: 'SKU-389439',
  //       location: 'Location030',
  //       deficit: '0.7M',
  //       percent: 68,
  //     },
  //   ],
  // },
]
export const generatedDeficitData = [
  {
    title: 'Deficit Inventory (USD)',
    children: [
      {
        title: 'SKU-775833',
        location: 'Location016',
        deficit: '1.9M',
        percent: 9,
      },
      {
        title: 'SKU-569018',
        location: 'Location017',
        deficit: '0.6M',
        percent: 20,
      },
      {
        title: 'SKU-166046',
        location: 'Location018',
        deficit: '1.8M',
        percent: 58,
      },
      {
        title: 'SKU-144887',
        location: 'Location019',
        deficit: '0.4M',
        percent: 76,
      },
      {
        title: 'SKU-751012',
        location: 'Location020',
        deficit: '1.9M',
        percent: 80,
      },
      {
        title: 'SKU-072323',
        location: 'Location021',
        deficit: '1.2M',
        percent: 16,
      },
      {
        title: 'SKU-627189',
        location: 'Location022',
        deficit: '0.8M',
        percent: 37,
      },
      {
        title: 'SKU-974831',
        location: 'Location023',
        deficit: '0.6M',
        percent: 83,
      },
      {
        title: 'SKU-076954',
        location: 'Location024',
        deficit: '0.2M',
        percent: 5,
      },
      {
        title: 'SKU-205782',
        location: 'Location025',
        deficit: '0.6M',
        percent: 46,
      },
      {
        title: 'SKU-134279',
        location: 'Location026',
        deficit: '1.6M',
        percent: 73,
      },
      {
        title: 'SKU-714490',
        location: 'Location027',
        deficit: '1.4M',
        percent: 9,
      },
      {
        title: 'SKU-196436',
        location: 'Location028',
        deficit: '0.6M',
        percent: 52,
      },
      {
        title: 'SKU-370001',
        location: 'Location029',
        deficit: '1.8M',
        percent: 9,
      },
      {
        title: 'SKU-389439',
        location: 'Location030',
        deficit: '0.7M',
        percent: 68,
      },
    ],
  },
]
// console.log(JSON.stringify(generatedInventoryData, null, 2))
