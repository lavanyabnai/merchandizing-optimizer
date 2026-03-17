import WrapperMultiColumnChart from '@/app/kendo/charts/column/WrapperColumnChart'
import WrapperPieChart from  '@/app/kendo/charts/pie/WrapperPieChart'
import WrapperDonutChart from '@/app/kendo/charts/donut/WrapperDonutChart'
import WrapperMultiBarChart from '@/app/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '@/app/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '@/app/kendo/charts/waterfall/WrapperWaterfallChart'
import {spendtopData,spendBusinessCategories_m,spendBusinessSeries_m,spendTrendCategories_m,spendTrendSeries_m,spendOffData} from '@/app/kendo/rawData/analysis/spendAnalysis'


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
    Name: 'Spend by Top 10 Supplier',
    container: <WrapperWaterfallChart data={spendtopData} />,
  },
  {
    Name: 'Spend by Business Unit',
    container: <WrapperMultiColumnChart category={spendBusinessCategories_m} series={spendBusinessSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top Level Categories',
    container: <WrapperMultiStackColChart category={spendTrendCategories_m} series={spendTrendSeries_m} /> ,
    
  },
  {
    Name:'Spend and Off-Contract by Category',
    container: <WrapperWaterfallChart data={spendOffData} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Spend by Top 10 Supplier',
    container: <WrapperPieChart series={spendtopData} />,
  },
  {
    Name: 'Spend by Business Unit',
    container: <WrapperMultiBarChart category={spendBusinessCategories_m} series={spendBusinessSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top Level Categories',
    container: <WrapperMultiStackColChart category={spendTrendCategories_m} series={spendTrendSeries_m} /> ,
    
  },
  {
    Name:'Spend and Off-Contract by Category',
    container: <WrapperDonutChart series={spendOffData} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Spend by Top 10 Supplier',
    container: <WrapperPieChart series={spendtopData} />,
  },
  {
    Name: 'Spend by Business Unit',
    container: <WrapperMultiBarChart category={spendBusinessCategories_m} series={spendBusinessSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top Level Categories',
    container: <WrapperMultiStackColChart category={spendTrendCategories_m} series={spendTrendSeries_m} /> ,
    
  },
  {
    Name:'Spend and Off-Contract by Category',
    container: <WrapperDonutChart series={spendOffData} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Spend by Top 10 Supplier',
    container: <WrapperPieChart series={spendtopData} />,
  },
  {
    Name: 'Spend by Business Unit',
    container: <WrapperMultiBarChart category={spendBusinessCategories_m} series={spendBusinessSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top Level Categories',
    container: <WrapperMultiStackColChart category={spendTrendCategories_m} series={spendTrendSeries_m} /> ,
    
  },
  {
    Name:'Spend and Off-Contract by Category',
    container: <WrapperDonutChart series={spendOffData} />,
  },

]

export const kpiCost_q = [
  {
    Name: 'Spend by Top 10 Supplier',
    container: <WrapperPieChart series={spendtopData} />,
  },
  {
    Name: 'Spend by Business Unit',
    container: <WrapperMultiBarChart category={spendBusinessCategories_m} series={spendBusinessSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top Level Categories',
    container: <WrapperMultiStackColChart category={spendTrendCategories_m} series={spendTrendSeries_m} /> ,
    
  },
  {
    Name:'Spend and Off-Contract by Category',
    container: <WrapperDonutChart series={spendOffData} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Spend by Top 10 Supplier',
    container: <WrapperPieChart series={spendtopData} />,
  },
  {
    Name: 'Spend by Business Unit',
    container: <WrapperMultiBarChart category={spendBusinessCategories_m} series={spendBusinessSeries_m} />, 

  },
  {
    Name: 'Spend Trend by Top Level Categories',
    container: <WrapperMultiStackColChart category={spendTrendCategories_m} series={spendTrendSeries_m} /> ,
    
  },
  {
    Name:'Spend and Off-Contract by Category',
    container: <WrapperDonutChart series={spendOffData} />,
  },
]
