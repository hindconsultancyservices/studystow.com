"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * Login aur Forgot Password pages par
   * sidebar/header nahi dikhana hai.
   */
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password"
  ) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================================
          ADMIN SIDEBAR
          ================================ */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ================================
          MAIN CONTENT AREA
          ================================ */}
      <div className="lg:pl-64">
        {/* ================================
            ADMIN HEADER
            ================================ */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* ================================
            PAGE CONTENT
            ================================ */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}