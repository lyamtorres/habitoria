import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export function AuthPanel() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Authentication failed.");
    }
  };

  return (
    <section className="panel">
      <h2 className="panel-title">{mode === "login" ? "Login" : "Create account"}</h2>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <button className="btn-ghost" type="button" onClick={() => setMode("login")}>
          Login
        </button>
        <button className="btn-ghost" type="button" onClick={() => setMode("register")}>
          Register
        </button>
      </div>

      <form className="new-habit-form" onSubmit={onSubmit}>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="field submit-field">
          <button className="btn-primary" type="submit">
            {mode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </form>

      {err && <div className="alert error">{err}</div>}
    </section>
  );
}