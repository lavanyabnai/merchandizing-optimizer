import WrapperGrid from "~/kendo/grid/WrapperGrid";
import { carData } from "~/data/dashboard/carData.js";

import WrapperMultiLineChart from "~/kendo/charts/line/WrapperLineChart";
import WrapperMultiAreaChart from "~/kendo/charts/area/WrapperAreaChart";
import WrapperMultiColumnChart from "~/kendo/charts/column/WrapperColumnChart";
import WrapperMultiBarChart from "~/kendo/charts/bar/WrapperBarChart";

import {
  ratioCategories_m,
  ratioSeries_m,
  currentCategories_m,
  currentSeries_m,
  invCategories_m,
  invSeries_m,
  debtCategories_m,
  debtSeries_m,
  cashCategories_m,
  cashSeries_m,
  fixedCategories_m,
  fixedSeries_m,
  equCategories_m,
  equSeries_m,
  assCategories_m,
  assSeries_m,
} from "~/kendo/rawData/dashboard/financeDashboard";

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
    Name: "Operating Expense Ratio %",
    Value: "11.53",
    Trend: "up",
    TargetAch: 75,
    container: (
      <WrapperMultiLineChart
        category={ratioCategories_m}
        series={ratioSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Current Ratio",
    Value: "1.14",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={currentCategories_m}
        series={currentSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Inventory Turnover Ratio",
    Value: "0.00",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart category={invCategories_m} series={invSeries_m} />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Debt to Equity Ratio",
    Value: "0.01",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiLineChart
        category={debtCategories_m}
        series={debtSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Cash Conversion Cycle",
    Value: "-$648.06K",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={cashCategories_m}
        series={cashSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Fixed Assets Turnover Ratio",
    Value: "0.00",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={fixedCategories_m}
        series={fixedSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Return on Equity %",
    Value: "0.10",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiAreaChart category={equCategories_m} series={equSeries_m} />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "//snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Return on Assets %",
    Value: "0.07",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiAreaChart category={assCategories_m} series={assSeries_m} />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: "Operating Expense Ratio %",
    Value: "11.53",
    Trend: "up",
    TargetAch: 75,
    container: (
      <WrapperMultiLineChart
        category={ratioCategories_m}
        series={ratioSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Current Ratio",
    Value: "1.14",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={currentCategories_m}
        series={currentSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Inventory Turnover Ratio",
    Value: "0.00",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart category={invCategories_m} series={invSeries_m} />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Debt to Equity Ratio",
    Value: "0.01",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiLineChart
        category={debtCategories_m}
        series={debtSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Cash Conversion Cycle",
    Value: "-$648.06K",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={cashCategories_m}
        series={cashSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Fixed Assets Turnover Ratio",
    Value: "0.00",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={fixedCategories_m}
        series={fixedSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Return on Equity %",
    Value: "0.10",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiAreaChart category={equCategories_m} series={equSeries_m} />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "//snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Return on Assets %",
    Value: "0.07",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiAreaChart category={assCategories_m} series={assSeries_m} />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
];

export const kpiService_y = [
  {
    Name: "Operating Expense Ratio %",
    Value: "11.53",
    Trend: "up",
    TargetAch: 75,
    container: (
      <WrapperMultiLineChart
        category={ratioCategories_m}
        series={ratioSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Current Ratio",
    Value: "1.14",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={currentCategories_m}
        series={currentSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Inventory Turnover Ratio",
    Value: "0.00",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart category={invCategories_m} series={invSeries_m} />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/opexpenseAnalysis",
  },
  {
    Name: "Debt to Equity Ratio",
    Value: "0.01",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiLineChart
        category={debtCategories_m}
        series={debtSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Cash Conversion Cycle",
    Value: "-$648.06K",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={cashCategories_m}
        series={cashSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Fixed Assets Turnover Ratio",
    Value: "0.00",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={fixedCategories_m}
        series={fixedSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Return on Equity %",
    Value: "0.10",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiAreaChart category={equCategories_m} series={equSeries_m} />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "//snop/dashboard/analysis/profitAnalysis",
  },
  {
    Name: "Return on Assets %",
    Value: "0.07",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiAreaChart category={assCategories_m} series={assSeries_m} />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/profitAnalysis",
  },
];
