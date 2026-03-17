import WrapperMultiColumnColorChart from '~/kendo/charts/columnColor/WrapperColorColumnChart'
import {
  Truck_Waiting_m,
Shipments_Waiting_m,
Truck_Detention_m,
Truck_Detention2_m,
} from '~/kendo/rawData/dashboard/logisticsDashboard'

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
    Name: 'Truck Waiting for Shipments',
    sub: '# of Trucks',
    Value: '75%',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnColorChart seriesData={Truck_Waiting_m} />,

    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/orderAnalysis',
  },
  {
    Name: 'Shipments Waiting for Truck',
    sub: '# of Shipments',
    Value: '75%',
    Trend: 'up',
    TargetAch: 90,
    container: (
      <WrapperMultiColumnColorChart seriesData={Shipments_Waiting_m} />
    ),
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/orderAnalysis',
  },
  {
    Name: 'Truck Detention @ DC',
    sub: '# of Trucks',
    Value: '75%',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnColorChart seriesData={Truck_Detention_m} />,
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/orderAnalysis',
  },
  {
    Name: 'Truck Detention @ Carrier',
    sub: '# of Trucks',
    Value: '75%',
    Trend: 'up',
    TargetAch: 90,
    container: <WrapperMultiColumnColorChart seriesData={Truck_Detention2_m} />,
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/orderAnalysis',
  },
]
