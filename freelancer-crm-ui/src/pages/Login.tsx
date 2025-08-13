// src/pages/Login.tsx
import { useState } from "react";
import { login } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  //username → Stores the value typed in the username input.
  // password → Stores the password input value.
  // err → Stores an error message if login fails.
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // e.preventDefault() → Prevents the browser from doing a full page reload on
    //  form submission.
    try {
      await login(username, password);
      nav("/");
    } catch (e) {
      setErr("Invalid credentials");
    }
  }
//login() → Sends credentials to Django’s JWT endpoint, stores tokens in localStorage.
// On success → Navigate to home page.
// On error → Set err state to "Invalid credentials" so it shows in the UI.
  return (
    <form onSubmit={onSubmit}>
      {/* <form onSubmit={onSubmit}> → Calls onSubmit when you press Enter or
       click the button.*/}
      <h2>Sign in</h2>
      {err && <p>{err}</p>}
      {/*Conditionally renders an error <p> if err is not empty. */}
      <input placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
