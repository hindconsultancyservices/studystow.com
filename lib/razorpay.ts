import Razorpay from "razorpay";

// ============================================================
// RAZORPAY CONFIGURATION
// ============================================================

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    "Razorpay environment variables are not configured."
  );
}


// ============================================================
// RAZORPAY CLIENT
// ============================================================

export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || "",
  key_secret: RAZORPAY_KEY_SECRET || "",
});


// ============================================================
// TYPES
// ============================================================

export interface CreateRazorpayOrderOptions {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}


// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}: CreateRazorpayOrderOptions): Promise<RazorpayOrder> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local"
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid Razorpay order amount");
  }

  // Razorpay amount is always in the smallest currency unit.
  // INR uses paise.
  const amountInPaise = Math.round(amount * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency,
    receipt,
    notes,
  });

  return order as RazorpayOrder;
}


// ============================================================
// FETCH RAZORPAY ORDER
// ============================================================

export async function fetchRazorpayOrder(
  orderId: string
): Promise<RazorpayOrder> {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured."
    );
  }

  if (!orderId) {
    throw new Error("Razorpay order ID is required");
  }

  const order = await razorpay.orders.fetch(orderId);

  return order as RazorpayOrder;
}


// ============================================================
// FETCH RAZORPAY PAYMENT
// ============================================================

export async function fetchRazorpayPayment(
  paymentId: string
) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay is not configured."
    );
  }

  if (!paymentId) {
    throw new Error("Razorpay payment ID is required");
  }

  return razorpay.payments.fetch(paymentId);
}


// ============================================================
// VERIFY PAYMENT SIGNATURE
// ============================================================

import crypto from "crypto";

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay secret key is not configured."
    );
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf8"),
    Buffer.from(signature, "utf8")
  );
}


// ============================================================
// VERIFY WEBHOOK SIGNATURE
// ============================================================

export function verifyRazorpayWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured."
    );
  }

  if (!payload || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf8"),
    Buffer.from(signature, "utf8")
  );
}


// ============================================================
// RAZORPAY KEY FOR CLIENT
// ============================================================

export function getRazorpayKeyId() {
  if (!RAZORPAY_KEY_ID) {
    throw new Error(
      "RAZORPAY_KEY_ID is not configured."
    );
  }

  return RAZORPAY_KEY_ID;
}
