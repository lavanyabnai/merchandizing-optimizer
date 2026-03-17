import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperMultiColumnColorChart from '../../kendo/charts/columnColor/WrapperColorColumnChart'
import WrapperMultiBarColorChart from '../../kendo/charts/barColor/WrapperColorBarChart'
import {
  pro1Data,
  pro4Data,
  serviceCategories_m,
serviceSeries_m
} from "~/kendo/rawData/analysis/shapedemandAnalysis";


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
    Name: "OTIF at commit, order lines missed",
    sub: "Service metrics by product group",
    container: (
      <WrapperMultiColumnChart
        category={serviceCategories_m}
        series={serviceSeries_m}
      />
    ),
  },
];

export const kpiInv_m = [
  {
    Name: "Shortage in 8 weeks",
    sub: "",
    container: <WrapperMultiBarColorChart seriesData={pro4Data} />,
  },

  
];

