import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import{onHandItemData,onHandDisCategories_m,onHansDisSeries_m,onHandTopData,inventorymovCategories_m,inventorymovSeries_m} from '~/kendo/rawData/analysis/inventoryAnalysisData'

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
    Name: 'On-Hand by Top Items',
    container: <WrapperWaterfallChart data={onHandItemData} category="category" summary="summary" field="field" />,
  },
  {
    Name: 'On-Hand by Distribution Center',
    container: <WrapperMultiBarChart category={onHandDisCategories_m} series={onHansDisSeries_m} /> ,
  },
  {
    Name: 'On-Hand by Top Categories',
    container: <WrapperWaterfallChart data={onHandTopData}/>, 
  },
  {
    Name:'Inventory Movements by Region',
    container: <WrapperMultiBarChart category={inventorymovCategories_m} series={inventorymovSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'On-Hand by Top Items',
    container: <WrapperPieChart series={onHandItemData} />,
  },
  {
    Name: 'On-Hand by Distribution Center',
    container: <WrapperMultiBarChart category={onHandDisCategories_m} series={onHansDisSeries_m} /> ,

  },
  {
    Name: 'On-Hand by Top Categories',
    container: <WrapperPieChart series={onHandTopData} />,
    
  },
  {
    Name:'Inventory Movements by Region',
    container: <WrapperMultiBarChart category={inventorymovSeries_m} series={inventorymovSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'On-Hand by Top Items',
    container: <WrapperPieChart series={onHandItemData} />,
  },
  {
    Name: 'On-Hand by Distribution Center',
    container: <WrapperMultiBarChart category={onHandDisCategories_m} series={onHansDisSeries_m} /> ,

  },
  {
    Name: 'On-Hand by Top Categories',
    container: <WrapperPieChart series={onHandTopData} />,
    
  },
  {
    Name:'Inventory Movements by Region',
    container: <WrapperMultiBarChart category={inventorymovSeries_m} series={inventorymovSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'On-Hand by Top Items',
    container: <WrapperPieChart series={onHandItemData} />,
  },
  {
    Name: 'On-Hand by Distribution Center',
    container: <WrapperMultiBarChart category={onHandDisCategories_m} series={onHansDisSeries_m} /> ,

  },
  {
    Name: 'On-Hand by Top Categories',
    container: <WrapperPieChart series={onHandTopData} />,
    
  },
  {
    Name:'Inventory Movements by Region',
    container: <WrapperMultiBarChart category={inventorymovSeries_m} series={inventorymovSeries_m} />,
  },

]

export const kpiCost_q = [
  {
    Name: 'On-Hand by Top Items',
    container: <WrapperPieChart series={onHandItemData} />,
  },
  {
    Name: 'On-Hand by Distribution Center',
    container: <WrapperMultiBarChart category={onHandDisCategories_m} series={onHansDisSeries_m} /> ,

  },
  {
    Name: 'On-Hand by Top Categories',
    container: <WrapperPieChart series={onHandTopData} />,
    
  },
  {
    Name:'Inventory Movements by Region',
    container: <WrapperMultiBarChart category={inventorymovSeries_m} series={inventorymovSeries_m} />,
  },

]

export const kpiCost_y = [
  {
    Name: 'On-Hand by Top Items',
    container: <WrapperPieChart series={onHandItemData} />,
  },
  {
    Name: 'On-Hand by Distribution Center',
    container: <WrapperMultiBarChart category={onHandDisCategories_m} series={onHansDisSeries_m} /> ,

  },
  {
    Name: 'On-Hand by Top Categories',
    container: <WrapperPieChart series={onHandTopData} />,
    
  },
  {
    Name:'Inventory Movements by Region',
    container: <WrapperMultiBarChart category={inventorymovSeries_m} series={inventorymovSeries_m} />,
  },
]
