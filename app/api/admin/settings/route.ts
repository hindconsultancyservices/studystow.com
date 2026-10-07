import { stripOwnerOnlySettings, OWNER_ONLY_SETTING_KEYS } from "@/lib/permissions";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";

const settingsSchema = z.object({
  // =========================
  // General
  // =========================
  storeName: z
    .string()
    .trim()
    .min(1, "Store name is required")
    .max(150),

  storeEmail: z
    .string()
    .trim()
    .email("Invalid store email")
    .max(200)
    .or(z.literal("")),

  storePhone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  storeAddress: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default(""),

  currency: z.enum(["INR", "USD"]),

  timezone: z
    .string()
    .trim()
    .min(1)
    .max(100),

  language: z.enum(["English", "Hindi"]),

  // =========================
  // Admin Profile
  // =========================
  adminName: z
    .string()
    .trim()
    .min(2, "Admin name is required")
    .max(100),

  adminEmail: z
    .string()
    .trim()
    .email("Invalid admin email")
    .max(200)
    .or(z.literal("")),

  // =========================
  // Security
  // =========================
  requireSecureAuthentication: z.boolean(),

  sessionDuration: z.enum(["1", "8", "24", "168"]),

  loginProtection: z.enum(["enabled", "disabled"]),

  // =========================
  // Orders
  // =========================
  orderEmail: z.boolean(),

  customerOrderEmail: z.boolean(),

  stockAlert: z.boolean(),

  lowStockLimit: z
    .number()
    .int()
    .min(0)
    .max(100000),

  // =========================
  // Checkout
  // =========================
  guestCheckout: z.boolean(),

  phoneRequired: z.boolean(),

  addressRequired: z.boolean(),

  // =========================
  // Payments
  // =========================
  codEnabled: z.boolean(),

  razorpayEnabled: z.boolean(),

  testMode: z.boolean(),

  // =========================
  // Shipping
  // =========================
  shippingEnabled: z.boolean(),

  freeShippingEnabled: z.boolean(),

  freeShippingAmount: z
    .number()
    .min(0),

  shippingCharge: z
    .number()
    .min(0),

  // =========================
  // Tax & GST
  // =========================
  gstEnabled: z.boolean(),

  gstNumber: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),

  defaultGstRate: z
    .number()
    .min(0)
    .max(100),

  // =========================
  // Email
  // =========================
  smtpEnabled: z.boolean(),

  smtpHost: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),

  smtpPort: z
    .number()
    .int()
    .min(1)
    .max(65535),

  // =========================
  // Notifications
  // =========================
  newsletter: z.boolean(),

  adminNotifications: z.boolean(),

  // =========================
  // SEO
  // =========================
  siteTitle: z
    .string()
    .trim()
    .min(1)
    .max(200),

  metaDescription: z
    .string()
    .trim()
    .max(160),

  canonicalUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),

  googleSearchConsole: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),

  // =========================
  // Maintenance
  // =========================
  maintenanceMode: z.boolean(),
});

/*
|--------------------------------------------------------------------------
| Default Settings
|--------------------------------------------------------------------------
*/

const defaultSettings = {
  storeName: "StudyStow",
  storeEmail: "",
  storePhone: "",
  storeAddress: "",

  currency: "INR" as const,
  timezone: "Asia/Kolkata",
  language: "English" as const,

  adminName: "Administrator",
  adminEmail: "",

  requireSecureAuthentication: true,
  sessionDuration: "24" as const,
  loginProtection: "enabled" as const,

  orderEmail: true,
  customerOrderEmail: true,
  stockAlert: true,
  lowStockLimit: 5,

  guestCheckout: true,
  phoneRequired: true,
  addressRequired: true,

  codEnabled: true,
  razorpayEnabled: true,
  testMode: true,

  shippingEnabled: true,
  freeShippingEnabled: true,
  freeShippingAmount: 999,
  shippingCharge: 60,

  gstEnabled: true,
  gstNumber: "",
  defaultGstRate: 18,

  smtpEnabled: false,
  smtpHost: "",
  smtpPort: 587,

  newsletter: true,
  adminNotifications: true,

  siteTitle: "StudyStow - Books & Educational Store",
  metaDescription:
    "Buy books, study materials and educational products online at StudyStow.",
  canonicalUrl: "",
  googleSearchConsole: "",

  maintenanceMode: false,
};

/*
|--------------------------------------------------------------------------
| GET /api/admin/settings
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const auth = await requireAdminPermission("settings", "view");
    if (!auth.ok) return auth.response;

    await connectDB();

    let settings = await StoreSettings.findOne().lean();

    /*
     * If settings do not exist yet, create the first document.
     */
    if (!settings) {
      const created = await StoreSettings.create(defaultSettings);

      settings = created.toObject();
    }

    const safeSettings = stripOwnerOnlySettings(
      auth.context.actor,
      settings as Record<string, unknown>
    );

    return NextResponse.json({
      success: true,
      data: safeSettings,
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load store settings",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/admin/settings
|--------------------------------------------------------------------------
*/

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminPermission("settings", "edit");
    if (!auth.ok) return auth.response;

    await connectDB();

    const body = await request.json();

    if (!auth.context.actor.isOwner) {
      const requested = body && typeof body === "object" ? body as Record<string, unknown> : {};
      const attemptedOwnerOnly = OWNER_ONLY_SETTING_KEYS.filter((key) =>
        Object.prototype.hasOwnProperty.call(requested, key)
      );

      if (attemptedOwnerOnly.length > 0) {
        return NextResponse.json(
          {
            success: false,
            code: "OWNER_ONLY_SETTING",
            message: "One or more requested settings are owner-only.",
            keys: attemptedOwnerOnly,
          },
          { status: 403 }
        );
      }
    }

    /*
     * Always update the existing settings document. We merge the incoming
     * values with the stored/default document before schema validation so
     * staff do not need to send owner-only fields that are intentionally
     * hidden from them.
     */
    let settings = await StoreSettings.findOne();

    const existingValues = settings
      ? (settings.toObject() as Record<string, unknown>)
      : (defaultSettings as Record<string, unknown>);

    const mergedInput = {
      ...existingValues,
      ...(body && typeof body === "object" ? body : {}),
    };

    const parsed = settingsSchema.safeParse(mergedInput);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid settings data",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!settings) {
      settings = new StoreSettings(data);
    } else {
      Object.assign(settings, data);
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: stripOwnerOnlySettings(
        auth.context.actor,
        settings.toObject() as Record<string, unknown>
      ),
    });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);

    /*
     * Handle duplicate-key situations safely.
     */
    if (
      error instanceof mongoose.Error &&
      "code" in error &&
      (error as mongoose.Error & { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Settings already exist. Please refresh the page and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save store settings",
      },
      { status: 500 }
    );
  }
}