import { StorefrontShell } from "@events-lab/shared-components";
import type { ReactNode } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/events", label: "Events" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <StorefrontShell product="Events Lab" nav={nav}>
      {children}
    </StorefrontShell>
  );
}
