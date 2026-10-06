
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (!result) {
        setError(
          "Unable to sign in. Please try again.",
        );
        return;
      }

      if (result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">

            {/* =================================================
                LEFT PANEL
            ================================================= */}
            <div className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
              <div>
                {/* LOGO / ICON */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Welcome back to StudyStow
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
                  Continue your
                  <br />
                  reading journey.
                </h1>

                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
                  Sign in to your StudyStow account and
                  continue exploring books, orders and
                  everything you have saved.
                </p>
              </div>

              {/* BENEFITS */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Secure account
                    </p>

                    <p className="text-xs text-slate-400">
                      Your account stays protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <BookOpen className="h-4 w-4 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Your books, your journey
                    </p>

                    <p className="text-xs text-slate-400">
                      Continue from where you left off.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                LOGIN FORM
            ================================================= */}
            <div className="p-6 sm:p-8 lg:p-10">
              {/* HEADER */}
              <div className="mb-8">
                {/* BLUE LOGO */}
                <Link
                  href="/"
                  className="inline-flex items-center"
                >
                  <img
                    src="/images/logo/logo.png"
                    alt="StudyStow"
                    className="h-14 w-auto object-contain"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(39%) sepia(99%) saturate(1847%) hue-rotate(204deg) brightness(97%) contrast(101%)",
                    }}
                  />
                </Link>

                <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Sign in to StudyStow
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your account and continue
                  exploring StudyStow.
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      disabled={loading}
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER / SECURITY NOTE */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>

                  <p className="text-xs leading-5 text-slate-500">
                    Your login details are securely
                    handled by StudyStow.
                  </p>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/10 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in"}

                  {!loading && (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </button>
              </form>

              {/* REGISTER */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?
                </p>

                <Link
                  href="/register"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* BACK */}
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-xs font-medium text-slate-400 transition hover:text-slate-700"
                >
                  ← Back to StudyStow
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} StudyStow. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
