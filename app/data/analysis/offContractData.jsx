import WrapperDonutChart from '~/kendo/charts/donut/WrapperDonutChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {offcontractsupplierCategories_m,offcontractsupplierSeries_m,offcontractCategories_m,offcontractSeries_m,typeCategoryData,geoCategoryData} from '~/kendo/rawData/analysis/offContractAnalysis'


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
    Name:'Supplier Count,Off-Contract by Category',
    container: <WrapperWaterfallChart data={typeCategoryData} />,
  },
  {
    Name: 'Off-Contract by Category,Supplier',
    container: <WrapperMultiStackColChart category={offcontractsupplierCategories_m} series={offcontractsupplierSeries_m} />,

  },
  {
    Name: 'Off-Contract by Category',
    container: <WrapperMultiStackColChart category={offcontractCategories_m} series={offcontractSeries_m} />,
    
  },
  {
    Name:'Off-Contract by Geography',
    container: <WrapperWaterfallChart series={geoCategoryData} />,
  },
]

export const kpiService_q = [
  {
    Name:'Supplier Count,Off-Contract by Category',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
  {
    Name: 'Off-Contract by Category,Supplier',
    container: <WrapperMultiStackColChart category={offcontractsupplierCategories_m} series={offcontractsupplierSeries_m} />,

  },
  {
    Name: 'Off-Contract by Category',
    container: <WrapperMultiStackColChart category={offcontractCategories_m} series={offcontractSeries_m} />,
    
  },
  {
    Name:'Off-Contract by Geography',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
]

export const kpiService_y = [
  {
    Name:'Supplier Count,Off-Contract by Category',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
  {
    Name: 'Off-Contract by Category,Supplier',
    container: <WrapperMultiStackColChart category={offcontractsupplierCategories_m} series={offcontractsupplierSeries_m} />,

  },
  {
    Name: 'Off-Contract by Category',
    container: <WrapperMultiStackColChart category={offcontractCategories_m} series={offcontractSeries_m} />,
    
  },
  {
    Name:'Off-Contract by Geography',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
]

export const kpiCost_m = [
  {
    Name:'Supplier Count,Off-Contract by Category',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
  {
    Name: 'Off-Contract by Category,Supplier',
    container: <WrapperMultiStackColChart category={offcontractsupplierCategories_m} series={offcontractsupplierSeries_m} />,

  },
  {
    Name: 'Off-Contract by Category',
    container: <WrapperMultiStackColChart category={offcontractCategories_m} series={offcontractSeries_m} />,
    
  },
  {
    Name:'Off-Contract by Geography',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },

]

export const kpiCost_q = [
  {
    Name:'Supplier Count,Off-Contract by Category',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
  {
    Name: 'Off-Contract by Category,Supplier',
    container: <WrapperMultiStackColChart category={offcontractsupplierCategories_m} series={offcontractsupplierSeries_m} />,

  },
  {
    Name: 'Off-Contract by Category',
    container: <WrapperMultiStackColChart category={offcontractCategories_m} series={offcontractSeries_m} />,
    
  },
  {
    Name:'Off-Contract by Geography',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
]

export const kpiCost_y = [
  {
    Name:'Supplier Count,Off-Contract by Category',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
  {
    Name: 'Off-Contract by Category,Supplier',
    container: <WrapperMultiStackColChart category={offcontractsupplierCategories_m} series={offcontractsupplierSeries_m} />,

  },
  {
    Name: 'Off-Contract by Category',
    container: <WrapperMultiStackColChart category={offcontractCategories_m} series={offcontractSeries_m} />,
    
  },
  {
    Name:'Off-Contract by Geography',
    container: <WrapperDonutChart series={typeCategoryData} />,
  },
]
