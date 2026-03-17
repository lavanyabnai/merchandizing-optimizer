import WrapperDonutChart from "~/kendo/charts/donut/WrapperDonutChart";
import WrapperMultiStackColChart from "~/kendo/charts/stackcol/WrapperStackColChart";
import WrapperMultiColumnChart from "~/kendo/charts/column/WrapperColumnChart";
import WrapperMultiBarChart from "~/kendo/charts/bar/WrapperBarChart";

import {
  leadData_m,
  campaignCategories_m,
  campaignSeries_m,
  pipelineCategories_m,
  pipelineSeries_m,
  openCategories_m,
  openSeries_m,
  wonCategories_m,
  wonSeries_m,
  productCategories_m,
  productSeries_m,
  activeCategories_m,
  activeSeries_m,
  criticalCategories_m,
  criticalSeries_m,
} from "~/kendo/rawData/dashboard/salesDashboard";

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
    Name: "Lead Conversion Rate",
    Value: "14.91",
    Trend: "up",
    TargetAch: "83",
    container: <WrapperDonutChart series={leadData_m} />,
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/pipelineAnalysis",
  },
  {
    Name: "Campaign ROI",
    Value: "4.33",
    Trend: "up",
    TargetAch: "$291.96",
    container: (
      <WrapperMultiBarChart
        category={campaignCategories_m}
        series={campaignSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/pipelineAnalysis",
  },
  {
    Name: "Campaign Attributed Pipeline",
    Value: "7.49M",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiStackColChart
        category={pipelineCategories_m}
        series={pipelineSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/pipelineAnalysis",
  },
  {
    Name: "Open Pipeline",
    Value: "$10.02M",
    Trend: "down",
    TargetAch: "$47.13k",
    container: (
      <WrapperMultiColumnChart
        category={openCategories_m}
        series={openSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/pipelineAnalysis",
  },
  {
    Name: "Activity Rate - Won Oppty",
    Value: "3.61",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={wonCategories_m}
        series={wonSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/wonAnalysis",
  },
  {
    Name: "Avg Contract Value by Product",
    Value: "$968.20k",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={productCategories_m}
        series={productSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/quoteAnalysis",
  },
  {
    Name: "Active MRR",
    Value: "$130.80M",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiColumnChart
        category={activeCategories_m}
        series={activeSeries_m}
      />
    ),
    status: "/snop/dashboard/analysis/winAnalysis",
  },
  {
    Name: "Open Critical SRs",
    Value: "7",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={criticalCategories_m}
        series={criticalSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/wonAnalysis",
  },
];

export const kpiService_q = [
  {
    Name: "Lead Conversion Rate",
    Value: "14.91",
    Trend: "up",
    TargetAch: "83",
    container: <WrapperDonutChart series={leadData_m} />,
    status: "Above Target",
    Analyze: "Analyze",
  },
  {
    Name: "Campaign ROI",
    Value: "4.33",
    Trend: "up",
    TargetAch: "$291.96",
    container: (
      <WrapperMultiBarChart
        category={campaignCategories_m}
        series={campaignSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "Analyze",
  },
  {
    Name: "Campaign Attributed Pipeline",
    Value: "7.49M",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiStackColChart
        category={pipelineCategories_m}
        series={pipelineSeries_m}
      />
    ),
    status: "On Track",
  },
  {
    Name: "Open Pipeline",
    Value: "$10.02M",
    Trend: "down",
    TargetAch: "$47.13k",
    container: (
      <WrapperMultiBarChart category={openCategories_m} series={openSeries_m} />
    ),
    status: "Above Target",
    Analyze: "Analyze",
  },
  {
    Name: "Activity Rate - Won Oppty",
    Value: "3.61",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={wonCategories_m}
        series={wonSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/wonAnalysis",
  },
  {
    Name: "Avg Contract Value by Product",
    Value: "$968.20k",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={productCategories_m}
        series={productSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/quoteAnalysis",
  },
  {
    Name: "Active MRR",
    Value: "$130.80M",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiColumnChart
        category={activeCategories_m}
        series={activeSeries_m}
      />
    ),
    status: "/snop/dashboard/analysis/winAnalysis",
  },
  {
    Name: "Open Critical SRs",
    Value: "7",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={criticalCategories_m}
        series={criticalSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/wonAnalysis",
  },
];

export const kpiService_y = [
  {
    Name: "Lead Conversion Rate",
    Value: "14.91",
    Trend: "up",
    TargetAch: "83",
    container: <WrapperDonutChart series={leadData_m} />,
    status: "Above Target",
    Analyze: "Analyze",
  },
  {
    Name: "Campaign ROI",
    Value: "4.33",
    Trend: "up",
    TargetAch: "$291.96",
    container: (
      <WrapperMultiBarChart
        category={campaignCategories_m}
        series={campaignSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "Analyze",
  },
  {
    Name: "Campaign Attributed Pipeline",
    Value: "7.49M",
    Trend: "down",
    TargetAch: 0,
    container: (
      <WrapperMultiStackColChart
        category={pipelineCategories_m}
        series={pipelineSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "Analyze",
  },
  {
    Name: "Open Pipeline",
    Value: "$10.02M",
    Trend: "down",
    TargetAch: "$47.13k",
    container: (
      <WrapperMultiBarChart category={openCategories_m} series={openSeries_m} />
    ),
    status: "Above Target",
    Analyze: "Analyze",
  },
  {
    Name: "Activity Rate - Won Oppty",
    Value: "3.61",
    Trend: "up",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={wonCategories_m}
        series={wonSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/wonAnalysis",
  },
  {
    Name: "Avg Contract Value by Product",
    Value: "$968.20k",
    Trend: "down",
    TargetAch: 90,
    container: (
      <WrapperMultiStackColChart
        category={productCategories_m}
        series={productSeries_m}
      />
    ),
    status: "On Track",
    Analyze: "/snop/dashboard/analysis/quoteAnalysis",
  },
  {
    Name: "Active MRR",
    Value: "$130.80M",
    Trend: "up",
    TargetAch: 77,
    container: (
      <WrapperMultiColumnChart
        category={activeCategories_m}
        series={activeSeries_m}
      />
    ),
    status: "/snop/dashboard/analysis/winAnalysis",
  },
  {
    Name: "Open Critical SRs",
    Value: "7",
    Trend: "up",
    TargetAch: 95,
    container: (
      <WrapperMultiColumnChart
        category={criticalCategories_m}
        series={criticalSeries_m}
      />
    ),
    status: "Above Target",
    Analyze: "/snop/dashboard/analysis/wonAnalysis",
  },
];
