
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        },
      );

      const data = await response.json().catch(
        () => null,
      );

      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Unable to process your request right now. Please try again.",
        );
        return;
      }

      setMessage(
        data?.message ||
          "If an account exists with this email, a password reset link has been sent.",
      );

      setEmail("");
    } catch (error) {
      console.error(
        "Forgot password error:",
        error,
      );

      setError(
        "Unable to connect to the server right now. Please try again.",
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
                  StudyStow Account Recovery
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
                  Get back to your
                  <br />
                  StudyStow account.
                </h1>

                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
                  Forgot your password? Enter your
                  registered email address and we&apos;ll
                  help you securely reset your account
                  password.
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
                      Secure recovery
                    </p>

                    <p className="text-xs text-slate-400">
                      Your account stays protected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Reset link by email
                    </p>

                    <p className="text-xs text-slate-400">
                      We&apos;ll send instructions to your
                      email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                FORGOT PASSWORD FORM
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
                  Account recovery
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Forgot your password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the email address associated
                  with your account and we&apos;ll send
                  you a password reset link.
                </p>
              </div>

              {/* SUCCESS */}
              {message && (
                <div
                  role="status"
                  className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Check your email
                      </p>

                      <p className="mt-1 text-sm leading-5 text-emerald-700">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
              {!message && (
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

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                        required
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* SECURITY NOTE */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </div>

                    <p className="text-xs leading-5 text-slate-500">
                      For your security, we won&apos;t reveal
                      whether an email address is registered.
                    </p>
                  </div>

                  {/* BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/10 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* LOGIN */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Remember your password?
                </p>

                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in to your account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* BACK */}
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to StudyStow
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} StudyStow. All
          rights reserved.
        </div>
      </footer>
    </main>
  );
}
