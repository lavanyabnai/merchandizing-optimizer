import WrapperMultiColumnChart from '@/app/kendo/charts/column/WrapperColumnChart'
import WrapperMultiStackColChart from '@/app/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '@/app/kendo/charts/waterfall/WrapperWaterfallChart'
import WrapperMultiStackBarChart from '@/app/kendo/charts/stackbar/WrapperStackBarChart'
import {
  expenseCostCategories_m,
  expenseCostSeries_m,
  expenseReportsCategories_m,
  expenseReportsSeries_m,} from '@/app/kendo/rawData/analysis/pogoverAnalysis'


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
    Name: 'PO Goverance Breakdown',
    container: (
      <WrapperMultiStackColChart
        category={expenseCostCategories_m}
        series={expenseCostSeries_m}
      />
    ),
  },

  {
    Name: 'Summary by Supplier',
    container: (
      <WrapperMultiStackBarChart
        category={expenseReportsCategories_m}
        series={expenseReportsSeries_m}
      />
    ),
  },
]

