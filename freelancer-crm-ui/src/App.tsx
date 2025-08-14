import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <Link to="/">Clients</Link> |{" "}
        <Link to="/login">Logout</Link>
         <Link to="/projects" className="ml-4">Projects</Link>
  <Link to="/invoices" className="ml-4">Invoices</Link>
      </nav>
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
