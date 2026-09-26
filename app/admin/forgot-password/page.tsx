"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to process your request.");
        return;
      }

      setMessage(
        data.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      console.error("Forgot password error:", error);
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
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter your admin email address and we&apos;ll send you a password
            reset link.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          {message ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                Check your email
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {message}
              </p>

              <Link
                href="/admin/login"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Admin Email Address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@studystow.com"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />
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
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
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
                    For security, we will not reveal whether an email address
                    is registered.
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
