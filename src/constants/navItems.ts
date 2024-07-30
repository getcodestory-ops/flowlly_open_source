import { NavItem } from "@/types/navItems";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Schedule",
    href: "/dashboard/user",
    icon: "user",
    label: "user",
  },
  {
    title: "Agent",
    href: "/dashboard/employee",
    icon: "employee",
    label: "employee",
  },
  {
    title: "Documents",
    href: "/dashboard/profile",
    icon: "profile",
    label: "profile",
  },
  {
    title: "Project",
    href: "/project",
    icon: "kanban",
    label: "kanban",
  },
  {
    title: "Team",
    href: "/",
    icon: "login",
    label: "login",
  },
];
