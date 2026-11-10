import { Card, PageHeader } from "@events-lab/shared-components";
import { AccountForm } from "@/components/account/account-form";

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
