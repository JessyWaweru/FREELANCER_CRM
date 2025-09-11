import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div>
      <nav className="flex items-center justify-between border-b border-gray-300 px-4 py-3">
        {/* Left side links */}
        <div className="space-x-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Clients
          </Link>
          <Link to="/projects" className="text-blue-600 hover:underline">
            Projects
          </Link>
          <Link to="/invoices" className="text-blue-600 hover:underline">
            Invoices
          </Link>
        </div>

        {/* Right side link */}
        <div>
          <Link to="/login" className="text-red-600 hover:underline">
            Logout
          </Link>
        </div>
      </nav>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
