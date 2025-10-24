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

  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");

  const currencyOptions = ["USD", "KES", "EUR", "GBP"];

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

  const toggleStatus = async (p: Project) => {
    const newStatus = p.status === "completed" ? "active" : "completed";
    const prev = p.status;
    setProjects((prevList) =>
      prevList.map((proj) => (proj.id === p.id ? { ...proj, status: newStatus } : proj))
    );
    try {
      await api.patch(`/projects/${p.id}/`, { status: newStatus });
    } catch (err) {
      console.error(err);
      setProjects((prevList) =>
        prevList.map((proj) => (proj.id === p.id ? { ...proj, status: prev } : proj))
      );
      setError("Failed to update status.");
    }
  };

  const updateProject = async (
    projectId: number,
    field: "payment_amount" | "payment_currency",
    value: any
  ) => {
    const prevProj = projects.find((p) => p.id === projectId);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, [field]: value } : p))
    );
    try {
      await api.patch(`/projects/${projectId}/`, { [field]: value });
    } catch (err) {
      console.error(err);
      if (prevProj)
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? prevProj : p))
        );
      setError("Failed to update project.");
    }
  };

  const deleteProject = async (p: Project) => {
    if (!confirm(`Are you sure you want to delete project "${p.title}"?`)) return;
    const prevProjects = [...projects];
    setProjects((prev) => prev.filter((proj) => proj.id !== p.id));
    try {
      await api.delete(`/projects/${p.id}/`);
    } catch (err) {
      console.error(err);
      setProjects(prevProjects);
      setError("Failed to delete project.");
    }
  };

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
    const matchesTab = tab === "all" ? true : p.status === tab;
    const clientName = clients.find((c) => c.id === p.client)?.name || "";
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
            {(["all", "active", "completed"] as const).map((t) => (
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
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
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

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl shadow p-4 border ${
                    overdue ? "border-red-500" : "border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3
                      className={`font-semibold text-lg ${
                        overdue ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {p.title}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => toggleStatus(p)}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:animate-pulse relative group"
                        title={`Click to confirm as ${
                          p.status === "completed" ? "Active" : "Completed"
                        }`}
                      >
                        {p.status === "completed" ? "Completed" : "Active"}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block text-xs text-gray-700 bg-white border rounded px-1 shadow">
                          Click to confirm
                        </span>
                      </button>

                      <button
                        onClick={() => deleteProject(p)}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Client badge */}
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {client?.name || "—"}
                    </span>
                  </div>

                  {/* Payment details */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="font-medium text-sm">Payment:</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="px-2 py-1 border rounded w-24 text-sm font-medium text-indigo-700"
                      value={p.payment_amount ?? 0}
                      onChange={(e) =>
                        updateProject(p.id, "payment_amount", parseFloat(e.target.value))
                      }
                    />
                    <select
                      className="px-2 py-1 border rounded w-20 text-sm font-medium text-indigo-700"
                      value={p.payment_currency ?? "USD"}
                      onChange={(e) =>
                        updateProject(p.id, "payment_currency", e.target.value)
                      }
                    >
                      {currencyOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${paymentColor}`}
                    >
                      {p.payment_status}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="mt-2 text-sm text-gray-500">
                    Start: {p.start_date ?? "—"} | Due: {p.due_date ?? "—"}
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
  
