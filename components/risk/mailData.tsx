import { useMemo } from 'react';



// Import data hooks
import { useGetBoms } from '@/features/boms/api/use-get-boms';
import { useGetCustomers } from '@/features/customers/api/use-get-customers';
import { useGetDemands } from '@/features/demands/api/use-get-demands';
import { useGetFacilities } from '@/features/facilities/api/use-get-facilities';
import { useGetFacilityexpenses } from '@/features/facilityexpenses/api/use-get-facilityexpenses';
import { useGetFactories } from '@/features/factories/api/use-get-factories';
import { useGetGroups } from '@/features/groups/api/use-get-groups';
import { useGetLocations } from '@/features/locations/api/use-get-locations';
import { useGetobjectivemembers } from '@/features/objectivemembers/api/use-get-objectivemembers';
import { useGetPaths } from '@/features/paths/api/use-get-paths';
import { useGetPeriods } from '@/features/periods/api/use-get-periods';
import { useGetProductflows } from '@/features/productflows/api/use-get-productflows';
import { useGetProductstorages } from '@/features/productstorages/api/use-get-productstorages';
import { useGetProduction_nos } from '@/features/production_no/api/use-get-production_nos';
import { useGetProducts } from '@/features/products/api/use-get-products';
import { useGetSuppliers } from '@/features/suppliers/api/use-get-suppliers';
import { useGetTariffs } from '@/features/tariffs/api/use-get-tariffs';
import { useGetUnitconversions } from '@/features/unitconversions/api/use-get-unitconversions';
import { useGetVehicleTypes } from '@/features/vehicleTypes/api/use-get-vehicleTypes';





import {
  Users,
  ShoppingCart,
  Building2,
  MapPin,
  Route,
  Calendar,
  Package,
  Network,
  Store,
  FileText,
  Factory,
  Target,
  Settings,
  Box,
  Receipt,
  FolderKanban,
  ArrowRightLeft,
  Truck,
  DollarSign,
} from "lucide-react"

type ContentItem = {
  id: string
  name: string
  email: string
  subject: string
  text: string
  dataTable: React.ReactNode
  date: string
  read: boolean
  labels: string[]
  recordCount: number
  lastUpdated: string
  status: string
  icon: React.ReactNode
}

// Hook to get all record counts
export const useRecordCounts = () => {
  const { data: boms = [] } = useGetBoms();
  const { data: customers = [] } = useGetCustomers();
  const { data: demands = [] } = useGetDemands();
  const { data: facilities = [] } = useGetFacilities();
  const { data: facilityexpenses = [] } = useGetFacilityexpenses();
  const { data: factories = [] } = useGetFactories();
  const { data: groups = [] } = useGetGroups();
  const { data: locations = [] } = useGetLocations();
  const { data: objectivemembers = [] } = useGetobjectivemembers();
  const { data: paths = [] } = useGetPaths();
  const { data: periods = [] } = useGetPeriods();
  const { data: productflows = [] } = useGetProductflows();
  const { data: productstorages = [] } = useGetProductstorages();
  const { data: production_nos = [] } = useGetProduction_nos();
  const { data: products = [] } = useGetProducts();
  const { data: suppliers = [] } = useGetSuppliers();
  const { data: tariffs = [] } = useGetTariffs();
  const { data: unitconversions = [] } = useGetUnitconversions();
  const { data: vehicleTypes = [] } = useGetVehicleTypes();


  return useMemo(() => ({
    boms: boms.length,
    customers: customers.length,
    demands: demands.length,
    facilities: facilities.length,
    facilityexpenses: facilityexpenses.length,
    factories: factories.length,
    groups: groups.length,
    locations: locations.length,
    objectivemembers: objectivemembers.length,
    paths: paths.length,
    periods: periods.length,
    productflows: productflows.length,
    productstorages: productstorages.length,
    production_nos: production_nos.length,
    products: products.length,
    suppliers: suppliers.length,
    tariffs: tariffs.length,
    unitconversions: unitconversions.length,
    vehicleTypes: vehicleTypes.length,
  }), [
    customers.length,
    demands.length,
    facilities.length,
    facilityexpenses.length,
    factories.length,
    groups.length,
    locations.length,
    objectivemembers.length,
    paths.length,
    periods.length,
    productflows.length,
    productstorages.length,
    production_nos.length,
    products.length,
    suppliers.length,
    tariffs.length,
    unitconversions.length,
    vehicleTypes.length,
  ]);
};

// Function to generate content items with dynamic counts
export const useContentItems = (): ContentItem[] => {
  const recordCounts = useRecordCounts();

  return useMemo(() => [
    {
      id: "000002",
      name: "Boms",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      text: "A customer is the final destination point of every product shipped from a DC / factory. Use this table to define the customers consuming the products of your supply chain.",
      dataTable: null,
      date: "2023-10-22T09:00:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.boms,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <FileText size={18} />,
    },
    {
      id: "000003",
      name: "Customers",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      text: "A customer is the final destination point of every product shipped from a DC / factory. Use this table to define the customers consuming the products of your supply chain.",
      dataTable: null,
      date: "2023-10-22T09:00:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.customers,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Users size={18} />,
    },

    {
      id: "000004",
      name: "Demand",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "Customers of your supply chain order products in accordance with their demand. In the Demand table you define the mechanism of how the customer's demand for the product is formed.\n\n By default demand is generated on the first day of the first period. In the following cases demand will be automatically set to Next day after interval:\n\n The imported scenario was created in the older version \n\n The outdated database is updated to the new version. This affects all scenarios of this project.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.demands,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <ShoppingCart size={18} />,
    },

    {
      id: "000005",
      name: "Distribution Centers",
      email: "alicesmith@example.com",
      subject: "Re: Project Update",
      text: "Production and storing facilities are the integral components of every supply chain. This table is used to specify distribution centers and factories that comprise your supply chain. Data for this table can be collected automatically from the results of the COG experiment or inserted manually for each DC/factory that you create.To define the involved costs, refer to the Facility expenses table (available in the NET and SIM scenario types).",
      dataTable: null,
      date: "2023-10-22T10:30:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.facilities,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Building2 size={18} />,
    },
    {
      id: "000006",
      name: "Facility Expenses",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "Production and storing facilities are the integral components of every supply chain. This table contains data on the expenses for each site. This data helps to optimize the expenses of supply chain components and their number (refers to NET experiment only).\n\n Such results can be obtained by running the corresponding experiment, which will use the data from this table (as well from other anyLogistix tables containing the required data) to provide the optimal solution in terms of required conditions.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.facilityexpenses,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <DollarSign size={18} />,
    },
    {
      id: "000007",
      name: "Factories",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      text: "A customer is the final destination point of every product shipped from a DC / factory. Use this table to define the customers consuming the products of your supply chain.",
      dataTable: null,
      date: "2023-10-22T09:00:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.factories,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Factory size={18} />,
    },
    {
      id: "000008",
      name: "Groups",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "A group aggregates multiple sites of the supply chain. If you have multiple sites that are handled in the same way in aNETther table and you do NETt want to create multiple entries defining exactly the same policy for them, you can aggregate these sites in a group.\n\n E.g. You have three customers that use the same sourcing policy. Instead of creating a separate entry for each customer in the Sourcing table, you can create a group containing these customers, and define a single entry referring to this group. \n\n Groups can be created manually by the user or automatically as the result of the experiment run. \n\n E.g. COG experiment result suggests that you should create two DCs (DC1 and DC2). In this case, the system automatically arranges all the available customers into two groups (DC1 Customers and DC2 Customers) and generate the corresponding sourcing policies for these groups.\n\n The names of the groups in the table cells and drop-down lists are put in brackets to visually distinguish them from the names of the single objects.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.groups,
      lastUpdated: "2023-05-12T14:30:00",
      status: "deprecated",
      icon: <FolderKanban size={18} />,
    },
    {
      id: "000009",
      name: "Locations",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "The Locations table contains information on locations of all sites involved in your supply chain: customers, DCs, factories and suppliers.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.locations,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <MapPin size={18} />,
    },
  
    {
      id: "000010",
      name: "Objective Members",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "This table is used within the simulation-based experiments only (i.e., Simulation, Variation, Comparison, Safety Stock Estimation, and Risk Analysis). It is used to define events (applicable to customers, DCs and factories) that will affect the data of the scenario during runtime.\n\n Simple events, which are triggered according to the schedule you provide.\n\n Chained events, which are triggered in sequences.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.objectivemembers,
      lastUpdated: "2023-05-12T14:30:00",
      status: "inactive",
      icon: <Target size={18} />,
    },
   
  
    {
      id: "000011",
      name: "Paths",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "This table is used within the simulation-based experiments only (i.e., Simulation, Variation, Comparison, Safety Stock Estimation, and Risk Analysis). In the Inventory table you define inventory policies for your supply chain facilities.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.paths,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Route size={18} />,
    },
 
    {
      id: "000012",
      name: "Periods",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "A path connects location points within your supply chain, allowing a product to be transported from one location to aNETther.\n\n Paths are unidirectional. To define a path for the reverse travel direction, you must create a new table entry.\n\n A pair of locations within your supply chain can be connected by multiple paths. \n\n The defined connections may NETt be shown on the GIS map for the following reasons. \n\n Paths can be created manually or automatically.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.periods,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Calendar size={18} />,
    },
    {
      id: "000013",
      name: "Product Flows",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "The periods specified in this table are used throughout the current scenario deNETting certain time frames that alter scenario in this or that way. For convenience, period groups can be created, if required.\n\n Every scenario contains one period by default. This period defines the start and the end of the scenario, and since it is currently the only available period, it defines the duration of the experiments.\n\n If more than one period is created (there can be NET gaps between the defined periods), you will NETtice that the end date of the first period (as well as of every other period but the last one) is NETt editable. These periods comprise one total period of time with one ending date, defined by the last period of the table. The end of the Intermediate periods precedes the start of the forthcoming periods, i.e., the next period starts when the current period ends.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.productflows,
      lastUpdated: "2023-05-12T14:30:00",
      status: "inactive",
      icon: <Network size={18} />,
    },
    {
      id: "000014",
      name: "Product storages",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "In the Products table you enter information about products that are delivered within your supply chain.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.productstorages,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Package size={18} />,
    },
    {
      id: "000015",
      name: "Production",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "This table is used within the simulation-based experiments only (Simulation, Variation, Comparison, Safety Stock Estimation, Risk Analysis).\n\n Shipping is NETt possible if NET Path is defined for the Source / Destination pair of objects. \n\n Properly defined shipping is required to visualize connections on the GIS map.",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.production_nos,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Settings size={18} />,
    },
    {
      id: "000016",
      name: "Products",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.products,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Box size={18} />,
    },
    {
      id: "000017",
      name: "Suppliers",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      text: "This table is used within the Simulation type of experiments only. It contains data on cash flows of the facilities in your supply chain. A cash account contains the initial cash of a facility (several facilities or a group of facilities) can spend, i.e., their cash on hand that can be spent on purchasing, processing and selling raw materials.\n\n The data from this and Payment Terms tables is used to collect Cash to Serve statistics, which allow you to analyze the amount of cash required for this supply chain to function properly.",
      dataTable: null,
      date: "2023-10-22T09:00:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.suppliers,
      lastUpdated: "2023-05-12T14:30:00",
      status: "deprecated",
      icon: <Store size={18} />,
    },
    {
      id: "000018",
      name: "Tariffs",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      text: "This table is used within the Network Optimization experiment only. It is used to set conditions for the existing Product flows, Product storages and Production constraints by comparing the values to each other or to the constants created and defined here. The experiment does NETt consider the result of the expression if it does NETt satisfy the defined conditions.\n\n Custom constraints work as an expression with its left side value compared to the right side value per specified type of comparison.",
      dataTable: null,
      date: "2023-10-22T09:00:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.tariffs,
      lastUpdated: "2023-05-12T14:30:00",
      status: "inactive",
      icon: <Receipt size={18} />,
    },
    {
      id: "000019",
      name: "Unit Conversions",
      email: "williamsmith@example.com",
      subject: "Meeting Tomorrow",
      text: "This table is used within the Network Optimization experiment only. It is used to set conditions for the existing Product flows, Product storages and Production constraints by comparing the values to each other or to the constants created and defined here. The experiment does NETt consider the result of the expression if it does NETt satisfy the defined conditions.\n\n Custom constraints work as an expression with its left side value compared to the right side value per specified type of comparison.",
      dataTable: null,
      date: "2023-10-22T09:00:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.unitconversions,
      lastUpdated: "2023-05-12T14:30:00",
      status: "inactive",
      icon: <ArrowRightLeft size={18} />,
    },
    {
      id: "000020",
      name: "Vehicle Types",
      email: "bobjohnson@example.com",
      subject: "Weekend Plans",
      text: "In the Vehicle Types table you define all types of vehicles that are used to ship products in the supply chain. The default vehicle type is created with infinite capacity for each new scenario.\n\n ",
      dataTable: null,
      date: "2023-04-10T11:45:00",
      read: true,
      labels: ["simulation", "optimization"],
      recordCount: recordCounts.vehicleTypes,
      lastUpdated: "2023-05-12T14:30:00",
      status: "active",
      icon: <Truck size={18} />,
    },
  ], [recordCounts]);
};

// For backward compatibility, export the hook result as contentItems
export const contentItems = () => {
  const items = useContentItems();
  return items;
};

export type Mail = ReturnType<typeof useContentItems>[number];


