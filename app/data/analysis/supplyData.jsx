import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'
import {onTimeCategories_m,onTimeSeries_m,rejectCategories_m,rejectSeries_m,tierSupplierData,topSuppliersData} from '~/kendo/rawData/analysis/supplyAnalysis'


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
    Name: '% on time delivery, % rejects by month for top 10 critical project',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m}/>,
  },
  {
    Name: 'Reject Count be Reject Reason & Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={rejectCategories_m} series={rejectSeries_m} />, 

  },
  {
    Name: 'Top 10 Suppliers - OnTime Delivery',
    container: <WrapperWaterfallChart data={topSuppliersData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperWaterfallChart data={tierSupplierData} />,
  },
]

export const kpiService_q = [
  {
    Name: '% on time delivery, % rejects by month for top 10 critical project',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m}/>,
  },
  {
    Name: 'Reject Count be Reject Reason & Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={rejectCategories_m} series={rejectSeries_m} />, 

  },
  {
    Name: 'Top 10 Suppliers - OnTime Delivery',
    container: <WrapperPieChart series={topSuppliersData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={tierSupplierData} />,
  },
]

export const kpiService_y = [
  {
    Name: '% on time delivery, % rejects by month for top 10 critical project',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m}/>,
  },
  {
    Name: 'Reject Count be Reject Reason & Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={rejectCategories_m} series={rejectSeries_m} />, 

  },
  {
    Name: 'Top 10 Suppliers - OnTime Delivery',
    container: <WrapperPieChart series={topSuppliersData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={tierSupplierData} />,
  },
]

export const kpiCost_m = [
  {
    Name: '% on time delivery, % rejects by month for top 10 critical project',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m}/>,
  },
  {
    Name: 'Reject Count be Reject Reason & Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={rejectCategories_m} series={rejectSeries_m} />, 

  },
  {
    Name: 'Top 10 Suppliers - OnTime Delivery',
    container: <WrapperPieChart series={topSuppliersData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={tierSupplierData} />,
  },
]

export const kpiCost_q = [
  {
    Name: '% on time delivery, % rejects by month for top 10 critical project',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m}/>,
  },
  {
    Name: 'Reject Count be Reject Reason & Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={rejectCategories_m} series={rejectSeries_m} />, 

  },
  {
    Name: 'Top 10 Suppliers - OnTime Delivery',
    container: <WrapperPieChart series={topSuppliersData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={tierSupplierData} />,
  },
]

export const kpiCost_y = [
  {
    Name: '% on time delivery, % rejects by month for top 10 critical project',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m}/>,
  },
  {
    Name: 'Reject Count be Reject Reason & Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={rejectCategories_m} series={rejectSeries_m} />, 

  },
  {
    Name: 'Top 10 Suppliers - OnTime Delivery',
    container: <WrapperPieChart series={topSuppliersData} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperPieChart series={tierSupplierData} />,
  },
]
