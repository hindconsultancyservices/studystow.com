import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing reset token.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a new password.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // Create the same SHA-256 hash used
    // when the reset token was created.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the user with a valid and non-expired reset token.
    // The reset fields are select:false in User.ts,
    // so explicitly include them here.
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link is invalid or has expired. Please request a new reset link.",
        },
        { status: 400 },
      );
    }

    // Hash the new password.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password.
    user.password = hashedPassword;

    // Invalidate the reset token after successful use.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("CUSTOMER RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to reset your password right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}
