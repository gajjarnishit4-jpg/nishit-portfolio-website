"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function AdminLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setLoading(false);

    if (!response.ok) {
      setError("That login did not work.");
      return;
    }
    window.location.reload();
  }

  return (
    <main className="admin-login">
      <form className="admin-login__box" onSubmit={handleSubmit}>
        <span>OPEN LIMITS ADMIN</span>
        <h1>Lead command center</h1>
        <small>
          Sign in with the Open Limits admin account to review leads, heatmaps,
          and chatbot conversations.
        </small>
        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="username"
          defaultValue="admin@theopenlimits.com"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        {error ? <p>{error}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Enter admin"}
        </button>
        <Link className="admin-login__home" href="/">
          Back to website
        </Link>
      </form>
    </main>
  );
}
