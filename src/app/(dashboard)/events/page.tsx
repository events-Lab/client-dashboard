"use client";

import {
  MarketEventCard,
  PageHeader,
  toast,
  type EventItem,
} from "@events-lab/shared-components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCartLine, eventToCartLine } from "@/lib/commerce";
import { mockClientEvents } from "@/lib/catalog";

export default function EventsPage() {
  const router = useRouter();
  const [joined, setJoined] = useState<string | null>(null);

  function handleAction(event: EventItem) {
    if (event.pricing === "free") {
      setJoined(event.id);
      toast({ title: "You're in", description: event.title });
      return;
    }

    addCartLine(eventToCartLine(event));
    toast({ title: "Ticket added", description: event.title });
    router.push("/cart");
  }

  return (
    <div className="page-enter flex flex-col gap-6">
      <PageHeader
        eyebrow="Play"
        title="Events"
        description="Join free open play or buy a ticket for paid sessions."
      />
      {joined ? (
        <p
          className="m-0 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800"
          role="status"
        >
          You&apos;re in for{" "}
          {mockClientEvents.find((event) => event.id === joined)?.title}. Ticket
          confirmed — no payment needed.
        </p>
      ) : null}
      <div className="stagger grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">
        {mockClientEvents.map((event) => (
          <MarketEventCard
            key={event.id}
            event={event}
            onOpen={(item) => router.push(`/events/${item.id}`)}
            onAction={
              event.pricing === "free" && joined === event.id
                ? undefined
                : handleAction
            }
          />
        ))}
      </div>
    </div>
  );
}
