"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";

type ContactStatus =
  | "new"
  | "contacted"
  | "in-progress"
  | "completed";

type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  requirement: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  new: number;
  contacted: number;
  inProgress: number;
  completed: number;
};

const EMPTY_STATS: Stats = {
  total: 0,
  new: 0,
  contacted: 0,
  inProgress: 0,
  completed: 0,
};

function getStatusLabel(status: ContactStatus) {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function statusStyles(status: ContactStatus) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";

    case "contacted":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "in-progress":
      return "bg-violet-50 text-violet-700 ring-violet-600/20";

    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

function formatDate(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  const clean = name.trim();

  if (!clean) return "?";

  const parts = clean.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [copyMessage, setCopyMessage] = useState("");

  async function loadContacts(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      params.set("limit", "100");

      const response = await fetch(
        `/api/admin/contact?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Failed to load contact messages."
        );
      }

      const items = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.items)
        ? result.items
        : [];

      setContacts(items);

      setStats({
        total: Number(
          result.stats?.total ?? items.length
        ),
        new: Number(
          result.stats?.new ??
            items.filter(
              (item: Contact) => item.status === "new"
            ).length
        ),
        contacted: Number(
          result.stats?.contacted ??
            items.filter(
              (item: Contact) => item.status === "contacted"
            ).length
        ),
        inProgress: Number(
          result.stats?.inProgress ??
            result.stats?.in_progress ??
            items.filter(
              (item: Contact) =>
                item.status === "in-progress"
            ).length
        ),
        completed: Number(
          result.stats?.completed ??
            items.filter(
              (item: Contact) => item.status === "completed"
            ).length
        ),
      });
    } catch (err) {
      console.error("Contact load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load contact messages."
      );

      setContacts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadContacts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  async function updateStatus(
    contact: Contact,
    status: ContactStatus
  ) {
    if (contact.status === status) return;

    try {
      setUpdatingId(contact._id);
      setError("");

      const response = await fetch(
        `/api/admin/contact/${contact._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to update status."
        );
      }

      const updatedContact =
        result.data || {
          ...contact,
          status,
        };

      setContacts((current) =>
        current.map((item) =>
          item._id === contact._id
            ? updatedContact
            : item
        )
      );

      setSelectedContact((current) =>
        current?._id === contact._id
          ? updatedContact
          : current
      );

      await loadContacts(true);
    } catch (err) {
      console.error("Contact status update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update contact status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteContact(contact: Contact) {
    const confirmed = window.confirm(
      `Delete the enquiry from ${contact.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(contact._id);
      setError("");

      const response = await fetch(
        `/api/admin/contact/${contact._id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to delete contact."
        );
      }

      setContacts((current) =>
        current.filter(
          (item) => item._id !== contact._id
        )
      );

      if (selectedContact?._id === contact._id) {
        setSelectedContact(null);
      }

      await loadContacts(true);
    } catch (err) {
      console.error("Contact delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete contact."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function copyText(
    value: string,
    label: string
  ) {
    try {
      await navigator.clipboard.writeText(value);

      setCopyMessage(`${label} copied`);

      setTimeout(() => {
        setCopyMessage("");
      }, 1800);
    } catch {
      setCopyMessage("Copy unavailable");

      setTimeout(() => {
        setCopyMessage("");
      }, 1800);
    }
  }

  const visibleContacts = useMemo(() => {
    return contacts;
  }, [contacts]);

  const statCards = [
    {
      label: "Total Messages",
      value: stats.total,
      icon: MessageSquare,
      description: "All contact enquiries",
    },
    {
      label: "New",
      value: stats.new,
      icon: Mail,
      description: "Awaiting response",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock3,
      description: "Currently being handled",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      description: "Successfully completed",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                href="/admin"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                aria-label="Back to admin dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Administration
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Contact Messages
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage enquiries submitted through your
                  website contact form.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadContacts(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name, email, company or service..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">
                  Contacted
                </option>
                <option value="in-progress">
                  In Progress
                </option>
                <option value="completed">
                  Completed
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Copy notification */}
        {copyMessage && (
          <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl">
            {copyMessage}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading contact messages...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          visibleContacts.length === 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

              <h2 className="mt-3 font-semibold text-slate-900">
                No contact messages found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                New enquiries submitted through the contact
                form will appear here.
              </p>
            </div>
          )}

        {/* Desktop Table */}
        {!loading &&
          visibleContacts.length > 0 && (
            <section className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Service
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Requirement
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Received
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleContacts.map((contact) => (
                      <tr
                        key={contact._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Contact */}
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                              {getInitials(
                                contact.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-slate-900">
                                {contact.name}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyText(
                                      contact.email,
                                      "Email"
                                    )
                                  }
                                  className="max-w-[220px] truncate text-xs text-slate-500 hover:text-blue-600"
                                  title={contact.email}
                                >
                                  {contact.email}
                                </button>
                              </div>

                              {contact.phone && (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <Phone className="h-3.5 w-3.5 text-slate-400" />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyText(
                                        contact.phone || "",
                                        "Phone"
                                      )
                                    }
                                    className="text-xs text-slate-500 hover:text-blue-600"
                                  >
                                    {contact.phone}
                                  </button>
                                </div>
                              )}

                              {contact.company && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {contact.company}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            {contact.service}
                          </span>
                        </td>

                        {/* Requirement */}
                        <td className="max-w-[300px] px-5 py-5">
                          <p
                            className="line-clamp-2 text-sm leading-5 text-slate-600"
                            title={contact.requirement}
                          >
                            {contact.requirement}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />

                            {formatDate(
                              contact.createdAt
                            )}
                          </div>

                          <p className="mt-1 pl-5 text-xs text-slate-400">
                            {formatDateTime(
                              contact.createdAt
                            )
                              .split(", ")
                              .slice(-1)
                              .join("")}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">
                          <select
                            value={contact.status}
                            disabled={
                              updatingId ===
                              contact._id
                            }
                            onChange={(event) =>
                              updateStatus(
                                contact,
                                event.target
                                  .value as ContactStatus
                              )
                            }
                            className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ring-1 ring-inset outline-none ${statusStyles(
                              contact.status
                            )} ${
                              updatingId ===
                              contact._id
                                ? "cursor-wait opacity-60"
                                : "cursor-pointer"
                            }`}
                          >
                            <option value="new">
                              New
                            </option>

                            <option value="contacted">
                              Contacted
                            </option>

                            <option value="in-progress">
                              In Progress
                            </option>

                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedContact(
                                contact
                              )
                            }
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        {/* Mobile Cards */}
        {!loading &&
          visibleContacts.length > 0 && (
            <section className="mt-6 space-y-4 lg:hidden">
              {visibleContacts.map((contact) => (
                <article
                  key={contact._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                        {getInitials(contact.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">
                          {contact.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {contact.email}
                        </p>

                        {contact.company && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {contact.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles(
                        contact.status
                      )}`}
                    >
                      {getStatusLabel(
                        contact.status
                      )}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      Service
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {contact.service}
                    </p>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">
                      Requirement
                    </p>

                    <p className="mt-1 line-clamp-3 text-sm leading-5 text-slate-600">
                      {contact.requirement}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />

                        {formatDate(
                          contact.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedContact(contact)
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

        {/* Bottom info */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Contact enquiry management
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                All enquiries submitted from the website
                contact form are stored in MongoDB. You can
                review customer details, copy contact
                information and update each enquiry from New
                through Completed.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedContact(null)}
          />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                  {getInitials(
                    selectedContact.name
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-600">
                    Contact Enquiry
                  </p>

                  <h2 className="mt-1 truncate text-xl font-bold text-slate-950">
                    {selectedContact.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Received{" "}
                    {formatDateTime(
                      selectedContact.createdAt
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedContact(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(90vh-150px)] overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />

                      <span className="text-xs font-medium text-slate-400">
                        Email
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          selectedContact.email,
                          "Email"
                        )
                      }
                      className="text-slate-400 hover:text-slate-700"
                      title="Copy email"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="mt-2 block break-all text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {selectedContact.email}
                  </a>
                </div>

                {/* Phone */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />

                      <span className="text-xs font-medium text-slate-400">
                        Phone
                      </span>
                    </div>

                    {selectedContact.phone && (
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            selectedContact.phone || "",
                            "Phone"
                          )
                        }
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy phone"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {selectedContact.phone ? (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="mt-2 block text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {selectedContact.phone}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      Not provided
                    </p>
                  )}
                </div>

                {/* Company */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />

                    <span className="text-xs font-medium text-slate-400">
                      Company
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedContact.company ||
                      "Not provided"}
                  </p>
                </div>

                {/* Service */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400" />

                    <span className="text-xs font-medium text-slate-400">
                      Service
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedContact.service}
                  </p>
                </div>
              </div>

              {/* Requirement */}
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Customer Requirement
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedContact.requirement}
                </p>
              </div>

              {/* Status */}
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Enquiry Status
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Update the current progress of this
                      enquiry.
                    </p>
                  </div>

                  <select
                    value={selectedContact.status}
                    disabled={
                      updatingId ===
                      selectedContact._id
                    }
                    onChange={(event) =>
                      updateStatus(
                        selectedContact,
                        event.target
                          .value as ContactStatus
                      )
                    }
                    className={`rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                      updatingId ===
                      selectedContact._id
                        ? "cursor-wait opacity-60"
                        : ""
                    }`}
                  >
                    <option value="new">
                      New
                    </option>

                    <option value="contacted">
                      Contacted
                    </option>

                    <option value="in-progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    deleteContact(selectedContact)
                  }
                  disabled={
                    deletingId ===
                    selectedContact._id
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />

                  {deletingId ===
                  selectedContact._id
                    ? "Deleting..."
                    : "Delete Enquiry"}
                </button>

                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>

                  {selectedContact.phone && (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:flex-none"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}