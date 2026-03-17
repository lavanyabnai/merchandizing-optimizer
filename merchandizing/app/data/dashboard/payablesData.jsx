import WrapperGrid from '~/kendo/grid/WrapperGrid'
import {carData} from "~/data/dashboard/carData.js";

import WrapperMultiLineChart from '~/kendo/charts/line/WrapperLineChart';
import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart';
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart';


import {invCategories_m,
  invSeries_m,
  outCategories_m,
  outSeries_m,
  overCategories_m,
  overSeries_m,
  dueCategories_m,
  dueSeries_m,
  payCategories_m,
  paySeries_m,
  avgCategories_m,
  avgSeries_m,
  ontimeCategories_m,
  ontimeSeries_m,assCategories_m,
  assSeries_m} from '~/kendo/rawData/dashboard/payablesDashboard'


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
    Name: 'AP Invoices Processed',
    Value: '$2.16M',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiStackColChart category={invCategories_m} series={invSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Outstanding',
    Value: '$404.44M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={outCategories_m} series={outSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Overdue',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={overCategories_m} series={overSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'AP Due in 30 Days',
    Value: '0.01',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperMultiColumnChart category={dueCategories_m} series={dueSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Payments Processed',
    Value: '$11.70M',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Average Payment Days',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiLineChart category={avgCategories_m} series={avgSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Ontime Payment Performance',
    Value: '0.10',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiLineChart category={ontimeCategories_m} series={ontimeSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Return on Assets %',
    Value: '0.07',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiColumnChart category={assCategories_m} series={assSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiService_q = [
  {
    Name: 'AP Invoices Processed',
    Value: '$2.16M',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiStackColChart category={invCategories_m} series={invSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Outstanding',
    Value: '$404.44M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiStackColChart category={outCategories_m} series={outSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Overdue',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiLineChart category={overCategories_m} series={overSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'AP Due in 30 Days',
    Value: '0.01',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperMultiColumnChart category={dueCategories_m} series={dueSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiService_y = [
  {
    Name: 'AP Invoices Processed',
    Value: '$2.16M',
    Trend: 'up',
    TargetAch: 75,
    container: <WrapperMultiStackColChart category={invCategories_m} series={invSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Outstanding',
    Value: '$404.44M',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiStackColChart category={outCategories_m} series={outSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Overdue',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiLineChart category={overCategories_m} series={overSeries_m}/> ,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name:'AP Due in 30 Days',
    Value: '0.01',
    Trend: 'down',
    TargetAch: 50,
    container: <WrapperMultiColumnChart category={dueCategories_m} series={dueSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_m = [
  {
    Name: 'AP Payments Processed',
    Value: '$11.70M',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Average Payment Days',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiLineChart category={avgCategories_m} series={avgSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Ontime Payment Performance',
    Value: '0.10',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiLineChart category={ontimeCategories_m} series={ontimeSeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Return on Assets %',
    Value: '0.07',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiColumnChart category={assCategories_m} series={assSeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_q = [
  {
    Name: 'AP Payments Processed',
    Value: '$11.70M',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiLineChart category={payCategories_m} series={paySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Average Payment Days',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={avgCategories_m} series={avgSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Ontime Payment Performance',
    Value: '0.10',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Return on Assets %',
    Value: '0.07',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]

export const kpiCost_y = [
  {
    Name: 'AP Payments Processed',
    Value: '$11.70M',
    Trend: 'up',
    TargetAch: 90,
    container:<WrapperMultiLineChart category={payCategories_m} series={paySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'AP Average Payment Days',
    Value: '0.00',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={avgCategories_m} series={avgSeries_m}/>,
    status: "Below Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Ontime Payment Performance',
    Value: '0.10',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "On Track",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  },
  {
    Name: 'Return on Assets %',
    Value: '0.07',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiColumnChart category={payCategories_m} series={paySeries_m}/>,
    status: "Above Target",
    Explore:<WrapperGrid rowData={carData}/>,
    Analyze:"demandAnalysis"
  }
]