"use client";

import {
  Button,
  CategoryCard,
  MarketEventCard,
  MarketProductCard,
  TextField,
  toast,
  type EventItem,
  type ProductItem,
} from "@events-lab/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { addCartLine, eventToCartLine, productToCartLine } from "@/lib/commerce";
import {
  marketplaceCategories,
  marketplaceCategoryFilters,
  mockClientEvents,
  mockProducts,
  type MarketplaceCategory,
} from "@/lib/catalog";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ??
    "All") as MarketplaceCategory;
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<MarketplaceCategory>(
    marketplaceCategoryFilters.includes(initialCategory)
      ? initialCategory
      : "All",
  );
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [joined, setJoined] = useState<string | null>(null);

  const normalized = query.trim().toLowerCase();

  const events = useMemo(() => {
    if (category !== "All" && category !== "Events") return [];
    return mockClientEvents.filter((event) => {
      if (!normalized) return true;
      return (
        event.title.toLowerCase().includes(normalized) ||
        event.venue.toLowerCase().includes(normalized) ||
        (event.description?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [category, normalized]);

  const products = useMemo(() => {
    if (category === "Events") return [];
    return mockProducts.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (!normalized) return true;
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.blurb.toLowerCase().includes(normalized) ||
        (product.brand?.toLowerCase().includes(normalized) ?? false) ||
        (product.category?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [category, normalized]);

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

  function handleAddProduct(product: ProductItem) {
    addCartLine(productToCartLine(product));
    toast({ title: "Added to cart", description: product.name });
    router.push("/cart");
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
            {marketplaceCategoryFilters.map((item) => (
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
                const next = selected.label as MarketplaceCategory;
                setCategory(
                  marketplaceCategoryFilters.includes(next) ? next : "All",
                );
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
              {mockClientEvents.find((event) => event.id === joined)?.title}.
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
