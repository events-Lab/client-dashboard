import { Card, PageHeader } from "@events-lab/shared-components";
import { AccountForm } from "@/components/account/account-form";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function AccountPage() {
  return (
    <div className="page-enter flex max-w-xl flex-col gap-6">
      <PageHeader
        eyebrow="Profile"
        title="Account"
        description="Contact details the organizer uses for this account."
      />
      <Card title="Profile">
        <AccountForm />
      </Card>
    </div>
  );
}
