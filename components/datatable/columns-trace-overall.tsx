import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header-inci'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {  statuses } from '@/app/data/network/traceOverall/data'
import { Task } from '@/app/data/columndata/schema'


import Link from 'next/link'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    
  }).format(date)
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: 'id',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Exception Id" />
  //   ),
  //   cell: ({ row }) => <div className="w-[100px]">{row.getValue('id')}</div>,
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order ID" />
    ),
    // cell: ({ row }) => {
    //   const label = labels.find((label) => label.value === row.original.label)

    //   return (
    //     <div className="flex space-x-2 w-[130px]">
    //       {label ? (
    //         <Badge
    //           className={`rounded-md ${label.color} ${label.textClr}`}
    //           variant="outline"
    //         >
    //           {label.label}
    //         </Badge>
    //       ) : null}
    //     </div>
    //   )
    // },
  },
  {
    accessorKey: 'externalId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="External Id" />
    ),
    // cell: ({ row }) => {
    //   return (
    //     <div className="flex space-x-2">
    //       <span className="max-w-[500px] truncate font-medium ">
    //         {row.getValue('sku')}
    //       </span>
    //     </div>
    //   )
    // },
  },
  {
    accessorKey: 'seller',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seller" />
    ),
    // cell: ({ row }) => {
    //   return (
    //     <div className="flex space-x-2">
    //       <span className="max-w-[500px] truncate  ">{row.getValue('dc')}</span>
    //     </div>
    //   )
    // },
  },
  {
    accessorKey: 'item',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item" />
    ),
    // cell: ({ row }) => {
    //   return (
    //     <div className="flex space-x-2">
    //       <span className="max-w-[500px] truncate  ">
    //         {row.getValue('store')}
    //       </span>
    //     </div>
    //   )
    // },
  },

  {
    accessorKey: 'quantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    // cell: ({ row }) => {
    //   // console.log(row.getValue('status'))
    //   const status = statuses.find(
    //     (status) => status.value === row.getValue('status')
    //   )
    //   if (!status) {
    //     return null
    //   }

    //   return (
    //     <div className={`flex w-[150px] items-center ${status.textClr}`}>
    //       {status.icon ? (
    //         <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
    //       ) : null}
    //       <span className="text-base font-semibold">{status.label}</span>
    //     </div>
    //   )
    // },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Status" />
    ),
    cell: ({ row }) => {
      // console.log(row.getValue('status'))
      const status = statuses.find(
        (status) => status.value === row.getValue('orderStatus')
      )
      if (!status) {
        return null
      }

      return (
        <div className={`flex w-[150px] items-center ${status.textClr}`}>
          {status.icon ? (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : null}
          <span className="text-base font-semibold">{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Options" />
    ),
    cell: ({ row }) => {
      console.log(row.original)
      return (
        <Link
       href='/track/order/[orderId]'
          // to={`/track/order/${row.original.orderId}`}
          className="flex space-x-2"
        >
          <Button className='bg-yellow-50 border border-yellow-300 text-yellow-700 hover:bg-yellow-100'>Open Order</Button>
        </Link>
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <Badge className='bg-sky-100 text-sky-600'>{formatDate(row.getValue('dueDate'))}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'promisedItem',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Promised Item" />
    ),
    // cell: ({ row }) => {
    //   const status = dot.find(
    //     (status) => status.value === row.getValue('severity')
    //   )

    //   if (!status) {
    //     return null
    //   }

    //   return (
    //     <div className="flex w-[80px] items-center">
    //       {status && (
    //         <svg
    //           className={`${status.fill} mr-2 h-2 w-2`}
    //           viewBox="0 0 6 6"
    //           aria-hidden="true"
    //         >
    //           <circle cx={3} cy={3} r={3} />
    //         </svg>
    //       )}
    //       {status && status.label ? <span>{status.label}</span> : null}
    //     </div>
    //   )
    // },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id))
    // },
  },
  {
    accessorKey: 'shipFrom',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ship From" />
    ),
  },
  {
    accessorKey: 'promisedQty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Promised Qty" />
    ),
  },
  {
    accessorKey: 'promisedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Promised Date" />
    ),
    cell: ({ row }) => {
      // Extract the date string from the row data
      const fullDate = row.getValue('dueDate')
      // Create a new Date object
      const dateObject = new Date(fullDate as string)
      // Format the date as MM-DD-YY
      const formattedDate = `${(dateObject.getMonth() + 1).toString().padStart(2, '0')}-${dateObject.getDate().toString().padStart(2, '0')}-${dateObject.getFullYear().toString().slice(-2)}`
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">{formattedDate}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'dcLocation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DC Location" />
    ),
  },

  {
    accessorKey: 'trackingNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tracking Number" />
    ),
  },
  {
    accessorKey: 'receivedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Received Date" />
    ),
    cell: ({ row }) => {
      // Extract the date string from the row data
      const fullDate = row.getValue('dueDate')
      // Create a new Date object
      const dateObject = new Date(fullDate as string)
      // Format the date as MM-DD-YY
      const formattedDate = `${(dateObject.getMonth() + 1).toString().padStart(2, '0')}-${dateObject.getDate().toString().padStart(2, '0')}-${dateObject.getFullYear().toString().slice(-2)}`
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">{formattedDate}</span>
        </div>
      )
    },
  },

  {
    accessorKey: 'dcInventory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dc Inventory" />
    ),
  },
  {
    accessorKey: 'storeInventory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Store Inventory" />
    ),
  },
  {
    accessorKey: 'supplierInventory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier Inventory" />
    ),
  },
]
