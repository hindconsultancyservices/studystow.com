"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
const router = useRouter();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [agree, setAgree] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


setError("");

const cleanName = name.trim();
const cleanEmail = email.trim().toLowerCase();

if (!cleanName) {
  setError("Please enter your name.");
  return;
}

if (!cleanEmail) {
  setError("Please enter your email address.");
  return;
}

if (!password) {
  setError("Please enter a password.");
  return;
}

if (password.length < 8) {
  setError("Password must contain at least 8 characters.");
  return;
}

if (password !== confirmPassword) {
  setError("Passwords do not match.");
  return;
}

if (!agree) {
  setError("Please accept the Terms & Conditions and Privacy Policy.");
  return;
}

setLoading(true);

try {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: cleanName,
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
        : "Unable to create your account. Please try again.";

    throw new Error(message);
  }

  router.replace("/login");
  router.refresh();
} catch (submitError) {
  setError(
    submitError instanceof Error
      ? submitError.message
      : "Unable to create your account. Please try again."
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
          Create your account
        </p>

        <h1 className="mt-5 text-[56px] font-black leading-[0.95] tracking-[-0.055em] xl:text-[70px]">
          Start your
          <br />
          StudyStow
          <br />
          journey.
        </h1>

        <p className="mt-7 max-w-lg text-[15px] leading-7 text-white/55">
          Create an account to use the account functionality available on
          studystow.com.
        </p>
      </div>

      <p className="text-[11px] text-white/35">
        © {new Date().getFullYear()} studystow.com
      </p>
    </section>

    {/* RIGHT REGISTER PANEL */}
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
      <div className="w-full max-w-[480px]">

        {/* MOBILE BRAND */}
        <div className="mb-10 lg:hidden">
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
            Create account
          </h2>

          <p className="mt-5 text-[14px] leading-6 text-black/55">
            Create your studystow.com account to continue.
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
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-[12px] font-bold"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              className="h-13 w-full border border-black bg-white px-4 text-[14px] outline-none placeholder:text-black/35 focus:bg-black/[0.02] focus:ring-2 focus:ring-black"
              required
              disabled={loading}
            />
          </div>

          {/* EMAIL */}
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

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[12px] font-bold"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
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

            <p className="mt-2 text-[11px] text-black/45">
              Use at least 8 characters.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-[12px] font-bold"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your password again"
                className="h-13 w-full border border-black bg-white px-4 pr-24 text-[14px] outline-none placeholder:text-black/35 focus:bg-black/[0.02] focus:ring-2 focus:ring-black"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                className="absolute right-0 top-0 h-13 px-4 text-[11px] font-bold"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                disabled={loading}
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* TERMS */}
          <div className="border-t border-black/10 pt-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={agree}
                onChange={(event) => setAgree(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-black"
                disabled={loading}
              />

              <span className="text-[12px] leading-5 text-black/55">
                I agree to the{" "}
                <Link
                  href="/terms-and-conditions"
                  className="font-semibold text-black underline underline-offset-4"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="font-semibold text-black underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-13 w-full items-center justify-center border border-black bg-black px-6 text-[13px] font-bold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* LOGIN */}
        <div className="mt-8 border-t border-black/10 pt-7">
          <p className="text-center text-[13px] text-black/50">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="mt-3 flex h-12 items-center justify-center border border-black text-[13px] font-bold transition hover:bg-black hover:text-white"
          >
            Sign in
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
