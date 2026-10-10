import { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { api } from "../api";
import { useSetMe } from "../auth";
import { PageLoading } from "../components/Loading";

/**
 * Opened from the email. Sends the token with a POST, so mail scanners that only
 * follow links can't use up the single-use token.
 */
export function Verify() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const setMe = useSetMe();
  const verify = useMutation({
    mutationFn: api.verify,
    onSuccess: (user) => {
      setMe(user);
      navigate(user.username ? `/${user.username}` : "/onboarding", { replace: true });
    },
  });

  // The token works once; React's dev double-mount must not send it twice.
  const sent = useRef(false);
  const { mutate } = verify;
  useEffect(() => {
    if (sent.current || !token) return;
    sent.current = true;
    mutate(token);
  }, [token, mutate]);

  if (token && !verify.isError) return <PageLoading />;

  return (
    <div className="center-page">
      <h1 className="page-title" tabIndex={-1}>
        This link <span className="em">didn't work</span>
      </h1>
      <p className="muted" style={{ maxWidth: 460 }}>
        Sign-in links work once and expire after 15 minutes. Ask for a new one.
      </p>
      <Link to="/signin" className="btn btn-primary">
        Get a new link
      </Link>
    </div>
  );
}
