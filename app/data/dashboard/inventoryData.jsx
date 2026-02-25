// import WrapperGrid from '~/kendo/grid/WrapperGrid'

import WrapperMultiAreaChart from "@/app/kendo/charts/area/WrapperAreaChart";
import WrapperMultiLineChart from "@/app/kendo/charts/line/WrapperLineChart";
import WrapperMultiBarChart from "@/app/kendo/charts/bar/WrapperBarChart";
import WrapperPieChart from "@/app/kendo/charts/pie/WrapperPieChart";

import {
  handbalance_m,
  avgInventoryCategories_m,
  avgInventorySeries_m,
  mapeCategories_m,
  mapeSeries_m,
  unitCategories_m,
  unitSeries_m,
  resourceCategories_m,
  resourceSeries_m,
  overheadCategories_m,
  overheadSeries_m,
  materialCategories_m,
  materialSeries_m,
  turnsCategories_m,
  turnsSeries_m,
} from "@/app/kendo/rawData/dashboard/inventoryDashboard";

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
    Name: "On Hand Balance",
    Value: "$8.46B",
    Trend: "up",
    TargetAch: 83,
    container: <WrapperPieChart series={handbalance_m} />,
    status: "Above Target",
    Analyze: "/inventory/analysis/inventoryAnalysis",
  },
  {
    Name: "Avg Inventory Valuation",
    Value: "$233.57M",
    Trend: "up",
    TargetAch: 80,
    container: (
      <WrapperMultiBarChart
        category={avgInventoryCategories_m}
        series={avgInventorySeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/inventory/analysis/inventoryAnalysis",
  },
  {
    Name: "MAPE",
    Value: "24%",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/inventory/analysis/inventoryAnalysis",
  },
  {
    Name: "Unit Cost",
    Value: "$52.37K",
    Trend: "down",
    TargetAch: 10,
    container: (
      <WrapperMultiLineChart
        category={unitCategories_m}
        series={unitSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/inventory/analysis/invcostAnalysis",
  },
  {
    Name: "Resource Cost",
    Value: "$24.94M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={resourceCategories_m}
        series={resourceSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/inventory/analysis/invcostAnalysis",
  },
  {
    Name: "Overhead Cost",
    Value: "$2.74M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={overheadCategories_m}
        series={overheadSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/inventory/analysis/invcostAnalysis",
  },
  {
    Name: "Material Cost",
    Value: "$4.17B",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiBarChart
        category={materialCategories_m}
        series={materialSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/inventory/analysis/invcostAnalysis",
  },
  {
    Name: "Inventory Turns",
    Value: "7",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiBarChart
        category={turnsCategories_m}
        series={turnsSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/inventory/analysis/inventoryAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: 'On Hand Balance',
    Value: '$8.46B',
    Trend: 'up',
    TargetAch: 83,
    container: <WrapperPieChart series={handbalance_m} />,
    status: 'Above Target',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
  {
    Name: 'Avg Inventory Valuation',
    Value: '$233.57M',
    Trend: 'up',
    TargetAch: 80,
    container: (
      <WrapperMultiBarChart
        category={avgInventoryCategories_m}
        series={avgInventorySeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
  {
    Name: 'MAPE',
    Value: '24%',
    Trend: 'down',
    TargetAch: 0,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: 'On Track',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
  {
    Name: 'Unit Cost',
    Value: '$52.37K',
    Trend: 'down',
    TargetAch: 10,
    container: (
      <WrapperMultiLineChart
        category={unitCategories_m}
        series={unitSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Resource Cost',
    Value: '$24.94M',
    Trend: 'up',
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={resourceCategories_m}
        series={resourceSeries_m}
      />
    ),
    status: 'Above Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Overhead Cost',
    Value: '$2.74M',
    Trend: 'down',
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={overheadCategories_m}
        series={overheadSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Material Cost',
    Value: '$4.17B',
    Trend: 'up',
    TargetAch: 77,
    container: (
      <WrapperMultiBarChart
        category={materialCategories_m}
        series={materialSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Inventory Turns',
    Value: '7',
    Trend: 'up',
    TargetAch: 95,
    container: (
      <WrapperMultiBarChart
        category={turnsCategories_m}
        series={turnsSeries_m}
      />
    ),
    status: 'Above Target',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
]

export const kpiService_y = [
  {
    Name: 'On Hand Balance',
    Value: '$8.46B',
    Trend: 'up',
    TargetAch: 83,
    container: <WrapperPieChart series={handbalance_m} />,
    status: 'Above Target',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
  {
    Name: 'Avg Inventory Valuation',
    Value: '$233.57M',
    Trend: 'up',
    TargetAch: 80,
    container: (
      <WrapperMultiBarChart
        category={avgInventoryCategories_m}
        series={avgInventorySeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
  {
    Name: 'MAPE',
    Value: '24%',
    Trend: 'down',
    TargetAch: 0,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: 'On Track',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
  {
    Name: 'Unit Cost',
    Value: '$52.37K',
    Trend: 'down',
    TargetAch: 10,
    container: (
      <WrapperMultiLineChart
        category={unitCategories_m}
        series={unitSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Resource Cost',
    Value: '$24.94M',
    Trend: 'up',
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={resourceCategories_m}
        series={resourceSeries_m}
      />
    ),
    status: 'Above Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Overhead Cost',
    Value: '$2.74M',
    Trend: 'down',
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={overheadCategories_m}
        series={overheadSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Material Cost',
    Value: '$4.17B',
    Trend: 'up',
    TargetAch: 77,
    container: (
      <WrapperMultiBarChart
        category={materialCategories_m}
        series={materialSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/inventory/analysis/invcostAnalysis',
  },
  {
    Name: 'Inventory Turns',
    Value: '7',
    Trend: 'up',
    TargetAch: 95,
    container: (
      <WrapperMultiBarChart
        category={turnsCategories_m}
        series={turnsSeries_m}
      />
    ),
    status: 'Above Target',
    Analyze: '/inventory/analysis/inventoryAnalysis',
  },
]
