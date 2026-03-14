import type { UserRole } from "@/lib/roles";

export type NavItem = {
  label: string;
  href: string;
  roles: UserRole[];
  description?: string;
};

export const navItems: NavItem[] = [
  { label: "Physician Dashboard", href: "/physician", roles: ["physician"] },
  { label: "CDI Queue", href: "/cdi", roles: ["cdi"] },
  { label: "Coder Tasks", href: "/coder", roles: ["coder"] },
  { label: "Templates", href: "/templates", roles: ["admin"] },
  {
    label: "Revenue Impact",
    href: "/analytics/revenue",
    roles: ["admin"],
  },
  { label: "Compliance", href: "/compliance/demo", roles: ["admin"] },
  { label: "Audit", href: "/audit", roles: ["admin"] },
];

export { roleLabels } from "@/lib/roles";
