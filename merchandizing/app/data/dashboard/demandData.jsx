
import WrapperPieChart from "~/kendo/charts/pie/WrapperPieChart";


import WrapperMultiAreaChart from "~/kendo/charts/area/WrapperAreaChart";
import WrapperMultiLineChart from "~/kendo/charts/line/WrapperLineChart";
import WrapperMultiColumnChart from "~/kendo/charts/column/WrapperColumnChart";
import WrapperMultiBarChart from "~/kendo/charts/bar/WrapperBarChart";

import {
  shipmentsData_m,
  cancelCategories_m,
  cancelSeries_m,
  mapeCategories_m,
  mapeSeries_m,
  locationCategories_m,
  locationSeries_m,
  lateCategories_m,
  lateSeries_m,
  ontimeCategories_m,
  ontimeSeries_m,
  perfectCategories_m,
  perfectFirstSeries_m,
  invoiceCategories_m,
  invoiceSeries_m,
} from "~/kendo/rawData/dashboard/demandDashboard";

export const reviewTabs = [
  { name: "Month", href: "#", current: true },
  { name: "Quarter", href: "#", current: false },
  { name: "Year", href: "#", current: false },
];

export const meetingTabs = [
  { name: "Daily", href: "#", current: true },
  { name: "Weekly", href: "#", current: false },
];
export const kpiChat = [
  {
    Name: "Shipments by channel",
    Value: "$357M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperPieChart series={shipmentsData_m} />,
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Cancellations",
    Value: "$15M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart
        category={cancelCategories_m}
        series={cancelSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
];

export const kpiService_m = [
  {
    Name: "Shipments by channel",
    Value: "$357M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperPieChart series={shipmentsData_m} />,
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Cancellations",
    Value: "$15M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart
        category={cancelCategories_m}
        series={cancelSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "MAPE",
    Value: "80%",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Top return locations",
    Value: "$27M",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={locationCategories_m}
        series={locationSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Late Shipments",
    Value: "$361.89M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={lateCategories_m}
        series={lateSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "On Time Shipment %",
    Value: "73.8%",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={ontimeCategories_m}
        series={ontimeSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Perfect Order %",
    Value: "$300M",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiBarChart
        category={perfectCategories_m}
        series={perfectFirstSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "Order to Invoice Cycle Time",
    Value: "75",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiLineChart
        category={invoiceCategories_m}
        series={invoiceSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: "Shipments by channel",
    Value: "$357M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperPieChart series={shipmentsData_m} />,
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Cancellations",
    Value: "$15M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart
        category={cancelCategories_m}
        series={cancelSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "MAPE",
    Value: "80%",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Top return locations",
    Value: "$27M",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={locationCategories_m}
        series={locationSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Late Shipments",
    Value: "$361.89M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={lateCategories_m}
        series={lateSeries_m}
      />
    ),
    status: "On Track",

    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "On Time Shipment %",
    Value: "73.8%",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={ontimeCategories_m}
        series={ontimeSeries_m}
      />
    ),
    status: "Below Target",

    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Perfect Order %",
    Value: "$300M",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiBarChart
        category={perfectCategories_m}
        series={perfectFirstSeries_m}
      />
    ),
    status: "On Track",

    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "Order to Invoice Cycle Time",
    Value: "75",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiLineChart
        category={invoiceCategories_m}
        series={invoiceSeries_m}
      />
    ),
    status: "Above Target",

    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
];

export const kpiService_y = [
  {
    Name: "Shipments by channel",
    Value: "$357M",
    Trend: "up",
    TargetAch: 75,
    container: <WrapperPieChart series={shipmentsData_m} />,
    status: "Above Target",

    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Cancellations",
    Value: "$15M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiBarChart
        category={cancelCategories_m}
        series={cancelSeries_m}
      />
    ),
    status: "Below Target",

    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "MAPE",
    Value: "80%",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={mapeCategories_m}
        series={mapeSeries_m}
      />
    ),
    status: "On Track",

    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Top return locations",
    Value: "$27M",
    Trend: "down",
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={locationCategories_m}
        series={locationSeries_m}
      />
    ),
    status: "Below Target",

    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Late Shipments",
    Value: "$361.89M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={lateCategories_m}
        series={lateSeries_m}
      />
    ),
    status: "On Track",

    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "On Time Shipment %",
    Value: "73.8%",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiAreaChart
        category={ontimeCategories_m}
        series={ontimeSeries_m}
      />
    ),
    status: "Below Target",

    Analyze: "/snop/dashboard/analysis/demandAnalysis",
  },
  {
    Name: "Perfect Order %",
    Value: "$300M",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiBarChart
        category={perfectCategories_m}
        series={perfectFirstSeries_m}
      />
    ),
    status: "On Track",

    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
  {
    Name: "Order to Invoice Cycle Time",
    Value: "75",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiLineChart
        category={invoiceCategories_m}
        series={invoiceSeries_m}
      />
    ),
    status: "Above Target",

    Analyze: "/snop/dashboard/analysis/orderAnalysis",
  },
];
