import WrapperMultiColumnChart from "~/kendo/charts/column/WrapperColumnChart";
import WrapperMultiLineChart from "~/kendo/charts/line/WrapperLineChart";
import {
  forecastCategories_m,
forecastSeries_m,
mapeCategories_m,
mapeSeries_m,
 
} from "~/kendo/rawData/dashboard/demandplanningDashboard";

export const reviewTabs = [
  { name: "Month", href: "#", current: true },
  { name: "Quarter", href: "#", current: false },
  { name: "Year", href: "#", current: false },
];

export const meetingTabs = [
  { name: "Daily", href: "#", current: true },
  { name: "Weekly", href: "#", current: false },
];

export const kpiService_m = [
  {
    Name: 'Forecast Accuracy',
    Value: '75%',
    Trend: 'up',
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={forecastCategories_m}
        series={forecastSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/orderAnalysis',
  },
  {
    Name: 'MAPE',
    Value: '80%',
    Trend: 'down',
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: 'On Track',
    Analyze: '/snop/dashboard/analysis/demandAnalysis',
  },
]