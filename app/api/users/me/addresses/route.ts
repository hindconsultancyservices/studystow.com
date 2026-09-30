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

    // CheckoutForm uses fullName
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
   GET /api/users/me/addresses
   ===================================================== */

export async function GET() {
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

    await connectDB();

    const addresses = await Address.find({
      user: session.user.id,
    })
      .sort({
        isDefault: -1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      data: addresses.map(serializeAddress),
    });
  } catch (error) {
    console.error(
      "GET /api/users/me/addresses error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load addresses.",
      },
      { status: 500 },
    );
  }
}

/* =====================================================
   POST /api/users/me/addresses
   ===================================================== */

export async function POST(request: NextRequest) {
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

    /*
     * CheckoutForm sends fullName.
     * We support both fullName and name.
     */
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
       CHECK EXISTING ADDRESSES
    ========================= */

    const existingCount =
      await Address.countDocuments({
        user: session.user.id,
      });

    /*
     * First address automatically becomes default.
     */
    const finalIsDefault =
      existingCount === 0
        ? true
        : isDefault;

    /*
     * If new address is default,
     * remove default from old addresses.
     */
    if (finalIsDefault) {
      await Address.updateMany(
        {
          user: session.user.id,
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
       SAVE TO MONGODB
    ========================= */

    const address = await Address.create({
      user: session.user.id,

      // The schema stores `name`; `fullName` is only used at the API boundary.
      name: fullName,

      phone,
      email,

      addressLine1,
      addressLine2,

      city,
      state,
      postalCode,
      country,

      label,

      isDefault: finalIsDefault,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Address saved successfully.",
        data: serializeAddress(address),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/users/me/addresses error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save address.",
      },
      { status: 500 },
    );
  }
}