// src/pages/Clients.tsx

import { useEffect, useState } from "react";
import api from "../api"; // API helper to handle backend requests

// 🧩 Type definition for a Client object
type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
};

// 📄 Clients page — lets user view and add clients
export default function Clients() {
  // React state variables
  const [clients, setClients] = useState<Client[]>([]); // All clients fetched from backend
  const [name, setName] = useState(""); // Input field: client name
  const [phone, setPhone] = useState<number | "">(""); // Input field: client phone
  const [company, setCompany] = useState(""); // Input field: client company

  // ⚙️ Fetch clients when component mounts
  useEffect(() => {
    api.get("/clients/").then((r) => setClients(r.data));
  }, []);
  // Runs once (empty dependency array)
  // → Sends GET /clients/ to backend
  // → Stores response in `clients`

  // ➕ Add a new client
  async function addClient(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload
    const { data } = await api.post("/clients/", { name, phone, company });
    // Sends POST /clients/ with the new client data

    // Update the list (newest at top)
    setClients([data, ...clients]);

    // Reset form inputs
    setName("");
    setPhone("");
    setCompany("");
  }

  return (
    // 🌈 Container for entire page
    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Page header */}
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and view your clients.
          </p>
        </div>
      </header>

      {/* 🔹 Main content area */}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* ✏️ Add client form */}
        <form
          onSubmit={addClient}
          className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 sm:gap-6 sm:p-8"
        >
          {/* Client Name input */}
          <label className="block">
            <div className="text-sm mb-1 font-medium text-gray-700">
              Client Name
            </div>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          {/* Client Contact input */}
          <label className="block">
            <div className="text-sm mb-1 font-medium text-gray-700">
              Contact
            </div>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
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

          {/* Client Company input */}
          <label className="block">
            <div className="text-sm mb-1 font-medium text-gray-700">
              Company
            </div>
            <input
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g., Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>

          {/* Submit button */}
          <button
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 transition w-full sm:w-auto"
          >
            Add
          </button>

          {/* Tiny helper text below form */}
          <p className="mt-2 text-xs text-gray-500">
            New clients appear at the top of the list.
          </p>
        </form>

        {/* 🧾 Clients list */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {/* If no clients, show message */}
            {clients.length === 0 ? (
              <li className="px-6 py-10 text-center text-gray-500 text-sm sm:text-base">
                No clients yet. Add your first client above.
              </li>
            ) : (
              // Otherwise, render each client
              clients.map((c) => (
                <li
                  key={c.id}
                  className="px-6 py-4 hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{c.name}</div>
                      <div className="text-gray-600">{c.phone}</div>
                    </div>
                    <div className="text-gray-500 mt-1 sm:mt-0">
                      {c.company}
                    </div>
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
