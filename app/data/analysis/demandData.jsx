import WrapperMultiColumnChart from '~/kendo/charts/column/WrapperColumnChart'
import WrapperMultiBarChart from '~/kendo/charts/bar/WrapperBarChart'
import WrapperScatterBubbleChart from '~/kendo/charts/bubble/WrapperScatterBubbleChart'
import {bookingCategories_m,bookingSeries_m,bookingRevenueData,topCustCategories_m,topCustSeries_m,onTimeCategories_m,onTimeSeries_m} from '~/kendo/rawData/analysis/demandAnalysisData'

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
    Name: 'Bookings,Invoiced and Revenue Trends',
    container: <WrapperMultiColumnChart category={bookingCategories_m} series={bookingSeries_m}/>,
  },
  {
    Name: 'Bookings and Revenue by Products',
    container: <WrapperScatterBubbleChart data={bookingRevenueData} />,

  },
  {
    Name: 'Top Customers - Bookings and Revenue',
   container: <WrapperMultiBarChart category={topCustCategories_m} series={topCustSeries_m}/>,
    
  },
  {
    Name:'On Time Shipment Performance by Location',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m} />,
  },
]

export const kpiService_q = [
  {
    Name: 'Bookings,Invoiced and Revenue Trends',
    container: <WrapperMultiColumnChart category={bookingCategories_m} series={bookingSeries_m}/>,
  },
  {
    Name: 'Bookings and Revenue by Products',
    container: <WrapperScatterBubbleChart data={bookingRevenueData} />,

  },
  {
    Name: 'Top Customers - Bookings and Revenue',
   container: <WrapperMultiBarChart category={topCustCategories_m} series={topCustSeries_m}/>,
    
  },
  {
    Name:'On Time Shipment Performance by Location',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m} />,
  },
]

export const kpiService_y = [
  {
    Name: 'Bookings,Invoiced and Revenue Trends',
    container: <WrapperMultiColumnChart category={bookingCategories_m} series={bookingSeries_m}/>,
  },
  {
    Name: 'Bookings and Revenue by Products',
    container: <WrapperScatterBubbleChart data={bookingRevenueData} />,

  },
  {
    Name: 'Top Customers - Bookings and Revenue',
   container: <WrapperMultiBarChart category={topCustCategories_m} series={topCustSeries_m}/>,
    
  },
  {
    Name:'On Time Shipment Performance by Location',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m} />,
  },
]

export const kpiCost_m = [
  {
    Name: 'Bookings,Invoiced and Revenue Trends',
    container: <WrapperMultiColumnChart category={bookingCategories_m} series={bookingSeries_m}/>,
  },
  {
    Name: 'Bookings and Revenue by Products',
    container: <WrapperScatterBubbleChart data={bookingRevenueData} />,

  },
  {
    Name: 'Top Customers - Bookings and Revenue',
   container: <WrapperMultiBarChart category={topCustCategories_m} series={topCustSeries_m}/>,
    
  },
  {
    Name:'On Time Shipment Performance by Location',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m} />,
  },
]

export const kpiCost_q = [
  {
    Name: 'Bookings,Invoiced and Revenue Trends',
    container: <WrapperMultiColumnChart category={bookingCategories_m} series={bookingSeries_m}/>,
  },
  {
    Name: 'Bookings and Revenue by Products',
    container: <WrapperScatterBubbleChart data={bookingRevenueData} />,

  },
  {
    Name: 'Top Customers - Bookings and Revenue',
   container: <WrapperMultiBarChart category={topCustCategories_m} series={topCustSeries_m}/>,
    
  },
  {
    Name:'On Time Shipment Performance by Location',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m} />,
  },
]

export const kpiCost_y = [
  {
    Name: 'Bookings,Invoiced and Revenue Trends',
    container: <WrapperMultiColumnChart category={bookingCategories_m} series={bookingSeries_m}/>,
  },
  {
    Name: 'Bookings and Revenue by Products',
    container: <WrapperScatterBubbleChart data={bookingRevenueData} />,

  },
  {
    Name: 'Top Customers - Bookings and Revenue',
   container: <WrapperMultiBarChart category={topCustCategories_m} series={topCustSeries_m}/>,
    
  },
  {
    Name:'On Time Shipment Performance by Location',
    container: <WrapperMultiColumnChart category={onTimeCategories_m} series={onTimeSeries_m} />,
  },
]
