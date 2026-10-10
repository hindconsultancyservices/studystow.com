
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AdminTheme = "light" | "dark";

interface AdminThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
  hydrated: boolean;
}

const STORAGE_KEY = "studystow-admin-theme";

const AdminThemeContext =
  createContext<AdminThemeContextValue | null>(null);

export function AdminThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<AdminTheme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);

      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.warn("Unable to read saved admin theme:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  const setTheme = useCallback((nextTheme: AdminTheme) => {
    setThemeState(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.warn("Unable to save admin theme:", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme =
        currentTheme === "dark" ? "light" : "dark";

      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (error) {
        console.warn("Unable to save admin theme:", error);
      }

      return nextTheme;
    });
  }, []);

  return (
    <AdminThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, hydrated }}
    >
      <div
        className={`admin-theme min-h-screen ${
          theme === "dark" ? "dark" : ""
        }`}
        data-theme={theme}
        data-theme-ready={hydrated ? "true" : "false"}
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error(
      "useAdminTheme must be used inside AdminThemeProvider."
    );
  }

  return context;
}
