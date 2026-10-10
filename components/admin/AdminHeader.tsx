"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

function getInitials(name?: string | null) {
  if (!name?.trim()) return "A";

  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A"
  );
}

function getPageTitle(pathname: string) {
  if (pathname === "/admin") return "Dashboard";

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "Dashboard";

  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { theme, toggleTheme, hydrated } = useAdminTheme();

  const darkMode = theme === "dark";

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const user = session?.user;
  const adminName = user?.name?.trim() || "Admin";
  const adminEmail = user?.email?.trim() || "Administrator";
  const initials = getInitials(user?.name);
  const pageTitle = getPageTitle(pathname);

  const closeMenus = useCallback(() => {
    setProfileOpen(false);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenus();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setProfileOpen(false);
        setSearchOpen((current) => !current);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenus]);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setProfileOpen(false);
    setSearchOpen(false);
    setLogoutError("");
  }, [pathname]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");
    closeMenus();

    try {
      await signOut({
        callbackUrl: "/admin/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Admin logout failed:", error);
      setLoggingOut(false);
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    window.location.href = `/admin/search?q=${encodeURIComponent(query)}`;
    setSearchOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 bg-white/95 text-slate-950 backdrop-blur-xl transition-colors duration-200 dark:border-white/10 dark:bg-slate-950/95 dark:text-slate-100">
        <div className="flex h-full items-center gap-3 px-3 sm:px-5 lg:px-7">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open admin navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page context */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-slate-400 sm:inline">
                StudyStow
              </span>

              <span className="hidden text-xs text-slate-300 dark:text-slate-600 sm:inline">
                /
              </span>

              <h1 className="truncate text-sm font-bold tracking-tight text-slate-950 dark:text-white sm:text-base">
                {pageTitle}
              </h1>
            </div>

            <div className="mt-0.5 hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Administration workspace
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Search */}
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setSearchOpen((current) => !current);
              }}
              aria-label="Open admin search"
              className="group flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-2.5 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/5 sm:px-3"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-xs font-medium md:inline">
                Search
              </span>
              <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 lg:inline">
                Ctrl K
              </kbd>
            </button>

            {/* Store shortcut */}
            <Link
              href="/"
              aria-label="View storefront"
              title="View Store"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" />
            </Link>

            {/* Profile */}
            <div ref={profileRef} className="relative ml-1">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setProfileOpen((current) => !current);
                  setLogoutError("");
                }}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Open administrator profile"
                className={`flex items-center gap-2 rounded-xl border p-1.5 pr-2 transition sm:gap-2.5 sm:pr-3 ${
                  profileOpen
                    ? "border-slate-300 bg-slate-50 dark:border-white/20 dark:bg-white/10"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/5"
                }`}
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white ring-1 ring-slate-900/10 dark:bg-white dark:text-slate-950 dark:ring-white/20">
                  {status === "loading" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
                  ) : (
                    initials
                  )}

                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950"
                    aria-label="Session indicator"
                    title="Signed-in session"
                  />
                </div>

                <div className="hidden max-w-[135px] text-left sm:block">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                    {status === "loading" ? "Loading..." : adminName}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                    Admin workspace
                  </p>
                </div>

                <ChevronDown
                  className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div
                  role="menu"
                  aria-label="Administrator menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[min(320px,calc(100vw-24px))] max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain origin-top-right rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_18px_55px_-15px_rgba(15,23,42,0.22)] animate-in fade-in slide-in-from-top-2 duration-150 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/40"

                >
                  {/* Identity */}
                  <div className="bg-slate-950 p-4 text-white dark:bg-black">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-bold">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {adminName}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-300">
                          {adminEmail}
                        </p>
                      </div>

                      <ShieldCheck className="h-5 w-5 shrink-0 text-white/70" />
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                        <Activity className="h-3.5 w-3.5" />
                        Signed-in session
                      </span>
                      <span className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-semibold">
                        StudyStow
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Workspace
                    </p>

                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="flex-1 font-medium">Dashboard</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/admin/settings"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="flex-1 font-medium">Settings</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="flex-1 font-medium">View Store</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>

                    <div className="my-2 border-t border-slate-100 dark:border-white/10" />

                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Preferences
                    </p>

                    {/* Global appearance */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={toggleTheme}
                      disabled={!hydrated}
                      aria-label={
                        darkMode
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                      aria-pressed={darkMode}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      {darkMode ? (
                        <Moon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                      ) : (
                        <Sun className="h-4 w-4 text-slate-500" />
                      )}

                      <span className="flex-1 text-left font-medium">
                        {hydrated
                          ? darkMode
                            ? "Dark mode enabled"
                            : "Appearance"
                          : "Loading appearance..."}
                      </span>

                      <span
                        className={`relative h-5 w-9 rounded-full transition ${
                          darkMode
                            ? "bg-slate-950 dark:bg-white"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full shadow-sm transition-all ${
                            darkMode
                              ? "left-[18px] bg-white dark:bg-slate-950"
                              : "left-0.5 bg-white"
                          }`}
                        />
                      </span>
                    </button>

                    <div className="my-2 border-t border-slate-100 dark:border-white/10" />

                    {logoutError && (
                      <p
                        role="alert"
                        className="mx-2 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      >
                        {logoutError}
                      </p>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"

                    >
                      <LogOut className="h-4 w-4" />
                      <span className="flex-1 text-left">
                        {loggingOut ? "Signing out..." : "Sign out"}
                      </span>
                      {!loggingOut && (
                        <ArrowDownRight className="h-4 w-4 opacity-60" />
                      )}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                    <p className="text-center text-[10px] text-slate-400">
                      StudyStow Administration
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global search panel */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/35 px-3 pt-[15vh] backdrop-blur-sm sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSearchOpen(false);
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 px-4 py-4">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />

                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search admin workspace..."
                  aria-label="Search admin workspace"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter a search term to continue
                </p>

                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
