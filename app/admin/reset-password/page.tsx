"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token.");
    }
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset your password. Please request a new reset link."
        );
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Heading */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-5 inline-flex items-center justify-center"
          >
            <img
              src="/images/logo/logo.png"
              alt="StudyStow"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <h1 className="text-2xl font-bold text-white">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Create a new password for your StudyStow admin account.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                Password Reset Successful
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your admin password has been changed successfully.
                You can now sign in using your new password.
              </p>

              <Link
                href="/admin/login"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Go to Admin Login
              </Link>
            </div>
          ) : (
            <>
              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    New Password
                  </label>

                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter new password"
                      disabled={loading || !token}
                      className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300 disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Password must be at least 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm new password"
                      disabled={loading || !token}
                      className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300 disabled:cursor-not-allowed"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 flex gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mt-0.5 shrink-0">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Secure Password Reset
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your reset link is temporary and can only be used
                    within the allowed time period.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Login
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} StudyStow. All rights reserved.
        </p>
      </div>
    </main>
  );
}
