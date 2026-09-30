// ============================================================
// FOOTER COMPONENT
// ============================================================
// Customer website ka complete footer.
// Ye component:
// - About StudyStow
// - Quick Links
// - Customer Support
// - Contact Information
// - Social Media
// - Copyright
// - Hind Consultancy Services Ltd
// handle karta hai.
// ============================================================

import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// ============================================================
// FOOTER COMPONENT
// ============================================================

export default function Footer() {
  return (
    <footer className="border-t bg-gray-950 text-gray-300">

      {/* ======================================================
          FOOTER MAIN CONTAINER
          ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ====================================================
            FOOTER COLUMNS
            ==================================================== */}

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ==================================================
              COLUMN 1 — ABOUT STUDYSTOW
              ================================================== */}

          <div>

            {/* StudyStow Logo / Brand */}
            {/* StudyStow Logo / Brand */}
          <Link href="/" className="inline-block">
           <img
              src="/images/logo/logo.png"
              alt="Studystow.com"
              className="h-16 w-auto object-contain brightness-0 invert"
            />
          </Link>

            {/* About Description */}
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
              StudyStow is your online bookstore for discovering,
              exploring and purchasing books easily from one place.
            </p>

            {/* =================================================
                SOCIAL MEDIA LINKS
                ================================================= */}

            <div className="mt-6 flex items-center gap-3">

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-sm font-bold text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                f
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-sm font-bold text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                ◎
              </a>

              {/* X / Twitter */}
              <a
                href="#"
                aria-label="X / Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-sm font-bold text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                𝕏
              </a>

            </div>
          </div>


          {/* ==================================================
              COLUMN 2 — QUICK LINKS
              ================================================== */}

          <div>

            {/* Section Heading */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            {/* Links */}
            <ul className="mt-4 space-y-3 text-sm">

              {/* Home */}
              <li>
                <Link
                  href="/"
                  className="transition hover:text-white"
                >
                  Home
                </Link>
              </li>

              {/* Books */}
              <li>
                <Link
                  href="/books"
                  className="transition hover:text-white"
                >
                  Books
                </Link>
              </li>

              {/* Categories */}
              <li>
                <Link
                  href="/category"
                  className="transition hover:text-white"
                >
                  Categories
                </Link>
              </li>

              {/* About Us */}
              <li>
                <Link
                  href="/about"
                  className="transition hover:text-white"
                >
                  About Us
                </Link>
              </li>

              {/* Contact Us */}
              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-white"
                >
                  Contact Us
                </Link>
              </li>

            </ul>
          </div>


          {/* ==================================================
              COLUMN 3 — CUSTOMER SUPPORT
              ================================================== */}

          <div>

            {/* Section Heading */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Customer Support
            </h3>

            {/* Support Links */}
            <ul className="mt-4 space-y-3 text-sm">

              {/* FAQ */}
              <li>
                <Link
                  href="/faq"
                  className="transition hover:text-white"
                >
                  FAQ
                </Link>
              </li>

              {/* Shipping Policy */}
              <li>
                <Link
                  href="/shipping-policy"
                  className="transition hover:text-white"
                >
                  Shipping Policy
                </Link>
              </li>

              {/* Refund Policy */}
              <li>
                <Link
                  href="/refund-policy"
                  className="transition hover:text-white"
                >
                  Refund Policy
                </Link>
              </li>

              {/* Privacy Policy */}
              <li>
                <Link
                  href="/privacy-policy"
                  className="transition hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>

              {/* Terms & Conditions */}
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="transition hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </li>

            </ul>
          </div>


          {/* ==================================================
              COLUMN 4 — CONTACT INFORMATION
              ================================================== */}

          <div>

            {/* Section Heading */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>

            {/* Contact Details */}
            <ul className="mt-4 space-y-4 text-sm">

              {/* Email */}
              <li className="flex gap-3">

                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-gray-400"
                />

                <span>
                  support@studystow.com
                </span>

              </li>


              {/* Phone */}
              <li className="flex gap-3">

                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-gray-400"
                />

                <span>
                  Contact Support
                </span>

              </li>


              {/* Location */}
              <li className="flex gap-3">

                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-gray-400"
                />

                <span>
                  India
                </span>

              </li>

            </ul>
          </div>

        </div>


        {/* ====================================================
            FOOTER BOTTOM SECTION
            ==================================================== */}

        <div className="mt-10 border-t border-gray-800 pt-6">

          <div className="flex flex-col items-center justify-between gap-3 text-center text-sm sm:flex-row sm:text-left">

            {/* =================================================
                COPYRIGHT
                ================================================= */}

            <p className="text-gray-500">
              © {new Date().getFullYear()} StudyStow.
              All Rights Reserved.
            </p>


            {/* =================================================
                COMPANY NAME
                ================================================= */}

            <p className="font-medium text-gray-400">
              A Hind Consultancy Services Ltd Company
            </p>

          </div>

        </div>

      </div>

    </footer>
  );
}