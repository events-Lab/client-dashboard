"use client";

import {
  Card,
  LoginForm,
  PageHeader,
  toast,
  type LoginFormValues,
} from "@events-lab/shared-components";
import { useRouter } from "next/navigation";
import { setStoredAuth, useLoginMutation } from "@/lib/api";

function loginErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: unknown }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const record = data as { error?: unknown; message?: unknown };
      if (typeof record.error === "string" && record.error.trim()) {
        return record.error;
      }
      if (typeof record.message === "string" && record.message.trim()) {
        return record.message;
      }
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Invalid credentials";
}

export default function LoginPage() {
  const router = useRouter();
  const [login] = useLoginMutation();

  async function handleSubmit(values: LoginFormValues) {
    try {
      const result = await login({
        email: values.email,
        password: values.password,
      }).unwrap();
      setStoredAuth(result.token, result.user);
      router.push("/");
    } catch (err) {
      toast({ title: "Sign in failed", description: loginErrorMessage(err) });
    }
  }

  return (
    <div className="page-enter flex flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title="Sign in"
        description="Demo customer: customer@eventslab.com / customer123"
      />
      <div className="max-w-md">
        <Card title="Login">
          <LoginForm onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
