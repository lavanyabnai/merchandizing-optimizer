import WrapperMultiStackColChart from '~/kendo/charts/stackcol/WrapperStackColChart'
import WrapperMultiLineChart from '~/kendo/charts/line/WrapperLineChart';
import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart';

import {leadsCategories_m,leadsSeries_m,attributedCategories_m, attributedSeries_m,pipelineCategories_m,pipelineSeries_m,campaignCategories_m,
campaignSeries_m, revenueCategories_m,revenueSeries_m,wonCategories_m,wonSeries_m,topCategories_m,topSeries_m,targetedCategories_m,targetedSeries_m} from '~/kendo/rawData/dashboard/campaignDashboard'


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
    Name: 'Attributed Leads',
    Value: '378.00',
    Trend: 'up',
    TargetAch: 83,
    container:<WrapperMultiColumnChart category={leadsCategories_m} series={leadsSeries_m}/>, 
    status: "Above Target"
  },
  {
    Name: 'Attributed Opportunities',
    Value: '41.00',
    Trend: 'up',
    TargetAch: 20,
    container:<WrapperMultiStackColChart category={attributedCategories_m} series={attributedSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Attributed Pipeline',
    Value: '$5.03M',
    Trend: 'down',
    TargetAch: 0,
    container: <WrapperMultiStackColChart category={pipelineCategories_m} series={pipelineSeries_m}/>,
    status: "On Track"
  },
  {
    Name:'Campaign ROI',
    Value: '345%',
    Trend: 'down',
    TargetAch: 47,
    container: <WrapperMultiColumnChart category={campaignCategories_m} series={campaignSeries_m} />,
    status: "Above Target"
  },
  {
    Name:'Cost Per Revenue Line',
    Value: '$18.52K',
    Trend: 'up',
    TargetAch: 0,
    container: <WrapperMultiColumnChart category={revenueCategories_m} series={revenueSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Cost Per Won Revenue',
    Value: '0.54',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={wonCategories_m} series={wonSeries_m} />,
    status: "On Track"
  },
  {
    Name: 'Top Campaigns',
    Value: '$2.09M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Targeted Accounts',
    Value: '39.00',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={targetedCategories_m} series={targetedSeries_m} />,
    status: "Above Target"
  },
]

export const kpiService_q = [
  {
    Name: 'Attributed Leads',
    Value: '378.00',
    Trend: 'up',
    TargetAch: 83,
    container:<WrapperMultiColumnChart category={leadsCategories_m} series={leadsSeries_m}/>, 
    status: "Above Target"
  },
  {
    Name: 'Attributed Opportunities',
    Value: '41.00',
    Trend: 'up',
    TargetAch: 20,
    container:<WrapperMultiStackColChart category={attributedCategories_m} series={attributedSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Attributed Pipeline',
    Value: '$5.03M',
    Trend: 'down',
    TargetAch: 0,
    container: <WrapperMultiStackColChart category={pipelineCategories_m} series={pipelineSeries_m}/>,
    status: "On Track"
  },
  {
    Name:'Campaign ROI',
    Value: '345%',
    Trend: 'down',
    TargetAch: 47,
    container: <WrapperMultiColumnChart category={campaignCategories_m} series={campaignSeries_m} />,
    status: "Above Target"
  },
  {
    Name:'Cost Per Revenue Line',
    Value: '$18.52K',
    Trend: 'up',
    TargetAch: 0,
    container: <WrapperMultiColumnChart category={revenueCategories_m} series={revenueSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Cost Per Won Revenue',
    Value: '0.54',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={wonCategories_m} series={wonSeries_m} />,
    status: "On Track"
  },
  {
    Name: 'Top Campaigns',
    Value: '$2.09M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Targeted Accounts',
    Value: '39.00',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={targetedCategories_m} series={targetedSeries_m} />,
    status: "Above Target"
  },
]

export const kpiService_y = [
  {
    Name: 'Attributed Leads',
    Value: '378.00',
    Trend: 'up',
    TargetAch: 83,
    container:<WrapperMultiColumnChart category={leadsCategories_m} series={leadsSeries_m}/>, 
    status: "Above Target"
  },
  {
    Name: 'Attributed Opportunities',
    Value: '41.00',
    Trend: 'up',
    TargetAch: 20,
    container:<WrapperMultiStackColChart category={attributedCategories_m} series={attributedSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Attributed Pipeline',
    Value: '$5.03M',
    Trend: 'down',
    TargetAch: 0,
    container: <WrapperMultiStackColChart category={pipelineCategories_m} series={pipelineSeries_m}/>,
    status: "On Track"
  },
  {
    Name:'Campaign ROI',
    Value: '345%',
    Trend: 'down',
    TargetAch: 47,
    container: <WrapperMultiColumnChart category={campaignCategories_m} series={campaignSeries_m} />,
    status: "Above Target"
  },
  {
    Name:'Cost Per Revenue Line',
    Value: '$18.52K',
    Trend: 'up',
    TargetAch: 0,
    container: <WrapperMultiColumnChart category={revenueCategories_m} series={revenueSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Cost Per Won Revenue',
    Value: '0.54',
    Trend: 'down',
    TargetAch: 90,
    container: <WrapperMultiColumnChart category={wonCategories_m} series={wonSeries_m} />,
    status: "On Track"
  },
  {
    Name: 'Top Campaigns',
    Value: '$2.09M',
    Trend: 'up',
    TargetAch: 77,
    container: <WrapperMultiColumnChart category={topCategories_m} series={topSeries_m} />,
    status: "Above Target"
  },
  {
    Name: 'Targeted Accounts',
    Value: '39.00',
    Trend: 'up',
    TargetAch: 95,
    container: <WrapperMultiLineChart category={targetedCategories_m} series={targetedSeries_m} />,
    status: "Above Target"
  },
]

