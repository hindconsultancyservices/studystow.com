"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadUser = async () => {
      try {
        const email = session.user?.email;

        if (!email) return;

        const response = await fetch(
          `/api/users?search=${encodeURIComponent(email)}&limit=1`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && data.success && data.data?.[0]) {
          setUser(data.data[0]);
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [status, session?.user?.email]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-4 h-8 w-48 rounded bg-gray-200" />
            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              <div className="h-72 rounded-xl bg-gray-200" />
              <div className="h-96 rounded-xl bg-gray-200 lg:col-span-3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Please login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to access your profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    user?.name || session.user?.name || "Customer";

  const displayEmail =
    user?.email || session.user?.email || "";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Account
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account details.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Same Account Sidebar */}
          <aside className="h-fit rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 border-b px-2 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-900 font-bold uppercase text-white">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">
                  {displayName}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {displayEmail}
                </p>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              <Link
                href="/account"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Dashboard
              </Link>

              <Link
                href="/account/orders"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                My Orders
              </Link>

              <Link
                href="/account/profile"
                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
              >
                My Profile
              </Link>

              <Link
                href="/account/addresses"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Addresses
              </Link>

              <Link
                href="/account/wishlist"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Wishlist
              </Link>

              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="w-full rounded-lg px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </nav>
          </aside>

          {/* Main */}
          <section className="lg:col-span-3">
            {/* Personal Information */}
            <div className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your account information.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Full Name
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {user?.name || session.user?.name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email Address
                  </p>

                  <p className="mt-1 break-all font-medium text-gray-900">
                    {displayEmail || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Phone Number
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {user?.phone || "Not added"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <Link
                  href="/account"
                  className="inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Back to Account
                </Link>
              </div>
            </div>

            {/* Change Password */}
            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Password change will be available here.
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                Password management is not connected yet.
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}