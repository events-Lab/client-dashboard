"use client";

import {
  OrderCard,
  PageHeader,
  type OrderItem,
} from "@events-lab/shared-components";
import { useEffect, useState } from "react";
import { mockOrders } from "@/lib/catalog";
import { getStoredOrders } from "@/lib/commerce";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>(mockOrders);

  useEffect(() => {
    const stored = getStoredOrders();
    if (stored.length > 0) {
      setOrders([...stored, ...mockOrders]);
    }
  }, []);

  return (
    <div className="page-enter flex flex-col gap-6">
      <PageHeader
        eyebrow="Billing"
        title="Orders"
        description="Tickets and marketplace purchases on this account."
      />
      <div className="stagger grid gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
