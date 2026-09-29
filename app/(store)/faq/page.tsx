"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Search,
  BookOpen,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  User,
} from "lucide-react";

type FAQ = {
  question: string;
  answer: string;
};

type FAQCategory = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  questions: FAQ[];
};

const faqCategories: FAQCategory[] = [
  {
    title: "Orders & Books",
    icon: BookOpen,
    questions: [
      {
        question: "How can I order a book?",
        answer:
          "Browse the books on StudyStow, open the book you want, select the quantity, and add it to your cart. Then proceed to checkout and complete your order.",
      },
      {
        question: "How can I search for a book?",
        answer:
          "Use the search option available on the website to search by book title, author, category, or related keywords.",
      },
      {
        question: "Can I order multiple books together?",
        answer:
          "Yes. Add multiple books to your cart and complete them together through the checkout process.",
      },
    ],
  },
  {
    title: "Cart & Checkout",
    icon: ShoppingCart,
    questions: [
      {
        question: "How do I add a book to my cart?",
        answer:
          "Open the book details page and select the Add to Cart option. The selected book will be added to your shopping cart.",
      },
      {
        question: "Can I change my cart before placing an order?",
        answer:
          "Yes. You can review your cart, change quantities, or remove items before completing checkout.",
      },
      {
        question: "What happens after I place an order?",
        answer:
          "After your order is successfully placed, you can view your order details and track its status from your account.",
      },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    questions: [
      {
        question: "What payment method is available?",
        answer:
          "StudyStow supports online payment through the payment options configured during checkout.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Payment processing is handled through the configured payment gateway. StudyStow does not directly store your complete card details.",
      },
      {
        question: "What should I do if my payment fails?",
        answer:
          "If a payment fails, check your payment details and try again. If the amount was deducted but the order was not confirmed, contact support with your payment and order details.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    icon: Truck,
    questions: [
      {
        question: "How long does delivery take?",
        answer:
          "Delivery time depends on the destination, availability of the book, and the selected shipping service. The applicable information will be shown during the order process.",
      },
      {
        question: "How can I track my order?",
        answer:
          "You can check your order status from the Orders section of your StudyStow account.",
      },
      {
        question: "What if my order arrives damaged?",
        answer:
          "If your order arrives damaged, contact StudyStow support as soon as possible and provide your order details and relevant photographs.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    questions: [
      {
        question: "Can I return a book?",
        answer:
          "Returns are subject to the StudyStow return and refund policy. Please review the Return & Refund page for the applicable conditions.",
      },
      {
        question: "How do I request a refund?",
        answer:
          "Contact StudyStow support with your order details and the reason for the refund request. The request will be reviewed according to the applicable policy.",
      },
    ],
  },
  {
    title: "Account",
    icon: User,
    questions: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "An account helps you manage your orders, profile, addresses, and other account-related information.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          "Use the password recovery option on the login page to start the password reset process.",
      },
      {
        question: "How can I update my account information?",
        answer:
          "After signing in, open your account profile and update the available information.",
      },
    ],
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter((faq) => {
        if (!normalizedSearch) return true;

        return (
          faq.question.toLowerCase().includes(normalizedSearch) ||
          faq.answer.toLowerCase().includes(normalizedSearch) ||
          category.title.toLowerCase().includes(normalizedSearch)
        );
      }),
    }))
    .filter((category) => category.questions.length > 0);

  const toggleFAQ = (key: string) => {
    setOpenIndex((current) => (current === key ? null : key));
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <BookOpen className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Find answers to common questions about books, orders, payments,
            delivery, returns, and your StudyStow account.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex items-center rounded-xl bg-white px-4 py-3 shadow-lg">
              <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your question..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="Search frequently asked questions"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          {filteredCategories.length > 0 ? (
            <div className="space-y-10">
              {filteredCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <div key={category.title}>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <Icon className="h-5 w-5 text-slate-700" />
                      </div>

                      <h2 className="text-xl font-bold text-slate-900">
                        {category.title}
                      </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      {category.questions.map((faq, index) => {
                        const key = `${category.title}-${index}`;
                        const isOpen = openIndex === key;

                        return (
                          <div
                            key={key}
                            className="border-b border-slate-200 last:border-b-0"
                          >
                            <button
                              type="button"
                              onClick={() => toggleFAQ(key)}
                              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 sm:px-6"
                              aria-expanded={isOpen}
                            >
                              <span className="font-medium text-slate-900">
                                {faq.question}
                              </span>

                              <ChevronDown
                                className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5 sm:px-6">
                                <p className="text-sm leading-7 text-slate-600">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-400" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No questions found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try searching with a different keyword.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Still have a question?
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            If you cannot find the answer here, our support team can help you.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
