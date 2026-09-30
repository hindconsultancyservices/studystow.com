
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your email address.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this email address.",
        },
        { status: 404 },
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only SHA-256 hash in MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 30 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(
      Date.now() + 30 * 60 * 1000,
    );

    await user.save();

    // Reset URL
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/reset-password?token=` +
      encodeURIComponent(resetToken);

    // Resend
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "onboarding@resend.dev";

    const { error: resendError } = await resend.emails.send({
      from: `StudyStow <${fromEmail}>`,
      to: [user.email],
      subject: "Reset your StudyStow password",

      text: `You requested a password reset for your StudyStow account.

Click the link below to create a new password:

${resetUrl}

This link will expire in 30 minutes.

If you did not request this password reset, you can safely ignore this email.`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 30px;
          "
        >
          <div
            style="
              max-width: 560px;
              margin: 0 auto;
              background: #ffffff;
              padding: 32px;
              border-radius: 12px;
              border: 1px solid #e5e5e5;
            "
          >
            <h2
              style="
                margin: 0 0 16px;
                color: #111111;
              "
            >
              Reset your StudyStow password
            </h2>

            <p
              style="
                color: #555555;
                line-height: 1.6;
              "
            >
              We received a request to reset the password
              for your StudyStow account.
            </p>

            <p style="margin: 28px 0;">
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 13px 22px;
                  background: #111111;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                "
              >
                Reset Password
              </a>
            </p>

            <p
              style="
                color: #666666;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              This password reset link will expire in
              30 minutes.
            </p>

            <p
              style="
                color: #888888;
                font-size: 13px;
                line-height: 1.6;
              "
            >
              If you did not request this password reset,
              you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend error:", resendError);

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to send the reset email. Please try again later.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error(
      "CUSTOMER FORGOT PASSWORD ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process your request right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}
