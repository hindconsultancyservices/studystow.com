import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface IStoreSettings extends Document {
  // =========================
  // General
  // =========================
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: "INR" | "USD";
  timezone: string;
  language: "English" | "Hindi";

  // =========================
  // Admin Profile
  // =========================
  adminName: string;
  adminEmail: string;

  // =========================
  // Security
  // =========================
  requireSecureAuthentication: boolean;
  sessionDuration: string;
  loginProtection: "enabled" | "disabled";

  // =========================
  // Orders
  // =========================
  orderEmail: boolean;
  customerOrderEmail: boolean;
  stockAlert: boolean;
  lowStockLimit: number;

  // =========================
  // Checkout
  // =========================
  guestCheckout: boolean;
  phoneRequired: boolean;
  addressRequired: boolean;

  // =========================
  // Payments
  // =========================
  codEnabled: boolean;
  razorpayEnabled: boolean;
  testMode: boolean;

  // =========================
  // Shipping
  // =========================
  shippingEnabled: boolean;
  freeShippingEnabled: boolean;
  freeShippingAmount: number;
  shippingCharge: number;

  // =========================
  // Tax & GST
  // =========================
  gstEnabled: boolean;
  gstNumber: string;
  defaultGstRate: number;

  // =========================
  // Email
  // =========================
  smtpEnabled: boolean;
  smtpHost: string;
  smtpPort: number;

  // =========================
  // Notifications
  // =========================
  newsletter: boolean;
  adminNotifications: boolean;

  // =========================
  // SEO
  // =========================
  siteTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  googleSearchConsole: string;

  // =========================
  // Maintenance
  // =========================
  maintenanceMode: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    // =========================
    // General
    // =========================
    storeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      default: "StudyStow",
    },

    storeEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      default: "",
    },

    storePhone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    storeAddress: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "INR",
      required: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      required: true,
      trim: true,
    },

    language: {
      type: String,
      enum: ["English", "Hindi"],
      default: "English",
      required: true,
    },

    // =========================
    // Admin Profile
    // =========================
    adminName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Administrator",
    },

    adminEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      default: "",
    },

    // =========================
    // Security
    // =========================
    requireSecureAuthentication: {
      type: Boolean,
      default: true,
    },

    sessionDuration: {
      type: String,
      enum: ["1", "8", "24", "168"],
      default: "24",
    },

    loginProtection: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled",
    },

    // =========================
    // Orders
    // =========================
    orderEmail: {
      type: Boolean,
      default: true,
    },

    customerOrderEmail: {
      type: Boolean,
      default: true,
    },

    stockAlert: {
      type: Boolean,
      default: true,
    },

    lowStockLimit: {
      type: Number,
      min: 0,
      max: 100000,
      default: 5,
    },

    // =========================
    // Checkout
    // =========================
    guestCheckout: {
      type: Boolean,
      default: true,
    },

    phoneRequired: {
      type: Boolean,
      default: true,
    },

    addressRequired: {
      type: Boolean,
      default: true,
    },

    // =========================
    // Payments
    // =========================
    codEnabled: {
      type: Boolean,
      default: true,
    },

    razorpayEnabled: {
      type: Boolean,
      default: true,
    },

    testMode: {
      type: Boolean,
      default: true,
    },

    // =========================
    // Shipping
    // =========================
    shippingEnabled: {
      type: Boolean,
      default: true,
    },

    freeShippingEnabled: {
      type: Boolean,
      default: true,
    },

    freeShippingAmount: {
      type: Number,
      min: 0,
      default: 999,
    },

    shippingCharge: {
      type: Number,
      min: 0,
      default: 60,
    },

    // =========================
    // Tax & GST
    // =========================
    gstEnabled: {
      type: Boolean,
      default: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 30,
      default: "",
    },

    defaultGstRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 18,
    },

    // =========================
    // Email
    // =========================
    smtpEnabled: {
      type: Boolean,
      default: false,
    },

    smtpHost: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    smtpPort: {
      type: Number,
      min: 1,
      max: 65535,
      default: 587,
    },

    // =========================
    // Notifications
    // =========================
    newsletter: {
      type: Boolean,
      default: true,
    },

    adminNotifications: {
      type: Boolean,
      default: true,
    },

    // =========================
    // SEO
    // =========================
    siteTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "StudyStow - Books & Educational Store",
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
      default:
        "Buy books, study materials and educational products online at StudyStow.",
    },

    canonicalUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    googleSearchConsole: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // =========================
    // Maintenance
    // =========================
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Only one global store-settings document should exist.
 * This makes it easy to update the same settings document
 * instead of creating a new document every time.
 */
StoreSettingsSchema.index(
  { storeName: 1 },
  { unique: true }
);

const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>(
    "StoreSettings",
    StoreSettingsSchema
  );

export default StoreSettings;