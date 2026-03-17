import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'

import {volumeCategories_m,volumeSeries_m,uptimeCategories_m,uptimeSeries_m,trendCategories_m,trendSeries_m, downtimeCategories_m,downtimeSeries_m} from '~/kendo/rawData/analysis/mfgperAnalysis'


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
    Name:'Production Volume by Plant',
    container: <WrapperMultiBarChart category={volumeCategories_m} series={volumeSeries_m} />,
  },
  {
    Name: 'Uptime Hours by Center',
    container: <WrapperMultiStackColChart category={uptimeCategories_m} series={uptimeSeries_m} />, 

  },
  {
    Name: 'Downtime Trend by Machine (Seattle Plant)',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name:'Production Volume by Plant',
    container: <WrapperMultiBarChart category={volumeCategories_m} series={volumeSeries_m} />,
  },
  {
    Name: 'Uptime Hours by Center',
    container: <WrapperMultiStackColChart category={uptimeCategories_m} series={uptimeSeries_m} />, 

  },
  {
    Name: 'Downtime Trend by Machine (Seattle Plant)',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name:'Production Volume by Plant',
    container: <WrapperMultiBarChart category={volumeCategories_m} series={volumeSeries_m} />,
  },
  {
    Name: 'Uptime Hours by Center',
    container: <WrapperMultiStackColChart category={uptimeCategories_m} series={uptimeSeries_m} />, 

  },
  {
    Name: 'Downtime Trend by Machine (Seattle Plant)',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name:'Production Volume by Plant',
    container: <WrapperMultiBarChart category={volumeCategories_m} series={volumeSeries_m} />,
  },
  {
    Name: 'Uptime Hours by Center',
    container: <WrapperMultiStackColChart category={uptimeCategories_m} series={uptimeSeries_m} />, 

  },
  {
    Name: 'Downtime Trend by Machine (Seattle Plant)',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name:'Production Volume by Plant',
    container: <WrapperMultiBarChart category={volumeCategories_m} series={volumeSeries_m} />,
  },
  {
    Name: 'Uptime Hours by Center',
    container: <WrapperMultiStackColChart category={uptimeCategories_m} series={uptimeSeries_m} />, 

  },
  {
    Name: 'Downtime Trend by Machine (Seattle Plant)',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name:'Production Volume by Plant',
    container: <WrapperMultiBarChart category={volumeCategories_m} series={volumeSeries_m} />,
  },
  {
    Name: 'Uptime Hours by Center',
    container: <WrapperMultiStackColChart category={uptimeCategories_m} series={uptimeSeries_m} />, 

  },
  {
    Name: 'Downtime Trend by Machine (Seattle Plant)',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> ,
    
  },
  {
    Name:'Downtime Causes',
    container: <WrapperMultiColumnChart category={downtimeCategories_m} series={downtimeSeries_m} />,
  },
]
