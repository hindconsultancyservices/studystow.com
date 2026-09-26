import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export default function RefundPolicyPage() {
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
              <RefreshCcw className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Refund Policy
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Last updated: September 2026
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600">
            At StudyStow, we want every order to reach you safely and
            correctly. This Refund Policy explains when you may be eligible
            for a refund, replacement, cancellation, or other resolution for
            purchases made through the StudyStow website.
          </p>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <CheckCircle2 className="h-6 w-6 text-green-600" />

            <h2 className="mt-3 font-semibold text-gray-900">
              Eligible Issues
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Wrong, damaged, defective, or materially incorrect items.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <Clock3 className="h-6 w-6 text-blue-600" />

            <h2 className="mt-3 font-semibold text-gray-900">
              Request Window
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Contact us within 7 days of delivery for eligible issues.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <CreditCard className="h-6 w-6 text-purple-600" />

            <h2 className="mt-3 font-semibold text-gray-900">
              Original Payment
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Approved refunds are normally returned to the original payment
              method.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-orange-600" />

            <h2 className="mt-3 font-semibold text-gray-900">
              Order Review
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Each refund request may be reviewed before approval.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="rounded-2xl border bg-white shadow-sm">
          <div className="p-6 sm:p-10">
            <div className="space-y-10">
              {/* 1 */}
              <section>
                <SectionTitle
                  number="01"
                  title="When You May Be Eligible for a Refund"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  You may request a refund or replacement if your order has a
                  genuine issue that falls within the circumstances described
                  below.
                </p>

                <div className="mt-5 space-y-3">
                  <PolicyItem>
                    The wrong book or product was delivered.
                  </PolicyItem>

                  <PolicyItem>
                    The book arrived damaged or defective.
                  </PolicyItem>

                  <PolicyItem>
                    The product received is materially different from the
                    product ordered.
                  </PolicyItem>

                  <PolicyItem>
                    The package was damaged during delivery and the product
                    was affected.
                  </PolicyItem>

                  <PolicyItem>
                    Your payment was successfully deducted but the order was
                    not successfully created or confirmed.
                  </PolicyItem>
                </div>
              </section>

              {/* 2 */}
              <section>
                <SectionTitle
                  number="02"
                  title="Refund Request Time Limit"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  For damaged, defective, incorrect, or materially different
                  products, please contact StudyStow within{" "}
                  <strong className="text-gray-900">
                    7 days of receiving your order
                  </strong>
                  .
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Requests submitted after this period may not be eligible for
                  a refund or replacement unless otherwise required by
                  applicable law.
                </p>
              </section>

              {/* 3 */}
              <section>
                <SectionTitle
                  number="03"
                  title="How to Request a Refund"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  To request a refund, replacement, or order-related
                  resolution, contact our support team with enough information
                  for us to identify and review your order.
                </p>

                <div className="mt-5 rounded-xl bg-gray-50 p-5">
                  <p className="font-semibold text-gray-900">
                    Please provide:
                  </p>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
                    <li>• Your order number</li>
                    <li>• Name used while placing the order</li>
                    <li>• Email address used for the order</li>
                    <li>• Reason for requesting the refund</li>
                    <li>
                      • Photos or other relevant evidence, if the product was
                      damaged or incorrect
                    </li>
                  </ul>
                </div>
              </section>

              {/* 4 */}
              <section>
                <SectionTitle
                  number="04"
                  title="Damaged or Defective Products"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If your book arrives damaged or defective, please contact us
                  before returning the product.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Depending on the circumstances and availability, StudyStow
                  may offer a replacement, exchange, refund, or another
                  appropriate resolution.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl border border-green-100 bg-green-50 p-5">
                  <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <p className="text-sm leading-6 text-green-800">
                    Please keep the original packaging and product until your
                    request has been reviewed. We may require photographs or
                    additional information to verify the issue.
                  </p>
                </div>
              </section>

              {/* 5 */}
              <section>
                <SectionTitle
                  number="05"
                  title="Wrong Product Received"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you receive a product that is different from the item
                  shown on your order confirmation, contact us as soon as
                  possible.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  After verification, we may arrange a replacement or provide
                  a refund according to the circumstances of the order.
                </p>
              </section>

              {/* 6 */}
              <section>
                <SectionTitle
                  number="06"
                  title="Order Cancellation"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Cancellation requests should be submitted as soon as
                  possible after placing an order.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If your order has already been processed, packed, shipped,
                  or delivered, cancellation may no longer be possible. In
                  such cases, the applicable return or refund process may
                  apply.
                </p>
              </section>

              {/* 7 */}
              <section>
                <SectionTitle
                  number="07"
                  title="Payment Deducted but Order Not Created"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If money has been deducted from your account but your order
                  was not successfully created or confirmed, please contact us
                  with your payment or transaction details.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  We will verify the transaction and, where applicable,
                  initiate the appropriate refund or resolution.
                </p>
              </section>

              {/* 8 */}
              <section>
                <SectionTitle
                  number="08"
                  title="Refund Processing"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Once a refund is approved, we will initiate the refund using
                  the original payment method where possible.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  The time required for the refund to appear in your account
                  can vary depending on the payment gateway, bank, card
                  issuer, UPI provider, or other financial institution.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <p className="text-sm leading-6 text-blue-800">
                    StudyStow cannot guarantee the exact time taken by a
                    third-party bank or payment provider to credit an approved
                    refund.
                  </p>
                </div>
              </section>

              {/* 9 */}
              <section>
                <SectionTitle
                  number="09"
                  title="Non-Refundable Situations"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Subject to applicable law, a refund may not be available in
                  situations such as:
                </p>

                <div className="mt-5 space-y-3">
                  <PolicyItem negative>
                    The product has been used, damaged, written in, marked,
                    torn, or altered after delivery.
                  </PolicyItem>

                  <PolicyItem negative>
                    The customer cannot provide sufficient information to
                    verify the claimed issue.
                  </PolicyItem>

                  <PolicyItem negative>
                    A return request is submitted outside the applicable
                    request period without a valid reason.
                  </PolicyItem>

                  <PolicyItem negative>
                    Digital or downloadable products that are specifically
                    identified as non-refundable.
                  </PolicyItem>

                  <PolicyItem negative>
                    Products specifically identified as non-returnable on the
                    product page or at checkout.
                  </PolicyItem>
                </div>
              </section>

              {/* 10 */}
              <section>
                <SectionTitle
                  number="10"
                  title="Return Shipping"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  When a return is required because StudyStow supplied an
                  incorrect, damaged, or defective product, applicable return
                  shipping costs may be covered or reimbursed according to the
                  circumstances.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  For returns requested for other reasons, the customer may be
                  responsible for applicable return shipping costs.
                </p>
              </section>

              {/* 11 */}
              <section>
                <SectionTitle
                  number="11"
                  title="Refund Amount"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  The refund amount will depend on the approved resolution and
                  the circumstances of the order.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Any applicable shipping charges, discounts, promotional
                  benefits, taxes, or other order adjustments may be considered
                  when calculating the final refund, subject to applicable law
                  and the specific circumstances of the order.
                </p>
              </section>

              {/* 12 */}
              <section>
                <SectionTitle
                  number="12"
                  title="Refund Method"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Approved refunds will generally be issued to the same
                  payment method used to place the order.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  In cases where the original payment method cannot receive
                  the refund, we may contact you to determine an appropriate
                  alternative method.
                </p>
              </section>

              {/* 13 */}
              <section>
                <SectionTitle
                  number="13"
                  title="Review of Refund Requests"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  All refund and replacement requests may be reviewed before
                  approval. We may request additional information, photographs,
                  order details, or other reasonable evidence where necessary
                  to verify the request.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Any resolution will be handled according to the applicable
                  circumstances, our policies, and applicable law.
                </p>
              </section>

              {/* 14 */}
              <section>
                <SectionTitle
                  number="14"
                  title="Contact Us"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you have a question about a refund, cancellation,
                  replacement, or payment issue, please contact StudyStow
                  support.
                </p>

                <div className="mt-5 rounded-2xl border bg-gray-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                      <Mail className="h-5 w-5 text-gray-700" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        StudyStow Support
                      </h3>

                      <a
                        href="mailto:support@studystow.com"
                        className="mt-1 block text-sm text-gray-600 hover:text-gray-900"
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

              {/* 15 */}
              <section>
                <SectionTitle
                  number="15"
                  title="Policy Updates"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow may update this Refund Policy from time to time to
                  reflect changes in our services, business practices, or
                  applicable requirements.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Any updated version will be published on this page with a
                  revised “Last updated” date.
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
                      This policy describes StudyStow&apos;s general refund
                      process. Nothing in this policy is intended to exclude
                      or limit any rights or remedies that cannot legally be
                      excluded or limited under applicable law.
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
  negative = false,
}: {
  children: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-4">
      {negative ? (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
      )}

      <p className="text-sm leading-6 text-gray-600">{children}</p>
    </div>
  );
}

