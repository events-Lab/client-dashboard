"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearStoredAuth,
  getStoredUser,
  type AuthUser,
} from "@/lib/api";

export function AuthControls() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  function handleLogout() {
    clearStoredAuth();
    setUser(null);
    router.push("/login");
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full px-3 py-2 text-sm font-semibold text-primary-100 no-underline transition duration-200 hover:bg-white/10 hover:text-white"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="hidden max-w-[10rem] truncate px-2 text-sm font-medium text-primary-200 sm:inline">
        {user.name}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-2 text-sm font-semibold text-primary-100 transition duration-200 hover:bg-white/10 hover:text-white"
      >
        Logout
      </button>
    </div>
  );
}
