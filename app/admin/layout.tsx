
"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminPageGuard from "@/components/admin/AdminPageGuard";
import { AdminPermissionsProvider } from "@/components/admin/AdminPermissionsProvider";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const publicAdminPages = new Set([
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ]);

  // Authentication pages retain their existing appearance.
  if (publicAdminPages.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <AdminThemeProvider>
      <AdminPermissionsProvider>
        <div className="admin-shell min-h-screen bg-slate-100 transition-colors duration-200">
          <AdminSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="admin-main min-h-screen lg:pl-64">
            <AdminHeader
              onMenuClick={() => setSidebarOpen(true)}
            />

            <main className="admin-content min-h-[calc(100vh-4rem)] p-4 transition-colors duration-200 sm:p-6 lg:p-8">
              <AdminPageGuard>
                {children}
              </AdminPageGuard>
            </main>
          </div>
        </div>
      </AdminPermissionsProvider>
    </AdminThemeProvider>
  );
}
