import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  console.log("========================================");
  console.log("FORGOT PASSWORD API STARTED");
  console.log("========================================");

  try {
    // --------------------------------------------------
    // 1. Check Resend API Key
    // --------------------------------------------------

    console.log("[1] Checking Resend configuration...");

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("❌ RESEND_API_KEY is missing!");
      console.error(
        "Add RESEND_API_KEY to your .env.local file."
      );

      return NextResponse.json(
        {
          message:
            "Password reset email service is not configured.",
        },
        { status: 500 }
      );
    }

    console.log("✅ RESEND_API_KEY exists");

    // Don't print the actual API key
    console.log(
      "API key starts with:",
      resendApiKey.substring(0, 3) + "****"
    );

    const resend = new Resend(resendApiKey);

    // --------------------------------------------------
    // 2. Read request body
    // --------------------------------------------------

    console.log("[2] Reading request body...");

    const body = await request.json();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    console.log("Requested email:", email);

    if (!email) {
      console.error("❌ Email address is empty");

      return NextResponse.json(
        {
          message: "Please enter your email address.",
        },
        { status: 400 }
      );
    }

    console.log("✅ Email received");

    // --------------------------------------------------
    // 3. Connect MongoDB
    // --------------------------------------------------

    console.log("[3] Connecting to MongoDB...");

    await connectDB();

    console.log("✅ MongoDB connected");

    // --------------------------------------------------
    // 4. Find admin user
    // --------------------------------------------------

    console.log("[4] Searching for admin user...");

    const user = (await User.findOne({
      email,
      role: "admin",
      active: true,
    })) as any;

    if (!user) {
      console.error("❌ Admin user not found");

      console.log("Search conditions:");
      console.log({
        email,
        role: "admin",
        active: true,
      });

      // Security: don't reveal whether account exists
      return NextResponse.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    console.log("✅ Admin user found");
    console.log("User email:", user.email);
    console.log("User role:", user.role);
    console.log("User active:", user.active);

    // --------------------------------------------------
    // 5. Generate reset token
    // --------------------------------------------------

    console.log("[5] Generating reset token...");

    const resetToken = crypto.randomBytes(32).toString("hex");

    console.log("✅ Reset token generated");

    // --------------------------------------------------
    // 6. Hash token
    // --------------------------------------------------

    console.log("[6] Hashing reset token...");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("✅ Reset token hashed");

    // --------------------------------------------------
    // 7. Token expiry
    // --------------------------------------------------

    const resetTokenExpires = new Date(
      Date.now() + 30 * 60 * 1000
    );

    console.log(
      "Token expires:",
      resetTokenExpires.toISOString()
    );

    // --------------------------------------------------
    // 8. Save reset token in MongoDB
    // --------------------------------------------------

    console.log("[7] Saving reset token to MongoDB...");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetTokenExpires;

    await user.save();

    console.log("✅ Reset token saved to MongoDB");

    // --------------------------------------------------
    // 9. Create reset URL
    // --------------------------------------------------

    console.log("[8] Creating reset URL...");

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/admin/reset-password?token=${resetToken}`;

    console.log("Reset URL created:");
    console.log(resetUrl);

    // --------------------------------------------------
    // 10. Check sender email
    // --------------------------------------------------

    console.log("[9] Checking sender email...");

    const fromEmail =
      process.env.RESEND_FROM ||
      "StudyStow <onboarding@resend.dev>";

    console.log("From email:", fromEmail);

    if (!process.env.RESEND_FROM) {
      console.warn(
        "⚠️ RESEND_FROM is not defined."
      );

      console.warn(
        "Using default:",
        "StudyStow <onboarding@resend.dev>"
      );
    } else {
      console.log("✅ RESEND_FROM exists");
    }

    // --------------------------------------------------
    // 11. Send email through Resend
    // --------------------------------------------------

    console.log("[10] Sending email through Resend...");

    console.log("To:", user.email);
    console.log("From:", fromEmail);
    console.log(
      "Subject:",
      "StudyStow Admin Password Reset"
    );

    const { data, error } =
      await resend.emails.send({
        from: fromEmail,

        to: [user.email],

        subject:
          "StudyStow Admin Password Reset",

        text: `
You requested a password reset for your StudyStow admin account.

Reset your password using this link:

${resetUrl}

This link will expire in 30 minutes.

If you did not request this password reset, you can safely ignore this email.
        `,

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              background: #f8fafc;
              padding: 40px 20px;
            "
          >
            <div
              style="
                max-width: 560px;
                margin: 0 auto;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 32px;
              "
            >

              <h2
                style="
                  margin: 0 0 12px;
                  color: #0f172a;
                "
              >
                StudyStow Admin Password Reset
              </h2>

              <p
                style="
                  color: #475569;
                  line-height: 1.6;
                "
              >
                We received a request to reset the password
                for your StudyStow administrator account.
              </p>

              <div style="margin: 28px 0;">

                <a
                  href="${resetUrl}"
                  style="
                    display: inline-block;
                    background: #4f46e5;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 13px 22px;
                    border-radius: 10px;
                    font-weight: 600;
                  "
                >
                  Reset Password
                </a>

              </div>

              <p
                style="
                  color: #64748b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This password reset link will expire in
                <strong>30 minutes</strong>.
              </p>

              <p
                style="
                  color: #64748b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                If you did not request this reset,
                you can safely ignore this email.
              </p>

              <hr
                style="
                  border: none;
                  border-top: 1px solid #e2e8f0;
                  margin: 28px 0;
                "
              />

              <p
                style="
                  color: #94a3b8;
                  font-size: 12px;
                "
              >
                StudyStow Admin
              </p>

            </div>
          </div>
        `,
      });

    // --------------------------------------------------
    // 12. Check Resend response
    // --------------------------------------------------

    console.log("[11] Resend response received");

    console.log("Resend data:", data);
    console.log("Resend error:", error);

    if (error) {
      console.error("❌ RESEND EMAIL ERROR");
      console.error(error);

      return NextResponse.json(
        {
          message:
            "Unable to send password reset email.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 13. Email successfully accepted
    // --------------------------------------------------

    console.log("========================================");
    console.log("✅ PASSWORD RESET EMAIL SENT");
    console.log("Resend Email ID:", data?.id);
    console.log("To:", user.email);
    console.log("From:", fromEmail);
    console.log("========================================");

    return NextResponse.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error: any) {
    // --------------------------------------------------
    // 14. Catch unexpected error
    // --------------------------------------------------

    console.log("========================================");
    console.error("❌ FORGOT PASSWORD ERROR");
    console.error("========================================");

    console.error("Error:", error);

    if (error?.message) {
      console.error(
        "Error message:",
        error.message
      );
    }

    if (error?.stack) {
      console.error(
        "Error stack:",
        error.stack
      );
    }

    return NextResponse.json(
      {
        message:
          "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}