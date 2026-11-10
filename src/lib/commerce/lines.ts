import {
  mediaUrls,
  toEgpLabel,
  type CartLine,
  type EventItem,
  type ProductItem,
} from "@events-lab/shared-components";

export function productToCartLine(
  product: ProductItem,
  options?: { maxQuantity?: number; quantity?: number },
): CartLine {
  const specs = [
    product.category
      ? { label: "Category", value: product.category }
      : null,
    product.brand ? { label: "Brand", value: product.brand } : null,
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  const maxQuantity = options?.maxQuantity ?? product.stock;
  const requested = Math.max(options?.quantity ?? 1, 1);
  const quantity =
    maxQuantity != null ? Math.min(requested, maxQuantity) : requested;

  return {
    id: `product-${product.id}`,
    label: product.name,
    detail: product.blurb,
    priceLabel: toEgpLabel(product.priceLabel),
    quantity,
    kind: "product",
    sourceId: product.id,
    maxQuantity,
    imageUrl: mediaUrls(product)[0],
    specs,
  };
}

export function eventToCartLine(event: EventItem): CartLine {
  const seats = Math.max(event.capacity - (event.booked ?? 0), 0);

  return {
    id: `ticket-${event.id}`,
    label: event.title,
    detail: `${event.dateLabel} · ${event.venue}`,
    priceLabel: toEgpLabel(event.priceLabel),
    quantity: 1,
    kind: "event",
    sourceId: event.id,
    maxQuantity: seats > 0 ? seats : undefined,
    imageUrl: mediaUrls(event)[0],
    specs: [
      { label: "When", value: event.dateLabel },
      { label: "Where", value: event.venue },
    ],
  };
}
