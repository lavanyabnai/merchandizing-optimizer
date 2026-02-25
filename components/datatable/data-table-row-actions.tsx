import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

// import { taskSchema } from "@/app/data/ui/schema";
// import { Form, Link, useFetcher } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // const task = taskSchema.parse(row.original);
  // const fetcher = useFetcher();
  // console.log(`inside row action`,row.original);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          disabled={!row.getIsSelected()}
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px]">
        <Link
          href={""}
          // to={`/snop/scenario/${row.original.Customer_1}`}
          // hidden={row.original.Type !== 'Open'}
        >
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </Link>
        <DropdownMenuItem asChild>
          <button
            type="submit"
            name="intent"
            value="duplicate"
            className="w-full"
            // onClick={() =>
            //   fetcher.submit(
            //     { Customer_1: row.original.Customer_1, intent: 'duplicate' },
            //     { method: 'post' }
            //   )
            // }
          >
            Make a Copy
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="submit"
            name="intent"
            value="archive"
            className="w-full"
            // hidden={row.original.Status === 'Open'}
            // onClick={() =>
            //   fetcher.submit(
            //     { scenario_id: row.original.scenario_id, intent: 'archive' },
            //     { method: 'post' }
            //   )
            // }
          >
            Archive
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="submit"
            name="intent"
            value="delete"
            className="w-full"
            // hidden={row.original.Status !== 'Open'}
            // onClick={() =>
            //   fetcher.submit(
            //     { scenario_id: row.original.scenario_id, intent: 'delete' },
            //     { method: 'post' }
            //   )
            // }
          >
            Delete
          </button>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={""}            // herf={`/snop/scenario/${row.original.scenario_id}/analyze`}
            // hidden={row.original.Status !== 'Open'}
          >
            <DropdownMenuItem>Analyze</DropdownMenuItem>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
