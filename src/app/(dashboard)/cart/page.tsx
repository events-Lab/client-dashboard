"use client";

import { CartSummary, type CartLine } from "@events-lab/shared-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { images } from "@/lib/catalog";
import { getCart, removeCartLine, updateCartQuantity } from "@/lib/commerce";

export default function CartPage() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    setLines(getCart());
  }, []);

  function changeQuantity(id: string, quantity: number) {
    setLines(updateCartQuantity(id, quantity));
  }

  function removeLine(id: string) {
    setLines(removeCartLine(id));
  }

  return (
    <div className="page-enter relative -mx-5 -my-8 px-5 py-8 text-[#141414]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[#f4f2ee]"
      />

      <nav aria-label="Breadcrumb" className="text-sm text-[#8d8d8d]">
        <ol className="m-0 flex list-none items-center gap-2 p-0">
          <li>
            <Link
              href="/"
              className="text-[#8d8d8d] no-underline transition hover:text-[#141414]"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li className="text-[#141414]">Cart</li>
        </ol>
      </nav>

      <h1 className="m-0 mt-5 text-[32px] font-medium tracking-[0.08em] text-[#141414] sm:text-[40px]">
        YOUR CART
      </h1>

      <div className="mt-6">
        <CartSummary
          lines={lines}
          onCheckout={() => router.push("/checkout")}
          onQuantityChange={changeQuantity}
          onRemove={removeLine}
          emptyAction={
            <div className="flex flex-wrap gap-2">
              <Link
                href="/events"
                className="inline-flex h-11 items-center rounded-full bg-[#111] px-5 text-sm font-medium text-white no-underline"
              >
                Browse events
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex h-11 items-center rounded-full border border-[#e4e1da] bg-white px-5 text-sm font-medium text-[#141414] no-underline"
              >
                Shop gear
              </Link>
            </div>
          }
        />
      </div>

      <NewsletterBanner />
    </div>
  );
}

function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setSubscribed(true);
  }

  return (
    <section className="relative mt-10 overflow-hidden rounded-[24px] bg-[#0e4a3c] text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images.sports}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#0c4538]/78" />
      <div className="relative flex flex-wrap items-center justify-between gap-8 px-6 py-8 sm:px-10 sm:py-9">
        <h2 className="m-0 text-[28px] leading-[1.12] font-bold tracking-wide uppercase sm:text-[34px]">
          <span className="block">Stay connected about our</span>
          <span className="block">latest offers</span>
        </h2>
        <form onSubmit={subscribe} className="flex w-full max-w-xs flex-col gap-3">
          <label className="relative">
            <span className="sr-only">Email address</span>
            <MailIcon />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              className="h-12 w-full rounded-full border-0 bg-white pr-4 pl-11 text-sm text-[#141414] outline-none placeholder:text-[#9a9a9a]"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-white text-sm font-medium text-[#141414] transition hover:bg-[#f6f6f6]"
          >
            {subscribed ? "You're subscribed" : "Subscribe to Newsletter"}
          </button>
        </form>
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9a9a9a]"
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
