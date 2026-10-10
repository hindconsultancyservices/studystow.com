
import { NextResponse } from "next/server";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getStoreSettings();

    return NextResponse.json(
      {
        success: true,
        data: {
          storeName: settings.storeName,
          currency: settings.currency,

          guestCheckout: settings.guestCheckout,
          phoneRequired: settings.phoneRequired,
          addressRequired: settings.addressRequired,

          codEnabled: settings.codEnabled,

          // Hide Razorpay as an available option if credentials
          // for the selected environment are unavailable.
          razorpayEnabled:
            settings.razorpayEnabled &&
            settings.razorpayConfigured,

          shippingEnabled: settings.shippingEnabled,
          freeShippingEnabled:
            settings.freeShippingEnabled,
          freeShippingAmount:
            settings.freeShippingAmount,
          shippingCharge: settings.shippingCharge,

          gstEnabled: settings.gstEnabled,
          defaultGstRate: settings.defaultGstRate,

          maintenanceMode: settings.maintenanceMode,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/store/settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load store configuration.",
      },
      { status: 500 }
    );
  }
}
