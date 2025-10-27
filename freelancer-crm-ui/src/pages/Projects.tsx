// src/pages/Projects.tsx
import { useEffect, useState } from "react";
import api from "../api";

/* ---------- Types ---------- */
type PaymentStatus = "paid" | "unpaid" | "partial";

type Client = { id: number; name: string };
type Project = {
  id: number;
  title: string;
  status: "active" | "completed";
  due_date?: string | null;
  start_date?: string | null;
  client: number;
  client_name?: string;
  payment_status?: PaymentStatus;
  payment_amount?: number;
  payment_currency?: string;
};

type FormState = {
  title: string;
  client: number | 0;
  due_date?: string;
  start_date?: string;
  payment_status: PaymentStatus;
  payment_amount: number;
  payment_currency: string;
};

/* ---------- Component ---------- */
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    title: "",
    client: 0,
    due_date: "",
    start_date: "",
    payment_status: "unpaid",
    payment_amount: 0,
    payment_currency: "USD",
  });

  // Tabs: added "outstanding"
  const [tab, setTab] = useState<"all" | "active" | "completed" | "outstanding">(
    "all"
  );
  const [search, setSearch] = useState("");

  const currencyOptions = ["USD", "KES", "EUR", "GBP"];

  /* ---------- Inline edit states ---------- */
  // Which project is showing delete confirm
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(
    null
  );

  // Which project is editing payment fields
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [editingPaymentValues, setEditingPaymentValues] = useState<{
    [projectId: number]: { amount: string; currency: string };
  }>({});

  // Which project is editing payment status
  const [editingPaymentStatusId, setEditingPaymentStatusId] = useState<
    number | null
  >(null);
  const [editingPaymentStatusValue, setEditingPaymentStatusValue] = useState<
    PaymentStatus | null
  >(null);

  // Which project is showing confirm for status toggle
  const [confirmToggleStatusId, setConfirmToggleStatusId] = useState<
    number | null
  >(null);

  /* ---------- Fetch data ---------- */
  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get<Project[]>("/projects/"),
          api.get<Client[]>("/clients/"),
        ]);
        setProjects(pRes.data || []);
        setClients(cRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load projects or clients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- Helpers ---------- */
  const formatMoney = (amount?: number, currency?: string) => {
    if (amount == null || Number.isNaN(Number(amount))) return "—";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${Number(amount).toFixed(2)} ${currency ?? ""}`;
    }
  };

  const isOverdue = (p: Project) => {
    if (!p.due_date) return false;
    const today = new Date().toISOString().slice(0, 10);
    return p.status !== "completed" && p.due_date < today;
  };

  /* ---------- API actions with optimistic updates ---------- */

  // Update a project field with optimistic UI and rollback on failure
  const patchProjectField = async (
    projectId: number,
    patch: Partial<Project>
  ): Promise<boolean> => {
    const prev = projects.find((p) => p.id === projectId);
    setProjects((prevList) =>
      prevList.map((p) => (p.id === projectId ? { ...p, ...patch } : p))
    );
    try {
      await api.patch(`/projects/${projectId}/`, patch);
      return true;
    } catch (err) {
      console.error(err);
      if (prev) {
        setProjects((prevList) =>
          prevList.map((p) => (p.id === projectId ? prev : p))
        );
      }
      setError("Failed to update project.");
      return false;
    }
  };

  // Confirmed deletion (called after inline confirm)
  const performDelete = async (project: Project) => {
    const prevProjects = [...projects];
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    setConfirmingDeleteId(null);
    try {
      await api.delete(`/projects/${project.id}/`);
    } catch (err) {
      console.error(err);
      setProjects(prevProjects);
      setError("Failed to delete project.");
    }
  };

  /* ---------- Add project ---------- */
  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const payload = {
        title: form.title,
        client: form.client,
        status: "active",
        start_date: form.start_date || todayIso,
        due_date: form.due_date || null,
        payment_status: form.payment_status,
        payment_amount: form.payment_amount,
        payment_currency: form.payment_currency,
      };
      const { data } = await api.post<Project>("/projects/", payload);
      setProjects((prev) => [data, ...prev]);
      setAdding(false);
      setForm({
        title: "",
        client: 0,
        due_date: "",
        start_date: "",
        payment_status: "unpaid",
        payment_amount: 0,
        payment_currency: "USD",
      });
    } catch (err) {
      console.error(err);
      setError("Could not create project.");
    }
  };

  /* ---------- Filtered Projects ---------- */
  const filteredProjects = projects.filter((p) => {
    const matchesTab =
      tab === "all"
        ? true
        : tab === "active"
        ? p.status === "active"
        : tab === "completed"
        ? p.status === "completed"
        : // outstanding tab: any project with unpaid or partial
          tab === "outstanding"
        ? p.payment_status === "unpaid" || p.payment_status === "partial"
        : true;

    const clientName = clients.find((c) => c.id === p.client)?.name || "";
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  /* ---------- Inline edit flows ---------- */

  // Payment editing
  const startEditPayment = (p: Project) => {
    setEditingPaymentId(p.id);
    setEditingPaymentValues((prev) => ({
      ...prev,
      [p.id]: {
        amount: p.payment_amount == null ? "" : String(p.payment_amount),
        currency: p.payment_currency ?? "USD",
      },
    }));
  };
  const cancelEditPayment = (projectId: number) => {
    setEditingPaymentId((id) => (id === projectId ? null : id));
    setEditingPaymentValues((prev) => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });
  };
  const saveEditPayment = async (projectId: number) => {
    const values = editingPaymentValues[projectId];
    if (!values) return;
    const amount = values.amount === "" ? null : Number(values.amount);
    const currency = values.currency || "USD";

    const prev = projects.find((p) => p.id === projectId) ?? null;
    // optimistic update
    setProjects((prevList) =>
      prevList.map((p) =>
        p.id === projectId
          ? { ...p, payment_amount: amount ?? undefined, payment_currency: currency }
          : p
      )
    );

    cancelEditPayment(projectId);
    try {
      await api.patch(`/projects/${projectId}/`, {
        payment_amount: amount,
        payment_currency: currency,
      });
    } catch (err) {
      console.error(err);
      if (prev) {
        setProjects((prevList) =>
          prevList.map((p) => (p.id === projectId ? prev : p))
        );
      }
      setError("Failed to update payment.");
    }
  };

  // Payment status editing
  const startEditPaymentStatus = (p: Project) => {
    setEditingPaymentStatusId(p.id);
    setEditingPaymentStatusValue(p.payment_status ?? "unpaid");
  };
  const cancelEditPaymentStatus = () => {
    setEditingPaymentStatusId(null);
    setEditingPaymentStatusValue(null);
  };
  const saveEditPaymentStatus = async (projectId: number) => {
    if (!editingPaymentStatusValue) return;
    const prev = projects.find((p) => p.id === projectId) ?? null;
    setProjects((prevList) =>
      prevList.map((p) =>
        p.id === projectId ? { ...p, payment_status: editingPaymentStatusValue } : p
      )
    );
    setEditingPaymentStatusId(null);
    setEditingPaymentStatusValue(null);
    try {
      await api.patch(`/projects/${projectId}/`, {
        payment_status: editingPaymentStatusValue,
      });
    } catch (err) {
      console.error(err);
      if (prev) {
        setProjects((prevList) =>
          prevList.map((p) => (p.id === projectId ? prev : p))
        );
      }
      setError("Failed to update payment status.");
    }
  };

  // Status toggle requires confirm
  const startToggleStatusConfirm = (p: Project) => {
    setConfirmToggleStatusId(p.id);
  };
  const cancelToggleStatusConfirm = () => setConfirmToggleStatusId(null);
  const confirmToggleStatus = async (projectId: number) => {
    const p = projects.find((x) => x.id === projectId);
    if (!p) return;
    const newStatus = p.status === "completed" ? "active" : "completed";
    setConfirmToggleStatusId(null);
    await patchProjectField(projectId, { status: newStatus });
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700"
          >
            New Project
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* ---------- Add Project Form ---------- */}
        {adding && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Add Project</h2>
            <form
              onSubmit={addProject}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm text-gray-700">Title</label>
                <input
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.title}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Client</label>
                <select
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.client}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, client: Number(e.target.value) }))
                  }
                  required
                >
                  <option value={0} disabled>
                    Select client…
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.start_date || ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, start_date: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Due Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.due_date || ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, due_date: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">
                  Payment Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.payment_amount}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      payment_amount: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Currency</label>
                <select
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.payment_currency}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, payment_currency: e.target.value }))
                  }
                >
                  {currencyOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">
                  Payment Status
                </label>
                <select
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.payment_status}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      payment_status: e.target.value as PaymentStatus,
                    }))
                  }
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------- Tabs & Search ---------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-2">
            {(["all", "active", "completed", "outstanding"] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-full font-medium ${
                    tab === t
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t === "all"
                    ? "All"
                    : t === "outstanding"
                    ? "Outstanding Payments"
                    : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              )
            )}
          </div>

          <input
            type="text"
            placeholder="Search by title or client"
            className="w-full md:w-64 px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ---------- Projects Grid ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Loading projects…
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-10">
              No projects found.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const client = clients.find((c) => c.id === p.client);
              const overdue = isOverdue(p);
              const paymentColor =
                p.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : p.payment_status === "partial"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800";

              const editingPayment =
                editingPaymentId === p.id && editingPaymentValues[p.id];
              const editingPaymentStatus = editingPaymentStatusId === p.id;
              const confirmingDelete = confirmingDeleteId === p.id;
              const confirmingToggle = confirmToggleStatusId === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl shadow p-4 border flex flex-col justify-between ${
                    overdue ? "border-red-500" : "border-transparent"
                  }`}
                >
                  {/* Top area */}
                  <div>
                    <div className="flex justify-between items-start">
                      <h3
                        className={`font-semibold text-lg ${
                          overdue ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {p.title}
                      </h3>

                      <div className="flex gap-2 items-center">
                        {/* status -- click to confirm */}
                        <div className="relative group">
                          <button
                            onClick={() => startToggleStatusConfirm(p)}
                            className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:animate-pulse"
                            title="Click to update"
                          >
                            {p.status === "completed" ? "Completed" : "Active"}
                          </button>

                          {/* inline confirm for toggling status */}
                          {confirmingToggle && (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => confirmToggleStatus(p.id)}
                                className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={cancelToggleStatusConfirm}
                                className="px-3 py-1 rounded border text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {/* payment status badge (click to update) */}
                        <div className="relative group">
                          <span
                            onClick={() => startEditPaymentStatus(p)}
                            className={`px-2 py-1 rounded-full text-sm font-medium cursor-pointer ${paymentColor}`}
                            title="Click to update"
                          >
                            {p.payment_status ?? "—"}
                          </span>

                          {/* inline editor for payment status */}
                          {editingPaymentStatus && (
                            <div className="mt-2 flex gap-2 items-center">
                              <select
                                value={editingPaymentStatusValue ?? p.payment_status}
                                onChange={(e) =>
                                  setEditingPaymentStatusValue(
                                    e.target.value as PaymentStatus
                                  )
                                }
                                className="px-2 py-1 border rounded"
                              >
                                <option value="unpaid">unpaid</option>
                                <option value="partial">partial</option>
                                <option value="paid">paid</option>
                              </select>
                              <button
                                onClick={() => saveEditPaymentStatus(p.id)}
                                className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => cancelEditPaymentStatus()}
                                className="px-3 py-1 rounded border text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client badge */}
                    <div className="mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {client?.name || "—"}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="mt-3 text-sm text-gray-500">
                      Start: {p.start_date ?? "—"} | Due: {p.due_date ?? "—"}
                    </div>

                    {/* Payment display (click to edit) */}
                    <div className="mt-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">Payment:</span>

                        {!editingPayment ? (
                          <div
                            className="flex items-center gap-2"
                            title="Hover: Click to change"
                          >
                            <div
                              className="text-sm font-medium cursor-pointer"
                              onClick={() => startEditPayment(p)}
                            >
                              {formatMoney(p.payment_amount, p.payment_currency)}
                            </div>
                            <div
                              className="text-xs text-gray-500"
                              title="Click to change"
                            >
                              {p.payment_currency ?? ""}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="px-2 py-1 border rounded w-28"
                              value={editingPaymentValues[p.id]?.amount ?? ""}
                              onChange={(e) =>
                                setEditingPaymentValues((prev) => ({
                                  ...prev,
                                  [p.id]: {
                                    ...(prev[p.id] || { amount: "", currency: "USD" }),
                                    amount: e.target.value,
                                  },
                                }))
                              }
                            />
                            <select
                              className="px-2 py-1 border rounded"
                              value={editingPaymentValues[p.id]?.currency ?? "USD"}
                              onChange={(e) =>
                                setEditingPaymentValues((prev) => ({
                                  ...prev,
                                  [p.id]: {
                                    ...(prev[p.id] || { amount: "", currency: "USD" }),
                                    currency: e.target.value,
                                  },
                                }))
                              }
                            >
                              {currencyOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => saveEditPayment(p.id)}
                              className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => cancelEditPayment(p.id)}
                              className="px-3 py-1 rounded border text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom area: delete moved to bottom-most part */}
                  <div className="mt-4 flex flex-col items-start gap-2">
                    {/* Payment status repeated as a small helper (kept intentionally visible) */}
                    <div className="text-sm">
                      Status:{" "}
                      <span className="font-medium">
                        {p.status === "completed" ? "Completed" : "Active"}
                      </span>
                    </div>

                    {/* Delete / confirm delete */}
                    {!confirmingDelete ? (
                      <button
                        onClick={() => setConfirmingDeleteId(p.id)}
                        className="mt-2 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        title="Click to confirm deletion"
                      >
                        Delete
                      </button>
                    ) : (
                      <div className="mt-2 flex gap-2 items-center">
                        <span className="text-sm text-gray-700">Confirm delete?</span>
                        <button
                          onClick={() => performDelete(p)}
                          className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-3 py-1 rounded border text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
