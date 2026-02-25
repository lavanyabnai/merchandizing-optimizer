import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {returnCategories_m,returnSeries_m,productCategories_m,productSeries_m,defectSeries_m,downtimeCategories_m,downtimeSeries_m} from '~/kendo/rawData/analysis/mfgquaAnalysis'

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
    Name:'Right First Time,Rate of Return Trend',
    container: <WrapperMultiColumnChart category={returnCategories_m} series={returnSeries_m} />,
  },
  {
    Name: 'First Pass Yield by Product Name',
    container: <WrapperMultiBarChart category={productCategories_m} series={productSeries_m} />, 

  },
  {
    Name: 'Cause of Defect',
    container: <WrapperWaterfallChart data={defectSeries_m}/> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name:'Right First Time,Rate of Return Trend',
    container: <WrapperMultiColumnChart category={returnCategories_m} series={returnSeries_m} />,
  },
  {
    Name: 'First Pass Yield by Product Name',
    container: <WrapperMultiBarChart category={productCategories_m} series={productSeries_m} />, 

  },
  {
    Name: 'Cause of Defect',
    container: <WrapperWaterfallChart series={defectSeries_m}/> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name:'Right First Time,Rate of Return Trend',
    container: <WrapperMultiColumnChart category={returnCategories_m} series={returnSeries_m} />,
  },
  {
    Name: 'First Pass Yield by Product Name',
    container: <WrapperMultiBarChart category={productCategories_m} series={productSeries_m} />, 

  },
  {
    Name: 'Cause of Defect',
    container: <WrapperWaterfallChart series={defectSeries_m}/> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name:'Right First Time,Rate of Return Trend',
    container: <WrapperMultiColumnChart category={returnCategories_m} series={returnSeries_m} />,
  },
  {
    Name: 'First Pass Yield by Product Name',
    container: <WrapperMultiBarChart category={productCategories_m} series={productSeries_m} />, 

  },
  {
    Name: 'Cause of Defect',
    container: <WrapperWaterfallChart series={defectSeries_m}/> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name:'Right First Time,Rate of Return Trend',
    container: <WrapperMultiColumnChart category={returnCategories_m} series={returnSeries_m} />,
  },
  {
    Name: 'First Pass Yield by Product Name',
    container: <WrapperMultiBarChart category={productCategories_m} series={productSeries_m} />, 

  },
  {
    Name: 'Cause of Defect',
    container: <WrapperWaterfallChart series={defectSeries_m}/> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name:'Right First Time,Rate of Return Trend',
    container: <WrapperMultiColumnChart category={returnCategories_m} series={returnSeries_m} />,
  },
  {
    Name: 'First Pass Yield by Product Name',
    container: <WrapperMultiBarChart category={productCategories_m} series={productSeries_m} />, 

  },
  {
    Name: 'Cause of Defect',
    container: <WrapperWaterfallChart series={defectSeries_m}/> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]
