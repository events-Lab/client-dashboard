"use client";

import { formatEgp, type CartLine } from "@events-lab/shared-components";

const CART_KEY = "events-lab-cart";
const ORDERS_KEY = "events-lab-orders";

export type StoredOrder = {
  id: string;
  label: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCart(): CartLine[] {
  return readJson<CartLine[]>(CART_KEY, []);
}

export function setCart(lines: CartLine[]) {
  writeJson(CART_KEY, lines);
}

function clampQuantity(quantity: number, maxQuantity?: number) {
  const next = Math.max(quantity, 0);
  if (maxQuantity == null) return next;
  return Math.min(next, maxQuantity);
}

export function addCartLine(line: CartLine) {
  if (line.quantity <= 0) return;
  const current = getCart();
  const existing = current.find((item) => item.id === line.id);
  if (existing) {
    const maxQuantity = line.maxQuantity ?? existing.maxQuantity;
    setCart(
      current.map((item) =>
        item.id === line.id
          ? {
              ...item,
              ...line,
              maxQuantity,
              quantity: clampQuantity(
                item.quantity + line.quantity,
                maxQuantity,
              ),
            }
          : item,
      ),
    );
    return;
  }
  setCart([
    ...current,
    {
      ...line,
      quantity: clampQuantity(line.quantity, line.maxQuantity),
    },
  ]);
}

export function clearCart() {
  setCart([]);
}

export function updateCartQuantity(id: string, quantity: number) {
  const next = getCart().map((item) =>
    item.id === id
      ? {
          ...item,
          quantity: Math.max(
            1,
            item.maxQuantity != null
              ? Math.min(quantity, item.maxQuantity)
              : quantity,
          ),
        }
      : item,
  );
  setCart(next);
  return next;
}

export function removeCartLine(id: string) {
  const next = getCart().filter((item) => item.id !== id);
  setCart(next);
  return next;
}

export function getStoredOrders(): StoredOrder[] {
  return readJson<StoredOrder[]>(ORDERS_KEY, []);
}

export function addStoredOrder(order: StoredOrder) {
  const current = getStoredOrders();
  setStoredOrders([order, ...current]);
}

export function setStoredOrders(orders: StoredOrder[]) {
  writeJson(ORDERS_KEY, orders);
}

export function formatSubtotal(lines: CartLine[]): string {
  const total = lines.reduce((sum, line) => {
    const amount = Number(line.priceLabel.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(amount)) return sum;
    return sum + amount * line.quantity;
  }, 0);
  return formatEgp(total);
}
