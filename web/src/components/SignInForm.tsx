import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "../api";
import { MailIcon } from "./Icons";

/**
 * Asks for an email and sends a sign-in link. The same link signs up new readers,
 * so there is one form for both.
 */
export function SignInForm({ id = "email" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const send = useMutation({ mutationFn: api.requestLink });

  if (send.isSuccess) {
    return (
      <div className="signin-sent fade-up" role="status">
        <span className="signin-sent-icon">
          <MailIcon />
        </span>
        <div>
          <strong>Check your email</strong>
          <p className="muted">
            We sent a sign-in link to <span className="mono">{email}</span>. It works once, for 15 minutes.
          </p>
        </div>
        <button type="button" className="link-button" onClick={() => send.reset()}>
          Use another email
        </button>
      </div>
    );
  }

  return (
    <form
      className="signin-form"
      onSubmit={(e) => {
        e.preventDefault();
        send.mutate(email);
      }}
    >
      <div className="signin-row">
        <label htmlFor={id} className="sr-only">
          Email
        </label>
        <input
          id={id}
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={send.isPending}>
          {send.isPending ? "Sending…" : "Get a sign-in link"}
        </button>
      </div>
      {send.isError ? (
        <p className="form-error" role="alert">
          {send.error.message}
        </p>
      ) : (
        <p className="hint">No password. Free. Your email is never shown.</p>
      )}
    </form>
  );
}
