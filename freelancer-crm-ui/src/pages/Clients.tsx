// src/pages/Clients.tsx

// src/pages/Clients.tsx
// src/pages/Clients.tsx

import { useEffect, useState } from "react";
import api from "../api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/helpers/PhoneInput";

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [company, setCompany] = useState("");

  useEffect(() => {
    api.get("/clients/").then((r) => setClients(r.data));
  }, []);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid) return;

    const { data } = await api.post("/clients/", { name, phone, company });

    setClients([data, ...clients]);
    setName("");
    setPhone("");
    setPhoneValid(false);
    setCompany("");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-2xl font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and view your clients.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <form
          onSubmit={addClient}
          className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 sm:gap-6 sm:p-8"
        >
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

          <div>
            <Label>Contact</Label>
            <PhoneInput
              value={phone}
              onChange={(val) => setPhone(val)}
              onValidChange={(valid) => setPhoneValid(valid)}
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="e.g., Acme Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!phoneValid}
          >
            Add
          </Button>

          <p className="mt-2 text-xs text-gray-500">
            New clients appear at the top of the list.
          </p>
        </form>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {clients.length === 0 ? (
              <li className="px-6 py-10 text-center text-gray-500 text-sm sm:text-base">
                No clients yet. Add your first client above.
              </li>
            ) : (
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
