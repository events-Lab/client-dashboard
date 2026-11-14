"use client";

import {
  Button,
  CategoryCard,
  MarketEventCard,
  MarketProductCard,
  TextField,
  toast,
  type CategoryItem,
  type EventItem,
  type ProductItem,
} from "@events-lab/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  AuthRequiredError,
  ensureCustomerAuth,
  toMarketplaceCategories,
  useGetCategoriesQuery,
  useGetEventsQuery,
  useGetProductsQuery,
  useJoinEventMutation,
} from "@/lib/api";
import { images } from "@/lib/catalog";
import { addCartLine, eventToCartLine, productToCartLine } from "@/lib/commerce";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "All";
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [joined, setJoined] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const {
    data: eventsData = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useGetEventsQuery();
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsQuery();
  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategoriesQuery();
  const [joinEvent] = useJoinEventMutation();

  const marketplaceCategories = useMemo(() => {
    const fromApi = toMarketplaceCategories(categoriesData);
    const eventsCard: CategoryItem = {
      id: "events",
      label: "Events",
      href: "/marketplace?category=Events",
      imageUrl: eventsData[0]?.imageUrl ?? images.events,
      images: eventsData[0]?.imageUrl
        ? [eventsData[0].imageUrl]
        : [images.events],
      ctaLabel: "Book Now",
    };
    return [eventsCard, ...fromApi.filter((item) => item.label !== "Events")];
  }, [categoriesData, eventsData]);

  const categoryFilters = useMemo(() => {
    const names = new Set<string>(["All", "Events"]);
    for (const product of productsData) {
      if (product.category) names.add(product.category);
    }
    for (const item of marketplaceCategories) {
      names.add(item.label);
    }
    return Array.from(names);
  }, [productsData, marketplaceCategories]);

  const normalized = query.trim().toLowerCase();

  const events = useMemo(() => {
    if (category !== "All" && category !== "Events") return [];
    return eventsData.filter((event) => {
      if (!normalized) return true;
      return (
        event.title.toLowerCase().includes(normalized) ||
        event.venue.toLowerCase().includes(normalized) ||
        (event.description?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [category, normalized, eventsData]);

  const products = useMemo(() => {
    if (category === "Events") return [];
    return productsData.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (!normalized) return true;
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.blurb.toLowerCase().includes(normalized) ||
        (product.brand?.toLowerCase().includes(normalized) ?? false) ||
        (product.category?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [category, normalized, productsData]);

  async function handleEventAction(event: EventItem) {
    if (event.pricing === "free") {
      if (joining) return;
      setJoining(true);
      try {
        ensureCustomerAuth();
        await joinEvent({ id: event.id }).unwrap();
        setJoined(event.id);
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

  function handleAddProduct(product: ProductItem) {
    addCartLine(productToCartLine(product));
    toast({ title: "Added to cart", description: product.name });
    router.push("/cart");
  }

  if (eventsLoading || productsLoading || categoriesLoading) {
    return <p className="m-0 text-sm text-secondary-500">Loading…</p>;
  }

  if (eventsError || productsError || categoriesError) {
    return (
      <p className="m-0 text-sm text-secondary-500" role="alert">
        Could not load marketplace. Please try again.
      </p>
    );
  }

  return (
    <div className="page-enter flex flex-col gap-8">
      <section className="rounded-[24px] border border-primary-100 bg-primary-50 px-5 py-6 shadow-[0_12px_30px_rgba(16,42,67,0.06)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-semibold tracking-[0.08em] text-primary uppercase">
              Marketplace
            </p>
            <h1 className="m-0 mt-1 text-[32px] leading-none font-semibold tracking-tight">
              Shop events & gear
            </h1>
          </div>
          <Button type="button" variant="secondary" onClick={() => router.push("/cart")}>
            Cart / Checkout
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <TextField
            label="Search marketplace"
            placeholder="Search events, rackets, balls, brands…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((item) => (
              <Button
                key={item}
                type="button"
                variant={category === item ? "primary" : "secondary"}
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-[24px] font-semibold tracking-tight">
          Shop by Category
        </h2>
        <div className="stagger grid grid-cols-6 gap-4 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2">
          {marketplaceCategories.map((item) => (
            <CategoryCard
              key={item.id}
              category={item}
              onOpen={(selected) => {
                setCategory(selected.label);
              }}
            />
          ))}
        </div>
      </section>

      {(category === "All" || category === "Events") && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="m-0 text-[24px] font-semibold tracking-tight">
              Events
            </h2>
            <span className="text-xs font-semibold text-secondary-500">
              {events.length} results
            </span>
          </div>
          {joined ? (
            <p
              className="m-0 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800"
              role="status"
            >
              You&apos;re in for{" "}
              {eventsData.find((event) => event.id === joined)?.title}.
              Free ticket confirmed.
            </p>
          ) : null}
          {events.length === 0 ? (
            <p className="m-0 text-sm text-secondary-500">No events match.</p>
          ) : (
            <div className="stagger grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">
              {events.map((event) => (
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
          )}
        </section>
      )}

      {category !== "Events" && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="m-0 text-[24px] font-semibold tracking-tight">
              Products
            </h2>
            <span className="text-xs font-semibold text-secondary-500">
              {products.length} results
            </span>
          </div>
          {products.length === 0 ? (
            <p className="m-0 text-sm text-secondary-500">No products match.</p>
          ) : (
            <div className="stagger grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
              {products.map((product) => (
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
          )}
        </section>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<p className="m-0 text-sm text-secondary-500">Loading…</p>}>
      <MarketplaceContent />
    </Suspense>
  );
}
