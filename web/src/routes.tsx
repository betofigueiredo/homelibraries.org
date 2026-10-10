import { useEffect } from "react";
import { createBrowserRouter, Outlet, ScrollRestoration, useLocation } from "react-router";

import { Footer, Header } from "./components/Header";
import { ImportPage } from "./pages/Import";
import { Landing } from "./pages/Landing";
import { LibraryPage } from "./pages/Library";
import { NotFound } from "./pages/NotFound";
import { Onboarding } from "./pages/Onboarding";
import { SettingsPage } from "./pages/Settings";
import { SignIn } from "./pages/SignIn";
import { Verify } from "./pages/Verify";

/** Header and footer around every page except the landing, which has its own header links. */
function Layout() {
  return (
    <div className="app">
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Moves focus to the new page's heading, so screen readers hear the navigation. */
function FocusOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

function Root() {
  return (
    <>
      <ScrollRestoration />
      <FocusOnNavigate />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Landing /> },
      {
        element: <Layout />,
        children: [
          { path: "/signin", element: <SignIn /> },
          { path: "/signin/verify", element: <Verify /> },
          { path: "/onboarding", element: <Onboarding /> },
          { path: "/import", element: <ImportPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/:username", element: <LibraryPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
