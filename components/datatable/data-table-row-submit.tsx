// import { DotsHorizontalIcon } from "@radix-ui/react-icons";
// import { useFetcher } from "@remix-run/react";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowSubmit<TData>({}: DataTableRowActionsProps<TData>) {
  // const task = taskSchema.parse(row.original);
  // const fetcher = useFetcher();
  // console.log("selected row", row);
  // console.log("row id selected", row.getIsSelected().valueOf)
  // console.log("task", task);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <input
          defaultValue={row.id}
          // aria-label="First name"
          name="id"
          value={row.getIsSelected() ? row.id : null}
          // type="number"
          // placeholder="First"
          hidden
        // /> */}
        {/* // <Form method="post"> */}
        <Button
          className="bg-blue-900 hover:bg-blue-800"
          // disabled={
          //   row.getIsSelected()
          //     ? row.original.Status === "Open"
          //       ? false
          //       : true
          //     : true
          // }
          // name="intent"
          // value="optimize"
          type="submit"
          // onClick={() =>
          //   fetcher.submit(
          //     { scenario_id: row.original.scenario_id, intent: "optimize" },
          //     { method: "post" },
          //   )
          // }
        >
          Submit
          <span className="sr-only">Open menu</span>
        </Button>
        {/* </Form> */}
        {/* <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button> */}
      </DropdownMenuTrigger>
      {/* <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent> */}
    </DropdownMenu>
  );
}
