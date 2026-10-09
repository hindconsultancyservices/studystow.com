"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useAdminPermissions } from "@/components/admin/AdminPermissionsProvider";

type Status = "pending" | "approved" | "paid" | "rejected";
type Priority = "low" | "normal" | "high" | "urgent";

type Expense = {
  id: string;
  date: string;
  title: string;
  category: string;
  vendor: string;
  description: string;
  paymentMethod: string;
  status: Status;
  priority: Priority;
  amount: number;
  taxAmount: number;
  reference: string;
  notes: string;
};

type ExpenseForm = {
  date: string;
  title: string;
  category: string;
  vendor: string;
  description: string;
  paymentMethod: string;
  status: Status;
  priority: Priority;
  amount: string;
  taxAmount: string;
  reference: string;
  notes: string;
};

const today = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const newForm = (): ExpenseForm => ({
  date: today(),
  title: "",
  category: "",
  vendor: "",
  description: "",
  paymentMethod: "",
  status: "pending",
  priority: "normal",
  amount: "",
  taxAmount: "0",
  reference: "",
  notes: "",
});

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function displayDate(value: string) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalize(value: Record<string, unknown>): Expense {
  const statuses: Status[] = ["pending", "approved", "paid", "rejected"];
  const priorities: Priority[] = ["low", "normal", "high", "urgent"];

  return {
    id: String(value.id || value._id || ""),
    date: value.date ? String(value.date) : "",
    title: String(value.title || ""),
    category: String(value.category || ""),
    vendor: String(value.vendor || ""),
    description: String(value.description || ""),
    paymentMethod: String(value.paymentMethod || ""),
    status: statuses.includes(value.status as Status)
      ? (value.status as Status)
      : "pending",
    priority: priorities.includes(value.priority as Priority)
      ? (value.priority as Priority)
      : "normal",
    amount: Number(value.amount || 0),
    taxAmount: Number(value.taxAmount || 0),
    reference: String(value.reference || ""),
    notes: String(value.notes || ""),
  };
}

function badge(status: Status) {
  const styles: Record<Status, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    paid: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
  };

  return styles[status];
}

export default function ExpensesPage() {
  const { isOwner, canView } = useAdminPermissions();

  const canAccess = isOwner || canView("reports");
  const canManage = isOwner;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<ExpenseForm>(newForm);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(
        `/api/admin/reports/expenses?${params.toString()}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Could not load expenses (${response.status}).`,
        );
      }

      const rows = Array.isArray(result.data)
        ? result.data.map((row: Record<string, unknown>) => normalize(row))
        : [];

      setExpenses(rows);
      setSelected([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load expenses.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, search]);

  useEffect(() => {
    if (canAccess) void loadExpenses();
    else setLoading(false);
  }, [canAccess, loadExpenses]);

  const categories = useMemo(
    () => [...new Set(expenses.map((e) => e.category).filter(Boolean))].sort(),
    [expenses],
  );

  const rows = useMemo(
    () =>
      expenses.filter((e) => {
        if (status !== "all" && e.status !== status) return false;
        if (category !== "all" && e.category !== category) return false;

        return true;
      }),
    [expenses, status, category],
  );

  const total = rows.reduce((sum, e) => sum + e.amount, 0);

  const paid = rows
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  const pending = rows
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  function openAdd() {
    setEditingId("");
    setForm(newForm());
    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function openEdit(e: Expense) {
    setEditingId(e.id);

    setForm({
      date: e.date ? e.date.slice(0, 10) : today(),
      title: e.title,
      category: e.category,
      vendor: e.vendor,
      description: e.description,
      paymentMethod: e.paymentMethod,
      status: e.status,
      priority: e.priority,
      amount: String(e.amount),
      taxAmount: String(e.taxAmount),
      reference: e.reference,
      notes: e.notes,
    });

    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function setField<K extends keyof ExpenseForm>(
    key: K,
    value: ExpenseForm[K],
  ) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function saveExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!canManage) {
      setError("Only the owner can add or edit expenses.");
      return;
    }

    const amount = Number(form.amount);
    const taxAmount = Number(form.taxAmount || 0);

    if (!form.title.trim() || !form.category.trim() || !form.date) {
      setError("Date, title and category are required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (!Number.isFinite(taxAmount) || taxAmount < 0) {
      setError("Tax amount must be zero or greater.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/reports/expenses", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
          title: form.title.trim(),
          category: form.category.trim(),
          amount,
          taxAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Save failed (${response.status}).`,
        );
      }

      setModalOpen(false);
      setMessage(editingId ? "Expense updated." : "Expense created.");

      await loadExpenses();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save expense.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(e: Expense, nextStatus: Status) {
    if (!canManage) return;

    setBusyId(e.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/reports/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, status: nextStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Status update failed.");
      }

      setMessage(`Expense marked ${nextStatus}.`);

      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteExpense(e: Expense) {
    if (!canManage) return;

    if (!window.confirm(`Permanently delete "${e.title}"?`)) return;

    setBusyId(e.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/reports/expenses?id=${encodeURIComponent(e.id)}`,
        { method: "DELETE" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Delete failed.");
      }

      setMessage("Expense deleted.");

      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId("");
    }
  }

  async function bulkApprove() {
    if (!canManage || selected.length === 0) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      for (const id of selected) {
        const response = await fetch("/api/admin/reports/expenses", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "approved" }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Bulk approval failed.");
        }
      }

      setMessage(`${selected.length} expense(s) approved.`);

      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk approval failed.");
    } finally {
      setSaving(false);
    }
  }

  async function bulkDelete() {
    if (!canManage || selected.length === 0) return;

    if (!window.confirm(`Delete ${selected.length} selected expenses?`)) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      for (const id of selected) {
        const response = await fetch(
          `/api/admin/reports/expenses?id=${encodeURIComponent(id)}`,
          { method: "DELETE" },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Bulk delete failed.");
        }
      }

      setMessage("Selected expenses deleted.");

      await loadExpenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk delete failed.");
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const escape = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const headers = [
      "Date",
      "Title",
      "Category",
      "Vendor",
      "Payment Method",
      "Status",
      "Priority",
      "Amount",
      "Tax",
      "Reference",
    ];

    const data = rows.map((e) => [
      e.date,
      e.title,
      e.category,
      e.vendor,
      e.paymentMethod,
      e.status,
      e.priority,
      e.amount,
      e.taxAmount,
      e.reference,
    ]);

    const csv = [headers, ...data]
      .map((line) => line.map(escape).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = `studystow-expenses-${today()}.csv`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  if (!canAccess) {
    return (
      <main className="mx-auto max-w-lg p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-600" />

        <h1 className="mt-4 text-xl font-bold">Access denied</h1>

        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to view expense reports.
        </p>

        <Link
          href="/admin"
          className="mt-4 inline-flex gap-2 text-sm underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to admin
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1700px] space-y-6 p-3 sm:p-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs text-slate-500">
            <Link href="/admin/reports" className="hover:underline">
              Reports
            </Link>{" "}
            / Expenses
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            Expenses
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage expense records from your database.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void loadExpenses()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          {canManage && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </button>
          )}
        </div>
      </header>

      {(error || message) && (
        <div
          className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span>{error || message}</span>

          <button
            onClick={() => {
              setError("");
              setMessage("");
            }}
            aria-label="Close message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Expenses", money(total), Wallet],
          ["Paid Expenses", money(paid), CheckCircle2],
          ["Pending Amount", money(pending), Wallet],
          ["Records", String(rows.length), RefreshCw],
        ].map(([title, value, Icon], index) => {
          const CardIcon = Icon as typeof Wallet;

          return (
            <div
              key={String(title)}
              className={`rounded-2xl border p-5 ${
                index === 3
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {String(title)}
                </span>

                <CardIcon className="h-5 w-5" />
              </div>

              <p className="mt-3 text-2xl font-bold">
                {loading ? "Loading…" : String(value)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-950">Search and filters</h2>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses…"
              className={`${inputClass} pl-9`}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="all">All categories</option>

            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="date"
            aria-label="From date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={inputClass}
          />

          <input
            type="date"
            aria-label="To date"
            min={fromDate || undefined}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          onClick={() => {
            setSearch("");
            setStatus("all");
            setCategory("all");
            setFromDate("");
            setToDate("");
          }}
          className="text-sm font-semibold text-slate-600 underline"
        >
          Clear filters
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-bold text-slate-950">Expense records</h2>

            <p className="mt-1 text-xs text-slate-500">
              {rows.length} record(s)
            </p>
          </div>

          {canManage && selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void bulkApprove()}
                disabled={saving}
                className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Approve selected ({selected.length})
              </button>

              <button
                onClick={() => void bulkDelete()}
                disabled={saving}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
              >
                Delete selected
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {canManage && (
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={
                        rows.length > 0 &&
                        rows.every((e) => selected.includes(e.id))
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? rows.map((x) => x.id) : [],
                        )
                      }
                    />
                  </th>
                )}

                <th className="px-4 py-3">Expense</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>

                {canManage && (
                  <th className="px-4 py-3 text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 5}
                    className="p-12 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                    Loading database records…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 5}
                    className="p-12 text-center text-slate-500"
                  >
                    <Wallet className="mx-auto mb-2 h-8 w-8 text-slate-300" />

                    <p className="font-semibold">No expenses found</p>

                    <p className="mt-1 text-xs">
                      Change filters or add an expense.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    {canManage && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ${e.title}`}
                          checked={selected.includes(e.id)}
                          onChange={(event) =>
                            setSelected((old) =>
                              event.target.checked
                                ? [...old, e.id]
                                : old.filter((id) => id !== e.id),
                            )
                          }
                        />
                      </td>
                    )}

                    <td className="max-w-[260px] px-4 py-4">
                      <p className="truncate font-semibold text-slate-900">
                        {e.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {e.vendor || e.reference || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4">{e.category || "—"}</td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {displayDate(e.date)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-semibold">
                      {money(e.amount)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badge(
                          e.status,
                        )}`}
                      >
                        {e.status}
                      </span>
                    </td>

                    {canManage && (
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            title="Edit"
                            aria-label={`Edit ${e.title}`}
                            onClick={() => openEdit(e)}
                            className="rounded-lg p-2 hover:bg-slate-100"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {e.status === "pending" && (
                            <button
                              title="Approve"
                              aria-label={`Approve ${e.title}`}
                              disabled={busyId === e.id}
                              onClick={() => void updateStatus(e, "approved")}
                              className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            title="Delete"
                            aria-label={`Delete ${e.title}`}
                            disabled={busyId === e.id}
                            onClick={() => void deleteExpense(e)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsive Add/Edit Expense Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-2 sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
              setError("");
            }
          }}
        >
          <div className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh]">
            {/* Modal header stays visible */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                  {editingId ? "Edit Expense" : "Add Expense"}
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Changes are submitted to the Expenses API.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!saving) {
                    setModalOpen(false);
                    setError("");
                  }
                }}
                disabled={saving}
                aria-label="Close form"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Only the form fields scroll */}
            <form
              onSubmit={saveExpense}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              <div className="space-y-4 p-4 sm:p-6">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Title *
                    <input
                      required
                      maxLength={180}
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Category *
                    <input
                      required
                      maxLength={100}
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Date *
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) => setField("date", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Amount (₹) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setField("amount", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Tax amount (₹)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.taxAmount}
                      onChange={(e) => setField("taxAmount", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Vendor
                    <input
                      value={form.vendor}
                      onChange={(e) => setField("vendor", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Payment method
                    <input
                      value={form.paymentMethod}
                      onChange={(e) =>
                        setField("paymentMethod", e.target.value)
                      }
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Reference
                    <input
                      value={form.reference}
                      onChange={(e) => setField("reference", e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Status
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setField("status", e.target.value as Status)
                      }
                      className={`${inputClass} mt-1.5`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600">
                    Priority
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setField("priority", e.target.value as Priority)
                      }
                      className={`${inputClass} mt-1.5`}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600 sm:col-span-2">
                    Description
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setField("description", e.target.value)
                      }
                      className={`${inputClass} mt-1.5 resize-y`}
                    />
                  </label>

                  <label className="block min-w-0 text-xs font-semibold text-slate-600 sm:col-span-2">
                    Notes
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setField("notes", e.target.value)}
                      className={`${inputClass} mt-1.5 resize-y`}
                    />
                  </label>
                </div>
              </div>

              {/* Footer stays visible while fields scroll */}
              <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setModalOpen(false);
                      setError("");
                    }
                  }}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}

                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save Changes"
                      : "Create Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}