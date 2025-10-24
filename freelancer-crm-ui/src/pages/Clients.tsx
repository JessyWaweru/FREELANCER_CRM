// src/pages/Clients.tsx

import { useEffect, useState } from "react";
import api from "../api"; // API helper to handle backend requests
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
          <div>
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              placeholder="e.g., Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Client Contact input */}
          <div>
            <Label htmlFor="phone">Contact</Label>
            <Input
              id="phone"
              type="number"
              min={0}
              placeholder="client phone"
              value={phone}
              onChange={(e) => {
                const v = e.target.value;
                setPhone(v === "" ? "" : Number(v));
              }}
            />
          </div>

          {/* Client Company input */}
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="e.g., Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <Button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
            Add
          </Button>

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
                    <div className="text-gray-500 mt-1 sm:mt-0">{c.company}</div>
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
