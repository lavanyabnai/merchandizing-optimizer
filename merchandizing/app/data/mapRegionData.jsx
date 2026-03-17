import WrapperWaterfallChart from "@/app/kendo/charts/waterfall/WrapperWaterfallChart";
 
import { tripData, bikeData } from "@/app/kendo/rawData/mapRegionData";

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
    Name: 'On Hand Inventory for Scenario',
    container: <WrapperWaterfallChart data={bikeData} />,
  },
  {
    Name: 'Current on Hand Inventory',
    container: <WrapperWaterfallChart data={tripData} />,
  },
]
