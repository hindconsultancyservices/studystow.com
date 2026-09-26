import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");

    if (!token) {
      return NextResponse.json(
        { message: "Invalid or missing reset token." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Please enter a new password." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    await connectDB();

    // Hash the token exactly the same way as forgot-password route
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find active admin with valid, non-expired reset token
    const user = (await User.findOne({
      role: "admin",
      active: true,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select("+password")) as any;

    if (!user) {
      return NextResponse.json(
        {
          message:
            "This password reset link is invalid or has expired. Please request a new reset link.",
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and invalidate reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
