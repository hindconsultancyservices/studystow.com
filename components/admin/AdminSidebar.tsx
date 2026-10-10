
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChevronRight,
  Command,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Mail,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Users,
  X,
} from "lucide-react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";
import type { PermissionModule } from "@/lib/permissions";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavigationItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  module?: PermissionModule;
  ownerOnly?: boolean;
};

const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    title: "Books",
    href: "/admin/books",
    icon: BookOpen,
    module: "books",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    module: "orders",
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    module: "customers",
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Boxes,
    module: "inventory",
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
    module: "categories",
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Package,
    module: "coupons",
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: FileText,
    module: "pages",
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    module: "reviews",
  },
  {
    title: "Contact Messages",
    href: "/admin/contact",
    icon: Mail,
    module: "contact",
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileBarChart,
    module: "reports",
  },
  {
    title: "Roles & Permissions",
    href: "/admin/roles-permissions",
    icon: ShieldCheck,
    module: "adminUsers",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: Activity,
    module: "auditLogs",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    module: "settings",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { loading, isOwner, canView } = useAdminPermissions();

  const closeSidebar = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
          searchRef.current?.blur();
        } else if (open) {
          closeSidebar();
        }
      }

      if (
        event.key === "/" &&
        !isTyping &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, [searchQuery, open, closeSidebar]);

  const visible = useCallback(
    (item: NavigationItem) => {
      if (item.ownerOnly) return isOwner;
      if (!item.module) return true;
      if (isOwner) return true;

      return canView(item.module);
    },
    [isOwner, canView],
  );

  const { primaryItems, systemItems } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filterItems = (items: NavigationItem[]) =>
      items.filter(
        (item) =>
          visible(item) &&
          (!query ||
            item.title.toLowerCase().includes(query) ||
            item.href.toLowerCase().includes(query)),
      );

    return {
      primaryItems: filterItems(navigation),
      systemItems: filterItems(secondaryNavigation),
    };
  }, [searchQuery, visible]);

  const hasResults =
    primaryItems.length > 0 || systemItems.length > 0;

  const renderItems = (items: NavigationItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActivePath(pathname, item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={closeSidebar}
          aria-current={active ? "page" : undefined}
          title={item.title}
          className={[
            "admin-nav-link group relative flex min-h-[43px]",
            "items-center gap-3 overflow-hidden rounded-xl",
            "px-3 py-2 text-[13px] font-medium",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-white/60",
            active
              ? "admin-nav-active bg-white text-slate-950"
              : "text-slate-400 hover:bg-white/[0.065] hover:text-white",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "absolute bottom-2.5 left-0 top-2.5 w-[3px]",
              "rounded-r-full transition-all duration-200",
              active
                ? "bg-slate-950"
                : "bg-transparent group-hover:bg-white/30",
            ].join(" ")}
          />

          <span
            className={[
              "flex h-[31px] w-[31px] shrink-0 items-center",
              "justify-center rounded-[9px] transition-all duration-200",
              active
                ? "bg-slate-100 text-slate-950"
                : "text-slate-400 group-hover:bg-white/[0.07] group-hover:text-white",
            ].join(" ")}
          >
            <Icon size={17} strokeWidth={1.8} />
          </span>

          <span className="min-w-0 flex-1 truncate">
            {item.title}
          </span>

          <ChevronRight
            aria-hidden="true"
            size={14}
            className={[
              "shrink-0 transition-all duration-200",
              active
                ? "translate-x-0 opacity-60"
                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60",
            ].join(" ")}
          />
        </Link>
      );
    });

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[3px] lg:hidden"
        />
      )}

      <aside
        aria-label="StudyStow administration sidebar"
        className={[
          "admin-sidebar fixed inset-y-0 left-0 z-50",
          "flex w-[264px] flex-col overflow-hidden",
          "border-r border-white/[0.075] bg-[#0b0c0f] text-white",
          "shadow-[12px_0_45px_rgba(0,0,0,0.18)]",
          "transition-transform duration-300",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="relative flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.075] px-4">
          <Link
            href="/admin"
            onClick={closeSidebar}
            className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_3px_12px_rgba(0,0,0,0.2)] transition-transform duration-200 group-hover:scale-[1.04]">
              <img
                src="/images/logo/logo.png"
                alt="StudyStow"
                className="h-full w-full object-contain p-1"
              />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-[-0.035em] text-white">
                StudyStow<span className="text-slate-400">.com</span>
              </span>

              <span className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Administration
                </span>
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close admin menu"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* Navigation search */}
        <div className="shrink-0 px-3 pb-4 pt-4">
          <label
            htmlFor="admin-sidebar-search"
            className="sr-only"
          >
            Search admin navigation
          </label>

          <div className="group flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.085] bg-white/[0.035] px-3 transition-all duration-200 focus-within:border-white/25 focus-within:bg-white/[0.065] focus-within:ring-2 focus-within:ring-white/[0.06]">
            <Search
              size={15}
              className="shrink-0 text-slate-500 transition-colors group-focus-within:text-slate-300"
            />

            <input
              ref={searchRef}
              id="admin-sidebar-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Find a page..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600 [&::-webkit-search-cancel-button]:hidden"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchRef.current?.focus();
                }}
                aria-label="Clear navigation search"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-white/10 hover:text-white"
              >
                <X size={12} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => searchRef.current?.focus()}
                aria-label="Focus navigation search"
                className="flex shrink-0 items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.035] px-1.5 py-1 text-[9px] text-slate-500 transition-colors hover:text-slate-300"
              >
                <Command size={10} />
                <span>K</span>
              </button>
            )}
          </div>

          <p className="mt-2 px-1 text-[9px] text-slate-600">
            Quick navigation <span className="px-1">·</span> Ctrl K or /
          </p>
        </div>

        {/* Scrollable navigation */}
        <nav
          aria-label="Admin navigation"
          className="admin-sidebar-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-5 pt-1"
        >
          {!loading && (
            <>
              {primaryItems.length > 0 && (
                <section aria-label="Store management">
                  <div className="mb-2 flex items-center justify-between px-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-slate-500">
                      Store Management
                    </p>
                    <span className="text-[9px] tabular-nums text-slate-600">
                      {primaryItems.length.toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {renderItems(primaryItems)}
                  </div>
                </section>
              )}

              {systemItems.length > 0 && (
                <section
                  aria-label="System tools"
                  className={primaryItems.length > 0 ? "mt-6" : ""}
                >
                  <div className="mb-2 flex items-center gap-3 px-3">
                    <span className="h-px flex-1 bg-white/[0.075]" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-slate-500">
                      System
                    </p>
                    <span className="h-px w-5 bg-white/[0.075]" />
                  </div>

                  <div className="space-y-1">
                    {renderItems(systemItems)}
                  </div>
                </section>
              )}

              {!hasResults && (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-500">
                    <Search size={17} />
                  </span>
                  <p className="mt-3 text-xs font-medium text-slate-300">
                    No pages found
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                    Try a different search term.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-[11px] font-medium text-slate-400 underline underline-offset-4 hover:text-white"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </>
          )}

          {loading && (
            <div className="space-y-2 px-1 pt-1" aria-label="Loading navigation">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[43px] items-center gap-3 rounded-xl px-3"
                >
                  <span className="h-[31px] w-[31px] shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
                  <span
                    className="h-2.5 animate-pulse rounded-full bg-white/[0.06]"
                    style={{ width: `${42 + (index % 3) * 15}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Fixed bottom area */}
        <div className="shrink-0 border-t border-white/[0.075] bg-[#0b0c0f] p-3">
          <Link
            href="/"
            onClick={closeSidebar}
            className="group flex min-h-[43px] items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-[13px] font-medium text-slate-400 transition-all duration-200 hover:border-white/[0.07] hover:bg-white/[0.045] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-[9px] text-slate-400 transition-colors group-hover:bg-white/[0.07] group-hover:text-white">
              <Store size={17} strokeWidth={1.8} />
            </span>

            <span className="flex-1">View Store</span>

            <ArrowUpRight
              size={15}
              className="text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
            />
          </Link>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.055] px-2 pt-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                StudyStow
              </p>
              <p className="mt-1 text-[9px] text-slate-700">
                Administration workspace
              </p>
            </div>

            <span className="rounded-md border border-white/[0.08] px-2 py-1 text-[9px] font-medium tracking-wide text-slate-500">
              ADMIN
            </span>
          </div>
        </div>

        {/* Slim premium scrollbar */}
        <style jsx>{`
          .admin-sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
            scrollbar-gutter: stable;
          }

          .admin-sidebar-scroll:hover,
          .admin-sidebar-scroll:focus-within {
            scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
          }

          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 5px;
          }

          .admin-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
            margin-block: 5px;
          }

          .admin-sidebar-scroll::-webkit-scrollbar-thumb {
            border: 1px solid transparent;
            border-radius: 999px;
            background: transparent;
            background-clip: padding-box;
            transition: background-color 180ms ease;
          }

          .admin-sidebar-scroll:hover::-webkit-scrollbar-thumb,
          .admin-sidebar-scroll:focus-within::-webkit-scrollbar-thumb {
            background-color: rgba(148, 163, 184, 0.4);
          }

          .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(226, 232, 240, 0.75);
          }

          .admin-sidebar-scroll::-webkit-scrollbar-corner {
            background: transparent;
          }

          .admin-nav-link {
            -webkit-tap-highlight-color: transparent;
          }

          @media (hover: none) {
            .admin-sidebar-scroll {
              scrollbar-color: rgba(148, 163, 184, 0.32) transparent;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .admin-sidebar *,
            .admin-sidebar *::before,
            .admin-sidebar *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
