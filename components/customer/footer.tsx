import Link from "next/link";

import {
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white text-gray-300 sm:bg-gray-950">

      {/* ======================================================
          DESKTOP FOOTER
          Desktop par existing footer exactly same
          ====================================================== */}
      <div className="hidden sm:block">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

            {/* ABOUT */}
            <div>
              <Link href="/" className="inline-block">
                <img
                  src="/images/logo/logo.png"
                  alt="Studystow.com"
                  className="h-16 w-auto object-contain brightness-0 invert"
                />
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-400">
                StudyStow is your online bookstore for discovering,
                exploring and purchasing books easily from one place.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-sm font-bold text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  f
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-sm font-bold text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  ◎
                </a>

                <a
                  href="#"
                  aria-label="X / Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-sm font-bold text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  𝕏
                </a>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Quick Links
              </h3>

              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/" className="transition hover:text-white">
                    Home
                  </Link>
                </li>

                <li>
                  <Link href="/books" className="transition hover:text-white">
                    Books
                  </Link>
                </li>

                <li>
                  <Link href="/category" className="transition hover:text-white">
                    Categories
                  </Link>
                </li>

                <li>
                  <Link href="/about" className="transition hover:text-white">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link href="/contact" className="transition hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* CUSTOMER SUPPORT */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Customer Support
              </h3>

              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/faq" className="transition hover:text-white">
                    FAQ
                  </Link>
                </li>

                <li>
                  <Link
                    href="/shipping-policy"
                    className="transition hover:text-white"
                  >
                    Shipping Policy
                  </Link>
                </li>

                <li>
                  <Link
                    href="/refund-policy"
                    className="transition hover:text-white"
                  >
                    Refund Policy
                  </Link>
                </li>

                <li>
                  <Link
                    href="/privacy-policy"
                    className="transition hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>

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

            {/* CONTACT */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Contact Us
              </h3>

              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <span>
                    support@studystow.com
                  </span>
                </li>

                <li className="flex gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <span>
                    Contact Support
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="mt-0.5 text-gray-400">
                    ●
                  </span>

                  <span>
                    India
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* DESKTOP BOTTOM */}
          <div className="mt-10 border-t border-gray-800 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-center text-sm sm:flex-row sm:text-left">

              <p className="text-gray-500">
                © {new Date().getFullYear()} StudyStow.
                All Rights Reserved.
              </p>

              <p className="font-medium text-gray-400">
                A Hind Consultancy Services Ltd Company
              </p>

            </div>
          </div>

        </div>
      </div>

      {/* ======================================================
          MOBILE
          NO NORMAL FOOTER CONTENT
          ONLY FIXED ACTION BAR
          ====================================================== */}
      <div className="sm:hidden">

        <div
          className="
            fixed
            bottom-3
            left-1/2
            z-50
            w-[calc(100%-32px)]
            max-w-sm
            -translate-x-1/2
          "
        >
          <div
            className="
              flex
              items-center
              justify-around
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-3
              py-2
              shadow-[0_8px_30px_rgba(0,0,0,0.18)]
              ring-1
              ring-black/5
            "
          >

            {/* ==================================================
                CALL
                ================================================== */}
            <Link
              href="/contact"
              aria-label="Call Support"
              className="
                flex
                min-w-[72px]
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                px-4
                py-2
                text-gray-700
                transition
                active:scale-95
                active:bg-gray-100
              "
            >
              <Phone className="h-5 w-5" />

              <span className="text-[10px] font-semibold">
                Call
              </span>
            </Link>

            {/* DIVIDER */}
            <div className="h-8 w-px bg-gray-200" />

            {/* ==================================================
                MESSAGE
                ================================================== */}
            <Link
              href="/contact"
              aria-label="Message Support"
              className="
                flex
                min-w-[72px]
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                px-4
                py-2
                text-gray-700
                transition
                active:scale-95
                active:bg-gray-100
              "
            >
              <MessageCircle className="h-5 w-5" />

              <span className="text-[10px] font-semibold">
                Message
              </span>
            </Link>

            {/* DIVIDER */}
            <div className="h-8 w-px bg-gray-200" />

            {/* ==================================================
                MAIL
                ================================================== */}
            <a
              href="mailto:support@studystow.com"
              aria-label="Email Support"
              className="
                flex
                min-w-[72px]
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                px-4
                py-2
                text-gray-700
                transition
                active:scale-95
                active:bg-gray-100
              "
            >
              <Mail className="h-5 w-5" />

              <span className="text-[10px] font-semibold">
                Mail
              </span>
            </a>

          </div>
        </div>

        {/* Bottom safe space so page content doesn't hide behind bar */}
        <div className="h-20" />

      </div>

    </footer>
  );
}