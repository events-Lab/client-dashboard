import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CategoryItem,
  EventItem,
  OrderItem,
  ProductItem,
} from "@events-lab/shared-components";
import { API_BASE_URL, getStoredToken } from "./config";

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "customer";
  };
};

export type OrderLineInput = {
  kind: "event" | "product";
  sourceId: string;
  label?: string;
  quantity: number;
  unitPriceLabel?: string;
};

export type OrderRecord = OrderItem & {
  userId?: string;
  lines: Array<{
    kind: "event" | "product";
    sourceId: string;
    label: string;
    quantity: number;
    unitPriceLabel: string;
  }>;
  createdAt?: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images?: string[];
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

/** Map admin category records to storefront CategoryItem cards. */
export function toMarketplaceCategories(
  categories: CategoryRecord[],
): CategoryItem[] {
  return categories
    .filter((category) => category.status === "active")
    .map((category) => ({
      id: category.id,
      label: category.name,
      href: `/marketplace?category=${encodeURIComponent(category.name)}`,
      imageUrl: category.imageUrl,
      images: category.images,
      ctaLabel: category.name === "Events" ? "Book Now" : undefined,
    }));
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = getStoredToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Events", "Products", "Categories", "Orders"],
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),

    getEvents: build.query<EventItem[], void>({
      query: () => "/events",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Events" as const, id })),
              { type: "Events", id: "LIST" },
            ]
          : [{ type: "Events", id: "LIST" }],
    }),
    getEvent: build.query<EventItem, string>({
      query: (id) => `/events/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Events", id }],
    }),
    joinEvent: build.mutation<
      EventItem,
      { id: string; name?: string; email?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/events/${id}/join`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Events", id },
        { type: "Events", id: "LIST" },
      ],
    }),

    getProducts: build.query<ProductItem[], void>({
      query: () => "/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Products" as const, id })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    getProduct: build.query<ProductItem, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Products", id }],
    }),

    getCategories: build.query<CategoryRecord[], void>({
      query: () => "/categories",
      providesTags: [{ type: "Categories", id: "LIST" }],
    }),

    getOrders: build.query<OrderRecord[], void>({
      query: () => "/orders",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),
    createOrder: build.mutation<
      OrderRecord,
      {
        lines: OrderLineInput[];
        attendeeName?: string;
        attendeeEmail?: string;
      }
    >({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: [
        { type: "Orders", id: "LIST" },
        { type: "Products", id: "LIST" },
        { type: "Events", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetEventsQuery,
  useGetEventQuery,
  useJoinEventMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetOrdersQuery,
  useCreateOrderMutation,
} = baseApi;
