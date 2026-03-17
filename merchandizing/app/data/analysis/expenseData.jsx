import WrapperMultiColumnChart from '@/app/kendo/charts/column/WrapperColumnChart'
import WrapperMultiStackColChart from '@/app/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '@/app/kendo/charts/waterfall/WrapperWaterfallChart';

import {
  expenseCostCategories_m,
  expenseCostSeries_m,
  expenseReportsCategories_m,
  expenseReportsSeries_m,
  totalExpenseData,
  businessCategories_m,
  businessSeries_m} from '@/app/kendo/rawData/analysis/expenseAnalysis'


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
    Name: 'Total Expense by Cost Center Name,Category',
    container: <WrapperMultiStackColChart category={ expenseCostCategories_m} series={expenseCostSeries_m} />,
  },
  {
    Name: 'Total Expense, # of Expense Reports by Qtr',
    container: <WrapperWaterfallChart data={totalExpenseData} /> , 

  },
  {
    Name: 'Total Expense by Category,Merchant Name',
    container:<WrapperMultiColumnChart category={expenseReportsCategories_m} series={expenseReportsSeries_m}/>  ,
    
  },
  {
    Name:'# of Violations by Reason,Business Unit',
    container: <WrapperMultiStackColChart category={ businessCategories_m} series={businessSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Total Expense by Cost Center Name,Category',
    container: <WrapperMultiStackColChart category={ expenseCostCategories_m} series={expenseCostSeries_m} />,
  },
  {
    Name: 'Total Expense, # of Expense Reports by Qtr',
    container: <WrapperWaterfallChart data={totalExpenseData} /> , 

  },
  {
    Name: 'Total Expense by Category,Merchant Name',
    container:<WrapperMultiColumnChart category={expenseReportsCategories_m} series={expenseReportsSeries_m}/>  ,
    
  },
  {
    Name:'# of Violations by Reason,Business Unit',
    container: <WrapperMultiStackColChart category={ businessCategories_m} series={businessSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Total Expense by Cost Center Name,Category',
    container: <WrapperMultiStackColChart category={ expenseCostCategories_m} series={expenseCostSeries_m} />,
  },
  {
    Name: 'Total Expense, # of Expense Reports by Qtr',
    container: <WrapperWaterfallChart data={totalExpenseData} /> , 

  },
  {
    Name: 'Total Expense by Category,Merchant Name',
    container:<WrapperMultiColumnChart category={expenseReportsCategories_m} series={expenseReportsSeries_m}/>  ,
    
  },
  {
    Name:'# of Violations by Reason,Business Unit',
    container: <WrapperMultiStackColChart category={ businessCategories_m} series={businessSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Total Expense by Cost Center Name,Category',
    container: <WrapperMultiStackColChart category={ expenseCostCategories_m} series={expenseCostSeries_m} />,
  },
  {
    Name: 'Total Expense, # of Expense Reports by Qtr',
    container: <WrapperWaterfallChart data={totalExpenseData} /> , 

  },
  {
    Name: 'Total Expense by Category,Merchant Name',
    container:<WrapperMultiColumnChart category={expenseReportsCategories_m} series={expenseReportsSeries_m}/>  ,
    
  },
  {
    Name:'# of Violations by Reason,Business Unit',
    container: <WrapperMultiStackColChart category={ businessCategories_m} series={businessSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Total Expense by Cost Center Name,Category',
    container: <WrapperMultiStackColChart category={ expenseCostCategories_m} series={expenseCostSeries_m} />,
  },
  {
    Name: 'Total Expense, # of Expense Reports by Qtr',
    container: <WrapperWaterfallChart data={totalExpenseData} /> , 

  },
  {
    Name: 'Total Expense by Category,Merchant Name',
    container:<WrapperMultiColumnChart category={expenseReportsCategories_m} series={expenseReportsSeries_m}/>  ,
    
  },
  {
    Name:'# of Violations by Reason,Business Unit',
    container: <WrapperMultiStackColChart category={ businessCategories_m} series={businessSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Total Expense by Cost Center Name,Category',
    container: <WrapperMultiStackColChart category={ expenseCostCategories_m} series={expenseCostSeries_m} />,
  },
  {
    Name: 'Total Expense, # of Expense Reports by Qtr',
    container: <WrapperWaterfallChart data={totalExpenseData} /> , 

  },
  {
    Name: 'Total Expense by Category,Merchant Name',
    container:<WrapperMultiColumnChart category={expenseReportsCategories_m} series={expenseReportsSeries_m}/>  ,
    
  },
  {
    Name:'# of Violations by Reason,Business Unit',
    container: <WrapperMultiStackColChart category={ businessCategories_m} series={businessSeries_m} />,
  },
]
