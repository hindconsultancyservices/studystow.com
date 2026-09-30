"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/account",
    icon: User,
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: Settings,
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/account") {
      return pathname === "/account";
    }

    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            My Account
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your account
          </p>
        </div>

        <nav className="p-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="my-3 border-t border-gray-200" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 shrink-0" />

            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}