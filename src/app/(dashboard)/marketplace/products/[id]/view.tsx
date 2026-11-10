"use client";

import {
  AvailabilityBadge,
  Badge,
  Button,
  Card,
  DetailList,
  getProductAvailability,
  ImageGallery,
  mediaUrls,
  PageHeader,
  toEgpLabel,
  toast,
} from "@events-lab/shared-components";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addCartLine, getCart, productToCartLine } from "@/lib/commerce";
import { getClientProduct } from "@/lib/catalog";

export function MarketplaceProductDetailView({ id }: { id: string }) {
  const router = useRouter();
  const product = getClientProduct(id);
  const stock = product
    ? getProductAvailability(product)
    : { available: 0, soldOut: true, label: "Out of stock" };
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(0);
  const remaining = Math.max(stock.available - inCart, 0);
  const atLimit = !stock.soldOut && remaining <= 0;

  useEffect(() => {
    const line = getCart().find((item) => item.id === `product-${id}`);
    setInCart(line?.quantity ?? 0);
  }, [id]);

  useEffect(() => {
    setQuantity((current) => {
      if (remaining <= 0) return 1;
      return Math.min(Math.max(current, 1), remaining);
    });
  }, [remaining]);

  if (!product) {
    return (
      <div className="page-enter flex flex-col gap-6">
        <PageHeader
          eyebrow="Marketplace"
          title="Product not found"
          description={`No product matches id “${id}”.`}
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/marketplace")}
            >
              Back to marketplace
            </Button>
          }
        />
      </div>
    );
  }

  function addToCart(next: "cart" | "checkout") {
    if (!product || stock.soldOut || remaining <= 0) return;
    const nextQuantity = Math.min(quantity, remaining);
    addCartLine(
      productToCartLine(product, {
        maxQuantity: stock.available,
        quantity: nextQuantity,
      }),
    );
    toast({
      title: "Added to cart",
      description:
        nextQuantity === 1 ? product.name : `${nextQuantity} × ${product.name}`,
    });
    router.push(next === "checkout" ? "/checkout" : "/cart");
  }

  return (
    <div className="page-enter flex flex-col gap-6">
      <div className="flex items-start gap-1">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.push("/marketplace")}
          className="mt-6 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-secondary-800 transition hover:bg-secondary-100"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 6 9 12l6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <PageHeader
          eyebrow="Product"
          title={product.name}
          description={product.blurb}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {product.category ? (
          <Badge tone="neutral">{product.category}</Badge>
        ) : null}
        {product.brand ? <Badge tone="info">{product.brand}</Badge> : null}
        <Badge tone="success">{toEgpLabel(product.priceLabel)}</Badge>
        <AvailabilityBadge
          available={stock.available}
          soldOut={stock.soldOut}
          kind="items"
        />
      </div>

      <div className="grid grid-cols-[1.1fr_1fr] gap-4 max-[900px]:grid-cols-1">
        <ImageGallery
          images={mediaUrls(product)}
          alt={product.name}
          emptyLabel={product.imageLabel ?? "No images"}
          aspectClassName="aspect-[4/5]"
        />
        <Card title="Buy box">
          <div className="flex flex-col gap-3">
            <p className="m-0 text-3xl font-semibold tracking-tight">
              {toEgpLabel(product.priceLabel)}
            </p>
            {product.rating != null ? (
              <p className="m-0 text-sm font-semibold text-secondary-700">
                ★ {product.rating.toFixed(1)}
                {product.reviewCount != null
                  ? ` · ${product.reviewCount} ratings`
                  : ""}
              </p>
            ) : null}
            <p className="m-0 text-sm text-secondary-600">{stock.label}</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-secondary-800">
                Quantity
              </span>
              <div className="inline-flex items-center rounded-full border border-secondary-200 bg-white px-1 py-1">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={stock.soldOut || atLimit || quantity <= 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  className="grid size-8 cursor-pointer place-items-center rounded-full text-lg leading-none text-secondary-900 transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm font-medium">
                  {atLimit ? 0 : quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={
                    stock.soldOut || atLimit || quantity >= remaining
                  }
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(remaining, current + 1),
                    )
                  }
                  className="grid size-8 cursor-pointer place-items-center rounded-full text-lg leading-none text-secondary-900 transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>
            <p className="m-0 text-sm text-secondary-600">
              {stock.soldOut
                ? "This item is out of stock."
                : atLimit
                  ? `Your cart already has all ${stock.available} available.`
                  : inCart > 0
                    ? `${inCart} in your cart. You can add ${remaining} more.`
                    : `You can add up to ${stock.available}.`}
            </p>
            <Button
              type="button"
              disabled={stock.soldOut || atLimit}
              onClick={() => addToCart("cart")}
            >
              {stock.soldOut
                ? "Out of stock"
                : atLimit
                  ? "Limit reached"
                  : quantity > 1
                    ? `Add ${quantity} to cart`
                    : "Add to cart"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={stock.soldOut || atLimit}
              onClick={() => addToCart("checkout")}
            >
              Buy now
            </Button>
          </div>
        </Card>
      </div>

      <DetailList
        title="Product information"
        fields={[
          { label: "Brand", value: product.brand ?? "—" },
          { label: "Category", value: product.category ?? "—" },
          { label: "SKU", value: product.sku ?? product.id },
          { label: "Items available", value: String(stock.available) },
          { label: "Price", value: toEgpLabel(product.priceLabel) },
          {
            label: "Reviews",
            value:
              product.reviewCount != null
                ? String(product.reviewCount)
                : "—",
          },
        ]}
      />

      <Card title="About this item">
        <p className="m-0 text-sm leading-normal text-secondary-700">
          {product.description ?? product.blurb}
        </p>
      </Card>
    </div>
  );
}
