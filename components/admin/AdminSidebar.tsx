"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Boxes,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Users,
  ShieldCheck,
  ClipboardList,
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
    icon: ClipboardList,
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

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const {
    loading,
    isOwner,
    canView,
  } = useAdminPermissions();

  const visible = (
    item: NavigationItem
  ) => {
    if (item.ownerOnly) {
      return isOwner;
    }

    if (!item.module) {
      return true;
    }

    if (isOwner) {
      return true;
    }

    return canView(item.module);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
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
            onClick={onClose}
            aria-label="Close admin menu"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {/* Store Management */}
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Store Management
          </p>

          <div className="space-y-1">
            {!loading &&
              navigation
                .filter(visible)
                .map((item) => {
                  const Icon = item.icon;

                  const active =
                    isActivePath(
                      pathname,
                      item.href
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />

                      <span>
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
          </div>

          <div className="my-5 border-t border-slate-800" />

          {/* System */}
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            System
          </p>

          <div className="space-y-1">
            {!loading &&
              secondaryNavigation
                .filter(visible)
                .map((item) => {
                  const Icon = item.icon;

                  const active =
                    isActivePath(
                      pathname,
                      item.href
                    );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />

                      <span>
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
          </div>
        </nav>

        {/* Store link */}
        <div className="shrink-0 border-t border-slate-800 p-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ShoppingCart className="h-[18px] w-[18px]" />

            <span>
              View Store
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}