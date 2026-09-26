import Link from "next/link";

export default function AboutPage() {
return ( <main className="min-h-screen bg-white text-black">


  {/* HEADER */}
  <header className="border-b border-black/10 bg-white">
    <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
      <Link
        href="/"
        aria-label="studystow.com home"
        className="inline-flex items-baseline shrink-0"
      >
        <span className="text-[25px] font-black tracking-[-0.06em] sm:text-[28px]">
          studystow
        </span>

        <span className="ml-1 text-[13px] font-semibold text-black/50 sm:text-[14px]">
          .com
        </span>
      </Link>

      <nav className="hidden items-center gap-8 lg:flex">
        <Link
          href="/"
          className="text-[13px] font-medium hover:opacity-50"
        >
          Home
        </Link>

        <Link
          href="/books"
          className="text-[13px] font-medium hover:opacity-50"
        >
          Books
        </Link>

        <Link
          href="/category"
          className="text-[13px] font-medium hover:opacity-50"
        >
          Categories
        </Link>

        <Link
          href="/wishlist"
          className="text-[13px] font-medium hover:opacity-50"
        >
          Wishlist
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden h-10 items-center border border-black px-5 text-[12px] font-bold hover:bg-black hover:text-white sm:flex"
        >
          Login
        </Link>

        <Link
          href="/cart"
          className="flex h-10 items-center border border-black bg-black px-5 text-[12px] font-bold text-white hover:bg-white hover:text-black"
        >
          Cart
        </Link>
      </div>
    </div>
  </header>

  {/* HERO */}
  <section className="border-b border-black/10">
    <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="max-w-5xl">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-black" />

          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
            About studystow.com
          </span>
        </div>

        <h1 className="mt-7 text-[52px] font-black leading-[0.95] tracking-[-0.055em] sm:text-[68px] lg:text-[86px]">
          A place to
          <br />
          discover books.
        </h1>

        <p className="mt-8 max-w-2xl text-[15px] leading-7 text-black/60 sm:text-[17px]">
          studystow.com is an online bookstore experience designed to make
          browsing, discovering and managing books simple and clear.
        </p>
      </div>
    </div>
  </section>

  {/* INTRO */}
  <section className="border-b border-black/10">
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-10 lg:py-24">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
          What is studystow.com?
        </p>

        <h2 className="mt-5 max-w-xl text-[38px] font-black leading-tight tracking-[-0.045em] sm:text-[48px]">
          Simple shopping for books.
        </h2>
      </div>

      <div className="max-w-2xl text-[15px] leading-7 text-black/60">
        <p>
          studystow.com provides a storefront where visitors can browse
          the books currently available in the connected catalogue.
        </p>

        <p className="mt-6">
          The website brings together catalogue browsing, search,
          categories, account features, wishlist functionality and
          shopping-cart functionality in one place.
        </p>

        <p className="mt-6">
          The information shown on the website is intended to come from
          the store&apos;s configured catalogue and account systems rather
          than from invented or placeholder business data.
        </p>
      </div>
    </div>
  </section>

  {/* EXPERIENCE */}
  <section className="border-b border-black/10">
    <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
          The experience
        </p>

        <h2 className="mt-5 text-[38px] font-black tracking-[-0.045em] sm:text-[48px]">
          Everything in one place.
        </h2>
      </div>

      <div className="mt-14 grid gap-px bg-black/10 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-8">
          <span className="text-[11px] font-bold text-black/40">
            01
          </span>

          <h3 className="mt-6 text-[18px] font-bold">
            Browse
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Explore the books currently available in the catalogue.
          </p>
        </div>

        <div className="bg-white p-8">
          <span className="text-[11px] font-bold text-black/40">
            02
          </span>

          <h3 className="mt-6 text-[18px] font-bold">
            Search
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Find available books using the store search functionality.
          </p>
        </div>

        <div className="bg-white p-8">
          <span className="text-[11px] font-bold text-black/40">
            03
          </span>

          <h3 className="mt-6 text-[18px] font-bold">
            Organise
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Use categories, wishlist and cart features to organise your
            shopping experience.
          </p>
        </div>

        <div className="bg-white p-8">
          <span className="text-[11px] font-bold text-black/40">
            04
          </span>

          <h3 className="mt-6 text-[18px] font-bold">
            Account
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Access the account functionality available through the store.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* PRINCIPLES */}
  <section className="border-b border-black/10">
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24 lg:px-10 lg:py-24">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
          Our approach
        </p>

        <h2 className="mt-5 text-[38px] font-black tracking-[-0.045em] sm:text-[48px]">
          Clear.
          <br />
          Useful.
          <br />
          Straightforward.
        </h2>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="text-[18px] font-bold">
            Clear information
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Product and store information should be presented clearly so
            visitors can understand what is available.
          </p>
        </div>

        <div>
          <h3 className="text-[18px] font-bold">
            Simple navigation
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Books, categories, search, account and shopping features are
            organised to make navigation straightforward.
          </p>
        </div>

        <div>
          <h3 className="text-[18px] font-bold">
            Real catalogue data
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            Storefront content should come from the configured catalogue
            and systems rather than invented product or business data.
          </p>
        </div>

        <div>
          <h3 className="text-[18px] font-bold">
            Consistent experience
          </h3>

          <p className="mt-3 text-[13px] leading-6 text-black/55">
            The same clean visual language is used across the store,
            account and supporting information pages.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* EXPLORE */}
  <section className="bg-black text-white">
    <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="max-w-4xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          Explore studystow.com
        </p>

        <h2 className="mt-5 text-[44px] font-black leading-none tracking-[-0.05em] sm:text-[60px]">
          Start exploring.
        </h2>

        <p className="mt-7 max-w-2xl text-[15px] leading-7 text-white/55">
          Browse the available catalogue or use search to find the books
          currently listed on studystow.com.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/books"
            className="inline-flex h-12 items-center border border-white bg-white px-7 text-[13px] font-bold text-black hover:bg-black hover:text-white"
          >
            Browse Books
          </Link>

          <Link
            href="/search"
            className="inline-flex h-12 items-center border border-white px-7 text-[13px] font-bold text-white hover:bg-white hover:text-black"
          >
            Search
          </Link>

          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-white px-7 text-[13px] font-bold text-white hover:bg-white hover:text-black"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="bg-white">
    <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8 border-b border-black/10 pb-10 md:flex-row md:items-start md:justify-between">

        <div>
          <Link
            href="/"
            className="inline-flex items-baseline"
            aria-label="studystow.com home"
          >
            <span className="text-[23px] font-black tracking-[-0.06em]">
              studystow
            </span>

            <span className="ml-1 text-[12px] font-semibold text-black/50">
              .com
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-[13px] leading-6 text-black/50">
            Online bookstore storefront for the StudyStow catalogue.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-3 text-[12px] text-black/55">
          <Link href="/books" className="hover:text-black">
            Books
          </Link>

          <Link href="/category" className="hover:text-black">
            Categories
          </Link>

          <Link href="/wishlist" className="hover:text-black">
            Wishlist
          </Link>

          <Link href="/contact" className="hover:text-black">
            Contact
          </Link>

          <Link
            href="/privacy-policy"
            className="hover:text-black"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms-and-conditions"
            className="hover:text-black"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-6 text-[11px] text-black/40 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} studystow.com
        </p>

        <p>
          All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</main>


);
}
