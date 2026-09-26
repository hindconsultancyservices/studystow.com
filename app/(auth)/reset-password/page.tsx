"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Unable to reset your password. Please request a new reset link.",
        );
        return;
      }

      setSuccess(true);
      setMessage(
        data?.message ||
          "Your password has been reset successfully. You can now log in.",
      );

      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(
        "Unable to connect to the server right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
              color: "#111111",
            }}
          >
            Reset Password
          </h1>

          <p
            style={{
              marginTop: "10px",
              marginBottom: 0,
              color: "#666666",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Enter your new password below.
          </p>
        </div>

        {message ? (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        ) : null}

        {!success && token ? (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#222222",
              }}
            >
              New Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading}
              required
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #d4d4d4",
                borderRadius: "10px",
                outline: "none",
                fontSize: "15px",
                color: "#111111",
                background: loading ? "#f5f5f5" : "#ffffff",
                boxSizing: "border-box",
              }}
            />

            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginTop: "16px",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#222222",
              }}
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={loading}
              required
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #d4d4d4",
                borderRadius: "10px",
                outline: "none",
                fontSize: "15px",
                color: "#111111",
                background: loading ? "#f5f5f5" : "#ffffff",
                boxSizing: "border-box",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                marginTop: "20px",
                border: "none",
                borderRadius: "10px",
                background: loading ? "#666666" : "#111111",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : null}

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <Link
            href="/login"
            style={{
              color: "#111111",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
