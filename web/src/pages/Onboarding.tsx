import { useState } from "react";
import { Navigate } from "react-router";

import { useMe } from "../auth";
import { PageLoading } from "../components/Loading";
import { ProfileForm } from "../components/ProfileForm";

/** First visit after signing up: pick the library's address. */
export function Onboarding() {
  const { me } = useMe();
  // Saving sets a username, which would send them to their (empty) library; go import instead.
  const [saved, setSaved] = useState(false);
  if (saved) return <Navigate to="/import" replace />;
  if (me === undefined) return <PageLoading />;
  if (me === null) return <Navigate to="/signin" replace />;
  if (me.username) return <Navigate to={`/${me.username}`} replace />;

  // Suggest an address from the email: "ada.lovelace@…" → "ada-lovelace".
  const suggested = me.email
    .split("@")[0]!
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  return (
    <div className="container narrower page">
      <div>
        <h1 className="page-title" tabIndex={-1}>
          Name your <span className="em">library</span>
        </h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Pick the address people and assistants will use. You can change it later.
        </p>
      </div>
      <ProfileForm
        user={me}
        suggestedUsername={suggested.length >= 3 ? suggested : ""}
        submitLabel="Continue"
        onSaved={() => setSaved(true)}
      />
    </div>
  );
}
