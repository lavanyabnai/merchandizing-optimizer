import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'

import {resourceCategories_m,resourceSeries_m,turnoverCategories_m,turnoverSeries_m,leaverCategories_m,leaverSeries_m,reasonCategories_m,reasonSeries_m} from '~/kendo/rawData/analysis/workerAnalysis'


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
    Name: 'Resource Utilization,Availability by Job',
    container: <WrapperMultiBarChart category={resourceCategories_m} series={resourceSeries_m} />,
  },
  {
    Name: 'Turnover by Department',
    container: <WrapperMultiStackColChart category={turnoverCategories_m} series={turnoverSeries_m} />, 

  },
  {
    Name: 'Leavers Distribution',
    container: <WrapperMultiColumnChart category={leaverCategories_m} series={leaverSeries_m} /> ,
    
  },
  {
    Name:'Reasons of Leaving',
    container: <WrapperMultiColumnChart category={reasonCategories_m} series={reasonSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Resource Utilization,Availability by Job',
    container: <WrapperMultiBarChart category={resourceCategories_m} series={resourceSeries_m} />,
  },
  {
    Name: 'Turnover by Department',
    container: <WrapperMultiStackColChart category={turnoverCategories_m} series={turnoverSeries_m} />, 

  },
  {
    Name: 'Leavers Distribution',
    container: <WrapperMultiColumnChart category={leaverCategories_m} series={leaverSeries_m} /> ,
    
  },
  {
    Name:'Reasons of Leaving',
    container: <WrapperMultiColumnChart category={reasonCategories_m} series={reasonSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Resource Utilization,Availability by Job',
    container: <WrapperMultiBarChart category={resourceCategories_m} series={resourceSeries_m} />,
  },
  {
    Name: 'Turnover by Department',
    container: <WrapperMultiStackColChart category={turnoverCategories_m} series={turnoverSeries_m} />, 

  },
  {
    Name: 'Leavers Distribution',
    container: <WrapperMultiColumnChart category={leaverCategories_m} series={leaverSeries_m} /> ,
    
  },
  {
    Name:'Reasons of Leaving',
    container: <WrapperMultiColumnChart category={reasonCategories_m} series={reasonSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Resource Utilization,Availability by Job',
    container: <WrapperMultiBarChart category={resourceCategories_m} series={resourceSeries_m} />,
  },
  {
    Name: 'Turnover by Department',
    container: <WrapperMultiStackColChart category={turnoverCategories_m} series={turnoverSeries_m} />, 

  },
  {
    Name: 'Leavers Distribution',
    container: <WrapperMultiColumnChart category={leaverCategories_m} series={leaverSeries_m} /> ,
    
  },
  {
    Name:'Reasons of Leaving',
    container: <WrapperMultiColumnChart category={reasonCategories_m} series={reasonSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Resource Utilization,Availability by Job',
    container: <WrapperMultiBarChart category={resourceCategories_m} series={resourceSeries_m} />,
  },
  {
    Name: 'Turnover by Department',
    container: <WrapperMultiStackColChart category={turnoverCategories_m} series={turnoverSeries_m} />, 

  },
  {
    Name: 'Leavers Distribution',
    container: <WrapperMultiColumnChart category={leaverCategories_m} series={leaverSeries_m} /> ,
    
  },
  {
    Name:'Reasons of Leaving',
    container: <WrapperMultiColumnChart category={reasonCategories_m} series={reasonSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Resource Utilization,Availability by Job',
    container: <WrapperMultiBarChart category={resourceCategories_m} series={resourceSeries_m} />,
  },
  {
    Name: 'Turnover by Department',
    container: <WrapperMultiStackColChart category={turnoverCategories_m} series={turnoverSeries_m} />, 

  },
  {
    Name: 'Leavers Distribution',
    container: <WrapperMultiColumnChart category={leaverCategories_m} series={leaverSeries_m} /> ,
    
  },
  {
    Name:'Reasons of Leaving',
    container: <WrapperMultiColumnChart category={reasonCategories_m} series={reasonSeries_m} />,
  },
]
