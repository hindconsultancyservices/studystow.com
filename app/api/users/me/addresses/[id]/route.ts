import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Address from "@/models/Address";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function serializeAddress(address: any) {
  const id = address._id?.toString();

  return {
    _id: id,
    id,

    fullName: address.fullName || address.name || "",
    name: address.name || address.fullName || "",

    phone: address.phone || "",
    email: address.email || "",

    addressLine1: address.addressLine1 || "",
    addressLine2: address.addressLine2 || "",

    city: address.city || "",
    state: address.state || "",
    postalCode: address.postalCode || "",
    country: address.country || "India",

    label: address.label || "HOME",

    isDefault: Boolean(address.isDefault),

    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

/* =====================================================
   GET /api/users/me/addresses/[id]
   ===================================================== */

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Address ID is required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const address = await Address.findOne({
      _id: id,
      user: session.user.id,
    }).lean();

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeAddress(address),
    });
  } catch (error) {
    console.error(
      "GET /api/users/me/addresses/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load address.",
      },
      { status: 500 },
    );
  }
}

/* =====================================================
   PUT /api/users/me/addresses/[id]
   ===================================================== */

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Address ID is required.",
        },
        { status: 400 },
      );
    }

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request.",
        },
        { status: 400 },
      );
    }

    const fullName = clean(
      body.fullName || body.name,
    );

    const phone = clean(body.phone);
    const email = clean(body.email);

    const addressLine1 = clean(
      body.addressLine1,
    );

    const addressLine2 = clean(
      body.addressLine2,
    );

    const city = clean(body.city);
    const state = clean(body.state);
    const postalCode = clean(body.postalCode);

    const country =
      clean(body.country) || "India";

    const label =
      clean(body.label) || "HOME";

    const isDefault = Boolean(
      body.isDefault,
    );

    /* =========================
       VALIDATION
    ========================= */

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required.",
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 },
      );
    }

    if (!addressLine1) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required.",
        },
        { status: 400 },
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message: "City is required.",
        },
        { status: 400 },
      );
    }

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          message: "State is required.",
        },
        { status: 400 },
      );
    }

    if (!postalCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Postal code is required.",
        },
        { status: 400 },
      );
    }

    if (!/^\d{6}$/.test(postalCode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Postal code must contain exactly 6 digits.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /* =========================
       FIND USER'S ADDRESS
    ========================= */

    const existingAddress =
      await Address.findOne({
        _id: id,
        user: session.user.id,
      });

    if (!existingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found.",
        },
        { status: 404 },
      );
    }

    /* =========================
       DEFAULT ADDRESS
    ========================= */

    if (isDefault) {
      await Address.updateMany(
        {
          user: session.user.id,
          _id: { $ne: id },
          isDefault: true,
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    /* =========================
       UPDATE ADDRESS
    ========================= */

    existingAddress.name = fullName;
    existingAddress.phone = phone;
    existingAddress.email = email;

    existingAddress.addressLine1 =
      addressLine1;

    existingAddress.addressLine2 =
      addressLine2;

    existingAddress.city = city;
    existingAddress.state = state;
    existingAddress.postalCode =
      postalCode;

    existingAddress.country = country;
    existingAddress.label = label;
    existingAddress.isDefault = isDefault;

    await existingAddress.save();

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      data: serializeAddress(existingAddress),
    });
  } catch (error) {
    console.error(
      "PUT /api/users/me/addresses/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update address.",
      },
      { status: 500 },
    );
  }
}

/* =====================================================
   DELETE /api/users/me/addresses/[id]
   ===================================================== */

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 },
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Address ID is required.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    /* =========================
       FIND USER'S ADDRESS
    ========================= */

    const address =
      await Address.findOne({
        _id: id,
        user: session.user.id,
      });

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found.",
        },
        { status: 404 },
      );
    }

    const wasDefault =
      Boolean(address.isDefault);

    /* =========================
       DELETE
    ========================= */

    await Address.deleteOne({
      _id: id,
      user: session.user.id,
    });

    /* =========================
       MAKE ANOTHER ADDRESS DEFAULT
       IF REQUIRED
    ========================= */

    if (wasDefault) {
      const nextAddress =
        await Address.findOne({
          user: session.user.id,
        }).sort({
          createdAt: -1,
        });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/users/me/addresses/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete address.",
      },
      { status: 500 },
    );
  }
}