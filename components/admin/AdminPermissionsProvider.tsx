"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { PermissionAction, PermissionMap, PermissionModule } from "@/lib/permissions";

interface AdminPermissionContextValue {
  loading: boolean;
  ready: boolean;
  isOwner: boolean;
  permissions: PermissionMap;
  can: (module: PermissionModule, action: PermissionAction) => boolean;
  canView: (module: PermissionModule) => boolean;
  refresh: () => Promise<void>;
}

const AdminPermissionContext = createContext<AdminPermissionContextValue | null>(null);

export function AdminPermissionsProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [permissions, setPermissions] = useState<PermissionMap>({});

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/permissions", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setPermissions({});
        setIsOwner(false);
        return;
      }

      setPermissions(data.data?.permissions || {});
      setIsOwner(Boolean(data.data?.isOwner));
    } catch (error) {
      console.error("Admin permission load error:", error);
      setPermissions({});
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refresh]);

  const value = useMemo<AdminPermissionContextValue>(() => {
    const can = (module: PermissionModule, action: PermissionAction) => {
      if (isOwner) return true;
      const modulePermissions = permissions[module];
      if (!modulePermissions?.[action]) return false;

      if (action !== "view") {
        return modulePermissions.view === true;
      }

      return true;
    };

    return {
      loading,
      ready: !loading,
      isOwner,
      permissions,
      can,
      canView: (module) => can(module, "view"),
      refresh,
    };
  }, [isOwner, loading, permissions, refresh]);

  return (
    <AdminPermissionContext.Provider value={value}>
      {children}
    </AdminPermissionContext.Provider>
  );
}

export function useAdminPermissions() {
  const context = useContext(AdminPermissionContext);

  if (!context) {
    throw new Error("useAdminPermissions must be used inside AdminPermissionsProvider.");
  }

  return context;
}
