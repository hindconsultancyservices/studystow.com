"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Package,
  ReceiptIndianRupee,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";

type SectionId =
  | "general"
  | "profile"
  | "security"
  | "orders"
  | "checkout"
  | "payments"
  | "shipping"
  | "tax"
  | "email"
  | "notifications"
  | "seo"
  | "maintenance";

const sections: {
  id: SectionId;
  title: string;
  description: string;
  icon: typeof Store;
}[] = [
  {
    id: "general",
    title: "General",
    description: "Store name, contact and regional settings",
    icon: Store,
  },
  {
    id: "profile",
    title: "Admin Profile",
    description: "Your admin account information",
    icon: UserRound,
  },
  {
    id: "security",
    title: "Security",
    description: "Password, recovery and account security",
    icon: ShieldCheck,
  },
  {
    id: "orders",
    title: "Orders",
    description: "Order status and order management",
    icon: ShoppingCart,
  },
  {
    id: "checkout",
    title: "Checkout",
    description: "Customer checkout preferences",
    icon: ReceiptIndianRupee,
  },
  {
    id: "payments",
    title: "Payments",
    description: "Payment and Razorpay configuration",
    icon: CreditCard,
  },
  {
    id: "shipping",
    title: "Shipping",
    description: "Delivery and shipping configuration",
    icon: Truck,
  },
  {
    id: "tax",
    title: "Tax & GST",
    description: "GST and tax configuration",
    icon: ReceiptIndianRupee,
  },
  {
    id: "email",
    title: "Email",
    description: "Store email and SMTP configuration",
    icon: Mail,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Admin and customer notifications",
    icon: Bell,
  },
  {
    id: "seo",
    title: "SEO",
    description: "Search engine and website settings",
    icon: Search,
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Store availability and maintenance mode",
    icon: Wrench,
  },
];

const validSectionIds = new Set<SectionId>(
  sections.map((section) => section.id)
);

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("general");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // General
  // =========================
  const [storeName, setStoreName] = useState("StudyStow");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("English");

  // =========================
  // Admin Profile
  // =========================
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState("");

  // =========================
  // Security
  // =========================
  const [requireSecureAuthentication, setRequireSecureAuthentication] =
    useState(true);
  const [sessionDuration, setSessionDuration] = useState("24");
  const [loginProtection, setLoginProtection] = useState("enabled");

  // =========================
  // Orders
  // =========================
  const [orderEmail, setOrderEmail] = useState(true);
  const [customerOrderEmail, setCustomerOrderEmail] = useState(true);
  const [stockAlert, setStockAlert] = useState(true);
  const [lowStockLimit, setLowStockLimit] = useState("5");

  // =========================
  // Checkout
  // =========================
  const [guestCheckout, setGuestCheckout] = useState(true);
  const [phoneRequired, setPhoneRequired] = useState(true);
  const [addressRequired, setAddressRequired] = useState(true);

  // =========================
  // Payments
  // =========================
  const [codEnabled, setCodEnabled] = useState(true);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [testMode, setTestMode] = useState(true);

  // =========================
  // Shipping
  // =========================
  const [shippingEnabled, setShippingEnabled] = useState(true);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);
  const [freeShippingAmount, setFreeShippingAmount] = useState("999");
  const [shippingCharge, setShippingCharge] = useState("60");

  // =========================
  // Tax
  // =========================
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstNumber, setGstNumber] = useState("");
  const [defaultGstRate, setDefaultGstRate] = useState("18");

  // =========================
  // Email
  // =========================
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");

  // =========================
  // Notifications
  // =========================
  const [newsletter, setNewsletter] = useState(true);
  const [adminNotifications, setAdminNotifications] = useState(true);

  // =========================
  // SEO
  // =========================
  const [siteTitle, setSiteTitle] = useState(
    "StudyStow - Books & Educational Store"
  );

  const [metaDescription, setMetaDescription] = useState(
    "Buy books, study materials and educational products online at StudyStow."
  );

  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [googleSearchConsole, setGoogleSearchConsole] = useState("");

  // =========================
  // Maintenance
  // =========================
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Read active section from URL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");

    if (
      section &&
      validSectionIds.has(section as SectionId)
    ) {
      setActiveSection(section as SectionId);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Change section + preserve it in URL
  |--------------------------------------------------------------------------
  */

  function toggleSection(id: SectionId) {
    setActiveSection(id);

    const url = new URL(window.location.href);

    url.searchParams.set("section", id);

    window.history.replaceState(
      {},
      "",
      `${url.pathname}?${url.searchParams.toString()}`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Load settings
  |--------------------------------------------------------------------------
  */

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/settings", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Failed to load settings."
        );
      }

      const data = result.data;

      // General
      setStoreName(data.storeName ?? "StudyStow");
      setStoreEmail(data.storeEmail ?? "");
      setStorePhone(data.storePhone ?? "");
      setStoreAddress(data.storeAddress ?? "");
      setCurrency(data.currency ?? "INR");
      setTimezone(data.timezone ?? "Asia/Kolkata");
      setLanguage(data.language ?? "English");

      // Profile
      setAdminName(data.adminName ?? "Administrator");
      setAdminEmail(data.adminEmail ?? "");

      // Security
      setRequireSecureAuthentication(
        data.requireSecureAuthentication ?? true
      );
      setSessionDuration(data.sessionDuration ?? "24");
      setLoginProtection(data.loginProtection ?? "enabled");

      // Orders
      setOrderEmail(data.orderEmail ?? true);
      setCustomerOrderEmail(data.customerOrderEmail ?? true);
      setStockAlert(data.stockAlert ?? true);
      setLowStockLimit(String(data.lowStockLimit ?? 5));

      // Checkout
      setGuestCheckout(data.guestCheckout ?? true);
      setPhoneRequired(data.phoneRequired ?? true);
      setAddressRequired(data.addressRequired ?? true);

      // Payments
      setCodEnabled(data.codEnabled ?? true);
      setRazorpayEnabled(data.razorpayEnabled ?? true);
      setTestMode(data.testMode ?? true);

      // Shipping
      setShippingEnabled(data.shippingEnabled ?? true);
      setFreeShippingEnabled(
        data.freeShippingEnabled ?? true
      );
      setFreeShippingAmount(
        String(data.freeShippingAmount ?? 999)
      );
      setShippingCharge(
        String(data.shippingCharge ?? 60)
      );

      // Tax
      setGstEnabled(data.gstEnabled ?? true);
      setGstNumber(data.gstNumber ?? "");
      setDefaultGstRate(
        String(data.defaultGstRate ?? 18)
      );

      // Email
      setSmtpEnabled(data.smtpEnabled ?? false);
      setSmtpHost(data.smtpHost ?? "");
      setSmtpPort(String(data.smtpPort ?? 587));

      // Notifications
      setNewsletter(data.newsletter ?? true);
      setAdminNotifications(
        data.adminNotifications ?? true
      );

      // SEO
      setSiteTitle(
        data.siteTitle ??
          "StudyStow - Books & Educational Store"
      );

      setMetaDescription(
        data.metaDescription ??
          "Buy books, study materials and educational products online at StudyStow."
      );

      setCanonicalUrl(data.canonicalUrl ?? "");
      setGoogleSearchConsole(
        data.googleSearchConsole ?? ""
      );

      // Maintenance
      setMaintenanceMode(
        data.maintenanceMode ?? false
      );
    } catch (err) {
      console.error("Load settings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Save settings
  |--------------------------------------------------------------------------
  */

  async function handleSave() {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const payload = {
        // General
        storeName: storeName.trim(),
        storeEmail: storeEmail.trim(),
        storePhone: storePhone.trim(),
        storeAddress: storeAddress.trim(),
        currency,
        timezone,
        language,

        // Profile
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),

        // Security
        requireSecureAuthentication,
        sessionDuration,
        loginProtection,

        // Orders
        orderEmail,
        customerOrderEmail,
        stockAlert,
        lowStockLimit: Number(lowStockLimit) || 0,

        // Checkout
        guestCheckout,
        phoneRequired,
        addressRequired,

        // Payments
        codEnabled,
        razorpayEnabled,
        testMode,

        // Shipping
        shippingEnabled,
        freeShippingEnabled,
        freeShippingAmount:
          Number(freeShippingAmount) || 0,
        shippingCharge: Number(shippingCharge) || 0,

        // Tax
        gstEnabled,
        gstNumber: gstNumber.trim(),
        defaultGstRate:
          Number(defaultGstRate) || 0,

        // Email
        smtpEnabled,
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 587,

        // Notifications
        newsletter,
        adminNotifications,

        // SEO
        siteTitle: siteTitle.trim(),
        metaDescription: metaDescription.trim(),
        canonicalUrl: canonicalUrl.trim(),
        googleSearchConsole:
          googleSearchConsole.trim(),

        // Maintenance
        maintenanceMode,
      };

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
            "Failed to save settings."
        );
      }

      setSaved(true);

      /*
       * Update UI from the actual database response.
       * This prevents differences between the local state
       * and the value MongoDB actually saved.
       */
      if (result.data) {
        const data = result.data;

        setStoreName(data.storeName ?? "");
        setStoreEmail(data.storeEmail ?? "");
        setStorePhone(data.storePhone ?? "");
        setStoreAddress(data.storeAddress ?? "");
        setCurrency(data.currency ?? "INR");
        setTimezone(
          data.timezone ?? "Asia/Kolkata"
        );
        setLanguage(data.language ?? "English");

        setAdminName(
          data.adminName ?? "Administrator"
        );
        setAdminEmail(data.adminEmail ?? "");

        setRequireSecureAuthentication(
          data.requireSecureAuthentication ?? true
        );
        setSessionDuration(
          data.sessionDuration ?? "24"
        );
        setLoginProtection(
          data.loginProtection ?? "enabled"
        );

        setOrderEmail(data.orderEmail ?? true);
        setCustomerOrderEmail(
          data.customerOrderEmail ?? true
        );
        setStockAlert(data.stockAlert ?? true);
        setLowStockLimit(
          String(data.lowStockLimit ?? 5)
        );

        setGuestCheckout(
          data.guestCheckout ?? true
        );
        setPhoneRequired(
          data.phoneRequired ?? true
        );
        setAddressRequired(
          data.addressRequired ?? true
        );

        setCodEnabled(data.codEnabled ?? true);
        setRazorpayEnabled(
          data.razorpayEnabled ?? true
        );
        setTestMode(data.testMode ?? true);

        setShippingEnabled(
          data.shippingEnabled ?? true
        );
        setFreeShippingEnabled(
          data.freeShippingEnabled ?? true
        );
        setFreeShippingAmount(
          String(data.freeShippingAmount ?? 999)
        );
        setShippingCharge(
          String(data.shippingCharge ?? 60)
        );

        setGstEnabled(data.gstEnabled ?? true);
        setGstNumber(data.gstNumber ?? "");
        setDefaultGstRate(
          String(data.defaultGstRate ?? 18)
        );

        setSmtpEnabled(
          data.smtpEnabled ?? false
        );
        setSmtpHost(data.smtpHost ?? "");
        setSmtpPort(
          String(data.smtpPort ?? 587)
        );

        setNewsletter(data.newsletter ?? true);
        setAdminNotifications(
          data.adminNotifications ?? true
        );

        setSiteTitle(
          data.siteTitle ??
            "StudyStow - Books & Educational Store"
        );

        setMetaDescription(
          data.metaDescription ??
            "Buy books, study materials and educational products online at StudyStow."
        );

        setCanonicalUrl(
          data.canonicalUrl ?? ""
        );

        setGoogleSearchConsole(
          data.googleSearchConsole ?? ""
        );

        setMaintenanceMode(
          data.maintenanceMode ?? false
        );
      }

      window.setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      console.error("Save settings error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading store settings...
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Settings2 className="h-4 w-4" />
            Admin
            <ChevronRight className="h-4 w-4" />
            Settings
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">
              {activeSection}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Store Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure your StudyStow store, admin account,
            checkout, payments and website preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success */}
      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <Check className="h-4 w-4" />
          Settings saved successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Settings error
            </p>

            <p className="mt-1">{error}</p>
          </div>

          <button
            type="button"
            onClick={loadSettings}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* =========================
            Settings Navigation
        ========================= */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-24">
          <div className="mb-2 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Configuration
            </p>
          </div>

          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const active =
                activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    toggleSection(section.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {section.title}
                    </p>

                    <p
                      className={`mt-0.5 truncate text-[11px] ${
                        active
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* =========================
            Settings Content
        ========================= */}
        <div className="space-y-6">
          {/* GENERAL */}
          {activeSection === "general" && (
            <SettingsCard
              icon={<Store className="h-5 w-5" />}
              title="General Store Settings"
              description="Basic information and regional configuration."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Store Name"
                  value={storeName}
                  onChange={setStoreName}
                />

                <Field
                  label="Store Email"
                  type="email"
                  placeholder="admin@studystow.com"
                  value={storeEmail}
                  onChange={setStoreEmail}
                />

                <Field
                  label="Store Phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={storePhone}
                  onChange={setStorePhone}
                />

                <SelectField
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    ["INR", "INR - Indian Rupee"],
                    ["USD", "USD - US Dollar"],
                  ]}
                />

                <SelectField
                  label="Timezone"
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    [
                      "Asia/Kolkata",
                      "India - Asia/Kolkata",
                    ],
                    ["UTC", "UTC"],
                  ]}
                />

                <SelectField
                  label="Default Language"
                  value={language}
                  onChange={setLanguage}
                  options={[
                    ["English", "English"],
                    ["Hindi", "Hindi"],
                  ]}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Store Address
                </label>

                <textarea
                  value={storeAddress}
                  onChange={(e) =>
                    setStoreAddress(e.target.value)
                  }
                  rows={4}
                  placeholder="Enter complete business/store address"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </SettingsCard>
          )}

          {/* PROFILE */}
          {activeSection === "profile" && (
            <SettingsCard
              icon={<UserRound className="h-5 w-5" />}
              title="Admin Profile"
              description="Manage the administrator account information."
            >
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white">
                  <UserRound className="h-7 w-7" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {adminName || "Administrator"}
                  </p>

                  <p className="text-sm text-slate-500">
                    Store Administrator
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Admin Name"
                  value={adminName}
                  onChange={setAdminName}
                />

                <Field
                  label="Admin Email"
                  type="email"
                  placeholder="admin@studystow.com"
                  value={adminEmail}
                  onChange={setAdminEmail}
                />
              </div>
            </SettingsCard>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <>
              <SettingsCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Security & Password"
                description="Protect your administrator account."
              >
                <div className="space-y-4">
                  <ActionRow
                    icon={
                      <LockKeyhole className="h-5 w-5" />
                    }
                    title="Change Password"
                    description="Change your current administrator password."
                    href="/admin/profile"
                    buttonText="Change Password"
                  />

                  <ActionRow
                    icon={
                      <KeyRound className="h-5 w-5" />
                    }
                    title="Password Recovery"
                    description="Reset your admin password through email."
                    href="/admin/forgot-password"
                    buttonText="Password Recovery"
                  />

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Security recommendation
                        </p>

                        <p className="mt-1 text-sm text-amber-700">
                          Use a strong unique password and keep
                          your recovery email accessible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Session Security"
                description="Additional controls for administrator access."
              >
                <ToggleRow
                  title="Require secure authentication"
                  description="Allow administrator access only through the authenticated login flow."
                  enabled={requireSecureAuthentication}
                  onChange={
                    setRequireSecureAuthentication
                  }
                />

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Session Duration"
                    value={sessionDuration}
                    onChange={setSessionDuration}
                    options={[
                      ["1", "1 hour"],
                      ["8", "8 hours"],
                      ["24", "24 hours"],
                      ["168", "7 days"],
                    ]}
                  />

                  <SelectField
                    label="Login Protection"
                    value={loginProtection}
                    onChange={setLoginProtection}
                    options={[
                      ["enabled", "Enabled"],
                      ["disabled", "Disabled"],
                    ]}
                  />
                </div>
              </SettingsCard>
            </>
          )}

          {/* ORDERS */}
          {activeSection === "orders" && (
            <SettingsCard
              icon={<ShoppingCart className="h-5 w-5" />}
              title="Order Management"
              description="Control how orders are processed."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="New Order Email"
                  description="Notify the admin when a new order is placed."
                  enabled={orderEmail}
                  onChange={setOrderEmail}
                />

                <ToggleRow
                  title="Customer Order Confirmation"
                  description="Send order confirmation emails to customers."
                  enabled={customerOrderEmail}
                  onChange={setCustomerOrderEmail}
                />

                <ToggleRow
                  title="Low Stock Alerts"
                  description="Notify the admin when a book reaches the low-stock limit."
                  enabled={stockAlert}
                  onChange={setStockAlert}
                />

                <div className="max-w-sm">
                  <Field
                    label="Low Stock Threshold"
                    type="number"
                    value={lowStockLimit}
                    onChange={setLowStockLimit}
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {/* CHECKOUT */}
          {activeSection === "checkout" && (
            <SettingsCard
              icon={
                <ShoppingCart className="h-5 w-5" />
              }
              title="Checkout Settings"
              description="Configure the customer checkout experience."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="Guest Checkout"
                  description="Allow customers to place orders without creating an account."
                  enabled={guestCheckout}
                  onChange={setGuestCheckout}
                />

                <ToggleRow
                  title="Require Phone Number"
                  description="Require customers to provide a phone number during checkout."
                  enabled={phoneRequired}
                  onChange={setPhoneRequired}
                />

                <ToggleRow
                  title="Require Full Address"
                  description="Require a complete shipping address before placing an order."
                  enabled={addressRequired}
                  onChange={setAddressRequired}
                />
              </div>
            </SettingsCard>
          )}

          {/* PAYMENTS */}
          {activeSection === "payments" && (
            <SettingsCard
              icon={<CreditCard className="h-5 w-5" />}
              title="Payment Settings"
              description="Configure available payment methods."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="Razorpay"
                  description="Accept online payments through Razorpay."
                  enabled={razorpayEnabled}
                  onChange={setRazorpayEnabled}
                />

                <ToggleRow
                  title="Cash on Delivery"
                  description="Allow customers to pay when the order is delivered."
                  enabled={codEnabled}
                  onChange={setCodEnabled}
                />

                <ToggleRow
                  title="Razorpay Test Mode"
                  description="Use Razorpay test credentials instead of live payment credentials."
                  enabled={testMode}
                  onChange={setTestMode}
                />
              </div>

              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 text-slate-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      API credentials
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Razorpay API keys should remain in
                      environment variables, not this page.
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* SHIPPING */}
          {activeSection === "shipping" && (
            <SettingsCard
              icon={<Truck className="h-5 w-5" />}
              title="Shipping & Delivery"
              description="Configure delivery charges and free shipping."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="Shipping"
                  description="Enable shipping charges for physical orders."
                  enabled={shippingEnabled}
                  onChange={setShippingEnabled}
                />

                <ToggleRow
                  title="Free Shipping"
                  description="Enable free shipping when the order reaches the configured amount."
                  enabled={freeShippingEnabled}
                  onChange={setFreeShippingEnabled}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Free Shipping Above"
                    type="number"
                    prefix="₹"
                    value={freeShippingAmount}
                    onChange={setFreeShippingAmount}
                  />

                  <Field
                    label="Default Shipping Charge"
                    type="number"
                    prefix="₹"
                    value={shippingCharge}
                    onChange={setShippingCharge}
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {/* TAX */}
          {activeSection === "tax" && (
            <SettingsCard
              icon={
                <ReceiptIndianRupee className="h-5 w-5" />
              }
              title="Tax & GST"
              description="Configure GST and tax-related store settings."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="Enable GST"
                  description="Apply GST configuration to eligible products and orders."
                  enabled={gstEnabled}
                  onChange={setGstEnabled}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="GST Number"
                    placeholder="Enter GSTIN"
                    value={gstNumber}
                    onChange={setGstNumber}
                  />

                  <Field
                    label="Default GST Rate"
                    type="number"
                    suffix="%"
                    value={defaultGstRate}
                    onChange={setDefaultGstRate}
                  />
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                  GST settings should match your actual tax
                  registration and product requirements.
                </div>
              </div>
            </SettingsCard>
          )}

          {/* EMAIL */}
          {activeSection === "email" && (
            <SettingsCard
              icon={<Mail className="h-5 w-5" />}
              title="Email Configuration"
              description="Configure outgoing store emails."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="SMTP Email"
                  description="Use SMTP for transactional emails."
                  enabled={smtpEnabled}
                  onChange={setSmtpEnabled}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="SMTP Host"
                    placeholder="smtp.example.com"
                    value={smtpHost}
                    onChange={setSmtpHost}
                  />

                  <Field
                    label="SMTP Port"
                    type="number"
                    value={smtpPort}
                    onChange={setSmtpPort}
                  />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Email features
                  </p>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <span>• Order confirmation</span>
                    <span>• Password recovery</span>
                    <span>• Password reset</span>
                    <span>• Contact form emails</span>
                    <span>• Shipping updates</span>
                    <span>• Admin alerts</span>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <SettingsCard
              icon={<Bell className="h-5 w-5" />}
              title="Notifications"
              description="Control store and administrator notifications."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="Admin Notifications"
                  description="Receive important store notifications in the admin panel."
                  enabled={adminNotifications}
                  onChange={setAdminNotifications}
                />

                <ToggleRow
                  title="Newsletter Signup"
                  description="Allow customers to subscribe to store updates."
                  enabled={newsletter}
                  onChange={setNewsletter}
                />

                <ToggleRow
                  title="Low Stock Notification"
                  description="Notify administrators when inventory is running low."
                  enabled={stockAlert}
                  onChange={setStockAlert}
                />
              </div>
            </SettingsCard>
          )}

          {/* SEO */}
          {activeSection === "seo" && (
            <SettingsCard
              icon={<Search className="h-5 w-5" />}
              title="SEO Settings"
              description="Configure the basic search engine information for StudyStow."
            >
              <div className="space-y-5">
                <Field
                  label="Website Title"
                  value={siteTitle}
                  onChange={setSiteTitle}
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Meta Description
                  </label>

                  <textarea
                    value={metaDescription}
                    onChange={(e) =>
                      setMetaDescription(e.target.value)
                    }
                    rows={4}
                    maxLength={160}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {metaDescription.length}/160
                    characters
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Canonical Website URL"
                    placeholder="https://studystow.com"
                    value={canonicalUrl}
                    onChange={setCanonicalUrl}
                  />

                  <Field
                    label="Google Search Console"
                    placeholder="Verification code"
                    value={googleSearchConsole}
                    onChange={setGoogleSearchConsole}
                  />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    SEO checklist
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <p>✓ Sitemap</p>
                    <p>✓ Robots.txt</p>
                    <p>✓ Product metadata</p>
                    <p>✓ Category metadata</p>
                    <p>✓ Open Graph metadata</p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* MAINTENANCE */}
          {activeSection === "maintenance" && (
            <SettingsCard
              icon={<Wrench className="h-5 w-5" />}
              title="Maintenance Mode"
              description="Temporarily restrict access to the customer storefront."
            >
              <div className="space-y-5">
                <ToggleRow
                  title="Maintenance Mode"
                  description="Temporarily show a maintenance page to storefront visitors."
                  enabled={maintenanceMode}
                  onChange={setMaintenanceMode}
                />

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Use with caution
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        Enabling maintenance mode can prevent
                        customers from accessing the storefront.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* QUICK LINKS */}
          <div className="grid gap-4 md:grid-cols-3">
            <QuickLink
              icon={<Package className="h-5 w-5" />}
              title="Inventory"
              description="Manage stock"
              href="/admin/inventory"
            />

            <QuickLink
              icon={<MapPin className="h-5 w-5" />}
              title="Store Pages"
              description="Manage website pages"
              href="/admin/pages"
            />

            <QuickLink
              icon={<Globe className="h-5 w-5" />}
              title="View Store"
              description="Open storefront"
              href="/"
            />
          </div>

          {/* Bottom Save */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                Save your configuration
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Changes are stored in your database.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Reusable Components
========================================================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-200 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value = "",
  onChange,
  type = "text",
  placeholder,
  prefix,
  suffix,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange?.(e.target.value)
          }
          placeholder={placeholder}
          className={`w-full rounded-lg border border-slate-300 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 ${
            prefix
              ? "pl-8 pr-3"
              : suffix
                ? "pl-3 pr-9"
                : "px-3"
          }`}
        />

        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 ${
        disabled ? "opacity-70" : ""
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          onChange(!enabled)
        }
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-slate-950"
            : "bg-slate-300"
        } ${
          disabled
            ? "cursor-not-allowed"
            : ""
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ActionRow({
  icon,
  title,
  description,
  href,
  buttonText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-600">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {buttonText}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function QuickLink({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
    </Link>
  );
}