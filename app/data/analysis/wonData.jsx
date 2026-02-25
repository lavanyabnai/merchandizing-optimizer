import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'
import {monthCategories_m,
  monthSeries_m,
  typeCategories_m,
  typeSeries_m,
  noofCategories_m,
  noofSeries_m,
  ownerSeries_m} from '~/kendo/rawData/analysis/wonAnalysis'


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
    Name: 'Activity Rate - Won vs Lost by Month',
    container: <WrapperMultiBarChart category={monthCategories_m} series={monthSeries_m} />,
  },
  {
    Name: 'Activity Type from Wins by Quarter',
    container: <WrapperMultiStackColChart category={typeCategories_m} series={typeSeries_m} />, 

  },
  {
    Name: 'Activity Type by # of Activites',
    container: <WrapperMultiColumnChart category={noofCategories_m} series={noofSeries_m} /> ,
    
  },
  {
    Name:'Activity Metrics by Owner',
    container: <WrapperWaterfallChart data={ownerSeries_m} />,
  }
]

export const kpiService_q = [
  {
    Name: 'Activity Rate - Won vs Lost by Month',
    container: <WrapperMultiBarChart category={monthCategories_m} series={monthSeries_m} />,
  },
  {
    Name: 'Activity Type from Wins by Quarter',
    container: <WrapperMultiStackColChart category={typeCategories_m} series={typeSeries_m} />, 

  },
  {
    Name: 'Activity Type by # of Activites',
    container: <WrapperMultiColumnChart category={noofCategories_m} series={noofSeries_m} /> ,
    
  },
  {
    Name:'Activity Metrics by Owner',
    container: <WrapperPieChart series={ownerSeries_m} />,
  }
]

export const kpiService_y = [
  {
    Name: 'Activity Rate - Won vs Lost by Month',
    container: <WrapperMultiBarChart category={monthCategories_m} series={monthSeries_m} />,
  },
  {
    Name: 'Activity Type from Wins by Quarter',
    container: <WrapperMultiStackColChart category={typeCategories_m} series={typeSeries_m} />, 

  },
  {
    Name: 'Activity Type by # of Activites',
    container: <WrapperMultiColumnChart category={noofCategories_m} series={noofSeries_m} /> ,
    
  },
  {
    Name:'Activity Metrics by Owner',
    container: <WrapperPieChart series={ownerSeries_m} />,
  }
]

export const kpiCost_m = [
  {
    Name: 'Activity Rate - Won vs Lost by Month',
    container: <WrapperMultiBarChart category={monthCategories_m} series={monthSeries_m} />,
  },
  {
    Name: 'Activity Type from Wins by Quarter',
    container: <WrapperMultiStackColChart category={typeCategories_m} series={typeSeries_m} />, 

  },
  {
    Name: 'Activity Type by # of Activites',
    container: <WrapperMultiColumnChart category={noofCategories_m} series={noofSeries_m} /> ,
    
  },
  {
    Name:'Activity Metrics by Owner',
    container: <WrapperPieChart series={ownerSeries_m} />,
  }
]

export const kpiCost_q = [
  {
    Name: 'Activity Rate - Won vs Lost by Month',
    container: <WrapperMultiBarChart category={monthCategories_m} series={monthSeries_m} />,
  },
  {
    Name: 'Activity Type from Wins by Quarter',
    container: <WrapperMultiStackColChart category={typeCategories_m} series={typeSeries_m} />, 

  },
  {
    Name: 'Activity Type by # of Activites',
    container: <WrapperMultiColumnChart category={noofCategories_m} series={noofSeries_m} /> ,
    
  },
  {
    Name:'Activity Metrics by Owner',
    container: <WrapperPieChart series={ownerSeries_m} />,
  }
]

export const kpiCost_y = [
  {
    Name: 'Activity Rate - Won vs Lost by Month',
    container: <WrapperMultiBarChart category={monthCategories_m} series={monthSeries_m} />,
  },
  {
    Name: 'Activity Type from Wins by Quarter',
    container: <WrapperMultiStackColChart category={typeCategories_m} series={typeSeries_m} />, 

  },
  {
    Name: 'Activity Type by # of Activites',
    container: <WrapperMultiColumnChart category={noofCategories_m} series={noofSeries_m} /> ,
    
  },
  {
    Name:'Activity Metrics by Owner',
    container: <WrapperPieChart series={ownerSeries_m} />,
  }
]
