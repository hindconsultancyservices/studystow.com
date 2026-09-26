import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Please enter your email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = (await User.findOne({
      email,
      role: "admin",
      active: true,
    })) as any;

    // Security: do not reveal whether the email exists.
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving it in MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpires = new Date(
      Date.now() + 30 * 60 * 1000
    ); // 30 minutes

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetTokenExpires;

    await user.save();

    const baseUrl =
      process.env.NEXTAUTH_URL || "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/admin/reset-password?token=${resetToken}`;

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      console.error("SMTP environment variables are missing.");

      return NextResponse.json(
        {
          message:
            "Password reset email service is not configured.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to: user.email,

      subject: "StudyStow Admin Password Reset",

      text: `You requested a password reset for your StudyStow admin account.

Reset your password using this link:

${resetUrl}

This link will expire in 30 minutes.

If you did not request this password reset, you can safely ignore this email.`,

      html: `
        <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:40px 20px;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:32px;">
            
            <h2 style="margin:0 0 12px; color:#0f172a;">
              StudyStow Admin Password Reset
            </h2>

            <p style="color:#475569; line-height:1.6;">
              We received a request to reset the password for your
              StudyStow administrator account.
            </p>

            <div style="margin:28px 0;">
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  background:#4f46e5;
                  color:#ffffff;
                  text-decoration:none;
                  padding:13px 22px;
                  border-radius:10px;
                  font-weight:600;
                "
              >
                Reset Password
              </a>
            </div>

            <p style="color:#64748b; font-size:14px; line-height:1.6;">
              This password reset link will expire in
              <strong>30 minutes</strong>.
            </p>

            <p style="color:#64748b; font-size:14px; line-height:1.6;">
              If you did not request this reset, you can safely ignore
              this email.
            </p>

            <hr style="border:none; border-top:1px solid #e2e8f0; margin:28px 0;" />

            <p style="color:#94a3b8; font-size:12px;">
              StudyStow Admin
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
