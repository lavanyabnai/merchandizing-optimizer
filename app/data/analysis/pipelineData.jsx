import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperFunnelChart from '~/kendo/charts/funnel/WrapperFunnelChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'


import {TrendCategories_m,
  TrendSeries_m,
  revenueSeries_m,
  topCategories_m,
  topSeries_m,
  dealSeries_m
  } from '~/kendo/rawData/analysis/pipelineAnalysis'


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
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={TrendCategories_m} series={TrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperFunnelChart  series={revenueSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperWaterfallChart data={dealSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={TrendCategories_m} series={TrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperFunnelChart  series={revenueSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={dealSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={TrendCategories_m} series={TrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperFunnelChart  series={revenueSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={dealSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={TrendCategories_m} series={TrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperFunnelChart  series={revenueSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={dealSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={TrendCategories_m} series={TrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperFunnelChart  series={revenueSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={dealSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={TrendCategories_m} series={TrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperFunnelChart  series={revenueSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={dealSeries_m} />,
  },
]
