import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiAreaChart from  '~/kendo/charts/area/WrapperAreaChart'


import {opexCategories_m,
  opexSeries_m,
  quaCategories_m,
  quaSeries_m,
  expenseCategories_m,
  expenseSeries_m,
  topCategories_m,
  topSeries_m
  } from '~/kendo/rawData/analysis/opexpenseAnalysis'


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
    Name: 'OPEX Training 12 Months',
    container: <WrapperMultiAreaChart category={ opexCategories_m} series={opexSeries_m} />,
  },
  {
    Name: 'Quarterly OPEX',
    container: <WrapperMultiColumnChart category={ quaCategories_m} series={quaSeries_m} /> , 

  },
  {
    Name: 'Top Cost Centers by Expenses for Current Quarter',
    container:<WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/>  ,
    
  },
  {
    Name:'Sales & Marketing Expenses, Payroll Cost #1, R&D Expenses by Fiscal Quarter',
    container: <WrapperMultiColumnChart category={ expenseCategories_m} series={expenseSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'OPEX Training 12 Months',
    container: <WrapperMultiAreaChart category={ opexCategories_m} series={opexSeries_m} />,
  },
  {
    Name: 'Quarterly OPEX',
    container: <WrapperMultiColumnChart category={ quaCategories_m} series={quaSeries_m} /> , 

  },
  {
    Name: 'Top Cost Centers by Expenses for Current Quarter',
    container:<WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/>  ,
    
  },
  {
    Name:'Sales & Marketing Expenses, Payroll Cost #1, R&D Expenses by Fiscal Quarter',
    container: <WrapperMultiColumnChart category={ expenseCategories_m} series={expenseSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'OPEX Training 12 Months',
    container: <WrapperMultiAreaChart category={ opexCategories_m} series={opexSeries_m} />,
  },
  {
    Name: 'Quarterly OPEX',
    container: <WrapperMultiColumnChart category={ quaCategories_m} series={quaSeries_m} /> , 

  },
  {
    Name: 'Top Cost Centers by Expenses for Current Quarter',
    container:<WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/>  ,
    
  },
  {
    Name:'Sales & Marketing Expenses, Payroll Cost #1, R&D Expenses by Fiscal Quarter',
    container: <WrapperMultiColumnChart category={ expenseCategories_m} series={expenseSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'OPEX Training 12 Months',
    container: <WrapperMultiAreaChart category={ opexCategories_m} series={opexSeries_m} />,
  },
  {
    Name: 'Quarterly OPEX',
    container: <WrapperMultiColumnChart category={ quaCategories_m} series={quaSeries_m} /> , 

  },
  {
    Name: 'Top Cost Centers by Expenses for Current Quarter',
    container:<WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/>  ,
    
  },
  {
    Name:'Sales & Marketing Expenses, Payroll Cost #1, R&D Expenses by Fiscal Quarter',
    container: <WrapperMultiColumnChart category={ expenseCategories_m} series={expenseSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'OPEX Training 12 Months',
    container: <WrapperMultiAreaChart category={ opexCategories_m} series={opexSeries_m} />,
  },
  {
    Name: 'Quarterly OPEX',
    container: <WrapperMultiColumnChart category={ quaCategories_m} series={quaSeries_m} /> , 

  },
  {
    Name: 'Top Cost Centers by Expenses for Current Quarter',
    container:<WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/>  ,
    
  },
  {
    Name:'Sales & Marketing Expenses, Payroll Cost #1, R&D Expenses by Fiscal Quarter',
    container: <WrapperMultiColumnChart category={ expenseCategories_m} series={expenseSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'OPEX Training 12 Months',
    container: <WrapperMultiAreaChart category={ opexCategories_m} series={opexSeries_m} />,
  },
  {
    Name: 'Quarterly OPEX',
    container: <WrapperMultiColumnChart category={ quaCategories_m} series={quaSeries_m} /> , 

  },
  {
    Name: 'Top Cost Centers by Expenses for Current Quarter',
    container:<WrapperMultiColumnChart category={topCategories_m} series={topSeries_m}/>  ,
    
  },
  {
    Name:'Sales & Marketing Expenses, Payroll Cost #1, R&D Expenses by Fiscal Quarter',
    container: <WrapperMultiColumnChart category={ expenseCategories_m} series={expenseSeries_m} />,
  },
]
