import { useEffect, useState } from "react";
import { getData } from "./api.js";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import "../styles.css";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getData("/auth/session")
      .then((result) => setAuthenticated(result.authenticated))
      .catch((err) => setError(err.message))
      .finally(() => setCheckingLogin(false));
  }, []);

  async function logIn(email, password) {
    const result = await getData("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setError("");
    setAuthenticated(result.authenticated);
  }

  async function logOut() {
    try {
      await getData("/auth/logout", { method: "POST" });
      setAuthenticated(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  if (checkingLogin) return <main className="login-page">Checking login...</main>;
  if (!authenticated) return <Login onLogin={logIn} error={error} />;

  return (
    <>
      {error && <p className="message error logout-error">{error}</p>}
      <Dashboard onLogout={logOut} />
    </>
  );
}
