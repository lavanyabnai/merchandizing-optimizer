import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiAreaChart from  '~/kendo/charts/area/WrapperAreaChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'

import {pastCategories_m,pastSeries_m, trendCategories_m,trendSeries_m,overCategories_m,overSeries_m,amountCategories_m,amountSeries_m} from '~/kendo/rawData/analysis/performanceAnalysis'


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
    Name: '% Fulfilled Past Expected Date,Fulfilled Requistion Lines by Date(Month)',
    container: <WrapperMultiColumnChart category={pastCategories_m} series={pastSeries_m}/>,
  },
  {
    Name: 'PO Amendement Trend by Category',
    container: <WrapperMultiStackColChart category={trendCategories_m} series={trendSeries_m}/> ,
    
  },
  {
    Name: 'Over Receipt % by Date(Month)',
    container: <WrapperMultiAreaChart  category={overCategories_m} series={overSeries_m}/>, 
  },
  
  {
    Name:'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={amountCategories_m} series={amountSeries_m}/>,
  },
]

export const kpiService_q = [
  {
    Name: '% Fulfilled Past Expected Date,Fulfilled Requistion Lines by Date(Month)',
    container: <WrapperMultiColumnChart category={pastCategories_m} series={pastSeries_m}/>,
  },
  {
    Name: 'PO Amendement Trend by Category',
    container: <WrapperMultiStackColChart category={trendCategories_m} series={trendSeries_m}/> ,
    
  },
  {
    Name: 'Over Receipt % by Date(Month)',
    container: <WrapperMultiAreaChart  category={overCategories_m} series={overSeries_m}/>, 
  },
  
  {
    Name:'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={amountCategories_m} series={amountSeries_m}/>,
  },
]

export const kpiService_y = [
  {
    Name: '% Fulfilled Past Expected Date,Fulfilled Requistion Lines by Date(Month)',
    container: <WrapperMultiColumnChart category={pastCategories_m} series={pastSeries_m}/>,
  },
  {
    Name: 'PO Amendement Trend by Category',
    container: <WrapperMultiStackColChart category={trendCategories_m} series={trendSeries_m}/> ,
    
  },
  {
    Name: 'Over Receipt % by Date(Month)',
    container: <WrapperMultiAreaChart  category={overCategories_m} series={overSeries_m}/>, 
  },
  
  {
    Name:'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={amountCategories_m} series={amountSeries_m}/>,
  },
]

export const kpiCost_m = [
  {
    Name: '% Fulfilled Past Expected Date,Fulfilled Requistion Lines by Date(Month)',
    container: <WrapperMultiColumnChart category={pastCategories_m} series={pastSeries_m}/>,
  },
  {
    Name: 'PO Amendement Trend by Category',
    container: <WrapperMultiStackColChart category={trendCategories_m} series={trendSeries_m}/> ,
    
  },
  {
    Name: 'Over Receipt % by Date(Month)',
    container: <WrapperMultiAreaChart  category={overCategories_m} series={overSeries_m}/>, 
  },
  
  {
    Name:'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={amountCategories_m} series={amountSeries_m}/>,
  },
]

export const kpiCost_q = [
  {
    Name: '% Fulfilled Past Expected Date,Fulfilled Requistion Lines by Date(Month)',
    container: <WrapperMultiColumnChart category={pastCategories_m} series={pastSeries_m}/>,
  },
  {
    Name: 'PO Amendement Trend by Category',
    container: <WrapperMultiStackColChart category={trendCategories_m} series={trendSeries_m}/> ,
    
  },
  {
    Name: 'Over Receipt % by Date(Month)',
    container: <WrapperMultiAreaChart  category={overCategories_m} series={overSeries_m}/>, 
  },
  
  {
    Name:'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={amountCategories_m} series={amountSeries_m}/>,
  },
]

export const kpiCost_y = [
  {
    Name:'% Fulfilled Past Expected Date,Fulfilled Requistion Lines by Date (Month)',
    container: <WrapperMultiColumnChart category={pastCategories_m} series={pastSeries_m}/>,
  },
  {
    Name:'PO Amendement Trend by Category',
    container: <WrapperMultiStackColChart category={trendCategories_m} series={trendSeries_m}/> ,
    
  },
  {
    Name: 'Over Receipt % by Date(Month)',
    container: <WrapperMultiAreaChart  category={overCategories_m} series={overSeries_m}/>, 
  },
  
  {
    Name:'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={amountCategories_m} series={amountSeries_m}/>,
  },
]
