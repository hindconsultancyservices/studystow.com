"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
} from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

function getInitials(name?: string | null) {
  if (!name) return "A";

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "A";
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const { data: session, status } = useSession();

  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * Close profile dropdown when clicking outside.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
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

  /*
   * Close dropdown with Escape key.
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
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
      setProfileOpen(false);

      await signOut({
        callbackUrl: "/admin/login",
      });
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  const user = session?.user;

  const adminName =
    user?.name?.trim() || "Admin";

  const adminEmail =
    user?.email?.trim() || "Administrator";

  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Mobile Menu */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open admin menu"
        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Header Title */}
      <div className="hidden lg:block">
        <p className="text-sm font-medium text-slate-500">
          Administration
        </p>

        <p className="text-xs text-slate-400">
          StudyStow Admin Panel
        </p>
      </div>

      {/* Right Side */}
      <div
        ref={profileRef}
        className="relative ml-auto"
      >
        {/* Profile Button */}
        <button
          type="button"
          onClick={() =>
            setProfileOpen((current) => !current)
          }
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-semibold text-white">
            {status === "loading" ? (
              <CircleUserRound className="h-5 w-5" />
            ) : (
              initials
            )}
          </div>

          {/* User Information */}
          <div className="hidden max-w-[180px] text-left sm:block">
            <p className="truncate text-sm font-semibold text-slate-900">
              {status === "loading"
                ? "Loading..."
                : adminName}
            </p>

            <p className="truncate text-xs text-slate-500">
              {status === "loading"
                ? "Please wait"
                : adminEmail}
            </p>
          </div>

          <ChevronDown
            className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            {/* Profile Information */}
            <div className="border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {adminName}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {adminEmail}
                  </p>

                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Administrator
                  </p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <Link
              href="/admin/settings"
              onClick={() => setProfileOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Settings</span>
            </Link>

            {/* Store */}
            <Link
              href="/"
              onClick={() => setProfileOpen(false)}
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
    </header>
  );
}