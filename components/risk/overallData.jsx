import WrapperMultiColumnChart from '@/app/kendo/charts/column/WrapperColumnChart';
import WrapperMultiColumnColorChart from '@/app/kendo/charts/columnColor/WrapperColorColumnChart';
import WrapperMultiLineChart from '@/app/kendo/charts/line/WrapperLineChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
const invoices = [
  {
    name: 'Carrying Cost',
    value: '89.35',
    unit: 'USD'
  },
  {
    name: 'Opportunity Cost',
    value: '7,993.23',
    unit: 'USD'
  },
  {
    name: 'Profit',
    value: '63,344,372.18',
    unit: 'USD'
  },
  {
    name: 'Revenue',
    value: '98,280,000.0',
    unit: 'USD'
  },
  {
    name: 'Total Cost',
    value: '34,935,627.82',
    unit: 'USD'
  },
  {
    name: 'Transportation Cost',
    value: '5,760,238.47',
    unit: 'USD'
  }
];
const current = [
  {
    name: 'Arrived on time orders',
    value: '1,473.0',
    unit: 'Order'
  },
  {
    name: 'Arrived orders (customer)',
    value: '2,176.0',
    unit: 'Order'
  },
  {
    name: 'Delayed Orders',
    value: '705.0',
    unit: 'Order'
  }
];
export function Carrying() {
  return (
    <div className="w-full bg-white rounded-b-md border">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Statistics Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.name}>
              <TableCell>{invoice.name}</TableCell>
              <TableCell>{invoice.value}</TableCell>
              <TableCell>{invoice.unit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function Current() {
  return (
    <div className="w-full bg-white rounded-b-md border">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Statistics Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {current.map((invoice) => (
            <TableRow key={invoice.name}>
              <TableCell>{invoice.name}</TableCell>
              <TableCell>{invoice.value}</TableCell>
              <TableCell>{invoice.unit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
import {
  receivedCategories_m,
  receivedSeries_m,
  leadCategories_m,
  leadSeries_m,
  agreementCategories_m,
  agreementSeries_m,
  pro1Data
} from '@/components/risk/overallDashboard';

export const reviewTabs = [
  { name: 'Month', href: '#', current: true },
  { name: 'Quarter', href: '#', current: false },
  { name: 'Year', href: '#', current: false }
];

export const meetingTabs = [
  { name: 'Daily', href: '#', current: true },
  { name: 'Weekly', href: '#', current: false }
];

export const kpiService_m = [
  {
    Name: 'Transportation Cost,Total Cost,Revenue,Profit',
    Value: '$128M',
    Trend: 'up',
    TargetAch: 100,
    container: <WrapperMultiColumnColorChart seriesData={pro1Data} />,
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/proeffAnalysis'
  },
  {
    Name: 'ELT Service Level,by items q-ty',
    Value: '$113M',
    Trend: 'up',
    TargetAch: 94,
    container: (
      <WrapperMultiLineChart
        category={receivedCategories_m}
        series={receivedSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/supplyAnalysis'
  },
  {
    Name: 'Lead Time',
    Value: '$14.89M',
    Trend: 'down',
    TargetAch: 0,
    container: (
      <WrapperMultiLineChart
        category={agreementCategories_m}
        series={agreementSeries_m}
      />
    ),
    status: 'On Track',
    Analyze: '/snop/dashboard/analysis/procureAnalysis'
  },
  {
    Name: 'Lead Time',
    Value: '$32M',
    Trend: 'down',
    TargetAch: 50,
    container: (
      <WrapperMultiColumnChart
        category={leadCategories_m}
        series={leadSeries_m}
      />
    ),
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/savingsAnalysis'
  },
  {
    Name: 'Carrying Cost,Opportunity Cost,Profit,Revenue,Total Cost,Transportation Cost',
    Value: '40',
    Trend: 'up',
    TargetAch: 90,
    container: <Carrying />,
    status: 'Above Target',
    Analyze: '/snop/dashboard/analysis/supplyAnalysis'
  },
  {
    Name: 'Current backlog Orders,Customer delayed orders',
    Value: '18%',
    Trend: 'down',
    TargetAch: 90,
    container: <Current />,
    status: 'Below Target',
    Analyze: '/snop/dashboard/analysis/spendAnalysis'
  }
];
