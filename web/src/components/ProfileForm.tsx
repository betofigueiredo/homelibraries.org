import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { api, type User } from "../api";
import { useSetMe } from "../auth";

/** Same rule as the API: 3–30 lowercase letters, digits or dashes, no dash at either end. */
const USERNAME = /^[a-z0-9](?:[a-z0-9-]{1,28})[a-z0-9]$/;

/** Name and address of a library. Used to pick them at onboarding and to change them in settings. */
export function ProfileForm({
  user,
  submitLabel,
  onSaved,
  warnOnRename,
  suggestedUsername = "",
}: {
  user: User;
  /** Prefilled when the user has no username yet. */
  suggestedUsername?: string;
  submitLabel: string;
  onSaved: (user: User) => void;
  warnOnRename?: boolean;
}) {
  const setMe = useSetMe();
  const [name, setName] = useState(user.display_name ?? "");
  const [username, setUsername] = useState(user.username ?? suggestedUsername);
  const save = useMutation({
    mutationFn: api.updateMe,
    onSuccess: (saved) => {
      setMe(saved);
      onSaved(saved);
    },
  });

  const cleaned = username.trim().toLowerCase();
  const usernameOk = USERNAME.test(cleaned);
  const unchanged = cleaned === (user.username ?? "") && name.trim() === (user.display_name ?? "");

  return (
    <form
      className="card card-pad"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({ username: cleaned, display_name: name });
      }}
    >
      <div>
        <h2 className="card-title">Your library</h2>
        <p className="hint">How your library appears to people and assistants.</p>
      </div>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          className="input"
          type="text"
          maxLength={80}
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <span className="hint">
          Shown as “{name.trim() || username || "Your name"}'s library”. Leave it empty to use your address.
        </span>
      </div>

      <div className="field">
        <label htmlFor="username">Address</label>
        <div className="input-group">
          <span className="prefix" aria-hidden="true">
            {window.location.host}/
          </span>
          <input
            id="username"
            type="text"
            required
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={username !== "" && !usernameOk}
            aria-describedby="username-hint"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </div>
        <span id="username-hint" className="hint">
          Lowercase letters, numbers and dashes.
          {warnOnRename && " Changing it also changes your MCP address, so assistants using the old one stop working."}
        </span>
      </div>

      {save.isError && (
        <p className="form-error" role="alert">
          {save.error.message}
        </p>
      )}

      <div className="card-actions">
        <button type="submit" className="btn btn-primary" disabled={!usernameOk || unchanged || save.isPending}>
          {save.isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
