import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export const labels = [
  {
    value: "bug",
    label: "Bug",
    color: "bg-red-100",
  },
  {
    value: "feature",
    label: "Feature",
    color: "bg-yellow-100",
  },
  {
    value: "documentation",
    label: "Documentation",
    color: "bg-green-100",
  },
];

export const statuses = [
  {
    value: "Open",
    label: "Open",
    icon: QuestionMarkCircledIcon,
  },
  {
    value: "Submitted",
    label: "Submitted",
    icon: CircleIcon,
  },
  {
    value: "In-Progress",
    label: "In Progress",
    icon: StopwatchIcon,
  },
  {
    value: "Archived",
    label: "Archived",
    icon: StopwatchIcon,
  },
  {
    value: "Completed",
    label: "Completed",
    icon: CheckCircledIcon,
  },
  {
    value: "Canceled",
    label: "Canceled",
    icon: CrossCircledIcon,
  },
];

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
];
