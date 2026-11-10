import { StorefrontShell } from "@events-lab/shared-components";
import type { ReactNode } from "react";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
