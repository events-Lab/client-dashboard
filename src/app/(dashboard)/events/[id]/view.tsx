"use client";

import {
  AvailabilityBadge,
  Badge,
  Button,
  Card,
  DetailList,
  getEventAvailability,
  ImageGallery,
  mediaUrls,
  PageHeader,
  toEgpLabel,
  toast,
} from "@events-lab/shared-components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCartLine, eventToCartLine } from "@/lib/commerce";
import { getClientEvent } from "@/lib/catalog";

export function EventDetailView({ id }: { id: string }) {
  const router = useRouter();
  const event = getClientEvent(id);
  const [joined, setJoined] = useState(false);

  if (!event) {
    return (
      <div className="page-enter flex flex-col gap-6">
        <PageHeader
          eyebrow="Events"
          title="Event not found"
          description={`No event matches id “${id}”.`}
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/events")}
            >
              Back to events
            </Button>
          }
        />
      </div>
    );
  }

  const seats = getEventAvailability(event);
  const isFree = event.pricing === "free";

  function joinOrBuy() {
    if (!event || seats.soldOut) return;
    if (isFree) {
      setJoined(true);
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
        eyebrow="Event"
        title={event.title}
        description={event.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/events")}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={seats.soldOut || joined}
              onClick={joinOrBuy}
            >
              {seats.soldOut
                ? "Sold out"
                : joined
                  ? "You're in"
                  : isFree
                    ? "Join free"
                    : "Buy ticket"}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={isFree ? "info" : "success"}>
          {isFree ? "Free" : "Paid"}
        </Badge>
        {event.badgeLabel ? (
          <Badge tone="neutral">{event.badgeLabel}</Badge>
        ) : null}
        <AvailabilityBadge
          available={seats.available}
          soldOut={seats.soldOut}
          kind="seats"
        />
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-4 max-[900px]:grid-cols-1">
        <ImageGallery
          images={mediaUrls(event)}
          alt={event.title}
          emptyLabel="No images"
          aspectClassName="aspect-[16/10]"
        />
        <Card title={isFree ? "Join" : "Ticket"}>
          <div className="flex flex-col gap-3">
            <p className="m-0 text-3xl font-semibold tracking-tight">
              {isFree ? "Free" : toEgpLabel(event.priceLabel)}
            </p>
            <p className="m-0 text-sm text-secondary-600">{seats.label}</p>
            <p className="m-0 text-sm text-secondary-600">
              {seats.booked}/{seats.capacity} booked
            </p>
            {joined ? (
              <p className="m-0 text-sm text-primary-800" role="status">
                Ticket confirmed — no payment needed.
              </p>
            ) : null}
            <Button
              type="button"
              disabled={seats.soldOut || joined}
              onClick={joinOrBuy}
            >
              {seats.soldOut
                ? "Sold out"
                : joined
                  ? "You're in"
                  : isFree
                    ? "Join free"
                    : "Buy ticket"}
            </Button>
          </div>
        </Card>
      </div>

      <DetailList
        title="Event information"
        fields={[
          { label: "When", value: event.dateLabel },
          { label: "Duration", value: event.duration ?? "—" },
          { label: "Venue", value: event.venue },
          { label: "Skill level", value: event.skillLevel ?? "—" },
          {
            label: "Seats left",
            value: String(seats.available),
          },
          {
            label: "Price",
            value: isFree ? "Free" : toEgpLabel(event.priceLabel),
          },
        ]}
      />
    </div>
  );
}
