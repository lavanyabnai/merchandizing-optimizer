import WrapperGrid from "@/app/kendo/grid/WrapperGrid";
import { carData } from "@/app/data/dashboard/carData";

import WrapperPieChart from "@/app/kendo/charts/pie/WrapperPieChart";
import WrapperMultiAreaChart from "@/app/kendo/charts/area/WrapperAreaChart";
import WrapperMultiLineChart from "@/app/kendo/charts/line/WrapperLineChart";
import WrapperMultiColumnChart from "@/app/kendo/charts/column/WrapperColumnChart";
import WrapperMultiBarChart from "@/app/kendo/charts/bar/WrapperBarChart";

import WrapperMultiStackColChart from "@/app/kendo/charts/stackcol/WrapperStackColChart";
import {
  salesCategory_m,
  salesData_m,
  forecastCategories_m,
  forecastSeries_m,
  ontimeCategories_m,
  ontimeSeries_m,
  backlogData_m,
  costCategories_m,
  costSeries_m,
  inventoryCategories_m,
  inventorySeries_m,
  marketingCategories_m,
  marketingSeries_m,
  logisticsCategories_m,
  logisticsSeries_m,
} from "@/app/kendo/rawData/dashboard/overviewDashboard";

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
    Name: "Sales",
    Value: "$2.2B",
    Trend: "up",
    TargetAch: 75,
    container: (
      <WrapperMultiStackColChart
        category={salesCategory_m}
        series={salesData_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Forecast Accuracy",
    Value: "75%",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={forecastCategories_m}
        series={forecastSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "On-Time & In-Full",
    Value: "80%",
    Trend: "down",
    TargetAch: 90,
    // container: <WrapperTripleLineChart category={lineCategories_m} first={TripleLineFirstSeries_m} second={TripleLineSecondSeries_m} third={TripleLineThirdSeries_m}/>,
    container: (
      <WrapperMultiLineChart
        category={ontimeCategories_m}
        series={ontimeSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/ontimeAnalysis",
  },
  {
    Name: "Backlog",
    Value: "$1.2M",
    Trend: "down",
    TargetAch: 50,
    container: <WrapperPieChart series={backlogData_m} />,
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "Cost of Goods",
    Value: "$1.2B",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={costCategories_m}
        series={costSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/costAnalysis",
  },
  {
    Name: "Inventory",
    Value: "$600M",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiAreaChart
        category={inventoryCategories_m}
        series={inventorySeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/inventoryAnalysis",
  },
  {
    Name: "Sales & Marketing",
    Value: "$300M",
    Trend: "up",
    TargetAch: 80,
    container: (
      <WrapperMultiBarChart
        category={marketingCategories_m}
        series={marketingSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/invcostAnalysis",
  },
  {
    Name: "Logistics",
    Value: "$300M",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiLineChart
        category={logisticsCategories_m}
        series={logisticsSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/inventoryAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: "Sales",
    Value: "$2.2B",
    Trend: "up",
    TargetAch: 75,
    container: (
      <WrapperMultiStackColChart
        category={salesCategory_m}
        series={salesData_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Forecast Accuracy",
    Value: "75%",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={forecastCategories_m}
        series={forecastSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "On-Time & In-Full",
    Value: "80%",
    Trend: "down",
    TargetAch: 90,
    // container: <WrapperTripleLineChart category={lineCategories_m} first={TripleLineFirstSeries_m} second={TripleLineSecondSeries_m} third={TripleLineThirdSeries_m}/>,
    container: (
      <WrapperMultiLineChart
        category={ontimeCategories_m}
        series={ontimeSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/ontimeAnalysis",
  },
  {
    Name: "Backlog",
    Value: "$1.2M",
    Trend: "down",
    TargetAch: 50,
    container: <WrapperPieChart series={backlogData_m} />,
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "Cost of Goods",
    Value: "$1.2B",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={costCategories_m}
        series={costSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/costAnalysis",
  },
  {
    Name: "Inventory",
    Value: "$600M",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiAreaChart
        category={inventoryCategories_m}
        series={inventorySeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/inventoryAnalysis",
  },
  {
    Name: "Sales & Marketing",
    Value: "$300M",
    Trend: "up",
    TargetAch: 80,
    container: (
      <WrapperMultiBarChart
        category={marketingCategories_m}
        series={marketingSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/invcostAnalysis",
  },
  {
    Name: "Logistics",
    Value: "$300M",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiLineChart
        category={logisticsCategories_m}
        series={logisticsSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/inventoryAnalysis",
  },
];

export const kpiService_y = [
  {
    Name: "Sales",
    Value: "$2.2B",
    Trend: "up",
    TargetAch: 75,
    container: (
      <WrapperMultiStackColChart
        category={salesCategory_m}
        series={salesData_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Forecast Accuracy",
    Value: "75%",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={forecastCategories_m}
        series={forecastSeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "On-Time & In-Full",
    Value: "80%",
    Trend: "down",
    TargetAch: 90,
    // container: <WrapperTripleLineChart category={lineCategories_m} first={TripleLineFirstSeries_m} second={TripleLineSecondSeries_m} third={TripleLineThirdSeries_m}/>,
    container: (
      <WrapperMultiLineChart
        category={ontimeCategories_m}
        series={ontimeSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/ontimeAnalysis",
  },
  {
    Name: "Backlog",
    Value: "$1.2M",
    Trend: "down",
    TargetAch: 50,
    container: <WrapperPieChart series={backlogData_m} />,
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/agreementAnalysis",
  },
  {
    Name: "Cost of Goods",
    Value: "$1.2B",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={costCategories_m}
        series={costSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/costAnalysis",
  },
  {
    Name: "Inventory",
    Value: "$600M",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiAreaChart
        category={inventoryCategories_m}
        series={inventorySeries_m}
      />
    ),
    status: "Below Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/inventoryAnalysis",
  },
  {
    Name: "Sales & Marketing",
    Value: "$300M",
    Trend: "up",
    TargetAch: 80,
    container: (
      <WrapperMultiBarChart
        category={marketingCategories_m}
        series={marketingSeries_m}
      />
    ),
    status: "On Track",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/invcostAnalysis",
  },
  {
    Name: "Logistics",
    Value: "$300M",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiLineChart
        category={logisticsCategories_m}
        series={logisticsSeries_m}
      />
    ),
    status: "Above Target",
    Explore: <WrapperGrid rowData={carData} />,
    Analyze: "/snop/dashboard/analysis/inventoryAnalysis",
  },
];
