"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type InvitationData = {
  id: string;
  email: string;
  name?: string;
  role?: {
    id: string;
    name: string;
    slug: string;
  };
  expiresAt?: string;
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";

  const [invitation, setInvitation] =
    useState<InvitationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation link.");
      setLoading(false);
      return;
    }

    verifyInvitation();
  }, [token]);

  async function verifyInvitation() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/roles-permissions/accept-invite?token=${encodeURIComponent(
          token
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "This invitation is invalid or has expired."
        );
      }

      setInvitation(data?.data || data?.invitation);
    } catch (err) {
      console.error("Invitation verification error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "This invitation is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/admin/roles-permissions/accept-invite",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to accept the invitation."
        );
      }

      setSuccess(
        "Your admin account has been created successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
    } catch (err) {
      console.error("Accept invitation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept the invitation."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
          <p className="text-sm text-slate-600">
            Verifying your invitation...
          </p>
        </div>
      </main>
    );
  }

  if (error && !invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold text-slate-900">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            {error}
          </p>

          <Link
            href="/admin/login"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Accept Admin Invitation
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Create your StudyStow admin account.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          {invitation && (
            <div className="mb-6 rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Invitation for
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {invitation.name || "Admin User"}
              </p>

              <p className="mt-1 break-all text-sm text-slate-600">
                {invitation.email}
              </p>

              {invitation.role?.name && (
                <div className="mt-3 inline-flex rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {invitation.role.name}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 flex gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Create Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={submitting || !!success}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  disabled={submitting || !!success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 disabled:opacity-50"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={submitting || !!success}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={submitting || !!success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 disabled:opacity-50"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                !!success ||
                !invitation
              }
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Accept Invitation"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            This invitation is secure and can only be used
            with the invitation link sent to your email.
          </p>
        </div>
      </div>
    </main>
  );
}