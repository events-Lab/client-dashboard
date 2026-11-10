"use client";

import {
  CART_PROMO_STORAGE_KEY,
  getCartTotals,
  toast,
  type CartLine,
} from "@events-lab/shared-components";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { addStoredOrder, clearCart, getCart } from "@/lib/commerce";

const PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Northwest Territories",
  "Nova Scotia",
  "Nunavut",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Yukon",
] as const;

const TAX_RATES: Record<(typeof PROVINCES)[number], number> = {
  Alberta: 0.05,
  "British Columbia": 0.12,
  Manitoba: 0.12,
  "New Brunswick": 0.15,
  "Newfoundland and Labrador": 0.15,
  "Northwest Territories": 0.05,
  "Nova Scotia": 0.15,
  Nunavut: 0.05,
  Ontario: 0.13,
  "Prince Edward Island": 0.15,
  Quebec: 0.14975,
  Saskatchewan: 0.11,
  Yukon: 0.05,
};

const STEPS = [
  ["Shipping and", "Gift Options"],
  ["Payment and", "Billing"],
  ["Review and", "Place Order"],
] as const;

type Address = {
  firstName: string;
  lastName: string;
  street: string;
  apt: string;
  showApt: boolean;
  postal: string;
  city: string;
  province: string;
};

type Receipt = {
  id: string;
  lines: CartLine[];
  promo: string;
  province: string;
};

const emptyAddress = (): Address => ({
  firstName: "",
  lastName: "",
  street: "",
  apt: "",
  showApt: false,
  postal: "",
  city: "",
  province: "",
});

const textLink =
  "cursor-pointer bg-transparent p-0 text-[14px] text-[#0b6bcb] underline underline-offset-2";

const primaryButton =
  "flex h-12 w-[240px] cursor-pointer items-center justify-center rounded-none bg-[#1c1c1c] text-[16px] font-normal text-white no-underline transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c1c1c]";

export function CheckoutView() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [promo, setPromo] = useState("");
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [phone, setPhone] = useState("");
  const [phoneHelp, setPhoneHelp] = useState(false);
  const [useBilling, setUseBilling] = useState(true);
  const [billing, setBilling] = useState<Address>(emptyAddress);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    setLines(getCart());
    setPromo(window.localStorage.getItem(CART_PROMO_STORAGE_KEY) ?? "");
    setReady(true);
  }, []);

  const priced = priceQuote(
    receipt?.lines ?? lines,
    receipt?.promo ?? promo,
    receipt?.province ?? address.province,
  );
  const visualStep = receipt ? 3 : step;

  function goToStep(next: number) {
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitShipping(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      ...(lines.length === 0 ? { form: "Your cart is empty." } : {}),
      ...validateAddress(address, "ship"),
      ...validatePhone(phone),
    };
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirst(next);
      return;
    }
    goToStep(1);
  }

  function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      ...validatePayment({ cardNumber, expiry, cvv, cardName }),
      ...(!useBilling ? validateAddress(billing, "bill") : {}),
    };
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirst(next);
      return;
    }
    goToStep(2);
  }

  function placeOrder() {
    if (lines.length === 0 || receipt) return;
    const quote = priceQuote(lines, promo, address.province);
    const id = String(1000 + Math.floor(Math.random() * 9000));
    const label =
      lines.length === 1 ? lines[0].label : `${lines.length} items (tickets and gear)`;

    addStoredOrder({
      id,
      label,
      amount: money(quote.total),
      status: "Paid",
    });
    setReceipt({ id, lines, promo, province: address.province });
    toast({ title: "Order placed", description: `Order #${id}` });
    clearCart();
    window.localStorage.removeItem(CART_PROMO_STORAGE_KEY);
    setLines([]);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setCardName("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
      <section className="order-2 px-5 py-8 sm:px-8 lg:order-1 lg:py-10">
        <div className="mx-auto w-full max-w-[36rem]">
          <h1 className="m-0 text-center text-[34px] leading-none font-extrabold tracking-[-0.045em] sm:text-[44px]">
            <Link href="/" className="text-[#1a1a1a] no-underline">
              Events Lab
            </Link>
          </h1>
          <p className="m-0 mt-3 flex items-center justify-center gap-1.5 text-[15px] text-[#5e5e5e]">
            <LockIcon />
            Checkout
          </p>

          <Stepper step={visualStep} locked={receipt !== null} onStep={goToStep} />

          {ready && lines.length === 0 && !receipt ? (
            <p className="m-0 mt-8 text-[14px] leading-6 text-[#444]">
              Your cart is empty.{" "}
              <Link href="/marketplace" className={textLink}>
                Shop the marketplace
              </Link>
            </p>
          ) : null}

          {receipt ? (
            <ThankYou id={receipt.id} address={address} phone={phone} />
          ) : step === 0 ? (
            <form className="mt-10" noValidate onSubmit={submitShipping}>
              <h2 className="m-0 text-[22px] font-semibold tracking-tight">Ship To</h2>
              <FieldError message={errors.form} />
              <div className="mt-5">
                <AddressFields
                  idPrefix="ship"
                  section="shipping"
                  value={address}
                  errors={errors}
                  onChange={(next) => {
                    setAddress(next);
                    setErrors({});
                  }}
                />
              </div>
              <div className="mt-5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <label htmlFor="ship-phone" className="text-[14px] leading-5">
                    <span className="font-bold">Phone Number</span>
                    <span className="font-normal"> required</span>
                  </label>
                  <button
                    type="button"
                    aria-expanded={phoneHelp}
                    aria-label="Why we ask for a phone number"
                    onClick={() => setPhoneHelp((open) => !open)}
                    className="grid size-4 cursor-pointer place-items-center rounded-full border border-[#8a8a8a] text-[10px] leading-none text-[#666]"
                  >
                    ?
                  </button>
                </div>
                {phoneHelp ? (
                  <p className="m-0 mb-2 text-[12px] leading-5 text-[#555]">
                    We use this number for delivery and order updates.
                  </p>
                ) : null}
                <input
                  id="ship-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  aria-invalid={errors["ship-phone"] ? true : undefined}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setErrors({});
                  }}
                  className={controlClasses(Boolean(errors["ship-phone"]))}
                />
                <FieldError message={errors["ship-phone"]} />
              </div>
              <label className="mt-5 flex items-center gap-2.5 text-[15px]">
                <input
                  type="checkbox"
                  checked={useBilling}
                  onChange={(event) => setUseBilling(event.target.checked)}
                  className="size-[18px] accent-[#0b6bcb]"
                />
                Use as billing address
              </label>
              <div className="mt-10 flex justify-center">
                <button type="submit" className={primaryButton}>
                  Next
                </button>
              </div>
            </form>
          ) : step === 1 ? (
            <form className="mt-10" noValidate onSubmit={submitPayment}>
              <h2 className="m-0 text-[22px] font-semibold tracking-tight">Payment</h2>
              <p className="m-0 mt-2 text-[13px] text-[#666]">
                Demo checkout. Your card is not charged.
              </p>
              <div className="mt-5 flex flex-col gap-5">
                <Field
                  id="card-number"
                  label="Card number"
                  required
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardNumber}
                  error={errors["card-number"]}
                  onChange={(event) => {
                    setCardNumber(formatCard(event.target.value));
                    setErrors({});
                  }}
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                  <Field
                    id="card-expiry"
                    label="Expiration"
                    required
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={expiry}
                    error={errors["card-expiry"]}
                    onChange={(event) => {
                      setExpiry(formatExpiry(event.target.value));
                      setErrors({});
                    }}
                  />
                  <Field
                    id="card-cvv"
                    label="Security code"
                    required
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cvv}
                    error={errors["card-cvv"]}
                    onChange={(event) => {
                      setCvv(event.target.value.replace(/\D/g, "").slice(0, 4));
                      setErrors({});
                    }}
                  />
                </div>
                <Field
                  id="card-name"
                  label="Name on card"
                  required
                  autoComplete="cc-name"
                  value={cardName}
                  error={errors["card-name"]}
                  onChange={(event) => {
                    setCardName(event.target.value);
                    setErrors({});
                  }}
                />
              </div>
              {useBilling ? null : (
                <div className="mt-8">
                  <h3 className="m-0 text-[22px] font-semibold tracking-tight">
                    Billing address
                  </h3>
                  <div className="mt-5">
                    <AddressFields
                      idPrefix="bill"
                      section="billing"
                      value={billing}
                      errors={errors}
                      onChange={(next) => {
                        setBilling(next);
                        setErrors({});
                      }}
                    />
                  </div>
                </div>
              )}
              <StepActions label="Next" onBack={() => goToStep(0)} />
            </form>
          ) : (
            <div className="mt-10">
              <h2 className="m-0 text-[22px] font-semibold tracking-tight">Review</h2>
              <ReviewBlock title="Ship to" onEdit={() => goToStep(0)}>
                <AddressText address={address} phone={phone} />
              </ReviewBlock>
              <ReviewBlock title="Payment" onEdit={() => goToStep(1)}>
                <p className="m-0 text-[15px] leading-6">
                  {cardName}
                  <br />
                  Card ending in {cardNumber.replace(/\D/g, "").slice(-4)}
                </p>
              </ReviewBlock>
              <ReviewBlock title="Billing" onEdit={() => goToStep(useBilling ? 0 : 1)}>
                {useBilling ? (
                  <p className="m-0 text-[15px] leading-6">Same as shipping address</p>
                ) : (
                  <AddressText address={billing} />
                )}
              </ReviewBlock>
              <StepActions label="Place Order" onBack={() => goToStep(1)} onClick={placeOrder} />
            </div>
          )}
        </div>
      </section>

      <aside className="order-1 bg-[#f0f0f0] px-5 py-8 sm:px-8 lg:order-2 lg:px-8 lg:py-10">
        <div className="bg-white px-6 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <h2 className="m-0 text-[22px] font-medium tracking-tight">Order Summary</h2>
            <Link href="/cart" className={`${textLink} mt-1 shrink-0`}>
              Edit cart
            </Link>
          </div>
          <div className="mt-7 flex flex-col gap-3.5">
            <SummaryRow label="Merchandise:" value={money(priced.merchandise)} />
            {priced.discount > 0 ? (
              <SummaryRow label="Discount:" value={money(-priced.discount)} />
            ) : null}
            <SummaryRow label="Shipping & Handling:" value={money(priced.shipping)} />
            <SummaryRow label="Tax:" value={money(priced.tax)} />
          </div>
          <div className="mt-4 border-t border-[#e4e4e4] pt-4">
            <SummaryRow label="Order Total:" value={money(priced.total)} strong />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stepper({
  step,
  locked,
  onStep,
}: {
  step: number;
  locked: boolean;
  onStep: (index: number) => void;
}) {
  return (
    <nav aria-label="Checkout progress" className="relative mt-11">
      <div
        aria-hidden="true"
        className="absolute top-[13px] right-[16.67%] left-[16.67%] h-px bg-[#d5d5d5]"
      />
      <ol className="relative m-0 grid list-none grid-cols-3 p-0">
        {STEPS.map((lines, index) => {
          const state = index < step ? "complete" : index === step ? "current" : "upcoming";
          const clickable = !locked && state === "complete";
          const body = (
            <>
              <span
                className={
                  state === "upcoming"
                    ? "relative z-10 grid size-7 place-items-center rounded-full border border-[#cfcfcf] bg-white text-[13px] text-[#b0b0b0]"
                    : "relative z-10 grid size-7 place-items-center rounded-full bg-[#1c1c1c] text-[13px] text-white"
                }
              >
                {state === "complete" ? <CheckIcon /> : index + 1}
              </span>
              <span
                className={
                  state === "upcoming"
                    ? "mt-2.5 block text-center text-[12px] leading-[1.25] text-[#9a9a9a] sm:text-[13px]"
                    : "mt-2.5 block text-center text-[12px] leading-[1.25] font-medium text-[#1c1c1c] sm:text-[13px]"
                }
              >
                {lines[0]}
                <br />
                {lines[1]}
              </span>
            </>
          );

          return (
            <li key={lines[1]} className="flex justify-center">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStep(index)}
                  className="flex cursor-pointer flex-col items-center bg-transparent p-0"
                >
                  {body}
                </button>
              ) : (
                <div
                  className="flex flex-col items-center"
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function AddressFields({
  idPrefix,
  section,
  value,
  errors,
  onChange,
}: {
  idPrefix: string;
  section: "shipping" | "billing";
  value: Address;
  errors: Record<string, string>;
  onChange: (next: Address) => void;
}) {
  function set<K extends keyof Address>(key: K, next: Address[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <Field
          id={`${idPrefix}-firstName`}
          label="First Name"
          required
          autoComplete={`${section} given-name`}
          value={value.firstName}
          error={errors[`${idPrefix}-firstName`]}
          onChange={(event) => set("firstName", event.target.value)}
        />
        <Field
          id={`${idPrefix}-lastName`}
          label="Last Name"
          required
          autoComplete={`${section} family-name`}
          value={value.lastName}
          error={errors[`${idPrefix}-lastName`]}
          onChange={(event) => set("lastName", event.target.value)}
        />
      </div>
      <div>
        <Field
          id={`${idPrefix}-street`}
          label="Street Address"
          required
          autoComplete={`${section} address-line1`}
          value={value.street}
          error={errors[`${idPrefix}-street`]}
          onChange={(event) => set("street", event.target.value)}
        />
        {value.showApt ? (
          <div className="mt-4">
            <Field
              id={`${idPrefix}-apt`}
              label="Apt, suite or other"
              autoComplete={`${section} address-line2`}
              value={value.apt}
              onChange={(event) => set("apt", event.target.value)}
            />
            <button
              type="button"
              className={`${textLink} mt-2`}
              onClick={() => onChange({ ...value, showApt: false, apt: "" })}
            >
              Remove
            </button>
          </div>
        ) : (
          <button type="button" className={`${textLink} mt-2`} onClick={() => set("showApt", true)}>
            Add apt, suite or other
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        <Field
          id={`${idPrefix}-postal`}
          label="Postal Code"
          required
          autoComplete={`${section} postal-code`}
          value={value.postal}
          error={errors[`${idPrefix}-postal`]}
          onChange={(event) => set("postal", event.target.value)}
        />
        <Field
          id={`${idPrefix}-city`}
          label="Town/City"
          required
          autoComplete={`${section} address-level2`}
          value={value.city}
          error={errors[`${idPrefix}-city`]}
          onChange={(event) => set("city", event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-province`} className="mb-1.5 block text-[14px] leading-5">
          <span className="font-bold">Province</span>
          <span className="font-normal"> required</span>
        </label>
        <div className="relative">
          <select
            id={`${idPrefix}-province`}
            autoComplete={`${section} address-level1`}
            value={value.province}
            aria-invalid={errors[`${idPrefix}-province`] ? true : undefined}
            onChange={(event) => set("province", event.target.value)}
            className={`${controlClasses(Boolean(errors[`${idPrefix}-province`]))} appearance-none bg-none pr-12`}
          >
            <option value="">Please Select</option>
            {PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
        <FieldError message={errors[`${idPrefix}-province`]} />
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] leading-5">
        <span className="font-bold">{label}</span>
        {required ? <span className="font-normal"> required</span> : null}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        className={controlClasses(Boolean(error))}
        {...props}
      />
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="m-0 mt-1 text-[12px] text-[#b42318]" role="alert">
      {message}
    </p>
  );
}

function StepActions({
  label,
  onBack,
  onClick,
}: {
  label: string;
  onBack: () => void;
  onClick?: () => void;
}) {
  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <button type={onClick ? "button" : "submit"} onClick={onClick} className={primaryButton}>
        {label}
      </button>
      <button type="button" onClick={onBack} className={textLink}>
        Back
      </button>
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 text-[15px] font-bold">{title}</h3>
        <button type="button" onClick={onEdit} className={textLink}>
          Edit
        </button>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function AddressText({ address, phone }: { address: Address; phone?: string }) {
  const lines = [
    `${address.firstName} ${address.lastName}`.trim(),
    address.street,
    address.showApt && address.apt.trim() ? address.apt.trim() : "",
    [address.city, address.province, address.postal].filter(Boolean).join(", "),
    phone ?? "",
  ].filter(Boolean);

  return (
    <p className="m-0 text-[15px] leading-6">
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          <br />
        </span>
      ))}
    </p>
  );
}

function ThankYou({ id, address, phone }: { id: string; address: Address; phone: string }) {
  return (
    <div className="mt-10">
      <h2 className="m-0 text-[22px] font-semibold tracking-tight">Thank you</h2>
      <p className="m-0 mt-3 text-[15px] leading-6">
        Order {id} is confirmed. This was a demo checkout, so no payment was taken.
      </p>
      <div className="mt-5">
        <AddressText address={address} phone={phone} />
      </div>
      <div className="mt-10 flex flex-col items-center gap-4">
        <Link href="/orders" className={primaryButton}>
          View orders
        </Link>
        <Link href="/" className={textLink}>
          Back to store
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-6 text-[15px] ${strong ? "font-semibold" : "font-normal"}`}
    >
      <span>{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

function controlClasses(invalid: boolean) {
  return `h-11 w-full rounded-none border bg-white px-3 text-[15px] text-[#1a1a1a] outline-none focus-visible:ring-1 ${
    invalid
      ? "border-[#b42318] focus-visible:ring-[#b42318]"
      : "border-[#222] focus-visible:ring-[#222]"
  }`;
}

function validateAddress(address: Address, prefix: string) {
  const errors: Record<string, string> = {};
  const required: Array<keyof Address> = ["firstName", "lastName", "street", "postal", "city"];
  for (const key of required) {
    if (!String(address[key]).trim()) errors[`${prefix}-${key}`] = "Required";
  }
  if (!address.province) errors[`${prefix}-province`] = "Select a province";
  return errors;
}

function validatePhone(phone: string) {
  if (phone.replace(/\D/g, "").length < 7) return { "ship-phone": "Enter a phone number" };
  return {};
}

function validatePayment(payment: {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
}) {
  const errors: Record<string, string> = {};
  if (payment.cardNumber.replace(/\D/g, "").length < 13) {
    errors["card-number"] = "Enter a card number";
  }
  if (!expiryValid(payment.expiry)) errors["card-expiry"] = "Enter a valid expiration date";
  if (!/^\d{3,4}$/.test(payment.cvv)) errors["card-cvv"] = "Enter a security code";
  if (!payment.cardName.trim()) errors["card-name"] = "Enter the name on the card";
  return errors;
}

function expiryValid(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  return new Date(year, month, 1) > new Date();
}

function formatCard(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function priceQuote(lines: CartLine[], promo: string, province: string) {
  const totals = getCartTotals(lines, promo);
  const rate = TAX_RATES[province as keyof typeof TAX_RATES] ?? 0;
  const taxable = Math.max(totals.subtotal - totals.discount + totals.delivery, 0);
  const tax = roundMoney(taxable * rate);
  const total = roundMoney(totals.total + tax);
  return {
    merchandise: totals.subtotal,
    discount: totals.discount,
    shipping: totals.delivery,
    tax,
    total,
  };
}

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

function money(amount: number) {
  const body = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-EGP ${body}` : `EGP ${body}`;
}

function focusFirst(errors: Record<string, string>) {
  for (const id of Object.keys(errors)) {
    const node = document.getElementById(id);
    if (node) {
      node.focus();
      return;
    }
  }
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="text-[#6a6a6a]">
      <rect x="5" y="11" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[#1c1c1c]"
    >
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
