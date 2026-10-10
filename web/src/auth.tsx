import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { api, type User } from "./api";
import { PageLoading } from "./components/Loading";

const ME = ["me"] as const;

/** The signed-in user: `undefined` while loading, `null` when signed out. */
export function useMe() {
  const { data, isPending } = useQuery({ queryKey: ME, queryFn: api.me, staleTime: 60_000 });
  return { me: isPending ? undefined : (data ?? null), isPending };
}

/** Updates the cached user after a sign-in, a settings change or a sign-out. */
export function useSetMe() {
  const client = useQueryClient();
  return (user: User | null) => client.setQueryData(ME, user);
}

/**
 * Shows `children` only to a signed-in user who has picked a username.
 * Others go to sign in, or to pick their username first.
 */
export function RequireUser({ children }: { children: (user: User & { username: string }) => ReactNode }) {
  const { me } = useMe();
  const location = useLocation();
  if (me === undefined) return <PageLoading />;
  if (me === null) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  if (!me.username) return <Navigate to="/onboarding" replace />;
  return children(me as User & { username: string });
}
