// src/pages/Projects.tsx
import { useEffect, useState, useCallback } from "react";
import api from "../api";

/* ---------- Types ---------- */
type PaymentStatus = "paid" | "unpaid" | "partial";

type Client = { id: number; name: string };
type Project = {
  id: number;
  title: string;
  status: "active" | "completed" | "on-hold";
  due_date?: string | null;
  start_date?: string | null;
  client: number;
  client_name?: string;
  payment_status?: PaymentStatus;
  payment_amount?: number;
  payment_currency?: string; // ISO code e.g. "USD","KES"
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

type StatusModalState = {
  open: boolean;
  project?: Project | null;
  targetStatus?: Project["status"];
};

type PaymentModalState = {
  open: boolean;
  project?: Project | null;
  chosenPayment?: PaymentStatus;
  amount?: number;
  currency?: string;
};

/* ---------- Component ---------- */
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredStatusId, setHoveredStatusId] = useState<number | null>(null);
  const [hoveredPaymentId, setHoveredPaymentId] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    client: 0,
    due_date: "",
    start_date: "",
    payment_status: "unpaid",
    payment_amount: 0,
    payment_currency: "USD",
  });

  const [statusModal, setStatusModal] = useState<StatusModalState>({ open: false });
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({ open: false });

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([api.get<Project[]>("/projects/"), api.get<Client[]>("/clients/")]);
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
  function formatMoney(amount?: number, currency?: string) {
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
  }

  // display-friendly payment label (maps "partial" -> "Partially paid")
  function displayPaymentLabel(status?: PaymentStatus) {
    if (!status) return "Unpaid";
    if (status === "partial") return "Partially paid";
    return status[0].toUpperCase() + status.slice(1); // "paid" -> "Paid", "unpaid" -> "Unpaid"
  }

  function sortByDueDateAsc(list: Project[]) {
    return [...list].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date!.localeCompare(b.due_date!);
    });
  }

  /* ---------- Create project ---------- */
  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const payload: any = {
        title: form.title,
        client: form.client,
        status: "active",
        start_date: form.start_date && form.start_date !== "" ? form.start_date : todayIso,
        due_date: form.due_date || null,
        payment_status: form.payment_status,
        payment_amount: form.payment_amount ?? 0,
        payment_currency: form.payment_currency ?? "USD",
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
      setError("Could not create project. Check your inputs.");
    }
  }

  /* ---------- Optimistic updates ---------- */
  async function patchProject(projectId: number, patch: Partial<Project>) {
    await api.patch(`/projects/${projectId}/`, patch);
  }

  async function updateProjectStatus(projectId: number, newStatus: Project["status"]) {
    setError("");
    const previous = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)));
    try {
      await patchProject(projectId, { status: newStatus } as Partial<Project>);
    } catch (err) {
      console.error(err);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? (previous as Project) : p)));
      setError("Failed to update project status. Try again.");
    }
  }

  // payment update: amount is NOT editable here (we treat it as the total and immutable).
  async function updateProjectPayment(projectId: number, newPayment: PaymentStatus, currency?: string) {
    setError("");
    const previous = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, payment_status: newPayment, payment_currency: currency ?? p.payment_currency } : p)));
    try {
      const patchBody: any = { payment_status: newPayment };
      if (currency) patchBody.payment_currency = currency;
      await patchProject(projectId, patchBody);
    } catch (err) {
      console.error(err);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? (previous as Project) : p)));
      setError("Failed to update payment. Try again.");
    }
  }

  /* ---------- Modal openers ---------- */
  function openStatusModal(p: Project) {
    const targetStatus = p.status === "active" ? "completed" : "active";
    setStatusModal({ open: true, project: p, targetStatus });
  }

  function openPaymentModal(p: Project) {
    setPaymentModal({
      open: true,
      project: p,
      chosenPayment: p.payment_status ?? "unpaid",
      amount: p.payment_amount ?? 0, // displayed but not editable
      currency: p.payment_currency ?? "USD",
    });
  }

  const closeStatusModal = useCallback(() => setStatusModal({ open: false }), []);
  const closePaymentModal = useCallback(() => setPaymentModal({ open: false }), []);

  /* ---------- Modal confirm handlers ---------- */
  async function confirmStatusChange() {
    const p = statusModal.project;
    const target = statusModal.targetStatus;
    if (!p || !target) return;
    closeStatusModal();
    await updateProjectStatus(p.id, target);
  }

  async function confirmPaymentChange() {
    const p = paymentModal.project;
    if (!p || !paymentModal.chosenPayment) return;
    const chosen = paymentModal.chosenPayment;
    const currency = paymentModal.currency;
    closePaymentModal();
    await updateProjectPayment(p.id, chosen, currency);
  }

  /* ---------- Derived lists ---------- */
  const activeProjects = sortByDueDateAsc(projects.filter((p) => p.status !== "completed"));
  const completedProjects = sortByDueDateAsc(projects.filter((p) => p.status === "completed"));
  const completedUnpaid = completedProjects.filter((p) => (p.payment_status || "unpaid") !== "paid");

  /* ---------- Keyboard: close modals on ESC ---------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (statusModal.open) closeStatusModal();
        if (paymentModal.open) closePaymentModal();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [statusModal.open, paymentModal.open, closeStatusModal, closePaymentModal]);

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
          <button onClick={() => setAdding(true)} className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">
            New Project
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

        {/* Create form */}
        {adding && (
          <div className="mb-6 bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Add project</h2>
            <form onSubmit={addProject} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Title</label>
                <input className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Client</label>
                <select className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={form.client} onChange={(e) => setForm((s) => ({ ...s, client: Number(e.target.value) }))} required>
                  <option value={0} disabled>Select client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Project start</label>
                <input type="date" className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={form.start_date || ""} onChange={(e) => setForm((s) => ({ ...s, start_date: e.target.value }))} />
                <div className="text-xs text-gray-500 mt-1">Leave empty to use today</div>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Due date (optional)</label>
                <input type="date" className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={form.due_date || ""} onChange={(e) => setForm((s) => ({ ...s, due_date: e.target.value }))} />
              </div>

              <div>
                <label className="block text-sm text-gray-700">TOTAL Payment amount</label>
                <input type="number" min="0" step="0.01" className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={String(form.payment_amount ?? "")} onChange={(e) => { const raw = e.target.value; const num = raw === "" ? 0 : Number(parseFloat(raw)); setForm((s) => ({ ...s, payment_amount: Number.isFinite(num) ? num : 0 })); }} placeholder="e.g., 1500.00" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Currency</label>
                <select className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={form.payment_currency} onChange={(e) => setForm((s) => ({ ...s, payment_currency: e.target.value }))} required>
                  <option value="USD">USD — US Dollar</option>
                  <option value="KES">KES — Kenyan Shilling</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Payment status</label>
                <select className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500" value={form.payment_status} onChange={(e) => { const v = e.target.value as PaymentStatus; setForm((s) => ({ ...s, payment_status: v })); }}>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partially paid</option>
                  <option value="paid">Paid</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">Default: unpaid</div>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">Save</button>
                <button type="button" onClick={() => setAdding(false)} className="rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Active Projects table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Projects</h2>
            <div className="text-sm text-gray-500">Sorted by due date</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TOTAL Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading projects…</td></tr>
                ) : activeProjects.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No active projects.</td></tr>
                ) : (
                  activeProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{p.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.client_name || p.client}</td>

                      {/* status */}
                      <td className="px-4 py-3 text-sm">
                        <span onMouseEnter={() => setHoveredStatusId(p.id)} onMouseLeave={() => setHoveredStatusId(null)}
                          onClick={() => openStatusModal(p)} role="button" tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") openStatusModal(p); }}
                          className={"px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer " + (p.status === "completed" ? "bg-green-100 text-green-700" : p.status === "on-hold" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700")}
                          title={p.status === "completed" ? "Click to revert to active" : "Click to mark as completed"}>
                          {hoveredStatusId === p.id ? "Click here if project is completed" : p.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">{p.start_date || "—"}</td>

                      {/* payment */}
                      <td className="px-4 py-3 text-sm flex items-center gap-3">
                        <div>{formatMoney(p.payment_amount, p.payment_currency)}</div>
                        <span onMouseEnter={() => setHoveredPaymentId(p.id)} onMouseLeave={() => setHoveredPaymentId(null)}
                          onClick={() => openPaymentModal(p)} role="button" tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") openPaymentModal(p); }}
                          className={"ml-2 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer " + (p.payment_status === "paid" ? "bg-green-50 text-green-700" : p.payment_status === "partial" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}
                          title={`Payment: ${displayPaymentLabel(p.payment_status)}`}>
                          {hoveredPaymentId === p.id ? "Click to change payment" : displayPaymentLabel(p.payment_status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-right text-gray-500">{p.due_date || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Completed Projects</h2>
            <div className="text-sm text-gray-500">Sorted by due date</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TOTAL Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {completedProjects.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No completed projects.</td></tr>
                ) : (
                  completedProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{p.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.client_name || p.client}</td>

                      <td className="px-4 py-3 text-sm">
                        <span onMouseEnter={() => setHoveredStatusId(p.id)} onMouseLeave={() => setHoveredStatusId(null)}
                          onClick={() => openStatusModal(p)} role="button" tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") openStatusModal(p); }}
                          className="px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer bg-green-100 text-green-700" title="Click to revert to active">
                          {hoveredStatusId === p.id ? "Click to revert to active" : p.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500">{p.start_date || "—"}</td>

                      <td className="px-4 py-3 text-sm flex items-center gap-3">
                        <div>{formatMoney(p.payment_amount, p.payment_currency)}</div>
                        <span onMouseEnter={() => setHoveredPaymentId(p.id)} onMouseLeave={() => setHoveredPaymentId(null)}
                          onClick={() => openPaymentModal(p)} role="button" tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") openPaymentModal(p); }}
                          className={"ml-2 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer " + (p.payment_status === "paid" ? "bg-green-50 text-green-700" : p.payment_status === "partial" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>
                          {hoveredPaymentId === p.id ? "Click to change payment" : displayPaymentLabel(p.payment_status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-right text-gray-500">{p.due_date || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom-most: Completed & Unpaid / Partially Paid */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Completed & Unpaid / Partially Paid</h2>
            <p className="text-sm text-gray-500">Quick list of completed projects that still need payment attention.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TOTAL Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {completedUnpaid.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No completed unpaid/partial projects.</td></tr>
                ) : (
                  completedUnpaid.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{p.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.client_name || p.client}</td>
                      <td className="px-4 py-3 text-sm flex items-center gap-3">
                        <div>{formatMoney(p.payment_amount, p.payment_currency)}</div>
                        <span onMouseEnter={() => setHoveredPaymentId(p.id)} onMouseLeave={() => setHoveredPaymentId(null)}
                          onClick={() => openPaymentModal(p)} role="button" tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") openPaymentModal(p); }}
                          className={"ml-2 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer " + (p.payment_status === "partial" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>
                          {hoveredPaymentId === p.id ? "Click to change payment" : displayPaymentLabel(p.payment_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{p.due_date || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ---------- Status Confirm Modal ---------- */}
      {statusModal.open && statusModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeStatusModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {statusModal.targetStatus === "completed" ? "Mark project as completed" : "Revert project to active"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {statusModal.targetStatus === "completed"
                ? `Are you sure you want to mark "${statusModal.project.title}" as completed?`
                : `Are you sure you want to revert "${statusModal.project.title}" back to active?`}
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeStatusModal} className="rounded-lg px-4 py-2 border text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmStatusChange} className="rounded-lg px-4 py-2 bg-red-600 text-white hover:bg-red-700">
                {statusModal.targetStatus === "completed" ? "Mark Completed" : "Revert to Active"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Payment Modal (amount read-only) ---------- */}
      {paymentModal.open && paymentModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closePaymentModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-900">Update payment for "{paymentModal.project.title}"</h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700">Payment status</label>
                <div className="mt-2 flex gap-2">
                  {(["paid", "partial", "unpaid"] as PaymentStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPaymentModal((m) => ({ ...(m as PaymentModalState), chosenPayment: s }))}
                      className={
                        "px-3 py-1 rounded-full text-xs font-medium border " +
                        (paymentModal.chosenPayment === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700")
                      }
                    >
                      {s === "partial" ? "Partially paid" : s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount (read-only) */}
              <div>
                <label className="block text-sm text-gray-700">Amount (total)</label>
                <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {formatMoney(paymentModal.amount, paymentModal.currency)}
                </div>
                <div className="text-xs text-gray-500 mt-1">This is the total amount for the project and cannot be changed here.</div>
              </div>

              {/* Currency (editable) */}
            
              
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closePaymentModal} className="rounded-lg px-4 py-2 border text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmPaymentChange} className="rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
