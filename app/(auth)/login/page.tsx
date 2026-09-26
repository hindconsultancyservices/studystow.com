"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
const router = useRouter();
const searchParams = useSearchParams();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


setError("");

const cleanEmail = email.trim().toLowerCase();

if (!cleanEmail || !password) {
  setError("Please enter your email and password.");
  return;
}

setLoading(true);

try {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: cleanEmail,
      password,
    }),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Unable to sign in. Please check your details and try again.";

    throw new Error(message);
  }

  const redirectTo = searchParams.get("redirect");

  router.replace(
    redirectTo && redirectTo.startsWith("/")
      ? redirectTo
      : "/account"
  );

  router.refresh();
} catch (submitError) {
  setError(
    submitError instanceof Error
      ? submitError.message
      : "Unable to sign in. Please try again."
  );
} finally {
  setLoading(false);
}


}

return ( <main className="min-h-screen bg-white text-black"> <div className="grid min-h-screen lg:grid-cols-2">

    {/* LEFT BRAND PANEL */}
    <section className="hidden bg-black text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div>
        <Link
          href="/"
          aria-label="studystow.com home"
          className="inline-flex items-baseline"
        >
          <span className="text-[28px] font-black tracking-[-0.06em]">
            studystow
          </span>

          <span className="ml-1 text-[14px] font-semibold text-white/50">
            .com
          </span>
        </Link>
      </div>

      <div className="max-w-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          Welcome back
        </p>

        <h1 className="mt-5 text-[56px] font-black leading-[0.95] tracking-[-0.055em] xl:text-[70px]">
          Your books.
          <br />
          Your account.
        </h1>

        <p className="mt-7 max-w-lg text-[15px] leading-7 text-white/55">
          Sign in to access the account functionality available on
          studystow.com.
        </p>
      </div>

      <p className="text-[11px] text-white/35">
        © {new Date().getFullYear()} studystow.com
      </p>
    </section>

    {/* RIGHT LOGIN PANEL */}
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
      <div className="w-full max-w-[460px]">

        {/* MOBILE BRAND */}
        <div className="mb-12 lg:hidden">
          <Link
            href="/"
            aria-label="studystow.com home"
            className="inline-flex items-baseline"
          >
            <span className="text-[25px] font-black tracking-[-0.06em]">
              studystow
            </span>

            <span className="ml-1 text-[13px] font-semibold text-black/45">
              .com
            </span>
          </Link>
        </div>

        {/* HEADING */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
            Account
          </p>

          <h2 className="mt-4 text-[42px] font-black leading-none tracking-[-0.05em] sm:text-[48px]">
            Sign in
          </h2>

          <p className="mt-5 text-[14px] leading-6 text-black/55">
            Sign in to continue to your studystow.com account.
          </p>
        </div>

        {/* ERROR */}
        {error ? (
          <div
            role="alert"
            className="mt-8 border border-black bg-black px-4 py-3 text-[13px] leading-5 text-white"
          >
            {error}
          </div>
        ) : null}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[12px] font-bold"
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="h-13 w-full border border-black bg-white px-4 text-[14px] outline-none placeholder:text-black/35 focus:bg-black/[0.02] focus:ring-2 focus:ring-black"
              required
              disabled={loading}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label
                htmlFor="password"
                className="block text-[12px] font-bold"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-13 w-full border border-black bg-white px-4 pr-24 text-[14px] outline-none placeholder:text-black/35 focus:bg-black/[0.02] focus:ring-2 focus:ring-black"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-0 top-0 h-13 px-4 text-[11px] font-bold"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-13 w-full items-center justify-center border border-black bg-black px-6 text-[13px] font-bold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* REGISTER */}
        <div className="mt-8 border-t border-black/10 pt-7">
          <p className="text-center text-[13px] text-black/50">
            Don't have an account?
          </p>

          <Link
            href="/register"
            className="mt-3 flex h-12 items-center justify-center border border-black text-[13px] font-bold transition hover:bg-black hover:text-white"
          >
            Create an account
          </Link>
        </div>

        {/* BACK */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[12px] font-semibold text-black/45 underline underline-offset-4 hover:text-black"
          >
            ← Back to studystow.com
          </Link>
        </div>
      </div>
    </section>
  </div>
</main>


);
}
