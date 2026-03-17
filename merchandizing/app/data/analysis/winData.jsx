import WrapperMultiLineChart from '~/kendo/charts/line/WrapperLineChart'
import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {dateCategories_m,
  dateSeries_m,
  revenueCategories_m,
  revenueSeries_m,
  topCategories_m,
  topSeries_m,
  reasonSeries_m} from '~/kendo/rawData/analysis/winAnalysis'


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
    Name: 'Won & Lost Revenue by Date',
    container: <WrapperMultiLineChart category={dateCategories_m} series={dateSeries_m} />,
  },
  {
    Name: 'Lost vs Won Revenue by Qtr',
    container: <WrapperMultiBarChart category={revenueCategories_m} series={revenueSeries_m} />, 

  },
  {
    Name: 'Top 20 Won Revenue by Account',
    container: <WrapperMultiBarChart category={topCategories_m} series={topSeries_m} /> ,
    
  },
  {
    Name:'Lost Revenue by Close Reason',
    container: <WrapperWaterfallChart data={reasonSeries_m} />,
  }
]

export const kpiService_q = [
  {
    Name: 'Won & Lost Revenue by Date',
    container: <WrapperMultiLineChart category={dateCategories_m} series={dateSeries_m} />,
  },
  {
    Name: 'Lost vs Won Revenue by Qtr',
    container: <WrapperMultiBarChart category={revenueCategories_m} series={revenueSeries_m} />, 

  },
  {
    Name: 'Top 20 Won Revenue by Account',
    container: <WrapperMultiBarChart category={topCategories_m} series={topSeries_m} /> ,
    
  },
  {
    Name:'Lost Revenue by Close Reason',
    container: <WrapperPieChart series={reasonSeries_m} />,
  }
]

export const kpiService_y = [
  {
    Name: 'Won & Lost Revenue by Date',
    container: <WrapperMultiLineChart category={dateCategories_m} series={dateSeries_m} />,
  },
  {
    Name: 'Lost vs Won Revenue by Qtr',
    container: <WrapperMultiBarChart category={revenueCategories_m} series={revenueSeries_m} />, 

  },
  {
    Name: 'Top 20 Won Revenue by Account',
    container: <WrapperMultiBarChart category={topCategories_m} series={topSeries_m} /> ,
    
  },
  {
    Name:'Lost Revenue by Close Reason',
    container: <WrapperPieChart series={reasonSeries_m} />,
  }
]

export const kpiCost_m = [
  {
    Name: 'Won & Lost Revenue by Date',
    container: <WrapperMultiLineChart category={dateCategories_m} series={dateSeries_m} />,
  },
  {
    Name: 'Lost vs Won Revenue by Qtr',
    container: <WrapperMultiBarChart category={revenueCategories_m} series={revenueSeries_m} />, 

  },
  {
    Name: 'Top 20 Won Revenue by Account',
    container: <WrapperMultiBarChart category={topCategories_m} series={topSeries_m} /> ,
    
  },
  {
    Name:'Lost Revenue by Close Reason',
    container: <WrapperPieChart series={reasonSeries_m} />,
  }
]

export const kpiCost_q = [
  {
    Name: 'Won & Lost Revenue by Date',
    container: <WrapperMultiLineChart category={dateCategories_m} series={dateSeries_m} />,
  },
  {
    Name: 'Lost vs Won Revenue by Qtr',
    container: <WrapperMultiBarChart category={revenueCategories_m} series={revenueSeries_m} />, 

  },
  {
    Name: 'Top 20 Won Revenue by Account',
    container: <WrapperMultiBarChart category={topCategories_m} series={topSeries_m} /> ,
    
  },
  {
    Name:'Lost Revenue by Close Reason',
    container: <WrapperPieChart series={reasonSeries_m} />,
  }
]

export const kpiCost_y = [
  {
    Name: 'Won & Lost Revenue by Date',
    container: <WrapperMultiLineChart category={dateCategories_m} series={dateSeries_m} />,
  },
  {
    Name: 'Lost vs Won Revenue by Qtr',
    container: <WrapperMultiBarChart category={revenueCategories_m} series={revenueSeries_m} />, 

  },
  {
    Name: 'Top 20 Won Revenue by Account',
    container: <WrapperMultiBarChart category={topCategories_m} series={topSeries_m} /> ,
    
  },
  {
    Name:'Lost Revenue by Close Reason',
    container: <WrapperPieChart series={reasonSeries_m} />,
  }
]
