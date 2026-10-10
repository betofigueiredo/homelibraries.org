import { useEffect } from "react";

/** Sets the browser tab's title; `undefined` keeps the plain site name. */
export function useTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · Home Libraries` : "Home Libraries";
  }, [title]);
}
