export {
  baseApi,
  toMarketplaceCategories,
  useCreateOrderMutation,
  useGetCategoriesQuery,
  useGetEventQuery,
  useGetEventsQuery,
  useGetOrdersQuery,
  useGetProductQuery,
  useGetProductsQuery,
  useJoinEventMutation,
  useLoginMutation,
} from "./baseApi";
export type {
  CategoryRecord,
  LoginResponse,
  OrderLineInput,
  OrderRecord,
} from "./baseApi";
export {
  API_BASE_URL,
  AUTH_TOKEN_KEY,
  clearStoredAuth,
  DEMO_CUSTOMER,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
} from "./config";
export type { AuthUser } from "./config";
export { AuthRequiredError, ensureCustomerAuth } from "./ensureAuth";
