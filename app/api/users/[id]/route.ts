import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Check login
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to update your profile.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    // Validate name
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name cannot exceed 100 characters.",
        },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone && phone.length > 15) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number cannot exceed 15 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find logged-in user by session email
    const loggedInUser = await User.findOne({
      email: session.user.email.toLowerCase().trim(),
    }).select("_id");

    if (!loggedInUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        { status: 404 }
      );
    }

    // Prevent editing another user's profile
    if (String(loggedInUser._id) !== String(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to update this profile.",
        },
        { status: 403 }
      );
    }

    // Update only allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          phone,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("_id name email phone role active createdAt updatedAt");

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your profile right now.",
      },
      { status: 500 }
    );
  }
}