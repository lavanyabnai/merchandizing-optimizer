import WrapperGrid from "~/kendo/grid/WrapperGrid";
import { carData } from "~/data/dashboard/carData.js";

import WrapperDonutChart from "~/kendo/charts/donut/WrapperDonutChart";
import WrapperMultiColumnChart from "~/kendo/charts/column/WrapperColumnChart";
import WrapperMultiBarChart from "~/kendo/charts/bar/WrapperBarChart";
import WrapperWaterfallChart from "~/kendo/charts/waterfall/WrapperWaterfallChart";
import WrapperMultiStackColChart from "~/kendo/charts/stackcol/WrapperStackColChart";

import {
  revenueSeries_m,
  opCategories_m,
  opSeries_m,
  ebitdaCategories_m,
  ebitdaSeries_m,
  costCategories_m,
  costSeries_m,
  payrollSeries_m,
  ebitdaMarginCategories_m,
  ebitdaMarginSeries_m,
  netSeries_m,
  grossCategories_m,
  grossSeries_m,
} from "~/kendo/rawData/dashboard/profitDashboard";

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
    Name: "Revenue",
    Value: "$12.74M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperDonutChart series={revenueSeries_m} />,
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "OpEx",
    Value: "$1.47M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart category={opCategories_m} series={opSeries_m} />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/perfAnalysis",
  },
  {
    Name: "EBITDA",
    Value: "$14.23M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={ebitdaCategories_m}
        series={ebitdaSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "Cost of Revenue",
    Value: "$254.47k",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={costCategories_m}
        series={costSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/proeffAnalysis",
  },
  {
    Name: "Payroll Cost",
    Value: "$14.36K",
    Trend: "up",
    TargetAch: 90,
    container: <WrapperDonutChart series={payrollSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/procureAnalysis",
  },
  {
    Name: "EBITDA Margin %",
    Value: "111.69",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={ebitdaMarginCategories_m}
        series={ebitdaMarginSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "Net Income",
    Value: "$14.23M",
    Trend: "up",
    TargetAch: 77,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/procureAnalysis",
  },
  {
    Name: "Gross Margin %",
    Value: "98.00",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={grossCategories_m}
        series={grossSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/perfAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: "Revenue",
    Value: "$12.74M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperDonutChart series={revenueSeries_m} />,
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "OpEx",
    Value: "$1.47M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart category={opCategories_m} series={opSeries_m} />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "EBITDA",
    Value: "$14.23M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={ebitdaCategories_m}
        series={ebitdaSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "Cost of Revenue",
    Value: "$254.47k",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={costCategories_m}
        series={costSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
];

export const kpiService_y = [
  {
    Name: "Revenue",
    Value: "$12.74M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperDonutChart series={revenueSeries_m} />,
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "OpEx",
    Value: "$1.47M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart category={opCategories_m} series={opSeries_m} />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "EBITDA",
    Value: "$14.23M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={ebitdaCategories_m}
        series={ebitdaSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "Cost of Revenue",
    Value: "$254.47k",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={costCategories_m}
        series={costSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
];

export const kpiCost_m = [
  {
    Name: "Payroll Cost",
    Value: "$14.36K",
    Trend: "up",
    TargetAch: 90,
    container: <WrapperDonutChart series={payrollSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/procureAnalysis",
  },
  {
    Name: "EBITDA Margin %",
    Value: "111.69",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={ebitdaMarginCategories_m}
        series={ebitdaMarginSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "Net Income",
    Value: "$14.23M",
    Trend: "up",
    TargetAch: 77,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/procureAnalysis",
  },
  {
    Name: "Gross Margin %",
    Value: "98.00",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={grossCategories_m}
        series={grossSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/perfAnalysis",
  },
];

export const kpiCost_q = [
  {
    Name: "Payroll Cost",
    Value: "$14.36K",
    Trend: "up",
    TargetAch: 90,
    container: <WrapperDonutChart series={payrollSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "EBITDA Margin %",
    Value: "111.69",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart
        category={ebitdaMarginCategories_m}
        series={ebitdaMarginSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "Net Income",
    Value: "$14.23M",
    Trend: "up",
    TargetAch: 77,
    container: <WrapperWaterfallChart data={netSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "Gross Margin %",
    Value: "98.00",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={grossCategories_m}
        series={grossSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
];

export const kpiCost_y = [
  {
    Name: "Payroll Cost",
    Value: "$14.36K",
    Trend: "up",
    TargetAch: 90,
    container: <WrapperDonutChart series={payrollSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "EBITDA Margin %",
    Value: "111.69",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart
        category={ebitdaMarginCategories_m}
        series={ebitdaMarginSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "Net Income",
    Value: "$14.23M",
    Trend: "up",
    TargetAch: 77,
    container: <WrapperWaterfallChart series={netSeries_m} />,
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
  {
    Name: "Gross Margin %",
    Value: "98.00",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={grossCategories_m}
        series={grossSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "demandAnalysis",
  },
];
