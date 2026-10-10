import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";

import { api, type User } from "../api";
import { RequireUser, useSetMe } from "../auth";
import { ProfileForm } from "../components/ProfileForm";

export function SettingsPage() {
  return <RequireUser>{(me) => <Settings me={me} />}</RequireUser>;
}

function Settings({ me }: { me: User & { username: string } }) {
  const navigate = useNavigate();
  const setMe = useSetMe();
  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      setMe(null);
      navigate("/", { replace: true });
    },
  });

  return (
    <div className="container narrower page">
      <h1 className="page-title" tabIndex={-1}>
        Settings
      </h1>

      {/* Remount after a save, so the form starts from what was stored. */}
      <ProfileForm
        key={`${me.username}/${me.display_name}`}
        user={me}
        submitLabel="Save changes"
        onSaved={() => {}}
        warnOnRename
      />

      <section className="card card-pad">
        <h2 className="card-title">Your books</h2>
        <div className="card-row">
          <p className="muted">Import again whenever you finish a book. Your library will match the new file.</p>
          <Link to="/import" className="btn btn-secondary btn-sm">
            Import again
          </Link>
        </div>
      </section>

      <section className="card card-pad">
        <h2 className="card-title">Sign-in</h2>
        <div className="card-row">
          <div>
            <div>{me.email}</div>
            <div className="hint">We send sign-in links here. Never shown on your library.</div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            Sign out
          </button>
        </div>
        {logout.isError && (
          <p className="form-error" role="alert">
            {logout.error.message}
          </p>
        )}
      </section>

      <p className="hint">
        Your public library: <Link to={`/${me.username}`}>
          {window.location.host}/{me.username}
        </Link>
      </p>
    </div>
  );
}
