import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiAreaChart from  '~/kendo/charts/area/WrapperAreaChart'
import WrapperPieChart from  '~/kendo/charts/pie/WrapperPieChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperWaterfallChart from '~/kendo/charts/waterfall/WrapperWaterfallChart'

import {orderTrendCategories_m,orderTrendSeries_m,topCustomers,discountproductCategories_m,discountproductSeries_m,cancellationCategories_m,cancellationSeries_m} from '~/kendo/rawData/analysis/scmOverviewData'


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
  Name: 'Orders Trend',
  container: <WrapperMultiAreaChart category={orderTrendCategories_m} series={orderTrendSeries_m}/>,
  },
  {
  Name: 'Top Customers',
  container: <WrapperWaterfallChart data={topCustomers} />,
  },
  {
  Name: 'Discounts by Product Category & Channel',
  container: <WrapperMultiStackColChart category={discountproductCategories_m} series={discountproductSeries_m}/>,
  },
  {
    Name:'Cancellations & Return Trends',
    container: <WrapperMultiColumnChart category={cancellationCategories_m} series={cancellationSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Orders Trend',
    container: <WrapperMultiAreaChart category={orderTrendCategories_m} series={orderTrendSeries_m}/>,
    },
    {
    Name: 'Top Customers',
    container: <WrapperPieChart series={topCustomers} />,
    },
    {
    Name: 'Discounts by Product Category & Channel',
    container: <WrapperMultiBarChart category={discountproductCategories_m} series={discountproductSeries_m}  />,
    },
    {
      Name:'Cancellations & Return Trends',
      container: <WrapperMultiColumnChart category={cancellationCategories_m} series={cancellationSeries_m} />,
    },
]

export const kpiService_y = [
  {
    Name: 'Orders Trend',
    container: <WrapperMultiAreaChart category={orderTrendCategories_m} series={orderTrendSeries_m}/>,
    },
    {
    Name: 'Top Customers',
    container: <WrapperPieChart series={topCustomers} />,
    },
    {
    Name: 'Discounts by Product Category & Channel',
    container: <WrapperMultiBarChart category={discountproductCategories_m} series={discountproductSeries_m}  />,
    },
    {
      Name:'Cancellations & Return Trends',
      container: <WrapperMultiColumnChart category={cancellationCategories_m} series={cancellationSeries_m} />,
    },

]

export const kpiCost_q = [
  {
    Name: 'Orders Trend',
    container: <WrapperMultiAreaChart category={orderTrendCategories_m} series={orderTrendSeries_m}/>,
    },
    {
    Name: 'Top Customers',
    container: <WrapperPieChart series={topCustomers} />,
    },
    {
    Name: 'Discounts by Product Category & Channel',
    container: <WrapperMultiBarChart category={discountproductCategories_m} series={discountproductSeries_m}  />,
    },
    {
      Name:'Cancellations & Return Trends',
      container: <WrapperMultiColumnChart category={cancellationCategories_m} series={cancellationSeries_m} />,
    },

]

export const kpiCost_y = [
  {
    Name: 'Orders Trend',
    container: <WrapperMultiAreaChart category={orderTrendCategories_m} series={orderTrendSeries_m}/>,
    },
    {
    Name: 'Top Customers',
    container: <WrapperPieChart series={topCustomers} />,
    },
    {
    Name: 'Discounts by Product Category & Channel',
    container: <WrapperMultiBarChart category={discountproductCategories_m} series={discountproductSeries_m}  />,
    },
    {
      Name:'Cancellations & Return Trends',
      container: <WrapperMultiColumnChart category={cancellationCategories_m} series={cancellationSeries_m} />,
    },
]
