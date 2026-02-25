function generateData() {
  const items = ['SKU-1234', 'SKU-5678', 'SKU-9012', 'SKU-3456', 'SKU-7890'];
  const customers = ['Customer A', 'Customer B'];
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
    'Boston'
  ];
  const measures = [
    'Opening On Hand Inventory (Units)',
    'Inbound Flow (Units)',
    'Outbound Flow (Units)',
    'Closing On Hand Inventory (Units)'
  ];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep'
  ];

  let data = [];

  items.forEach((item) => {
    customers.forEach((customer) => {
      sites.forEach((site) => {
        measures.forEach((measure) => {
          const dataPoint = {
            customer,
            site,
            item,
            measure
          };

          months.forEach((month) => {
            const openingInventory = Math.floor(Math.random() * 1000) + 100;
            const inboundFlow = Math.floor(Math.random() * 500) + 50;
            const outboundFlow = Math.floor(Math.random() * 500) + 30;
            const closingInventory =
              openingInventory + inboundFlow - outboundFlow;

            dataPoint[`2024-${month}`] = {
              'Opening On Hand Inventory (Units)': openingInventory,
              'Inbound Flow (Units)': inboundFlow,
              'Outbound Flow (Units)': outboundFlow,
              'Closing On Hand Inventory (Units)': closingInventory
            }[measure];
          });

          data.push(dataPoint);
        });
      });
    });
  });

  return data;
}

export const generatedInventoryData = generateData();
// console.log(JSON.stringify(generatedInventoryData, null, 2))
