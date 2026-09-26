"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Boxes,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Users,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Books",
    href: "/admin/books",
    icon: BookOpen,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Package,
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: FileText,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
];

const secondaryNavigation = [
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* ================================================== */}
      {/* SIDEBAR */}
      {/* ================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-slate-800 bg-slate-950 text-white
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <Link
            href="/admin"
            onClick={closeMobileMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
              <img
                src="/images/logo/logo.png"
                alt="StudyStow"
                className="h-full w-full object-contain p-1"
              />
            </div>

            <div>
              <div className="text-base font-bold">
                StudyStow
              </div>

              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Admin Panel
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Store Management
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="my-5 border-t border-slate-800" />

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            System
          </p>

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Store Link */}
        <div className="border-t border-slate-800 p-3">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            View Store
          </Link>
        </div>
      </aside>

      {/* ================================================== */}
      {/* MAIN AREA */}
      {/* ================================================== */}

      <div className="lg:pl-64">
        {/* ================================================== */}
        {/* TOPBAR */}
        {/* ================================================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Title */}
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>
          </div>

          {/* Right Side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((current) => !current)
                }
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                  <CircleUserRound className="h-5 w-5" />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    Admin
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    View Store
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================================================== */}
        {/* PAGE CONTENT */}
        {/* ================================================== */}

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}