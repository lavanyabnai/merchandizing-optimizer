import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header-inci'

import { Checkbox } from '@/components/ui/checkbox'


export const columns: ColumnDef<unknown, any>[] = [
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
    accessorKey: 'dateDue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Due" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue('dateDue')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue('description')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'assignedTo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AssignedTo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium ">
            {row.getValue('assignedTo')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate  ">
            {row.getValue('status')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'dateCreated',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Created" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate  ">
            {row.getValue('dateCreated')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'meeting',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Meeting" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate  ">
            {row.getValue('meeting')}
          </span>
        </div>
      )
    },
  },
]
