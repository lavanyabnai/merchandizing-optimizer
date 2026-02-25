import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons"


export const dot = [
  {
    value: 'Low',
    label: 'Low',
    icon: QuestionMarkCircledIcon,
    fill: 'fill-green-500',
    color: 'bg-green-100',
    textClr: 'text-rose-800',
  },

  {
    value: 'Medium',
    label: 'Medium',
    icon: CircleIcon,
    fill: 'fill-yellow-500',
    color: 'bg-yellow-500',
    textClr: 'text-rose-800',
  },
  {
    value: 'High',
    label: 'High',
    icon: CheckCircledIcon,
    fill: 'fill-red-500',
    color: 'bg-rose-100',
    textClr: 'text-rose-800',
  },
]
export const labels = [
  {
    value: 'Inventory',
    label: 'Inventory',
    color: 'bg-fuchsia-100',
    textClr: 'text-fuchsia-700',
  },
  {
    value: 'Logistics',
    label: 'Logistics',
    color: 'bg-indigo-100',
    textClr: 'text-indigo-700',
  },
  {
    value: 'Demand Planning',
    label: 'Demand Planning',
    color: 'bg-violet-200',
    textClr: 'text-violet-800',
  },

  {
    value: 'Warehousing',
    label: 'Warehousing',
    color: 'bg-gray-100',
    textClr: 'text-gray-700',
  },
  {
    value: 'Sourcing',
    label: 'Sourcing',
    color: 'bg-sky-100',
    textClr: 'text-sky-700',
  },
]

export const statuses = [
  {
    value: 'Delivered',
    label: 'Delivered',
    icon: QuestionMarkCircledIcon,
    textClr: 'text-indigo-500',
  },
  {
    value: 'Pending',
    label: 'Pending',
    icon: CircleIcon,
    textClr: 'text-orange-500',
  },
  {
    value: 'Shipped',
    label: 'Shipped',
    icon: CheckCircledIcon,
    textClr: 'text-green-800',
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: StopwatchIcon,
    textClr: 'text-orange-400',
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CrossCircledIcon,
    textClr: 'text-slate-500',
  },
]

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
]
