"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type UserData = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  active?: boolean;
};

type PasswordState = {
  current: string;
  next: string;
  confirm: string;
};

type PasswordVisibility = {
  current: boolean;
  next: boolean;
  confirm: boolean;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserData | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] =
    useState(false);
  const [savingPassword, setSavingPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");
  const [profileError, setProfileError] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");
  const [passwordError, setPasswordError] =
    useState("");

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [passwordState, setPasswordState] =
    useState<PasswordState>({
      current: "",
      next: "",
      confirm: "",
    });

  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordVisibility>({
      current: false,
      next: false,
      confirm: false,
    });

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") {
        setLoading(false);
      }

      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);

        const email = session.user?.email;

        if (!email) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/users?search=${encodeURIComponent(
            email
          )}&limit=1`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (
          response.ok &&
          data?.success &&
          Array.isArray(data.data) &&
          data.data[0]
        ) {
          const currentUser =
            data.data[0] as UserData;

          setUser(currentUser);
          setName(currentUser.name || "");
          setPhone(currentUser.phone || "");
        }
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [status, session?.user?.email]);

  const displayName = useMemo(() => {
    return (
      user?.name ||
      session?.user?.name ||
      "Customer"
    );
  }, [user?.name, session?.user?.name]);

  const displayEmail = useMemo(() => {
    return (
      user?.email ||
      session?.user?.email ||
      ""
    );
  }, [user?.email, session?.user?.email]);

  const initial =
    displayName.charAt(0).toUpperCase() || "C";

  const passwordStrength = useMemo(() => {
    const password = passwordState.next;

    if (!password) {
      return {
        label: "Enter a password",
        width: "w-0",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "w-1/3",
      };
    }

    if (score <= 4) {
      return {
        label: "Good",
        width: "w-2/3",
      };
    }

    return {
      label: "Strong",
      width: "w-full",
    };
  }, [passwordState.next]);

  function updatePassword(
    field: keyof PasswordState,
    value: string
  ) {
    setPasswordState((previous) => ({
      ...previous,
      [field]: value,
    }));

    setPasswordError("");
    setPasswordMessage("");
  }

  function togglePasswordVisibility(
    field: keyof PasswordVisibility
  ) {
    setPasswordVisibility((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  }

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setProfileError("");
    setProfileMessage("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      setProfileError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (cleanName.length > 100) {
      setProfileError(
        "Name cannot exceed 100 characters."
      );
      return;
    }

    if (cleanPhone.length > 15) {
      setProfileError(
        "Phone number cannot exceed 15 characters."
      );
      return;
    }

    if (!user?._id) {
      setProfileError(
        "User account could not be found."
      );
      return;
    }

    try {
      setSavingProfile(true);

      const response = await fetch(
        `/api/users/${encodeURIComponent(
          user._id
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok || !data?.success) {
        setProfileError(
          data?.message ||
            "Unable to update your profile."
        );
        return;
      }

      const updatedUser =
        data.data || data.user;

      if (updatedUser) {
        setUser(updatedUser);

        setName(
          updatedUser.name || cleanName
        );

        setPhone(
          updatedUser.phone || cleanPhone
        );
      } else {
        setUser((previous) =>
          previous
            ? {
                ...previous,
                name: cleanName,
                phone: cleanPhone,
              }
            : previous
        );
      }

      setEditingProfile(false);

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setProfileError(
        "Unable to update your profile right now."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    const currentPassword =
      passwordState.current;

    const newPassword =
      passwordState.next;

    const confirmPassword =
      passwordState.confirm;

    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword.length > 128) {
      setPasswordError(
        "New password cannot exceed 128 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError(
        "New password must contain an uppercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError(
        "New password must contain a number."
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError(
        "New password must contain a special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setSavingPassword(true);

      const response = await fetch(
        "/api/auth/change-password",
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok || !data?.success) {
        setPasswordError(
          data?.message ||
            "Password could not be changed."
        );
        return;
      }

      setPasswordState({
        current: "",
        next: "",
        confirm: "",
      });

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordError(
        "Unable to change password right now."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  function cancelProfileEdit() {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setEditingProfile(false);
    setProfileError("");
    setProfileMessage("");
  }

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-64 rounded bg-gray-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-4">
              <div className="h-72 rounded-xl bg-gray-200" />

              <div className="lg:col-span-3">
                <div className="h-56 rounded-xl bg-gray-200" />

                <div className="mt-4 h-56 rounded-xl bg-gray-200" />
              </div>
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
          <ShieldCheck className="mx-auto h-12 w-12 text-gray-400" />

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Please login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to manage your profile.
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
            Manage your personal information and account
            security.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
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
                Account
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

          {/* Main Content */}
          <section className="lg:col-span-3">
            {/* Personal Information */}
            <div className="rounded-xl border bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Account
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    View and update your account information.
                  </p>
                </div>

                {!editingProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileError("");
                      setProfileMessage("");
                      setEditingProfile(true);
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form
                onSubmit={saveProfile}
                className="p-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      disabled={!editingProfile}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <input
                        id="email"
                        type="email"
                        value={displayEmail}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value)
                        }
                        disabled={!editingProfile}
                        maxLength={15}
                        placeholder="Enter phone number"
                        className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Account Status
                    </label>

                    <div className="flex h-[46px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          user?.active === false
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {user?.active === false
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {profileError && (
                  <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    {profileError}
                  </div>
                )}

                {profileMessage && (
                  <div className="mt-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {profileMessage}
                  </div>
                )}

                {editingProfile && (
                  <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={cancelProfileEdit}
                      disabled={savingProfile}
                      className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />

                      {savingProfile
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="mt-6 rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-gray-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Security
                </p>

                <h2 className="mt-1 text-lg font-semibold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form
                onSubmit={changePassword}
                className="space-y-5 p-5"
              >
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={
                        passwordVisibility.current
                          ? "text"
                          : "password"
                      }
                      value={passwordState.current}
                      onChange={(event) =>
                        updatePassword(
                          "current",
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(
                          "current"
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {passwordVisibility.current ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={
                        passwordVisibility.next
                          ? "text"
                          : "password"
                      }
                      value={passwordState.next}
                      onChange={(event) =>
                        updatePassword(
                          "next",
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(
                          "next"
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {passwordVisibility.next ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {passwordState.next && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Password strength
                        </span>

                        <span className="font-semibold text-gray-700">
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full bg-gray-900 transition-all ${passwordStrength.width}`}
                        />
                      </div>
                    </div>
                  )}

                  <ul className="mt-3 grid gap-1 text-xs text-gray-500 sm:grid-cols-2">
                    <li
                      className={
                        passwordState.next.length >= 8
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • At least 8 characters
                    </li>

                    <li
                      className={
                        /[A-Z]/.test(
                          passwordState.next
                        )
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • One uppercase letter
                    </li>

                    <li
                      className={
                        /[0-9]/.test(
                          passwordState.next
                        )
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • One number
                    </li>

                    <li
                      className={
                        /[^A-Za-z0-9]/.test(
                          passwordState.next
                        )
                          ? "text-green-600"
                          : ""
                      }
                    >
                      • One special character
                    </li>
                  </ul>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        passwordVisibility.confirm
                          ? "text"
                          : "password"
                      }
                      value={passwordState.confirm}
                      onChange={(event) =>
                        updatePassword(
                          "confirm",
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(
                          "confirm"
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {passwordVisibility.confirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {passwordState.confirm && (
                    <p
                      className={`mt-2 text-xs ${
                        passwordState.next ===
                        passwordState.confirm
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordState.next ===
                      passwordState.confirm
                        ? "Passwords match."
                        : "Passwords do not match."}
                    </p>
                  )}
                </div>

                {passwordError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {passwordMessage}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-400">
                    Password is securely stored using bcrypt hashing.
                  </p>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <KeyRound className="h-4 w-4" />

                    {savingPassword
                      ? "Updating..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* Account Security */}
            <div className="mt-6 rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-gray-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Security
                </p>

                <h2 className="mt-1 text-lg font-semibold text-gray-900">
                  Account Security
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your account security information.
                </p>
              </div>

              <div className="divide-y">
                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Email Address
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {displayEmail}
                      </p>
                    </div>
                  </div>

                  <span className="hidden items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:inline-flex">
                    <Check className="h-3.5 w-3.5" />
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <ShieldCheck className="h-5 w-5 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Password
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Password is protected securely.
                      </p>
                    </div>
                  </div>

                  <span className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 sm:inline-flex">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Protected
                  </span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-red-900">
                    Sign out of your account
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    Sign out from this device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/login",
                    })
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
