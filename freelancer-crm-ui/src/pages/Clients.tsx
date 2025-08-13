// src/pages/Clients.tsx
import { useEffect, useState } from "react";
//useEffect → React hook for running side effects (like fetching data from the server).
import api from "../api";

type Client = {
    //A TypeScript type describing what a Client object looks like.
  id: number; name: string; email: string; phone: string; 
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
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
    const { data } = await api.post("/clients/", { name });
    setClients([data, ...clients]);
    setName("");
    //Sends a POST /clients/ with { name } as the body.

//Takes the newly created client from the backend response (data) and:

//Adds it to the top of the clients list ([data, ...clients]).

//Resets the name input.
  }

  return (
    <div>
      <h2>Clients</h2>
      <form onSubmit={addClient}>
        <input placeholder="Client name" value={name} onChange={e=>setName(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {clients.map(c => <li key={c.id}>{c.name} — {c.email}</li>)}
      </ul>
    </div>
  );
}
