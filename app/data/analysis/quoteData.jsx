import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import {
  ownerCategories_m,
  ownerSeries_m,
  avgContCategories_m,
  avgContSeries_m,
  quoteCategories_m,
  quoteSeries_m,
  lineCategories_m,
  lineSeries_m} from '~/kendo/rawData/analysis/quoteAnalysis'


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
    Name: 'Total Opportunity Amount by Owner & Stage',
    container: <WrapperMultiStackColChart category={ownerCategories_m} series={ownerSeries_m} />,
  },
  {
    Name: 'Average Contract Value by Product and Quote Status',
    container: <WrapperMultiStackColChart category={avgContCategories_m} series={avgContSeries_m} />, 

  },
  {
    Name: 'Quote Line Discount by Opportunity Owner',
    container: <WrapperMultiColumnChart category={quoteCategories_m} series={quoteSeries_m} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperMultiColumnChart category={lineCategories_m} series={lineSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Total Opportunity Amount by Owner & Stage',
    container: <WrapperMultiStackColChart category={ownerCategories_m} series={ownerSeries_m} />,
  },
  {
    Name: 'Average Contract Value by Product and Quote Status',
    container: <WrapperMultiStackColChart category={avgContCategories_m} series={avgContSeries_m} />, 

  },
  {
    Name: 'Quote Line Discount by Opportunity Owner',
    container: <WrapperMultiColumnChart category={quoteCategories_m} series={quoteSeries_m} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperMultiColumnChart category={lineCategories_m} series={lineSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Total Opportunity Amount by Owner & Stage',
    container: <WrapperMultiStackColChart category={ownerCategories_m} series={ownerSeries_m} />,
  },
  {
    Name: 'Average Contract Value by Product and Quote Status',
    container: <WrapperMultiStackColChart category={avgContCategories_m} series={avgContSeries_m} />, 

  },
  {
    Name: 'Quote Line Discount by Opportunity Owner',
    container: <WrapperMultiColumnChart category={quoteCategories_m} series={quoteSeries_m} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperMultiColumnChart category={lineCategories_m} series={lineSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Total Opportunity Amount by Owner & Stage',
    container: <WrapperMultiStackColChart category={ownerCategories_m} series={ownerSeries_m} />,
  },
  {
    Name: 'Average Contract Value by Product and Quote Status',
    container: <WrapperMultiStackColChart category={avgContCategories_m} series={avgContSeries_m} />, 

  },
  {
    Name: 'Quote Line Discount by Opportunity Owner',
    container: <WrapperMultiColumnChart category={quoteCategories_m} series={quoteSeries_m} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperMultiColumnChart category={lineCategories_m} series={lineSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Total Opportunity Amount by Owner & Stage',
    container: <WrapperMultiStackColChart category={ownerCategories_m} series={ownerSeries_m} />,
  },
  {
    Name: 'Average Contract Value by Product and Quote Status',
    container: <WrapperMultiStackColChart category={avgContCategories_m} series={avgContSeries_m} />, 

  },
  {
    Name: 'Quote Line Discount by Opportunity Owner',
    container: <WrapperMultiColumnChart category={quoteCategories_m} series={quoteSeries_m} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperMultiColumnChart category={lineCategories_m} series={lineSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Total Opportunity Amount by Owner & Stage',
    container: <WrapperMultiStackColChart category={ownerCategories_m} series={ownerSeries_m} />,
  },
  {
    Name: 'Average Contract Value by Product and Quote Status',
    container: <WrapperMultiStackColChart category={avgContCategories_m} series={avgContSeries_m} />, 

  },
  {
    Name: 'Quote Line Discount by Opportunity Owner',
    container: <WrapperMultiColumnChart category={quoteCategories_m} series={quoteSeries_m} /> ,
    
  },
  {
    Name:'Tier-1 Suppliers',
    container: <WrapperMultiColumnChart category={lineCategories_m} series={lineSeries_m} />,
  },
]
