import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-slate-900">
              Home
            </Link>

            <ChevronRight className="h-4 w-4" />

            <span className="font-medium text-slate-900">
              Privacy Policy
            </span>
          </div>

          <div className="mt-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <LockKeyhole className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Privacy Policy
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Last updated: September 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="rounded-3xl border bg-white p-6 shadow-sm sm:p-10">
          {/* Introduction */}
          <div>
            <p className="text-base leading-7 text-slate-600">
              At <strong className="text-slate-900">StudyStow</strong>, we
              respect your privacy and are committed to protecting the
              information you provide when using our website, placing an
              order, creating an account, or contacting our support team.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-600">
              This Privacy Policy explains what information we collect, how we
              use it, how we protect it, and the choices available to you.
            </p>
          </div>

          <div className="my-10 border-t" />

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900">
              1. Information We Collect
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Depending on how you use StudyStow, we may collect information
              such as:
            </p>

            <ul className="mt-4 space-y-3">
              {[
                "Name and contact details such as email address and phone number.",
                "Account information when you register or maintain an account.",
                "Shipping and billing information required to process an order.",
                "Order details, products purchased, payment status and delivery information.",
                "Messages and information you provide when contacting customer support.",
                "Technical information such as browser type, device information, IP address and website usage information.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-slate-600"
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 2 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              2. How We Use Your Information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may use collected information to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-6 text-slate-600">
              <li>Create and manage your StudyStow account.</li>
              <li>Process and deliver your orders.</li>
              <li>Process payments and verify payment status.</li>
              <li>Provide customer support and respond to enquiries.</li>
              <li>Send important transactional communications.</li>
              <li>Improve our website, products and services.</li>
              <li>Detect, prevent and investigate fraud or misuse.</li>
              <li>Meet applicable legal and regulatory obligations.</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              3. Payment Information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Payments may be processed through third-party payment providers.
              StudyStow does not intend to store complete card numbers,
              CVV/CVC codes or other sensitive payment credentials on its own
              servers.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Payment information may be processed directly by the applicable
              payment provider according to its own privacy policy and
              security practices.
            </p>
          </section>

          {/* 4 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              4. Cookies and Similar Technologies
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              StudyStow may use cookies and similar technologies to keep users
              signed in, remember preferences, maintain shopping functionality,
              understand website usage and improve the overall experience.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              You may be able to control cookies through your browser settings.
              Disabling certain cookies may affect some website functionality.
            </p>
          </section>

          {/* 5 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              5. Sharing of Information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may share information with trusted service providers when
              necessary to operate StudyStow, including providers involved in
              payment processing, shipping, hosting, email delivery, security,
              analytics and customer support.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              We may also disclose information when required by applicable law,
              legal process, court order, or to protect the rights, safety and
              security of StudyStow, our users or others.
            </p>

            <p className="mt-4 font-medium leading-7 text-slate-700">
              We do not sell your personal information as a product.
            </p>
          </section>

          {/* 6 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              6. Data Security
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We use reasonable technical and organizational measures designed
              to protect information against unauthorized access, alteration,
              disclosure or destruction.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              However, no internet transmission or electronic storage system
              can be guaranteed to be completely secure.
            </p>
          </section>

          {/* 7 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              7. Data Retention
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We retain information for as long as reasonably necessary to
              provide our services, maintain business and transaction records,
              resolve disputes, prevent fraud, and comply with applicable
              legal obligations.
            </p>
          </section>

          {/* 8 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              8. Your Choices and Rights
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Depending on applicable law, you may have rights relating to your
              personal information, including requesting access, correction or
              deletion of certain information.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              You may contact StudyStow if you believe your account information
              needs to be updated or corrected.
            </p>
          </section>

          {/* 9 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              9. Children&apos;s Privacy
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              StudyStow is not intended to knowingly collect personal
              information from children where such collection is prohibited by
              applicable law. If you believe a child has provided personal
              information improperly, please contact us.
            </p>
          </section>

          {/* 10 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              10. Third-Party Services
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Our website may use third-party services for payments, delivery,
              analytics, hosting, communication and other operational
              purposes. These services may process information according to
              their own terms and privacy policies.
            </p>
          </section>

          {/* 11 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              11. Policy Updates
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              We may update this Privacy Policy from time to time to reflect
              changes to our services, technology, legal requirements or
              business practices. The updated version will be published on this
              page with a revised effective date.
            </p>
          </section>

          {/* 12 */}
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              12. Contact Us
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              If you have questions, concerns or requests regarding this
              Privacy Policy, please contact our support team.
            </p>

            <div className="mt-5 rounded-2xl border bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">
                StudyStow
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Email: support@studystow.com
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Location: India
              </p>
            </div>
          </section>

          {/* Bottom */}
          <div className="mt-10 border-t pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Your privacy matters to us.
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Contact Support
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
