"use client";
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react' // AG Grid Component
import event from '@/app/data/riskData/EventData.json'
// import { Form, useFetcher } from '@remix-run/react'

export default function EventGrid() {
  const gridRef = useRef()
  // const fetcher = useFetcher()
  const [rowData, setRowData] = useState(event)
  const [gridApi, setGridApi] = useState(null)

  const getRowId = useCallback((params) => {
    return params.data.id
  }, [])

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      editable: true,
      flex: 1,
      minWidth: 100,
      floatingFilter: true,
      wrapHeaderText: true,
      autoHeaderHeight: true,
    }),
    []
  )

  const columnDefs = [
    {
      field: 'Name',
      headerName: 'Name',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
    },

    {
      field: 'EventType',
      colId: 'Event Type',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
    },
    {
      field: 'Parameters',
      headerName: 'Parameters',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
      // pinned: 'left',
      // lockPinned: true,
      // pivot: true,
    },
    {
      field: 'OccurrenceType',
      headerName: 'Occurrence Type',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
      // pinned: 'left',
      // lockPinned: true,
      // pivot: true,
    },
    {
      field: 'OccurrenceTime',
         headerName: 'Occurrence Time',
      filter: 'agTextColumnFilter',
      flex: 2,
    },
    {
      field: 'Trigger',
      headerName: 'Trigger',
      filter: 'agTextColumnFilter',
      flex: 2,
    },
     {
      field: 'Probability',
      headerName: 'Probability',
      filter: 'agTextColumnFilter',
      flex: 2,
    },
  
  ]

  // const onGridReady = useCallback((params) => {
  //   setGridApi(params.api)
  //   loadData()
  // }, [])

  // // Function to load data
  // const loadData = useCallback(() => {
  //   // fetcher.load("/rLevelMaster?page=1&limit=100"); // Adjust endpoint as necessary
  //   fetcher.load('/rEventsRisk') // Adjust endpoint as necessary
  // }, [fetcher])

  // // Effect to update row data when fetcher data changes
  // useEffect(() => {
  //   if (fetcher.data) {
  //     setRowData(fetcher.data.data)
  //   }
  // }, [fetcher.data])

  return (
    <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
      <form method="post">
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
          // onGridReady={onGridReady}
          domLayout="autoHeight"
          getRowId={getRowId}
          enableRangeSelection={true}
          groupDisplayType="groupRows"
          enableCharts={true}
          // sideBar={true}
          groupDefaultExpanded={3}
          // autoGroupColumnDef={autoGroupColumnDef}
          // groupHideOpenParents={true}
          // pagination={pagination}
          // paginationPageSize={paginationPageSize}
          // paginationPageSizeSelector={paginationPageSizeSelector}
          // rowClassRules={rowClassRules}
          // rowSelection="multiple"
          // rowHeight={50}
          // rowBuffer={0}
          // rowModelType="clientSide"
          // enableRangeSelection={true}
          // isRowSelectable={isRowSelectable}
          // pagination={true}
          // paginationPageSize={10}
          // suppressPaginationPanel={false}
          // groupDisplayType="groupRows"
          // pivotMode={true}
          // onCellValueChanged={onCellValueChanged}
          // rowGroupPanelShow="always"
        />
      </form>
    </div>
  )
}






// mport { Grid, GridColumn } from '@progress/kendo-react-grid'
// // import EventData from "~/data/riskData/EventData.json";

// const EventData = [
//   {
//     Name: 'Raining Season',
//     EventType: 'Path State',
//     Parameters: 'path: Path Supplier DC Berlin,new state:Temporarily closed',
//     OccurrenceType: 'Random',
//     OccurrenceTime: '2023-10-19',
//     Trigger: '',
//     Probability: 0.5,
//   },
//   {
//     Name: 'End of Raining Season',
//     EventType: 'Path State',
//     Parameters: 'Path: Path Supplier DC Berlin,new state:Open',
//     OccurrenceType: 'Date',
//     OccurrenceTime: '2023-10-19',
//     Trigger: 'Raining season',
//     Probability: 1,
//   },
//   {
//     Name: 'Increase in Demand',
//     EventType: 'Demand coefficient',
//     Parameters: 'Customer:[Customers],coefficient:1.1',
//     OccurrenceType: 'Random',
//     OccurrenceTime: '2023-10-19',
//     Trigger: '',
//     Probability: 0.8,
//   },
//   {
//     Name: 'Decrease in Demand',
//     EventType: 'Demand coefficient',
//     Parameters: 'Customer:[Customers],coefficient:0.7',
//     OccurrenceType: 'Random',
//     OccurrenceTime: '2023-10-19',
//     Trigger: '',
//     Probability: 0.9,
//   },
//   {
//     Name: 'Supplier failure',
//     EventType: 'Facility State',
//     Parameters: 'Site: Supplier DC Berlin,new state:Temporarily closed',
//     OccurrenceType: 'Random',
//     OccurrenceTime: '2023-10-19',
//     Trigger: '',
//     Probability: 0.5,
//   },
//   {
//     Name: 'Supplier Recovery',
//     EventType: 'Facility State',
//     Parameters: 'Site: Supplier DC Berlin,new state:Open',
//     OccurrenceType: 'Delay (days)',
//     OccurrenceTime: '2023-10-19',
//     Trigger: '',
//     Probability: 1,
//   },
//   // {
//   //   Name: 'Event_1',
//   //   EventType: 'Facility State',
//   //   Parameters: 'DC Berlin',
//   //   OccurrenceType: 'Date',
//   //   OccurrenceTime: '2023-10-19',
//   //   Trigger: '',
//   //   Probability: 1,
//   // },
//   // {
//   //   Name: 'Event_2',
//   //   EventType: 'Weather',
//   //   Parameters: 'Facility State',
//   //   OccurrenceType: 'Delay (days)',
//   //   OccurrenceTime: '60',
//   //   Trigger: 'Events',
//   //   Probability: 1,
//   // },
// ]
// export default function DemandGrid() {
//   // const [dataState, setDataState] = React.useState({
//   //   skip: 0,
//   //   take: 20,
//   //   sort: [
//   //     {
//   //       field: "orderDate",
//   //       dir: "desc",
//   //     },
//   //   ],
//   //   group: [
//   //     {
//   //       field: "Customer",
//   //     },
//   //   ],
//   // });

//   return (
//     <div>
//       <Grid
//         data={EventData}
//         style={{ height: '440px' }}
//         rowHeight={50}
//         // groupable={true}
//         size={'medium'}
//       >
//         <GridColumn
//           field="Name"
//           title="Customer"
//           locked={true}
//           filter="numeric"
//           width="250px"
//           className="text-lg"
//         />
//         <GridColumn
//           field="EventType"
//           title="Event Type"
//           width="200px"
//           className="text-lg"
//         />
//         <GridColumn
//           field="Parameters"
//           title="Parameters"
//           width="530px"
//           className="text-lg"
//         />
//         <GridColumn
//           field="OccurrenceType"
//           title="OccurrenceType"
//           width="200px"
//           className="text-lg"
//         />
//         <GridColumn
//           field="OccurrenceTime"
//           title="Occurrence Time"
//           width="200px"
//           className="text-lg"
//         />
//         <GridColumn
//           field="Trigger"
//           title="Trigger"
//           width="200px"
//           className="text-lg"
//         />
//         <GridColumn
//           field="Probability"
//           title="Probability"
//           width="190px"
//           className="text-lg"
//         />
//       </Grid>
//     </div>
//   )
// }
