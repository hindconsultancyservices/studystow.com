"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPageGuard from "@/components/admin/AdminPageGuard";
import { AdminPermissionsProvider } from "@/components/admin/AdminPermissionsProvider";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const publicAdminPages = new Set([
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ]);

  if (publicAdminPages.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <AdminPermissionsProvider>
      <div className="min-h-screen bg-slate-100">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-64">
          <AdminHeader
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
            <AdminPageGuard>{children}</AdminPageGuard>
          </main>
        </div>
      </div>
    </AdminPermissionsProvider>
  );
}
