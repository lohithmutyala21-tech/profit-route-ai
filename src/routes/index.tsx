import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/HeroBanner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "PayRoute AI — Profit-Aware Logistics Decision Engine" },
      { name: "description", content: "Transform logistics from distance-based routing to profit-aware decision intelligence." },
    ],
  }),
});

function Home() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <HeroBanner />

      <section className="grid md:grid-cols-3 gap-4 mt-10">
        {[
          { t: "Profit-Aware Routing", d: "Optimize delivery sequences by expected profit, not just distance." },
          { t: "Adaptive Learning", d: "Weights evolve continuously from simulated delivery outcomes." },
          { t: "Multi-Tenant", d: "Each company has its own isolated workspace, users, and data." },
        ].map((f) => (
          <div key={f.t} className="metric-card p-6">
            <h3 className="font-semibold text-lg mb-2">{f.t}</h3>
            <p className="text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        {user ? (
          <Link to="/dashboard"><Button size="lg">Go to Dashboard</Button></Link>
        ) : (
          <>
            <Link to="/register"><Button size="lg">Get Started</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Sign In</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
