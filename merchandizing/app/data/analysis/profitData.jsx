import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperDonutChart from '~/kendo/charts/donut/WrapperDonutChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {
  revenueSeries_m,
ebitdaCategories_m,
ebitdaSeries_m,
costCategories_m,
costSeries_m,
ebitdaMarginCategories_m,
ebitdaMarginSeries_m} from '~/kendo/rawData/analysis/profitAnalysis'


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
    Name: 'Revenue',
    container: <WrapperWaterfallChart data={revenueSeries_m} />,
  },
  {
    Name: 'EBITDA',
    container: <WrapperMultiStackColChart category={ebitdaCategories_m} series={ebitdaSeries_m} />, 

  },
  {
    Name: 'Cost of Revenue',
    container: <WrapperMultiColumnChart category={costCategories_m} series={costSeries_m} /> ,
    
  },
  {
    Name:'EBITDA Margin %',
    container: <WrapperMultiColumnChart category={ebitdaMarginCategories_m} series={ebitdaMarginSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Revenue',
    container: <WrapperDonutChart series={revenueSeries_m} />,
  },
  {
    Name: 'EBITDA',
    container: <WrapperMultiStackColChart category={ebitdaCategories_m} series={ebitdaSeries_m} />, 

  },
  {
    Name: 'Cost of Revenue',
    container: <WrapperMultiColumnChart category={costCategories_m} series={costSeries_m} /> ,
    
  },
  {
    Name:'EBITDA Margin %',
    container: <WrapperMultiColumnChart category={ebitdaMarginCategories_m} series={ebitdaMarginSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Revenue',
    container: <WrapperDonutChart series={revenueSeries_m} />,
  },
  {
    Name: 'EBITDA',
    container: <WrapperMultiStackColChart category={ebitdaCategories_m} series={ebitdaSeries_m} />, 

  },
  {
    Name: 'Cost of Revenue',
    container: <WrapperMultiColumnChart category={costCategories_m} series={costSeries_m} /> ,
    
  },
  {
    Name:'EBITDA Margin %',
    container: <WrapperMultiColumnChart category={ebitdaMarginCategories_m} series={ebitdaMarginSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Revenue',
    container: <WrapperDonutChart series={revenueSeries_m} />,
  },
  {
    Name: 'EBITDA',
    container: <WrapperMultiStackColChart category={ebitdaCategories_m} series={ebitdaSeries_m} />, 

  },
  {
    Name: 'Cost of Revenue',
    container: <WrapperMultiColumnChart category={costCategories_m} series={costSeries_m} /> ,
    
  },
  {
    Name:'EBITDA Margin %',
    container: <WrapperMultiColumnChart category={ebitdaMarginCategories_m} series={ebitdaMarginSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Revenue',
    container: <WrapperDonutChart series={revenueSeries_m} />,
  },
  {
    Name: 'EBITDA',
    container: <WrapperMultiStackColChart category={ebitdaCategories_m} series={ebitdaSeries_m} />, 

  },
  {
    Name: 'Cost of Revenue',
    container: <WrapperMultiColumnChart category={costCategories_m} series={costSeries_m} /> ,
    
  },
  {
    Name:'EBITDA Margin %',
    container: <WrapperMultiColumnChart category={ebitdaMarginCategories_m} series={ebitdaMarginSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Revenue',
    container: <WrapperDonutChart series={revenueSeries_m} />,
  },
  {
    Name: 'EBITDA',
    container: <WrapperMultiStackColChart category={ebitdaCategories_m} series={ebitdaSeries_m} />, 

  },
  {
    Name: 'Cost of Revenue',
    container: <WrapperMultiColumnChart category={costCategories_m} series={costSeries_m} /> ,
    
  },
  {
    Name:'EBITDA Margin %',
    container: <WrapperMultiColumnChart category={ebitdaMarginCategories_m} series={ebitdaMarginSeries_m} />,
  },
]
