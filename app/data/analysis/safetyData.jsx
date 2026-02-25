import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {incidentSeries_m,
  trendCategories_m,
  trendSeries_m,
  locationCategories_m,
  locationSeries_m,
  detailCategories_m,
  detailSeries_m} from '~/kendo/rawData/analysis/safetyAnalysis'


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
    Name: 'Incidents by Serverity',
    container:<WrapperWaterfallChart data={incidentSeries_m} />, 
  },
  {
    Name: 'Incidents Trend',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> 

  },
  {
    Name: 'Location of Incidents',
    container: <WrapperMultiColumnChart category={locationCategories_m} series={locationSeries_m} /> ,
    
  },
  {
    Name:'Indicident Details',
    container: <WrapperMultiColumnChart category={detailCategories_m} series={detailSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Incidents by Serverity',
    container:<WrapperWaterfallChart data={incidentSeries_m} />, 
  },
  {
    Name: 'Incidents Trend',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> 

  },
  {
    Name: 'Location of Incidents',
    container: <WrapperMultiColumnChart category={locationCategories_m} series={locationSeries_m} /> ,
    
  },
  {
    Name:'Indicident Details',
    container: <WrapperMultiColumnChart category={detailCategories_m} series={detailSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Incidents by Serverity',
    container:<WrapperWaterfallChart data={incidentSeries_m} />, 
  },
  {
    Name: 'Incidents Trend',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> 

  },
  {
    Name: 'Location of Incidents',
    container: <WrapperMultiColumnChart category={locationCategories_m} series={locationSeries_m} /> ,
    
  },
  {
    Name:'Indicident Details',
    container: <WrapperMultiColumnChart category={detailCategories_m} series={detailSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Incidents by Serverity',
    container:<WrapperWaterfallChart data={incidentSeries_m} />, 
  },
  {
    Name: 'Incidents Trend',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> 

  },
  {
    Name: 'Location of Incidents',
    container: <WrapperMultiColumnChart category={locationCategories_m} series={locationSeries_m} /> ,
    
  },
  {
    Name:'Indicident Details',
    container: <WrapperMultiColumnChart category={detailCategories_m} series={detailSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Incidents by Serverity',
    container:<WrapperWaterfallChart data={incidentSeries_m} />, 
  },
  {
    Name: 'Incidents Trend',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> 

  },
  {
    Name: 'Location of Incidents',
    container: <WrapperMultiColumnChart category={locationCategories_m} series={locationSeries_m} /> ,
    
  },
  {
    Name:'Indicident Details',
    container: <WrapperMultiColumnChart category={detailCategories_m} series={detailSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Incidents by Serverity',
    container:<WrapperWaterfallChart data={incidentSeries_m} />, 
  },
  {
    Name: 'Incidents Trend',
    container: <WrapperMultiColumnChart category={trendCategories_m} series={trendSeries_m} /> 

  },
  {
    Name: 'Location of Incidents',
    container: <WrapperMultiColumnChart category={locationCategories_m} series={locationSeries_m} /> ,
    
  },
  {
    Name:'Indicident Details',
    container: <WrapperMultiColumnChart category={detailCategories_m} series={detailSeries_m} />,
  },
]
