import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  StopwatchIcon,
  TimerIcon,
  HeartFilledIcon,
  ArchiveIcon,
} from "@radix-ui/react-icons";

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
];

export const statuses = [
  {
    value: "At Risk",
    label: "At Risk",
    icon: TimerIcon,
  },
  {
    value: "In Progress",
    label: "In Progress",
    icon: HeartFilledIcon,
  },
  {
    value: "pending",
    label: "Pending",
    icon: StopwatchIcon,
  },
  {
    value: "Archived",
    label: "Archived",
    icon: ArchiveIcon,
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
