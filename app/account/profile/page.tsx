import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Sidebar */}
          <aside className="h-fit rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 text-3xl font-bold text-white">
                C
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                Customer Name
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                customer@example.com
              </p>
            </div>

            {/* Account Navigation */}
            <nav className="mt-6 space-y-1 border-t pt-5">
              <Link
                href="/account"
                className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"
              >
                Account Dashboard
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
                Profile
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
            </nav>
          </aside>

          {/* Profile Form */}
          <section className="lg:col-span-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 border-b pb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your personal details below.
                </p>
              </div>

              <form className="space-y-6">
                {/* Name */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      defaultValue="Customer"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      defaultValue="Name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue="customer@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="dob"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>

                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Save */}
                <div className="flex justify-end border-t pt-6">
                  <button
                    type="submit"
                    className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Keep your account secure by using a strong password.
                </p>
              </div>

              <form className="space-y-5">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end border-t pt-5">
                  <button
                    type="submit"
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
