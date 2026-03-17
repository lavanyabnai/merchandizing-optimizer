import { Row } from '@tanstack/react-table'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableRowActionsButtonProps<TData> {
  row: Row<TData>
}

export function DataTableRowActionsButton<TData>({}: DataTableRowActionsButtonProps<TData>) {

  return (
    <Select>
      <SelectTrigger className="w-[150px] border-none">
        <SelectValue placeholder="Open Exception" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="todo">Open Exception</SelectItem>
          <SelectItem value="in progress">In Progress</SelectItem>
          <SelectItem value="done">Resolved</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    //  <Popover open={open} onOpenChange={setOpen}>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant="outline"
    //       role="combobox"
    //       aria-expanded={open}
    //       className="w-[200px] justify-between"
    //     >
    //       {value
    //         ? frameworks.find((framework) => framework.value === value)?.label
    //         : "Select framework..."}
    //       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    //     </Button>
    //   </PopoverTrigger>
    //   <PopoverContent className="w-[200px] p-0">
    //     <Command>
    //       <CommandInput placeholder="Search framework..." />
    //       <CommandEmpty>No framework found.</CommandEmpty>
    //       <CommandGroup>
    //         {/* {frameworks.map((framework) => (
    //           <CommandItem
    //             key={framework.value}
    //             value={framework.value}
    //             onSelect={(currentValue) => {
    //               setValue(currentValue === value ? "" : currentValue)
    //               setOpen(false)
    //             }}
    //           >
    //             <Check
    //               className={cn(
    //                 "mr-2 h-4 w-4",
    //                 value === framework.value ? "opacity-100" : "opacity-0"
    //               )}
    //             />
    //             {framework.label}
    //           </CommandItem>

    //         ))} */}

    //                   <CommandItem key="Insight" value="Insight" onSelect={(currentValue) => {
    //                     setValue(currentValue === value ? "" : currentValue)
    //                     setOpen(false)
    //                   }}>
    //                     Insight
    //                   </CommandItem>
    //             </CommandGroup>
    //     </Command>
    //   </PopoverContent>
    // </Popover>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button
    //       variant="ghost"
    //       className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
    //     >
    //       <DotsHorizontalIcon className="h-4 w-4" />
    //       <span className="sr-only">Open menu</span>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end" className="w-[160px]">
    //     <DropdownMenuItem>Edit</DropdownMenuItem>
    //     <DropdownMenuItem>Make a copy</DropdownMenuItem>
    //     <DropdownMenuItem>Favorite</DropdownMenuItem>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuSub>
    //       <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
    //       <DropdownMenuSubContent>
    //         <DropdownMenuRadioGroup value={task.label}>
    //           {labels.map((label) => (
    //             <DropdownMenuRadioItem key={label.value} value={label.value}>
    //               {label.label}
    //             </DropdownMenuRadioItem>
    //           ))}
    //         </DropdownMenuRadioGroup>
    //       </DropdownMenuSubContent>
    //     </DropdownMenuSub>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem>
    //       Delete
    //       <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}
