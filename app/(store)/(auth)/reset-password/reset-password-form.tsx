
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  BookOpen,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
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
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Unable to process your request right now. Please try again."
        );
        return;
      }

      setMessage(
        data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");
    } catch {
      setError(
        "Unable to connect to the server right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =====================================================
            LEFT PANEL
        ====================================================== */}
        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          {/* Background decoration */}
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex w-fit items-center"
            >
              <img
                src="/images/logo/logo.png"
                alt="StudyStow"
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Main content */}
            <div className="max-w-xl">
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                <LockKeyhole className="h-7 w-7 text-blue-400" />
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Get back to
                <span className="block text-blue-400">
                  your account.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Forgot your password? Enter your
                registered email address and we&apos;ll
                send you a secure link to reset your
                password.
              </p>

              {/* Features */}
              <div className="mt-10 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Reset link by email
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      We&apos;ll send password recovery
                      instructions to your registered
                      email address.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Secure recovery
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Your account remains protected
                      throughout the password reset
                      process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Continue learning
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Get back to your StudyStow
                      account and continue exploring
                      books.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} StudyStow
            </p>
          </div>
        </section>

        {/* =====================================================
            RIGHT PANEL
        ====================================================== */}
        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-lg">
            {/* Mobile logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Link href="/">
                <img
                  src="/images/logo/logo.png"
                  alt="StudyStow"
                  className="h-14 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <LockKeyhole className="h-5 w-5 text-blue-600" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Forgot Password?
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Enter the email address associated
                with your account and we&apos;ll send
                you a secure password reset link.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
              {message ? (
                /* ================================
                   SUCCESS STATE
                ================================= */
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-slate-900">
                    Check your email
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    {message}
                  </p>

                  <Link
                    href="/login"
                    className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(event) =>
                            setEmail(event.target.value)
                          }
                          placeholder="Enter your email"
                          autoComplete="email"
                          disabled={loading}
                          required
                          className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
                      >
                        {error}
                      </div>
                    )}

                    {/* Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5" />
                          Send Reset Link
                        </>
                      )}
                    </button>
                  </form>

                  {/* Security */}
                  <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mt-0.5 shrink-0">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Secure Password Reset
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        For security, we&apos;ll never reveal
                        whether an email address is
                        registered with StudyStow.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Back */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} StudyStow. All
              rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
