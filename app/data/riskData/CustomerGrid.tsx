"use client";
import {
  FilePlusIcon,

} from '@radix-ui/react-icons'
import { AgGridReact } from 'ag-grid-react' // AG Grid 
import React, { useCallback, useState, useMemo, useRef } from 'react'

import customer from '@/app/data/riskData/CustomerData.json'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
export default function ConsensusForecast() {
  const gridRef = useRef<AgGridReact>(null) // Provide the correct type for the ref
  // const fetcher = useFetcher()
  const [rowData,   ] = useState(customer)

   const [, setOpen] = React.useState(false)



    const handleClickOpen = () => {
      setOpen(true)
  }
  
   

      // const onChange = (e) => {
      //   const { value, id } = e.target
      //   // console.log(value,id)
      //   // setFormData({ ...formData, [id]: value })
      // }
  
  const getRowId = useCallback((params: any) => {
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
      field: 'Type',
      colId: 'Type',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
    },
    {
      field: 'Location',
      headerName: 'Location',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
      // pinned: 'left',
      // lockPinned: true,
      // pivot: true,
    },
    {
      field: 'Include',
      headerName: 'Inclusion Type',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
      // pinned: 'left',
      // lockPinned: true,
      // pivot: true,
    },
    {
      field: 'AdditionalParameter',
      filter: 'agTextColumnFilter',
      flex: 2,
    },
    {
      field: 'Icon',
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
  //   fetcher.load('/rCustomerRisk') // Adjust endpoint as necessary
  // }, [fetcher])

  // // Effect to update row data when fetcher data changes
  // useEffect(() => {
  //   if (fetcher.data) {
  //     setRowData(fetcher.data.data)
  //   }
  // }, [fetcher.data])

  return (
    <>
      <div className="flex items-center justify-center  rounded-t-lg bg-gradient-to-t from-indigo-400 via-cyan-400 to-sky-500 shadow-lg p-0.5">
        <div className=" flex items-center w-full justify-between bg-sky-50  border rounded-t-lg text-2xl text-blue-900 font-bold">
          <div className="p-2">Customers</div>
          <div className="m-2 space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-indigo-100 "
                    onClick={handleClickOpen}
                  >
                    <FilePlusIcon className="text-indigo-700 size-6 " />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div
        className="ag-theme-quartz"
        style={{ height: '100%', width: '100%' }}
      >
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
        />
        {/* <Dialog
          open={open}
          handleClose={handleClose}
          // data={formData}
          // onChange={onChange}
          // handleFormSubmit={handleFormSubmit}
        /> */}
      </div>
    </>
  )
}
