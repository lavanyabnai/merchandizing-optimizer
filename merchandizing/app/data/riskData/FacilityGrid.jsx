"use client";
import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react' // AG Grid Component
import facility from '@/app/data/riskData/FacilityData.json'
// import { Form, useFetcher } from '@remix-run/react'

export default function FacilityGrid() {
  const gridRef = useRef()
  // const fetcher = useFetcher()
  const [rowData, setRowData] = useState(facility)
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
      field: 'facility',
      headerName: 'Facility',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
    },

    {
      field: 'expenseType',
      colId: 'Expense Type',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
    },
    {
      field: 'value',
      headerName: 'value',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
      // pinned: 'left',
      // lockPinned: true,
      // pivot: true,
    },
    {
      field: 'currency',
      headerName: 'Currency',
      filter: 'agTextColumnFilter',
      flex: 2,
      // rowGroup: true,
      // hide: true,
      // pinned: 'left',
      // lockPinned: true,
      // pivot: true,
    },
    {
      field: 'timeUnit',
      headerName: 'Time Unit',
      filter: 'agTextColumnFilter',
      flex: 2,
    },
    {
      field: 'productUnit',
      headerName: 'Product Unit',
      filter: 'agTextColumnFilter',
      flex: 2,
    },
    {
      field: 'timePeriod',
      headerName: 'Time Period',
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
  //   fetcher.load('/rFacilityRisk') // Adjust endpoint as necessary
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
