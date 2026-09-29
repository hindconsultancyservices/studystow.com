"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  LogOut,
  Settings,
  ShoppingCart,
  UserCircle,
} from "lucide-react";

function getInitials(name?: string | null) {
  if (!name?.trim()) {
    return "A";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "A";
}

export default function AdminProfile() {
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setOpen(false);

      await signOut({
        callbackUrl: "/admin/login",
      });
    } catch (error) {
      console.error("Admin logout error:", error);
      setLoggingOut(false);
    }
  }

  const user = session?.user;

  const name =
    user?.name?.trim() || "Admin";

  const email =
    user?.email?.trim() || "Administrator";

  const initials = getInitials(user?.name);

  return (
    <div
      ref={profileRef}
      className="relative"
    >
      {/* Profile Button */}
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100 disabled:cursor-wait"
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-semibold text-white">
          {status === "loading" ? (
            <UserCircle className="h-5 w-5" />
          ) : (
            initials
          )}
        </div>

        {/* Name + Email */}
        <div className="hidden max-w-[180px] text-left sm:block">
          <p className="truncate text-sm font-semibold text-slate-900">
            {status === "loading"
              ? "Loading..."
              : name}
          </p>

          <p className="truncate text-xs text-slate-500">
            {status === "loading"
              ? "Please wait"
              : email}
          </p>
        </div>

        {/* Arrow */}
        <ChevronDown
          className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          {/* Profile Information */}
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {email}
                </p>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <Link
            href="/admin/settings?section=profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Settings className="h-4 w-4 shrink-0" />

            <span>Profile Settings</span>
          </Link>

          {/* Store */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />

            <span>View Store</span>
          </Link>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4 shrink-0" />

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}