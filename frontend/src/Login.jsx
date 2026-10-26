import { useState } from "react";

export default function Login({ onLogin, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await onLogin(email, password);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={submit}>
        <p className="eyebrow">METER MANAGEMENT</p>
        <h1>Log in</h1>
        <p className="subheading">Use your meter portal account to continue.</p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {(message || error) && <p className="message error">{message || error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
