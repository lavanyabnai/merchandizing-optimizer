import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiLineChart from '~/kendo/charts/line/WrapperLineChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'

import { serviceCategories_m,
serviceSeries_m,
service1Categories_m,
service1Series_m,
pastCategories_m,
pastSeries_m,
past1Categories_m,
past1Series_m,
 

} from '~/kendo/rawData/analysis/skuAnalysis'


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
    Name: "Service SKU Trends (s1234)",
    sub:"",
    container: (
      <WrapperMultiLineChart
        category={serviceCategories_m}
        series={serviceSeries_m}
      />
    ),
  },

  {
    Name: "",
    container: (
      <WrapperMultiColumnChart
        category={service1Categories_m}
        series={service1Series_m}
      />
    ),
  },
];

export const kpiInv_m = [
  {
    Name: "Past and Project Inventory (s1234)",
    sub: "",
    container: (
      <WrapperMultiLineChart
        category={pastCategories_m}
        series={pastSeries_m}
      />
    ),
  },

  {
    Name: "",
    container: (
      <WrapperMultiStackColChart
        category={past1Categories_m}
        series={past1Series_m}
      />
    ),
  },
];

