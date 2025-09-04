// src/pages/Clients.tsx
import { useEffect, useState } from "react";
//useEffect → React hook for running side effects (like fetching data from the server).
import api from "../api";

type Client = {
    //A TypeScript type describing what a Client object looks like.
  id: number; name: string; email: string; phone: string; company: string;
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<number | "">("");
  const [company, setCompany] = useState("");
//clients → Array of all clients fetched from the backend.
// name → The value of the new client name input field.


  useEffect(() => {
    api.get("/clients/").then(r => setClients(r.data));
  }, []);
//Runs once when the component loads (empty [] dependency array).
// Sends a GET /clients/ request to the backend.
// Sets the response data (r.data) into clients state.

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await api.post("/clients/", { name ,phone,company});
    setClients([data, ...clients]);
    setName("");
    setPhone("");
    setCompany("");
    //Sends a POST /clients/ with { name } as the body.

    //Takes the newly created client from the backend response (data) and:

    //Adds it to the top of the clients list ([data, ...clients]).

    //Resets the name input.
  }

  return (
    // Container with subtle background and centered content
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
          {/* Small helper text (optional) */}
          <p className="text-sm text-gray-500 mt-1">Create and view your clients.</p>
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Add client form, styled like a card */}
        <form onSubmit={addClient} className="bg-white rounded-2xl shadow p-6">
           <label className="block">
          <div className="text-sm mb-1">Client Name</div>
          <input
            className="w-full border rounded p-2"
            placeholder="e.g., Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
             <label className="block">
          <div className="text-sm mb-1">Contact</div>
          <input
            className="w-full border rounded p-2"
            type="number"
            min={0}
            placeholder="client phone"
            value={phone}
            onChange={(e) => {
              const v = e.target.value;
              setPhone(v === "" ? "" : Number(v));
            }}
          />
        </label>
          <label className="block">
          <div className="text-sm mb-1">Company</div>
          <input
            className="w-full border rounded p-2"
            placeholder="e.g., Acme Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
            <button
              className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 transition"
            >
              Add
            </button>
          
          {/* Tiny hint below the form */}
          <p className="mt-2 text-xs text-gray-500">
            New clients appear at the top of the list.
          </p>
        </form>

        {/* Clients list card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {clients.length === 0 ? (
              <li className="px-6 py-10 text-center text-gray-500">
                No clients yet. Add your first client above.
              </li>
            ) : (
              clients.map(c => (
                <li key={c.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{c.name}</div>
                      <div className="text-sm text-gray-600">{c.phone}</div>
                    </div>
                    <div className="text-sm text-gray-500">{c.company}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
