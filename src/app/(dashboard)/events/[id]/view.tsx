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
import {
  AuthRequiredError,
  ensureCustomerAuth,
  useGetEventQuery,
  useJoinEventMutation,
} from "@/lib/api";
import { addCartLine, eventToCartLine } from "@/lib/commerce";

export function EventDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { data: event, isLoading, isError } = useGetEventQuery(id);
  const [joinEvent] = useJoinEventMutation();
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  if (isLoading) {
    return <p className="m-0 text-sm text-secondary-500">Loading…</p>;
  }

  if (isError || !event) {
    return (
      <div className="page-enter flex flex-col gap-6">
        <PageHeader
          eyebrow="Events"
          title="Event not found"
          description={
            isError
              ? "Could not load this event. Please try again."
              : `No event matches id “${id}”.`
          }
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

  async function joinOrBuy() {
    if (!event || seats.soldOut || joining) return;
    if (isFree) {
      setJoining(true);
      try {
        ensureCustomerAuth();
        await joinEvent({ id: event.id }).unwrap();
        setJoined(true);
        toast({ title: "You're in", description: event.title });
      } catch (err) {
        if (err instanceof AuthRequiredError) {
          toast({ title: "Sign in required", description: err.message });
          router.push("/login");
          return;
        }
        const message =
          err instanceof Error ? err.message : "Could not join event";
        toast({ title: "Join failed", description: message });
      } finally {
        setJoining(false);
      }
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
              disabled={seats.soldOut || joined || joining}
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
              disabled={seats.soldOut || joined || joining}
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
