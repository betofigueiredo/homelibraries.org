import { Navigate } from "react-router";

import { useMe } from "../auth";
import { SignInForm } from "../components/SignInForm";

export function SignIn() {
  const { me } = useMe();
  if (me?.username) return <Navigate to={`/${me.username}`} replace />;
  if (me) return <Navigate to="/onboarding" replace />;

  return (
    <div className="center-page">
      <h1 className="page-title" tabIndex={-1}>
        Sign in or <span className="em">start a library</span>
      </h1>
      <p className="muted" style={{ maxWidth: 460 }}>
        Enter your email and we'll send you a link. New here? The same link creates your library.
      </p>
      <SignInForm />
    </div>
  );
}
