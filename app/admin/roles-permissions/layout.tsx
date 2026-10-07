"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type RolesPermissionsLayoutProps = {
  children: ReactNode;
};

const tabs = [
  {
    label: "Users",
    href: "/admin/roles-permissions/users",
  },
  {
    label: "Invitations",
    href: "/admin/roles-permissions/invitations",
  },
  {
    label: "Roles",
    href: "/admin/roles-permissions/roles",
  },
];

export default function RolesPermissionsLayout({
  children,
}: RolesPermissionsLayoutProps) {
  const pathname = usePathname();
  const { isOwner, can } = useAdminPermissions();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Shared Header */}
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-slate-900" />

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Roles & Permissions
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Control user access using database roles and permissions.
          </p>
        </div>

        {/* Shared Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.filter((tab) =>
            tab.href.endsWith("/roles") ? isOwner : can("adminUsers", "view")
          ).map((tab) => {
            const isActive =
              pathname === tab.href ||
              pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Current Section */}
        {children}
      </div>
    </div>
  );
}