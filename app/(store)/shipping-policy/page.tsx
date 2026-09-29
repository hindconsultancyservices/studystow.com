import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <Truck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Shipping Policy
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Last updated: September 2026
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600">
            This Shipping Policy explains how StudyStow processes, ships, and
            delivers orders placed through our website. Delivery times and
            shipping charges may vary depending on your location, order,
            product availability, and delivery service.
          </p>
        </div>
      </section>

      {/* Quick Information */}
      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={<Package className="h-6 w-6 text-blue-600" />}
            title="Order Processing"
            description="Orders are generally processed after successful order confirmation."
          />

          <InfoCard
            icon={<Truck className="h-6 w-6 text-green-600" />}
            title="Delivery"
            description="Delivery time depends on destination and courier availability."
          />

          <InfoCard
            icon={<MapPin className="h-6 w-6 text-purple-600" />}
            title="Tracking"
            description="Tracking details may be provided after the order is shipped."
          />

          <InfoCard
            icon={<ShieldCheck className="h-6 w-6 text-orange-600" />}
            title="Secure Packaging"
            description="Products are packed appropriately before dispatch."
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="rounded-2xl border bg-white shadow-sm">
          <div className="p-6 sm:p-10">
            <div className="space-y-10">
              {/* 01 */}
              <section>
                <SectionTitle
                  number="01"
                  title="Order Processing"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Once an order is successfully placed and confirmed, StudyStow
                  begins the order processing and fulfillment process.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Orders are generally processed during our normal business
                  operations. Processing may take additional time during
                  weekends, public holidays, promotional periods, or periods
                  of unusually high order volume.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <p className="text-sm leading-6 text-blue-800">
                    An order confirmation does not necessarily mean that the
                    order has already been shipped. Shipping begins after the
                    order has been processed and handed to the applicable
                    delivery partner.
                  </p>
                </div>
              </section>

              {/* 02 */}
              <section>
                <SectionTitle
                  number="02"
                  title="Shipping Charges"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Applicable shipping charges, if any, will be displayed during
                  checkout before you complete your purchase.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Shipping charges may vary based on factors such as delivery
                  location, order value, package size, weight, shipping method,
                  promotional offers, and applicable service availability.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If free shipping is offered on eligible orders, the
                  applicable eligibility requirements will be displayed on the
                  website or during checkout.
                </p>
              </section>

              {/* 03 */}
              <section>
                <SectionTitle
                  number="03"
                  title="Estimated Delivery Time"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Estimated delivery times depend on the destination and the
                  availability of delivery services in that area.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border bg-gray-50 p-5">
                    <Truck className="h-6 w-6 text-gray-700" />

                    <h3 className="mt-3 font-semibold text-gray-900">
                      Standard Delivery
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Estimated delivery information, where available, will
                      normally be shown during checkout or after shipment.
                    </p>
                  </div>

                  <div className="rounded-xl border bg-gray-50 p-5">
                    <MapPin className="h-6 w-6 text-gray-700" />

                    <h3 className="mt-3 font-semibold text-gray-900">
                      Location Dependent
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      Remote, rural, or difficult-to-service locations may
                      require additional delivery time.
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  Delivery estimates are approximate and are not guaranteed
                  unless a specific guaranteed delivery service is expressly
                  offered and confirmed at checkout.
                </p>
              </section>

              {/* 04 */}
              <section>
                <SectionTitle
                  number="04"
                  title="Shipping Confirmation & Tracking"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Once your order has been shipped, StudyStow may provide
                  shipping confirmation and tracking information through the
                  email address, phone number, or account associated with your
                  order.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Tracking information may take some time to become active
                  after the shipment has been handed over to the delivery
                  partner.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl border border-green-100 bg-green-50 p-5">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <p className="text-sm leading-6 text-green-800">
                    If tracking information does not update immediately after
                    shipment, please allow reasonable time for the courier
                    system to register the package.
                  </p>
                </div>
              </section>

              {/* 05 */}
              <section>
                <SectionTitle
                  number="05"
                  title="Delivery Address"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Customers are responsible for providing an accurate and
                  complete delivery address at checkout.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Please carefully check your name, phone number, house or
                  building information, street, locality, city, state, and
                  postal code before placing your order.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you need to change your delivery address, contact
                  StudyStow support as soon as possible. Address changes may
                  not be possible after an order has been processed or shipped.
                </p>
              </section>

              {/* 06 */}
              <section>
                <SectionTitle
                  number="06"
                  title="Failed Delivery"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  A delivery may fail if the recipient is unavailable, the
                  address is incomplete or incorrect, the phone number cannot
                  be reached, delivery attempts are unsuccessful, or the
                  courier cannot access the delivery location.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  The delivery partner may make additional delivery attempts
                  or contact the recipient according to its normal procedures.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If a package is returned to StudyStow because delivery could
                  not be completed, additional shipping charges or other
                  applicable conditions may apply before a re-shipment is
                  arranged.
                </p>
              </section>

              {/* 07 */}
              <section>
                <SectionTitle
                  number="07"
                  title="Delayed Deliveries"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Although we work to process and dispatch orders promptly,
                  delivery delays can occur because of circumstances outside
                  StudyStow&apos;s direct control.
                </p>

                <div className="mt-5 space-y-3">
                  <PolicyItem>
                    Severe weather or natural events
                  </PolicyItem>

                  <PolicyItem>
                    Public holidays or courier service interruptions
                  </PolicyItem>

                  <PolicyItem>
                    Transportation or logistics disruptions
                  </PolicyItem>

                  <PolicyItem>
                    Incorrect or incomplete delivery information
                  </PolicyItem>

                  <PolicyItem>
                    High-volume periods or unexpected operational delays
                  </PolicyItem>

                  <PolicyItem>
                    Local restrictions or circumstances affecting delivery
                  </PolicyItem>
                </div>
              </section>

              {/* 08 */}
              <section>
                <SectionTitle
                  number="08"
                  title="Damaged Package"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If your package appears seriously damaged when delivered,
                  please inspect the contents as soon as reasonably possible.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If the product inside is damaged, please contact StudyStow
                  support and provide your order number along with clear
                  photographs of the package and product.
                </p>

                <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                  <p className="text-sm leading-6 text-yellow-800">
                    Please retain the packaging and damaged product until your
                    support request has been reviewed. The information may be
                    required to investigate the delivery issue.
                  </p>
                </div>
              </section>

              {/* 09 */}
              <section>
                <SectionTitle
                  number="09"
                  title="Incorrect or Missing Items"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If your package contains an incorrect item or an item appears
                  to be missing, contact us as soon as possible with your order
                  details.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  We may review the order, packing information, shipment
                  details, and other relevant information before determining
                  the appropriate resolution.
                </p>
              </section>

              {/* 10 */}
              <section>
                <SectionTitle
                  number="10"
                  title="Multiple Items in One Order"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If an order contains multiple products, they may be shipped
                  together or separately depending on product availability,
                  fulfillment requirements, package size, and delivery
                  logistics.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  You may therefore receive multiple shipments for a single
                  order where applicable.
                </p>
              </section>

              {/* 11 */}
              <section>
                <SectionTitle
                  number="11"
                  title="Cash on Delivery Orders"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Where Cash on Delivery (COD) is available, the customer is
                  responsible for paying the applicable amount to the delivery
                  partner at the time of delivery.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  COD availability may depend on the delivery location,
                  product, order value, courier service, and other applicable
                  conditions.
                </p>
              </section>

              {/* 12 */}
              <section>
                <SectionTitle
                  number="12"
                  title="International Shipping"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Unless expressly stated otherwise at checkout, StudyStow
                  currently focuses on delivery within India.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If international shipping becomes available, applicable
                  shipping charges, customs duties, taxes, import requirements,
                  and delivery conditions will be communicated separately.
                </p>
              </section>

              {/* 13 */}
              <section>
                <SectionTitle
                  number="13"
                  title="Order Cancellation Before Shipment"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you need to cancel an order, please contact StudyStow
                  support as quickly as possible.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Cancellation may be possible before an order enters the
                  fulfillment or shipping process. Once an order has been
                  shipped, the normal return or refund process may apply.
                </p>
              </section>

              {/* 14 */}
              <section>
                <SectionTitle
                  number="14"
                  title="Delivery Confirmation"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  An order may be considered delivered based on the delivery
                  status reported by the applicable courier or logistics
                  partner.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you believe an order has been incorrectly marked as
                  delivered, contact StudyStow support promptly so that we can
                  review the shipment information.
                </p>
              </section>

              {/* 15 */}
              <section>
                <SectionTitle
                  number="15"
                  title="Contact Us"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  For questions about shipping, tracking, delivery delays,
                  damaged packages, or address changes, contact our support
                  team.
                </p>

                <div className="mt-5 rounded-2xl border bg-gray-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                      <Package className="h-5 w-5 text-gray-700" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        StudyStow Support
                      </h3>

                      <a
                        href="mailto:support@studystow.com"
                        className="mt-1 block text-sm text-gray-600 transition hover:text-gray-900"
                      >
                        support@studystow.com
                      </a>

                      <p className="mt-1 text-sm text-gray-500">
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 16 */}
              <section>
                <SectionTitle
                  number="16"
                  title="Policy Updates"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow may update this Shipping Policy from time to time
                  to reflect changes in our services, shipping arrangements,
                  business practices, or applicable requirements.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  The latest version will always be published on this page
                  with the applicable “Last updated” date.
                </p>
              </section>

              {/* Important Notice */}
              <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700" />

                  <div>
                    <h2 className="font-semibold text-yellow-900">
                      Important Notice
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-yellow-800">
                      Delivery estimates are indicative and may be affected by
                      circumstances outside StudyStow&apos;s control. Nothing
                      in this policy is intended to exclude or limit any rights
                      or remedies that cannot legally be excluded or limited
                      under applicable law.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {icon}

      <h2 className="mt-3 font-semibold text-gray-900">{title}</h2>

      <p className="mt-1 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-bold text-gray-500">
        {number}
      </span>

      <h2 className="text-xl font-bold leading-8 text-gray-900">
        {title}
      </h2>
    </div>
  );
}

function PolicyItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-4">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

      <p className="text-sm leading-6 text-gray-600">{children}</p>
    </div>
  );
}
