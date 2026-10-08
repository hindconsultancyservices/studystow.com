"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    type: "custom",
    content: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    noIndex: false,
  });

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/admin/pages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to create page"
        );
      }

      router.push(
        `/admin/pages/${result.data._id}`
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create page"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pages
        </Link>

        <div className="mt-6 rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h1 className="text-2xl font-bold text-slate-950">
              Create New Page
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a real website page stored in MongoDB.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Page Title
              </label>

              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-slate-900"
                placeholder="About Us"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                URL Slug
              </label>

              <input
                required
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value,
                  })
                }
                className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-slate-900"
                placeholder="/about-us"
              />

              <p className="mt-1 text-xs text-slate-500">
                Example: /about-us
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                  className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-slate-900"
                >
                  <option value="custom">
                    Custom
                  </option>
                  <option value="static">
                    Static Page
                  </option>
                  <option value="legal">
                    Legal
                  </option>
                  <option value="policy">
                    Policy
                  </option>
                  <option value="support">
                    Support
                  </option>
                  <option value="homepage">
                    Homepage
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-slate-900"
                >
                  <option value="draft">
                    Draft
                  </option>
                  <option value="published">
                    Published
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Page Content
              </label>

              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                rows={12}
                className="mt-2 w-full rounded-lg border p-3 outline-none focus:border-slate-900"
                placeholder="Write page content..."
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="font-semibold text-slate-900">
                SEO Settings
              </h2>

              <div className="mt-4 space-y-4">
                <input
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seoTitle: e.target.value,
                    })
                  }
                  placeholder="SEO Title"
                  className="h-11 w-full rounded-lg border px-3 outline-none focus:border-slate-900"
                />

                <textarea
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seoDescription:
                        e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="SEO Description"
                  className="w-full rounded-lg border p-3 outline-none focus:border-slate-900"
                />

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.noIndex}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        noIndex:
                          e.target.checked,
                      })
                    }
                  />
                  Prevent search engines from indexing this page
                </label>
              </div>
            </div>

            <div className="flex justify-end border-t pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "Creating..."
                  : "Create Page"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}