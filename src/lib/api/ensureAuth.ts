import { getStoredToken } from "./config";

export class AuthRequiredError extends Error {
  constructor(message = "Please sign in to continue") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export function ensureCustomerAuth() {
  if (getStoredToken()) return;
  throw new AuthRequiredError();
}
