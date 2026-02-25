import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperDonutChart from '~/kendo/charts/donut/WrapperDonutChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'

import {poOpenData,topSupplierCategories_m,topSupplierSeries_m,cycleTrendCategories_m,cycleTrendSeries_m,cycleTimeCategories_m,cycleTimeSeries_m} from '~/kendo/rawData/analysis/proEfficencyAnalysis'


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
    Name: 'PO Open Cycle Time by # of Tier-1 Suppliers',
    container: <WrapperDonutChart series={poOpenData} />,
  },
  {
    Name: 'Procurement Cycle Time Trend',
    container: <WrapperMultiBarChart category={topSupplierCategories_m} series={topSupplierSeries_m} />, 

  },
  {
    Name: 'Top Suppliers with Amendments',
    container: <WrapperMultiStackColChart category={cycleTrendCategories_m} series={cycleTrendSeries_m} /> ,
    
  },
  {
    Name:'Cycle Time by Category',
    container: <WrapperMultiColumnChart  category={cycleTimeCategories_m} series={cycleTimeSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'PO Open Cycle Time by # of Tier-1 Suppliers',
    container: <WrapperDonutChart series={poOpenData} />,
  },
  {
    Name: 'Procurement Cycle Time Trend',
    container: <WrapperMultiBarChart category={topSupplierCategories_m} series={topSupplierSeries_m} />, 

  },
  {
    Name: 'Top Suppliers with Amendments',
    container: <WrapperMultiStackColChart category={cycleTrendCategories_m} series={cycleTrendSeries_m} /> ,
    
  },
  {
    Name:'Cycle Time by Category',
    container: <WrapperMultiColumnChart  category={cycleTimeCategories_m} series={cycleTimeSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'PO Open Cycle Time by # of Tier-1 Suppliers',
    container: <WrapperDonutChart series={poOpenData} />,
  },
  {
    Name: 'Procurement Cycle Time Trend',
    container: <WrapperMultiBarChart category={topSupplierCategories_m} series={topSupplierSeries_m} />, 

  },
  {
    Name: 'Top Suppliers with Amendments',
    container: <WrapperMultiStackColChart category={cycleTrendCategories_m} series={cycleTrendSeries_m} /> ,
    
  },
  {
    Name:'Cycle Time by Category',
    container: <WrapperMultiColumnChart  category={cycleTimeCategories_m} series={cycleTimeSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'PO Open Cycle Time by # of Tier-1 Suppliers',
    container: <WrapperDonutChart series={poOpenData} />,
  },
  {
    Name: 'Procurement Cycle Time Trend',
    container: <WrapperMultiBarChart category={topSupplierCategories_m} series={topSupplierSeries_m} />, 

  },
  {
    Name: 'Top Suppliers with Amendments',
    container: <WrapperMultiStackColChart category={cycleTrendCategories_m} series={cycleTrendSeries_m} /> ,
    
  },
  {
    Name:'Cycle Time by Category',
    container: <WrapperMultiColumnChart  category={cycleTimeCategories_m} series={cycleTimeSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'PO Open Cycle Time by # of Tier-1 Suppliers',
    container: <WrapperDonutChart series={poOpenData} />,
  },
  {
    Name: 'Procurement Cycle Time Trend',
    container: <WrapperMultiBarChart category={topSupplierCategories_m} series={topSupplierSeries_m} />, 

  },
  {
    Name: 'Top Suppliers with Amendments',
    container: <WrapperMultiStackColChart category={cycleTrendCategories_m} series={cycleTrendSeries_m} /> ,
    
  },
  {
    Name:'Cycle Time by Category',
    container: <WrapperMultiColumnChart  category={cycleTimeCategories_m} series={cycleTimeSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'PO Open Cycle Time by # of Tier-1 Suppliers',
    container: <WrapperDonutChart series={poOpenData} />,
  },
  {
    Name: 'Procurement Cycle Time Trend',
    container:<WrapperMultiStackColChart category={cycleTrendCategories_m} series={cycleTrendSeries_m}/>

  },
  {
    Name: 'Top Suppliers with Amendments',
    container: <WrapperMultiBarChart category={topSupplierCategories_m} series={topSupplierSeries_m} />
    
  },
  {
    Name:'Cycle Time by Category',
    container: <WrapperMultiColumnChart  category={cycleTimeCategories_m} series={cycleTimeSeries_m} />,
  },
]
