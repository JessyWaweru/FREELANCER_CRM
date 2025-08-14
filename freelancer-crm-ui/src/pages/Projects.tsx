import { useEffect, useState } from "react";
import api from "../api";

type Client = { id: number; name: string };
type Project = {
  id: number;
  title: string;
  status: "active" | "completed" | "on-hold";
  due_date?: string | null;
  client: number;              // FK id
  client_name?: string;        // convenience for display if your API returns it
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [form, setForm] = useState<Partial<Project>>({
    title: "", status: "active", client: 0, due_date: ""
  });

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          api.get<Project[]>("/projects/"),
          api.get<Client[]>("/clients/"),
        ]);
        setProjects(p.data);
        setClients(c.data);
      } catch {
        setError("Failed to load projects or clients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post<Project>("/projects/", form);
      setProjects((prev) => [data, ...prev]);
      setAdding(false);
      setForm({ title: "", status: "active", client: 0, due_date: "" });
    } catch {
      setError("Could not create project. Check your inputs.");
    }
  }

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

        {adding && (
          <div className="mb-6 bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-medium text-gray-900">Add project</h2>
            <form onSubmit={addProject} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">Title</label>
                <input className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.title || ""} onChange={(e)=>setForm(f=>({...f, title:e.target.value}))} required />
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
                <label className="block text-sm text-gray-700">Status</label>
                <select className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  value={form.status || "active"}
                  onChange={(e)=>setForm(f=>({...f, status: e.target.value as Project["status"]}))}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On hold</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading projects…</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No projects yet.</td></tr>
                ) : (
                  projects.map(p=>(
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{p.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.client_name || p.client}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={
                          "px-2 py-1 rounded text-xs font-medium " +
                          (p.status==="completed" ? "bg-green-100 text-green-700"
                           : p.status==="on-hold" ? "bg-amber-100 text-amber-700"
                           : "bg-indigo-100 text-indigo-700")
                        }>
                          {p.status}
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
    </div>
  );
}
