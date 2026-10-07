"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";
import type { PermissionAction, PermissionModule } from "@/lib/permissions";

type Requirement = { module: PermissionModule; action: PermissionAction; ownerOnly?: boolean };

function getRequirement(pathname: string): Requirement | null {
  if (pathname === "/admin") return { module: "dashboard", action: "view" };

  if (pathname.startsWith("/admin/books")) {
    if (pathname === "/admin/books/new") return { module: "books", action: "create" };
    if (pathname.includes("/edit")) return { module: "books", action: "edit" };
    return { module: "books", action: "view" };
  }

  if (pathname.startsWith("/admin/categories")) {
    if (pathname === "/admin/categories/new") return { module: "categories", action: "create" };
    if (pathname.includes("/edit")) return { module: "categories", action: "edit" };
    return { module: "categories", action: "view" };
  }

  if (pathname.startsWith("/admin/inventory")) return { module: "inventory", action: "view" };

  if (pathname.startsWith("/admin/orders")) return { module: "orders", action: "view" };

  if (pathname.startsWith("/admin/customers")) return { module: "customers", action: "view" };

  if (pathname.startsWith("/admin/coupons")) {
    if (pathname === "/admin/coupons/new") return { module: "coupons", action: "create" };
    if (pathname.includes("/edit")) return { module: "coupons", action: "edit" };
    return { module: "coupons", action: "view" };
  }

  if (pathname.startsWith("/admin/reviews")) return { module: "reviews", action: "view" };

  if (pathname.startsWith("/admin/pages")) {
    if (pathname === "/admin/pages/new") return { module: "pages", action: "create" };
    if (pathname.includes("/edit")) return { module: "pages", action: "edit" };
    return { module: "pages", action: "view" };
  }

  if (pathname.startsWith("/admin/analytics")) return { module: "analytics", action: "view" };
  if (pathname.startsWith("/admin/contact")) return { module: "contact", action: "view" };
  if (pathname.startsWith("/admin/audit-logs")) return { module: "auditLogs", action: "view" };
  if (pathname.startsWith("/admin/settings")) return { module: "settings", action: "view" };

  if (pathname === "/admin/roles-permissions" || pathname === "/admin/roles-permissions/") {
    return { module: "adminUsers", action: "view" };
  }

  if (pathname.startsWith("/admin/roles-permissions/roles")) {
    return { module: "adminUsers", action: "edit", ownerOnly: true };
  }

  if (pathname.startsWith("/admin/roles-permissions/users")) {
    return { module: "adminUsers", action: "view" };
  }

  if (pathname.startsWith("/admin/roles-permissions/invitations")) {
    return { module: "adminUsers", action: "view" };
  }

  return null;
}

function getActionFromElement(element: HTMLElement, module: PermissionModule, pathname: string): PermissionAction | null {
  const href = (element.getAttribute("href") || "").toLowerCase();
  const label = [
    element.textContent || "",
    element.getAttribute("aria-label") || "",
    element.getAttribute("title") || "",
  ].join(" ").trim().toLowerCase();

  if (href.includes("/new")) return "create";
  if (href.includes("/edit")) return "edit";

  const pageAction = pathname.endsWith("/new")
    ? "create"
    : pathname.includes("/edit")
      ? "edit"
      : null;

  if (/\b(delete|remove|trash|permanently delete)\b/.test(label)) return "delete";
  if (/\b(refund|refunded)\b/.test(label)) return "refund";
  if (/\b(cancel|cancelled|cancellation)\b/.test(label)) return "cancel";
  if (/\b(invite|invitation|resend invitation|send invitation)\b/.test(label)) return "invite";
  if (/\b(suspend|suspended|activate|reactivate)\b/.test(label)) return "suspend";
  if (/\b(create|add new|add|new)\b/.test(label)) return pageAction || "create";
  if (/\b(approve|reject|publish|unpublish|save|edit)\b/.test(label)) return pageAction || (module === "inventory" || module === "orders" || module === "payments" ? "update" : "edit");
  if (/\b(update|manage|change status)\b/.test(label)) return pageAction || (["inventory", "orders", "payments"].includes(module) ? "update" : "edit");

  return null;
}

function ActionFilter({ module, can, pathname, children }: { module: PermissionModule; can: (m: PermissionModule, a: PermissionAction) => boolean; pathname: string; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const apply = () => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("button,a"));

    const routeModules: Array<[string, PermissionModule]> = [
      ["/admin/books", "books"],
      ["/admin/categories", "categories"],
      ["/admin/inventory", "inventory"],
      ["/admin/orders", "orders"],
      ["/admin/customers", "customers"],
      ["/admin/coupons", "coupons"],
      ["/admin/reviews", "reviews"],
      ["/admin/pages", "pages"],
      ["/admin/analytics", "analytics"],
      ["/admin/contact", "contact"],
      ["/admin/audit-logs", "auditLogs"],
      ["/admin/settings", "settings"],
    ];

    for (const node of nodes) {
      if (node.dataset.rbacFiltered === "1") continue;

      const href = (node.getAttribute("href") || "").split("?")[0];
      const linkedModule = routeModules.find(([prefix]) =>
        href === prefix || href.startsWith(`${prefix}/`)
      )?.[1];

      if (linkedModule && !can(linkedModule, "view")) {
        node.dataset.rbacFiltered = "1";
        node.style.display = "none";
        node.setAttribute("aria-hidden", "true");
        continue;
      }

      const targetModule = linkedModule || module;
      const action = getActionFromElement(node, targetModule, pathname);
      if (!action) continue;
      node.dataset.rbacFiltered = "1";
      if (!can(targetModule, action)) {
        node.style.display = "none";
        node.setAttribute("aria-hidden", "true");
      }
    }

    if (module === "settings" && !can(module, "edit")) {
      const fields = root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea");
      fields.forEach((field) => {
        field.disabled = true;
        field.setAttribute("aria-disabled", "true");
      });
    }
  };

  useEffect(() => {
    apply();
    const root = rootRef.current;
    if (!root) return;
    const observer = new MutationObserver(() => apply());
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  return <div ref={rootRef}>{children}</div>;
}

export default function AdminPageGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { loading, ready, isOwner, can } = useAdminPermissions();
  const requirement = useMemo(() => getRequirement(pathname), [pathname]);

  if (!requirement) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-950">Access denied</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">This administrator page is not registered in the permission map.</p>
          <Link href="/admin" className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (loading || !ready) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm">Checking admin access...</div></div>;
  }

  const allowed = requirement.ownerOnly ? isOwner : can(requirement.module, requirement.action);

  if (!allowed) {
    return <div className="flex min-h-[60vh] items-center justify-center p-6"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><ShieldAlert className="h-6 w-6" /></div><h1 className="mt-5 text-xl font-bold text-slate-950">Access denied</h1><p className="mt-2 text-sm leading-6 text-slate-500">Your administrator account does not have permission to access this section.</p><Link href="/admin" className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Back to Dashboard</Link></div></div>;
  }

  return <ActionFilter module={requirement.module} can={can} pathname={pathname}>{children}</ActionFilter>;
}
