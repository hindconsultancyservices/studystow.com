
import connectDB from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";

export async function getStoreSettings() {
  await connectDB();

  const saved = await StoreSettings.findOne()
    .select(
      "storeName currency guestCheckout phoneRequired addressRequired codEnabled razorpayEnabled testMode shippingEnabled freeShippingEnabled freeShippingAmount shippingCharge gstEnabled defaultGstRate maintenanceMode newsletter adminNotifications"
    )
    .lean();

  const settings = saved as Record<string, any> | null;

  const testMode = settings?.testMode ?? true;

  // Keep compatibility with the existing environment variables
  // for test mode. Live mode requires separate live credentials.
  const razorpayKeyId = testMode
    ? process.env.RAZORPAY_TEST_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      ""
    : process.env.RAZORPAY_LIVE_KEY_ID || "";

  const razorpayKeySecret = testMode
    ? process.env.RAZORPAY_TEST_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      ""
    : process.env.RAZORPAY_LIVE_KEY_SECRET || "";

  return {
    storeName: settings?.storeName ?? "StudyStow",
    currency: settings?.currency ?? "INR",

    guestCheckout: settings?.guestCheckout ?? true,
    phoneRequired: settings?.phoneRequired ?? true,
    addressRequired: settings?.addressRequired ?? true,

    codEnabled: settings?.codEnabled ?? true,
    razorpayEnabled: settings?.razorpayEnabled ?? true,
    testMode,

    shippingEnabled: settings?.shippingEnabled ?? true,
    freeShippingEnabled:
      settings?.freeShippingEnabled ?? true,
    freeShippingAmount:
      Number(settings?.freeShippingAmount ?? 999),
    shippingCharge:
      Number(settings?.shippingCharge ?? 60),

    gstEnabled: settings?.gstEnabled ?? true,
    defaultGstRate:
      Number(settings?.defaultGstRate ?? 18),

    maintenanceMode:
      settings?.maintenanceMode ?? false,
    newsletter: settings?.newsletter ?? true,
    adminNotifications:
      settings?.adminNotifications ?? true,

    razorpayKeyId,
    razorpayKeySecret,
    razorpayConfigured:
      Boolean(razorpayKeyId && razorpayKeySecret),
  };
}
