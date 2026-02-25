'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Actions } from './actions';

// Define the type for your scenario data
export type Scenario = {
  id: number;
  name: string;
  description: string | null;
  scenarioType: string;
  parameters: {
    ignoreRoutes: boolean;
    demandVariationType: string;
    searchType: string;
    bestSolutions: string;
    optimizationTime: string;
    mipGap: string;
    threads: string;
    problemType: string;
    unitType: string;
    distanceUnit: string;
    currency: string;
  };
  status: string;
  progress: string;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
};

export const columns: ColumnDef<Scenario>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Net ID
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">NET-{row.getValue('id')}</div>;
    },
  },
 
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return <div>{description || '-'}</div>;
    },
  },
  {
    accessorKey: 'scenarioType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Scenario Type
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'Completed' ? 'bg-green-100 text-green-800' : 
          status === 'Running' ? 'bg-blue-100 text-blue-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
  },
  {
    accessorKey: 'ignoreRoutes',
    header: 'Ignore Routes',
  },
  {
    accessorKey: 'demandType',
    header: 'Demand Type',
  },
  {
    accessorKey: 'searchType',
    header: 'Search Type',
  },
  {
    accessorKey: 'bestSolutions',
    header: 'Best Solutions',
  },
  {
    accessorKey: 'timeLimitSec',
    header: 'Time Limit',
  },
  {
    accessorKey: 'mipGap',
    header: 'MIP Gap',
  },
  {
    accessorKey: 'threads',
    header: 'Threads',
  },
  {
    accessorKey: 'problemType',
    header: 'Problem Type',
  },
  {
    accessorKey: 'unitType',
    header: 'Unit Type',
  },
  {
    accessorKey: 'distanceType',
    header: 'Distance Type',
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
  },
  {
    accessorKey: 'solutionPool',
    header: 'Solution Pool',
  },
  {
    accessorKey: 'objectiveValue',
    header: 'Objective Value',
  },
  {
    accessorKey: 'solveTimeSec',
    header: 'Solve Time',
  },
  {
    accessorKey: 'iterations',
    header: 'Iterations',
  },
  {
    accessorKey: 'gap',
    header: 'Gap',
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated At
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const updatedAt = row.getValue('updatedAt') as string;
      return new Date(updatedAt).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <Actions id={row.original.id} />,
  },
];