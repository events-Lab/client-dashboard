"use client";

import {
  Button,
  MarketEventCard,
  MarketProductCard,
  Stat,
  StatGrid,
  toast,
  type EventItem,
  type ProductItem,
} from "@events-lab/shared-components";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { addCartLine, eventToCartLine, productToCartLine } from "@/lib/commerce";
import { mockClientEvents, mockOrders, mockProducts } from "@/lib/catalog";

export default function HomePage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [joined, setJoined] = useState<string | null>(null);

  const topProducts = useMemo(
    () =>
      [...mockProducts]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 4),
    [],
  );

  const upcomingEvents = mockClientEvents;
  const seatsLeft = upcomingEvents.reduce(
    (sum, event) => sum + Math.max(event.capacity - (event.booked ?? 0), 0),
    0,
  );

  function handleAddProduct(product: ProductItem) {
    addCartLine(productToCartLine(product));
    toast({ title: "Added to cart", description: product.name });
    router.push("/cart");
  }

  function handleEventAction(event: EventItem) {
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
    <div className="page-enter flex flex-col gap-8">
      <section className="hero-glow relative overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-[0_20px_50px_rgba(91,33,182,0.28)]">
        <div className="float-orb pointer-events-none absolute -top-10 -right-8 size-40 rounded-full bg-accent/50 blur-2xl" />
        <div className="float-orb pointer-events-none absolute -bottom-14 left-1/4 size-36 rounded-full bg-white/20 blur-2xl [animation-delay:-1.6s]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-semibold tracking-[0.08em] text-accent-100 uppercase">
              Events Lab
            </p>
            <h1 className="m-0 mt-2 text-[34px] leading-none font-semibold tracking-tight max-[800px]:text-[28px]">
              Your summary
            </h1>
            <p className="m-0 mt-2 max-w-[36rem] text-[15px] text-white/85">
              Highest rated gear and the next sessions you can join.
            </p>
          </div>
          <Button
            type="button"
            variant="accent"
            onClick={() => router.push("/marketplace")}
          >
            Browse marketplace
          </Button>
        </div>
      </section>

      <StatGrid className="stagger">
        <Stat
          label="Upcoming events"
          value={String(upcomingEvents.length)}
          detail={`${seatsLeft} seats still open`}
        />
        <Stat
          label="Top products"
          value={String(topProducts.length)}
          detail="Highest rated gear in the shop"
        />
        <Stat
          label="Orders"
          value={String(mockOrders.length)}
          detail="Tickets and purchases on this account"
        />
      </StatGrid>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-[28px] font-semibold tracking-tight">
              Top products
            </h2>
            <p className="m-0 mt-1 text-sm text-secondary-500">
              Ranked by rating across the marketplace.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/marketplace")}
          >
            Shop all
          </Button>
        </div>
        <div className="stagger grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
          {topProducts.map((product) => (
            <MarketProductCard
              key={product.id}
              product={product}
              wishlisted={wishlist.includes(product.id)}
              onOpen={(item) =>
                router.push(`/marketplace/products/${item.id}`)
              }
              onToggleWish={(item) =>
                setWishlist((current) =>
                  current.includes(item.id)
                    ? current.filter((id) => id !== item.id)
                    : [...current, item.id],
                )
              }
              onAddToCart={handleAddProduct}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-[28px] font-semibold tracking-tight">
              Upcoming events
            </h2>
            <p className="m-0 mt-1 text-sm text-secondary-500">
              Free open play and paid sessions on the calendar.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/events")}
          >
            All events
          </Button>
        </div>
        {joined ? (
          <p
            className="m-0 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800"
            role="status"
          >
            You&apos;re in for{" "}
            {upcomingEvents.find((event) => event.id === joined)?.title}.
            Ticket confirmed — no payment needed.
          </p>
        ) : null}
        <div className="stagger grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">
          {upcomingEvents.map((event) => (
            <MarketEventCard
              key={event.id}
              event={event}
              onOpen={(item) => router.push(`/events/${item.id}`)}
              onAction={
                event.pricing === "free" && joined === event.id
                  ? undefined
                  : handleEventAction
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
