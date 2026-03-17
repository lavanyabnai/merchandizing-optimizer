"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import {  statuses } from "@/components/snop/scenario/data"
import { Task } from "@/components/snop/scenario/schema"
import { DataTableColumnHeader } from "@/components/snop/scenario/data-table-column-header"
import { DataTableRowActions } from "@/components/snop/scenario/data-table-row-actions"
import { DataTableRowSubmit } from "@/components/snop/scenario/data-table-row-submit";

const formatDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

export const columns: ColumnDef<Task>[] = [
  //  {
  //   id: "select",
  //   header: () => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
  {
    accessorKey: "scenario_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scenario Id" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px]">{row.getValue("scenario_id")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      return (
        <span className="w-[50px] truncate font-medium ">
          {row.getValue("description")}
        </span>
      );
    },
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
    cell: ({ row }) => {
      // const label = labels.find((label) => label.value === row.original.label);

      return (
        <div>
          <Badge variant="outline">
            {formatDate(row.getValue("CreatedAt"))}
          </Badge>
        
        </div>
      );
    },
  },
  {
    accessorKey: "UpdatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated Date" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          {" "}
          <Badge variant="outline">
            {formatDate(row.getValue("UpdatedAt"))}
          </Badge>
         
        </div>
      );
    },
  },

  {
    accessorKey: "module",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Module" />
    ),
    cell: ({ row }) => {
      return (
        <div>
          <Badge variant="outline" className="bg-green-100 text-green-900">
            {row.getValue("module")}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "Status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("Status"),
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: "submit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submit to Optimizer" />
    ),
    cell: ({ row }) => <DataTableRowSubmit row={row} />,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
