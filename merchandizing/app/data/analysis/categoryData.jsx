import WrapperMultiBarChart from '@/app/kendo/charts/bar/WrapperBarChart'
import WrapperScatterBubbleChart from '@/app/kendo/charts/bubble/WrapperScatterBubbleChart'
import {itemCategories_m,
  itemSeries_m,
  supplierCategories_m,
  supplierSeries_m,
  unitSeries_m,
  itemSupplierCategories_m,
  itemSupplierSeries_m} from '@/app/kendo/rawData/analysis/categoryAnalysis'


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
    Name: 'Contract,Off-Contract by Item',
    container: <WrapperMultiBarChart category={itemCategories_m} series={itemSeries_m}/>,
  },
  {
    Name: 'Contract,Off-Contract by Suppliers',
    container: <WrapperMultiBarChart category={supplierCategories_m} series={supplierSeries_m}/> ,
    
  },
  {
    Name: 'Qty, Unit Price by Item, Off-Contract',
    container: <WrapperScatterBubbleChart  data={unitSeries_m}/>, 
  },
  
  {
    Name:'Item,Suppliers Analysis',
    container: <WrapperMultiBarChart category={itemSupplierCategories_m} series={itemSupplierSeries_m}/>,
  },
]

export const kpiService_q = [
  {
    Name: 'Contract,Off-Contract by Item',
    container: <WrapperMultiBarChart category={itemCategories_m} series={itemSeries_m}/>,
  },
  {
    Name: 'Contract,Off-Contract by Suppliers',
    container: <WrapperMultiBarChart category={supplierCategories_m} series={supplierSeries_m}/> ,
    
  },
  {
    Name: 'Qty, Unit Price by Item, Off-Contract',
    container: <WrapperScatterBubbleChart  series={unitSeries_m}/>, 
  },
  
  {
    Name:'Item,Suppliers Analysis',
    container: <WrapperMultiBarChart category={itemSupplierCategories_m} series={itemSupplierSeries_m}/>,
  },
]

export const kpiService_y = [
  {
    Name: 'Contract,Off-Contract by Item',
    container: <WrapperMultiBarChart category={itemCategories_m} series={itemSeries_m}/>,
  },
  {
    Name: 'Contract,Off-Contract by Suppliers',
    container: <WrapperMultiBarChart category={supplierCategories_m} series={supplierSeries_m}/> ,
    
  },
  {
    Name: 'Qty, Unit Price by Item, Off-Contract',
    container: <WrapperScatterBubbleChart  series={unitSeries_m}/>, 
  },
  
  {
    Name:'Item,Suppliers Analysis',
    container: <WrapperMultiBarChart category={itemSupplierCategories_m} series={itemSupplierSeries_m}/>,
  },
]

export const kpiCost_m = [
  {
    Name: 'Contract,Off-Contract by Item',
    container: <WrapperMultiBarChart category={itemCategories_m} series={itemSeries_m}/>,
  },
  {
    Name: 'Contract,Off-Contract by Suppliers',
    container: <WrapperMultiBarChart category={supplierCategories_m} series={supplierSeries_m}/> ,
    
  },
  {
    Name: 'Qty, Unit Price by Item, Off-Contract',
    container: <WrapperScatterBubbleChart  series={unitSeries_m}/>, 
  },
  
  {
    Name:'Item,Suppliers Analysis',
    container: <WrapperMultiBarChart category={itemSupplierCategories_m} series={itemSupplierSeries_m}/>,
  },
]

export const kpiCost_q = [
  {
    Name: 'Contract,Off-Contract by Item',
    container: <WrapperMultiBarChart category={itemCategories_m} series={itemSeries_m}/>,
  },
  {
    Name: 'Contract,Off-Contract by Suppliers',
    container: <WrapperMultiBarChart category={supplierCategories_m} series={supplierSeries_m}/> ,
    
  },
  {
    Name: 'Qty, Unit Price by Item, Off-Contract',
    container: <WrapperScatterBubbleChart  series={unitSeries_m}/>, 
  },
  
  {
    Name:'Item,Suppliers Analysis',
    container: <WrapperMultiBarChart category={itemSupplierCategories_m} series={itemSupplierSeries_m}/>,
  },
]

export const kpiCost_y = [
  {
    Name: 'Contract,Off-Contract by Item',
    container: <WrapperMultiBarChart category={itemCategories_m} series={itemSeries_m}/>,
  },
  {
    Name: 'Contract,Off-Contract by Suppliers',
    container: <WrapperMultiBarChart category={supplierCategories_m} series={supplierSeries_m}/> ,
    
  },
  {
    Name: 'Qty, Unit Price by Item, Off-Contract',
    container: <WrapperScatterBubbleChart  series={unitSeries_m}/>, 
  },
  
  {
    Name:'Item,Suppliers Analysis',
    container: <WrapperMultiBarChart category={itemSupplierCategories_m} series={itemSupplierSeries_m}/>,
  },
]
