"use client";

import { Card, LoginForm, PageHeader } from "@events-lab/shared-components";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="page-enter flex flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title="Sign in"
        description="Demo login — any email and password will continue."
      />
      <div className="max-w-md">
        <Card title="Login">
          <LoginForm
            onSubmit={async () => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("events-lab-auth", "demo");
              }
              router.push("/");
            }}
          />
        </Card>
      </div>
    </div>
  );
}
