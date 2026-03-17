import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {procureAmoCategories_m,procureAmoSeries_m,ontimeCategories_m,ontimeSeries_m,topSupplierData,overdueCategories_m,overdueSeries_m} from '~/kendo/rawData/analysis/procureAnalysis'


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
    Name: 'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={procureAmoCategories_m} series={procureAmoSeries_m} />,
  },
  {
    Name: '% of Ontime delivery and No of Receipts by Tier-1 Supplies',
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top 10 Supplier',
    container: <WrapperWaterfallChart data={topSupplierData} /> ,
    
  },
  {
    Name:'Overdue Aging by Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={overdueCategories_m} series={overdueSeries_m} />,
  },
]

export const kpiService_q = [
 {
  Name: 'PO Amount by Cost Center',
  container: <WrapperMultiBarChart category={procureAmoCategories_m} series={procureAmoSeries_m} />,
},
{
  Name: '% of Ontime delivery and No of Receipts by Tier-1 Supplies',
  container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m} />, 

},
{
  Name: 'Spend Trend by Top 10 Supplier',
  container: <WrapperPieChart series={topSupplierData} /> ,
  
},
{
  Name:'Overdue Aging by Tier-1 Suppliers',
  container: <WrapperMultiStackColChart category={overdueCategories_m} series={overdueSeries_m} />,
},
]

export const kpiService_y = [
  {
    Name: 'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={procureAmoCategories_m} series={procureAmoSeries_m} />,
  },
  {
    Name: '% of Ontime delivery and No of Receipts by Tier-1 Supplies',
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m} />, 
  
  },
  {
    Name: 'Spend Trend by Top 10 Supplier',
    container: <WrapperPieChart series={topSupplierData} /> ,
    
  },
  {
    Name:'Overdue Aging by Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={overdueCategories_m} series={overdueSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={procureAmoCategories_m} series={procureAmoSeries_m} />,
  },
  {
    Name: '% of Ontime delivery and No of Receipts by Tier-1 Supplies',
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m} />, 
  
  },
  {
    Name: 'Spend Trend by Top 10 Supplier',
    container: <WrapperPieChart series={topSupplierData} /> ,
    
  },
  {
    Name:'Overdue Aging by Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={overdueCategories_m} series={overdueSeries_m} />,
  },

]

export const kpiCost_q = [
  {
    Name: 'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={procureAmoCategories_m} series={procureAmoSeries_m} />,
  },
  {
    Name: '% of Ontime delivery and No of Receipts by Tier-1 Supplies',
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m} />, 
  
  },
  {
    Name: 'Spend Trend by Top 10 Supplier',
    container: <WrapperPieChart series={topSupplierData} /> ,
    
  },
  {
    Name:'Overdue Aging by Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={overdueCategories_m} series={overdueSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'PO Amount by Cost Center',
    container: <WrapperMultiBarChart category={procureAmoCategories_m} series={procureAmoSeries_m} />,
  },
  {
    Name: '% of Ontime delivery and No of Receipts by Tier-1 Supplies',
    container: <WrapperMultiColumnChart category={ontimeCategories_m} series={ontimeSeries_m} />, 
  
  },
  {
    Name: 'Spend Trend by Top 10 Supplier',
    container: <WrapperPieChart series={topSupplierData} /> ,
    
  },
  {
    Name:'Overdue Aging by Tier-1 Suppliers',
    container: <WrapperMultiStackColChart category={overdueCategories_m} series={overdueSeries_m} />,
  },
]
