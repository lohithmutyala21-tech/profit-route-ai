import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PayRoute AI — Profit-Aware Logistics Decision Engine" },
      { name: "description", content: "Optimize delivery routes based on profit, risk, and efficiency — not just distance." },
      { name: "author", content: "PayRoute AI" },
      { property: "og:title", content: "PayRoute AI — Profit-Aware Logistics Decision Engine" },
      { property: "og:description", content: "Optimize delivery routes based on profit, risk, and efficiency — not just distance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "PayRoute AI — Profit-Aware Logistics Decision Engine" },
      { name: "twitter:description", content: "Optimize delivery routes based on profit, risk, and efficiency — not just distance." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/rSp4QNGYBpO903hIHFcU2hDlPp62/social-images/social-1778057206580-payrouteaisocial.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/rSp4QNGYBpO903hIHFcU2hDlPp62/social-images/social-1778057206580-payrouteaisocial.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </AuthProvider>
  );
}
