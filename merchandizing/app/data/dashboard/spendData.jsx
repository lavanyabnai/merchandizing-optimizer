import WrapperMultiLineChart from "@/app/kendo/charts/line/WrapperLineChart";
import WrapperMultiColumnChart from "@/app/kendo/charts/column/WrapperColumnChart";
import WrapperMultiBarChart from "@/app/kendo/charts/bar/WrapperBarChart";

import WrapperPieChart from "@/app/kendo/charts/pie/WrapperPieChart";

import {
  totalSpend_m,
  addressableCategories_m,
  addressableSeries_m,
  leakageCategories_m,
  leakageSeries_m,
  offContractCategories_m,
  offContractSeries_m,
  employeeCategories_m,
  employeeSeries_m,
  savingsCategories_m,
  savingsSeries_m,
  payableCategories_m,
  payableSeries_m,
  overdueCategories_m,
  overdueSeries_m,
} from "@/app/kendo/rawData/dashboard/spendDashboard";

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
    Name: "Total Spend",
    Value: "$128M",
    Trend: "up",
    TargetAch: 5,
    container: <WrapperPieChart series={totalSpend_m} />,
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/spendAnalysis",
  },
  {
    Name: "Addressable Spend",
    Value: "$133M",
    Trend: "up",
    TargetAch: 94,
    container: (
      <WrapperMultiColumnChart
        category={addressableCategories_m}
        series={addressableSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/spendAnalysis",
  },
  {
    Name: "Contract Leakage",
    Value: "13%",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiColumnChart
        category={leakageCategories_m}
        series={leakageSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/offContractAnalysis",
  },
  {
    Name: "Off-Contract Spend",
    Value: "$52.37K",
    Trend: "down",
    TargetAch: 47,
    container: (
      <WrapperMultiColumnChart
        category={offContractCategories_m}
        series={offContractSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/offContractAnalysis",
  },
  {
    Name: "Employee Expenses",
    Value: "$8M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={employeeCategories_m}
        series={employeeSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/expenseAnalysis",
  },
  {
    Name: "Realized Savings",
    Value: "$10M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={savingsCategories_m}
        series={savingsSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/apAnalysis",
  },
  {
    Name: "Days Payable Outstanding",
    Value: "40",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiColumnChart
        category={payableCategories_m}
        series={payableSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/apAnalysis",
  },
  {
    Name: "AP OverDue",
    Value: "$51M",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiBarChart
        category={overdueCategories_m}
        series={overdueSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/categoryAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: "Total Spend",
    Value: "$128M",
    Trend: "up",
    TargetAch: 5,
    container: <WrapperPieChart series={totalSpend_m} />,
    status: "Below Target",
  },
  {
    Name: "Addressable Spend",
    Value: "$133M",
    Trend: "up",
    TargetAch: 94,
    container: (
      <WrapperMultiColumnChart
        category={addressableCategories_m}
        series={addressableSeries_m}
      />
    ),
    status: "Below Target",
  },
  {
    Name: "Contract Leakage",
    Value: "13%",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiColumnChart
        category={leakageCategories_m}
        series={leakageSeries_m}
      />
    ),
    status: "On Track",
  },
  {
    Name: "Off-Contract Spend",
    Value: "$52.37K",
    Trend: "down",
    TargetAch: 47,
    container: (
      <WrapperMultiColumnChart
        category={offContractCategories_m}
        series={offContractSeries_m}
      />
    ),
    status: "Below Target",
  },
  {
    Name: "Employee Expenses",
    Value: "$8M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={employeeCategories_m}
        series={employeeSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/expenseAnalysis",
  },
  {
    Name: "Realized Savings",
    Value: "$10M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={savingsCategories_m}
        series={savingsSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/apAnalysis",
  },
  {
    Name: "Days Payable Outstanding",
    Value: "40",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiColumnChart
        category={payableCategories_m}
        series={payableSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/apAnalysis",
  },
  {
    Name: "AP OverDue",
    Value: "$51M",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiBarChart
        category={overdueCategories_m}
        series={overdueSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/categoryAnalysis",
  },
];

export const kpiService_y = [
  {
    Name: "Total Spend",
    Value: "$128M",
    Trend: "up",
    TargetAch: 5,
    container: <WrapperPieChart series={totalSpend_m} />,
    status: "Below Target",
  },
  {
    Name: "Addressable Spend",
    Value: "$133M",
    Trend: "up",
    TargetAch: 94,
    container: (
      <WrapperMultiColumnChart
        category={addressableCategories_m}
        series={addressableSeries_m}
      />
    ),
    status: "Below Target",
  },
  {
    Name: "Contract Leakage",
    Value: "13%",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiColumnChart
        category={leakageCategories_m}
        series={leakageSeries_m}
      />
    ),
    status: "On Track",
  },
  {
    Name: "Off-Contract Spend",
    Value: "$52.37K",
    Trend: "down",
    TargetAch: 47,
    container: (
      <WrapperMultiColumnChart
        category={offContractCategories_m}
        series={offContractSeries_m}
      />
    ),
    status: "Below Target",
  },
  {
    Name: "Employee Expenses",
    Value: "$8M",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiColumnChart
        category={employeeCategories_m}
        series={employeeSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/expenseAnalysis",
  },
  {
    Name: "Realized Savings",
    Value: "$10M",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiLineChart
        category={savingsCategories_m}
        series={savingsSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/apAnalysis",
  },
  {
    Name: "Days Payable Outstanding",
    Value: "40",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiColumnChart
        category={payableCategories_m}
        series={payableSeries_m}
      />
    ),
    status: "Below Target",
    Analyze: "/snop/dashboard/analysis/apAnalysis",
  },
  {
    Name: "AP OverDue",
    Value: "$51M",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiBarChart
        category={overdueCategories_m}
        series={overdueSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/categoryAnalysis",
  },
];
