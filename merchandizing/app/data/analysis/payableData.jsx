import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import {dueAgingCategories_m,
  dueAgingSeries_m,
  overdueCategories_m,
  overdueSeries_m,
  highestCategories_m,
  highestSeries_m,
  longestCategories_m,
  longestSeries_m} from '~/kendo/rawData/analysis/payableAnalysis'


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
    Name: 'Due Aging',
    container: <WrapperMultiColumnChart category={dueAgingCategories_m} series={dueAgingSeries_m}/>,
  },
  {
    Name: 'Suppliers with Highest Overdue Amount and # of Invoice?',
    container: <WrapperMultiBarChart category={highestCategories_m} series={highestSeries_m}/> ,
    
  },
  {
    Name: 'Overdue Aging',
    container: <WrapperMultiColumnChart category={overdueCategories_m} series={overdueSeries_m}/>, 
  },
  
  {
    Name:'Suppliers with Longest Overdue?',
    container: <WrapperMultiBarChart category={longestCategories_m} series={longestSeries_m}/>,
  },
]

export const kpiService_q = [
  {
    Name: 'Due Aging',
    container: <WrapperMultiColumnChart category={dueAgingCategories_m} series={dueAgingSeries_m}/>,
  },
  {
    Name: 'Overdue Aging',
    container: <WrapperMultiColumnChart category={overdueCategories_m} series={overdueSeries_m}/>, 

  },
  {
    Name: 'Suppliers with Highest Overdue Amount and # of Invoice?',
    container: <WrapperMultiBarChart category={highestCategories_m} series={highestSeries_m}/> ,
    
  },
  {
    Name:'Suppliers with Longest Overdue?',
    container: <WrapperMultiBarChart category={longestCategories_m} series={longestSeries_m}/>,
  },
]

export const kpiService_y = [
  {
    Name: 'Due Aging',
    container: <WrapperMultiColumnChart category={dueAgingCategories_m} series={dueAgingSeries_m}/>,
  },
  {
    Name: 'Overdue Aging',
    container: <WrapperMultiColumnChart category={overdueCategories_m} series={overdueSeries_m}/>, 

  },
  {
    Name: 'Suppliers with Highest Overdue Amount and # of Invoice?',
    container: <WrapperMultiBarChart category={highestCategories_m} series={highestSeries_m}/> ,
    
  },
  {
    Name:'Suppliers with Longest Overdue?',
    container: <WrapperMultiBarChart category={longestCategories_m} series={longestSeries_m}/>,
  },
]

export const kpiCost_m = [
  {
    Name: 'Due Aging',
    container: <WrapperMultiColumnChart category={dueAgingCategories_m} series={dueAgingSeries_m}/>,
  },
  {
    Name: 'Overdue Aging',
    container: <WrapperMultiColumnChart category={overdueCategories_m} series={overdueSeries_m}/>, 

  },
  {
    Name: 'Suppliers with Highest Overdue Amount and # of Invoice?',
    container: <WrapperMultiBarChart category={highestCategories_m} series={highestSeries_m}/> ,
    
  },
  {
    Name:'Suppliers with Longest Overdue?',
    container: <WrapperMultiBarChart category={longestCategories_m} series={longestSeries_m}/>,
  },
]

export const kpiCost_q = [
  {
    Name: 'Due Aging',
    container: <WrapperMultiColumnChart category={dueAgingCategories_m} series={dueAgingSeries_m}/>,
  },
  {
    Name: 'Overdue Aging',
    container: <WrapperMultiColumnChart category={overdueCategories_m} series={overdueSeries_m}/>, 

  },
  {
    Name: 'Suppliers with Highest Overdue Amount and # of Invoice?',
    container: <WrapperMultiBarChart category={highestCategories_m} series={highestSeries_m}/> ,
    
  },
  {
    Name:'Suppliers with Longest Overdue?',
    container: <WrapperMultiBarChart category={longestCategories_m} series={longestSeries_m}/>,
  },
]

export const kpiCost_y = [
  {
    Name: 'Due Aging',
    container: <WrapperMultiColumnChart category={dueAgingCategories_m} series={dueAgingSeries_m}/>,
  },
  {
    Name: 'Overdue Aging',
    container: <WrapperMultiColumnChart category={overdueCategories_m} series={overdueSeries_m}/>, 

  },
  {
    Name: 'Suppliers with Highest Overdue Amount and # of Invoice?',
    container: <WrapperMultiBarChart category={highestCategories_m} series={highestSeries_m}/> ,
    
  },
  {
    Name:'Suppliers with Longest Overdue?',
    container: <WrapperMultiBarChart category={longestCategories_m} series={longestSeries_m}/>,
  },
]
