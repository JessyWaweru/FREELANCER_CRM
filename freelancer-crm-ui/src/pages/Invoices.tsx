import { useEffect, useState } from "react";
import api from "../api";

type Client = { id: number; name: string };
type Invoice = {
  id: number;
  number: string;
  client: number;           // FK id
  client_name?: string;     // if your API includes it
  issue_date?: string;
  due_date?: string | null;
  status: "draft" | "sent" | "paid" | "overdue";
  total: string;            // string to avoid float issues in inputs
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [form, setForm] = useState<Partial<Invoice>>({
    number: "", client: 0, total: "0.00", status: "draft", due_date: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const [i, c] = await Promise.all([
          api.get<Invoice[]>("/invoices/"),
          api.get<Client[]>("/clients/"),
        ]);
        setInvoices(i.data);
        setClients(c.data);
      } catch {
        setError("Failed to load invoices or clients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addInvoice(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post<Invoice>("/invoices/", form);
      setInvoices((prev)=>[data, ...prev]);
      setAdding(false);
      setForm({ number: "", client: 0, total: "0.00", status: "draft", due_date: "" });
    } catch {
      setError("Could not create invoice. Check your inputs.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
          <button onClick={()=>setAdding(true)} className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">New Invoice</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

        {adding && (
          <div className="mb-6 bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Add invoice</h2>
            <form onSubmit={addInvoice} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Invoice number</label>
                <input className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.number || ""}
                  onChange={(e)=>setForm(f=>({...f, number:e.target.value}))}
                  required />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Client</label>
                <select className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.client || 0}
                  onChange={(e)=>setForm(f=>({...f, client:Number(e.target.value)}))}
                  required>
                  <option value={0} disabled>Select client…</option>
                  {clients.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Total</label>
                <input className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  type="number" step="0.01"
                  value={form.total ?? "0.00"}
                  onChange={(e)=>setForm(f=>({...f, total:e.target.value}))}/>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Status</label>
                <select className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.status || "draft"}
                  onChange={(e)=>setForm(f=>({...f, status:e.target.value as Invoice["status"]}))}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700">Due date</label>
                <input className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  type="date"
                  value={(form.due_date as string) || ""}
                  onChange={(e)=>setForm(f=>({...f, due_date:e.target.value}))}/>
              </div>

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700">Save</button>
                <button type="button" onClick={()=>setAdding(false)} className="rounded-lg border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading invoices…</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No invoices yet.</td></tr>
                ) : (
                  invoices.map(inv=>(
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{inv.number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{inv.client_name || inv.client}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={
                          "px-2 py-1 rounded text-xs font-medium " +
                          (inv.status==="paid" ? "bg-green-100 text-green-700"
                           : inv.status==="overdue" ? "bg-red-100 text-red-700"
                           : inv.status==="sent" ? "bg-indigo-100 text-indigo-700"
                           : "bg-gray-100 text-gray-700")
                        }>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">KES {inv.total}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">{inv.due_date || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
