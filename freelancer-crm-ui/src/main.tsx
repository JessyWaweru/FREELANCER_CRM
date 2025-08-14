import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Clients from "./pages/Clients";
import ProtectedRoute from "./ProtectedRoute";
import Projects from "./pages/Projects";
import Invoices from "./pages/Invoices";
import Signup from "./pages/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Clients /> },
       { path: "projects", element: <Projects /> },
    { path: "invoices", element: <Invoices /> },
      // Add more protected pages here
    ],
  },
  { path: "/login", element: <Login /> },
   { path: "/signup", element: <Signup /> },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);




