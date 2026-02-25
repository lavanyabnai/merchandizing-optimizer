import WrapperMultiColumnChart from '@/app/kendo/charts/column/WrapperColumnChart'
import WrapperPieChart from  '@/app/kendo/charts/pie/WrapperPieChart'
import WrapperDonutChart from '@/app/kendo/charts/donut/WrapperDonutChart'
import WrapperMultiStackColChart from '@/app/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '@/app/kendo/charts/waterfall/WrapperWaterfallChart'

import {
  leakageTrendCategories_m,
  leakageTrendSeries_m,
  amountCategories_m,
  amountSeries_m,
  typeCategoryData,
  supplierCategoryData
} from '@/app/kendo/rawData/analysis/agreementAnalysis';


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
    container: <WrapperMultiStackColChart category={leakageTrendCategories_m} series={leakageTrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperWaterfallChart data={typeCategoryData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperWaterfallChart data={supplierCategoryData} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={leakageTrendCategories_m} series={leakageTrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperDonutChart series={typeCategoryData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={typeCategoryData} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={leakageTrendCategories_m} series={leakageTrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperDonutChart series={typeCategoryData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={typeCategoryData} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={leakageTrendCategories_m} series={leakageTrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperDonutChart series={typeCategoryData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={typeCategoryData} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={leakageTrendCategories_m} series={leakageTrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperDonutChart series={typeCategoryData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={typeCategoryData} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Agreement Leakage Trend by Category',
    container: <WrapperMultiStackColChart category={leakageTrendCategories_m} series={leakageTrendSeries_m} />,
  },
  {
    Name: 'Agreement Amount/Utilization for Items & Supplier',
    container: <WrapperMultiColumnChart category={amountCategories_m} series={amountSeries_m} />, 

  },
  {
    Name: 'Agreement Amount by Agreement Type',
    container: <WrapperDonutChart series={typeCategoryData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={typeCategoryData} />,
  },
]
