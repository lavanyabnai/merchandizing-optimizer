import WrapperGrid from '~/kendo/grid/WrapperGrid'
import {carData} from "~/data/dashboard/carData.js";

import WrapperMultiAreaChart from '~/kendo/charts/area/WrapperAreaChart';
import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart';
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'

import {receCategories_m,
  receSeries_m,
  payCategories_m,
  paySeries_m,
  capCategories_m,
  capSeries_m,
  totalSeries_m,inventoryCategories_m,
  inventorySeries_m,
  netSeries_m,
  dayCategories_m,
  daySeries_m,
  liaCategories_m,
  liaSeries_m} from '~/kendo/rawData/dashboard/balanceDashboard'

export const reviewTabs = [
  { name: 'Month', href: '#', current: true },
  { name: 'Quarter', href: '#', current: false },
  { name: 'Year', href: '#', current: false },
]

export const meetingTabs = [
  { name: 'Daily', href: '#', current: true },
  { name: 'Weekly', href: '#', current: false },
  
]

export const kpiService_m = [
  {
    Name: 'Receivables',
    Value: '-$3.87B',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiColumnChart category={receCategories_m} series={receSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Payables',
    Value: '$1.47M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'CapEx',
    Value: '$0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiAreaChart category={capCategories_m} series={capSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'Total Cash',
    Value: '$254.47k',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperWaterfallChart data={totalSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Inventory',
    Value: '$1.98B',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiColumnChart category={inventoryCategories_m} series={inventorySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Net Working Capital',
    Value: '$3.62B',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Cash in Hand',
    Value: '1.06M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={dayCategories_m} series={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Total Liabilites',
    Value: '$26.47B',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiStackColChart category={liaCategories_m} series={liaSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiService_q = [
  {
    Name: 'Receivables',
    Value: '-$3.87B',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiColumnChart category={receCategories_m} series={receSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Payables',
    Value: '$1.47M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'CapEx',
    Value: '$0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiAreaChart category={capCategories_m} series={capSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'Total Cash',
    Value: '$254.47k',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperWaterfallChart series={totalSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
]

export const kpiService_y = [
  {
    Name: 'Receivables',
    Value: '-$3.87B',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiColumnChart category={receCategories_m} series={receSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Payables',
    Value: '$1.47M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'CapEx',
    Value: '$0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiAreaChart category={capCategories_m} series={capSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'Total Cash',
    Value: '$254.47k',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperWaterfallChart series={totalSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
]

export const kpiCost_m = [
  {
    Name: 'Inventory',
    Value: '$1.98B',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiColumnChart category={inventoryCategories_m} series={inventorySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Net Working Capital',
    Value: '$3.62B',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Cash in Hand',
    Value: '1.06M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={dayCategories_m} series={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Total Liabilites',
    Value: '$26.47B',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiStackColChart category={liaCategories_m} series={liaSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_q = [
  {
    Name: 'Inventory',
    Value: '$1.98B',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiColumnChart category={inventoryCategories_m} series={inventorySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Net Working Capital',
    Value: '$3.62B',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Cash in Hand',
    Value: '1.06M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={dayCategories_m} series={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Total Liabilites',
    Value: '$26.47B',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiStackColChart category={liaCategories_m} series={liaSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_y = [
  {
    Name: 'Inventory',
    Value: '$1.98B',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiColumnChart category={inventoryCategories_m} series={inventorySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Net Working Capital',
    Value: '$3.62B',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Cash in Hand',
    Value: '1.06M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={dayCategories_m} series={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Total Liabilites',
    Value: '$26.47B',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiStackColChart category={liaCategories_m} series={liaSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]