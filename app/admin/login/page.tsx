"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      window.location.href = "/admin";
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-5"
          >
            <img
              src="/images/logo/logo.png"
              alt="StudyStow"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <h1 className="text-2xl font-bold text-white">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your StudyStow store
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email Address
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

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-200"
                >
                  Password
                </label>

                <Link
                  href="/admin/forgot-password"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-950 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to Admin"
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
                Secure Admin Area
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This area is restricted to authorized StudyStow
                administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Store */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} StudyStow. All rights reserved.
        </p>
      </div>
    </main>
  );
}
