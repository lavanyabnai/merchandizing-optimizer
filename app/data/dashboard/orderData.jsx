import WrapperGrid from '~/kendo/grid/WrapperGrid'
import {carData} from "~/data/dashboard/carData.js";
import WrapperMultiAreaChart from '~/kendo/charts/area/WrapperAreaChart';
import WrapperMultiLineChart from '~/kendo/charts/line/WrapperLineChart';
import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart';
import WrapperPieChart from '~/kendo/charts/pie/WrapperPieChart';
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart';

import {bookCategories_m,
  bookSeries_m,amountCategories_m,
  amountSeries_m,
  fulfilledCategories_m,
  fulfilledSeries_m,
  ontimeCategories_m,
  ontimeSeries_m,
  perfectCategories_m,
  perfectSeries_m,
  daySeries_m,
  agingCategories_m,
  marginCategories_m,
  marginSeries_m} from '~/kendo/rawData/dashboard/orderDashboard'

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
    Name: 'Orders Booked',
    Value: '1,619',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiColumnChart category={bookCategories_m} series={bookSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Orders Amount',
    Value: '$56.84M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Orders Fulfilled',
    Value: '322',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={fulfilledCategories_m} series={fulfilledSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'On Time Shipment %',
    Value: '77%',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Perfect Orders',
    Value: '84%',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiAreaChart category={perfectCategories_m} series={perfectSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Sales Outstanding',
    Value: '1.93K',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AR Aging',
    Value: '$1.28B',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperPieChart series={agingCategories_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Operating Margin %',
    Value: '13.8%',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={marginCategories_m} series={marginSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiService_q = [
  {
    Name: 'Orders Booked',
    Value: '1,619',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiColumnChart category={bookCategories_m} series={bookSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Orders Amount',
    Value: '$56.84M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Orders Fulfilled',
    Value: '322',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={fulfilledCategories_m} series={fulfilledSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'On Time Shipment %',
    Value: '77%',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Perfect Orders',
    Value: '84%',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiAreaChart category={perfectCategories_m} series={perfectSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Sales Outstanding',
    Value: '1.93K',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AR Aging',
    Value: '$1.28B',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperPieChart series={agingCategories_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Operating Margin %',
    Value: '13.8%',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={marginCategories_m} series={marginSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiService_y = [
  {
    Name: 'Orders Booked',
    Value: '1,619',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiColumnChart category={bookCategories_m} series={bookSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Orders Amount',
    Value: '$56.84M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Orders Fulfilled',
    Value: '322',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={fulfilledCategories_m} series={fulfilledSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'On Time Shipment %',
    Value: '77%',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Perfect Orders',
    Value: '84%',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiAreaChart category={perfectCategories_m} series={perfectSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Sales Outstanding',
    Value: '1.93K',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AR Aging',
    Value: '$1.28B',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperPieChart series={agingCategories_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Operating Margin %',
    Value: '13.8%',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={marginCategories_m} series={marginSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_m = [
  {
    Name: 'Perfect Orders',
    Value: '84%',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiAreaChart category={perfectCategories_m} series={perfectSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Sales Outstanding',
    Value: '1.93K',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AR Aging',
    Value: '$1.28B',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperPieChart series={agingCategories_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Operating Margin %',
    Value: '13.8%',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={marginCategories_m} series={marginSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
];

export const kpiCost_q = [
  {
    Name: 'Perfect Orders',
    Value: '84%',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiAreaChart category={perfectCategories_m} series={perfectSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Sales Outstanding',
    Value: '1.93K',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AR Aging',
    Value: '$1.28B',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperPieChart series={agingCategories_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Operating Margin %',
    Value: '13.8%',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={marginCategories_m} series={marginSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_y = [
  {
    Name: 'Perfect Orders',
    Value: '84%',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiAreaChart category={perfectCategories_m} series={perfectSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Days Sales Outstanding',
    Value: '1.93K',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperWaterfallChart data={daySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AR Aging',
    Value: '$1.28B',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperPieChart series={agingCategories_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Operating Margin %',
    Value: '13.8%',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={marginCategories_m} series={marginSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]