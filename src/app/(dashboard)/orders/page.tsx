"use client";

import {
  OrderCard,
  PageHeader,
  type OrderItem,
} from "@events-lab/shared-components";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStoredToken, useGetOrdersQuery } from "@/lib/api";

export default function OrdersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(getStoredToken());
    setReady(true);
  }, []);

  const { data: orders = [], isLoading, isError } = useGetOrdersQuery(
    undefined,
    { skip: !token },
  );

  if (!ready) {
    return <p className="m-0 text-sm text-secondary-500">Loading…</p>;
  }

  if (!token) {
    return (
      <div className="page-enter flex flex-col gap-6">
        <PageHeader
          eyebrow="Billing"
          title="Orders"
          description="Tickets and marketplace purchases on this account."
        />
        <p className="m-0 text-sm text-secondary-600">
          Sign in to view your orders.{" "}
          <Link href="/login" className="text-primary underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <p className="m-0 text-sm text-secondary-500">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="m-0 text-sm text-secondary-500" role="alert">
        Could not load orders. Please try again.
      </p>
    );
  }

  const cards: OrderItem[] = orders.map((order) => ({
    id: order.id,
    label: order.label,
    amount: order.amount,
    status: order.status,
  }));

  return (
    <div className="page-enter flex flex-col gap-6">
      <PageHeader
        eyebrow="Billing"
        title="Orders"
        description="Tickets and marketplace purchases on this account."
      />
      {cards.length === 0 ? (
        <p className="m-0 text-sm text-secondary-500">No orders yet.</p>
      ) : (
        <div className="stagger grid gap-4">
          {cards.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
