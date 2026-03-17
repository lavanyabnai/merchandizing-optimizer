import WrapperWaterfallChart from "@/app/kendo/charts/waterfall/WrapperWaterfallChart";
 
export const tripData = [
  {
    category: 'Region 1',
    field: 107384
  },
  {
    category: 'Region 2',
    field: 21640
  },
  {
    category: 'Region 3',
    field: 16197
  },
  {
    category: 'Others',
    field: 12000
  },
  {
    category: 'Total',
    summary: 'total'
  }
];

export const bikeData = [
  {
    category: 'Region 1',
    field: 64941
  },
  {
    category: 'Region 2',
    field: 21640
  },
  {
    category: 'Region 3',
    field: 16197
  },
  {
    category: 'Others',
    field: 10000
  },
  {
    category: 'Total',
    summary: 'total'
  }
];
 export const stats = [
   { name: 'BL3: Optimal', stat: '112,778' },
   { name: 'Current on Hand Inventory', value: '157,221' },
   { name: 'Current on Hand Inventory', value: '157,221' },
   { name: 'Current on Hand Inventory', value: '157,221' },
   { name: 'Current on Hand Inventory', value: '157,221' }
 ];
 
export const reviewTabs = [
  { name: "Month", href: "#", current: true },
  { name: "Quarter", href: "#", current: false },
  { name: "Year", href: "#", current: false },
];

export const meetingTabs = [
  { name: "Daily", href: "#", current: true },
  { name: "Weekly", href: "#", current: false },
];

export const kpiService_m = [
  {
    Name: 'On Hand Inventory for Scenario',
    container: <WrapperWaterfallChart data={bikeData} />,
    stats: stats
  },
  {
    Name: 'Current on Hand Inventory',
    container: <WrapperWaterfallChart data={tripData} />,
    stats: stats
  },
]
