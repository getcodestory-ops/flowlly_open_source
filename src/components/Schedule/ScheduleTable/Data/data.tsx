import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
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
    value: "On Schedule",
    label: "On Schedule",
    icon: HeartFilledIcon,
  },
  {
    value: "Pending",
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
