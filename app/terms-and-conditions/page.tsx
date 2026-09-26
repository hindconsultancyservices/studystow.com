import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
} from "lucide-react";

export default function TermsAndConditionsPage() {
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
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Terms & Conditions
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Last updated: September 2026
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600">
            These Terms & Conditions govern your access to and use of the
            StudyStow website, products, services, accounts, orders, and
            related features. By accessing or using StudyStow, you agree to
            comply with these terms.
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={<UserCheck className="h-6 w-6 text-blue-600" />}
            title="Account"
            description="You are responsible for keeping your account information accurate."
          />

          <InfoCard
            icon={<ShoppingBag className="h-6 w-6 text-green-600" />}
            title="Orders"
            description="Orders are subject to product availability and confirmation."
          />

          <InfoCard
            icon={<CreditCard className="h-6 w-6 text-purple-600" />}
            title="Payments"
            description="Payment information must be accurate and authorized."
          />

          <InfoCard
            icon={<ShieldCheck className="h-6 w-6 text-orange-600" />}
            title="Website Use"
            description="Use the website lawfully and do not misuse its services."
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
                  title="Acceptance of Terms"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  By accessing, browsing, registering on, or purchasing
                  products through StudyStow, you acknowledge that you have
                  read, understood, and agreed to these Terms & Conditions.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you do not agree with any part of these terms, please do
                  not use the StudyStow website or services.
                </p>
              </section>

              {/* 02 */}
              <section>
                <SectionTitle
                  number="02"
                  title="About StudyStow"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow is an online platform through which customers may
                  browse, purchase, and access information about books and
                  related products.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Product availability, pricing, specifications, delivery
                  options, and other information may change from time to time.
                </p>
              </section>

              {/* 03 */}
              <section>
                <SectionTitle
                  number="03"
                  title="Eligibility"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  You must be legally capable of entering into a binding
                  agreement under applicable law to place an order through
                  StudyStow.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you are using StudyStow on behalf of another person or
                  organization, you confirm that you have the authority to
                  accept these terms on their behalf.
                </p>
              </section>

              {/* 04 */}
              <section>
                <SectionTitle
                  number="04"
                  title="User Account"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Certain features may require you to create an account. You
                  are responsible for providing accurate and current
                  information during registration.
                </p>

                <div className="mt-5 space-y-3">
                  <PolicyItem>
                    Keep your account information accurate and updated.
                  </PolicyItem>

                  <PolicyItem>
                    Keep your password and account credentials confidential.
                  </PolicyItem>

                  <PolicyItem>
                    Notify StudyStow if you believe your account has been
                    accessed without authorization.
                  </PolicyItem>

                  <PolicyItem>
                    Do not use another person&apos;s account without
                    authorization.
                  </PolicyItem>
                </div>
              </section>

              {/* 05 */}
              <section>
                <SectionTitle
                  number="05"
                  title="Products and Product Information"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  We make reasonable efforts to provide accurate product
                  descriptions, images, prices, specifications, availability,
                  and other product information.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  However, minor differences may occur between website images
                  and the actual product due to screen settings, photography,
                  printing variations, packaging changes, or manufacturer
                  updates.
                </p>
              </section>

              {/* 06 */}
              <section>
                <SectionTitle
                  number="06"
                  title="Pricing"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Prices displayed on StudyStow are subject to change without
                  prior notice.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  We make reasonable efforts to maintain accurate pricing. If
                  an obvious pricing or technical error occurs, StudyStow may
                  contact you before fulfilling the affected order.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Applicable taxes, shipping charges, discounts, or other
                  charges may be shown separately during checkout.
                </p>
              </section>

              {/* 07 */}
              <section>
                <SectionTitle
                  number="07"
                  title="Placing an Order"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  When you place an order, you are making a request to
                  purchase the selected products at the displayed price and
                  under the applicable checkout conditions.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  An order confirmation does not necessarily guarantee that
                  every product will be available for fulfillment. StudyStow
                  may contact you if an issue affects your order.
                </p>
              </section>

              {/* 08 */}
              <section>
                <SectionTitle
                  number="08"
                  title="Order Acceptance and Cancellation"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow reserves the right to decline, cancel, or limit an
                  order where reasonably necessary, including situations
                  involving product availability, pricing errors, suspected
                  fraud, technical errors, or other operational concerns.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If an order is cancelled after payment has been received,
                  any applicable refund will be processed according to the
                  Refund Policy.
                </p>
              </section>

              {/* 09 */}
              <section>
                <SectionTitle
                  number="09"
                  title="Payments"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Payments may be processed through supported third-party
                  payment providers. By submitting payment information, you
                  confirm that you are authorized to use the selected payment
                  method.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <p className="text-sm leading-6 text-blue-800">
                    Payment information may be processed by authorized payment
                    providers. StudyStow does not intentionally request
                    sensitive payment credentials such as your card PIN or
                    banking password.
                  </p>
                </div>
              </section>

              {/* 10 */}
              <section>
                <SectionTitle
                  number="10"
                  title="Shipping and Delivery"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Orders are shipped according to the shipping options and
                  delivery conditions available at checkout.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Delivery estimates are approximate and may be affected by
                  courier operations, weather, public holidays, remote
                  locations, incorrect address information, or circumstances
                  outside StudyStow&apos;s reasonable control.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Please refer to our{" "}
                  <Link
                    href="/shipping-policy"
                    className="font-medium text-gray-900 underline underline-offset-4"
                  >
                    Shipping Policy
                  </Link>{" "}
                  for additional information.
                </p>
              </section>

              {/* 11 */}
              <section>
                <SectionTitle
                  number="11"
                  title="Returns and Refunds"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Returns, replacements, cancellations, and refunds are handled
                  according to our applicable Return & Refund Policy.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Please review the{" "}
                  <Link
                    href="/refund-policy"
                    className="font-medium text-gray-900 underline underline-offset-4"
                  >
                    Refund Policy
                  </Link>{" "}
                  before submitting a refund request.
                </p>
              </section>

              {/* 12 */}
              <section>
                <SectionTitle
                  number="12"
                  title="Acceptable Use"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  You agree to use StudyStow only for lawful purposes and in a
                  manner that does not interfere with the website or the
                  rights of other users.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  You must not:
                </p>

                <div className="mt-5 space-y-3">
                  <PolicyItem negative>
                    Use the website for unlawful, fraudulent, or abusive
                    activities.
                  </PolicyItem>

                  <PolicyItem negative>
                    Attempt to gain unauthorized access to accounts, systems,
                    APIs, databases, or other protected areas.
                  </PolicyItem>

                  <PolicyItem negative>
                    Introduce malicious code, viruses, or harmful software.
                  </PolicyItem>

                  <PolicyItem negative>
                    Interfere with the security, availability, or normal
                    operation of the website.
                  </PolicyItem>

                  <PolicyItem negative>
                    Scrape, copy, reproduce, or commercially exploit website
                    content without authorization.
                  </PolicyItem>

                  <PolicyItem negative>
                    Use another customer&apos;s account or personal information
                    without authorization.
                  </PolicyItem>
                </div>
              </section>

              {/* 13 */}
              <section>
                <SectionTitle
                  number="13"
                  title="Intellectual Property"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Unless otherwise stated, StudyStow and its licensors retain
                  rights in the website design, branding, logos, graphics,
                  text, software, layout, and other original website content.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  You may not reproduce, modify, distribute, publish, sell, or
                  commercially exploit protected StudyStow content without
                  appropriate authorization.
                </p>
              </section>

              {/* 14 */}
              <section>
                <SectionTitle
                  number="14"
                  title="Third-Party Services"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow may use third-party providers for services such as
                  payment processing, shipping, analytics, communications,
                  hosting, authentication, or other operational functions.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Your use of third-party services may also be subject to the
                  terms and policies of those third parties.
                </p>
              </section>

              {/* 15 */}
              <section>
                <SectionTitle
                  number="15"
                  title="Privacy"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Your use of StudyStow is also subject to our Privacy Policy,
                  which explains how information may be collected, used,
                  stored, and handled.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Please review the{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-gray-900 underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for more information.
                </p>
              </section>

              {/* 16 */}
              <section>
                <SectionTitle
                  number="16"
                  title="Reviews and User Content"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If StudyStow allows customers to submit reviews, comments,
                  ratings, images, or other content, you are responsible for
                  ensuring that your submitted content is lawful and does not
                  infringe the rights of others.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow may remove content that violates applicable
                  policies, laws, or these Terms & Conditions.
                </p>
              </section>

              {/* 17 */}
              <section>
                <SectionTitle
                  number="17"
                  title="Account Suspension or Termination"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow may suspend or terminate access to an account or
                  service where reasonably necessary, including in cases of
                  suspected fraud, misuse, security concerns, violation of
                  these terms, or unlawful activity.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Where appropriate, users may contact support regarding an
                  account restriction.
                </p>
              </section>

              {/* 18 */}
              <section>
                <SectionTitle
                  number="18"
                  title="Website Availability"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  We aim to keep StudyStow available and operational, but we
                  do not guarantee that the website will always be available,
                  uninterrupted, error-free, or free from technical issues.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Maintenance, updates, technical failures, third-party
                  service interruptions, or other circumstances may temporarily
                  affect availability.
                </p>
              </section>

              {/* 19 */}
              <section>
                <SectionTitle
                  number="19"
                  title="Disclaimer"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  To the extent permitted by applicable law, StudyStow
                  provides the website and its services subject to these terms
                  and does not guarantee that every feature or service will
                  always operate without interruption or error.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Nothing in these terms is intended to exclude or limit any
                  legal rights that cannot lawfully be excluded or limited.
                </p>
              </section>

              {/* 20 */}
              <section>
                <SectionTitle
                  number="20"
                  title="Limitation of Liability"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  To the maximum extent permitted by applicable law, StudyStow
                  will not be responsible for losses resulting from matters
                  outside its reasonable control, including third-party
                  service failures, courier delays, network failures, or
                  unauthorized access caused by circumstances outside
                  StudyStow&apos;s reasonable control.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  This section does not limit liability where such limitation
                  is prohibited by applicable law.
                </p>
              </section>

              {/* 21 */}
              <section>
                <SectionTitle
                  number="21"
                  title="Indemnification"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  To the extent permitted by applicable law, you agree to
                  remain responsible for losses, claims, or reasonable
                  expenses arising from your unlawful use of StudyStow,
                  violation of these terms, or infringement of another
                  person&apos;s rights.
                </p>
              </section>

              {/* 22 */}
              <section>
                <SectionTitle
                  number="22"
                  title="Changes to These Terms"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  StudyStow may update these Terms & Conditions from time to
                  time to reflect changes in our services, website features,
                  business practices, or applicable requirements.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  The updated version will be published on this page with a
                  revised “Last updated” date.
                </p>

                <div className="mt-5 flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gray-700" />

                  <p className="text-sm leading-6 text-gray-600">
                    Your continued use of StudyStow after an updated version
                    is published may constitute acceptance of the updated terms
                    to the extent permitted by applicable law.
                  </p>
                </div>
              </section>

              {/* 23 */}
              <section>
                <SectionTitle
                  number="23"
                  title="Governing Law"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  These Terms & Conditions are intended to be governed by the
                  applicable laws and legal requirements of India, subject to
                  any mandatory consumer protection or other applicable legal
                  rights.
                </p>

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  Any dispute will be handled in accordance with applicable
                  law and the jurisdictional requirements applicable to the
                  parties.
                </p>
              </section>

              {/* 24 */}
              <section>
                <SectionTitle
                  number="24"
                  title="Contact Us"
                />

                <p className="mt-4 text-sm leading-7 text-gray-600">
                  If you have questions about these Terms & Conditions,
                  orders, payments, accounts, or any StudyStow service, please
                  contact our support team.
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

              {/* Important Notice */}
              <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-700" />

                  <div>
                    <h2 className="font-semibold text-yellow-900">
                      Important Notice
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-yellow-800">
                      These Terms & Conditions are a general website terms
                      template for StudyStow and should be reviewed by a
                      qualified legal professional before production launch,
                      especially for applicable Indian consumer, e-commerce,
                      taxation, privacy, and dispute-resolution requirements.
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
  negative = false,
}: {
  children: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white p-4">
      <CheckCircle2
        className={`mt-0.5 h-5 w-5 shrink-0 ${
          negative ? "text-red-500" : "text-green-600"
        }`}
      />

      <p className="text-sm leading-6 text-gray-600">{children}</p>
    </div>
  );
}
