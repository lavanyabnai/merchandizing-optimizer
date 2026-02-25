import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperScatterBubbleChart from '~/kendo/charts/bubble/WrapperScatterBubbleChart'
import WrapperChartGrid from '~/kendo/grid/WrapperGrid'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {discountCategoryData,savingsPotentialData,discountCategories_m,discountSeries_m,savingsPotentialItem} from '~/kendo/rawData/analysis/savingsAnalysis'


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
    Name: 'Discounts by Category Name',
    container: <WrapperWaterfallChart data={discountCategoryData} />,
  },
  {
    Name: 'Savings Potential by Supplier,Product Group',
    container: <WrapperScatterBubbleChart data={savingsPotentialData} />, 
  },
  {
    Name: 'Discount Trend',
    container: <WrapperMultiStackColChart category={discountCategories_m} series={discountSeries_m} /> ,
    
  },
  {
    Name:'Savings Potential by Item',
    container: <WrapperChartGrid data={savingsPotentialItem} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Cost Trend',
    container: <WrapperPieChart series={discountCategoryData}/>,
  },
  {
    Name: 'Inventory Valuation by Subinventory',
    container: <WrapperScatterBubbleChart data={savingsPotentialData} />, 

  },
  {
    Name: 'Item Cost - Top 10',
    container: <WrapperMultiStackColChart category={discountCategories_m} series={discountSeries_m} /> ,
    
  },
  {
    Name:'Item Cost by Item Category',
    container: <WrapperChartGrid data={savingsPotentialItem} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Cost Trend',
    container: <WrapperPieChart series={discountCategoryData}  />,
  },
  {
    Name: 'Inventory Valuation by Subinventory',
    container: <WrapperScatterBubbleChart data={savingsPotentialData} />, 

  },
  {
    Name: 'Item Cost - Top 10',
    container: <WrapperMultiStackColChart category={discountCategories_m} series={discountSeries_m} /> ,
    
  },
  {
    Name:'Item Cost by Item Category',
    container: <WrapperChartGrid data={savingsPotentialItem} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Cost Trend',
    container: <WrapperPieChart series={discountCategoryData}  />,
  },
  {
    Name: 'Inventory Valuation by Subinventory',
    container: <WrapperScatterBubbleChart data={savingsPotentialData} />, 

  },
  {
    Name: 'Item Cost - Top 10',
    container: <WrapperMultiStackColChart category={discountCategories_m} series={discountSeries_m} /> ,
    
  },
  {
    Name:'Item Cost by Item Category',
    container: <WrapperChartGrid data={savingsPotentialItem} />,
  },

]

export const kpiCost_q = [
  {
    Name: 'Cost Trend',
    container: <WrapperPieChart series={discountCategoryData}  />,
  },
  {
    Name: 'Inventory Valuation by Subinventory',
    container: <WrapperScatterBubbleChart data={savingsPotentialData} />, 

  },
  {
    Name: 'Item Cost - Top 10',
    container: <WrapperMultiStackColChart category={discountCategories_m} series={discountSeries_m} /> ,
    
  },
  {
    Name:'Item Cost by Item Category',
    container: <WrapperChartGrid data={savingsPotentialItem} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Cost Trend',
    container: <WrapperPieChart series={discountCategoryData}  />,
  },
  {
    Name: 'Inventory Valuation by Subinventory',
    container: <WrapperScatterBubbleChart data={savingsPotentialData} />, 

  },
  {
    Name: 'Item Cost - Top 10',
    container: <WrapperMultiStackColChart category={discountCategories_m} series={discountSeries_m} /> ,
    
  },
  {
    Name:'Item Cost by Item Category',
    container: <WrapperChartGrid data={savingsPotentialItem} />,
  },
]
