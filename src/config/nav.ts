import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Sparkles,
  Building2,
  ShieldCheck,
  UsersRound,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Omit to allow all signed-in roles. */
  roles?: UserRole[];
  /** Match nested routes as active (e.g. /invoices/123). */
  matchPrefix?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { title: "Invoices", to: "/invoices", icon: FileText, matchPrefix: true },
      { title: "Clients", to: "/clients", icon: Users, matchPrefix: true },
      { title: "Payments", to: "/payments", icon: CreditCard },
      { title: "Reports", to: "/reports", icon: BarChart3 },
      { title: "Assistant", to: "/assistant", icon: Sparkles },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        title: "Tenants",
        to: "/admin/tenants",
        icon: Building2,
        roles: ["SUPER_ADMIN"],
        matchPrefix: true,
      },
      {
        title: "Users",
        to: "/admin/users",
        icon: UsersRound,
        roles: ["SUPER_ADMIN"],
        matchPrefix: true,
      },
      {
        title: "Roles & Permissions",
        to: "/admin/roles",
        icon: ShieldCheck,
        roles: ["SUPER_ADMIN"],
        matchPrefix: true,
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        title: "Settings",
        to: "/settings",
        icon: Settings,
        roles: ["TENANT_ADMIN", "SUPER_ADMIN"],
        matchPrefix: true,
      },
    ],
  },
];

export function visibleGroups(role: UserRole | undefined): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || (role && item.roles.includes(role)),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  TENANT_ADMIN: "Tenant Admin",
  ACCOUNTANT: "Accountant",
  VIEWER: "Viewer",
};
